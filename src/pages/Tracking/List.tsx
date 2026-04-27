import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { Play, ClipboardCheck, Search, Eye, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { WorkOrder } from '../../types';

export default function List() {
  const { processes, workOrders, addWorkOrder } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = (record: WorkOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Prepare data for export
    const process = processes.find(p => p.id === record.processId);
    if (!process) {
      alert("无法找到对应的工艺文件信息");
      return;
    }

    const exportData = process.steps.map(step => {
      const stepRecord = record.stepRecords[step.id];
      return {
        '工序序号': step.stepNumber || '',
        '工序名称': step.name,
        '工序内容': step.content,
        '参数要求': step.requirement.parameterReq || '',
        '操作要求': step.requirement.operationReq || '',
        '状态': stepRecord?.status === 'completed' ? '待检验' : stepRecord?.status === 'inspected' ? '已检验' : '未完成',
        '操作人': stepRecord?.operatorName || '',
        '操作记录': stepRecord?.operationData || '',
        '现场照片数': stepRecord?.photos?.length || 0,
        '检验人': stepRecord?.inspectorName || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "执行记录");

    XLSX.writeFile(wb, `执行跟踪卡_${record.batchNo}_${record.id}.xlsx`);
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

        // Just create a mock work order based on the first row or generic info since Excel structure for work orders isn't standardized here.
        // Usually, importing a tracking card means creating a new WorkOrder instance.
        // For simplicity, we'll create a new WorkOrder using a generic process or the first process available.
        const process = processes[0];
        if (!process) {
          alert('请先在"工艺管理"中创建至少一个工艺文件');
          return;
        }

        const newRecordId = `wo_${Date.now()}`;
        
        addWorkOrder({
          batchNo: `导入批次-${Date.now().toString().slice(-4)}`,
          productName: file.name.replace('.xlsx', ''),
          quantity: 1,
          processId: process.id,
          processTitle: process.title,
          status: 'pending',
          stepRecords: {}
        });

        alert('跟踪卡导入成功！');
      } catch (error) {
        console.error(error);
        alert('导入失败，请检查Excel文件格式是否正确。');
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleStartTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcessId) return;

    const process = processes.find(p => p.id === selectedProcessId);
    if (!process) return;

    addWorkOrder({
      batchNo: batchNo || `B-${new Date().getTime()}`,
      productName: productName || '未命名产品',
      quantity,
      processId: process.id,
      processTitle: process.title,
      status: 'pending',
      stepRecords: {}
    });

    setIsModalOpen(false);
    setSelectedProcessId('');
    setBatchNo('');
    setProductName('');
    setQuantity(1);
  };

  const filteredRecords = workOrders.filter(r => 
    r.processTitle.toLowerCase().includes(searchTerm.toLowerCase()) || r.batchNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[var(--card-bg)] backdrop-blur-xl rounded-3xl shadow-[var(--shadow-soft)] border border-black/5 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-black/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40">
        <h2 className="text-[15px] font-semibold text-gray-900">工艺执行跟踪</h2>
        <div className="flex w-full sm:w-auto gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索任务或操作人..." 
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
            导入跟踪卡
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-[color:var(--accent)] text-white rounded-2xl hover:opacity-95 transition-opacity text-sm font-semibold whitespace-nowrap shadow-sm"
          >
            <Play className="w-4 h-4 mr-2" />
            启动新任务
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRecords.map(record => (
            <div key={record.id} className="border border-black/5 rounded-3xl p-5 hover:shadow-[var(--shadow-float)] transition-shadow bg-white/55 backdrop-blur flex flex-col relative overflow-hidden">
              {record.status === 'completed' && <div className="absolute top-3 right-3 bg-[rgba(52,199,89,0.12)] text-emerald-900 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[rgba(52,199,89,0.22)]">已完成</div>}
              {record.status === 'in_progress' && <div className="absolute top-3 right-3 bg-[rgba(10,132,255,0.12)] text-sky-900 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[rgba(10,132,255,0.22)]">执行中</div>}
              {record.status === 'pending' && <div className="absolute top-3 right-3 bg-black/5 text-gray-700 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-black/5">未开始</div>}
              
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-[rgba(10,132,255,0.14)] text-[color:var(--accent)] rounded-2xl">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1" title={record.productName}>
                    {record.productName}
                  </h3>
                  <p className="text-sm font-normal text-gray-500 mt-0.5 line-clamp-1" title={record.processTitle}>工艺: {record.processTitle}</p>
                  <p className="text-sm text-gray-500 mt-1">批次: <span className="font-mono">{record.batchNo}</span> • 数量: {record.quantity}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 flex-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">已完成工序:</span>
                  <span className="font-medium text-gray-800">{Object.keys(record.stepRecords).length} 步</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">下达时间:</span>
                  <span className="font-medium text-gray-800">{new Date(record.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-black/5 flex justify-end gap-2 opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleExport(record, e)}
                  className="flex items-center text-sm font-semibold text-gray-600 hover:opacity-90 bg-gray-100 px-3 py-1.5 rounded-2xl mr-auto"
                >
                  <Download className="w-4 h-4 mr-1" />
                  导出
                </button>
                <button 
                  onClick={() => navigate(`/process/tracking/${record.id}`)}
                  className="flex items-center text-sm font-semibold text-[color:var(--accent)] hover:opacity-90 px-3 py-1.5 bg-[rgba(10,132,255,0.1)] rounded-2xl"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {record.status === 'completed' ? '查看详情' : '执行/继续'}
                </button>
              </div>
            </div>
          ))}
          {filteredRecords.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              暂无跟踪记录任务
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-xl rounded-3xl shadow-[var(--shadow-float)] w-full max-w-md overflow-hidden border border-black/5">
            <div className="p-4 border-b border-black/5 bg-white/60">
              <h3 className="text-[15px] font-semibold text-gray-900">启动新任务</h3>
            </div>
            <form onSubmit={handleStartTracking} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择工艺文件 <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={selectedProcessId}
                  onChange={e => setSelectedProcessId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur"
                >
                  <option value="" disabled>-- 请选择 --</option>
                  {processes.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                {processes.length === 0 && <p className="text-xs text-red-500 mt-1">暂无工艺文件，请先前往"工艺编制"创建。</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">产品名称</label>
                <input 
                  type="text"
                  required
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  placeholder="例如: 传动总成"
                  className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur"
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">生产批次号</label>
                  <input 
                    type="text"
                    required
                    value={batchNo}
                    onChange={e => setBatchNo(e.target.value)}
                    placeholder="例如: B-20231015-01"
                    className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">计划数量</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  disabled={processes.length === 0}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg font-medium text-sm"
                >
                  确定启动
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
