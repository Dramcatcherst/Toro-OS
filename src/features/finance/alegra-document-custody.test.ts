import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { prepareAlegraDocumentCustody, materializeAlegraDocumentCustody, restoreAlegraDocumentCustody, type AlegraCustodyStorage, type AlegraPlannedAsset } from "./alegra-document-custody";

const scope = { tenantId: "fixture-tenant", orgId: "fixture-org", legalEntityKey: "fixture-entity", propertyId: "fixture-property" };
function fixturePdf() {
  const stream = "BT /F1 12 Tf 10 20 Td (Fixture only) Tj ET";
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Count 1 /Kids [3 0 R] >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 60] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>", `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"];
  let text = "%PDF-1.4\n";
  const offsets = [0];
  for (let n = 0; n < objects.length; n++) { offsets.push(Buffer.byteLength(text)); text += `${n + 1} 0 obj\n${objects[n]}\nendobj\n`; }
  const xref = Buffer.byteLength(text);
  text += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n => `${String(n).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(text);
}
const assets = [
  { role: "source_snapshot" as const, mime: "application/json", bytes: Buffer.from('{"id":"fixture-1"}'), sourceRef: "fixture:json" },
  { role: "native_pdf" as const, mime: "application/pdf", bytes: fixturePdf(), sourceRef: "fixture:pdf" },
  { role: "original_xml" as const, mime: "application/xml", bytes: Buffer.from('<?xml version="1.0"?><Factura><Numero>fixture-1</Numero></Factura>'), sourceRef: "fixture:xml" },
  { role: "original_photo" as const, mime: "image/png", bytes: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j1xkAAAAASUVORK5CYII=", "base64"), sourceRef: "fixture:photo" },
];
const preview = {
  ...assets[3], role: "derived_preview" as const, sourceRef: "fixture:preview",
  parentSha256: createHash("sha256").update(assets[2].bytes).digest("hex"),
};
const invalidProvenanceCases: [string, string, (entries: AlegraPlannedAsset[]) => void][] = [
  ["missing source references", "CUSTODY_SOURCE_REQUIRED", entries => { entries[0].sourceRefs = []; }],
  ["sparse source references", "CUSTODY_SOURCE_REQUIRED", entries => { entries[0].sourceRefs = new Array<string>(1); }],
  ["blank source reference", "CUSTODY_SOURCE_REQUIRED", entries => { entries[0].sourceRefs = [" "]; }],
  ["blank additional source reference", "CUSTODY_SOURCE_REQUIRED", entries => { entries[0].sourceRefs.push(" "); }],
  ["missing preview parent", "CUSTODY_DERIVATIVE_PARENT_REQUIRED", entries => { delete entries.at(-1)!.parentSha256; }],
  ["orphaned preview parent", "CUSTODY_PARENT_NOT_IN_PACKAGE", entries => { entries.at(-1)!.parentSha256 = "f".repeat(64); }],
];

async function storage(name: string): Promise<AlegraCustodyStorage> {
  const root = await mkdtemp(join(tmpdir(), `toro-custody-${name}-`));
  return {
    locationKey: root, mode: "simulation",
    async putImmutable(path, bytes) {
      const destination = join(root, path);
      await mkdir(join(destination, ".."), { recursive: true });
      try { await writeFile(destination, bytes, { flag: "wx" }); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; }
      return { ref: path, revision: "fixture-immutable" };
    },
    async read(ref) { return new Uint8Array(await readFile(join(root, ref))); },
  };
}

describe("Alegra original document custody", () => {
  it.each(invalidProvenanceCases)("rejects %s in a prepared package before storage I/O", async (_label, error, mutate) => {
    const plan = prepareAlegraDocumentCustody({ scope, documentKey: "fixture-document", assets: [...assets, preview] });
    mutate(plan.assets);
    const source = await storage("invalid-provenance");
    const read = vi.spyOn(source, "read");
    const write = vi.spyOn(source, "putImmutable");

    await expect(materializeAlegraDocumentCustody(plan, scope, source)).rejects.toThrow(error);
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it.each(invalidProvenanceCases)("rejects %s in a checksum-valid manifest before storage I/O", async (_label, error, mutate) => {
    const source = await storage("invalid-manifest-provenance");
    const captured = await materializeAlegraDocumentCustody(prepareAlegraDocumentCustody({
      scope, documentKey: "fixture-document", assets: [...assets, preview],
    }), scope, source);
    // Simulate a legacy manifest whose bytes are intact but whose lineage is incomplete.
    const persisted = JSON.parse(Buffer.from(await source.read(captured.manifestReceipt.storageRef)).toString());
    mutate(persisted.assets);
    const bytes = Buffer.from(JSON.stringify(persisted));
    const hash = createHash("sha256").update(bytes).digest("hex");
    const path = `${captured.scopeKey}/${captured.documentKey}/manifests/${hash}.json`;
    await source.putImmutable(path, bytes);
    captured.assets = persisted.assets;
    captured.manifestReceipt = { path, storageRef: path, sha256: hash, revision: "fixture-immutable" };
    const destination = await storage("invalid-manifest-restore");
    const sourceRead = vi.spyOn(source, "read");
    const sourceWrite = vi.spyOn(source, "putImmutable");
    const destinationRead = vi.spyOn(destination, "read");
    const destinationWrite = vi.spyOn(destination, "putImmutable");

    await expect(restoreAlegraDocumentCustody(captured, scope, source, destination)).rejects.toThrow(error);
    expect(sourceRead).not.toHaveBeenCalled();
    expect(sourceWrite).not.toHaveBeenCalled();
    expect(destinationRead).not.toHaveBeenCalled();
    expect(destinationWrite).not.toHaveBeenCalled();
  });

  it("preserves source references and preview lineage through an isolated restore", async () => {
    const source = await storage("valid-lineage");
    const captured = await materializeAlegraDocumentCustody(prepareAlegraDocumentCustody({
      scope, documentKey: "fixture-document", assets: [...assets, preview],
    }), scope, source);
    const destination = await storage("valid-lineage-restore");
    const restored = await restoreAlegraDocumentCustody(captured, scope, source, destination);

    expect(restored.state).toBe("RESTORE_TESTED");
    for (const original of [...assets, preview]) {
      const entry = restored.assets.find(asset => asset.role === original.role)!;
      expect(entry.sourceRefs).toEqual([original.sourceRef]);
      expect(Buffer.from(await destination.read(entry.storageRef))).toEqual(original.bytes);
    }
    expect(restored.assets.find(asset => asset.role === "derived_preview")!.parentSha256).toBe(preview.parentSha256);
  });

  it.each(["../another-tenant/private.json", "other-scope/document/original_xml/file.xml"])("rejects an unconfined storage reference before any read: %s", async (ref) => {
    const source = await storage("confinement");
    const captured = await materializeAlegraDocumentCustody(prepareAlegraDocumentCustody({ scope, documentKey: "fixture-document", assets }), scope, source);
    const read = vi.spyOn(source, "read");
    const destination = await storage("confined-restore");
    const write = vi.spyOn(destination, "putImmutable");
    captured.assets[0].storageRef = ref;
    await expect(restoreAlegraDocumentCustody(captured, scope, source, destination)).rejects.toThrow("CUSTODY_STORAGE_REFERENCE_INVALID");
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it("persists the manifest alongside the originals and refuses a missing manifest on restore", async () => {
    const source = await storage("manifest");
    const write = vi.spyOn(source, "putImmutable");
    const captured = await materializeAlegraDocumentCustody(prepareAlegraDocumentCustody({ scope, documentKey: "fixture-document", assets }), scope, source);
    expect(write.mock.calls.filter(([path]) => path.includes("/manifests/"))).toHaveLength(1);
    expect(captured).toHaveProperty("manifestReceipt");
    const originalRead = source.read.bind(source);
    source.read = async ref => { if (ref.includes("/manifests/")) throw new Error("fixture manifest missing"); return originalRead(ref); };
    const destination = await storage("manifest-restore");
    const copy = vi.spyOn(destination, "putImmutable");
    await expect(restoreAlegraDocumentCustody(captured, scope, source, destination)).rejects.toThrow("fixture manifest missing");
    expect(copy).not.toHaveBeenCalled();
  });
  it("custodies and restores every original byte using an isolated destination", async () => {
    const plan = prepareAlegraDocumentCustody({ scope, documentKey: "fixture-document", assets, attachmentLimitBytes: 2_000_000 });
    const source = await storage("source");
    const captured = await materializeAlegraDocumentCustody(plan, scope, source);
    const destination = await storage("restore");
    const restored = await restoreAlegraDocumentCustody(captured, scope, source, destination);
    expect(captured.state).toBe("INTEGRITY_VERIFIED");
    expect(restored.state).toBe("RESTORE_TESTED");
    expect(restored.mode).toBe("simulation");
    expect(restored.assets).toHaveLength(4);
    for (let n = 0; n < assets.length; n++) {
      const entry = restored.assets.find(a => a.role === assets[n].role)!;
      expect(Buffer.from(await destination.read(entry.storageRef))).toEqual(assets[n].bytes);
    }
  });

  it("merges multichannel occurrences without dropping distinct PDF/XML/photo assets", () => {
    const plan = prepareAlegraDocumentCustody({ scope, documentKey: "fixture-document", assets: [...assets, { ...assets[1], sourceRef: "whatsapp:fixture" }] });
    expect(plan.assets).toHaveLength(4);
    expect(plan.assets.find(a => a.role === "native_pdf")!.sourceRefs).toEqual(["fixture:pdf", "whatsapp:fixture"]);
  });

  it("creates an immutable new asset version when the original bytes change", () => {
    const old = prepareAlegraDocumentCustody({ scope, documentKey: "fixture-document", assets });
    const next = prepareAlegraDocumentCustody({ scope, documentKey: "fixture-document", assets: [{ ...assets[2], bytes: Buffer.from('<Factura><Numero>corrected</Numero></Factura>') }] });
    expect(next.documentKey).toBe(old.documentKey);
    expect(next.assets[0].path).not.toBe(old.assets.find(a => a.role === "original_xml")!.path);
  });

  it("does not promote a corrupted native readback to custody verified", async () => {
    const plan = prepareAlegraDocumentCustody({ scope, documentKey: "fixture-document", assets });
    const source = await storage("corrupt");
    source.read = async () => new Uint8Array([0]);
    await expect(materializeAlegraDocumentCustody(plan, scope, source)).rejects.toThrow("CUSTODY_INTEGRITY_MISMATCH");
  });

  it("rejects another legal entity before storing any asset", async () => {
    const plan = prepareAlegraDocumentCustody({ scope, documentKey: "fixture-document", assets });
    await expect(materializeAlegraDocumentCustody(plan, { ...scope, legalEntityKey: "other" }, await storage("wrong-scope"))).rejects.toThrow("CUSTODY_SCOPE_MISMATCH");
  });

  it("preserves originals even if an Alegra copy is over the configured account limit", () => {
    const plan = prepareAlegraDocumentCustody({ scope, documentKey: "fixture-document", assets, attachmentLimitBytes: 10 });
    expect(plan.assets).toHaveLength(4);
    expect(plan.assets.find(a => a.role === "native_pdf")!.attachmentState).toBe("ALEGRA_ATTACH_OVER_LIMIT");
    expect(plan.externalUpload).toBe(false);
  });

  it("does not treat unconfigured attachment access as upload support", () => {
    const plan = prepareAlegraDocumentCustody({ scope, documentKey: "fixture-document", assets });
    expect(plan.assets.every(a => a.attachmentState === "ALEGRA_ATTACHMENT_UNSUPPORTED")).toBe(true);
  });

  it("rejects unsafe document paths and snapshot secret fields", () => {
    expect(() => prepareAlegraDocumentCustody({ scope, documentKey: "../escape", assets })).toThrow("CUSTODY_DOCUMENT_KEY_INVALID");
    expect(() => prepareAlegraDocumentCustody({ scope, documentKey: "fixture-document", assets: [{ ...assets[0], bytes: Buffer.from('{"authorization":"fixture-redacted"}') }] })).toThrow("CUSTODY_SECRET_FIELD_REJECTED");
  });

  it("does not call a copy into the same location an isolated restore", async () => {
    const source = await storage("same");
    const captured = await materializeAlegraDocumentCustody(prepareAlegraDocumentCustody({ scope, documentKey: "fixture-document", assets }), scope, source);
    await expect(restoreAlegraDocumentCustody(captured, scope, source, source)).rejects.toThrow("CUSTODY_RESTORE_DESTINATION_NOT_ISOLATED");
  });

  it("rejects identical preview bytes linked to different originals instead of losing lineage", () => {
    const pdfParent = createHash("sha256").update(assets[1].bytes).digest("hex");
    const xmlParent = createHash("sha256").update(assets[2].bytes).digest("hex");
    const preview = {
      role: "derived_preview" as const,
      mime: "application/pdf",
      bytes: fixturePdf(),
      sourceRef: "fixture:preview-pdf",
      parentSha256: pdfParent,
    };
    expect(() => prepareAlegraDocumentCustody({
      scope, documentKey: "fixture-document",
      assets: [...assets, preview, { ...preview,
        parentSha256: xmlParent, sourceRef: "fixture:preview-xml" }],
    })).toThrow("CUSTODY_DERIVATIVE_PARENT_CONFLICT");
  });

  it("deduplicates the same preview from the same original without losing provenance", () => {
    const pdfParent = createHash("sha256").update(assets[1].bytes).digest("hex");
    const preview = {
      role: "derived_preview" as const,
      mime: "application/pdf", bytes: fixturePdf(),
      sourceRef: "fixture:preview-a", parentSha256: pdfParent,
    };
    const result = prepareAlegraDocumentCustody({
      scope, documentKey: "fixture-document",
      assets: [...assets, preview, { ...preview, sourceRef: "fixture:preview-b" }],
    });
    const previews = result.assets.filter(a => a.role === "derived_preview");
    expect(previews).toHaveLength(1);
    expect(previews[0].parentSha256).toBe(pdfParent);
    expect(previews[0].sourceRefs).toEqual(["fixture:preview-a", "fixture:preview-b"]);
  });

});

describe("Finance custody adapter binding regressions", () => {
  it("keeps the original isolated destination across source awaits", async () => {
    const source = await storage("binding-source"), destination = await storage("binding-destination");

    const manifest = await materializeAlegraDocumentCustody(prepareAlegraDocumentCustody({ scope, documentKey: "fixture-binding", assets }), scope, source);
    const sourceRead = source.read.bind(source);
    source.read = async ref => { destination.locationKey = source.locationKey; destination.read = sourceRead; destination.putImmutable = source.putImmutable.bind(source); return sourceRead(ref); };
    await expect(restoreAlegraDocumentCustody(manifest, scope, source, destination)).rejects.toThrow("CUSTODY_STORAGE_BINDING_CHANGED");
    expect(Object.isFrozen(destination)).toBe(false);
  });
  it.each([{ locationKey: "" }, { locationKey: " " }, { mode: "anything" }, { read: undefined }, { putImmutable: undefined }])("rejects malformed initial adapter %j before any I/O", async patch => {
    const adapter = await storage("bad-binding"); const read = vi.spyOn(adapter, "read"), write = vi.spyOn(adapter, "putImmutable");
    Object.assign(adapter, patch);
    await expect(materializeAlegraDocumentCustody(prepareAlegraDocumentCustody({ scope, documentKey: "fixture-binding", assets }), scope, adapter)).rejects.toThrow("CUSTODY_STORAGE_BINDING_INVALID");
    expect(read).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled();
  });
});
it("aborts an async adapter that routes through its changed this.locationKey", async () => {
  const buckets = new Map<string, Map<string, Uint8Array>>([["source", new Map()], ["independent", new Map()]]);
  function routed(locationKey: string): AlegraCustodyStorage { return { locationKey, mode: "simulation",
    async putImmutable(path, bytes) { const bucket = buckets.get(this.locationKey)!; bucket.set(path, new Uint8Array(bytes)); return { ref: path, revision: "fixture-1" }; },
    async read(path) { return new Uint8Array(buckets.get(this.locationKey)!.get(path)!); } }; }
  const source = routed("source"), destination = routed("independent");
  const manifest = await materializeAlegraDocumentCustody(prepareAlegraDocumentCustody({ scope, documentKey: "fixture-binding", assets }), scope, source);
  const read = source.read;
  source.read = async function(path) { await Promise.resolve(); destination.locationKey = "source"; return read.call(this, path); };
  await expect(restoreAlegraDocumentCustody(manifest, scope, source, destination)).rejects.toThrow("CUSTODY_STORAGE_BINDING_CHANGED");
  expect(buckets.get("independent")!.size).toBe(0);
});
it("preserves frozen class adapters with private state and their original receiver", async () => {
  class PrivateStorage implements AlegraCustodyStorage {
    #objects = new Map<string, Uint8Array>();
    readonly mode = "simulation" as const;
    constructor(readonly locationKey: string) {}
    async putImmutable(path: string, bytes: Uint8Array) { this.#objects.set(path, new Uint8Array(bytes)); return { ref: path, revision: "fixture-private" }; }
    async read(path: string) { return new Uint8Array(this.#objects.get(path)!); }
  }
  const source = Object.freeze(new PrivateStorage("private-source")), destination = Object.freeze(new PrivateStorage("private-independent"));
  const manifest = await materializeAlegraDocumentCustody(prepareAlegraDocumentCustody({ scope, documentKey: "fixture-private", assets }), scope, source);
  const restored = await restoreAlegraDocumentCustody(manifest, scope, source, destination);
  expect(restored.state).toBe("RESTORE_TESTED"); expect(restored.locationKey).toBe("private-independent");
});
