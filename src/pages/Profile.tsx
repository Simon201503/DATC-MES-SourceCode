import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import { UserCircle, Save, Camera, ShieldCheck } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

export default function Profile() {
  const { currentUser, updateUserSignature, updateUser } = useStore();
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw');
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  
  const [stampTab, setStampTab] = useState<'draw' | 'upload'>('draw');
  const [uploadedStamp, setUploadedStamp] = useState<string | null>(null);
  
  const sigPad = useRef<SignatureCanvas>(null);
  const stampPad = useRef<SignatureCanvas>(null);

  const [password, setPassword] = useState(currentUser?.password || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');

  if (!currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, { password, phone, email });
    alert('个人信息保存成功！');
  };

  const handleSaveSignature = () => {
    let sigData = '';
    if (activeTab === 'draw' && sigPad.current && !sigPad.current.isEmpty()) {
      sigData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    } else if (activeTab === 'upload' && uploadedSignature) {
      sigData = uploadedSignature;
    }
    
    if (sigData) {
      updateUserSignature(currentUser.id, sigData);
      alert('电子签名保存成功！');
    } else {
      alert('请提供签名！');
    }
  };

  const handleClear = () => {
    if (sigPad.current) {
      sigPad.current.clear();
    }
    setUploadedSignature(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setUploadedSignature(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStamp = () => {
    let stampData = '';
    if (stampTab === 'draw' && stampPad.current && !stampPad.current.isEmpty()) {
      stampData = stampPad.current.getTrimmedCanvas().toDataURL('image/png');
    } else if (stampTab === 'upload' && uploadedStamp) {
      stampData = uploadedStamp;
    }
    
    if (stampData) {
      updateUser(currentUser.id, { stamp: stampData });
      alert('检测章保存成功！');
    } else {
      alert('请提供检测章！');
    }
  };

  const handleClearStamp = () => {
    if (stampPad.current) {
      stampPad.current.clear();
    }
    setUploadedStamp(null);
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setUploadedStamp(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-color)]">
      <div className="px-8 py-6 border-b border-black/5 bg-white/60 backdrop-blur sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">个人中心与签名维护</h1>
        <p className="text-gray-500 mt-1">管理您的个人信息和电子签名</p>
      </div>

      <div className="p-8 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 用户信息卡片 */}
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 border border-black/5 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                <UserCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentUser.name}</h2>
                <p className="text-gray-500">@{currentUser.username}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {currentUser.roles.map(r => (
                    <span key={r} className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium border border-gray-200">
                      {r === 'admin' ? '系统管理员' : r === 'process_engineer' ? '工艺工程师' : r === 'operator' ? '操作员' : '检验员'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-black/5 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">基本信息设置</h3>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">修改密码</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="留空则无密码"
                    className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="输入手机号"
                    className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="输入邮箱"
                    className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    className="px-5 py-2 text-white bg-[color:var(--accent)] hover:bg-blue-600 rounded-xl font-medium text-sm shadow-sm transition-all"
                  >
                    保存信息
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 签名维护卡片 */}
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 border border-black/5 shadow-sm flex flex-col">
            <h3 className="font-semibold text-gray-900 mb-4">电子签名维护</h3>
            
            {currentUser.signature && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                <p className="text-xs text-gray-500 mb-2 font-medium">当前已保存的签名：</p>
                <img src={currentUser.signature} alt="Current Signature" className="h-16 object-contain" />
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setActiveTab('draw')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-xl transition-colors ${activeTab === 'draw' ? 'bg-[color:var(--accent)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                手写签名
              </button>
              <button 
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-xl transition-colors ${activeTab === 'upload' ? 'bg-[color:var(--accent)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                上传图片
              </button>
            </div>

            <div className="flex-1 min-h-[200px] border-2 border-dashed border-gray-300 rounded-2xl bg-white relative overflow-hidden flex items-center justify-center">
              {activeTab === 'draw' ? (
                <SignatureCanvas 
                  ref={sigPad}
                  canvasProps={{ className: 'w-full h-full absolute inset-0' }}
                  backgroundColor="transparent"
                />
              ) : (
                <div className="text-center w-full h-full flex flex-col items-center justify-center p-4">
                  {uploadedSignature ? (
                    <img src={uploadedSignature} alt="Uploaded" className="max-h-32 object-contain" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-4">支持 jpg, png 格式的透明背景签名</p>
                      <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        选择文件
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={handleClear}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm transition-colors"
              >
                清除重填
              </button>
              <button 
                onClick={handleSaveSignature}
                className="flex items-center px-5 py-2 text-white bg-[color:var(--accent)] hover:bg-blue-600 rounded-xl font-medium text-sm shadow-sm transition-all hover:shadow-md"
              >
                <Save className="w-4 h-4 mr-2" /> 保存签名
              </button>
            </div>
          </div>
          
          {/* 如果是检验员，增加一个检测章的维护模块 */}
          {currentUser.roles.includes('inspector') && (
            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 border border-black/5 shadow-sm flex flex-col md:col-span-2 max-w-2xl mx-auto w-full">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" />
                检测章维护
              </h3>
              
              {currentUser.stamp && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <p className="text-xs text-emerald-700 mb-2 font-medium">当前已保存的检测章：</p>
                  <img src={currentUser.stamp} alt="Current Stamp" className="h-20 object-contain" />
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => setStampTab('draw')}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-xl transition-colors ${stampTab === 'draw' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  手绘图章
                </button>
                <button 
                  onClick={() => setStampTab('upload')}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-xl transition-colors ${stampTab === 'upload' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  上传图片
                </button>
              </div>

              <div className="flex-1 min-h-[200px] border-2 border-dashed border-emerald-200 rounded-2xl bg-white relative overflow-hidden flex items-center justify-center">
                {stampTab === 'draw' ? (
                  <SignatureCanvas 
                    ref={stampPad}
                    penColor="red"
                    canvasProps={{ className: 'w-full h-full absolute inset-0' }}
                    backgroundColor="transparent"
                  />
                ) : (
                  <div className="text-center w-full h-full flex flex-col items-center justify-center p-4">
                    {uploadedStamp ? (
                      <img src={uploadedStamp} alt="Uploaded Stamp" className="max-h-32 object-contain" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-emerald-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-4">支持 jpg, png 格式的透明背景检测章</p>
                        <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                          选择文件
                          <input type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />
                        </label>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={handleClearStamp}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm transition-colors"
                >
                  清除重填
                </button>
                <button 
                  onClick={handleSaveStamp}
                  className="flex items-center px-5 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-medium text-sm shadow-sm transition-all"
                >
                  <Save className="w-4 h-4 mr-2" /> 保存检测章
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}