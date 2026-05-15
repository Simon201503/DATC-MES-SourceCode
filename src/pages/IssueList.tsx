import React, { useState } from 'react';
import { useStore } from '../store';
import { NonConformanceReport, NCRStatus, NCRDisposition } from '../types';
import { AlertTriangle, Search, Filter, CheckCircle, Clock, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function IssueList() {
  const { ncrs, updateNCR, currentUser, workOrders, processes } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<NCRStatus | 'all'>('all');
  const [selectedIssue, setSelectedIssue] = useState<NonConformanceReport | null>(null);
  
  // For disposition modal
  const [disposition, setDisposition] = useState<NCRDisposition>('use_as_is');
  const [dispositionNotes, setDispositionNotes] = useState('');

  if (!currentUser?.roles.includes('process_engineer') && !currentUser?.roles.includes('admin')) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-color)]">
        <div className="text-center bg-white/80 p-8 rounded-3xl border border-black/5 shadow-sm max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">权限不足</h2>
          <p className="text-gray-500">只有工艺工程师和系统管理员可以访问现场问题处理模块。</p>
        </div>
      </div>
    );
  }

  const filteredIssues = ncrs.filter(issue => {
    const matchSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        workOrders.find(w => w.id === issue.workOrderId)?.batchNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || issue.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusConfig = (status: NCRStatus) => {
    switch (status) {
      case 'open': return { label: '待处理', bg: 'bg-red-100', text: 'text-red-700', icon: <AlertTriangle className="w-4 h-4 mr-1" /> };
      case 'investigating': return { label: '调查中', bg: 'bg-orange-100', text: 'text-orange-700', icon: <Clock className="w-4 h-4 mr-1" /> };
      case 'dispositioned': return { label: '已出具方案', bg: 'bg-blue-100', text: 'text-blue-700', icon: <CheckCircle className="w-4 h-4 mr-1" /> };
      case 'closed': return { label: '已闭环', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle className="w-4 h-4 mr-1" /> };
    }
  };

  const getDispositionLabel = (disp: NCRDisposition) => {
    switch (disp) {
      case 'rework': return '返工返修';
      case 'scrap': return '直接报废';
      case 'use_as_is': return '让步接收 (照常使用)';
      case 'return_to_vendor': return '退回供应商';
      default: return '尚未处置';
    }
  };

  const handleOpenDisposition = (issue: NonConformanceReport) => {
    setSelectedIssue(issue);
    setDisposition(issue.disposition || 'use_as_is');
    setDispositionNotes(issue.dispositionNotes || '');
  };

  const handleSubmitDisposition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !currentUser) return;

    updateNCR(selectedIssue.id, {
      status: 'closed',
      disposition,
      dispositionNotes,
      resolvedAt: new Date().toISOString(),
      resolvedBy: currentUser.name
    });

    alert('现场问题处理方案已下发，流程闭环！');
    setSelectedIssue(null);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">现场问题处理 (NCR)</h2>
          <p className="text-sm text-gray-500 mt-1">处理并跟踪生产过程中的异常问题</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索问题描述或处理意见..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-auto pl-9 pr-8 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur shadow-sm appearance-none cursor-pointer"
            >
              <option value="all">所有状态</option>
              <option value="open">待处理</option>
              <option value="investigating">调查中</option>
              <option value="dispositioned">已出具方案</option>
              <option value="closed">已闭环</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredIssues.map(issue => {
            const statusConfig = getStatusConfig(issue.status);
            const wo = workOrders.find(w => w.id === issue.workOrderId);
            const process = processes.find(p => p.id === wo?.processId);
            const stepName = process?.steps.find(s => s.id === issue.stepId)?.name || '未知工序';

            return (
              <div key={issue.id} className="border border-black/5 rounded-3xl p-5 hover:shadow-[var(--shadow-float)] transition-shadow bg-white/55 backdrop-blur flex flex-col relative overflow-hidden">
                <div className={`absolute top-4 right-4 flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                  {statusConfig.icon} {statusConfig.label}
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-1 pr-24">{issue.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{issue.description}</p>

                <div className="bg-white/60 p-3 rounded-2xl border border-black/5 text-xs text-gray-600 mb-4 space-y-2">
                  <div className="flex justify-between"><span className="text-gray-400">关联工单批次:</span> <span className="font-semibold text-gray-800">{wo?.batchNo}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">发生工序节点:</span> <span className="font-medium text-gray-800">{stepName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">上报人 / 时间:</span> <span>{issue.reportedBy} @ {new Date(issue.reportedAt).toLocaleString()}</span></div>
                </div>

                {issue.status === 'closed' && (
                  <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 text-xs text-emerald-800 mb-4">
                    <span className="font-semibold block mb-1">处置方案: {getDispositionLabel(issue.disposition)}</span>
                    {issue.dispositionNotes && <span className="text-emerald-600 line-clamp-2">{issue.dispositionNotes}</span>}
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-black/5 flex justify-end gap-2">
                  <button 
                    onClick={() => navigate(`/process/tracking/${issue.workOrderId}`)}
                    className="flex items-center text-sm font-semibold text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-2xl transition-colors mr-auto"
                  >
                    前往工单查看
                  </button>
                  {issue.status !== 'closed' ? (
                    <button 
                      onClick={() => handleOpenDisposition(issue)}
                      className="flex items-center text-sm font-semibold text-[color:var(--accent)] hover:bg-[rgba(10,132,255,0.1)] px-4 py-1.5 rounded-2xl transition-colors bg-[rgba(10,132,255,0.05)]"
                    >
                      给出处理方案
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleOpenDisposition(issue)}
                      className="flex items-center text-sm font-semibold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-2xl transition-colors"
                    >
                      查看处理详情
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredIssues.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-500">
              <CheckCircle className="w-12 h-12 text-emerald-400 mb-4 opacity-50" />
              <p className="text-lg font-medium text-gray-600">现场一切正常</p>
              <p className="text-sm">没有找到符合条件的现场问题单</p>
            </div>
          )}
        </div>
      </div>

      {selectedIssue && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-xl rounded-3xl shadow-[var(--shadow-float)] w-full max-w-lg overflow-hidden border border-black/5 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-black/5 bg-white/60 flex justify-between items-center shrink-0">
              <h3 className="text-[15px] font-semibold text-gray-900 flex items-center">
                现场问题处理
              </h3>
              <button onClick={() => setSelectedIssue(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 text-lg mb-2">{selectedIssue.title}</h4>
                <p className="text-sm text-gray-600 bg-white/50 p-3 rounded-2xl border border-black/5">{selectedIssue.description}</p>
                
                {selectedIssue.photos && selectedIssue.photos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">现场照片证据：</p>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedIssue.photos.map((photo, i) => (
                        <img key={i} src={photo} alt={`问题照片 ${i+1}`} className="w-full aspect-square object-cover rounded-xl border border-black/5" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <form id="dispositionForm" onSubmit={handleSubmitDisposition} className="space-y-4 pt-6 border-t border-black/5">
                <h4 className="font-bold text-gray-900 mb-2">工程师处理方案</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">处置决定 <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={disposition}
                    onChange={e => setDisposition(e.target.value as NCRDisposition)}
                    disabled={selectedIssue.status === 'closed'}
                    className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur disabled:bg-gray-100 disabled:opacity-70"
                  >
                    <option value="use_as_is">让步接收 (轻微问题，照常使用)</option>
                    <option value="rework">返工返修 (处理后可继续流转)</option>
                    <option value="scrap">直接报废 (无法挽救)</option>
                    <option value="return_to_vendor">退回供应商 (来料不良)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">处理意见与指导说明 <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    rows={4}
                    value={dispositionNotes}
                    onChange={e => setDispositionNotes(e.target.value)}
                    disabled={selectedIssue.status === 'closed'}
                    placeholder="请输入具体的返工方法，或让步接收的依据理由..."
                    className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur disabled:bg-gray-100 disabled:opacity-70"
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-black/5 bg-white/60 flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setSelectedIssue(null)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm transition-colors"
              >
                {selectedIssue.status === 'closed' ? '关闭' : '暂不处理'}
              </button>
              {selectedIssue.status !== 'closed' && (
                <button 
                  type="submit"
                  form="dispositionForm"
                  className="px-5 py-2 text-white bg-[color:var(--accent)] hover:bg-blue-600 rounded-xl font-medium text-sm shadow-sm transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" /> 下发方案并闭环
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}