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
 */
export function useHorizontalWheel(element: Ref<HTMLElement | null>) {
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
      if (!row || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

      // Idle, start from where the row really is (it may have been dragged or swiped)
      if (frame === null) target = row.scrollLeft
      const maxScroll = row.scrollWidth - row.clientWidth
      const canMove = event.deltaY < 0 ? target > 0 : target < maxScroll - 1
      if (!canMove) return

      event.preventDefault()
      target = Math.min(Math.max(target + event.deltaY, 0), maxScroll)
      if (frame === null) frame = requestAnimationFrame(animate)
    },
    // Not passive, the page must not scroll while the row takes the wheel
    { passive: false },
  )
}
