import Home from '@/pages/Home.vue'
import Sessions from '@/pages/Sessions.vue'
import NotFound from '@/pages/NotFound.vue'
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/sessions',
    name: 'sessions',
    component: Sessions,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFound.vue'),
  },
  /**
   * Action Routes
   */
  {
    path: '/action/modal/:name',
    name: 'action.modal',
    component: { render: () => null },
    meta: {
      // Define the guest-only modals directly in the route
      guestOnlyModals: ['LogInModal', 'RegistrationModal'],
    },
  },
  /**
   * Page not Found 404
   */
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
]

export default routes
