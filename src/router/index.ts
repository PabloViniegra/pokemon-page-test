import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/pokemon/:id',
      name: 'pokemon-detail',
      component: () => import('../views/DetailView.vue'),
      props: true,
    },
    {
      path: '/team-builder',
      name: 'team-builder',
      component: () => import('../views/TeamBuilderView.vue'),
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('../views/GameView.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.name === 'home' && from.name === 'home') {
      return false
    }
    if (to.name === 'home' && from.name === 'pokemon-detail') {
      const stored = sessionStorage.getItem('pokedex-scroll-y')
      if (stored) {
        return { top: parseInt(stored, 10), behavior: 'instant' }
      }
      return { top: 0 }
    }
    if (savedPosition) {
      return { ...savedPosition, behavior: 'instant' }
    }
    return { top: 0 }
  },
})

export default router