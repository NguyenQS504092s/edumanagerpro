
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package, Tag, RefreshCw, X } from 'lucide-react';
import { useProducts } from '../src/hooks/useProducts';
import { Product, ProductCategory, ProductStatus } from '../src/services/productService';

export const ProductManager: React.FC = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  const [activeTab, setActiveTab] = useState<'products' | 'discounts'>('products');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    category: 'Sách' as ProductCategory,
    status: 'Kích hoạt' as ProductStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', price: 0, stock: 0, category: 'Sách', status: 'Kích hoạt' });
    } catch (err) {
      alert('Lỗi khi lưu sản phẩm');
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      status: product.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      await deleteProduct(id);
    } catch (err) {
      alert('Không thể xóa sản phẩm');
    }
  };

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case 'Kích hoạt': return 'bg-green-600';
      case 'Tạm khoá': return 'bg-orange-500';
      case 'Ngừng bán': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
         <div className="flex gap-4">
             <h2 className="text-lg font-bold text-gray-800">Vật phẩm</h2>
         </div>
         <div className="flex gap-2">
             <button 
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({ name: '', price: 0, stock: 0, category: 'Sách', status: 'Kích hoạt' });
                  setShowModal(true);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
             >
                 <Package size={16} /> Thêm vật phẩm
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
                    {loading ? (
                      <tr><td colSpan={5} className="text-center py-8 text-gray-500">Đang tải...</td></tr>
                    ) : products.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-gray-400">Chưa có sản phẩm nào</td></tr>
                    ) : products.map((p, i) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                            <td className="px-4 py-3">{p.price.toLocaleString()} đ</td>
                            <td className="px-4 py-3 text-center">
                                <span className={`${getStatusColor(p.status)} text-white text-[10px] px-2 py-0.5 rounded-full font-bold`}>{p.status}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-1">
                                  <button onClick={() => openEditModal(p)} className="text-gray-400 hover:text-indigo-600 p-1"><Edit size={14} /></button>
                                  <button onClick={() => p.id && handleDelete(p.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
             <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <div className="text-xs text-gray-500">Hiển thị {products.length} bản ghi</div>
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

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá tiền *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Sách">Sách</option>
                    <option value="Học liệu">Học liệu</option>
                    <option value="Đồng phục">Đồng phục</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Kích hoạt">Kích hoạt</option>
                    <option value="Tạm khoá">Tạm khoá</option>
                    <option value="Ngừng bán">Ngừng bán</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingProduct ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
