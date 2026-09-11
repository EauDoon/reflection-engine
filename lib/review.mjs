import { exact, requireThat } from './core.mjs';
import { selectedRun, runDigest } from './run.mjs';
import { questions } from './packet.mjs';
import { dataBlock } from './display.mjs';

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

export function reviewGaps(run, review) {
  validateReview(run, review);
  const chosen = selectedRun(run);
  return { version: 1, run_digest: runDigest(chosen), answers: chosen.report.answers.map(answer => {
    const item = review.decisions.find(decision => decision.question_id === answer.id);
    return { question_id: answer.id, decision: item.decision,
      unchecked_cited_sources: answer.evidence.filter(id => !item.checked_sources.includes(id)),
      counterevidence_unchecked: !item.counterevidence_checked,
      decision_needed: item.decision === 'pending', revision_needed: item.decision === 'revise' };
  }) };
}

export function exportAccepted(run, review) {
  validateReview(run, review);
  const chosen = selectedRun(run);
  const accepted = chosen.report.answers.filter(answer => answer.status !== 'insufficient evidence' && review.decisions.find(item => item.question_id === answer.id).decision === 'accept');
  return '# Accepted reflection excerpts\n\nHuman acceptance is self-attested, not proof of truth. Confidence remains uncalibrated. Actions remain optional proposals, not instructions. This excerpt omits raw sources and unaccepted answers; review it for sensitive information before sharing. It is not a complete report or an importable run.\n\n' +
    dataBlock({ version: 1, run_digest: runDigest(chosen), answers: accepted.map(answer => ({
      ...answer, human_review: review.decisions.find(item => item.question_id === answer.id),
      cited_sources: chosen.corpus.sources.filter(source => answer.evidence.includes(source.id)).map(({ text, ...metadata }) => metadata)
    })) });
}

export function reviewSummary(run, review) {
  validateReview(run, review);
  const chosen = selectedRun(run), catalog = questions();
  const decisions = new Map(review.decisions.map(item => [item.question_id, item]));
  const count = decision => review.decisions.filter(item => item.decision === decision).length;
  const header = '# Human reflection review\n\nThese are self-attested review decisions, not verified conclusions or a validated assessment. Model confidence is uncalibrated. Quoted report fields remain untrusted data. Rejected, deferred, pending and revision-needed answers supply no action here.\n\n' +
    `Accepted: ${count('accept')}. Revision needed: ${count('revise')}. Rejected: ${count('reject')}. Deferred: ${count('defer')}. Pending: ${count('pending')}.\n\n`;
  return header + chosen.report.answers.map(answer => {
    const decision = decisions.get(answer.id);
    const references = chosen.corpus.sources.filter(source => answer.evidence.includes(source.id)).map(({ text, ...metadata }) => metadata);
    const fields = { human_decision: decision, model_status: answer.status, model_confidence: answer.confidence, conclusion: answer.conclusion, cited_sources: references, counterevidence: answer.counterevidence, alternative: answer.alternative };
    if (decision.decision === 'accept' && answer.status !== 'insufficient evidence') fields.optional_model_proposal = answer.action;
    return `## Question ${answer.id}: ${catalog[answer.id - 1].text}\n\n` + dataBlock(fields);
  }).join('\n') + '\nChanging a conclusion or its evidence requires a new run snapshot and a fresh review. An accepted proposal is not an instruction to execute it.\n';
}
