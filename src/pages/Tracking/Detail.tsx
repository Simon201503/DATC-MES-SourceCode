import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { ChevronLeft, Camera, CheckCircle, Save, X, AlertTriangle, Lock, Unlock, ScanLine } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { ReactFlow, Background, Node, Controls, Panel, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { clsx } from 'clsx';
import { ProcessNode } from '../../components/ProcessNode';
import { getLayoutedElements } from '../../utils/layout';

const nodeTypes = {
  custom: ProcessNode,
};

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workOrders, processes, updateWorkOrder, libraryItems, ncrs, addNCR, currentUser } = useStore();
  
  const record = workOrders.find(r => r.id === id);
  const process = processes.find(p => p.id === record?.processId);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [operationData, setOperationData] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [operatorName, setOperatorName] = useState('');
  const operatorSigRef = useRef<any>(null);
  const inspectorSigRef = useRef<any>(null);
  const [inspectorName, setInspectorName] = useState('');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNcrModalOpen, setIsNcrModalOpen] = useState(false);
  const [ncrTitle, setNcrTitle] = useState('');
  const [ncrDescription, setNcrDescription] = useState('');
  const [ncrPhotos, setNcrPhotos] = useState<string[]>([]);
  const [ncrReporter, setNcrReporter] = useState('');

  const [isLocked, setIsLocked] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const lastRecordId = useRef(record?.id);
  const initialLayoutDone = useRef(false);

  // Load existing step data when changing step
  useEffect(() => {
    if (!record || !process) return;
    const step = process.steps[currentStepIndex];
    if (step) {
      const stepRecord = record.stepRecords[step.id];
      setOperationData(stepRecord?.operationData || '');
      setPhotos(stepRecord?.photos || []);
      setOperatorName(stepRecord?.operatorName || '');
      setInspectorName(stepRecord?.inspectorName || '');
    }
  }, [currentStepIndex, record, process]);

  if (!record || !process) {
    return <div className="p-6 text-center text-gray-500">找不到相关记录</div>;
  }

  const steps = process.steps;
  const currentStep = steps[currentStepIndex];
  
  // Is this the summary/sign page?
  const isSummaryPage = currentStepIndex >= steps.length;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Convert to base64 for local storage demo
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleScanOperatorSignature = () => {
    if (!currentUser?.roles.includes('operator') && !currentUser?.roles.includes('process_engineer') && !currentUser?.roles.includes('admin')) {
      alert('您的角色无法作为操作人签字！');
      return;
    }
    
    if (currentUser.signature) {
      setOperatorName(currentUser.name);
      
      const updatedRecords = {
        ...record.stepRecords,
        [currentStep?.id]: {
          stepId: currentStep?.id,
          operationData,
          photos,
          operatorName: currentUser.name,
          operatorSignature: currentUser.signature,
          status: 'completed' as const
        }
      };

      updateWorkOrder(record.id, {
        status: 'in_progress',
        stepRecords: updatedRecords
      });

      alert(`已成功录入 ${currentUser.name} 的电子签名！`);
    } else {
      alert('您还没有维护电子签名，请先到个人中心设置！');
    }
  };

  const handleScanInspectorSignature = () => {
    if (!currentUser?.roles.includes('inspector') && !currentUser?.roles.includes('process_engineer') && !currentUser?.roles.includes('admin')) {
      alert('您的角色无法进行检验签字！');
      return;
    }
    
    if (currentUser.stamp) {
      setInspectorName(currentUser.name);
      
      const updatedRecords = {
        ...record.stepRecords,
        [currentStep?.id]: {
          ...record.stepRecords[currentStep?.id],
          inspectorName: currentUser.name,
          inspectorSignature: currentUser.stamp,
          status: 'inspected' as const
        }
      };

      updateWorkOrder(record.id, {
        stepRecords: updatedRecords
      });

      alert(`已成功录入 ${currentUser.name} 的检测章，并完成检验！`);
    } else {
      alert('您还没有维护检测章，请先到个人中心设置！');
    }
  };

  const handleSaveStep = () => {
    if (!operatorName) {
      alert("请填写操作人员姓名！");
      return;
    }
    if (operatorSigRef.current?.isEmpty() && !record.stepRecords[currentStep?.id]?.operatorSignature) {
      alert('请完成操作人签名');
      return;
    }

    if (currentStep?.requirement?.requiresPhoto && photos.length === 0) {
      alert("该工序要求必须拍摄照片记录！");
      return;
    }

    const signature = operatorSigRef.current?.isEmpty() ? record.stepRecords[currentStep?.id]?.operatorSignature : operatorSigRef.current?.getTrimmedCanvas().toDataURL('image/png');

    const updatedRecords = {
      ...record.stepRecords,
      [currentStep?.id]: {
        stepId: currentStep?.id,
        operationData,
        photos,
        operatorName,
        operatorSignature: signature,
        status: 'completed' as const
      }
    };

    updateWorkOrder(record.id, {
      status: 'in_progress',
      stepRecords: updatedRecords
    });

    alert("当前工序执行记录保存成功！");
    setIsDrawerOpen(false);
  };

  const handleInspectorSignStep = () => {
    if (!inspectorName) {
      alert('请输入检验人姓名');
      return;
    }
    if (inspectorSigRef.current?.isEmpty()) {
      alert('请先完成检验人签名');
      return;
    }

    const signature = inspectorSigRef.current?.getTrimmedCanvas().toDataURL('image/png');
    
    const updatedRecords = {
      ...record.stepRecords,
      [currentStep?.id]: {
        ...record.stepRecords[currentStep?.id],
        inspectorName,
        inspectorSignature: signature,
        status: 'inspected' as const
      }
    };

    updateWorkOrder(record.id, {
      stepRecords: updatedRecords
    });
    
    alert("工序检验完成！");
  };

  const handleNcrPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setNcrPhotos(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNcrPhoto = (index: number) => {
    setNcrPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitNcr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ncrTitle || !ncrDescription || !ncrReporter) {
      alert('请填写完整的现场问题处理单信息！');
      return;
    }
    
    addNCR({
      workOrderId: record.id,
      stepId: currentStep.id,
      title: ncrTitle,
      description: ncrDescription,
      reportedBy: ncrReporter,
      reportedAt: new Date().toISOString(),
      photos: ncrPhotos,
      status: 'open',
      disposition: null
    });
    
    alert('现场问题处理单上报成功！');
    setIsNcrModalOpen(false);
    setNcrTitle('');
    setNcrDescription('');
    setNcrPhotos([]);
    setNcrReporter('');
  };

  const handleFinalSubmit = () => {
    if (Object.keys(record.stepRecords).length < steps.length) {
      alert("请确保所有工序都已完成记录！");
      return;
    }
    
    // Check if all steps are inspected
    const allInspected = Object.values(record.stepRecords).every(sr => sr.status === 'inspected');
    
    updateWorkOrder(record.id, {
      status: allInspected ? 'completed' : 'in_progress'
    });
    
    alert("工艺跟踪记录归档成功！");
    navigate('/process/tracking');
  };

  const getNames = (ids?: string[]) => {
    if (!ids) return '无';
    return ids.map(id => libraryItems.find(i => i.id === id)?.name).filter(Boolean).join(', ') || '无';
  };

  useEffect(() => {
    if (!process?.flowNodes || !process?.flowEdges) return;
    
    if (lastRecordId.current !== record?.id) {
      initialLayoutDone.current = false;
      lastRecordId.current = record?.id;
    }

    const mapped = process.flowNodes.map(node => {
      const stepId = node.data.step?.id;
      const isCompleted = record?.stepRecords?.[stepId];
      const isCurrent = stepId === currentStep?.id && !isSummaryPage;
      const stepNcrs = ncrs.filter(n => n.workOrderId === record?.id && n.stepId === stepId);
      const hasOpenNcr = stepNcrs.some(n => n.status !== 'closed');
      
      let status = undefined;
      if (isCompleted) {
        status = isCompleted.status;
      }

      return {
        ...node,
        type: 'custom',
        data: {
          ...node.data,
          status,
          isCurrent,
          hasOpenNcr,
        }
      };
    });

    if (!initialLayoutDone.current) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(mapped, process.flowEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      initialLayoutDone.current = true;
    } else {
      setNodes(nds => nds.map(n => {
        const updatedNode = mapped.find(m => m.id === n.id);
        if (updatedNode) {
          return { ...n, data: updatedNode.data };
        }
        return n;
      }));
    }
  }, [process?.flowNodes, process?.flowEdges, record?.stepRecords, currentStep?.id, isSummaryPage, ncrs, record?.id, setNodes, setEdges]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    const stepId = (node.data.step as any)?.id;
    const index = steps.findIndex(s => s.id === stepId);
    if (index !== -1) {
      setCurrentStepIndex(index);
      setIsDrawerOpen(true);
    }
  };

  const allInspected = Object.values(record.stepRecords).length === steps.length && 
                       Object.values(record.stepRecords).every(sr => sr.status === 'inspected');

  const currentStepNcrs = ncrs.filter(n => n.workOrderId === record.id && n.stepId === currentStep?.id);

  const handleResetStep = () => {
    if (window.confirm('确定要重填当前工序记录吗？所有照片、数据和签名都将被清除。')) {
      const updatedRecords = { ...record.stepRecords };
      delete updatedRecords[currentStep?.id!];
      
      updateWorkOrder(record.id, {
        stepRecords: updatedRecords
      });
      
      setOperationData('');
      setPhotos([]);
      setOperatorName('');
      setInspectorName('');
      operatorSigRef.current?.clear();
      inspectorSigRef.current?.clear();
      alert('已清除，请重新填报。');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[rgba(255,255,255,0.70)] backdrop-blur-xl md:rounded-3xl border border-black/5 overflow-hidden relative shadow-[var(--shadow-soft)]">
      <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between bg-[rgba(255,255,255,0.60)] shrink-0 z-10">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 text-gray-500 hover:text-gray-900">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-[15px] font-semibold text-gray-900 line-clamp-1">
              {record.productName} 
              <span className="text-gray-500 font-normal ml-2">批次: {record.batchNo}</span>
            </h2>
          </div>
        </div>
        {allInspected ? (
          <button 
            onClick={handleFinalSubmit}
            className="flex items-center px-4 py-2 bg-[color:var(--accent)] text-white rounded-2xl hover:opacity-95 transition-opacity text-sm font-semibold shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" /> 确认归档
          </button>
        ) : (
          <div className="text-sm font-semibold text-gray-700 bg-white/70 backdrop-blur px-3 py-1.5 rounded-2xl border border-black/5 shadow-sm">
            已完成: {Object.keys(record.stepRecords).length} / {steps.length}
          </div>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={!isLocked}
          nodesConnectable={false}
          elementsSelectable={!isLocked}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
          <Panel position="top-right">
            <button
              onClick={() => setIsLocked(!isLocked)}
              className="flex items-center px-3 py-1.5 bg-white/80 backdrop-blur border border-black/10 rounded-xl shadow-[var(--shadow-float)] hover:bg-white text-sm font-semibold text-gray-700 transition-colors m-2"
            >
              {isLocked ? (
                <><Lock className="w-4 h-4 mr-1.5 text-gray-500" /> 视图已锁定</>
              ) : (
                <><Unlock className="w-4 h-4 mr-1.5 text-[color:var(--accent)]" /> 允许拖拽</>
              )}
            </button>
          </Panel>
        </ReactFlow>
      </div>

      <div className={clsx(
        "absolute top-0 right-0 h-full w-full md:w-96 lg:w-[460px] bg-[rgba(255,255,255,0.82)] backdrop-blur-xl border-l border-black/5 shadow-[var(--shadow-float)] z-20 transform transition-transform duration-300 flex flex-col",
        isDrawerOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="px-4 py-3 border-b border-black/5 flex justify-between items-center bg-white/60">
          <h3 className="font-semibold text-gray-900 flex items-center min-w-0">
            <span className="flex items-center justify-center w-7 h-7 rounded-2xl bg-[rgba(10,132,255,0.14)] text-[color:var(--accent)] text-xs mr-2 shrink-0">
              {currentStepIndex + 1}
            </span>
            <span className="truncate">{currentStep?.name}</span>
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsNcrModalOpen(true)}
              className="flex items-center px-3 py-1.5 bg-[rgba(255,59,48,0.1)] hover:bg-[rgba(255,59,48,0.15)] text-red-600 rounded-xl text-xs font-semibold transition-colors border border-red-200"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              现场问题上报
            </button>
            <button onClick={() => setIsDrawerOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {currentStepNcrs.length > 0 && (
            <div className="bg-red-50/80 backdrop-blur rounded-2xl border border-red-100 p-4 space-y-3">
              <h4 className="text-red-800 text-sm font-bold flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5" /> 本工序现场问题单 ({currentStepNcrs.length})
              </h4>
              {currentStepNcrs.map(ncr => (
                <div key={ncr.id} className="bg-white/80 rounded-xl p-3 border border-red-100/50 shadow-sm text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">{ncr.title}</span>
                    <span className={clsx(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium border",
                      ncr.status === 'closed' ? "bg-gray-100 text-gray-600 border-gray-200" :
                      ncr.status === 'dispositioned' ? "bg-blue-100 text-blue-700 border-blue-200" :
                      "bg-red-100 text-red-700 border-red-200"
                    )}>
                      {ncr.status === 'closed' ? '已关闭' : ncr.status === 'dispositioned' ? '已出具方案' : '处理中'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs mb-2">{ncr.description}</p>
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>上报人: {ncr.reportedBy}</span>
                    <span>{new Date(ncr.reportedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-gray-800 text-sm leading-relaxed bg-white/60 backdrop-blur p-4 rounded-2xl border border-black/5 shadow-sm">
            {currentStep?.content}
            {currentStep?.illustration && (
              <div className="mt-4 pt-4 border-t border-black/5">
                <p className="text-xs text-gray-500 mb-2 font-medium">工序图示</p>
                <img src={currentStep.illustration} alt="Illustration" className="w-full max-h-48 object-contain rounded-xl bg-white/50 border border-black/5" />
              </div>
            )}
          </div>

              <div className="grid grid-cols-1 gap-4">
                {currentStep?.requirement?.parameterReq && (
                  <div className="bg-[rgba(255,159,10,0.10)] text-amber-950 p-4 rounded-2xl text-sm border border-[rgba(255,159,10,0.20)]">
                    <span className="font-semibold block mb-1">参数要求</span>
                    {currentStep.requirement.parameterReq}
                  </div>
                )}
                {currentStep?.requirement?.operationReq && (
                  <div className="bg-[rgba(10,132,255,0.08)] text-sky-950 p-4 rounded-2xl text-sm border border-[rgba(10,132,255,0.14)]">
                    <span className="font-semibold block mb-1">操作要求</span>
                    {currentStep.requirement.operationReq}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs p-4 border border-black/5 bg-white/70 backdrop-blur rounded-2xl shadow-sm">
                <div><span className="text-gray-400 block mb-1">设备</span><span className="font-medium">{getNames(currentStep?.equipments)}</span></div>
                <div><span className="text-gray-400 block mb-1">工具</span><span className="font-medium">{getNames(currentStep?.tools)}</span></div>
                <div><span className="text-gray-400 block mb-1">耗材</span><span className="font-medium">{getNames(currentStep?.consumables)}</span></div>
              </div>
              
              <div className="space-y-6 pt-4 border-t border-black/5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">操作人员姓名 <span className="text-red-500">*</span></label>
                  <input 
                      type="text"
                      value={operatorName}
                      onChange={e => setOperatorName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.25)] text-sm bg-white/70 backdrop-blur"
                      disabled={record.stepRecords[currentStep?.id]?.status === 'inspected'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">操作记录数据</label>
                    <textarea 
                      rows={3}
                      placeholder="输入实际测量参数或操作结果..."
                      value={operationData}
                      onChange={e => setOperationData(e.target.value)}
                      className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.25)] text-sm bg-white/70 backdrop-blur"
                      disabled={record.stepRecords[currentStep?.id]?.status === 'inspected'}
                    />
                  </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      现场照片 {currentStep?.requirement?.requiresPhoto && <span className="text-red-500 text-xs ml-1">(必填)</span>}
                    </label>
                    {record.stepRecords[currentStep?.id]?.status !== 'inspected' && (
                      <label className="cursor-pointer text-[color:var(--accent)] hover:opacity-90 flex items-center text-sm font-semibold bg-white/70 backdrop-blur px-3 py-1.5 rounded-2xl border border-black/5 shadow-sm">
                        <Camera className="w-4 h-4 mr-1" /> 拍照/上传
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    )}
                  </div>
                  {photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photo, i) => (
                        <div key={i} className="relative aspect-square rounded-2xl border border-black/5 overflow-hidden bg-white/60 shadow-sm">
                          <img src={photo} alt={`记录图 ${i+1}`} className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                            P-{currentStepIndex + 1}-{i + 1}
                          </div>
                          {record.stepRecords[currentStep?.id]?.status !== 'inspected' && (
                            <button 
                              onClick={() => removePhoto(i)}
                              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs backdrop-blur"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white/50 border border-dashed border-black/10 rounded-2xl text-gray-400 text-sm">
                      暂无照片
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">操作人签名 <span className="text-red-500">*</span></label>
                    {record.stepRecords[currentStep?.id]?.status !== 'inspected' && (
                      <button 
                        onClick={handleScanOperatorSignature}
                        className="text-xs font-semibold text-[color:var(--accent)] bg-[rgba(10,132,255,0.1)] px-2 py-1 rounded flex items-center hover:bg-[rgba(10,132,255,0.15)]"
                      >
                        <ScanLine className="w-3 h-3 mr-1" />
                        引入我的签名
                      </button>
                    )}
                  </div>
                  {record.stepRecords[currentStep?.id]?.operatorSignature ? (
                    <div className="border border-black/5 rounded-2xl p-3 bg-white/60 backdrop-blur flex justify-center shadow-sm">
                      <img src={record.stepRecords[currentStep?.id]?.operatorSignature} alt="操作人签名" className="max-h-24" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border border-black/10 rounded-2xl bg-white/60 backdrop-blur overflow-hidden shadow-sm">
                        <SignatureCanvas 
                          ref={operatorSigRef}
                          canvasProps={{ className: 'w-full h-24' }}
                        />
                      </div>
                      <button onClick={() => operatorSigRef.current?.clear()} className="text-xs font-medium text-gray-600 hover:text-gray-900">清除重签</button>
                    </div>
                  )}
                </div>

                {record.stepRecords[currentStep?.id]?.status === 'completed' && (
                  <div className="bg-[rgba(10,132,255,0.08)] p-4 rounded-3xl border border-[rgba(10,132,255,0.16)]">
                    <h4 className="font-semibold text-sky-950 mb-3 flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-[color:var(--accent)]" />工序检验确认</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">检验人姓名 <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={inspectorName}
                          onChange={e => setInspectorName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.25)] text-sm bg-white/70 backdrop-blur"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium text-blue-800">检验人签名 <span className="text-red-500">*</span></label>
                          <button 
                            onClick={handleScanInspectorSignature}
                            className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded flex items-center hover:bg-emerald-200"
                          >
                            <ScanLine className="w-3 h-3 mr-1" />
                            应用我的检测章
                          </button>
                        </div>
                        <div className="border border-black/10 rounded-2xl bg-white/70 backdrop-blur overflow-hidden shadow-sm">
                          <SignatureCanvas 
                            ref={inspectorSigRef}
                            canvasProps={{ className: 'w-full h-24' }}
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          <button onClick={() => inspectorSigRef.current?.clear()} className="text-xs text-blue-600 hover:text-blue-800">清除重签</button>
                          <button onClick={handleInspectorSignStep} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-2xl flex items-center shadow-sm hover:bg-emerald-700">
                            <Save className="w-3 h-3 mr-1" /> 确认检验
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {record.stepRecords[currentStep?.id]?.status === 'inspected' && (
                   <div className="bg-[rgba(52,199,89,0.10)] p-4 rounded-3xl border border-[rgba(52,199,89,0.20)] mt-6 flex items-center justify-between">
                     <div>
                       <p className="text-sm font-semibold text-emerald-950 mb-1 flex items-center">
                         <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" /> 已检验通过
                       </p>
                       <p className="text-xs text-green-700">检验人: {record.stepRecords[currentStep?.id]?.inspectorName}</p>
                     </div>
                     <div className="bg-white/70 backdrop-blur p-2 rounded-2xl border border-black/5 shadow-sm">
                        <img src={record.stepRecords[currentStep?.id]?.inspectorSignature} alt="检验签名" className="h-10" />
                     </div>
                   </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-white shrink-0 flex gap-2">
              {record.stepRecords[currentStep?.id]?.status === 'inspected' && (
                <button 
                  onClick={handleResetStep}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl shadow-sm hover:bg-gray-200 font-bold flex justify-center items-center shrink-0 transition-colors"
                  title="重新填报"
                >
                  重填
                </button>
              )}
              <button 
                onClick={handleSaveStep}
                disabled={record.stepRecords[currentStep?.id]?.status === 'inspected'}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 font-bold flex justify-center items-center disabled:bg-gray-400 transition-colors"
              >
                保存工序记录 <Save className="w-5 h-5 ml-2" />
              </button>
            </div>
        </div>

      {isNcrModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-xl rounded-3xl shadow-[var(--shadow-float)] w-full max-w-lg overflow-hidden border border-black/5">
            <div className="p-4 border-b border-black/5 bg-white/60 flex justify-between items-center">
              <h3 className="text-[15px] font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                上报现场问题单
              </h3>
              <button onClick={() => setIsNcrModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitNcr} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-red-50/50 p-3 rounded-xl border border-red-100 text-sm text-red-800 mb-2 flex items-start">
                <div className="mr-2 mt-0.5"><AlertTriangle className="w-4 h-4 text-red-500" /></div>
                <div>您正在为工单 <span className="font-bold">{record.batchNo}</span> 的工序 <span className="font-bold">[{currentStep?.name}]</span> 发起现场问题上报，该工序状态将被锁定直至问题处理完毕。</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">问题简述 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={ncrTitle}
                  onChange={e => setNcrTitle(e.target.value)}
                  placeholder="例如: 零件表面划伤 / 尺寸超差严重"
                  className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-200 text-sm bg-white/70 backdrop-blur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">详细描述 <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows={3}
                  value={ncrDescription}
                  onChange={e => setNcrDescription(e.target.value)}
                  placeholder="请详细描述问题现象、发现过程及初步判断..."
                  className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-200 text-sm bg-white/70 backdrop-blur"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">现场照片证据</label>
                  <label className="cursor-pointer text-[color:var(--accent)] hover:opacity-90 flex items-center text-sm font-semibold bg-white/70 backdrop-blur px-3 py-1.5 rounded-2xl border border-black/5 shadow-sm">
                    <Camera className="w-4 h-4 mr-1" /> 拍照/上传
                    <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleNcrPhotoUpload} />
                  </label>
                </div>
                {ncrPhotos.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {ncrPhotos.map((photo, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl border border-black/5 overflow-hidden bg-white/60 shadow-sm">
                        <img src={photo} alt={`问题照片 ${i+1}`} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeNcrPhoto(i)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] backdrop-blur"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-white/50 border border-dashed border-black/10 rounded-2xl text-gray-400 text-sm">
                    暂未上传照片
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">上报人姓名 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={ncrReporter}
                  onChange={e => setNcrReporter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-200 text-sm bg-white/70 backdrop-blur"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
                <button 
                  type="button"
                  onClick={() => setIsNcrModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium text-sm shadow-sm transition-colors flex items-center"
                >
                  提交问题单
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
