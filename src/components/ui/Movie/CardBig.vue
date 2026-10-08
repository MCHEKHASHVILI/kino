<script lang="ts">
import { shallowRef } from 'vue'

/**
 * Open state shared by every big card, so there is only ever one open card and switching is
 * direct: a card replaces the open one in the same moment (in inline growth they shrink and grow
 * together, so the row barely moves).
 * Opening waits until the mouse rests on a card (hover intent): a fast sweep, back and forth too,
 * opens nothing, so nothing moves under the mouse. Leaving into empty space closes after a moment
 */
const OPEN_DELAY = 150
const CLOSE_DELAY = 120

const activeCard = shallowRef<symbol | null>(null)
let openTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined

// Restarted on every enter, so only the card the mouse settles on opens
function openSoon(card: symbol, beforeOpen: () => void) {
  clearTimeout(closeTimer)
  clearTimeout(openTimer)
  if (activeCard.value === card) return
  openTimer = setTimeout(() => {
    beforeOpen()
    activeCard.value = card
  }, OPEN_DELAY)
}

// Mouse left the cards (row edges, outside): drop a pending open, close the open card soon
function closeSoon() {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
  closeTimer = setTimeout(() => (activeCard.value = null), CLOSE_DELAY)
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef, type ComponentPublicInstance } from 'vue'
import { useEventListener, useMouse } from '@vueuse/core'
import type { MovieWithSynopsis } from '@types'
import AppLink from '@/components/shared/AppLink.vue'

// Bookable movie (home Now playing), poster card linking to the movie page.
// Now playing comes with the synopsis, shown on hover, press and keyboard focus
const props = withDefaults(
  defineProps<{
    movie: MovieWithSynopsis
    /**
     * overlay: fixed slot, the panel grows over the neighbours (from the center, or from an edge),
     * the row never moves. inline: the card itself widens left to right and pushes the row
     */
    growth?: 'overlay' | 'inline'
  }>(),
  { growth: 'overlay' },
)

// Open panel width in px, the w-111.75 of the open state in cards.css, keep the two in sync.
// Measured against the slot (panel + its padding), the padding cancels out of the half growth
const OPEN_WIDTH = 447

/**
 * The panel grows from the center over both neighbours. Where one side of the visible row has no
 * room for half the growth, it is anchored to the other side instead, so nothing gets cut off
 */
const anchor = ref<'center' | 'right' | 'left'>('center')

const root = useTemplateRef<ComponentPublicInstance>('root')
const card = computed(() => root.value?.$el as HTMLElement | undefined)

// Decided as the card opens, against the visible part of the row.
// Overlay only, inline always grows rightwards with the card
function pickAnchor() {
  if (props.growth === 'inline' || !card.value) return
  const row = card.value.parentElement
  if (!row) return
  const slot = card.value.getBoundingClientRect()
  const bounds = row.getBoundingClientRect()
  const half = (OPEN_WIDTH - slot.width) / 2
  if (slot.left - bounds.left < half) anchor.value = 'right'
  else if (bounds.right - slot.right < half) anchor.value = 'left'
  else anchor.value = 'center'
}

/**
 * Hover as a class instead of :hover. When the row scrolls under a still mouse (Shift+wheel,
 * trackpad, drag) the browser fires no pointerenter / pointerleave and keeps :hover stale,
 * so on every scroll the card checks what is under the last known pointer position itself.
 * elementFromPoint also sees an open neighbour's panel lying on top of this card
 */
const id = Symbol('card-big')
const isOpen = computed(() => activeCard.value === id)

function enter() {
  openSoon(id, pickAnchor)
}

// Moving onto another card does nothing here, that card's open replaces this one
function leave(event: PointerEvent) {
  const next =
    event.relatedTarget instanceof Element ? event.relatedTarget.closest('.card-big') : null
  if (!next) closeSoon()
}

onBeforeUnmount(() => {
  if (activeCard.value === id) activeCard.value = null
})

const pointer = useMouse({ type: 'client', touch: false })

// Only the card under the pointer reacts (or the open one, when no card is under it)
useEventListener(
  () => card.value?.parentElement,
  'scroll',
  () => {
    if (!card.value) return
    const under = document.elementFromPoint(pointer.x.value, pointer.y.value)?.closest('.card-big')
    if (under === card.value) enter()
    else if (!under && isOpen.value) closeSoon()
  },
  { passive: true },
)
</script>

<template>
  <!-- Styles in assets/styles/components/cards.css. Overlay: fixed slot, the panel grows.
       Inline: the card itself grows -->
  <AppLink
    ref="root"
    :to="{ name: 'movie', params: { slug: movie.slug } }"
    class="card-big"
    :class="[
      { 'is-open': isOpen },
      growth === 'inline'
        ? 'grows-inline'
        : { 'grows-right': anchor === 'right', 'grows-left': anchor === 'left' },
    ]"
    @pointerenter="enter"
    @pointerleave="leave"
    @focusin="pickAnchor"
  >
    <div class="panel">
      <div class="poster">
        <img :src="movie.posterUrl" :alt="movie.title" loading="lazy" />
      </div>
      <div class="content">
        <span class="title" v-text="movie.title" />
        <span
          class="details"
          v-text="
            `${movie.ageRating.code} · ${movie.runtimeMinutes} min · from ₾${movie.fromPrice}`
          "
        />
        <span class="badge-hero badge-red" v-text="movie.ageRating.code" />
      </div>
      <p class="description" v-text="movie.synopsis" />
      <div class="footer">
        <span class="price" v-text="'from ₾ ' + movie.fromPrice" />
        <!-- Looks like a button, the whole card is the link: an <a> can't sit inside another <a> -->
        <span class="action btn-primary" v-text="'buy tickets'" />
      </div>
    </div>
  </AppLink>
</template>
