import type { Ref } from 'vue'
import { useEventListener } from '@vueuse/core'

// Share of the remaining distance covered per frame, lower glides longer
const EASING = 0.18

/**
 * Mouse wheel scrolls a horizontal row sideways while the cursor is over it.
 * Only vertical wheel turns are converted (trackpad sideways swipes already scroll natively),
 * and only while the row can still move that way, so at either end the page scrolls as usual.
 * Wheel ticks move a target and the row eases towards it frame by frame, so fast turns add up
 * into one smooth glide instead of restarting a smooth scroll on every tick.
 * @param element the scrollable row (overflow-x auto)
 * @param options.requireShift only Shift+wheel scrolls the row, the plain wheel keeps scrolling
 * the page (for rows inside a long list)
 */
export function useHorizontalWheel(
  element: Ref<HTMLElement | null>,
  options: { requireShift?: boolean } = {},
) {
  let target = 0
  let frame: number | null = null

  function animate() {
    const row = element.value
    if (!row) return (frame = null)
    const distance = target - row.scrollLeft
    // Close enough, land exactly and stop
    if (Math.abs(distance) < 1) {
      row.scrollLeft = target
      return (frame = null)
    }
    // At least 1px per frame, scrollLeft is rounded so smaller steps would never land
    row.scrollLeft += Math.sign(distance) * Math.max(Math.abs(distance) * EASING, 1)
    frame = requestAnimationFrame(animate)
  }

  useEventListener(
    element,
    'wheel',
    (event: WheelEvent) => {
      const row = element.value
      if (!row || (options.requireShift && !event.shiftKey)) return
      // Some browsers turn Shift+wheel into deltaX themselves, take whichever axis has the turn
      const delta = event.shiftKey && !event.deltaY ? event.deltaX : event.deltaY
      // Sideways swipes without Shift (trackpads) scroll natively
      if (!event.shiftKey && Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

      // Idle, start from where the row really is (it may have been dragged or swiped)
      if (frame === null) target = row.scrollLeft
      const maxScroll = row.scrollWidth - row.clientWidth
      const canMove = delta < 0 ? target > 0 : target < maxScroll - 1
      if (!delta || !canMove) return

      event.preventDefault()
      target = Math.min(Math.max(target + delta, 0), maxScroll)
      if (frame === null) frame = requestAnimationFrame(animate)
    },
    // Not passive, the page must not scroll while the row takes the wheel
    { passive: false },
  )

  // Drops a running glide, e.g. when the row is grabbed for dragging
  function stop() {
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
  }

  return { stop }
}
