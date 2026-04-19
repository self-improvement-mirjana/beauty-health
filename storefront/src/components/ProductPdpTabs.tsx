import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export type PdpTab = {
  id: string;
  label: string;
  content: ReactNode;
};

type Props = {
  tabs: PdpTab[];
};

export function ProductPdpTabs({ tabs }: Props) {
  const { hash } = useLocation();
  const reviewsIndex = tabs.findIndex((t) => t.id === 'reviews');

  const [active, setActive] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#recenzije' && reviewsIndex >= 0) {
      return reviewsIndex;
    }
    return 0;
  });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (hash === '#recenzije' && reviewsIndex >= 0) {
      setActive(reviewsIndex);
    }
  }, [hash, reviewsIndex]);

  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, tabs.length);
  }, [tabs.length]);

  function focusTab(nextIndex: number) {
    const n = tabs.length;
    if (n === 0) {
      return;
    }
    const wrapped = ((nextIndex % n) + n) % n;
    setActive(wrapped);
    queueMicrotask(() => tabRefs.current[wrapped]?.focus());
  }

  function onTabListKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (tabs.length === 0) {
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      focusTab(active + dir);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusTab(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusTab(tabs.length - 1);
    }
  }

  return (
    <div className="mt-10">
      <div
        role="tablist"
        aria-label="Sekcije proizvoda"
        onKeyDown={onTabListKeyDown}
        className="flex flex-wrap gap-1 border-b border-neutral-200 pb-px"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`pdp-tab-${tab.id}`}
            aria-selected={active === i}
            aria-controls={`pdp-panel-${tab.id}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={`rounded-t-md px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg ${
              active === i
                ? 'relative -mb-px border border-b-0 border-neutral-200 bg-white text-neutral-900'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <section
          key={tab.id}
          role="tabpanel"
          id={`pdp-panel-${tab.id}`}
          aria-labelledby={`pdp-tab-${tab.id}`}
          hidden={active !== i}
          tabIndex={0}
          className="rounded-b-md rounded-tr-md border border-t-0 border-neutral-200 bg-white p-4 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg md:p-6"
        >
          {tab.content}
        </section>
      ))}
    </div>
  );
}
