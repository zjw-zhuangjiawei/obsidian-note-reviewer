export enum FsrsState {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3,
}

export enum FsrsRating {
  Again = 1,
  Hard = 2,
  Good = 3,
  Easy = 4,
}

export interface FsrsFrontMatter {
  'fsrs-due': string;
  'fsrs-state': number;
  'fsrs-stability': number;
  'fsrs-difficulty': number;
  'fsrs-last-review': string;
  'fsrs-scheduled-days': number;
  'fsrs-elapsed-days': number;
  'fsrs-learning-steps': number;
  'fsrs-reps': number;
  'fsrs-lapses': number;
}
