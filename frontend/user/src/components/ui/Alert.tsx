import { ReactNode } from 'react';

type Tone = 'error' | 'success' | 'info';

const tones: Record<Tone, string> = {
  error: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-brand-50 text-brand-700 border-brand-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function Alert({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]}`} role="alert">
      {children}
    </div>
  );
}
