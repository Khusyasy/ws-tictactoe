import { createApp } from 'vue';
import App from './App.vue';

import './main.css';

// General Font
import 'vfonts/Lato.css';
// Monospace Font
import 'vfonts/FiraCode.css';

import router from './router';

const app = createApp(App);

app.use(router);

app.mount('#app');
