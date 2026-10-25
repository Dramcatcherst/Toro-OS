// Offline release preparation only. Run from the repository root with Node 24:
// node --max-old-space-size=768 scripts/alegra-writer/build-manual-host.mjs \
//   --output=.superpowers/sdd/2026-10-01-toro-alegra-writer-v3/releases/<new-name>
// Optional --archives=<existing scratch pg-driver-8.23.1/archives>.
// With no .git, --unpublished-source-base=<40-char canonical base> produces a
// non-executable review candidate: sourceCommit=null, publicationRequired=true.
// Never installs, downloads, reads secrets, connects, enables or deploys a host.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash, X509Certificate } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readdirSync, mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { resolve, relative, join, dirname, isAbsolute, sep } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('NODE_24_REQUIRED');
if (realpathSync(process.cwd()) !== realpathSync(root)) throw new Error('REPOSITORY_ROOT_CWD_REQUIRED');
const scratch = join(root, '.superpowers/sdd/2026-10-01-toro-alegra-writer-v3');
const args = Object.create(null);
for (const argument of process.argv.slice(2)) {
  const match = /^--(output|archives|unpublished-source-base)=(.+)$/.exec(argument);
  if (!match || args[match[1]]) throw new Error('BUILD_ARGUMENT_INVALID');
  args[match[1]] = match[2];
}
const nonce = new Date().toISOString().replace(/[^0-9TZ]/g, '') + '-' + process.pid;
const output = resolve(args.output ?? join(scratch, 'releases/manual-host-' + nonce));
const archives = resolve(args.archives ?? join(scratch, 'pg-driver-8.23.1/archives'));
function within(base, file, allowSelf = false) {
  const rel = relative(base, file);
  if (isAbsolute(rel) || rel === '..' || rel.startsWith('..' + sep) || !allowSelf && !rel) throw new Error('PATH_OUTSIDE_EXPECTED_DIRECTORY');
  return rel;
}
function noLinksFrom(base, file) {
  const parts = within(base, file, true).split(sep).filter(Boolean);
  let current = base;
  if (lstatSync(current).isSymbolicLink()) throw new Error('SYMLINK_FORBIDDEN');
  for (const part of parts) {
    current = join(current, part);
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error('SYMLINK_FORBIDDEN');
  }
}
within(scratch, output); within(scratch, archives);
noLinksFrom(root, output); noLinksFrom(root, archives);
if (existsSync(output) && (!lstatSync(output).isDirectory() || readdirSync(output).length)) throw new Error('OUTPUT_MUST_BE_NEW_OR_EMPTY');
if (!lstatSync(archives).isDirectory()) throw new Error('EXISTING_ARCHIVES_REQUIRED');

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const sourcePaths = [
  'src/features/finance/alegra-writer-host.ts',
  'src/features/finance/alegra-writer-host.test.ts',
  'src/features/finance/alegra-writer-host.integration.test.ts',
  'src/features/finance/alegra-writer-synthetic.fixture.ts',
  'src/features/finance/alegra-canonical-reader.ts',
  'src/features/finance/alegra-canonical-reader.test.ts',
  'src/features/finance/alegra-writer-control-plane.ts',
  'src/features/finance/alegra-writer-control-plane.test.ts',
  'src/features/finance/alegra-manual-caller.test.ts',
  'src/features/finance/alegra-native-purchase-transport.test.ts',
  'src/features/finance/alegra-writer-contract.test.ts',
  'src/features/finance/alegra-writer-dedupe.test.ts',
  'src/features/finance/alegra-writer-executor.test.ts',
  'src/features/finance/alegra-native-http.ts',
  'src/features/finance/alegra-native-purchase-transport.ts',
  'src/features/finance/alegra-writer-contract.ts',
  'src/features/finance/alegra-writer-dedupe.ts',
  'src/features/finance/alegra-writer-executor.ts',
  'src/features/control-plane/worker-runtime.ts',
  'src/lib/server/public-demo.ts',
  'src/lib/supabase/alegra-writer-session.ts',
  'src/lib/supabase/alegra-writer-session.test.ts',
  'src/lib/supabase/alegra-writer-postgres.ts',
  'src/lib/supabase/alegra-writer-postgres.test.ts',
  'src/lib/supabase/alegra-writer-rpc.ts',
  'src/lib/supabase/alegra-writer-rpc.test.ts',
  'src/lib/supabase/fixtures/supabase-prod-ca-2021.crt',
  'scripts/alegra-writer/manual-host.mjs',
  'scripts/alegra-writer/pg-runtime.lock.json',
  'scripts/alegra-writer/build-manual-host.mjs',
  'scripts/alegra-writer/bundle-boundary.mjs',
  'tests/alegra-manual-host-package.test.mjs',
  'supabase/drafts/20261024_toro_alegra_writer_reader_stage_v1.sql',
  'supabase/drafts/20261024_toro_alegra_writer_reader_revoke_v1.sql',
  'supabase/drafts/20261024_toro_alegra_writer_reader_readback_v1.sql',
  'supabase/drafts/20261024_toro_alegra_writer_reader_session_checks_v1.sql',
  '.gitattributes', 'package.json', 'package-lock.json', 'tsconfig.json',
];
function sourceSnapshot() {
  return sourcePaths.map(path => {
    const absolute = join(root, path);
    noLinksFrom(root, absolute);
    if (!lstatSync(absolute).isFile()) throw new Error('SOURCE_INPUT_NOT_A_FILE');
    const bytes = readFileSync(absolute);
    return { path, bytes: bytes.length, sha256: sha256(bytes) };
  });
}
const sourceInputs = sourceSnapshot();
const publicationRequired = args['unpublished-source-base'] !== undefined;
const sourceBase = publicationRequired ? args['unpublished-source-base'] : null;
if (publicationRequired && (!/^[a-f0-9]{40}$/.test(sourceBase) || existsSync(join(root, '.git')))) throw new Error('UNPUBLISHED_SOURCE_BASE_INVALID');
const sourceCommit = publicationRequired ? null : execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
if (!publicationRequired && !/^[a-f0-9]{40}$/.test(sourceCommit)) throw new Error('SOURCE_COMMIT_INVALID');
if (!publicationRequired) execFileSync('git', ['diff', '--check'], { cwd: root, stdio: 'pipe' });
const worktreeDirty = publicationRequired || !!execFileSync('git', ['status', '--porcelain', '--untracked-files=normal'], { cwd: root, encoding: 'utf8' }).trim();
if (!publicationRequired && worktreeDirty) throw new Error('DIRTY_SOURCE_REQUIRES_COMMIT');
const lockPath = join(root, 'scripts/alegra-writer/pg-runtime.lock.json');
const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
if (lock.root?.name !== 'pg' || lock.root.version !== '8.23.1' || lock.registry !== 'https://registry.npmjs.org' ||
    !Array.isArray(lock.packages) || lock.packages.length !== lock.packageCount || lock.packageCount < 1 || lock.packageCount > 24) throw new Error('PINNED_PG_LOCK_REQUIRED');
// Resolve from the installed package's physical location, including pnpm's
// linked dependency layout. Never install or modify shared dependencies here.
const require = createRequire(realpathSync(join(root, 'node_modules/vitest/package.json')));
const semver = require('semver');
const versions = new Map();
const checkedArchives = [];
for (const pkg of lock.packages) {
  if (!/^(?:@[a-z0-9_.-]+\/)?[a-z0-9_.-]+$/.test(pkg.name) || !semver.valid(pkg.version) || versions.has(pkg.name) ||
      !/^[a-f0-9]{64}$/.test(pkg.sha256) || typeof pkg.integrity !== 'string' || !pkg.integrity.startsWith('sha512-') ||
      new URL(pkg.tarball).origin !== 'https://registry.npmjs.org') throw new Error('PINNED_PACKAGE_INVALID');
  versions.set(pkg.name, pkg.version);
  const file = join(archives, pkg.name.replace('/', '-') + '-' + pkg.version + '.tgz');
  noLinksFrom(archives, file);
  if (!lstatSync(file).isFile()) throw new Error('ARCHIVE_NOT_A_FILE');
  const bytes = readFileSync(file);
  if (bytes.length !== pkg.bytes || sha256(bytes) !== pkg.sha256 || 'sha512-' + createHash('sha512').update(bytes).digest('base64') !== pkg.integrity) throw new Error('ARCHIVE_INTEGRITY_MISMATCH');
  checkedArchives.push({ pkg, bytes });
}
if (checkedArchives.reduce((sum, item) => sum + item.bytes.length, 0) !== lock.totalTarballBytes) throw new Error('LOCK_TOTAL_SIZE_MISMATCH');
for (const { pkg } of checkedArchives) {
  for (const [name, range] of Object.entries({ ...pkg.dependencies, ...pkg.optionalDependencies })) {
    if (!versions.has(name) || !semver.satisfies(versions.get(name), range)) throw new Error('DEPENDENCY_CLOSURE_INCOMPLETE');
  }
}
const ca = readFileSync(join(root, 'src/lib/supabase/fixtures/supabase-prod-ca-2021.crt'));
if (sha256(ca) !== '700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7' || !new X509Certificate(ca).ca) throw new Error('PINNED_PUBLIC_CA_REQUIRED');

// Small, bounded tar extractor: only regular files/directories, no links,
// special files, pax/GNU extensions, path traversal, overwrite or npm scripts.
const decoder = new TextDecoder('utf-8', { fatal: true });
const field = (header, start, length) => decoder.decode(header.subarray(start, start + length)).split('\0', 1)[0];
function octal(header, start, length) {
  const raw = field(header, start, length).trim();
  if (!/^[0-7]+$/.test(raw)) throw new Error('TAR_NUMERIC_FIELD_INVALID');
  const value = Number.parseInt(raw, 8);
  if (!Number.isSafeInteger(value)) throw new Error('TAR_NUMBER_OUT_OF_RANGE');
  return value;
}
function unpack(bytes, destination) {
  const tar = gunzipSync(bytes, { maxOutputLength: 8 * 1024 * 1024 });
  const seen = new Set();
  for (let offset = 0; offset < tar.length;) {
    if (offset + 512 > tar.length) throw new Error('TAR_TRUNCATED');
    const header = tar.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) {
      if (!tar.subarray(offset).every(byte => byte === 0)) throw new Error('TAR_TRAILING_DATA');
      return;
    }
    if (!field(header, 257, 6).startsWith('ustar')) throw new Error('TAR_FORMAT_UNSUPPORTED');
    let sum = 0;
    for (let index = 0; index < 512; index++) sum += index >= 148 && index < 156 ? 32 : header[index];
    if (sum !== octal(header, 148, 8)) throw new Error('TAR_HEADER_CHECKSUM_MISMATCH');
    const type = header[156], prefix = field(header, 345, 155);
    const name = (prefix ? prefix + '/' : '') + field(header, 0, 100);
    if (![0, 48, 53].includes(type) || field(header, 157, 100)) throw new Error('TAR_LINK_OR_SPECIAL_ENTRY_FORBIDDEN');
    const size = octal(header, 124, 12), directory = type === 53;
    const clean = name.replace(/\/$/, '');
    const parts = clean.split('/');
    if (parts[0] !== 'package' || parts.some(part => !part || part === '.' || part === '..' || /[\\:\x00-\x1f]/.test(part)) ||
        seen.has(clean.toLowerCase())) throw new Error('TAR_PATH_INVALID_OR_DUPLICATED');
    seen.add(clean.toLowerCase());
    const target = resolve(destination, ...parts.slice(1));
    within(destination, target, directory && parts.length === 1);
    if (offset + 512 + size > tar.length || size > 8 * 1024 * 1024 || directory && size !== 0) throw new Error('TAR_ENTRY_SIZE_INVALID');
    if (directory) mkdirSync(target, { recursive: true, mode: 0o700 });
    else {
      mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
      writeFileSync(target, tar.subarray(offset + 512, offset + 512 + size), { flag: 'wx', mode: 0o600 });
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  throw new Error('TAR_TERMINATOR_MISSING');
}

mkdirSync(output, { recursive: true, mode: 0o700 });
const vendor = join(output, 'vendor/node_modules');
mkdirSync(vendor, { recursive: true, mode: 0o700 });
for (const { pkg, bytes } of checkedArchives) {
  const destination = resolve(vendor, pkg.name);
  within(vendor, destination); mkdirSync(destination, { recursive: true, mode: 0o700 });
  unpack(bytes, destination);
  const metadata = JSON.parse(readFileSync(join(destination, 'package.json'), 'utf8'));
  if (metadata.name !== pkg.name || metadata.version !== pkg.version) throw new Error('EXTRACTED_PACKAGE_IDENTITY_MISMATCH');
  for (const [name, range] of Object.entries({ ...metadata.dependencies, ...metadata.optionalDependencies })) {
    if (!versions.has(name) || !semver.satisfies(versions.get(name), range)) throw new Error('EXTRACTED_DEPENDENCY_NOT_PINNED');
  }
}
const write = (name, bytes) => writeFileSync(join(output, name), bytes, { flag: 'wx', mode: 0o600 });
write('manual-host.mjs', readFileSync(join(root, 'scripts/alegra-writer/manual-host.mjs')));
write('supabase-prod-ca-2021.crt', ca);
write('pg-runtime.lock.json', readFileSync(lockPath));
const { inspectWriterBundle } = await import(new URL('./bundle-boundary.mjs', import.meta.url));
const { build } = await import(pathToFileURL(require.resolve('vite')).href);
let boundary;
const accountedSources = new Set(sourcePaths.map(path => resolve(root, path)));
const serverOnlyPath = join(root, 'node_modules/next/dist/compiled/server-only/empty.js');
await build({
  configFile: false, envFile: false, envDir: false, logLevel: 'error', root,
  resolve: { alias: { '@': join(root, 'src'), 'server-only': serverOnlyPath } },
  ssr: { external: ['next/server'] },
  build: {
    ssr: join(root, 'src/features/finance/alegra-writer-host.ts'), outDir: output, emptyOutDir: false,
    minify: false, sourcemap: false, target: 'node24',
    rolldownOptions: { external: id => id.startsWith('node:'), treeshake: { moduleSideEffects: id => id !== 'next/server' }, output: { entryFileNames: 'alegra-writer-runtime.mjs' } },
  },
  plugins: [{ name: 'writer-unused-next-response', enforce: 'pre', resolveId(id, importer) {
    if (id === 'next/server' && importer?.replaceAll('\\', '/').endsWith('/src/lib/server/public-demo.ts')) return { id, external: true, moduleSideEffects: false };
  } }, { name: 'manual-host-release-boundary', generateBundle(_options, bundle) {
    const entries = Object.values(bundle);
    if (entries.some(item => item.type !== 'chunk')) throw new Error('UNACCOUNTED_RUNTIME_ASSET');
    boundary = inspectWriterBundle(entries);
    if (boundary.chunks[0].exports.length !== 1 || boundary.chunks[0].exports[0] !== 'createAlegraManualHost') throw new Error('UNEXPECTED_RUNTIME_EXPORTS');
    for (const id of Object.keys(entries[0].modules)) {
      const plain = id.split('?', 1)[0];
      const absolute = resolve(root, plain), local = relative(root, absolute).split(sep).join('/');
      if (local.startsWith('src/') && !accountedSources.has(absolute)) throw new Error('UNACCOUNTED_LOCAL_SOURCE: ' + plain);
    }
  } }],
});
// Refuse a release if another lane changed an input or HEAD during preparation.
if (JSON.stringify(sourceSnapshot()) !== JSON.stringify(sourceInputs) ||
    (!publicationRequired && execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim() !== sourceCommit)) throw new Error('SOURCE_CHANGED_DURING_BUILD');
if (!publicationRequired) execFileSync('git', ['diff', '--check'], { cwd: root, stdio: 'pipe' });
const files = [];
function inventory(directory) {
  for (const name of readdirSync(directory).sort()) {
    const absolute = join(directory, name), stat = lstatSync(absolute);
    if (stat.isSymbolicLink()) throw new Error('RELEASE_SYMLINK_FORBIDDEN');
    if (stat.isDirectory()) inventory(absolute);
    else if (stat.isFile()) {
      const bytes = readFileSync(absolute);
      files.push({ path: relative(output, absolute).split(sep).join('/'), bytes: bytes.length, sha256: sha256(bytes) });
    } else throw new Error('RELEASE_SPECIAL_FILE_FORBIDDEN');
  }
}
inventory(output);
const manifest = {
  kind: 'TORO_ALEGRA_MANUAL_HOST_RELEASE_V1', nodeMajor: 24, nodeVersion: process.versions.node,
  sourceCommit, sourceBase, publicationRequired, worktreeDirty, sourceInputs, files, boundary,
  buildTools: { viteVersion: JSON.parse(readFileSync(require.resolve('vite/package.json'), 'utf8')).version,
    nextVersion: JSON.parse(readFileSync(join(root, 'node_modules/next/package.json'), 'utf8')).version,
    serverOnly: "Next's actual compiled react-server empty.js", serverOnlySha256: sha256(readFileSync(serverOnlyPath)) },
  vendor: { name: 'pg', version: '8.23.1', packageCount: lock.packageCount, totalTarballBytes: lock.totalTarballBytes,
    lockSha256: sha256(readFileSync(lockPath)), sha512SRIAndSha256Verified: true, lifecycleScriptsExecuted: false },
  installed: false, writerEnabled: false, runtimeCertified: false, secretsRead: false,
  databaseConnections: 0, sqlExecuted: false, providerCalls: 0, deployed: false,
};
write('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
console.log(JSON.stringify({ state: publicationRequired ? 'LOCAL_CANDIDATE_PREPARED_NOT_INSTALLED' : 'LOCAL_RELEASE_PREPARED_NOT_INSTALLED', directory: relative(root, output).split(sep).join('/'), sourceCommit,
  sourceBase, publicationRequired, worktreeDirty, files: files.length, manifestSha256: sha256(readFileSync(join(output, 'manifest.json'))), writerEnabled: false, providerCalls: 0, databaseConnections: 0 }));
