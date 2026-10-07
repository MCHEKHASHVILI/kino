import Home from '@/pages/Home.vue'
import Sessions from '@/pages/Sessions.vue'
import Movie from '@/pages/Movie.vue'
import NotFound from '@/pages/NotFound.vue'
import Profile from '@/pages/Profile.vue'
import { PROFILE_TABS, type ProfileTab } from '@/stores/profile'
import type { RouteLocationNormalizedGeneric } from 'vue-router'
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
    path: '/movies/:slug',
    name: 'movie',
    component: Movie,
    props: true,
    meta: { overlayHeader: true },
  },
  {
    // ?tab=personal|tickets selects the tab, so each one is linkable and survives refresh
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true },
    beforeEnter: (to: RouteLocationNormalizedGeneric) => {
      if (PROFILE_TABS.includes(to.query.tab as ProfileTab)) return
      return { ...to, query: { ...to.query, tab: PROFILE_TABS[0] } }
    },
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
