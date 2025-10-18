import { createRouter, createWebHistory } from 'vue-router'
import misc from './misc'
import live from './live'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    misc,
    live,
    // 404 page
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/404/page.vue'),
      meta: {
        title: 'Page Not Found'
      }
    }
  ]
})

// Dynamic title updates
router.beforeEach((to) => {
  document.title = to.meta.title as string || 'Dolphia'
})

export default router