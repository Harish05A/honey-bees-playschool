import { SchoolGroup } from '../types/schoolStudent';

export const SCHOOL_GROUP_META: Record<
  SchoolGroup,
  { label: string; ageHint: string; badgeClass: string; activeTabClass: string }
> = {
  Playgroup: {
    label: 'Playgroup',
    ageHint: '1.5 – 2.5 yrs',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200/90',
    activeTabClass: 'bg-amber-500 text-slate-950 border-amber-600/30',
  },
  'Pre-KG': {
    label: 'Pre-KG',
    ageHint: '2.5 – 3.5 yrs',
    badgeClass: 'bg-sky-50 text-sky-900 border-sky-200/90',
    activeTabClass: 'bg-sky-500 text-white border-sky-600/30',
  },
  LKG: {
    label: 'LKG',
    ageHint: '3.5 – 4.5 yrs',
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200/90',
    activeTabClass: 'bg-emerald-500 text-white border-emerald-600/30',
  },
  UKG: {
    label: 'UKG',
    ageHint: '4.5 – 5.5 yrs',
    badgeClass: 'bg-violet-50 text-violet-900 border-violet-200/90',
    activeTabClass: 'bg-violet-500 text-white border-violet-600/30',
  },
};

