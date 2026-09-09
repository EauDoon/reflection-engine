import { exact, requireThat } from './core.mjs';
import { selectedRun, runDigest } from './run.mjs';

export function reviewPlan(run) {
  const chosen = selectedRun(run);
  return {
    version: 1, run_digest: runDigest(chosen),
    decisions: chosen.report.answers.map(answer => ({ question_id: answer.id, decision: 'pending', note: '', checked_sources: [], counterevidence_checked: false }))
  };
}

export function validateReview(run, review) {
  const chosen = selectedRun(run);
  exact(review, ['version', 'run_digest', 'decisions'], 'Human review');
  requireThat(review.version === 1 && typeof review.run_digest === 'string' && review.run_digest === runDigest(chosen), 'Review does not match the selected run; create and complete a new review');
  const answers = new Map(chosen.report.answers.map(answer => [answer.id, answer]));
  requireThat(Array.isArray(review.decisions) && review.decisions.length === answers.size && new Set(review.decisions.map(item => item?.question_id)).size === answers.size, 'Review must cover every answer exactly once');
  const sourceIds = new Set(chosen.corpus.sources.map(source => source.id));
  for (const item of review.decisions) {
    exact(item, ['question_id', 'decision', 'note', 'checked_sources', 'counterevidence_checked'], 'Review decision');
    requireThat(answers.has(item.question_id) && ['pending', 'accept', 'revise', 'reject', 'defer'].includes(item.decision), 'Invalid review decision');
    requireThat(typeof item.note === 'string' && item.note.length <= 2000 && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(item.note) && (item.decision === 'pending' || item.note.trim()), 'Completed decisions require a bounded explanatory note');
    requireThat(Array.isArray(item.checked_sources) && item.checked_sources.length <= sourceIds.size && new Set(item.checked_sources).size === item.checked_sources.length && item.checked_sources.every(id => sourceIds.has(id)), 'Review checks must name unique selected source IDs');
    requireThat(typeof item.counterevidence_checked === 'boolean', 'Counterevidence check must be boolean');
    if (item.decision === 'accept') requireThat(item.counterevidence_checked && answers.get(item.question_id).evidence.every(id => item.checked_sources.includes(id)), 'Accepting an answer requires checking its cited sources and counterevidence');
  }
  return review;
}
