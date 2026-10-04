import type { RouteLocationNormalizedGeneric } from 'vue-router'
import { useModalStore } from '@/stores/modals'
/**
 * Open a modal instead of navigating to actual route
 * @param to RouteLocationNormalizedGeneric
 * @returns mixed
 */
export function handleModalBeforeEach(to: RouteLocationNormalizedGeneric) {
  const modalStore = useModalStore()
  if (to.name === 'action.modal') {
    modalStore.openModal(to.params.name as string)
    return false
  } else {
    modalStore.closeModal()
  }
}
/**
 * Close a modal if it is open and trying to route same url
 * Example case: Sidebar Button "Browse Courses" clicked on Courses page
 * without this guard modal will stay opened
 * @param to RouteLocationNormalizedGeneric
 * @param from RouteLocationNormalizedGeneric
 */
export function handleModalAfterEach(
  to: RouteLocationNormalizedGeneric,
  from: RouteLocationNormalizedGeneric,
): void {
  const modalStore = useModalStore()
  if (to.path === from.path) {
    modalStore.closeModal()
  }
}
