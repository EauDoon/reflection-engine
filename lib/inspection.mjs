import { validateCorpus } from './core.mjs';
import { configure, DEFAULT_CONFIG, exclusionReasons } from './config.mjs';
import { buildPacket } from './packet.mjs';
import { selectedRun, runDigest } from './run.mjs';

export function evidenceMap(run) {
  const chosen = selectedRun(run);
  const sources = chosen.corpus.sources.map(({ text, ...source }) => ({
    ...source, question_ids: chosen.report.answers.filter(answer => answer.evidence.includes(source.id)).map(answer => answer.id)
  }));
  return {
    version: 1, run_digest: runDigest(chosen), sources,
    uncited_source_ids: sources.filter(source => !source.question_ids.length).map(source => source.id),
    answers: chosen.report.answers.map(answer => {
      const cited = sources.filter(source => answer.evidence.includes(source.id));
      const episodeCount = new Set(cited.map(source => source.episode)).size;
      return { question_id: answer.id, status: answer.status, source_ids: [...answer.evidence], episode_count: episodeCount,
        warnings: !cited.length ? ['no-cited-sources'] : episodeCount < 2 ? ['single-cited-episode'] : [] };
    })
  };
}

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
