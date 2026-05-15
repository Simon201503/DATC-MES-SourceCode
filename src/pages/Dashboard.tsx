import React from 'react';
import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { FileEdit, ClipboardList, BookOpen, Box, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const { processes, workOrders, standardProcesses, libraryItems } = useStore();

  const completedWorkOrders = workOrders.filter(r => r.status === 'completed').length;
  const pendingWorkOrders = workOrders.filter(r => r.status === 'pending' || r.status === 'in_progress').length;

  const stats = [
    { label: '工艺文件总数', value: processes.length, icon: FileEdit, color: 'bg-blue-50 text-blue-600' },
    { label: '待处理/执行中工单', value: pendingWorkOrders, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
    { label: '已完成工单', value: completedWorkOrders, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: '标准工序数', value: standardProcesses.length, icon: BookOpen, color: 'bg-purple-50 text-purple-600' },
  ];

  const libraryOverview = [
    { label: '设备总数', value: libraryItems.filter(i => i.type === 'equipment').length, tone: 'bg-[rgba(10,132,255,0.14)] text-[color:var(--accent)]' },
    { label: '工具总数', value: libraryItems.filter(i => i.type === 'tool').length, tone: 'bg-[rgba(88,86,214,0.14)] text-[color:var(--accent-2)]' },
    { label: '耗材总数', value: libraryItems.filter(i => i.type === 'consumable').length, tone: 'bg-[rgba(52,199,89,0.14)] text-emerald-700' },
  ];

  const recentRecords = [...workOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-6">
      <div className="relative overflow-hidden bg-[rgba(255,255,255,0.72)] backdrop-blur-xl rounded-[28px] border border-black/5 p-4 sm:p-5 md:p-8 shadow-[var(--shadow-soft)]">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_0%,rgba(10,132,255,0.18),transparent_55%),radial-gradient(700px_450px_at_85%_15%,rgba(88,86,214,0.14),transparent_55%)]" />
        <div className="relative flex flex-col gap-4 sm:gap-5 md:flex-row md:items-end md:justify-between md:gap-6">
          <div>
            <div className="mb-3 inline-flex items-center px-3 py-1 rounded-full bg-white/70 border border-white/70 text-xs font-semibold text-[color:var(--accent)] shadow-sm">
              首页概览
            </div>
            <h1 className="mb-2 text-[28px] leading-tight sm:text-3xl md:text-4xl font-semibold text-gray-900">工艺管理系统工作台</h1>
            <p className="max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
              标准化工艺编制与执行跟踪闭环，覆盖拍照、签名、检验与归档，保持工艺、执行与基础库信息一致。
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:w-auto md:min-w-[320px]">
            <div className="rounded-2xl border border-white/70 bg-white/55 backdrop-blur p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500">当前工艺资产</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{processes.length + standardProcesses.length}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/55 backdrop-blur p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500">在制任务总量</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{pendingWorkOrders}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 md:gap-4 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="relative overflow-hidden bg-[var(--card-bg)] backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-black/5 shadow-[var(--shadow-soft)]"
          >
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-gray-500 text-sm font-medium relative">{stat.label}</p>
            <div className="mt-2 relative">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        <div className="lg:col-span-2 xl:col-span-3 bg-[var(--card-bg)] backdrop-blur-xl rounded-3xl border border-black/5 shadow-[var(--shadow-soft)] flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-black/5 flex items-center justify-between gap-3 bg-white/40">
            <h3 className="font-bold text-gray-800 flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-[color:var(--accent)]" /> 
              最近的执行跟踪
            </h3>
            <Link to="/process/tracking" className="text-sm text-[color:var(--accent)] hover:opacity-90 font-semibold">查看全部</Link>
          </div>
          <div className="p-4 sm:p-5 lg:flex-1 lg:overflow-auto">
            {recentRecords.length > 0 ? (
              <ul className="space-y-3">
                {recentRecords.map(record => (
                  <li key={record.id} className="p-4 md:p-5 rounded-2xl border border-black/5 bg-white/60 backdrop-blur hover:shadow-sm hover:bg-white/70 transition-all">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{record.processTitle}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                        record.status === 'completed' ? 'bg-[rgba(52,199,89,0.14)] text-emerald-800 border border-[rgba(52,199,89,0.22)]' :
                        record.status === 'in_progress' ? 'bg-[rgba(255,159,10,0.14)] text-amber-800 border border-[rgba(255,159,10,0.22)]' :
                        'bg-black/5 text-gray-700 border border-black/5'
                      }`}>
                        {record.status === 'completed' ? '已完成' : 
                         record.status === 'in_progress' ? '执行中' : '未开始'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:justify-between">
                      <span>已完成 {Object.keys(record.stepRecords).length} 步</span>
                      <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12 rounded-3xl border border-dashed border-black/10 bg-white/35">
                <ClipboardList className="w-12 h-12 mb-3 text-gray-300" />
                <p className="font-medium text-gray-500">暂无跟踪记录</p>
                <p className="text-sm text-gray-400 mt-1">启动新任务后，这里会展示最近执行情况</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[var(--card-bg)] backdrop-blur-xl rounded-3xl border border-black/5 shadow-[var(--shadow-soft)] flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-black/5 bg-white/40">
            <h3 className="font-bold text-gray-800 flex items-center">
              <Box className="w-5 h-5 mr-2 text-[color:var(--accent)]" /> 
              基础库概览
            </h3>
          </div>
          <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
            {libraryOverview.map(item => (
              <div key={item.label} className="flex items-center justify-between gap-3 p-4 bg-white/60 backdrop-blur rounded-2xl border border-black/5 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.tone}`}>
                    <Box className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-600 font-medium break-words">{item.label}</p>
                    <p className="text-xs text-gray-400">基础主数据</p>
                  </div>
                </div>
                <span className="font-bold text-xl sm:text-2xl text-gray-900 shrink-0">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
