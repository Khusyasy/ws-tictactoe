import { createRouter, createWebHistory } from 'vue-router';

const Play = () => import(/* webpackChunkName: "play" */ '../pages/PlayPage.vue');

const routes = [{ path: '/', name: 'play', component: Play }];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
