import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';

import store from '../store';

import Play from '../pages/PlayPage.vue';
import Login from '../pages/LoginPage.vue';

const routes = [
  { path: '/', name: 'play', component: Play, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: Login },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      const { data } = await axios.get('/api/user/check');
      const { ok, user } = data;
      if (!ok) {
        throw new Error('User not authenticated');
      }
      store.user = user;
      next();
    } catch (error) {
      next({ name: 'login' });
    }
  } else {
    next();
  }
});

export default router;
