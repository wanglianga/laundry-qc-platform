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
                  <el-descriptions-item label="订单号">
                    <div class="flex align-center">
                      {{ selectedClothing.orderNo }}
                      <el-tag v-if="selectedClothing.valueType === 'high'" type="warning" size="small" class="ml5">
                        <el-icon><Star /></el-icon> 高价值
                      </el-tag>
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item label="顾客">{{ selectedClothing.customerName }}</el-descriptions-item>
                  <el-descriptions-item label="衣物">{{ selectedClothing.category }} · {{ selectedClothing.brand }}</el-descriptions-item>
                  <el-descriptions-item label="材质颜色">{{ selectedClothing.material }} / {{ selectedClothing.color }}</el-descriptions-item>
                  <el-descriptions-item label="预存瑕疵">{{ selectedClothing.preExistingDefects || '无' }}</el-descriptions-item>
                  <el-descriptions-item label="顾客要求">{{ selectedClothing.customerRequirements || '无' }}</el-descriptions-item>
                  <el-descriptions-item v-if="selectedClothing.valueType === 'high'" label="门店质检备注">
                    {{ selectedClothing.storeInspectionNote || '无' }}
                  </el-descriptions-item>
                  <el-descriptions-item v-if="selectedClothing.valueType === 'high'" label="质检状态">
                    <el-tag :type="InspectionStatusMap[selectedClothing.inspectionStatus]?.type || 'info'" size="small">
                      {{ InspectionStatusMap[selectedClothing.inspectionStatus]?.label }}
                    </el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              
              <div v-if="selectedClothing.valueType === 'high' && (selectedClothing.inspectionStatus === 'store_done' || selectedClothing.inspectionStatus === 'pending')" class="inspection-notice">
                <el-icon><Warning /></el-icon>
                <span>高价值衣物需完成工厂质检确认后才能进入清洗流程</span>
                <el-button type="primary" size="small" @click="openFactoryInspection">
                  立即质检
                </el-button>
              </div>
              
              <div v-if="selectedClothing.valueType === 'high' && selectedClothing.needsReview" class="review-notice">
                <el-icon><WarningFilled /></el-icon>
                <span>该衣物存在瑕疵差异，需等待复核完成后才能清洗</span>
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
                <div class="flex align-center">
                  {{ row.category }} · {{ row.brand }}
                  <el-tag v-if="row.valueType === 'high'" type="warning" size="small" class="ml5">
                    <el-icon><Star /></el-icon> 高价值
                  </el-tag>
                </div>
                <div class="text-muted">{{ row.color }} / {{ row.material }}</div>
              </template>
            </el-table-column>
            <el-table-column v-if="activeTab === 'in_factory'" label="质检状态" width="110">
              <template #default="{ row }">
                <el-tag v-if="row.valueType === 'high'" :type="InspectionStatusMap[row.inspectionStatus]?.type || 'info'" size="small">
                  {{ InspectionStatusMap[row.inspectionStatus]?.label }}
                </el-tag>
                <span v-else class="text-muted">-</span>
              </template>
            </el-table-column>
            <el-table-column label="预存瑕疵" min-width="100" show-overflow-tooltip>
              <template #default="{ row }">{{ row.preExistingDefects || '无' }}</template>
            </el-table-column>
            <el-table-column label="顾客要求" min-width="100" show-overflow-tooltip>
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

    <el-dialog v-model="inspectionVisible" title="工厂质检 - 高价值衣物" width="600px">
      <div v-if="selectedClothing" class="inspection-content">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="订单号">{{ selectedClothing.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="顾客">{{ selectedClothing.customerName }}</el-descriptions-item>
          <el-descriptions-item label="衣物">{{ selectedClothing.category }} · {{ selectedClothing.brand }}</el-descriptions-item>
          <el-descriptions-item label="材质颜色">{{ selectedClothing.material }} / {{ selectedClothing.color }}</el-descriptions-item>
          <el-descriptions-item label="预存瑕疵" :span="2">{{ selectedClothing.preExistingDefects || '无' }}</el-descriptions-item>
          <el-descriptions-item label="门店质检备注" :span="2">{{ selectedClothing.storeInspectionNote || '无' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-form :model="inspectionForm" label-width="100px">
          <el-form-item label="比对照片">
            <div class="form-tip">
              <el-icon><Camera /></el-icon>
              请拍摄工厂收到的衣物照片，与门店照片进行比对（至少3张）
            </div>
            <el-upload
              action="#"
              :auto-upload="false"
              :on-change="handleInspectionPhotoChange"
              list-type="picture-card"
              multiple
              :limit="10"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="与门店描述是否一致">
            <el-radio-group v-model="inspectionForm.hasDiscrepancy">
              <el-radio :label="false">一致</el-radio>
              <el-radio :label="true">发现差异</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="inspectionForm.hasDiscrepancy" label="差异描述">
            <el-input
              v-model="inspectionForm.note"
              type="textarea"
              :rows="3"
              placeholder="请详细描述发现的瑕疵差异，将进入复核流程"
            />
          </el-form-item>
          <el-form-item v-else label="质检备注">
            <el-input
              v-model="inspectionForm.note"
              type="textarea"
              :rows="2"
              placeholder="可填写质检备注（选填）"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="inspectionVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFactoryInspection" :loading="inspectionSubmitting">
          确认提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clothingApi } from '@/api'
import type { Clothing, ClothingStatus } from '@/types'
import { StatusMap, InspectionStatusMap } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const processing = ref(false)
const list = ref<Clothing[]>([])
const activeTab = ref<ClothingStatus | 'all'>('in_factory')
const selectedId = ref('')
const photoFiles = ref<any[]>([])
const inspectionPhotoFiles = ref<any[]>([])

const inspectionVisible = ref(false)
const inspectionSubmitting = ref(false)
const inspectionForm = reactive({
  note: '',
  hasDiscrepancy: false,
})

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

const handleInspectionPhotoChange = (file: any) => {
  inspectionPhotoFiles.value.push(file.raw)
}

const openFactoryInspection = () => {
  if (!selectedClothing.value) return
  inspectionForm.note = ''
  inspectionForm.hasDiscrepancy = false
  inspectionPhotoFiles.value = []
  inspectionVisible.value = true
}

const submitFactoryInspection = async () => {
  if (!selectedClothing.value) return
  
  if (inspectionPhotoFiles.value.length === 0) {
    ElMessage.warning('请至少上传1张质检照片')
    return
  }
  
  inspectionSubmitting.value = true
  try {
    const clothingId = selectedClothing.value.id
    
    const formData = new FormData()
    inspectionPhotoFiles.value.forEach(f => formData.append('photos', f))
    formData.append('photoType', 'factory_inspection')
    formData.append('photoTypeName', '工厂质检照片')
    formData.append('description', inspectionForm.note || '工厂质检')
    formData.append('uploadedBy', processForm.operator)
    formData.append('inspectionSource', 'factory')
    await clothingApi.uploadPhotos(clothingId, formData)
    
    await clothingApi.factoryInspection(clothingId, {
      note: inspectionForm.note,
      hasDiscrepancy: inspectionForm.hasDiscrepancy,
      operator: processForm.operator,
    })
    
    if (inspectionForm.hasDiscrepancy) {
      ElMessage.success('已提交工厂质检，发现瑕疵差异，将进入复核流程')
    } else {
      ElMessage.success('工厂质检提交成功，双重质检完成')
    }
    
    inspectionVisible.value = false
    loadList()
  } catch (e: any) {
    ElMessage.error(e.message || '提交失败')
  } finally {
    inspectionSubmitting.value = false
  }
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
  
  const clothing = selectedClothing.value
  if (clothing && clothing.valueType === 'high') {
    if (clothing.needsReview) {
      ElMessage.warning('该衣物存在瑕疵差异，需完成复核后才能清洗')
      return
    }
    if (clothing.inspectionStatus !== 'completed') {
      ElMessage.warning('高价值衣物需完成双重质检后才能进入清洗')
      return
    }
    
    try {
      await ElMessageBox.confirm(
        '该衣物为高价值衣物，确认已完成双重质检且无异议？',
        '高价值衣物确认',
        { type: 'warning' }
      )
    } catch {
      return
    }
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

.ml5 {
  margin-left: 5px;
}

.flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.inspection-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  margin: 16px 0;
  background: #fdf6ec;
  color: #e6a23c;
  border-radius: 6px;
  
  span {
    flex: 1;
    font-size: 14px;
  }
}

.review-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  margin: 16px 0;
  background: #fef0f0;
  color: #f56c6c;
  border-radius: 6px;
  
  span {
    flex: 1;
    font-size: 14px;
  }
}

.form-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  margin-bottom: 10px;
  background: #fdf6ec;
  color: #e6a23c;
  border-radius: 4px;
  font-size: 13px;
}

.inspection-content {
  .el-descriptions {
    margin-bottom: 16px;
  }
}
</style>
