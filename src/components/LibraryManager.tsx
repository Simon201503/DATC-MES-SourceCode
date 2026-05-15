import React, { useState } from 'react';
import { useStore } from '../store';
import { LibraryItemType, LibraryItem } from '../types';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

interface LibraryManagerProps {
  type: LibraryItemType;
  title: string;
}

export const LibraryManager: React.FC<LibraryManagerProps> = ({ type, title }) => {
  const { libraryItems, addLibraryItem, updateLibraryItem, removeLibraryItem } = useStore();
  const items = libraryItems.filter(item => item.type === type);

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<LibraryItem>>({});

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.parameters.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem.name) return;

    if (currentItem.id) {
      updateLibraryItem(currentItem.id, currentItem as LibraryItem);
    } else {
      addLibraryItem({
        name: currentItem.name,
        parameters: currentItem.parameters || '',
        quantity: currentItem.quantity || 0,
        type
      });
    }
    setIsEditing(false);
    setCurrentItem({});
  };

  const handleEdit = (item: LibraryItem) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div className="flex w-full sm:w-auto gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索名称或参数..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <button 
            onClick={() => { setCurrentItem({}); setIsEditing(true); }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredItems.map(item => (
            <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeLibraryItem(item.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="text-gray-400">参数:</span> {item.parameters || '无'}</p>
                <p><span className="text-gray-400">数量:</span> {item.quantity}</p>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              暂无数据
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold">{currentItem.id ? '编辑' : '新增'}{title}</h3>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input 
                  type="text" 
                  required
                  value={currentItem.name || ''}
                  onChange={e => setCurrentItem({...currentItem, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">参数</label>
                <textarea 
                  rows={3}
                  value={currentItem.parameters || ''}
                  onChange={e => setCurrentItem({...currentItem, parameters: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  value={currentItem.quantity || 0}
                  onChange={e => setCurrentItem({...currentItem, quantity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
