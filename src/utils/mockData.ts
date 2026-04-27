import { useStore } from '../store';
import { useEffect } from 'react';

export const useInitMockData = () => {
  const { libraryItems, standardProcesses, processes, workOrders, users } = useStore();

  useEffect(() => {
    // Force inject super user if it's missing due to older local storage version
    if (!users.some(u => u.username === 'super')) {
      useStore.setState((state) => ({
        users: [
          { id: 'u0', username: 'super', name: '系统管理员', roles: ['admin'], password: '123' },
          ...state.users
        ]
      }));
    }

    if (libraryItems.length > 0 || standardProcesses.length > 0 || processes.length > 0 || workOrders.length > 0) return;

    const now = new Date().toISOString();

    const eq1 = { id: 'eq-1', name: '数控机床 CNC-1', parameters: '精度: 0.01mm, 功率: 15kW', quantity: 2, type: 'equipment' as const };
    const eq2 = { id: 'eq-2', name: '自动焊接机 WELD-X', parameters: '最大电流: 300A', quantity: 1, type: 'equipment' as const };
    const eq3 = { id: 'eq-3', name: '热处理炉 HT-10', parameters: '最高温度: 1200°C', quantity: 1, type: 'equipment' as const };
    const eq4 = { id: 'eq-4', name: '装配工位 AS-2', parameters: '工装夹具: 标准型', quantity: 3, type: 'equipment' as const };
    const tool1 = { id: 't-1', name: '游标卡尺', parameters: '量程: 0-150mm, 精度: 0.02mm', quantity: 10, type: 'tool' as const };
    const tool2 = { id: 't-2', name: '扭力扳手', parameters: '量程: 10-100Nm', quantity: 5, type: 'tool' as const };
    const tool3 = { id: 't-3', name: '百分表', parameters: '精度: 0.01mm', quantity: 6, type: 'tool' as const };
    const cons1 = { id: 'c-1', name: '铝合金毛坯', parameters: '型号: 6061-T6, 尺寸: 100x100x50', quantity: 500, type: 'consumable' as const };
    const cons2 = { id: 'c-2', name: '焊丝', parameters: '直径: 1.2mm, 材质: ER4043', quantity: 50, type: 'consumable' as const };
    const cons3 = { id: 'c-3', name: '轴承 6204', parameters: '内径: 20mm, 外径: 47mm', quantity: 200, type: 'consumable' as const };
    const cons4 = { id: 'c-4', name: '螺纹锁固剂', parameters: '型号: 243, 强度: 中', quantity: 30, type: 'consumable' as const };

    useStore.setState(() => ({
      libraryItems: [eq1, eq2, eq3, eq4, tool1, tool2, tool3, cons1, cons2, cons3, cons4]
    }));

    const sp1 = {
      id: 'sp-1',
      name: '毛坯铣削粗加工',
      content: '将铝合金毛坯固定在机床工作台上，进行粗铣削，留出0.5mm的精加工余量。',
      requirement: { parameterReq: '主轴转速 3000rpm, 进给 500mm/min', operationReq: '切削液必须充分冷却', requiresPhoto: true },
      equipments: ['eq-1'],
      tools: [],
      consumables: ['c-1'],
      isStandard: true,
      isKeyProcess: true
    };
    const sp2 = {
      id: 'sp-2',
      name: '尺寸初步检验',
      content: '使用游标卡尺对粗加工后的零件长宽高进行测量，确认是否在公差范围内。',
      requirement: { parameterReq: '公差范围: +0.5mm ~ +0.8mm', operationReq: '测量三个基准面', requiresPhoto: false },
      equipments: [],
      tools: ['t-1'],
      consumables: [],
      isStandard: true
    };
    const sp3 = {
      id: 'sp-3',
      name: '热处理',
      content: '将零件装炉，按工艺曲线升温保温后随炉冷却，记录炉温曲线与批次号。',
      requirement: { parameterReq: '温度: 520°C±10°C, 保温: 2h', operationReq: '确保批次隔离，严禁混装', requiresPhoto: true },
      equipments: ['eq-3'],
      tools: [],
      consumables: [],
      isStandard: true,
      isKeyProcess: true
    };
    const sp4 = {
      id: 'sp-4',
      name: '装配扭矩确认',
      content: '按规定扭矩装配紧固件并点涂锁固剂，记录扭矩值与复核人。',
      requirement: { parameterReq: '扭矩: 35Nm±3Nm', operationReq: '锁固剂涂覆均匀', requiresPhoto: false },
      equipments: ['eq-4'],
      tools: ['t-2'],
      consumables: ['c-4'],
      isStandard: true,
      isKeyProcess: true
    };

    useStore.setState(() => ({
      standardProcesses: [sp1, sp2, sp3, sp4]
    }));

    const edgeStyle = { strokeWidth: 2, stroke: '#0a84ff' };
    const markerEnd = { type: 'arrowclosed', width: 20, height: 20, color: '#0a84ff' };

    const p1s1 = { ...sp1, id: 'p1-s1' };
    const p1s2 = { ...sp2, id: 'p1-s2' };
    const p1s3 = {
      id: 'p1-s3',
      name: '端盖焊接',
      content: '将法兰端盖与主体进行满焊，注意控制热变形。',
      requirement: { parameterReq: '焊接电流 120A, 电压 20V', operationReq: '焊缝均匀无气孔', requiresPhoto: true },
      equipments: ['eq-2'],
      tools: [],
      consumables: ['c-2'],
      isStandard: false,
      isKeyProcess: true
    };

    const proc1Nodes = [
      { id: p1s1.id, position: { x: 260, y: 80 }, data: { label: p1s1.name, step: p1s1 }, type: 'custom' },
      { id: p1s2.id, position: { x: 260, y: 280 }, data: { label: p1s2.name, step: p1s2 }, type: 'custom' },
      { id: p1s3.id, position: { x: 260, y: 480 }, data: { label: p1s3.name, step: p1s3 }, type: 'custom' }
    ];
    const proc1Edges = [
      { id: 'p1-e1', source: p1s1.id, target: p1s2.id, type: 'smoothstep', markerEnd, style: edgeStyle },
      { id: 'p1-e2', source: p1s2.id, target: p1s3.id, type: 'smoothstep', markerEnd, style: edgeStyle }
    ];

    const proc2s1 = { ...sp1, id: 'p2-s1', name: '壳体加工' };
    const proc2s2 = { ...sp1, id: 'p2-s2', name: '轴加工', isKeyProcess: false };
    const proc2s3 = { ...sp3, id: 'p2-s3' };
    const proc2s4 = {
      id: 'p2-s4',
      name: '同轴度检测',
      content: '使用百分表检测同轴度并记录，超差需返工。',
      requirement: { parameterReq: '同轴度 ≤ 0.03mm', operationReq: '测量三处并拍照记录读数', requiresPhoto: true },
      equipments: [],
      tools: ['t-3'],
      consumables: [],
      isStandard: false,
      isKeyProcess: true
    };
    const proc2s5 = { ...sp4, id: 'p2-s5', name: '总成装配扭矩确认' };
    const proc2s6 = {
      id: 'p2-s6',
      name: '最终检验',
      content: '对总成外观、尺寸、标识进行全检并签字归档。',
      requirement: { parameterReq: '外观无划伤、无毛刺', operationReq: '关键尺寸抽检 3 点', requiresPhoto: false },
      equipments: [],
      tools: ['t-1'],
      consumables: [],
      isStandard: false,
      isKeyProcess: true
    };

    const proc2Nodes = [
      { id: proc2s1.id, position: { x: 120, y: 80 }, data: { label: proc2s1.name, step: proc2s1 }, type: 'custom' },
      { id: proc2s2.id, position: { x: 420, y: 80 }, data: { label: proc2s2.name, step: proc2s2 }, type: 'custom' },
      { id: proc2s3.id, position: { x: 120, y: 280 }, data: { label: proc2s3.name, step: proc2s3 }, type: 'custom' },
      { id: proc2s4.id, position: { x: 420, y: 280 }, data: { label: proc2s4.name, step: proc2s4 }, type: 'custom' },
      { id: proc2s5.id, position: { x: 270, y: 500 }, data: { label: proc2s5.name, step: proc2s5 }, type: 'custom' },
      { id: proc2s6.id, position: { x: 270, y: 700 }, data: { label: proc2s6.name, step: proc2s6 }, type: 'custom' }
    ];
    const proc2Edges = [
      { id: 'p2-e1', source: proc2s1.id, target: proc2s3.id, type: 'smoothstep', markerEnd, style: edgeStyle },
      { id: 'p2-e2', source: proc2s2.id, target: proc2s4.id, type: 'smoothstep', markerEnd, style: edgeStyle },
      { id: 'p2-e3', source: proc2s3.id, target: proc2s5.id, type: 'smoothstep', markerEnd, style: edgeStyle },
      { id: 'p2-e4', source: proc2s4.id, target: proc2s5.id, type: 'smoothstep', markerEnd, style: edgeStyle },
      { id: 'p2-e5', source: proc2s5.id, target: proc2s6.id, type: 'smoothstep', markerEnd, style: edgeStyle }
    ];

    const proc3s1 = {
      id: 'p3-s1',
      name: '来料检验',
      content: '核对来料批次号与检验报告，外观检查并抽检关键尺寸。',
      requirement: { parameterReq: '批次号必须一致', operationReq: '抽检 5 件并记录', requiresPhoto: true },
      equipments: [],
      tools: ['t-1'],
      consumables: ['c-3'],
      isStandard: false,
      isKeyProcess: true
    };
    const proc3s2 = { ...sp4, id: 'p3-s2' };
    const proc3s3 = {
      id: 'p3-s3',
      name: '包装与标识',
      content: '按规范包装并贴标，包含工单号、批次号、检验人签字。',
      requirement: { parameterReq: '标签字段齐全', operationReq: '扫码核对信息', requiresPhoto: false },
      equipments: [],
      tools: [],
      consumables: [],
      isStandard: false
    };
    const proc3Nodes = [
      { id: proc3s1.id, position: { x: 260, y: 80 }, data: { label: proc3s1.name, step: proc3s1 }, type: 'custom' },
      { id: proc3s2.id, position: { x: 260, y: 280 }, data: { label: proc3s2.name, step: proc3s2 }, type: 'custom' },
      { id: proc3s3.id, position: { x: 260, y: 480 }, data: { label: proc3s3.name, step: proc3s3 }, type: 'custom' }
    ];
    const proc3Edges = [
      { id: 'p3-e1', source: proc3s1.id, target: proc3s2.id, type: 'smoothstep', markerEnd, style: edgeStyle },
      { id: 'p3-e2', source: proc3s2.id, target: proc3s3.id, type: 'smoothstep', markerEnd, style: edgeStyle }
    ];

    const process1 = { id: 'proc-1', title: '铝合金箱体加工及焊接工艺', description: '适用于型号 BX-2000 的铝合金箱体标准生产流程。', createdAt: now, updatedAt: now, steps: [p1s1, p1s2, p1s3], flowNodes: proc1Nodes, flowEdges: proc1Edges };
    const process2 = { id: 'proc-2', title: '传动总成加工装配工艺（含并行分支）', description: '壳体与轴并行加工 → 热处理/检测 → 汇聚装配 → 最终检验。', createdAt: now, updatedAt: now, steps: [proc2s1, proc2s2, proc2s3, proc2s4, proc2s5, proc2s6], flowNodes: proc2Nodes, flowEdges: proc2Edges };
    const process3 = { id: 'proc-3', title: '来料检验与装配包装工艺', description: '强调批次与追溯的快速流程。', createdAt: now, updatedAt: now, steps: [proc3s1, proc3s2, proc3s3], flowNodes: proc3Nodes, flowEdges: proc3Edges };

    const wo1 = {
      id: 'WO-20260424-001',
      batchNo: 'B-260424-A',
      productName: '传动总成',
      quantity: 50,
      processId: 'proc-2',
      processTitle: process2.title,
      createdAt: now,
      status: 'in_progress' as const,
      stepRecords: {
        [proc2s1.id]: { stepId: proc2s1.id, operationData: '粗加工完成，余量 0.5mm', photos: [], operatorName: '张三', operatorSignature: null, status: 'completed' as const },
        [proc2s2.id]: { stepId: proc2s2.id, operationData: '轴加工完成', photos: [], operatorName: '李四', operatorSignature: null, status: 'completed' as const },
        [proc2s3.id]: { stepId: proc2s3.id, operationData: '热处理批次 HT2026-04-24-01', photos: [], operatorName: '王五', operatorSignature: null, status: 'inspected' as const, inspectorName: '赵六', inspectorSignature: null }
      }
    };

    const wo2 = {
      id: 'WO-20260424-002',
      batchNo: 'B-260424-B',
      productName: '铝合金箱体',
      quantity: 100,
      processId: 'proc-1',
      processTitle: process1.title,
      createdAt: now,
      status: 'completed' as const,
      stepRecords: {
        [p1s1.id]: { stepId: p1s1.id, operationData: '主轴 3000rpm，进给 480mm/min', photos: [], operatorName: '张三', operatorSignature: null, status: 'inspected' as const, inspectorName: '赵六', inspectorSignature: null },
        [p1s2.id]: { stepId: p1s2.id, operationData: '长宽高符合公差', photos: [], operatorName: '李四', operatorSignature: null, status: 'inspected' as const, inspectorName: '赵六', inspectorSignature: null },
        [p1s3.id]: { stepId: p1s3.id, operationData: '焊缝外观合格', photos: [], operatorName: '王五', operatorSignature: null, status: 'completed' as const }
      }
    };

    const wo3 = {
      id: 'WO-20260424-003',
      batchNo: 'B-260424-C',
      productName: '标准件组装',
      quantity: 200,
      processId: 'proc-3',
      processTitle: process3.title,
      createdAt: now,
      status: 'pending' as const,
      stepRecords: {}
    };

    useStore.setState(() => ({
      processes: [process1, process2, process3],
      workOrders: [wo1, wo2, wo3]
    }));

  }, [libraryItems.length, standardProcesses.length, processes.length, workOrders.length]);
};
