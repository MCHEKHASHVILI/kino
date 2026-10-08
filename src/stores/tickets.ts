import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Order } from '@types'
import { isApiError } from '@/api/ApiError'
import { useApiStore } from './api'
import { useModalStore } from './modals'

// Loading and refusal message are tracked per order
function refundKey(order: Order) {
  return `refund.${order.reference}`
}

// My tickets sub tabs, selected by ?group= query param
export const TICKET_GROUPS = ['upcoming', 'past'] as const
export type TicketGroup = (typeof TICKET_GROUPS)[number]

// Profile page's my tickets tab, every paid order of the signed in user
export const useTicketsStore = defineStore('tickets', () => {
  const api = useApiStore()

  // State
  // Newest session first, each order carries its session and tickets
  const orders = ref<Order[]>([])
  // Order the refund modal asks about, modals take no props so it is handed over here
  const refundCandidate = ref<Order | null>(null)

  // Getters
  const isLoading = computed(() => api.isLoading('tickets'))

  /**
   * Same split as the API's ?filter=: upcoming is paid with the session still ahead,
   * past is everything else, refunded orders included whatever their date.
   * Grouped here from one request, so a refunded card moves to past right away
   */
  const ordersByGroup = computed<Record<TicketGroup, Order[]>>(() => ({
    upcoming: orders.value.filter((order) => order.isUpcoming),
    past: orders.value.filter((order) => !order.isUpcoming),
  }))

  const isRefunding = computed(() => (order: Order) => api.isLoading(refundKey(order)))

  // 422 message of the last refused refund, e.g. inside the 2 hour cutoff
  const refundErrorOf = computed(() => (order: Order) => api.messageOf(refundKey(order)))

  // Actions
  // Refetched on every visit, a new order or a refund may have happened since
  async function fetchTickets() {
    const response = await api.get<{ data: Order[] }>('tickets', 'tickets').catch(() => null)
    orders.value = response?.data ?? []
  }

  // API asks to confirm first, a refund can't be undone
  function askRefund(order: Order) {
    refundCandidate.value = order
    useModalStore().openModal('RefundModal')
  }

  function clearRefundCandidate() {
    refundCandidate.value = null
  }

  /**
   * POST /orders/{reference}/refund, the seats go back onto the map.
   * The response is the updated order, it replaces the card's order in place.
   * 422 means refused (already refunded or inside the cutoff), its message lands under the refund key
   * and the list is refetched so isRefundable catches up
   */
  async function refund(order: Order): Promise<boolean> {
    if (!order.isRefundable || isRefunding.value(order)) return false
    try {
      const response = await api.post<{ data: Order }>(
        refundKey(order),
        `orders/${order.reference}/refund`,
      )
      const index = orders.value.findIndex((item) => item.id === order.id)
      if (index !== -1) orders.value[index] = response.data
      return true
    } catch (error) {
      if (isApiError(error) && error.status === 422) await fetchTickets()
      return false
    }
  }

  return {
    orders,
    refundCandidate,
    isLoading,
    ordersByGroup,
    isRefunding,
    refundErrorOf,
    fetchTickets,
    askRefund,
    clearRefundCandidate,
    refund,
  }
})
