import '@babel/polyfill';
import Vue from 'vue';
import './plugins/vuetify';
import App from './App.vue';
import store from './store';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import 'typeface-overpass-mono/index.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';

// disable production messages in console
Vue.config.productionTip = false;

// initialize application
new Vue({
  store,
  render: h => h(App)
}).$mount('#app');
