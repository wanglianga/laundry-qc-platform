<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">
              <el-icon><Warning /></el-icon> 发起投诉/赔付
            </span>
          </template>

          <el-form :model="compForm" label-width="100px">
            <el-form-item label="关联订单">
              <el-select v-model="compForm.clothingId" filterable placeholder="输入订单号搜索" style="width: 100%">
                <el-option
                  v-for="item in clothingOptions"
                  :key="item.id"
                  :label="`${item.orderNo} - ${item.customerName}`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="投诉类型">
              <el-select v-model="compForm.complaintType" style="width: 100%" @change="onComplaintTypeChange">
                <el-option label="掉色" value="color_fading" />
                <el-option label="缩水" value="shrinkage" />
                <el-option label="破损" value="breakage" />
                <el-option label="错拿/错件" value="wrong_item" />
                <el-option label="逾期" value="overdue" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
            <el-form-item label="赔付依据">
              <el-select v-model="compForm.basis" style="width: 100%">
                <el-option label="预存瑕疵" value="pre_existing_defect" />
                <el-option label="洗后新增损伤" value="new_damage" />
                <el-option label="顾客逾期取衣" value="overdue" />
                <el-option label="错件" value="wrong_item" />
                <el-option label="掉色" value="color_fading" />
                <el-option label="缩水" value="shrinkage" />
                <el-option label="破损" value="breakage" />
              </el-select>
            </el-form-item>
            <el-form-item label="问题描述">
              <el-input
                v-model="compForm.description"
                type="textarea"
                :rows="3"
                placeholder="请详细描述投诉内容"
              />
            </el-form-item>
            <el-form-item label="处理人">
              <el-input v-model="compForm.handledBy" placeholder="客服姓名" />
            </el-form-item>
            <el-form-item>
              <el-button type="danger" @click="submitComplaint" :loading="submitting">
                <el-icon><Plus /></el-icon> 发起投诉
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" style="margin-top: 20px" v-if="selectedComp">
          <template #header>
            <span class="card-title">
              <el-icon><Document /></el-icon> 处理赔付
            </span>
          </template>
          <el-form :model="handleForm" label-width="100px">
            <el-form-item label="处理状态">
              <el-select v-model="handleForm.status" style="width: 100%">
                <el-option label="处理中" value="processing" />
                <el-option label="客户接受" value="accepted" />
                <el-option label="客户拒绝" value="rejected" />
                <el-option label="已完成" value="completed" />
              </el-select>
            </el-form-item>
            <el-form-item label="赔付方式">
              <el-select v-model="handleForm.compensationType" style="width: 100%">
                <el-option label="退款" value="refund" />
                <el-option label="重洗" value="re_wash" />
                <el-option label="折扣" value="discount" />
                <el-option label="现金赔付" value="cash" />
              </el-select>
            </el-form-item>
            <el-form-item label="赔付金额">
              <el-input-number v-model="handleForm.amount" :min="0" :precision="2" />
            </el-form-item>
            <el-form-item label="赔付方案">
              <el-input
                v-model="handleForm.plan"
                type="textarea"
                :rows="2"
                placeholder="请描述具体赔付方案"
              />
            </el-form-item>
            <el-form-item label="客户反馈">
              <el-input
                v-model="handleForm.customerFeedback"
                type="textarea"
                :rows="2"
                placeholder="客户反馈意见"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleCompensation" :loading="handling">
                <el-icon><Check /></el-icon> 提交处理
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Tickets /></el-icon> 投诉处理列表
              </span>
              <el-radio-group v-model="activeTab" size="small" @change="loadComps">
                <el-radio-button label="pending">待处理</el-radio-button>
                <el-radio-button label="processing">处理中</el-radio-button>
                <el-radio-button label="all">全部</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <el-table :data="compList" v-loading="compLoading" stripe @row-click="selectComp">
            <el-table-column label="投诉类型" width="100">
              <template #default="{ row }">{{ row.complaintType || '-' }}</template>
            </el-table-column>
            <el-table-column label="赔付依据" width="120">
              <template #default="{ row }">{{ row.basisName }}</template>
            </el-table-column>
            <el-table-column label="关联订单" width="140">
              <template #default="{ row }">{{ row.clothing?.orderNo || '-' }}</template>
            </el-table-column>
            <el-table-column label="问题描述" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">{{ row.description }}</template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="CompStatusMap[row.status]?.type || 'info'" size="small">
                  {{ CompStatusMap[row.status]?.label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="赔付金额" width="100">
              <template #default="{ row }">¥{{ row.amount || 0 }}</template>
            </el-table-column>
            <el-table-column label="处理人" width="100">
              <template #default="{ row }">{{ row.handledBy || '-' }}</template>
            </el-table-column>
            <el-table-column label="创建时间" width="160">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click.stop="viewClothing(row.clothingId)">查看档案</el-button>
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
import { clothingApi, compensationApi } from '@/api'
import type { Clothing, Compensation, CompensationStatus } from '@/types'
import { CompStatusMap } from '@/types'
import { ElMessage } from 'element-plus'

const router = useRouter()
const submitting = ref(false)
const handling = ref(false)
const compLoading = ref(false)
const clothingOptions = ref<Clothing[]>([])
const compList = ref<Compensation[]>([])
const activeTab = ref<CompensationStatus | 'all'>('pending')
const selectedComp = ref<Compensation | null>(null)

const compForm = reactive({
  clothingId: '',
  complaintType: '',
  basis: '',
  basisName: '',
  description: '',
  handledBy: '',
})

const handleForm = reactive({
  status: 'processing',
  compensationType: 'refund',
  amount: 0,
  plan: '',
  customerFeedback: '',
  handledBy: '',
})

const onComplaintTypeChange = (val: string) => {
  if (['color_fading', 'shrinkage', 'breakage', 'wrong_item', 'overdue'].includes(val)) {
    compForm.basis = val
  }
}

const submitComplaint = async () => {
  if (!compForm.clothingId || !compForm.basis) {
    ElMessage.warning('请填写完整信息')
    return
  }
  submitting.value = true
  try {
    await compensationApi.create(compForm)
    ElMessage.success('投诉已发起')
    Object.assign(compForm, { clothingId: '', complaintType: '', basis: '', description: '' })
    loadComps()
  } catch (e: any) {
    ElMessage.error(e.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

const selectComp = (row: Compensation) => {
  selectedComp.value = row
  Object.assign(handleForm, {
    status: row.status === 'pending' ? 'processing' : row.status,
    compensationType: row.compensationType || 'refund',
    amount: row.amount || 0,
    plan: row.plan || '',
    customerFeedback: row.customerFeedback || '',
    handledBy: row.handledBy || compForm.handledBy,
  })
}

const handleCompensation = async () => {
  if (!selectedComp.value) return
  handling.value = true
  try {
    await compensationApi.handle(selectedComp.value.id, handleForm)
    ElMessage.success('处理已提交')
    selectedComp.value = null
    loadComps()
  } catch (e: any) {
    ElMessage.error(e.message || '处理失败')
  } finally {
    handling.value = false
  }
}

const loadClothingOptions = async () => {
  try {
    const res = await clothingApi.list()
    clothingOptions.value = res.data
  } catch (e) {}
}

const loadComps = async () => {
  compLoading.value = true
  try {
    const res = await compensationApi.list()
    let data = res.data
    if (activeTab.value !== 'all') {
      data = data.filter((c: Compensation) => c.status === activeTab.value)
    }
    compList.value = data
  } catch (e) {
    console.error(e)
  } finally {
    compLoading.value = false
  }
}

const viewClothing = (id: string) => {
  if (id) router.push(`/detail/${id}`)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadClothingOptions()
  loadComps()
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

:deep(.el-table__row) {
  cursor: pointer;
}
</style>
