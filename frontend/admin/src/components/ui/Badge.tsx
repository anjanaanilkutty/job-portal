import { ReactNode } from 'react';

type Tone = 'green' | 'gray' | 'blue' | 'amber' | 'red';

const tones: Record<Tone, string> = {
  green: 'bg-brand-100 text-brand-700',
  gray: 'bg-slate-100 text-slate-600',
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
};

export default function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
