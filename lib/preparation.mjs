import { exact, readBoundedFile, validateCorpus, requireThat } from './core.mjs';
import { isDeepStrictEqual } from 'node:util';

export function importText(path, metadata) {
  exact(metadata, ['id', 'episode', 'date', 'domain', 'kind'], 'Source metadata');
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(readBoundedFile(path)); }
  catch (error) {
    if (error instanceof TypeError) throw new Error('Text input must be valid UTF-8');
    throw error;
  }
  return validateCorpus({ version: 1, sources: [{ ...metadata, text }] });
}

export function mergeCorpora(corpora) {
  requireThat(Array.isArray(corpora) && corpora.length >= 2 && corpora.length <= 20, 'Merge requires 2 to 20 explicitly named corpora');
  const sources = new Map();
  for (const corpus of corpora) {
    validateCorpus(corpus);
    for (const source of corpus.sources) {
      requireThat(!sources.has(source.id) || isDeepStrictEqual(sources.get(source.id), source), 'Source ID conflict; resolve the competing versions before merging');
      sources.set(source.id, source);
      requireThat(sources.size <= 200, 'Merged corpus exceeds 200 sources');
    }
  }
  return validateCorpus({ version: 1, sources: [...sources.values()] });
}
