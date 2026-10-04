import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { handleModalBeforeEach, handleModalAfterEach } from './middlewares/actions'
import { requiresAuthentication, requiresGuest } from './middlewares/auth'
/**
 * Declare router
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
// auth guards
router.beforeEach(requiresAuthentication)
router.beforeEach(requiresGuest)
// modal guards
router.beforeEach(handleModalBeforeEach)
router.afterEach(handleModalAfterEach)

export default router
