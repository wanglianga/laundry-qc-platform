<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><User /></el-icon> 顾客自助服务
          </span>
          <div class="search-box">
            <el-input v-model="searchPhone" placeholder="输入手机号查询订单" style="width: 280px">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button @click="searchOrders">查询</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table v-if="orders.length > 0" :data="orders" stripe>
        <el-table-column prop="orderNo" label="订单号" width="140" />
        <el-table-column label="衣物信息" min-width="200">
          <template #default="{ row }">
            <div>{{ row.category }} · {{ row.brand }}</div>
            <div class="text-muted">{{ row.color }} / {{ row.material }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="140">
          <template #default="{ row }">
            <div>
              <el-tag :type="StatusMap[row.status]?.type || 'info'">
                {{ StatusMap[row.status]?.label }}
              </el-tag>
              <div v-if="row.valueType === 'high'" class="mt5">
                <el-tag size="small" type="warning">
                  <el-icon><Star /></el-icon> 高价值
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="预估价格" width="100">
          <template #default="{ row }">¥{{ row.estimatedPrice || 0 }}</template>
        </el-table-column>
        <el-table-column label="送洗时间" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row.id)">查看进度</el-button>
            <template v-if="row.valueType === 'high' && row.needsReview">
              <el-tag type="warning" size="small" class="ml5">
                <el-icon><Clock /></el-icon> 待确认
              </el-tag>
            </template>
            <template v-else>
              <el-button v-if="row.status === 'ready'" type="success" link @click="confirmPickup(row)">确认取衣</el-button>
              <el-button v-if="row.status === 'completed' && !row.customerEvaluation" type="warning" link @click="showEvaluate(row)">去评价</el-button>
              <el-button type="danger" link @click="showComplaint(row)">投诉/赔付</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-else description="请输入手机号查询您的订单" />
    </el-card>

    <el-dialog v-model="pickupVisible" title="确认取衣" width="500px">
      <el-form :model="pickupForm" label-width="80px">
        <el-form-item label="取衣人">
          <el-input v-model="pickupForm.customerName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="评价星级">
          <el-rate v-model="pickupForm.rating" :max="5" />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input v-model="pickupForm.evaluation" type="textarea" :rows="3" placeholder="请输入您的评价" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pickupVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPickup">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="evaluateVisible" title="服务评价" width="500px">
      <el-form :model="evaluateForm" label-width="80px">
        <el-form-item label="评价星级">
          <el-rate v-model="evaluateForm.rating" :max="5" />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input v-model="evaluateForm.evaluation" type="textarea" :rows="3" placeholder="请输入您的评价" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="evaluateVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEvaluate">提交评价</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="complaintVisible" title="投诉与赔付" width="600px">
      <el-form :model="complaintForm" label-width="100px">
        <el-form-item label="投诉类型">
          <el-select v-model="complaintForm.complaintType" style="width: 100%">
            <el-option label="掉色" value="color_fading" />
            <el-option label="缩水" value="shrinkage" />
            <el-option label="破损" value="breakage" />
            <el-option label="错拿/错件" value="wrong_item" />
            <el-option label="逾期" value="overdue" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="赔付依据">
          <el-select v-model="complaintForm.basis" style="width: 100%">
            <el-option label="洗后新增损伤" value="new_damage" />
            <el-option label="错件" value="wrong_item" />
            <el-option label="逾期取衣" value="overdue" />
            <el-option label="掉色" value="color_fading" />
            <el-option label="缩水" value="shrinkage" />
            <el-option label="破损" value="breakage" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述">
          <el-input v-model="complaintForm.description" type="textarea" :rows="4" placeholder="请详细描述问题" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="complaintVisible = false">取消</el-button>
        <el-button type="danger" @click="submitComplaint">提交投诉</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { clothingApi, compensationApi } from '@/api'
import type { Clothing } from '@/types'
import { StatusMap } from '@/types'
import { ElMessage } from 'element-plus'
import { Star, Clock } from '@element-plus/icons-vue'

const router = useRouter()
const searchPhone = ref('')
const orders = ref<Clothing[]>([])
const pickupVisible = ref(false)
const evaluateVisible = ref(false)
const complaintVisible = ref(false)
const selectedOrder = ref<Clothing | null>(null)

const pickupForm = reactive({
  customerName: '',
  rating: 5,
  evaluation: '',
})

const evaluateForm = reactive({
  rating: 5,
  evaluation: '',
})

const complaintForm = reactive({
  complaintType: '',
  basis: '',
  description: '',
})

const searchOrders = async () => {
  if (!searchPhone.value) {
    ElMessage.warning('请输入手机号')
    return
  }
  try {
    const res = await clothingApi.list({ keyword: searchPhone.value })
    orders.value = res.data
  } catch (e) {
    ElMessage.error('查询失败')
  }
}

const viewDetail = (id: string) => {
  router.push(`/detail/${id}`)
}

const confirmPickup = (row: Clothing) => {
  selectedOrder.value = row
  pickupForm.customerName = row.customerName
  pickupVisible.value = true
}

const submitPickup = async () => {
  if (!selectedOrder.value) return
  try {
    await clothingApi.pickup(selectedOrder.value.id, pickupForm)
    ElMessage.success('取衣确认成功，感谢您的评价！')
    pickupVisible.value = false
    searchOrders()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const showEvaluate = (row: Clothing) => {
  selectedOrder.value = row
  evaluateForm.rating = 5
  evaluateForm.evaluation = ''
  evaluateVisible.value = true
}

const submitEvaluate = async () => {
  if (!selectedOrder.value) return
  try {
    await clothingApi.pickup(selectedOrder.value.id, {
      customerName: selectedOrder.value.customerName,
      ...evaluateForm,
    })
    ElMessage.success('评价提交成功！')
    evaluateVisible.value = false
    searchOrders()
  } catch (e) {
    ElMessage.error('提交失败')
  }
}

const showComplaint = (row: Clothing) => {
  selectedOrder.value = row
  complaintForm.complaintType = ''
  complaintForm.basis = ''
  complaintForm.description = ''
  complaintVisible.value = true
}

const submitComplaint = async () => {
  if (!selectedOrder.value) return
  try {
    await compensationApi.create({
      clothingId: selectedOrder.value.id,
      ...complaintForm,
    })
    ElMessage.success('投诉已提交，我们会尽快处理！')
    complaintVisible.value = false
  } catch (e) {
    ElMessage.error('提交失败')
  }
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.card-title {
  font-size: 18px;
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

.mt5 {
  margin-top: 5px;
}

.ml5 {
  margin-left: 5px;
}
</style>
