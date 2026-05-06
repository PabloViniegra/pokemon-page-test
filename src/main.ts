import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import router from './router'
import { pinia } from './stores/pinia'

createApp(App).use(pinia).use(router).use(VueQueryPlugin).mount('#app')
