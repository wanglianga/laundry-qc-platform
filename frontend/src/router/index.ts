import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'ClothingList',
    component: () => import('@/views/ClothingList.vue'),
    meta: { title: '衣物档案列表' },
  },
  {
    path: '/store',
    name: 'StoreWorkbench',
    component: () => import('@/views/StoreWorkbench.vue'),
    meta: { title: '门店工作台' },
  },
  {
    path: '/factory',
    name: 'FactoryWorkbench',
    component: () => import('@/views/FactoryWorkbench.vue'),
    meta: { title: '工厂工作台' },
  },
  {
    path: '/service',
    name: 'ServiceWorkbench',
    component: () => import('@/views/ServiceWorkbench.vue'),
    meta: { title: '客服工作台' },
  },
  {
    path: '/customer',
    name: 'CustomerPortal',
    component: () => import('@/views/CustomerPortal.vue'),
    meta: { title: '顾客端' },
  },
  {
    path: '/detail/:id',
    name: 'ClothingDetail',
    component: () => import('@/views/ClothingDetail.vue'),
    meta: { title: '衣物详情' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
