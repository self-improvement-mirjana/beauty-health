import { useLayoutEffect, useState, type RefObject } from 'react';

import { measureTriggerDock, type PopoverDock } from '@/lib/headerPopoverDock';

/**
 * `position: fixed` ispod triggera u headeru (Sephora-style), uz ažuriranje na scroll/resize.
 */
export function usePopoverDock(open: boolean, triggerRef: RefObject<HTMLElement | null>): PopoverDock {
  const [dock, setDock] = useState<PopoverDock>({ top: 0, right: 12 });

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }
    function update() {
      const el = triggerRef.current;
      if (el) {
        setDock(measureTriggerDock(el));
      }
    }
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, triggerRef]);

  return dock;
}
