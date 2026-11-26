import { configure, DEFAULT_CONFIG } from './config.mjs';
import { buildPacket } from './packet.mjs';

// Output aggregate counts only. Source labels, question IDs and prose stay private.
export function packetStats(input, config = DEFAULT_CONFIG) {
  const selected = configure(input, config);
  const sources = selected.corpus.sources;
  const packet = buildPacket(selected.corpus, selected.ids, config.format);
  return {
    packet_bytes: Buffer.byteLength(packet, 'utf8'),
    selected_sources: sources.length,
    omitted_sources: input.sources.length - sources.length,
    episodes: new Set(sources.map(source => source.episode)).size,
    undated_sources: sources.filter(source => source.date === null).length,
    questions: selected.ids.length,
  };
}
