import { fsrs, createEmptyCard, Rating, State, type Card, type Grade } from 'ts-fsrs';
import { FsrsRating, FsrsState, type FsrsFrontMatter } from './types';

const f = fsrs({
  request_retention: 0.9,
  maximum_interval: 36500,
  enable_short_term: false,
});

const RATING_MAP: Record<FsrsRating, Grade> = {
  [FsrsRating.Again]: Rating.Again,
  [FsrsRating.Hard]: Rating.Hard,
  [FsrsRating.Good]: Rating.Good,
  [FsrsRating.Easy]: Rating.Easy,
};

/**
 * Compute the next FSRS state given current frontmatter values and a rating.
 * For a never-reviewed note, pass an empty object as current.
 */
export function computeNextState(
  current: Partial<FsrsFrontMatter>,
  rating: FsrsRating,
): FsrsFrontMatter {
  const now = new Date();
  const dueStr = current['fsrs-due'];
  const lastReviewStr = current['fsrs-last-review'];

  const card = createEmptyCard(now);
  if (dueStr) card.due = new Date(dueStr);
  card.state = current['fsrs-state'] !== undefined ? (current['fsrs-state'] as State) : State.New;
  card.stability = current['fsrs-stability'] ?? 0;
  card.difficulty = current['fsrs-difficulty'] ?? 0;
  card.elapsed_days = current['fsrs-elapsed-days'] ?? 0;
  card.scheduled_days = current['fsrs-scheduled-days'] ?? 0;
  card.reps = current['fsrs-reps'] ?? 0;
  card.lapses = current['fsrs-lapses'] ?? 0;
  card.learning_steps = current['fsrs-learning-steps'] ?? 0;
  if (lastReviewStr) card.last_review = new Date(lastReviewStr);

  const result = f.next(card, now, RATING_MAP[rating]);
  const c = result.card;

  return {
    'fsrs-due': c.due.toISOString(),
    'fsrs-state': c.state as number,
    'fsrs-stability': c.stability,
    'fsrs-difficulty': c.difficulty,
    'fsrs-last-review': c.last_review ? c.last_review.toISOString() : now.toISOString(),
    'fsrs-scheduled-days': c.scheduled_days,
    'fsrs-elapsed-days': c.elapsed_days,
    'fsrs-learning-steps': c.learning_steps,
    'fsrs-reps': c.reps,
    'fsrs-lapses': c.lapses,
  };
}
