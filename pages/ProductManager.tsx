
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package, Tag, RefreshCw } from 'lucide-react';
import { MOCK_PRODUCTS } from '../mockData';
import { Modal } from '../components/Modal';

export const ProductManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'discounts'>('products');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
         <div className="flex gap-4">
             <h2 className="text-lg font-bold text-gray-800">Vật phẩm</h2>
         </div>
         <div className="flex gap-2">
             <button 
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'products' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
             >
                 <Package size={16} /> Thêm vật phẩm
             </button>
             <button 
                onClick={() => setActiveTab('discounts')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'discounts' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
             >
                 <Tag size={16} /> Thêm ưu đãi
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 border-b border-gray-100 font-bold text-gray-800">Vật phẩm</div>
             <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                    <tr>
                        <th className="px-4 py-3">STT</th>
                        <th className="px-4 py-3">Tên vật phẩm</th>
                        <th className="px-4 py-3">Giá tiền</th>
                        <th className="px-4 py-3 text-center">Trạng thái</th>
                        <th className="px-4 py-3 text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {MOCK_PRODUCTS.map((p, i) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                            <td className="px-4 py-3">{p.price.toLocaleString()} đ</td>
                            <td className="px-4 py-3 text-center">
                                <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{p.status}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button className="text-gray-400 hover:text-indigo-600"><Edit size={14} /></button>
                            </td>
                        </tr>
                    ))}
                    {/* Mock locked item */}
                    <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">{MOCK_PRODUCTS.length + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">Solutions Pre-intermediate</td>
                        <td className="px-4 py-3">250,000 đ</td>
                        <td className="px-4 py-3 text-center">
                            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Tạm khoá</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                            <button className="text-gray-400 hover:text-indigo-600"><Edit size={14} /></button>
                        </td>
                    </tr>
                </tbody>
             </table>
             <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <div className="text-xs text-gray-500">Hiển thị 1 đến {MOCK_PRODUCTS.length + 1} bản ghi</div>
             </div>
          </div>

          {/* Discounts Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 border-b border-gray-100 font-bold text-gray-800">Ưu đãi</div>
             <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                    <tr>
                        <th className="px-4 py-3">STT</th>
                        <th className="px-4 py-3">Tên ưu đãi</th>
                        <th className="px-4 py-3">Giá trị ưu đãi</th>
                        <th className="px-4 py-3 text-center">Trạng thái</th>
                        <th className="px-4 py-3 text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {[
                        {name: 'Giảm 24%', val: '24 %'},
                        {name: 'AE Ruột', val: '3 %'},
                        {name: 'Giảm 17%', val: '17 %'},
                        {name: 'Giảm 12%', val: '12 %'},
                        {name: 'Giảm 4%', val: '4 %'},
                        {name: 'Giảm 7%', val: '70,000 đ'},
                    ].map((d, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                            <td className="px-4 py-3">{d.val}</td>
                            <td className="px-4 py-3 text-center">
                                <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Kích hoạt</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button className="text-gray-400 hover:text-indigo-600"><Edit size={14} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
             <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <div className="text-xs text-gray-500">Hiển thị 1 đến 8 bản ghi</div>
             </div>
          </div>
      </div>
    </div>
  );
};
