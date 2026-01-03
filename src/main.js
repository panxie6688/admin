import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import App from './App.vue'
import router from './router'
import i18n from './locales'
import 'ant-design-vue/dist/reset.css'
import './assets/styles/global.less'

// 全局组件
import TablePagination from './components/TablePagination.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(i18n)

// 注册全局组件
app.component('TablePagination', TablePagination)

app.mount('#app')
