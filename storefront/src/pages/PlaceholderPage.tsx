import type { ReactNode } from 'react';

type Props = {
  title: string;
  children?: ReactNode;
};

export function PlaceholderPage({ title, children }: Props) {
  return (
    <article>
      <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
      <div className="mt-4 text-sm text-neutral-600">{children}</div>
    </article>
  );
}
