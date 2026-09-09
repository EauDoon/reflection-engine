import { exact, readBoundedFile, validateCorpus } from './core.mjs';

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
