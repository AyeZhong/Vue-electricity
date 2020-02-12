import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import ZkTable from 'vue-table-with-tree-grid'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'

import axios from 'axios'
// 配置请求的跟路径
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})
Vue.prototype.$http = axios
Vue.filter('dateFromat',(val)=>{
  const dt=new Date(val*1000)
  const y=dt.getFullYear()
  const m=(dt.getMonth()+1).toString().padStart(2,0)
  const d = dt.getDate().toString().padStart(2,0)
  const h =dt.getHours().toString().padStart(2,0)
  const mm=dt.getMinutes().toString().padStart(2,0)
  const s = dt.getSeconds().toString().padStart(2,0)
  return `${y}-${m}-${d} ${h}:${mm}:${s}`
})
Vue.config.productionTip = false
Vue.component('tree-table',ZkTable)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
