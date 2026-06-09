export type MoodLevel = 'great' | 'ok' | 'anxious' | 'angry' | 'bad';

export interface MoodEntry {
  id: string;
  date: string;        // ISO date string YYYY-MM-DD
  mood: MoodLevel;
  note?: string;
  createdAt: number;   // timestamp
}

export const MOOD_META: Record<MoodLevel, { label: string; icon: string; colorClass: string }> = {
  great:   { label: 'Tốt',    icon: 'laugh',  colorClass: 'bg-sage-100 text-sage-600' },
  ok:      { label: 'Ổn',     icon: 'smile',  colorClass: 'bg-sage-50 text-sage-500' },
  anxious: { label: 'Lo âu',  icon: 'meh',    colorClass: 'bg-stone-200 text-stone-600' },
  angry:   { label: 'Giận',   icon: 'angry',  colorClass: 'bg-sos-100 text-sos-500' },
  bad:     { label: 'Tệ',     icon: 'frown',  colorClass: 'bg-sos-200 text-sos-600' },
};
