// Build-time validation only; never included in the Writer SDK.
import { createRequire, isBuiltin } from 'node:module';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire(realpathSync(resolve('node_modules/vitest/package.json')));
const { parseSync } = await import(pathToFileURL(require.resolve('rolldown/utils')));

export function inspectWriterBundle(chunks) {
  const diagnostic = { chunkCount: chunks.length, chunks: [] };
  let invalid = chunks.length !== 1;
  for (const chunk of chunks) {
    const parsed = parseSync(chunk.fileName, chunk.code, { sourceType: 'module' });
    const emittedImports = [...new Set([
      ...parsed.module.staticImports.map(item => item.moduleRequest.value),
      ...parsed.module.staticExports.flatMap(item => item.entries.map(entry => entry.moduleRequest?.value).filter(Boolean)),
    ])];
    // Reject CommonJS/runtime loaders as well as all dynamic import syntax.
    let runtimeLoader = false;
    const nodes = [parsed.program];
    while (nodes.length) {
      const node = nodes.pop();
      if (!node || typeof node !== 'object') continue;
      if (node.type === 'Identifier' && /^(?:require|__require|createRequire)$/.test(node.name)) runtimeLoader = true;
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) nodes.push(...value);
        else if (value && typeof value === 'object') nodes.push(value);
      }
    }
    const builtin = id => id.startsWith('node:') && isBuiltin(id);
    // Rolldown retains this removed import in chunk.imports. Only this
    // observed stale entry is tolerated, and only when absent in parsed ESM.
    const staleNextMetadata = chunk.imports.includes('next/server') && !emittedImports.includes('next/server');
    const unexpectedMetadata = chunk.imports.filter(id => !builtin(id) && !(id === 'next/server' && staleNextMetadata));
    const result = { file: chunk.fileName, imports: chunk.imports, emittedImports,
      dynamicImports: parsed.module.dynamicImports.length, metadataDynamicImports: chunk.dynamicImports,
      exports: chunk.exports, staleNextMetadata, unexpectedMetadata, runtimeLoader, parseErrors: parsed.errors.length };
    diagnostic.chunks.push(result);
    invalid ||= parsed.errors.length > 0 || runtimeLoader || parsed.module.dynamicImports.length > 0 ||
      chunk.dynamicImports.length > 0 || unexpectedMetadata.length > 0 || emittedImports.some(id => !builtin(id)) ||
      emittedImports.some(id => !chunk.imports.includes(id));
  }
  if (invalid) throw new Error('Unaccounted runtime dependency: ' + JSON.stringify(diagnostic));
  return diagnostic;
}
