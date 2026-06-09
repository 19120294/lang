import { MoodLevel } from './mood.model';

export interface JournalEntry {
  id: string;
  date: string;       // YYYY-MM-DD
  title?: string;
  content: string;
  mood?: MoodLevel;
  createdAt: number;
  updatedAt: number;
}
