import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入icon图标
import './assets/fonts/iconfont.css'
// 导入全局样式
import './assets/css/reset.css'
import axios from 'axios'

Vue.config.productionTip = false

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求服务之前,先调用use中的回调函数,在回调函数里添加一些请求信息
axios.interceptors.request.use(config => {
  console.log(config)
  // 请求拦截，token认证
  config.headers.Authorization = sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
