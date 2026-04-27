import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlow, Controls, Background, addEdge, useNodesState, useEdgesState, Connection, Edge, Node, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../../store';
import { ProcessStep, ProcessDocument } from '../../types';
import { Save, Download, Upload, Plus, X, Settings2, ArrowLeft, GitMerge, Image as ImageIcon } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProcessNode } from '../../components/ProcessNode';
import { getLayoutedElements } from '../../utils/layout';

const nodeTypes = {
  custom: ProcessNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addProcess, updateProcess, processes, libraryItems, standardProcesses } = useStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeData, setNodeData] = useState<Partial<ProcessStep>>({});
  
  const [libSearch, setLibSearch] = useState({ equipment: '', tool: '', consumable: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      const process = processes.find(p => p.id === id);
      if (process) {
        setTitle(process.title);
        setDescription(process.description);
        setNodes(process.flowNodes);
        setEdges(process.flowEdges);
      }
    }
  }, [id, processes, setNodes, setEdges]);

  // Convert old 'default' nodes to 'custom' nodes
  useEffect(() => {
    if (nodes.length > 0 && nodes.some(n => n.type !== 'custom')) {
      setNodes(nds => nds.map(n => ({ ...n, type: 'custom' })));
    }
  }, [nodes, setNodes]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#2563eb',
      },
      style: {
        strokeWidth: 2,
        stroke: '#2563eb',
      }
    } as Edge, eds)),
    [setEdges],
  );

  const addNode = () => {
    const newNodeId = Math.random().toString(36).substring(2, 9);
    
    // Calculate a position that doesn't overlap
    let newX = 100;
    let newY = 100;
    const paddingX = 260; // Node width + gap
    const paddingY = 160; // Node height + gap (increased to prevent vertical overlap)
    
    // Simple logic to find an empty spot: iterate through a grid
    const isOccupied = (x: number, y: number) => {
      return nodes.some(n => 
        Math.abs(n.position.x - x) < paddingX && 
        Math.abs(n.position.y - y) < paddingY
      );
    };

    while (isOccupied(newX, newY)) {
      newX += paddingX;
      if (newX > 800) {
        newX = 100;
        newY += paddingY;
      }
    }

    const newNode: Node = {
      id: newNodeId,
      position: { x: newX, y: newY },
      data: { label: `新建工序 ${nodes.length + 1}` },
      type: 'custom'
    };
    
    // Store process step data in node.data.step
    newNode.data.step = {
      id: newNodeId,
      name: newNode.data.label,
      content: '',
      requirement: { parameterReq: '', operationReq: '', requiresPhoto: false },
      equipments: [],
      tools: [],
      consumables: [],
      isStandard: false,
      isKeyProcess: false
    };
    
    setNodes((nds) => [...nds, newNode]);
  };

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setNodeData(node.data.step as ProcessStep);
  };

  const removeSelectedNode = () => {
    if (!selectedNode) return;
    if (window.confirm("确定删除该节点吗？")) {
      setNodes((nds) => nds.filter(n => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
      closeSidebar();
    }
  };

  const closeSidebar = () => {
    setSelectedNode(null);
  };

  const saveNodeData = () => {
    if (!selectedNode) return;
    
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          n.data = {
            ...n.data,
            label: nodeData.name || n.data.label,
            step: { ...nodeData }
          };
        }
        return n;
      })
    );
    closeSidebar();
  };

  const applyStandardProcess = (spId: string) => {
    const sp = standardProcesses.find(p => p.id === spId);
    if (!sp) return;
    
    setNodeData({
      ...nodeData,
      name: sp.name,
      content: sp.content,
      requirement: { ...sp.requirement },
      equipments: [...sp.equipments],
      tools: [...sp.tools],
      consumables: [...sp.consumables],
      isStandard: true
    });
  };

  const applyAutoLayout = () => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };

  const handleSaveProcess = () => {
    if (!title) {
      alert("请输入工艺文件名称");
      return;
    }

    if (nodes.length === 0) {
      alert("工艺流程图中没有工序节点，无法保存。");
      return;
    }
    
    // Topological Sort to determine process step order
    const inDegree: Record<string, number> = {};
    const adjList: Record<string, string[]> = {};
    
    nodes.forEach(n => {
      inDegree[n.id] = 0;
      adjList[n.id] = [];
    });
    
    edges.forEach(e => {
      if (inDegree[e.target] !== undefined) {
        inDegree[e.target]++;
        adjList[e.source].push(e.target);
      }
    });

    const queue: string[] = [];
    Object.keys(inDegree).forEach(id => {
      if (inDegree[id] === 0) queue.push(id);
    });

    const sortedNodeIds: string[] = [];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      sortedNodeIds.push(curr);
      adjList[curr].forEach(neighbor => {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      });
    }

    if (sortedNodeIds.length !== nodes.length) {
      alert("工艺流程中存在循环依赖(环)，请检查连线。");
      return;
    }

    const steps = sortedNodeIds.map(id => {
      const node = nodes.find(n => n.id === id);
      const step = node!.data.step as ProcessStep;
      return {
        ...step,
        isKeyProcess: step.isKeyProcess || false,
        stepNumber: step.stepNumber,
        illustration: step.illustration
      };
    });
    
    if (id) {
      updateProcess(id, {
        title,
        description,
        steps,
        flowNodes: nodes,
        flowEdges: edges
      });
      alert("工艺文件更新成功！");
    } else {
      addProcess({
        title,
        description,
        steps,
        flowNodes: nodes,
        flowEdges: edges
      });
      alert("工艺文件保存成功！");
    }
    navigate('/process/list');
  };

  const exportGraph = () => {
    const flow = { nodes, edges, title, description };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", (title || "process_map") + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importGraph = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const flow = JSON.parse(event.target?.result as string);
        if (flow.nodes) setNodes(flow.nodes);
        if (flow.edges) setEdges(flow.edges);
        if (flow.title) setTitle(flow.title);
        if (flow.description) setDescription(flow.description);
      } catch (err) {
        alert("文件格式错误");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-[var(--card-bg)] backdrop-blur-xl rounded-3xl shadow-[var(--shadow-soft)] border border-black/5 overflow-hidden">
      <div className="p-4 border-b border-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <button onClick={() => navigate('/process/list')} className="text-gray-500 hover:text-gray-800 p-1 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 space-y-1 min-w-[200px]">
            <input 
              type="text" 
              placeholder="工艺文件名称" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-[17px] font-semibold placeholder-gray-400 focus:outline-none focus:border-[color:var(--accent)] border-b border-transparent pb-1 bg-transparent"
            />
            <input 
              type="text" 
              placeholder="工艺描述 (可选)" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-[color:var(--accent)] border-b border-transparent pb-1 bg-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 shrink-0">
          <button onClick={applyAutoLayout} className="flex items-center px-3 py-2 bg-indigo-50/70 text-indigo-700 border border-indigo-200 backdrop-blur rounded-2xl hover:bg-indigo-100 text-sm font-semibold whitespace-nowrap shadow-sm transition-colors">
            <GitMerge className="w-4 h-4 mr-1" /> 自动排版
          </button>
          <button onClick={addNode} className="flex items-center px-3 py-2 bg-white/70 backdrop-blur border border-black/5 text-gray-800 rounded-2xl hover:bg-white text-sm font-semibold whitespace-nowrap shadow-sm">
            <Plus className="w-4 h-4 mr-1" /> 添加节点
          </button>
          <button onClick={exportGraph} className="flex items-center px-3 py-2 bg-white/70 backdrop-blur border border-black/5 text-gray-800 rounded-2xl hover:bg-white text-sm font-semibold whitespace-nowrap shadow-sm">
            <Download className="w-4 h-4 mr-1" /> 导出
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center px-3 py-2 bg-white/70 backdrop-blur border border-black/5 text-gray-800 rounded-2xl hover:bg-white text-sm font-semibold whitespace-nowrap shadow-sm">
            <Upload className="w-4 h-4 mr-1" /> 导入
          </button>
          <input type="file" ref={fileInputRef} onChange={importGraph} accept=".json" className="hidden" />
          <button onClick={handleSaveProcess} className="flex items-center px-4 py-2 bg-[color:var(--accent)] text-white rounded-2xl hover:opacity-95 transition-opacity text-sm font-semibold whitespace-nowrap shadow-sm">
            <Save className="w-4 h-4 mr-1" /> 发布工艺
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex">
        <div className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={closeSidebar}
            deleteKeyCode={["Backspace", "Delete"]}
            nodeTypes={nodeTypes}
            snapToGrid={true}
            snapGrid={[20, 20]}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        {selectedNode && (
          <div className="absolute top-0 right-0 w-80 h-full bg-[rgba(255,255,255,0.82)] backdrop-blur-xl border-l border-black/5 shadow-[var(--shadow-float)] z-10 flex flex-col animate-in slide-in-from-right-8">
            <div className="p-4 border-b border-black/5 flex justify-between items-center bg-white/60">
              <h3 className="font-semibold flex items-center text-gray-900"><Settings2 className="w-4 h-4 mr-2 text-[color:var(--accent)]" />节点工序编辑</h3>
              <button onClick={closeSidebar} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">引用标准工序</label>
                <select 
                  onChange={(e) => applyStandardProcess(e.target.value)}
                  className="w-full px-3 py-2 border border-black/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] bg-white/70 backdrop-blur"
                  defaultValue=""
                >
                  <option value="" disabled>-- 选择标准工序快速填充 --</option>
                  {standardProcesses.map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="w-24 shrink-0">
                  <label className="block text-xs font-medium text-gray-700 mb-1">序号</label>
                  <input 
                    type="text" 
                    value={nodeData.stepNumber || ''}
                    onChange={e => setNodeData({...nodeData, stepNumber: e.target.value})}
                    placeholder="例如: 10"
                    className="w-full px-3 py-2 border border-black/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] bg-white/70 backdrop-blur"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-gray-700">工序名称 <span className="text-red-500">*</span></label>
                    <label className="flex items-center space-x-1 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={nodeData.isKeyProcess || false}
                        onChange={e => setNodeData({...nodeData, isKeyProcess: e.target.checked})}
                        className="rounded text-yellow-500 focus:ring-yellow-500 w-3 h-3"
                      />
                      <span className="text-[10px] text-gray-500 group-hover:text-yellow-600 font-medium">标记为关键工序</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={nodeData.name || ''}
                    onChange={e => setNodeData({...nodeData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-black/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] bg-white/70 backdrop-blur"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">工序内容 <span className="text-red-500">*</span></label>
                <textarea 
                  rows={3}
                  value={nodeData.content || ''}
                  onChange={e => setNodeData({...nodeData, content: e.target.value})}
                  className="w-full px-3 py-2 border border-black/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] bg-white/70 backdrop-blur"
                />
              </div>

              <div className="bg-white/60 backdrop-blur p-4 rounded-3xl border border-black/5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-gray-800">工序要求</h4>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">参数要求</label>
                  <input 
                    type="text" 
                    value={nodeData.requirement?.parameterReq || ''}
                    onChange={e => setNodeData({...nodeData, requirement: {...nodeData.requirement!, parameterReq: e.target.value}})}
                    className="w-full px-3 py-2 border border-black/10 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] bg-white/70 backdrop-blur"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">操作要求</label>
                  <input 
                    type="text" 
                    value={nodeData.requirement?.operationReq || ''}
                    onChange={e => setNodeData({...nodeData, requirement: {...nodeData.requirement!, operationReq: e.target.value}})}
                    className="w-full px-3 py-2 border border-black/10 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] bg-white/70 backdrop-blur"
                  />
                </div>
                <label className="flex items-center space-x-2 text-xs text-gray-700">
                  <input 
                    type="checkbox" 
                    checked={nodeData.requirement?.requiresPhoto || false}
                    onChange={e => setNodeData({...nodeData, requirement: {...nodeData.requirement!, requiresPhoto: e.target.checked}})}
                    className="rounded text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
                  />
                  <span>执行时需拍摄照片</span>
                </label>
                <div className="pt-2 border-t border-black/5">
                  <label className="block text-[11px] text-gray-500 mb-1">工序图示 (可选)</label>
                  {nodeData.illustration ? (
                    <div className="relative group rounded-xl overflow-hidden border border-black/5 bg-white/50">
                      <img src={nodeData.illustration} alt="Illustration" className="w-full max-h-32 object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => setNodeData({...nodeData, illustration: undefined})}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600"
                        >
                          删除图示
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[color:var(--accent)] transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-5 h-5 text-gray-400 mb-1" />
                        <p className="text-[10px] text-gray-500">点击上传图示</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setNodeData({...nodeData, illustration: ev.target.result as string});
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                    </label>
                  )}
                </div>
              </div>

              {['equipment', 'tool', 'consumable'].map((type) => {
                const typeMap: Record<string, 'equipments' | 'tools' | 'consumables'> = {
                  'equipment': 'equipments',
                  'tool': 'tools',
                  'consumable': 'consumables'
                };
                const field = typeMap[type];
                const searchKeyword = libSearch[type as keyof typeof libSearch].toLowerCase();
                const items = libraryItems.filter(i => i.type === type && i.name.toLowerCase().includes(searchKeyword));
                
                return (
                  <div key={type}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-gray-700">
                        选择{type === 'equipment' ? '设备' : type === 'tool' ? '工具' : '耗材'}
                      </label>
                      <input 
                        type="text" 
                        placeholder="搜索..." 
                        value={libSearch[type as keyof typeof libSearch]}
                        onChange={e => setLibSearch(prev => ({...prev, [type]: e.target.value}))}
                        className="text-[10px] px-2 py-0.5 rounded border border-black/10 focus:outline-none focus:border-[color:var(--accent)] w-24 bg-white/70"
                      />
                    </div>
                    <div className="max-h-24 overflow-y-auto border border-black/5 rounded-2xl p-2 space-y-1 bg-white/50 backdrop-blur">
                      {items.map(item => (
                        <label key={item.id} className="flex items-center space-x-2 text-xs p-1.5 hover:bg-black/5 rounded-xl cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={nodeData[field]?.includes(item.id)}
                            onChange={(e) => {
                              const list = nodeData[field] || [];
                              const newList = e.target.checked ? [...list, item.id] : list.filter(id => id !== item.id);
                              setNodeData({...nodeData, [field]: newList});
                            }}
                            className="rounded text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
                          />
                          <span className="truncate">{item.name}</span>
                        </label>
                      ))}
                      {items.length === 0 && <p className="text-gray-400 text-xs p-1">无可用项</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-black/5 bg-white/60 flex justify-between gap-3">
              <button onClick={removeSelectedNode} className="px-4 py-2 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 text-sm font-semibold">
                删除节点
              </button>
              <button onClick={saveNodeData} className="px-4 py-2 bg-[color:var(--accent)] text-white rounded-2xl hover:opacity-95 transition-opacity text-sm font-semibold flex-1 shadow-sm">
                保存节点信息
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
