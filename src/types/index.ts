export type Role = 'admin' | 'process_engineer' | 'operator' | 'inspector';

export interface User {
  id: string;
  username: string;
  password?: string; // Simplistic auth for demonstration
  name: string;
  roles: Role[]; // Allow multiple roles
  phone?: string;
  email?: string;
  signature?: string; // Base64 image
  stamp?: string; // Base64 image for inspector stamp
}

export type LibraryItemType = 'equipment' | 'tool' | 'consumable';

export interface LibraryItem {
  id: string;
  name: string;
  parameters: string;
  quantity: number;
  type: LibraryItemType;
}

export interface ProcessRequirement {
  parameterReq: string;
  operationReq: string;
  requiresPhoto: boolean;
}

export interface ProcessStep {
  id: string;
  stepNumber?: string; // Manually assigned sequence number
  name: string;
  content: string;
  requirement: ProcessRequirement;
  equipments: string[]; // LibraryItem IDs
  tools: string[];      // LibraryItem IDs
  consumables: string[];// LibraryItem IDs
  isStandard: boolean;
  isKeyProcess?: boolean;
  illustration?: string; // Base64 image
}

export interface ProcessDocument {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  steps: ProcessStep[];
  flowNodes: any[]; // React Flow nodes
  flowEdges: any[]; // React Flow edges
}

export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'aborted';

export interface StepRecord {
  stepId: string;
  operationData: string;
  photos: string[]; // Base64 strings
  operatorName?: string;
  operatorSignature?: string | null;
  inspectorName?: string;
  inspectorSignature?: string | null;
  status: 'pending' | 'completed' | 'inspected';
}

export interface WorkOrder {
  id: string; // e.g. WO-20231024-001
  batchNo: string;
  productName: string;
  quantity: number;
  processId: string; // Reference to ProcessDocument
  processTitle: string;
  createdAt: string;
  plannedStartDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: WorkOrderStatus;
  stepRecords: Record<string, StepRecord>;
}

export type NCRStatus = 'open' | 'investigating' | 'dispositioned' | 'closed';
export type NCRDisposition = 'rework' | 'scrap' | 'use_as_is' | 'return_to_vendor' | null;

// 现场问题处理单 (Non-Conformance Report / Issue Report)
export interface NonConformanceReport {
  id: string;
  workOrderId: string;
  stepId: string; // 发现问题的工序节点
  title: string; // 简短问题标题
  description: string; // 详细问题描述
  reportedBy: string; // 上报人
  reportedAt: string; // 上报时间
  photos: string[]; // 现场照片 base64
  status: NCRStatus;
  disposition: NCRDisposition; // 处置决定
  dispositionNotes?: string; // 处置说明
  resolvedAt?: string;
  resolvedBy?: string;
}
