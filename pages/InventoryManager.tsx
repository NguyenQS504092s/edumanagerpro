
import React from 'react';
import { Package, Plus, RefreshCw, Archive } from 'lucide-react';
import { MOCK_PRODUCTS } from '../mockData';

export const InventoryManager: React.FC = () => {
  // Combine MOCK_PRODUCTS with some extra data for inventory view
  const inventoryData = [
    { id: '1', name: 'Học Liệu 18 tháng', stock: 999, price: 360000 },
    { id: '2', name: 'Bộ Sách Academy Stars 4', stock: 2, price: 250000 },
    { id: '3', name: 'Bộ Sách Academy Stars 3', stock: 13, price: 250000 },
    { id: '4', name: 'Bộ Sách Wonderworld 3', stock: 4, price: 250000 },
    { id: '5', name: 'Solutions Pre- intermediate', stock: 0, price: 250000 },
    { id: '6', name: 'Học Liệu 09 tháng', stock: 999, price: 180000 },
    { id: '7', name: 'Bộ Sách Academy Stars 2', stock: 4, price: 250000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Quản lý kho</h2>
        {/* No Action button required per screenshot but good to have context */}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
            <tr>
              <th className="px-6 py-4 w-16">STT</th>
              <th className="px-6 py-4">Tên sản phẩm</th>
              <th className="px-6 py-4">Số lượng còn lại</th>
              <th className="px-6 py-4">Đơn giá</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inventoryData.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4">{item.stock}</td>
                <td className="px-6 py-4">{item.price.toLocaleString()} đ</td>
                <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button className="text-green-600 hover:bg-green-50 p-1 rounded border border-green-200" title="Nhập kho">
                            <Plus size={16} />
                        </button>
                        <button className="text-blue-600 hover:bg-blue-50 p-1 rounded border border-blue-200" title="Lịch sử">
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <div className="text-xs text-gray-500">Hiển thị 1 đến {inventoryData.length} của 29 bản ghi</div>
        </div>
      </div>
    </div>
  );
};
