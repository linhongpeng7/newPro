import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "Login" */ '../views/Login.vue')
  },
  {
    path: '/home',
    name: 'Home',
    redirect: '/welcome',
    component: () => import(/* webpackChunkName: "Home" */ '../views/Home.vue'),
    children: [
      {
        path: '/welcome',
        component: () => import(/* webpackChunkName: "Welcome" */ '../views/Welcome.vue')
      },
      {
        path: '/users',
        component: () => import(/* webpackChunkName: "User" */ '../components/user/User.vue')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 路由拦截
router.beforeEach((to, from, next) => {
  // to---要访问的路径
  // from---从哪个路径跳转过来的
  // next---是一个函数，执行就代表放行
  if (to.path === '/login') {
    return next()
  }
  const token = sessionStorage.getItem('token')
  if (!token) {
    return next('/login')
  }
  next()
})

export default router
