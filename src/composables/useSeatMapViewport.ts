import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { useEventListener, useResizeObserver } from '@vueuse/core'
import Panzoom, { type PanzoomObject, type PanzoomOptions } from '@panzoom/panzoom'

// Pointer travel (px) after which a press counts as a drag, not a seat click
const DRAG_THRESHOLD = 5

/**
 * Google Maps like viewport for the seat map.
 * Canvas is rendered at full size (52px seats = scale 1), which is also the max zoom
 * (scaled down by referenceWidth when the viewport is narrower).
 * Min zoom fits the whole hall, halls that already fit at max zoom are static and centered.
 * Panning is limited so the hall can't leave the viewport.
 * @param viewport element that clips the map (panzoom parent)
 * @param canvas element holding the hall, positioned at viewport's top left
 * @param options.referenceWidth viewport width (px) the 52px seats were designed for,
 * narrower viewports scale the whole zoom range down so the hall keeps the same proportions
 * @param options.fitPaddingX space (px) kept free on each side when zoomed out to fit,
 * so overlay controls don't cover the seats
 */
export function useSeatMapViewport(
  viewport: Ref<HTMLElement | null>,
  canvas: Ref<HTMLElement | null>,
  options: { referenceWidth?: number; fitPaddingX?: number } = {},
) {
  const fits = ref(true)
  let panzoom: PanzoomObject | null = null
  let minScale = 1
  let maxScale = 1

  /**
   * Transform origin is canvas center, so its visual center sits at size / 2 + scale * offset.
   * Smaller than viewport → centered, bigger → edges can't be pulled inside the viewport.
   */
  function clampAxis(offset: number, scale: number, size: number, viewportSize: number) {
    const centered = (viewportSize - size) / (2 * scale)
    const limit = Math.max(0, (scale * size - viewportSize) / (2 * scale))
    return Math.min(Math.max(offset, centered - limit), centered + limit)
  }

  function clamp(x: number, y: number, scale: number) {
    if (!viewport.value || !canvas.value) return { x, y }
    return {
      x: clampAxis(x, scale, canvas.value.offsetWidth, viewport.value.clientWidth),
      y: clampAxis(y, scale, canvas.value.offsetHeight, viewport.value.clientHeight),
    }
  }

  // Every pan and zoom goes through here, so bounds are applied before the frame is painted
  const setTransform: PanzoomOptions['setTransform'] = (element, { x, y, scale }) => {
    const clamped = clamp(x, y, scale)
    element.style.transform = `scale(${scale}) translate(${clamped.x}px, ${clamped.y}px)`
    if (clamped.x === x && clamped.y === y) return
    // Sync panzoom's own position, animate undefined leaves a running zoom transition alone
    panzoom?.pan(clamped.x, clamped.y, { animate: undefined, force: true, silent: true })
  }

  // Recomputes zoom range whenever hall or viewport size changes
  function update(isInitial = false) {
    if (!panzoom || !viewport.value || !canvas.value) return
    const { clientWidth, clientHeight } = viewport.value
    const { offsetWidth, offsetHeight } = canvas.value
    if (!offsetWidth || !offsetHeight) return

    maxScale = options.referenceWidth ? Math.min(1, clientWidth / options.referenceWidth) : 1
    // Static when the whole hall fits at max zoom, controls are hidden then, so no padding needed
    fits.value = Math.min(clientWidth / offsetWidth, clientHeight / offsetHeight) >= maxScale
    const fitWidth = Math.max(clientWidth - 2 * (options.fitPaddingX ?? 0), 0)
    minScale = fits.value
      ? maxScale
      : Math.min(maxScale, fitWidth / offsetWidth, clientHeight / offsetHeight)
    panzoom.setOptions({
      minScale,
      maxScale,
      disablePan: fits.value,
      disableZoom: fits.value,
      cursor: fits.value ? 'default' : 'grab',
    })

    const scale = panzoom.getScale()
    if (isInitial || fits.value || scale < minScale || scale > maxScale) {
      panzoom.zoom(fits.value ? maxScale : minScale, { animate: false, force: true })
    }
    const { x, y } = panzoom.getPan()
    const clamped = clamp(x, y, panzoom.getScale())
    panzoom.pan(clamped.x, clamped.y, { animate: false, force: true })
  }

  function zoomIn() {
    panzoom?.zoomIn()
  }

  function zoomOut() {
    panzoom?.zoomOut()
  }

  // Whole hall in view, clamp centers it
  function fit() {
    panzoom?.zoom(minScale, { animate: true })
  }

  onMounted(() => {
    if (!canvas.value) return
    panzoom = Panzoom(canvas.value, {
      canvas: true,
      maxScale: 1,
      minScale,
      animate: false,
      cursor: 'grab',
      setTransform,
    })
    update(true)
  })

  onBeforeUnmount(() => {
    panzoom?.destroy()
    panzoom = null
  })

  useResizeObserver(viewport, () => update())
  useResizeObserver(canvas, () => update())

  useEventListener(
    viewport,
    'wheel',
    (event: WheelEvent) => {
      if (!fits.value) panzoom?.zoomWithWheel(event)
    },
    { passive: false },
  )

  // A drag that ends on a seat must not toggle it
  let pointerStart: { x: number; y: number } | null = null
  let isDrag = false
  useEventListener(
    viewport,
    'pointerdown',
    (event: PointerEvent) => {
      pointerStart = { x: event.clientX, y: event.clientY }
      isDrag = false
    },
    { capture: true },
  )
  useEventListener(window, 'pointermove', (event: PointerEvent) => {
    if (!pointerStart || isDrag) return
    const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
    isDrag = distance > DRAG_THRESHOLD
  })
  useEventListener(window, 'pointerup', () => (pointerStart = null))
  useEventListener(
    viewport,
    'click',
    (event: MouseEvent) => {
      if (!isDrag) return
      event.preventDefault()
      event.stopPropagation()
      isDrag = false
    },
    { capture: true },
  )

  // Keyboard: bring the focused seat into view
  useEventListener(viewport, 'focusin', (event: FocusEvent) => {
    if (!panzoom || fits.value || !viewport.value) return
    const target = event.target as HTMLElement
    const seat = (target.closest('label') ?? target).getBoundingClientRect()
    const bounds = viewport.value.getBoundingClientRect()
    const isVisible =
      seat.left >= bounds.left &&
      seat.right <= bounds.right &&
      seat.top >= bounds.top &&
      seat.bottom <= bounds.bottom
    if (isVisible) return

    const scale = panzoom.getScale()
    const { x, y } = panzoom.getPan()
    const dx = bounds.left + bounds.width / 2 - (seat.left + seat.width / 2)
    const dy = bounds.top + bounds.height / 2 - (seat.top + seat.height / 2)
    panzoom.pan(x + dx / scale, y + dy / scale, { animate: true })
  })

  // Browser scrolls overflow-hidden containers to focused elements, panzoom owns positioning here
  useEventListener(viewport, 'scroll', () => {
    if (!viewport.value) return
    viewport.value.scrollTop = 0
    viewport.value.scrollLeft = 0
  })

  return { fits, zoomIn, zoomOut, fit }
}
