import { createRouter, createWebHistory } from 'vue-router';

const Play = () => import(/* webpackChunkName: "play" */ '../pages/PlayPage.vue');

const Login = () =>
  import(/* webpackChunkName: "login" */ '../pages/LoginPage.vue');

const routes = [
  { path: '/', name: 'play', component: Play },
  { path: '/login', name: 'login', component: Login },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
