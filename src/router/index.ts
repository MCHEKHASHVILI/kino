import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Sessions from '@/pages/Sessions.vue'

const router = createRouter({
  // BASE_URL is '/' in dev and '/kino/' on GitHub Pages (see vite.config.ts)
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      component: () => import('@/pages/NotFoundView.vue'),
    },
  ],
})

export default router
