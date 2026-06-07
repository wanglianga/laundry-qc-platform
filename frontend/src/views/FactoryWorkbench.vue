<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="9">
        <el-card shadow="never" v-loading="processing">
          <template #header>
            <span class="card-title">
              <el-icon><Setting /></el-icon> 清洗处理工作台
            </span>
          </template>

          <div v-if="selectedClothing" class="process-panel">
            <div class="clothing-info">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="订单号">{{ selectedClothing.orderNo }}</el-descriptions-item>
                <el-descriptions-item label="顾客">{{ selectedClothing.customerName }}</el-descriptions-item>
                <el-descriptions-item label="衣物">{{ selectedClothing.category }} · {{ selectedClothing.brand }}</el-descriptions-item>
                <el-descriptions-item label="材质颜色">{{ selectedClothing.material }} / {{ selectedClothing.color }}</el-descriptions-item>
                <el-descriptions-item label="预存瑕疵">{{ selectedClothing.preExistingDefects || '无' }}</el-descriptions-item>
                <el-descriptions-item label="顾客要求">{{ selectedClothing.customerRequirements || '无' }}</el-descriptions-item>
              </el-descriptions>
            </div>

            <el-divider />

            <el-form :model="processForm" label-width="100px">
              <el-form-item label="清洗工艺">
                <el-select v-model="processForm.washingProcess" style="width: 100%">
                  <el-option label="标准水洗" value="标准水洗" />
                  <el-option label="干洗" value="干洗" />
                  <el-option label="手洗" value="手洗" />
                  <el-option label="羽绒服专洗" value="羽绒服专洗" />
                  <el-option label="皮革护理" value="皮革护理" />
                </el-select>
              </el-form-item>
              <el-form-item label="去渍尝试">
                <el-input
                  v-model="processForm.stainRemovalAttempt"
                  type="textarea"
                  :rows="2"
                  placeholder="记录去渍过程和结果"
                />
              </el-form-item>
              <el-form-item label="烘干方式">
                <el-select v-model="processForm.dryingMethod" style="width: 100%">
                  <el-option label="自然晾干" value="自然晾干" />
                  <el-option label="低温烘干" value="低温烘干" />
                  <el-option label="中温烘干" value="中温烘干" />
                  <el-option label="蒸汽烘干" value="蒸汽烘干" />
                </el-select>
              </el-form-item>
              <el-form-item label="整烫结果">
                <el-input
                  v-model="processForm.ironingResult"
                  type="textarea"
                  :rows="2"
                  placeholder="记录整烫情况"
                />
              </el-form-item>
              <el-form-item label="新增损伤">
                <el-input
                  v-model="processForm.newDamage"
                  type="textarea"
                  :rows="2"
                  placeholder="如有洗后新增损伤请记录"
                />
              </el-form-item>
              <el-form-item label="返店批次">
                <el-input v-model="processForm.batchNo" placeholder="例如：BATCH-20240115-001" />
              </el-form-item>

              <el-form-item label="洗后照片">
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :on-change="handlePhotoChange"
                  list-type="picture-card"
                  multiple
                  :limit="5"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
              </el-form-item>

              <el-form-item>
                <el-button type="success" @click="completeProcess" :loading="submitting">
                  <el-icon><Check /></el-icon> 完成处理，安排返店
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <div v-else class="empty-state">
            <el-empty description="请从右侧列表选择待处理衣物" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="15">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><List /></el-icon> 工厂任务列表
              </span>
              <div class="tabs">
                <el-radio-group v-model="activeTab" size="small" @change="loadList">
                  <el-radio-button label="in_factory">待处理</el-radio-button>
                  <el-radio-button label="returning">已返店</el-radio-button>
                  <el-radio-button label="all">全部</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>

          <el-table :data="list" v-loading="loading" stripe height="650" @row-click="selectClothing">
            <el-table-column label="选择" width="55">
              <template #default="{ row }">
                <el-radio v-model="selectedId" :label="row.id" @click.stop />
              </template>
            </el-table-column>
            <el-table-column prop="orderNo" label="订单号" width="120" />
            <el-table-column label="衣物信息" min-width="160">
              <template #default="{ row }">
                <div>{{ row.category }} · {{ row.brand }}</div>
                <div class="text-muted">{{ row.color }} / {{ row.material }}</div>
              </template>
            </el-table-column>
            <el-table-column label="预存瑕疵" min-width="120" show-overflow-tooltip>
              <template #default="{ row }">{{ row.preExistingDefects || '无' }}</template>
            </el-table-column>
            <el-table-column label="顾客要求" min-width="120" show-overflow-tooltip>
              <template #default="{ row }">{{ row.customerRequirements || '无' }}</template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="StatusMap[row.status]?.type || 'info'" size="small">
                  {{ StatusMap[row.status]?.label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="到厂时间" width="160">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click.stop="viewDetail(row.id)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clothingApi } from '@/api'
import type { Clothing, ClothingStatus } from '@/types'
import { StatusMap } from '@/types'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const processing = ref(false)
const list = ref<Clothing[]>([])
const activeTab = ref<ClothingStatus | 'all'>('in_factory')
const selectedId = ref('')
const photoFiles = ref<any[]>([])

const processForm = reactive({
  washingProcess: '标准水洗',
  stainRemovalAttempt: '',
  dryingMethod: '低温烘干',
  ironingResult: '',
  newDamage: '',
  batchNo: '',
  operator: '中央工厂',
})

const selectedClothing = computed(() => {
  return list.value.find(item => item.id === selectedId.value) || null
})

const handlePhotoChange = (file: any) => {
  photoFiles.value.push(file.raw)
}

const selectClothing = (row: Clothing) => {
  selectedId.value = row.id
  processing.value = true
  photoFiles.value = []
  Object.assign(processForm, {
    washingProcess: '标准水洗',
    stainRemovalAttempt: '',
    dryingMethod: '低温烘干',
    ironingResult: '',
    newDamage: '',
    batchNo: '',
  })
}

const completeProcess = async () => {
  if (!selectedId.value) {
    ElMessage.warning('请先选择一件衣物')
    return
  }
  submitting.value = true
  try {
    await clothingApi.factoryProcess(selectedId.value, processForm)
    
    if (photoFiles.value.length > 0) {
      const formData = new FormData()
      photoFiles.value.forEach(f => formData.append('photos', f))
      formData.append('photoType', 'washing_after')
      formData.append('photoTypeName', '洗后照片')
      formData.append('description', processForm.ironingResult || '洗后记录')
      formData.append('uploadedBy', processForm.operator)
      await clothingApi.uploadPhotos(selectedId.value, formData)
    }
    
    ElMessage.success('处理完成，已安排返店')
    selectedId.value = ''
    loadList()
  } catch (e: any) {
    ElMessage.error(e.message || '处理失败')
  } finally {
    submitting.value = false
    processing.value = false
  }
}

const loadList = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    const res = await clothingApi.list(params)
    list.value = res.data
  } catch (e) {
    console.error(e)
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
  loadList()
})
</script>

<style scoped>
.page-container {
  max-width: 1700px;
  margin: 0 auto;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.process-panel {
  .clothing-info {
    margin-bottom: 16px;
  }
}

.empty-state {
  padding: 80px 0;
}

.text-muted {
  color: #909399;
  font-size: 12px;
}

:deep(.el-table__row) {
  cursor: pointer;
}
</style>
