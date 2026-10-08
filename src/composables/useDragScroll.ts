import { ref, type Ref } from 'vue'
import { useEventListener } from '@vueuse/core'

// Pointer travel (px) after which a press counts as a drag, not a click (same as the seat map)
const DRAG_THRESHOLD = 5

/**
 * Mouse drag scrolls a horizontal row sideways. Touch and trackpads already scroll natively,
 * so only the mouse is handled. A press that moves less than the threshold stays a click,
 * a real drag cancels the click that follows, so releasing over a link doesn't open it
 * @param element the scrollable row (overflow-x auto)
 * @param onDragStart called when a drag begins, e.g. to stop a running wheel glide
 */
export function useDragScroll(element: Ref<HTMLElement | null>, onDragStart?: () => void) {
  const isDragging = ref(false)
  let pointerId: number | null = null
  let startX = 0
  let startScroll = 0
  // Set when a drag ends, the click the browser fires right after it is swallowed
  let suppressClick = false

  useEventListener(element, 'pointerdown', (event: PointerEvent) => {
    const row = element.value
    if (!row || event.pointerType !== 'mouse' || event.button !== 0) return
    // Nothing to scroll, presses behave as usual
    if (row.scrollWidth <= row.clientWidth) return
    pointerId = event.pointerId
    startX = event.clientX
    startScroll = row.scrollLeft
  })

  useEventListener(element, 'pointermove', (event: PointerEvent) => {
    const row = element.value
    if (!row || event.pointerId !== pointerId) return
    const distance = event.clientX - startX
    if (!isDragging.value) {
      if (Math.abs(distance) < DRAG_THRESHOLD) return
      isDragging.value = true
      // Keeps receiving moves when the mouse leaves the row
      row.setPointerCapture(event.pointerId)
      onDragStart?.()
    }
    row.scrollLeft = startScroll - distance
  })

  function end(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    pointerId = null
    if (!isDragging.value) return
    isDragging.value = false
    suppressClick = true
    // The click comes in the same task as pointerup, if none does (released outside the row)
    // the flag is gone before the next real click
    setTimeout(() => (suppressClick = false))
  }

  useEventListener(element, 'pointerup', end)
  useEventListener(element, 'pointercancel', end)

  // Capture phase, so the card's own click handler never sees the drag's click
  useEventListener(
    element,
    'click',
    (event: MouseEvent) => {
      if (!suppressClick) return
      suppressClick = false
      event.preventDefault()
      event.stopPropagation()
    },
    { capture: true },
  )

  // Links and images are draggable by default, their ghost image would take over the drag
  useEventListener(element, 'dragstart', (event: DragEvent) => event.preventDefault())

  return { isDragging }
}
