import { Plugin } from 'obsidian';
import { Scheduler } from './scheduler';
import { FsrsRating } from './types';

export default class NoteReviewerPlugin extends Plugin {
  scheduler!: Scheduler;

  async onload(): Promise<void> {
    this.scheduler = new Scheduler(this.app.metadataCache, (file, fn) =>
      this.app.fileManager.processFrontMatter(file, fn),
    );

    this.addRatingCommand('rate-again', 'Rate: Again (1)', FsrsRating.Again);
    this.addRatingCommand('rate-hard', 'Rate: Hard (2)', FsrsRating.Hard);
    this.addRatingCommand('rate-good', 'Rate: Good (3)', FsrsRating.Good);
    this.addRatingCommand('rate-easy', 'Rate: Easy (4)', FsrsRating.Easy);
  }

  onunload(): void {
    // Cleanup handled by Obsidian's plugin lifecycle
  }

  private addRatingCommand(id: string, name: string, rating: FsrsRating): void {
    this.addCommand({
      id,
      name,
      callback: async () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) return;
        await this.scheduler.rateNote(activeFile, rating);
      },
    });
  }
}
