export interface Clothing {
  id: string
  orderNo: string
  customerName: string
  customerPhone: string
  category: string
  brand: string
  color: string
  material: string
  pocketChecked: boolean
  preExistingDefects: string
  customerRequirements: string
  status: ClothingStatus
  valueType: ValueType
  inspectionStatus: InspectionStatus
  needsReview: boolean
  reviewResult: ReviewResult
  storeInspectionNote: string
  factoryInspectionNote: string
  reviewNote: string
  reviewedBy: string
  reviewCompletedAt: string
  storeId: string
  storeName: string
  batchNo: string
  washingProcess: string
  stainRemovalAttempt: string
  dryingMethod: string
  ironingResult: string
  newDamage: string
  estimatedPrice: number
  expectedPickupDate: string
  actualPickupDate: string
  isOverdue: boolean
  isWrongItem: boolean
  customerEvaluation: string
  rating: number
  flowNodes: FlowNode[]
  photos: PhotoEvidence[]
  compensations: Compensation[]
  createdAt: string
  updatedAt: string
}

export type ClothingStatus = 'received' | 'in_factory' | 'washing' | 'drying' | 'ironing' | 'returning' | 'ready' | 'picked_up' | 'complaint' | 'completed'
export type ValueType = 'normal' | 'high'
export type InspectionStatus = 'pending' | 'store_done' | 'factory_done' | 'reviewing' | 'reviewed' | 'completed'
export type ReviewResult = 'pending' | 'confirmed' | 'rejected'

export const StatusMap: Record<ClothingStatus, { label: string; type: string }> = {
  received: { label: '门店收衣', type: 'primary' },
  in_factory: { label: '工厂入库', type: 'warning' },
  washing: { label: '清洗中', type: 'warning' },
  drying: { label: '烘干中', type: 'warning' },
  ironing: { label: '整烫中', type: 'warning' },
  returning: { label: '返店运输', type: 'info' },
  ready: { label: '待取衣', type: 'success' },
  picked_up: { label: '已取衣', type: 'success' },
  complaint: { label: '投诉处理中', type: 'danger' },
  completed: { label: '已完成', type: 'success' },
}

export const ValueTypeMap: Record<ValueType, { label: string; type: string }> = {
  normal: { label: '普通衣物', type: 'info' },
  high: { label: '高价值衣物', type: 'warning' },
}

export const InspectionStatusMap: Record<InspectionStatus, { label: string; type: string }> = {
  pending: { label: '待质检', type: 'info' },
  store_done: { label: '门店已质检', type: 'primary' },
  factory_done: { label: '工厂已质检', type: 'primary' },
  reviewing: { label: '复核中', type: 'warning' },
  reviewed: { label: '已复核', type: 'success' },
  completed: { label: '质检完成', type: 'success' },
}

export const ReviewResultMap: Record<ReviewResult, { label: string; type: string }> = {
  pending: { label: '待复核', type: 'info' },
  confirmed: { label: '复核通过', type: 'success' },
  rejected: { label: '复核未通过', type: 'danger' },
}

export const HIGH_VALUE_BRANDS = ['爱马仕', 'Hermès', 'LV', '路易威登', 'Louis Vuitton', '香奈儿', 'Chanel', '古驰', 'Gucci', '迪奥', 'Dior', '普拉达', 'Prada', '范思哲', 'Versace', '巴宝莉', 'Burberry', '阿玛尼', 'Armani', '华伦天奴', 'Valentino']
export const HIGH_VALUE_CATEGORIES = ['皮草', '礼服', '婚纱', '高级定制', '裘皮', '貂皮']
export const HIGH_VALUE_MATERIALS = ['皮草', '真丝', '桑蚕丝', '羊绒', '貂皮', '裘皮']

export interface FlowNode {
  id: string
  nodeType: string
  nodeName: string
  operator: string
  operatorRole: string
  remark: string
  isNormal: boolean
  abnormalReason: string
  clothingId: string
  createdAt: string
}

export interface PhotoEvidence {
  id: string
  photoType: string
  photoTypeName: string
  filePath: string
  fileName: string
  description: string
  uploadedBy: string
  inspectionSource: 'store' | 'factory'
  clothingId: string
  createdAt: string
}

export interface Compensation {
  id: string
  basis: string
  basisName: string
  description: string
  complaintType: string
  status: CompensationStatus
  compensationType: string
  amount: number
  plan: string
  customerFeedback: string
  handledBy: string
  handledAt: string
  clothingId: string
  createdAt: string
  updatedAt: string
}

export type CompensationStatus = 'pending' | 'processing' | 'accepted' | 'rejected' | 'completed'

export const CompStatusMap: Record<CompensationStatus, { label: string; type: string }> = {
  pending: { label: '待处理', type: 'warning' },
  processing: { label: '处理中', type: 'primary' },
  accepted: { label: '已接受', type: 'success' },
  rejected: { label: '已拒绝', type: 'info' },
  completed: { label: '已完成', type: 'success' },
}

export const BasisMap: Record<string, string> = {
  pre_existing_defect: '预存瑕疵',
  new_damage: '洗后新增损伤',
  overdue: '顾客逾期取衣',
  wrong_item: '错件',
  color_fading: '掉色',
  shrinkage: '缩水',
  breakage: '破损',
}
