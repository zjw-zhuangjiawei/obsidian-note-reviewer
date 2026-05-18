import { Card, FSRS, Rating, State } from 'fsrs.js';
import { FsrsRating, FsrsState, type FsrsFrontMatter } from './types';

const fsrs = new FSRS();
fsrs.p.request_retention = 0.9;
fsrs.p.maximum_interval = 36500;

const RATING_MAP: Record<FsrsRating, Rating> = {
  [FsrsRating.Again]: Rating.Again,
  [FsrsRating.Hard]: Rating.Hard,
  [FsrsRating.Good]: Rating.Good,
  [FsrsRating.Easy]: Rating.Easy,
};

const STATE_MAP: Record<number, State> = {
  [FsrsState.New]: State.New,
  [FsrsState.Learning]: State.Learning,
  [FsrsState.Review]: State.Review,
  [FsrsState.Relearning]: State.Relearning,
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

  const card = new Card();
  card.due = dueStr ? new Date(dueStr) : now;
  card.state = STATE_MAP[current['fsrs-state'] ?? FsrsState.New] ?? State.New;
  card.stability = current['fsrs-stability'] ?? 0;
  card.difficulty = current['fsrs-difficulty'] ?? 0;
  card.elapsed_days = current['fsrs-elapsed-days'] ?? 0;
  card.scheduled_days = current['fsrs-scheduled-days'] ?? 0;
  card.reps = current['fsrs-reps'] ?? 0;
  card.lapses = current['fsrs-lapses'] ?? 0;
  card.last_review = lastReviewStr ? new Date(lastReviewStr) : now;

  const scheduling = fsrs.repeat(card, now);
  const result = scheduling[RATING_MAP[rating]]!;
  const c = result.card;

  return {
    'fsrs-due': c.due.toISOString(),
    'fsrs-state': c.state as number,
    'fsrs-stability': c.stability,
    'fsrs-difficulty': c.difficulty,
    'fsrs-last-review': c.last_review.toISOString(),
    'fsrs-scheduled-days': c.scheduled_days,
    'fsrs-elapsed-days': c.elapsed_days,
    'fsrs-reps': c.reps,
    'fsrs-lapses': c.lapses,
  };
}
