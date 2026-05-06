import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DetailView from '../views/DetailView.vue'
import TeamBuilderView from '../views/TeamBuilderView.vue'
import GameView from '../views/GameView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/pokemon/:id',
      name: 'pokemon-detail',
      component: DetailView,
      props: true,
    },
    {
      path: '/team-builder',
      name: 'team-builder',
      component: TeamBuilderView,
    },
    {
      path: '/game',
      name: 'game',
      component: GameView,
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
