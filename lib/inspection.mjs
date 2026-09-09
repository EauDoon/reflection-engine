import { validateCorpus } from './core.mjs';
import { configure, DEFAULT_CONFIG, exclusionReasons } from './config.mjs';
import { buildPacket } from './packet.mjs';

export function inspectCorpus(corpus) {
  validateCorpus(corpus);
  const sources = corpus.sources;
  const episodes = new Set(sources.map(source => source.episode));
  const groups = key => [...new Set(sources.map(source => source[key]))].sort().map(value => {
    const group = sources.filter(source => source[key] === value);
    return { value, sources: group.length, episodes: new Set(group.map(source => source.episode)).size };
  });
  const textGroups = new Map();
  for (const source of sources) {
    const ids = textGroups.get(source.text) ?? [];
    ids.push(source.id); textGroups.set(source.text, ids);
  }
  const repeated = [...textGroups.values()].filter(ids => ids.length > 1);
  const undated = sources.filter(source => source.date === null).map(source => source.id);
  const warnings = [];
  if (!sources.length) warnings.push('empty-corpus');
  else if (episodes.size < 2) warnings.push('single-episode');
  if (undated.length) warnings.push('undated-sources');
  if (repeated.length) warnings.push('repeated-text');
  if (sources.length && new Set(sources.map(source => source.kind)).size === 1) warnings.push('single-source-kind');
  return { version: 1, source_count: sources.length, episode_count: episodes.size, domains: groups('domain'), kinds: groups('kind'), undated_ids: undated, duplicate_text_groups: repeated, warnings };
}

export function previewSelection(corpus, config = DEFAULT_CONFIG) {
  const selected = configure(corpus, config);
  return {
    version: 1, question_ids: selected.ids, format: config.format,
    selected_ids: selected.corpus.sources.map(source => source.id),
    omitted: corpus.sources.map(source => ({ id: source.id, reasons: exclusionReasons(source, config) })).filter(source => source.reasons.length),
    packet_bytes: Buffer.byteLength(buildPacket(selected.corpus, selected.ids, config.format), 'utf8'),
    warnings: selected.corpus.sources.length ? [] : ['empty-selection']
  };
}
