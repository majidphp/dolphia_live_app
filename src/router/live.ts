export default {
  path: '/live',
  name: 'live',
  redirect: '/live',
  children: [
    {
      path: '',
      name: 'live-matches',
      component: () => import('@/views/live/page.vue'),
      meta: {
        title: 'Dolphia Live'
      }
    },
    {
      path: ':id',
      name: 'live-match-detail',
      component: () => import('@/views/live/:id/page.vue'),
      meta: {
        title: 'Match Details'
      }
    }
  ]
}
