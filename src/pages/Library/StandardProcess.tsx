import React, { useState } from 'react';
import { useStore } from '../../store';
import { ProcessStep, LibraryItem } from '../../types';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function StandardProcess() {
  const { standardProcesses, addStandardProcess, updateStandardProcess, removeStandardProcess, libraryItems } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState<Partial<ProcessStep>>({
    requirement: { parameterReq: '', operationReq: '', requiresPhoto: false },
    equipments: [],
    tools: [],
    consumables: []
  });

  const filteredProcesses = standardProcesses.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStep.name || !currentStep.content) return;

    if (currentStep.id) {
      updateStandardProcess(currentStep.id, currentStep as ProcessStep);
    } else {
      addStandardProcess(currentStep as ProcessStep);
    }
    setIsEditing(false);
  };

  const handleEdit = (step: ProcessStep) => {
    setCurrentStep({ ...step });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentStep({
      name: '',
      content: '',
      requirement: { parameterReq: '', operationReq: '', requiresPhoto: false },
      equipments: [],
      tools: [],
      consumables: []
    });
    setIsEditing(true);
  };

  const renderLibrarySelect = (type: 'equipment'|'tool'|'consumable', field: 'equipments'|'tools'|'consumables', label: string) => {
    const items = libraryItems.filter(i => i.type === type);
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
          {items.length === 0 ? <p className="text-gray-400 text-sm text-center py-2">暂无{label}</p> : null}
          {items.map(item => {
            const isSelected = currentStep[field]?.includes(item.id);
            return (
              <label key={item.id} className="flex items-center space-x-2 text-sm p-1 hover:bg-gray-50 rounded cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={(e) => {
                    const currentList = currentStep[field] || [];
                    const newList = e.target.checked 
                      ? [...currentList, item.id]
                      : currentList.filter(id => id !== item.id);
                    setCurrentStep({ ...currentStep, [field]: newList });
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>{item.name} <span className="text-gray-400">({item.parameters})</span></span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const getNames = (ids: string[]) => {
    return ids.map(id => libraryItems.find(i => i.id === id)?.name).filter(Boolean).join(', ') || '无';
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">标准工序库</h2>
          <p className="text-sm text-gray-500 mt-1">维护可复用的标准生产工序</p>
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索名称或内容..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur shadow-sm"
            />
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center px-4 py-2.5 bg-[color:var(--accent)] text-white rounded-2xl hover:opacity-95 transition-opacity text-sm font-semibold whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增工序
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
          {filteredProcesses.map(step => (
            <div key={step.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50 flex flex-col">
              <div className="flex justify-between items-start mb-3 border-b border-gray-200 pb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{step.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{step.content}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleEdit(step)} className="text-blue-600 hover:text-blue-800 p-1">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeStandardProcess(step.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 flex-1">
                <div>
                  <span className="font-medium text-gray-700">参数要求:</span> 
                  <span className="ml-1">{step.requirement.parameterReq || '无'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">操作要求:</span> 
                  <span className="ml-1">{step.requirement.operationReq || '无'}</span>
                </div>
                <div className="col-span-full">
                  <span className="font-medium text-gray-700">拍照要求:</span> 
                  <span className={step.requirement.requiresPhoto ? "ml-1 text-blue-600 font-medium" : "ml-1"}>
                    {step.requirement.requiresPhoto ? '是' : '否'}
                  </span>
                </div>
                <div className="col-span-full pt-2 border-t border-gray-200/60 mt-1">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-gray-400 block mb-0.5">设备</span>{getNames(step.equipments)}</div>
                    <div><span className="text-gray-400 block mb-0.5">工具</span>{getNames(step.tools)}</div>
                    <div><span className="text-gray-400 block mb-0.5">耗材</span>{getNames(step.consumables)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredProcesses.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              暂无标准工序
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold">{currentStep.id ? '编辑' : '新增'}标准工序</h3>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info & Requirements */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">基本信息</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">工序名称 <span className="text-red-500">*</span></label>
                    <input 
                      type="text" required
                      value={currentStep.name || ''}
                      onChange={e => setCurrentStep({...currentStep, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">工序内容 <span className="text-red-500">*</span></label>
                    <textarea 
                      required rows={3}
                      value={currentStep.content || ''}
                      onChange={e => setCurrentStep({...currentStep, content: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <h4 className="font-semibold text-gray-800 border-b pb-2 pt-4">工序要求</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">参数要求</label>
                    <input 
                      type="text" 
                      value={currentStep.requirement?.parameterReq || ''}
                      onChange={e => setCurrentStep({...currentStep, requirement: { ...currentStep.requirement!, parameterReq: e.target.value }})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">操作要求</label>
                    <input 
                      type="text" 
                      value={currentStep.requirement?.operationReq || ''}
                      onChange={e => setCurrentStep({...currentStep, requirement: { ...currentStep.requirement!, operationReq: e.target.value }})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex items-center pt-2">
                    <input 
                      type="checkbox" 
                      id="requiresPhoto"
                      checked={currentStep.requirement?.requiresPhoto || false}
                      onChange={e => setCurrentStep({...currentStep, requirement: { ...currentStep.requirement!, requiresPhoto: e.target.checked }})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="requiresPhoto" className="ml-2 block text-sm font-medium text-gray-700">
                      执行时需要拍摄照片记录
                    </label>
                  </div>
                </div>

                {/* Right Column - Resources Selection */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">资源配置</h4>
                  {renderLibrarySelect('equipment', 'equipments', '选择设备')}
                  {renderLibrarySelect('tool', 'tools', '选择工具')}
                  {renderLibrarySelect('consumable', 'consumables', '选择耗材')}
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium text-sm"
              >
                取消
              </button>
              <button 
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm"
              >
                保存工序
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
