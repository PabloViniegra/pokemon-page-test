import { createApp } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './style.css'
import App from './App.vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import router from './router'
import { pinia } from './stores/pinia'
import { initializeTheme } from './composables/useTheme'

initializeTheme()
gsap.registerPlugin(ScrollTrigger)

createApp(App).use(pinia).use(router).use(VueQueryPlugin).mount('#app')
