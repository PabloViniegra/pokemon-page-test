import { createRouter, createWebHistory } from 'vue-router'
import { updateSeoHead } from '../composables/useSeoHead'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: {
        title: 'Pokédex – Explore Every Pokémon',
        description:
          'Browse, search, and filter Pokémon from every generation. Build teams and play Who\'s That Pokémon.',
        canonical: '/',
      },
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
      meta: {
        title: 'Team Builder',
        description:
          'Build your dream team of 6 Pokémon and analyze type strengths, weaknesses, and coverage.',
        canonical: '/team-builder',
        robots: 'noindex, follow',
      },
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('../views/GameView.vue'),
      meta: {
        title: 'Who\'s That Pokémon? Game',
        description:
          'Test your Pokémon knowledge in this silhouette guessing game. Track your streak and accuracy.',
        canonical: '/game',
        robots: 'noindex, follow',
      },
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

router.beforeEach((to) => {
  const meta = to.meta as Record<string, string | undefined>

  if (meta.title) {
    updateSeoHead({
      title: meta.title,
      description: meta.description,
      canonicalPath: meta.canonical ?? to.path,
      robots: meta.robots ?? 'index, follow',
    })
  }
})

export default router
