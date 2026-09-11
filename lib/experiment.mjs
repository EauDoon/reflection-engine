import { isDeepStrictEqual } from 'node:util';
import { exact, requireThat, validDate } from './core.mjs';
import { selectedRun, runDigest } from './run.mjs';
import { validateReview } from './review.mjs';
import { dataBlock } from './display.mjs';

export function planExperiment(run, review, questionId) {
  validateReview(run, review);
  const chosen = selectedRun(run);
  const answer = chosen.report.answers.find(item => item.id === questionId);
  requireThat(answer && review.decisions.find(item => item.question_id === questionId)?.decision === 'accept' && answer.status !== 'insufficient evidence', 'Choose one accepted substantive answer before planning an experiment');
  return {
    version: 1, run_digest: runDigest(chosen), question_id: questionId,
    acceptance_review: structuredClone(review),
    action: structuredClone(answer.action), started: null, observations: [],
    reviewed: null, decision: 'pending', reason: '', alternative: ''
  };
}

function boundedNote(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 2000 && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value);
}

export function validateExperiment(run, review, experiment) {
  validateReview(run, review);
  const chosen = selectedRun(run);
  exact(experiment, ['version', 'run_digest', 'question_id', 'acceptance_review', 'action', 'started', 'observations', 'reviewed', 'decision', 'reason', 'alternative'], 'Experiment');
  requireThat(experiment.version === 1 && experiment.run_digest === runDigest(chosen), 'Experiment does not match the selected run');
  validateReview(chosen, experiment.acceptance_review);
  requireThat(experiment.acceptance_review.decisions.find(item => item.question_id === experiment.question_id)?.decision === 'accept', 'Experiment requires a recorded acceptance review for its chosen answer');
  const answer = chosen.report.answers.find(item => item.id === experiment.question_id);
  requireThat(answer && answer.status !== 'insufficient evidence' && isDeepStrictEqual(experiment.action, answer.action), 'Experiment must preserve the chosen substantive answer and its action');
  requireThat(experiment.started === null || validDate(experiment.started), 'Experiment start must be a real date or null');
  requireThat(Array.isArray(experiment.observations) && experiment.observations.length <= 30, 'Experiment permits at most 30 observations');
  let previous = experiment.started, stopped = false;
  for (const observation of experiment.observations) {
    requireThat(!stopped, 'No observations may follow after a stop observation; keep later reflections in a separate record');
    exact(observation, ['date', 'kind', 'note'], 'Observation');
    requireThat(previous !== null && validDate(observation.date) && observation.date >= previous, 'Observations require a start date and chronological real dates');
    requireThat(['observation', 'stop'].includes(observation.kind) && boundedNote(observation.note), 'Observation requires a kind and bounded note');
    previous = observation.date;
    stopped = observation.kind === 'stop';
  }
  requireThat(['pending', 'continue', 'adjust', 'stop'].includes(experiment.decision), 'Invalid experiment decision');
  if (['continue', 'adjust'].includes(experiment.decision)) requireThat(review.decisions.find(item => item.question_id === experiment.question_id)?.decision === 'accept', 'Continue or adjust requires current acceptance of the chosen answer');
  if (experiment.decision === 'pending') {
    requireThat(experiment.reviewed === null && experiment.reason === '' && experiment.alternative === '', 'Pending experiments must leave outcome fields empty');
  } else {
    requireThat(validDate(experiment.reviewed) && (!previous || experiment.reviewed >= previous) && boundedNote(experiment.reason) && boundedNote(experiment.alternative), 'Outcome requires a real review date after observations, a reason and an alternative explanation');
    requireThat(experiment.decision === 'stop' || experiment.observations.length > 0, 'Continue or adjust requires at least one recorded observation');
  }
  if (experiment.observations.some(item => item.kind === 'stop')) requireThat(experiment.decision === 'stop', 'A stop observation requires a stop decision');
  return experiment;
}

export function appendObservation(run, review, experiment, entry) {
  validateExperiment(run, review, experiment);
  exact(entry, ['version', 'started', 'observation', 'outcome'], 'Observation entry');
  requireThat(entry.version === 1 && validDate(entry.started) && (experiment.started === null || experiment.started === entry.started), 'Entry requires an explicit start date matching any recorded start');
  requireThat(experiment.decision === 'pending', 'Only pending experiments accept further observations; preserve completed records');
  exact(entry.observation, ['date', 'kind', 'note'], 'Observation');
  requireThat(entry.observation.kind === 'stop' || review.decisions.find(item => item.question_id === experiment.question_id)?.decision === 'accept', 'Recording further trial observations requires current acceptance; a stop can still be recorded');
  const result = structuredClone(experiment);
  result.started = entry.started;
  result.observations.push(structuredClone(entry.observation));
  if (entry.outcome !== null) {
    exact(entry.outcome, ['reviewed', 'decision', 'reason', 'alternative'], 'Observation outcome');
    Object.assign(result, entry.outcome);
  }
  return validateExperiment(run, review, result);
}

export function experimentSummary(run, review, experiment) {
  validateExperiment(run, review, experiment);
  const current = review.decisions.find(item => item.question_id === experiment.question_id).decision;
  const status = experiment.decision === 'pending' ? 'No outcome recorded. A plan is not completion.' : `Declared decision: ${experiment.decision}.`;
  const warning = current === 'accept' ? '' : '\nThe current human review no longer accepts this answer. Reconsider the proposal; this record preserves your observations without endorsing continuation.\n';
  return '# Optional experiment review\n\n' + status + '\n\n' +
    'The acceptance review is a self-attested snapshot, not authenticated provenance or proof of when a decision was made. Dates, checks, observations and outcomes are self-reported. This tool does not run the action, schedule a reminder, infer causation, or measure personal growth. Keep competing explanations visible.\n' + warning + '\n' +
    dataBlock({ ...experiment, current_human_decision: current }) + '\nChanging the proposed action or source evidence requires a new run and review. Choosing stop does not require completing or starting a trial.\n';
}
