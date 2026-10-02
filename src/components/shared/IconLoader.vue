<script setup lang="ts">
import {
    defineAsyncComponent,
    markRaw,
    shallowRef,
    watch,
    useTemplateRef,
    onMounted,
    onBeforeUnmount,
    type Component,
} from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────

export type IconName = string & {}

export interface IconRendererProps {
    name: IconName
    // Explicit CSS size e.g. '2rem'. Omit to size via Tailwind classes instead.
    width?: string
    height?: string
    strokeSize?: number | string
    strokeColor?: string
    fillColor?: string
    backgroundColor?: string
    class?: string
}

// ─── Props & emits ────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<IconRendererProps>(), {
    strokeSize: undefined,
    strokeColor: undefined, // undefined = preserve SVG's own stroke attribute
    fillColor: undefined, // undefined = preserve SVG's own fill attribute
    backgroundColor: 'transparent',
    class: '',
})

const emit = defineEmits<{
    (e: 'loaded'): void
    (e: 'error', err: unknown): void
}>()

// ─── Dynamic import ───────────────────────────────────────────────────────────

function loadIcon(name: string): Component {
    return markRaw(
        defineAsyncComponent({
            loader: () =>
                import(`@/assets/svg/${name}.svg?component`).then((mod) => {
                    emit('loaded')
                    return mod
                }),
            onError(err) {
                emit('error', err)
            },
        }),
    )
}

const AsyncIcon = shallowRef<Component>(loadIcon(props.name))

watch(
    () => props.name,
    (newName) => {
        AsyncIcon.value = loadIcon(newName)
    },
)

// ─── Per-instance ID counter ──────────────────────────────────────────────────

let _counter = 0
const instanceId = `ir-${++_counter}`
let idsScopedOnce = false

// ─── Core SVG patch ───────────────────────────────────────────────────────────

// Called every time a new <svg> node appears in the wrapper.
// 1. Strips width/height attributes (they beat CSS class specificity).
// 2. Sets CSS vars for stroke/fill so the stylesheet rule picks them up.
// 3. Scopes internal IDs once per icon name to avoid mask/clipPath collisions.

// Reads stroke-width from the first SVG element that explicitly declares it
// as a presentation attribute. Intentionally avoids getComputedStyle because
// the browser default (1px) is indistinguishable from an authored value there.
function readOriginalStrokeWidth(svg: SVGSVGElement): string | null {
    const candidates = [svg, ...Array.from(svg.querySelectorAll<SVGElement>('*'))]
    for (const el of candidates) {
        const attr = el.getAttribute('stroke-width')
        if (attr !== null && attr !== '') return attr
    }
    return null
}

function patchSvg(svg: SVGSVGElement, wrapper: HTMLElement) {
    // Synthesise viewBox from width/height before stripping, so the SVG keeps
    // its aspect ratio and does not collapse to the 300x150 browser default.
    if (!svg.getAttribute('viewBox')) {
        const w = svg.getAttribute('width')
        const h = svg.getAttribute('height')
        if (w && h) {
            svg.setAttribute('viewBox', `0 0 ${parseFloat(w)} ${parseFloat(h)}`)
        }
    }

    svg.removeAttribute('width')
    svg.removeAttribute('height')

    // Normalise fill and stroke to currentColor (or the explicit prop value)
    // so every icon is themeable via Tailwind text-{color} without per-icon props.
    //
    // Skips:
    //   - "none"  — structural transparency, not a color
    //   - elements inside <mask>, <defs>, <clipPath>, <linearGradient>,
    //     <radialGradient>, <pattern> — their fill/stroke values define geometry
    //     or mask opacity, not visual colors. Rewriting them breaks rendering.
    const targetFill = props.fillColor ?? 'currentColor'
    const targetStroke = props.strokeColor ?? 'currentColor'

    // Structural container tags whose children must never be colour-normalised
    const STRUCTURAL = new Set([
        'mask',
        'defs',
        'clipPath',
        'linearGradient',
        'radialGradient',
        'pattern',
    ])

    function isInsideStructural(el: Element): boolean {
        let node = el.parentElement
        // @ts-ignore
        while (node && node !== svg) {
            if (STRUCTURAL.has(node.tagName.toLowerCase())) return true
            node = node.parentElement
        }
        return false
    }

    const allElements = [svg, ...Array.from(svg.querySelectorAll<SVGElement>('*'))]

    allElements.forEach((el) => {
        // Never touch elements that are structural containers or inside them
        if (STRUCTURAL.has(el.tagName.toLowerCase())) return
        if (isInsideStructural(el)) return

        const fill = el.getAttribute('fill')
        if (fill !== null && fill !== 'none') {
            el.setAttribute('fill', targetFill)
        }

        const stroke = el.getAttribute('stroke')
        if (stroke !== null && stroke !== 'none') {
            el.setAttribute('stroke', targetStroke)
        }
    })

    // Detect and store the SVG's own stroke-width as the default CSS var.
    // This is set on the wrapper so Tailwind stroke-[N] utilities (which also
    // target the wrapper via cascade) can override it with higher specificity.
    const original = readOriginalStrokeWidth(svg)
    wrapper.style.setProperty('--ir-stroke-width-default', original ?? '1')

    // strokeSize prop wins over everything — set as explicit override var
    if (props.strokeSize != null) {
        wrapper.style.setProperty('--ir-stroke-width', String(props.strokeSize))
    } else {
        wrapper.style.removeProperty('--ir-stroke-width')
    }

    // ID scoping: only needed once per mounted SVG, not on every prop change
    if (!idsScopedOnce) {
        scopeIds(svg)
        idsScopedOnce = true
    }
}

// ─── Unique-ID scoping ────────────────────────────────────────────────────────

function scopeIds(svg: SVGSVGElement) {
    const elements = svg.querySelectorAll<SVGElement>('[id]')
    const idMap = new Map<string, string>()

    elements.forEach((el) => {
        const original = el.id
        const scoped = `${instanceId}-${original}`
        idMap.set(original, scoped)
        el.id = scoped
    })

    if (idMap.size === 0) return

    const urlAttrs = ['fill', 'stroke', 'filter', 'clip-path', 'mask']

    svg.querySelectorAll<SVGElement>('*').forEach((el) => {
        urlAttrs.forEach((attr) => {
            const val = el.getAttribute(attr)
            if (val && val.startsWith('url(#')) {
                const oldId = val.slice(5, -1)
                const newId = idMap.get(oldId)
                if (newId) el.setAttribute(attr, `url(#${newId})`)
            }
        })
            ;['href', 'xlink:href'].forEach((attr) => {
                const val = el.getAttribute(attr)
                if (val && val.startsWith('#')) {
                    const oldId = val.slice(1)
                    const newId = idMap.get(oldId)
                    if (newId) el.setAttribute(attr, `#${newId}`)
                }
            })
    })
}

// ─── MutationObserver ─────────────────────────────────────────────────────────

// Watches the wrapper node for any added <svg> element.
// This fires reliably whenever vite-svg-loader resolves and injects the SVG,
// regardless of async timing — no nextTick guesswork needed.

const svgWrapperRef = useTemplateRef<HTMLElement>('svgWrapper')
let observer: MutationObserver | null = null

function getSvg(root: HTMLElement): SVGSVGElement | null {
    return root.querySelector<SVGSVGElement>('svg')
}

function startObserver(root: HTMLElement) {
    observer?.disconnect()
    idsScopedOnce = false

    // Patch immediately if the SVG is already in the DOM (cached async chunk)
    const existing = getSvg(root)
    if (existing) patchSvg(existing, root)

    observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of Array.from(mutation.addedNodes)) {
                if (node instanceof SVGSVGElement) {
                    patchSvg(node, root)
                    return
                }
                // SVG may be wrapped in a Vue component root span
                if (node instanceof HTMLElement) {
                    const svg = node.querySelector<SVGSVGElement>('svg')
                    if (svg) {
                        patchSvg(svg, root)
                        return
                    }
                }
            }
        }
    })

    observer.observe(root, { childList: true, subtree: true })
}

onMounted(() => {
    if (svgWrapperRef.value) startObserver(svgWrapperRef.value)
})

onBeforeUnmount(() => {
    observer?.disconnect()
})

// Restart observer when the icon name changes so idsScopedOnce resets
watch(
    () => props.name,
    () => {
        if (svgWrapperRef.value) startObserver(svgWrapperRef.value)
    },
)

// Re-apply CSS vars immediately when color/size props change at runtime
watch(
    () => [props.strokeColor, props.fillColor, props.strokeSize] as const,
    () => {
        if (!svgWrapperRef.value) return
        const svg = getSvg(svgWrapperRef.value)
        if (svg) patchSvg(svg, svgWrapperRef.value)
    },
)
</script>

<template>
    <span ref="svgWrapper" :class="['icon-renderer', 'svg-wrapper', props.class]" :style="{
        ...(props.width ? { '--ir-explicit-width': props.width, width: props.width } : {}),
        ...(props.height ? { '--ir-explicit-height': props.height, height: props.height } : {}),
        ...(props.backgroundColor !== 'transparent'
            ? { backgroundColor: props.backgroundColor }
            : {}),
    }">
        <Suspense>
            <component :is="AsyncIcon" />
            <template #fallback>
                <svg viewBox="0 0 24 24" aria-hidden="true" />
            </template>
        </Suspense>
    </span>
</template>

<style scoped>
.icon-renderer {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: var(--ir-explicit-width, 1em);
    height: var(--ir-explicit-height, 1em);
}

.icon-renderer :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
    /* stroke and fill are controlled via inline styles set by patchSvg when
     the strokeColor/fillColor props are provided. When props are absent the
     SVG's own presentation attributes (fill="none", stroke="white") apply. */
    /*
    stroke-width is NOT an inherited CSS property — setting it on the wrapper
    span has no effect on the inner SVG. The correct way to drive stroke-width
    from outside is via the --ir-stroke-width CSS custom property, which IS
    inherited and cascades into this rule naturally.

    Priority chain (highest to lowest):
      1. strokeSize prop        -> wrapper inline style: --ir-stroke-width
      2. --ir-stroke-width set  -> any rule targeting .svg-wrapper
         via @utility or CSS       e.g.  .svg-wrapper { --ir-stroke-width: 2 }
      3. --ir-stroke-width-default -> sniffed from the SVG file on load
      4. 1                      -> hard fallback
  */
    stroke-width: var(--ir-stroke-width, var(--ir-stroke-width-default, 1));
    overflow: visible;
}
</style>