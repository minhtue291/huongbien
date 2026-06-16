import React from 'react';
import { Plus } from 'lucide-react';

export default function MenuItem({ item, onAddToOrder }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center font-semibold text-gray-400">
          Photo
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{item.name}</h4>
          <p className="text-sm text-amber-600 font-medium">{item.price.toLocaleString()} VNĐ</p>
        </div>
      </div>
      <button 
        onClick={() => onAddToOrder(item)}
        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}