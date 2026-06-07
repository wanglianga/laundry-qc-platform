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
            <el-form-item label="门店">
              <el-select v-model="form.storeName" placeholder="请选择门店" style="width: 100%">
                <el-option label="朝阳门店" value="朝阳门店" />
                <el-option label="海淀门店" value="海淀门店" />
                <el-option label="西城门店" value="西城门店" />
              </el-select>
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
                <div>{{ row.category }} · {{ row.brand }}</div>
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
            <el-table-column label="登记时间" width="160">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewDetail(row.id)">详情</el-button>
                <el-button v-if="row.status === 'received'" type="success" link size="small" @click="sendToFactory(row.id)">送厂</el-button>
                <el-button v-if="row.status === 'ready'" type="warning" link size="small" @click="quickPickup(row.id)">确认取衣</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clothingApi } from '@/api'
import type { Clothing, ClothingStatus } from '@/types'
import { StatusMap } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const list = ref<Clothing[]>([])
const activeTab = ref('received')
const photoFiles = ref<any[]>([])

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
  storeName: '朝阳门店',
  storeId: 'store001',
})

const handlePhotoChange = (file: any) => {
  photoFiles.value.push(file.raw)
}

const submitForm = async () => {
  if (!form.customerName || !form.customerPhone || !form.category) {
    ElMessage.warning('请填写必填信息')
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
  })
  photoFiles.value = []
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

const sendToFactory = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认送往中央工厂？', '提示', { type: 'info' })
    await clothingApi.updateStatus(id, { status: 'in_factory', operator: form.storeName, operatorRole: 'store' })
    ElMessage.success('已送往工厂')
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
</style>
