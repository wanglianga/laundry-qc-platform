<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-left">
        <el-icon size="28"><WashingMachine /></el-icon>
        <h1>洗衣质检平台</h1>
      </div>
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        router
        class="header-menu"
      >
        <el-menu-item index="/store">门店工作台</el-menu-item>
        <el-menu-item index="/factory">工厂工作台</el-menu-item>
        <el-menu-item index="/service">客服工作台</el-menu-item>
        <el-menu-item index="/customer">顾客端</el-menu-item>
        <el-menu-item index="/">档案列表</el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.app-container {
  height: 100%;
}

.app-header {
  display: flex;
  align-items: center;
  background: #1e3a8a;
  color: white;
  padding: 0 24px;
  gap: 40px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h1 {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.header-menu {
  flex: 1;
  background: transparent;
  border-bottom: none;
}

.header-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.8);
}

.header-menu .el-menu-item:hover,
.header-menu .el-menu-item.is-active {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.app-main {
  background: #f1f5f9;
  padding: 24px;
  overflow-y: auto;
}
</style>
