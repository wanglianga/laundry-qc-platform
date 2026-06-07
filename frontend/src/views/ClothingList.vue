<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">衣物档案列表</span>
          <div class="header-actions">
            <el-input
              v-model="keyword"
              placeholder="搜索订单号/姓名/手机号"
              clearable
              style="width: 280px"
              @keyup.enter="loadData"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 150px" @change="loadData">
              <el-option v-for="(item, key) in StatusMap" :key="key" :label="item.label" :value="key" />
            </el-select>
            <el-button type="primary" @click="loadData">
              <el-icon><Refresh /></el-icon>刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="订单号" width="140" />
        <el-table-column prop="customerName" label="顾客姓名" width="100" />
        <el-table-column prop="customerPhone" label="手机号" width="130" />
        <el-table-column label="衣物信息" min-width="200">
          <template #default="{ row }">
            <div>{{ row.category }} / {{ row.brand }} / {{ row.color }}</div>
            <div class="text-muted">{{ row.material }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="StatusMap[row.status]?.type || 'info'">
              {{ StatusMap[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="门店" width="120" />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row.id)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clothingApi } from '@/api'
import type { Clothing, ClothingStatus } from '@/types'
import { StatusMap } from '@/types'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const list = ref<Clothing[]>([])
const keyword = ref('')
const statusFilter = ref<ClothingStatus | ''>('')

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (keyword.value) params.keyword = keyword.value
    if (statusFilter.value) params.status = statusFilter.value
    const res = await clothingApi.list(params)
    list.value = res.data
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const viewDetail = (id: string) => {
  router.push(`/detail/${id}`)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.text-muted {
  color: #909399;
  font-size: 12px;
}
</style>
