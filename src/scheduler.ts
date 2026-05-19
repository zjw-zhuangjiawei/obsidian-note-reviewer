import { type TFile, type MetadataCache, Notice } from 'obsidian';
import { type FsrsFrontMatter, FsrsRating } from './types';
import { computeNextState } from './fsrs-engine';

type ProcessFrontMatterFn = (
  file: TFile,
  fn: (frontmatter: Record<string, unknown>) => void,
) => Promise<void>;

export class Scheduler {
  private metadataCache: MetadataCache;
  private processFrontMatter: ProcessFrontMatterFn;

  constructor(metadataCache: MetadataCache, processFrontMatter: ProcessFrontMatterFn) {
    this.metadataCache = metadataCache;
    this.processFrontMatter = processFrontMatter;
  }

  /**
   * Rate the active note and update only the YAML frontmatter.
   * If the note has no fsrs-* fields yet, they are injected on the first rating.
   * Body content is never touched.
   */
  async rateNote(file: TFile, rating: FsrsRating): Promise<void> {
    const cache = this.metadataCache.getFileCache(file);
    const currentFm = cache?.frontmatter ?? {};

    const current: Partial<FsrsFrontMatter> = {
      'fsrs-due': typeof currentFm['fsrs-due'] === 'string' ? currentFm['fsrs-due'] : undefined,
      'fsrs-state':
        typeof currentFm['fsrs-state'] === 'number' ? currentFm['fsrs-state'] : undefined,
      'fsrs-stability':
        typeof currentFm['fsrs-stability'] === 'number' ? currentFm['fsrs-stability'] : undefined,
      'fsrs-difficulty':
        typeof currentFm['fsrs-difficulty'] === 'number' ? currentFm['fsrs-difficulty'] : undefined,
      'fsrs-last-review':
        typeof currentFm['fsrs-last-review'] === 'string'
          ? currentFm['fsrs-last-review']
          : undefined,
      'fsrs-scheduled-days':
        typeof currentFm['fsrs-scheduled-days'] === 'number'
          ? currentFm['fsrs-scheduled-days']
          : undefined,
      'fsrs-elapsed-days':
        typeof currentFm['fsrs-elapsed-days'] === 'number'
          ? currentFm['fsrs-elapsed-days']
          : undefined,
      'fsrs-reps': typeof currentFm['fsrs-reps'] === 'number' ? currentFm['fsrs-reps'] : undefined,
      'fsrs-lapses':
        typeof currentFm['fsrs-lapses'] === 'number' ? currentFm['fsrs-lapses'] : undefined,
    };

    const nextState = computeNextState(current, rating);

    await this.processFrontMatter(file, (frontmatter) => {
      frontmatter['fsrs-due'] = nextState['fsrs-due'];
      frontmatter['fsrs-state'] = nextState['fsrs-state'];
      frontmatter['fsrs-stability'] = nextState['fsrs-stability'];
      frontmatter['fsrs-difficulty'] = nextState['fsrs-difficulty'];
      frontmatter['fsrs-last-review'] = nextState['fsrs-last-review'];
      frontmatter['fsrs-scheduled-days'] = nextState['fsrs-scheduled-days'];
      frontmatter['fsrs-elapsed-days'] = nextState['fsrs-elapsed-days'];
      frontmatter['fsrs-reps'] = nextState['fsrs-reps'];
      frontmatter['fsrs-lapses'] = nextState['fsrs-lapses'];
    });

    const ratingName = FsrsRating[rating];
    const dueDate = new Date(nextState['fsrs-due']).toLocaleDateString();
    new Notice(`Rated: ${ratingName} — Next review: ${dueDate}`);
  }
}
