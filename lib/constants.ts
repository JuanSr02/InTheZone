import { Category } from './types';
import { Briefcase, BookOpen, Code2, BookMarked, Sparkles, MoreHorizontal } from 'lucide-react';

export const CATEGORY_COLORS: Record<Category, string> = {
  work: '#527cbfff', // Blue
  study: '#8066bcff', // Violet
  code: '#4ca7acff', // Emerald
  reading: '#c79540ff', // Amber
  meditation: '#b05aa0ff', // Pink
  other: '#6B7280', // Gray
};

export const CATEGORY_ICONS = {
  work: Briefcase,
  study: BookOpen,
  code: Code2,
  reading: BookMarked,
  meditation: Sparkles,
  other: MoreHorizontal,
};

export const CATEGORY_LABELS: Record<Category, string> = {
  work: 'Work',
  study: 'Study',
  code: 'Code',
  reading: 'Reading',
  meditation: 'Meditation',
  other: 'Other',
};
