import React, { useState } from 'react';
import { useStore } from '../store';
import { User, Role } from '../types';
import { Trash2, Edit2, Plus, X, UserCircle, ShieldAlert } from 'lucide-react';

export default function UserManagement() {
  const { users, addUser, updateUser, removeUser, currentUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [roles, setRoles] = useState<Role[]>(['operator']);

  if (!currentUser?.roles.includes('admin')) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-color)]">
        <div className="text-center bg-white/80 p-8 rounded-3xl border border-black/5 shadow-sm max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">权限不足</h2>
          <p className="text-gray-500">只有系统管理员 (admin) 可以访问此页面。</p>
        </div>
      </div>
    );
  }

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUsername(user.username);
      setPassword(user.password || '');
      setName(user.name);
      setRoles(user.roles);
    } else {
      setEditingUser(null);
      setUsername('');
      setPassword('');
      setName('');
      setRoles(['operator']);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (roles.length === 0) {
      alert('请至少选择一个角色！');
      return;
    }
    if (editingUser) {
      updateUser(editingUser.id, { username, password, name, roles });
    } else {
      // Check if username exists
      if (users.some(u => u.username === username)) {
        alert('账号名已存在！');
        return;
      }
      addUser({ username, password, name, roles });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser.id) {
      alert('不能删除当前登录的管理员账号！');
      return;
    }
    if (window.confirm('确定删除此用户吗？这可能会影响历史记录的关联展示。')) {
      removeUser(id);
    }
  };

  const handleClearSignature = (id: string) => {
    if (window.confirm('确定清除该用户的电子签名吗？')) {
      updateUser(id, { signature: undefined });
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">用户与权限管理</h2>
          <p className="text-sm text-gray-500 mt-1">管理系统登录用户与角色分配</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2.5 bg-[color:var(--accent)] text-white rounded-2xl hover:opacity-95 transition-opacity text-sm font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增用户
        </button>
      </div>

      <div className="flex-1 overflow-auto pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {users.map(user => (
            <div key={user.id} className="border border-black/5 rounded-3xl p-5 hover:shadow-[var(--shadow-float)] transition-shadow bg-white/55 backdrop-blur flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg truncate">{user.name}</h3>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {user.roles.map(r => (
                      <span key={r} className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded-full font-medium border border-gray-200">
                        {r === 'admin' ? '系统管理员' : r === 'process_engineer' ? '工艺工程师' : r === 'operator' ? '操作员' : '检验员'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 p-3 rounded-2xl border border-black/5 flex-1 mb-4 flex flex-col items-center justify-center gap-4">
                <div className="w-full">
                  <p className="text-xs text-gray-500 mb-2 font-medium w-full text-center">电子签名状态</p>
                  {user.signature ? (
                    <div className="relative w-full flex justify-center group">
                      <img src={user.signature} alt="Signature" className="h-12 object-contain" />
                      <button 
                        onClick={() => handleClearSignature(user.id)}
                        className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-red-600 font-semibold transition-opacity"
                      >
                        清除签名
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic text-center">尚未维护</p>
                  )}
                </div>
                
                {user.roles.includes('inspector') && (
                  <div className="w-full pt-3 border-t border-black/5">
                    <p className="text-xs text-gray-500 mb-2 font-medium w-full text-center">检测章状态</p>
                    {user.stamp ? (
                      <div className="relative w-full flex justify-center group">
                        <img src={user.stamp} alt="Stamp" className="h-12 object-contain" />
                        <button 
                          onClick={() => {
                            if (window.confirm('确定清除该用户的检测章吗？')) {
                              updateUser(user.id, { stamp: undefined });
                            }
                          }}
                          className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-red-600 font-semibold transition-opacity"
                        >
                          清除图章
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center">尚未维护</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/5">
                <button 
                  onClick={() => handleOpenModal(user)}
                  className="flex items-center px-3 py-1.5 text-sm font-semibold text-[color:var(--accent)] hover:bg-[rgba(10,132,255,0.10)] rounded-2xl transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-1" /> 编辑
                </button>
                <button 
                  onClick={() => handleDelete(user.id)}
                  disabled={user.id === currentUser.id}
                  className="flex items-center px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:hover:bg-transparent rounded-2xl transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> 删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-xl rounded-3xl shadow-[var(--shadow-float)] w-full max-w-md overflow-hidden border border-black/5">
            <div className="p-4 border-b border-black/5 bg-white/60 flex justify-between items-center">
              <h3 className="text-[15px] font-semibold text-gray-900">{editingUser ? '编辑用户' : '新增用户'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">登录账号 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur"
                  disabled={!!editingUser && editingUser.id === currentUser.id} // Don't allow changing own username easily
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">登录密码</label>
                <input 
                  type="text" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="留空则无需密码"
                  className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">真实姓名 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] text-sm bg-white/70 backdrop-blur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">系统角色 (可多选) <span className="text-red-500">*</span></label>
                <div className="space-y-2 border border-black/10 rounded-2xl p-3 bg-white/70 backdrop-blur">
                  {[
                    { value: 'operator', label: '操作员 (只能执行与操作签字)' },
                    { value: 'inspector', label: '检验员 (只能执行与检验签字)' },
                    { value: 'process_engineer', label: '工艺工程师 (工艺编制与执行全权限)' },
                    { value: 'admin', label: '系统管理员 (最高权限与用户管理)' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={roles.includes(opt.value as Role)}
                        onChange={e => {
                          if (e.target.checked) {
                            setRoles([...roles, opt.value as Role]);
                          } else {
                            setRoles(roles.filter(r => r !== opt.value));
                          }
                        }}
                        disabled={!!editingUser && editingUser.id === currentUser.id && opt.value === 'admin'}
                        className="rounded text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl font-medium text-sm"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-[color:var(--accent)] hover:bg-blue-600 rounded-2xl font-medium text-sm shadow-sm"
                >
                  保存用户
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}