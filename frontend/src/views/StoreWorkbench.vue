<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">
              <el-icon><Plus /></el-icon> 门店收衣登记
            </span>
          </template>

          <el-form :model="form" label-width="90px" label-position="left">
            <el-form-item label="顾客姓名">
              <el-input v-model="form.customerName" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="form.customerPhone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="衣物品类">
              <el-select v-model="form.category" placeholder="请选择" style="width: 100%">
                <el-option label="上衣" value="上衣" />
                <el-option label="裤子" value="裤子" />
                <el-option label="外套" value="外套" />
                <el-option label="大衣" value="大衣" />
                <el-option label="羽绒服" value="羽绒服" />
                <el-option label="西装" value="西装" />
                <el-option label="裙子" value="裙子" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
            <el-form-item label="品牌">
              <el-input v-model="form.brand" placeholder="请输入品牌" />
            </el-form-item>
            <el-form-item label="颜色">
              <el-input v-model="form.color" placeholder="请输入颜色" />
            </el-form-item>
            <el-form-item label="材质">
              <el-select v-model="form.material" placeholder="请选择" style="width: 100%">
                <el-option label="棉" value="棉" />
                <el-option label="羊毛" value="羊毛" />
                <el-option label="丝绸" value="丝绸" />
                <el-option label="涤纶" value="涤纶" />
                <el-option label="羽绒" value="羽绒" />
                <el-option label="皮革" value="皮革" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
            <el-form-item label="口袋检查">
              <el-switch v-model="form.pocketChecked" active-text="已检查" inactive-text="未检查" />
            </el-form-item>
            <el-form-item label="预存瑕疵">
              <el-input
                v-model="form.preExistingDefects"
                type="textarea"
                :rows="2"
                placeholder="请记录预存的瑕疵、磨损等"
              />
            </el-form-item>
            <el-form-item label="顾客要求">
              <el-input
                v-model="form.customerRequirements"
                type="textarea"
                :rows="2"
                placeholder="请记录顾客的特殊要求"
              />
            </el-form-item>
            <el-form-item label="预估价格">
              <el-input-number v-model="form.estimatedPrice" :min="0" :precision="2" />
            </el-form-item>
            <el-form-item label="价值类型">
              <el-radio-group v-model="form.valueType">
                <el-radio value="normal">普通衣物</el-radio>
                <el-radio value="high">高价值衣物</el-radio>
              </el-radio-group>
              <el-tag v-if="isHighValueHint" type="warning" size="small" class="ml10">
                <el-icon><Warning /></el-icon> 系统检测可能为高价值衣物
              </el-tag>
            </el-form-item>
            <el-form-item label="门店">
              <el-select v-model="form.storeName" placeholder="请选择门店" style="width: 100%">
                <el-option label="朝阳门店" value="朝阳门店" />
                <el-option label="海淀门店" value="海淀门店" />
                <el-option label="西城门店" value="西城门店" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="form.valueType === 'high'" label="质检照片">
              <div class="form-tip">
                <el-icon><Warning /></el-icon>
                高价值衣物需拍照确认衣物状态（整体、细节、瑕疵各至少1张）
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
            <el-form-item label="瑕疵照片">
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
            <el-form-item v-if="form.valueType === 'high'" label="瑕疵差异">
              <el-switch v-model="form.hasDiscrepancy" active-text="发现差异" inactive-text="无差异" />
              <el-input
                v-if="form.hasDiscrepancy"
                v-model="form.discrepancyNote"
                type="textarea"
                :rows="2"
                placeholder="请描述发现的瑕疵差异"
                class="mt10"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitForm" :loading="submitting">
                <el-icon><Check /></el-icon> 确认收衣
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><List /></el-icon> 待处理衣物
              </span>
              <div class="tabs">
                <el-radio-group v-model="activeTab" size="small" @change="loadList">
                  <el-radio-button label="received">待送厂</el-radio-button>
                  <el-radio-button label="returning">返店中</el-radio-button>
                  <el-radio-button label="ready">待取衣</el-radio-button>
                  <el-radio-button label="all">全部</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>

          <el-table :data="list" v-loading="loading" stripe height="600">
            <el-table-column prop="orderNo" label="订单号" width="120" />
            <el-table-column label="顾客" width="150">
              <template #default="{ row }">
                <div>{{ row.customerName }}</div>
                <div class="text-muted">{{ row.customerPhone }}</div>
              </template>
            </el-table-column>
            <el-table-column label="衣物信息" min-width="180">
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
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="StatusMap[row.status]?.type || 'info'" size="small">
                  {{ StatusMap[row.status]?.label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column v-if="activeTab === 'received'" label="质检状态" width="120">
              <template #default="{ row }">
                <el-tag v-if="row.valueType === 'high'" :type="InspectionStatusMap[row.inspectionStatus]?.type || 'info'" size="small">
                  {{ InspectionStatusMap[row.inspectionStatus]?.label }}
                </el-tag>
                <span v-else class="text-muted">-</span>
              </template>
            </el-table-column>
            <el-table-column label="登记时间" width="160">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="320" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewDetail(row.id)">详情</el-button>
                <el-button 
                  v-if="row.status === 'received' && row.valueType === 'high' && row.inspectionStatus === 'pending'" 
                  type="warning" 
                  link 
                  size="small" 
                  @click="openInspection(row)"
                >
                  门店质检
                </el-button>
                <el-button 
                  v-if="row.status === 'received'" 
                  type="success" 
                  link 
                  size="small" 
                  @click="sendToFactory(row)"
                  :disabled="row.valueType === 'high' && row.inspectionStatus !== 'completed' && row.inspectionStatus !== 'store_done'"
                >
                  送厂
                </el-button>
                <el-button v-if="row.status === 'returning'" type="warning" link size="small" @click="storeReceive(row.id)">返店签收</el-button>
                <el-button v-if="row.status === 'ready'" type="warning" link size="small" @click="quickPickup(row.id)">确认取衣</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="inspectionVisible" title="门店质检 - 高价值衣物" width="600px">
      <div v-if="inspectionClothing" class="inspection-content">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="订单号">{{ inspectionClothing.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="顾客">{{ inspectionClothing.customerName }}</el-descriptions-item>
          <el-descriptions-item label="衣物">{{ inspectionClothing.category }} · {{ inspectionClothing.brand }}</el-descriptions-item>
          <el-descriptions-item label="材质颜色">{{ inspectionClothing.material }} / {{ inspectionClothing.color }}</el-descriptions-item>
          <el-descriptions-item label="预存瑕疵" :span="2">{{ inspectionClothing.preExistingDefects || '无' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-form :model="inspectionForm" label-width="100px">
          <el-form-item label="质检照片">
            <div class="form-tip">
              <el-icon><Camera /></el-icon>
              请拍摄衣物整体、细节、瑕疵部位照片（至少3张）
            </div>
            <el-upload
              action="#"
              :auto-upload="false"
              :on-change="handleInspectionPhotoChange"
              list-type="picture-card"
              multiple
              :limit="10"
              :file-list="inspectionPhotoList"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="是否发现差异">
            <el-switch v-model="inspectionForm.hasDiscrepancy" active-text="发现差异" inactive-text="无差异" />
          </el-form-item>
          <el-form-item v-if="inspectionForm.hasDiscrepancy" label="差异描述">
            <el-input
              v-model="inspectionForm.note"
              type="textarea"
              :rows="3"
              placeholder="请详细描述发现的瑕疵差异"
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
        <el-button type="primary" @click="submitInspection" :loading="inspectionSubmitting">
          确认提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clothingApi } from '@/api'
import type { Clothing, ClothingStatus } from '@/types'
import { StatusMap, InspectionStatusMap, HIGH_VALUE_BRANDS, HIGH_VALUE_CATEGORIES, HIGH_VALUE_MATERIALS } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const list = ref<Clothing[]>([])
const activeTab = ref('received')
const photoFiles = ref<any[]>([])
const inspectionPhotoFiles = ref<any[]>([])

const inspectionVisible = ref(false)
const inspectionSubmitting = ref(false)
const inspectionClothing = ref<Clothing | null>(null)
const inspectionPhotoList = ref<any[]>([])
const inspectionForm = reactive({
  note: '',
  hasDiscrepancy: false,
})

const form = reactive({
  customerName: '',
  customerPhone: '',
  category: '',
  brand: '',
  color: '',
  material: '',
  pocketChecked: false,
  preExistingDefects: '',
  customerRequirements: '',
  estimatedPrice: 0,
  valueType: 'normal' as 'normal' | 'high',
  hasDiscrepancy: false,
  discrepancyNote: '',
  storeName: '朝阳门店',
  storeId: 'store001',
})

const isHighValueHint = computed(() => {
  const brandMatch = HIGH_VALUE_BRANDS.some(b => form.brand && form.brand.toLowerCase().includes(b.toLowerCase()))
  const categoryMatch = HIGH_VALUE_CATEGORIES.some(c => form.category && form.category.includes(c))
  const materialMatch = HIGH_VALUE_MATERIALS.some(m => form.material && form.material.includes(m))
  return (brandMatch || categoryMatch || materialMatch) && form.valueType === 'normal'
})

watch([() => form.brand, () => form.category, () => form.material], () => {
  if (isHighValueHint.value) {
    form.valueType = 'high'
  }
})

const handlePhotoChange = (file: any) => {
  photoFiles.value.push(file.raw)
}

const handleInspectionPhotoChange = (file: any) => {
  inspectionPhotoFiles.value.push(file.raw)
}

const openInspection = (row: Clothing) => {
  inspectionClothing.value = row
  inspectionForm.note = ''
  inspectionForm.hasDiscrepancy = false
  inspectionPhotoFiles.value = []
  inspectionPhotoList.value = []
  inspectionVisible.value = true
}

const submitInspection = async () => {
  if (!inspectionClothing.value) return
  
  if (inspectionPhotoFiles.value.length === 0) {
    ElMessage.warning('请至少上传1张质检照片')
    return
  }
  
  inspectionSubmitting.value = true
  try {
    const clothingId = inspectionClothing.value.id
    
    const formData = new FormData()
    inspectionPhotoFiles.value.forEach(f => formData.append('photos', f))
    formData.append('photoType', 'store_inspection')
    formData.append('photoTypeName', '门店质检照片')
    formData.append('description', inspectionForm.note || '门店质检')
    formData.append('uploadedBy', form.storeName)
    formData.append('inspectionSource', 'store')
    await clothingApi.uploadPhotos(clothingId, formData)
    
    await clothingApi.storeInspection(clothingId, {
      note: inspectionForm.note,
      hasDiscrepancy: inspectionForm.hasDiscrepancy,
      operator: form.storeName,
    })
    
    ElMessage.success('门店质检提交成功')
    inspectionVisible.value = false
    loadList()
  } catch (e: any) {
    ElMessage.error(e.message || '提交失败')
  } finally {
    inspectionSubmitting.value = false
  }
}

const submitForm = async () => {
  if (!form.customerName || !form.customerPhone || !form.category) {
    ElMessage.warning('请填写必填信息')
    return
  }
  
  if (form.valueType === 'high' && inspectionPhotoFiles.value.length === 0) {
    ElMessage.warning('高价值衣物请至少上传1张质检照片')
    return
  }
  
  submitting.value = true
  try {
    const res = await clothingApi.create(form)
    const clothingId = res.data.id
    
    if (photoFiles.value.length > 0) {
      const formData = new FormData()
      photoFiles.value.forEach(f => formData.append('photos', f))
      formData.append('photoType', 'pre_defect')
      formData.append('photoTypeName', '预存瑕疵')
      formData.append('description', form.preExistingDefects || '收衣记录')
      formData.append('uploadedBy', form.storeName)
      await clothingApi.uploadPhotos(clothingId, formData)
    }
    
    if (form.valueType === 'high' && inspectionPhotoFiles.value.length > 0) {
      const formData = new FormData()
      inspectionPhotoFiles.value.forEach(f => formData.append('photos', f))
      formData.append('photoType', 'store_inspection')
      formData.append('photoTypeName', '门店质检照片')
      formData.append('description', form.discrepancyNote || form.preExistingDefects || '收衣质检')
      formData.append('uploadedBy', form.storeName)
      formData.append('inspectionSource', 'store')
      await clothingApi.uploadPhotos(clothingId, formData)
      
      await clothingApi.storeInspection(clothingId, {
        note: form.discrepancyNote,
        hasDiscrepancy: form.hasDiscrepancy,
        operator: form.storeName,
      })
    }
    
    ElMessage.success('收衣登记成功！')
    resetForm()
    loadList()
  } catch (e: any) {
    ElMessage.error(e.message || '登记失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    customerName: '',
    customerPhone: '',
    category: '',
    brand: '',
    color: '',
    material: '',
    pocketChecked: false,
    preExistingDefects: '',
    customerRequirements: '',
    estimatedPrice: 0,
    valueType: 'normal' as const,
    hasDiscrepancy: false,
    discrepancyNote: '',
  })
  photoFiles.value = []
  inspectionPhotoFiles.value = []
}

const loadList = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    params.storeId = form.storeId
    const res = await clothingApi.list(params)
    list.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const sendToFactory = async (row: Clothing | string) => {
  const id = typeof row === 'string' ? row : row.id
  const clothing = typeof row === 'string' ? list.value.find(c => c.id === id) : row
  
  try {
    if (clothing && clothing.valueType === 'high') {
      if (clothing.inspectionStatus !== 'completed' && clothing.inspectionStatus !== 'store_done') {
        ElMessage.warning('高价值衣物需完成门店质检后才能送厂')
        return
      }
      if (clothing.needsReview) {
        ElMessage.warning('该衣物存在瑕疵差异，需完成复核后才能送厂')
        return
      }
    }
    
    await ElMessageBox.confirm('确认送往中央工厂？', '提示', { type: 'info' })
    await clothingApi.updateStatus(id, { status: 'in_factory', operator: form.storeName, operatorRole: 'store' })
    ElMessage.success('已送往工厂')
    loadList()
  } catch (e) {}
}

const storeReceive = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认衣物已返店签收？', '提示', { type: 'warning' })
    await clothingApi.storeReceive(id, { operator: form.storeName })
    ElMessage.success('签收成功，已进入待取衣状态')
    loadList()
  } catch (e) {}
}

const quickPickup = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认顾客已取衣？', '提示', { type: 'warning' })
    await clothingApi.pickup(id, { customerName: form.storeName, rating: 5, evaluation: '满意' })
    ElMessage.success('取衣确认成功')
    loadList()
  } catch (e) {}
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
  max-width: 1600px;
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

.text-muted {
  color: #909399;
  font-size: 12px;
}

.ml5 {
  margin-left: 5px;
}

.ml10 {
  margin-left: 10px;
}

.mt10 {
  margin-top: 10px;
}

.flex {
  display: flex;
}

.align-center {
  align-items: center;
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
