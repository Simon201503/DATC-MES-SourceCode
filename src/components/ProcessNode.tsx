import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Star, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { ProcessStep } from '../types';

interface ProcessNodeData {
  label: string;
  step: ProcessStep;
  status?: 'pending' | 'completed' | 'inspected';
  isCurrent?: boolean;
  hasOpenNcr?: boolean;
}

export const ProcessNode = ({ data, selected }: { data: ProcessNodeData, selected: boolean }) => {
  const { label, step, status, isCurrent, hasOpenNcr } = data;
  
  let bgClass = 'bg-white';
  let borderClass = selected ? 'border-[color:var(--accent)] shadow-[var(--shadow-float)] ring-2 ring-[rgba(10,132,255,0.18)]' : 'border-black/5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-float)]';
  let textClass = 'text-gray-800';
  let icon = null;

  if (hasOpenNcr) {
    bgClass = 'bg-red-50';
    borderClass = selected ? 'border-red-500 shadow-[var(--shadow-float)] ring-2 ring-red-200' : 'border-red-300 shadow-[var(--shadow-soft)]';
    textClass = 'text-red-900';
    icon = <AlertTriangle className="w-4 h-4 text-red-600" />;
  } else if (status === 'inspected') {
    bgClass = 'bg-[rgba(52,199,89,0.10)]';
    borderClass = selected ? 'border-[rgba(52,199,89,0.55)] shadow-[var(--shadow-float)] ring-2 ring-[rgba(52,199,89,0.18)]' : 'border-[rgba(52,199,89,0.35)] shadow-[var(--shadow-soft)]';
    textClass = 'text-emerald-950';
    icon = <CheckCircle className="w-4 h-4 text-emerald-600" />;
  } else if (status === 'completed') {
    bgClass = 'bg-[rgba(255,159,10,0.12)]';
    borderClass = selected ? 'border-[rgba(255,159,10,0.65)] shadow-[var(--shadow-float)] ring-2 ring-[rgba(255,159,10,0.18)]' : 'border-[rgba(255,159,10,0.45)] shadow-[var(--shadow-soft)]';
    textClass = 'text-amber-950';
    icon = <CheckCircle className="w-4 h-4 text-amber-600" />;
  } else if (isCurrent) {
    bgClass = 'bg-[rgba(10,132,255,0.10)]';
    borderClass = 'border-[color:var(--accent)] shadow-[var(--shadow-float)] ring-2 ring-[rgba(10,132,255,0.18)]';
    textClass = 'text-sky-950';
    icon = <Clock className="w-4 h-4 text-[color:var(--accent)]" />;
  } else {
    bgClass = 'bg-[var(--card-bg)] backdrop-blur-xl';
  }

  return (
    <div className={clsx(
      "relative px-4 py-4 rounded-2xl border min-w-[180px] max-w-[240px] transition-all flex flex-col items-center justify-center group shadow-sm",
      bgClass,
      borderClass
    )}>
      {step?.stepNumber && (
        <div className="absolute top-2 left-2 text-[10px] font-bold text-gray-500 bg-white/80 backdrop-blur px-1.5 py-0.5 rounded border border-black/5 shadow-sm z-10" title="工序序号">
          {step.stepNumber}
        </div>
      )}
      {step?.isKeyProcess && (
        <div className="absolute top-2 right-2 text-yellow-500 drop-shadow-sm z-10" title="关键工序">
          <Star className="w-5 h-5 fill-yellow-400" />
        </div>
      )}
      
      <Handle type="target" position={Position.Top} id="t" className="w-3 h-3 bg-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Top} id="t-src" className="w-3 h-3 bg-[color:var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />

      <Handle type="target" position={Position.Left} id="l" className="w-3 h-3 bg-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Left} id="l-src" className="w-3 h-3 bg-[color:var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />

      <Handle type="target" position={Position.Right} id="r" className="w-3 h-3 bg-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} id="r-src" className="w-3 h-3 bg-[color:var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />

      <Handle type="target" position={Position.Bottom} id="b" className="w-3 h-3 bg-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} id="b-src" className="w-3 h-3 bg-[color:var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-center gap-2 mb-1 w-full">
        {icon}
        <div className={clsx("font-bold text-sm text-center truncate", textClass)} title={label}>
          {label}
        </div>
      </div>
      
      {status && (
        <div className="text-[10px] text-center mt-1 px-2 py-0.5 rounded-full bg-white/70 backdrop-blur font-semibold text-gray-700 border border-black/5">
          {hasOpenNcr ? '问题处理中' : status === 'completed' ? '待检验' : status === 'inspected' ? '已检验' : '执行中'}
        </div>
      )}
      
      {!status && step?.content && (
         <div className="text-[10px] text-gray-500 mt-1 line-clamp-1 text-center w-full">
           {step.content}
         </div>
      )}
    </div>
  );
};
