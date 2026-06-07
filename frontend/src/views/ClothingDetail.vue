<template>
  <div class="detail-page" v-loading="loading">
    <el-page-header @back="goBack" content="衣物详情" class="page-header" />

    <el-row :gutter="20" class="content">
      <el-col :span="16">
        <el-card shadow="never" class="mb20">
          <template #header>
            <div class="card-header">
              <span class="title">基础信息</span>
              <div class="header-tags">
                <el-tag v-if="detail?.valueType === 'high'" type="warning" size="large">
                  <el-icon><Star /></el-icon> 高价值衣物
                </el-tag>
                <el-tag v-if="detail?.needsReview" type="danger" size="large">
                  <el-icon><Warning /></el-icon> 待复核
                </el-tag>
                <el-tag :type="StatusMap[detail?.status]?.type || 'info'" size="large">
                  {{ StatusMap[detail?.status]?.label }}
                </el-tag>
              </div>
            </div>
          </template>
          <el-descriptions :column="3" border v-if="detail">
            <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="顾客姓名">{{ detail.customerName }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ detail.customerPhone }}</el-descriptions-item>
            <el-descriptions-item label="品类">{{ detail.category }}</el-descriptions-item>
            <el-descriptions-item label="品牌">{{ detail.brand }}</el-descriptions-item>
            <el-descriptions-item label="颜色">{{ detail.color }}</el-descriptions-item>
            <el-descriptions-item label="材质">{{ detail.material }}</el-descriptions-item>
            <el-descriptions-item v-if="detail.valueType === 'high'" label="价值类型">
              <el-tag type="warning">高价值</el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="detail.valueType === 'high'" label="质检状态">
              <el-tag :type="InspectionStatusMap[detail.inspectionStatus]?.type || 'info'">
                {{ InspectionStatusMap[detail.inspectionStatus]?.label }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="detail.valueType === 'high' && detail.reviewResult !== 'pending'" label="复核结果">
              <el-tag :type="ReviewResultMap[detail.reviewResult]?.type || 'info'">
                {{ ReviewResultMap[detail.reviewResult]?.label }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="口袋检查">
              <el-tag :type="detail.pocketChecked ? 'success' : 'danger'">
                {{ detail.pocketChecked ? '已检查' : '未检查' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="预估价格">¥{{ detail.estimatedPrice }}</el-descriptions-item>
            <el-descriptions-item label="预存瑕疵" :span="3">
              {{ detail.preExistingDefects || '无' }}
            </el-descriptions-item>
            <el-descriptions-item label="顾客要求" :span="3">
              {{ detail.customerRequirements || '无' }}
            </el-descriptions-item>
            <el-descriptions-item label="门店">{{ detail.storeName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="批次号">{{ detail.batchNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="送洗时间">{{ formatDate(detail.createdAt) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" class="mb20" v-if="detail?.valueType === 'high'">
          <template #header>
            <span class="title">
              <el-icon><View /></el-icon> 双重质检信息
            </span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="门店质检备注" :span="2">
              {{ detail.storeInspectionNote || '无' }}
            </el-descriptions-item>
            <el-descriptions-item label="工厂质检备注" :span="2">
              {{ detail.factoryInspectionNote || '无' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="detail.needsReview" label="复核状态" :span="2">
              <el-tag type="warning">复核中</el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="detail.reviewResult !== 'pending'" label="复核结果" :span="2">
              <el-tag :type="ReviewResultMap[detail.reviewResult]?.type || 'info'">
                {{ ReviewResultMap[detail.reviewResult]?.label }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="detail.reviewNote" label="复核备注" :span="2">
              {{ detail.reviewNote }}
            </el-descriptions-item>
            <el-descriptions-item v-if="detail.reviewedBy" label="复核人">
              {{ detail.reviewedBy }}
            </el-descriptions-item>
            <el-descriptions-item v-if="detail.reviewCompletedAt" label="复核时间">
              {{ formatDate(detail.reviewCompletedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" class="mb20" v-if="detail && (detail.washingProcess || detail.stainRemovalAttempt)">
          <template #header>
            <span class="title">
              <el-icon><Setting /></el-icon> 工厂处理记录
            </span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="清洗工艺">{{ detail.washingProcess || '-' }}</el-descriptions-item>
            <el-descriptions-item label="烘干方式">{{ detail.dryingMethod || '-' }}</el-descriptions-item>
            <el-descriptions-item label="去渍尝试" :span="2">{{ detail.stainRemovalAttempt || '-' }}</el-descriptions-item>
            <el-descriptions-item label="整烫结果" :span="2">{{ detail.ironingResult || '-' }}</el-descriptions-item>
            <el-descriptions-item label="洗后新增损伤" :span="2">
              <span :class="{ 'text-danger': detail.newDamage }">{{ detail.newDamage || '无' }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" class="mb20">
          <template #header>
            <span class="title">
              <el-icon><Picture /></el-icon> 照片证据链
            </span>
          </template>
          <div v-if="photoGroups.length > 0">
            <div v-for="group in photoGroups" :key="group.type" class="photo-group">
              <div class="group-title">
                <el-tag type="primary">{{ group.name }}</el-tag>
              </div>
              <div class="photo-list">
                <div v-for="photo in group.photos" :key="photo.id" class="photo-item">
                  <img :src="photo.filePath" :alt="photo.fileName" />
                  <div class="photo-info">
                    <div class="photo-desc">{{ photo.description || '-' }}</div>
                    <div class="photo-meta">
                      <span>{{ photo.uploadedBy || '系统' }}</span>
                      <span>{{ formatDate(photo.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无照片证据" :image-size="80" />
        </el-card>

        <el-card shadow="never" v-if="detail?.compensations?.length > 0">
          <template #header>
            <span class="title">
              <el-icon><Warning /></el-icon> 赔付记录
            </span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="comp in detail.compensations"
              :key="comp.id"
              :timestamp="formatDate(comp.createdAt)"
              placement="top"
              :type="comp.status === 'completed' ? 'success' : 'warning'"
            >
              <el-card shadow="never" class="comp-card">
                <div class="comp-header">
                  <el-tag type="danger">{{ comp.basisName }}</el-tag>
                  <el-tag :type="CompStatusMap[comp.status]?.type || 'info'">
                    {{ CompStatusMap[comp.status]?.label }}
                  </el-tag>
                </div>
                <div class="comp-body">
                  <p><strong>投诉类型：</strong>{{ comp.complaintType || '-' }}</p>
                  <p><strong>问题描述：</strong>{{ comp.description }}</p>
                  <p v-if="comp.plan"><strong>赔付方案：</strong>{{ comp.plan }}</p>
                  <p v-if="comp.amount > 0"><strong>赔付金额：</strong>¥{{ comp.amount }}</p>
                  <p v-if="comp.customerFeedback"><strong>客户反馈：</strong>{{ comp.customerFeedback }}</p>
                  <p class="comp-meta">
                    <span>处理人：{{ comp.handledBy || '-' }}</span>
                    <span v-if="comp.handledAt">处理时间：{{ formatDate(comp.handledAt) }}</span>
                  </p>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never" class="mb20">
          <template #header>
            <span class="title">
              <el-icon><Connection /></el-icon> 流转节点证据链
            </span>
          </template>
          <el-steps
            v-if="detail?.flowNodes?.length > 0"
            :active="detail.flowNodes.length"
            direction="vertical"
            finish-status="success"
          >
            <el-step
              v-for="(node, idx) in detail.flowNodes"
              :key="node.id"
              :title="node.nodeName"
              :description="nodeDesc(node)"
              :status="node.isNormal ? 'success' : 'error'"
            />
          </el-steps>
          <el-empty v-else description="暂无流转记录" :image-size="80" />
        </el-card>

        <el-card shadow="never" v-if="detail?.customerEvaluation">
          <template #header>
            <span class="title">
              <el-icon><Star /></el-icon> 顾客评价
            </span>
          </template>
          <div class="rating-box">
            <el-rate v-model="detail.rating" disabled />
            <span class="rating-score">{{ detail.rating }} 分</span>
          </div>
          <p class="evaluation-text">{{ detail.customerEvaluation }}</p>
          <p class="evaluation-meta">{{ formatDate(detail.actualPickupDate) }}</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clothingApi } from '@/api'
import type { Clothing, PhotoEvidence } from '@/types'
import { StatusMap, CompStatusMap, InspectionStatusMap, ReviewResultMap } from '@/types'
import { Star, Warning, View } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const detail = ref<Clothing | null>(null)

const photoGroups = computed(() => {
  if (!detail.value?.photos) return []
  const groups: any[] = []
  const typeMap: Record<string, string> = {
    pre_defect: '预存瑕疵照片',
    washing_before: '洗前照片',
    washing_after: '洗后照片',
    damage: '损伤照片',
    pickup: '取衣照片',
    compensation: '赔付照片',
    store_inspection: '门店质检照片',
    factory_inspection: '工厂质检照片',
  }
  
  const grouped: Record<string, PhotoEvidence[]> = {}
  detail.value.photos.forEach(p => {
    if (!grouped[p.photoType]) grouped[p.photoType] = []
    grouped[p.photoType].push(p)
  })
  
  Object.keys(grouped).forEach(type => {
    groups.push({
      type,
      name: typeMap[type] || type,
      photos: grouped[type],
    })
  })
  
  return groups
})

const nodeDesc = (node: any) => {
  const parts = []
  if (node.operator) parts.push(`操作人: ${node.operator}`)
  if (node.remark) parts.push(node.remark)
  if (!node.isNormal && node.abnormalReason) parts.push(`异常: ${node.abnormalReason}`)
  return parts.join(' | ')
}

const loadDetail = async () => {
  const id = route.params.id as string
  if (!id) return
  loading.value = true
  try {
    const res = await clothingApi.detail(id)
    detail.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.detail-page {
  max-width: 1500px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
  padding: 12px 20px;
  background: white;
  border-radius: 8px;
}

.content {
  .mb20 {
    margin-bottom: 20px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-tags {
  display: flex;
  gap: 8px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-danger {
  color: #f56c6c;
  font-weight: 500;
}

.photo-group {
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.group-title {
  margin-bottom: 12px;
}

.photo-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.photo-item {
  width: 180px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 130px;
    object-fit: cover;
  }
}

.photo-info {
  padding: 8px;
  font-size: 12px;
}

.photo-desc {
  color: #303133;
  margin-bottom: 4px;
}

.photo-meta {
  color: #909399;
  display: flex;
  justify-content: space-between;
}

.comp-card {
  background: #fef0f0;
}

.comp-header {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.comp-body {
  p {
    margin: 4px 0;
    font-size: 14px;
    line-height: 1.6;
  }
}

.comp-meta {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  display: flex;
  gap: 20px;
}

.rating-box {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.rating-score {
  font-size: 18px;
  font-weight: 600;
  color: #e6a23c;
}

.evaluation-text {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.evaluation-meta {
  font-size: 12px;
  color: #909399;
}
</style>
