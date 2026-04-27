import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Plus, Search, Trash2, Edit2, Play, GitMerge, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ProcessDocument } from '../../types';

export default function ProcessList() {
  const { processes, removeProcess, addProcess, libraryItems } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProcesses = processes.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除该工艺文件吗？删除后不可恢复。')) {
      removeProcess(id);
    }
  };

  const handleExport = (process: ProcessDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Prepare data for export
    const stepsData = process.steps.map(step => ({
      '序号': step.stepNumber || '',
      '工序名称': step.name,
      '工序内容': step.content,
      '参数要求': step.requirement.parameterReq || '',
      '操作要求': step.requirement.operationReq || '',
      '需要拍照': step.requirement.requiresPhoto ? '是' : '否',
      '关键工序': step.isKeyProcess ? '是' : '否',
      '设备': step.equipments.map(id => libraryItems.find(i => i.id === id)?.name).filter(Boolean).join(', '),
      '工具': step.tools.map(id => libraryItems.find(i => i.id === id)?.name).filter(Boolean).join(', '),
      '耗材': step.consumables.map(id => libraryItems.find(i => i.id === id)?.name).filter(Boolean).join(', ')
    }));

    const ws = XLSX.utils.json_to_sheet(stepsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "工序列表");

    // Write file
    XLSX.writeFile(wb, `工艺文件_${process.id}_${process.title}.xlsx`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert('导入的Excel文件中没有数据');
          return;
        }

        const newProcessId = `proc_${Date.now()}`;
        const newSteps = data.map((row: any, index: number) => {
          const stepId = `step_${Date.now()}_${index}`;
          return {
            id: stepId,
            name: row['工序名称'] || `导入工序 ${index + 1}`,
            content: row['工序内容'] || '',
            requirement: {
              parameterReq: row['参数要求'] || undefined,
              operationReq: row['操作要求'] || undefined,
              requiresPhoto: row['需要拍照'] === '是'
            },
            equipments: [],
            tools: [],
            consumables: [],
            isStandard: false,
            isKeyProcess: row['关键工序'] === '是'
          };
        });

        // Generate simple linear flow nodes and edges for imported data
        const flowNodes = newSteps.map((step, index) => ({
          id: step.id,
          type: 'custom',
          position: { x: 100 + index * 260, y: 100 },
          data: { label: step.name, step }
        }));

        const flowEdges = [];
        for (let i = 0; i < newSteps.length - 1; i++) {
          flowEdges.push({
            id: `e_${newSteps[i].id}-${newSteps[i+1].id}`,
            source: newSteps[i].id,
            target: newSteps[i+1].id
          });
        }

        const newProcess: ProcessDocument = {
          id: newProcessId,
          title: file.name.replace('.xlsx', ''),
          description: '从Excel导入的工艺文件',
          steps: newSteps,
          flowNodes,
          flowEdges,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        addProcess(newProcess);
        alert('工艺文件导入成功！');
      } catch (error) {
        console.error(error);
        alert('导入失败，请检查Excel文件格式是否正确。');
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--card-bg)] backdrop-blur-xl rounded-3xl shadow-[var(--shadow-soft)] border border-black/5 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-black/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40">
        <h2 className="text-[15px] font-semibold text-gray-900">工艺文件管理</h2>
        <div className="flex w-full sm:w-auto gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索工艺名称或描述..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur"
            />
          </div>
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImport} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-semibold whitespace-nowrap shadow-sm"
          >
            <Upload className="w-4 h-4 mr-2 text-gray-500" />
            一键导入
          </button>
          <button 
            onClick={() => navigate('/process/editor')}
            className="flex items-center px-4 py-2.5 bg-[color:var(--accent)] text-white rounded-2xl hover:opacity-95 transition-opacity text-sm font-semibold whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建工艺
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProcesses.map(process => (
            <div 
              key={process.id} 
              className="border border-black/5 rounded-3xl p-5 hover:shadow-[var(--shadow-float)] transition-all bg-white/55 backdrop-blur flex flex-col cursor-pointer group"
              onClick={() => navigate(`/process/editor/${process.id}`)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-[rgba(10,132,255,0.14)] text-[color:var(--accent)] rounded-2xl shrink-0">
                  <GitMerge className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg truncate" title={process.title}>{process.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1 min-h-[40px]">{process.description || '无描述'}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 flex-1 mt-2">
                <div className="flex justify-between items-center bg-white/60 backdrop-blur p-3 rounded-2xl border border-black/5 shadow-sm">
                  <span className="text-gray-500">包含工序:</span>
                  <span className="font-bold text-gray-800 bg-black/5 px-2 py-0.5 rounded-xl">{process.steps.length} 步</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 px-1 pt-2">
                  <span>更新于 {new Date(process.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-black/5 flex justify-end gap-2">
                <button 
                  onClick={(e) => handleExport(process, e)}
                  className="flex items-center px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-2xl transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" /> 导出
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/process/editor/${process.id}`);
                  }}
                  className="flex items-center px-3 py-1.5 text-sm font-semibold text-[color:var(--accent)] hover:bg-[rgba(10,132,255,0.10)] rounded-2xl transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-1" /> 编辑
                </button>
                <button 
                  onClick={(e) => handleDelete(process.id, e)}
                  className="flex items-center px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> 删除
                </button>
              </div>
            </div>
          ))}
          {filteredProcesses.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <FileEdit className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-lg font-medium text-gray-600 mb-1">暂无工艺文件</p>
              <p className="text-sm text-gray-400 mb-4">点击"新建工艺"开始编制您的第一个工艺路线图</p>
              <button 
                onClick={() => navigate('/process/editor')}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" /> 新建工艺
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
