/** Razmak ispod triggera (dugme / link u headeru) do padajućeg panela. */
export const HEADER_POPOVER_GAP_PX = 6;

export type PopoverDock = {
  top: number;
  right: number;
};

export function measureTriggerDock(el: HTMLElement): PopoverDock {
  const r = el.getBoundingClientRect();
  return {
    top: r.bottom + HEADER_POPOVER_GAP_PX,
    right: Math.max(12, document.documentElement.clientWidth - r.right),
  };
}
