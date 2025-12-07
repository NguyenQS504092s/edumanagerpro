/**
 * Contract Creation Page
 * Form tạo hợp đồng với tính toán tự động
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, X, Calculator, DollarSign, 
  User, Calendar, Save, FileCheck, Printer 
} from 'lucide-react';
import { 
  Contract, ContractType, ContractCategory, ContractItem, PaymentMethod,
  Student, Course, Product, ContractStatus
} from '../types';
import { useAuth } from '../src/hooks/useAuth';
import { useStudents } from '../src/hooks/useStudents';
import { useContracts } from '../src/hooks/useContracts';
import { createEnrollment } from '../src/services/enrollmentService';
import { useCurriculums } from '../src/hooks/useCurriculums';
import { useProducts } from '../src/hooks/useProducts';
import { 
  formatCurrency, 
  numberToWords, 
  calculateDiscount 
} from '../src/utils/currencyUtils';

// Contract Preview Component
interface ContractPreviewProps {
  contract: Partial<Contract>;
  onClose: () => void;
  onPrint: () => void;
}

const ContractPreview: React.FC<ContractPreviewProps> = ({ contract, onClose, onPrint }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Hợp đồng - ${contract.code || 'Mới'}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { font-size: 24px; margin: 0; text-transform: uppercase; }
            .header p { margin: 5px 0; color: #666; }
            .contract-title { text-align: center; margin: 30px 0; }
            .contract-title h2 { font-size: 20px; text-transform: uppercase; margin: 0; }
            .contract-title p { margin: 5px 0; }
            .section { margin: 20px 0; }
            .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .info-row { display: flex; margin: 8px 0; }
            .info-label { width: 150px; font-weight: bold; }
            .info-value { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
            th { background: #f0f0f0; }
            .total-row { font-weight: bold; background: #f9f9f9; }
            .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
            .signature-box { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 5px; }
            .amount-words { font-style: italic; background: #f5f5f5; padding: 10px; margin: 10px 0; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-green-50">
          <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
            <FileCheck size={24} />
            Hợp đồng đã được tạo thành công!
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Printer size={18} />
              In hợp đồng
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div ref={printRef}>
            {/* Company Header */}
            <div className="header text-center mb-8">
              <h1 className="text-2xl font-bold text-indigo-800">TRUNG TÂM ANH NGỮ BRISKY</h1>
              <p className="text-gray-600">Địa chỉ: Tây Mỗ, Nam Từ Liêm, Hà Nội</p>
              <p className="text-gray-600">Hotline: 0912.345.678 | Email: contact@brisky.edu.vn</p>
            </div>

            {/* Contract Title */}
            <div className="contract-title text-center my-8">
              <h2 className="text-xl font-bold uppercase">HỢP ĐỒNG ĐĂNG KÝ KHÓA HỌC</h2>
              <p className="text-gray-600 mt-2">Số: <strong>{contract.code || 'BRISKY-XXX'}</strong></p>
              <p className="text-gray-600">Ngày: {new Date(contract.contractDate || '').toLocaleDateString('vi-VN')}</p>
            </div>

            {/* Party A - Center */}
            <div className="section mb-6">
              <div className="section-title font-bold border-b border-gray-300 pb-2 mb-3">BÊN A: TRUNG TÂM ANH NGỮ BRISKY</div>
              <div className="space-y-1 text-sm">
                <p><strong>Đại diện:</strong> Nguyễn Văn A - Giám đốc</p>
                <p><strong>Địa chỉ:</strong> Tây Mỗ, Nam Từ Liêm, Hà Nội</p>
                <p><strong>Điện thoại:</strong> 0912.345.678</p>
              </div>
            </div>

            {/* Party B - Customer */}
            <div className="section mb-6">
              <div className="section-title font-bold border-b border-gray-300 pb-2 mb-3">BÊN B: PHỤ HUYNH / HỌC VIÊN</div>
              <div className="space-y-1 text-sm">
                <p><strong>Học viên:</strong> {contract.studentName || '---'}</p>
                <p><strong>Ngày sinh:</strong> {contract.studentDOB ? new Date(contract.studentDOB).toLocaleDateString('vi-VN') : '---'}</p>
                <p><strong>Phụ huynh:</strong> {contract.parentName || '---'}</p>
                <p><strong>Điện thoại:</strong> {contract.parentPhone || '---'}</p>
              </div>
            </div>

            {/* Contract Items */}
            <div className="section mb-6">
              <div className="section-title font-bold border-b border-gray-300 pb-2 mb-3">NỘI DUNG HỢP ĐỒNG</div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">STT</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Nội dung</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Đơn giá</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">SL</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {contract.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-gray-300 px-3 py-2">{idx + 1}</td>
                      <td className="border border-gray-300 px-3 py-2">{item.name}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{formatCurrency(item.finalPrice)}</td>
                    </tr>
                  ))}
                  <tr className="total-row bg-gray-50 font-bold">
                    <td colSpan={4} className="border border-gray-300 px-3 py-2 text-right">TỔNG CỘNG:</td>
                    <td className="border border-gray-300 px-3 py-2 text-right text-indigo-700">{formatCurrency(contract.totalAmount || 0)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="amount-words bg-indigo-50 p-3 rounded mt-3 text-sm">
                <strong>Bằng chữ:</strong> <em>{contract.totalAmountInWords}</em>
              </div>
            </div>

            {/* Payment Info */}
            <div className="section mb-6">
              <div className="section-title font-bold border-b border-gray-300 pb-2 mb-3">THÔNG TIN THANH TOÁN</div>
              <div className="space-y-1 text-sm">
                <p><strong>Hình thức:</strong> {contract.paymentMethod}</p>
                <p><strong>Trạng thái:</strong> <span className={contract.status === ContractStatus.PAID ? 'text-green-600 font-bold' : 'text-orange-600'}>{contract.status}</span></p>
                <p><strong>Đã thanh toán:</strong> {formatCurrency(contract.paidAmount || 0)}</p>
                <p><strong>Còn lại:</strong> {formatCurrency(contract.remainingAmount || 0)}</p>
              </div>
            </div>

            {/* Terms */}
            <div className="section mb-6">
              <div className="section-title font-bold border-b border-gray-300 pb-2 mb-3">ĐIỀU KHOẢN HỢP ĐỒNG</div>
              <ol className="list-decimal list-inside text-sm space-y-2">
                <li>Bên B cam kết thanh toán đầy đủ học phí theo thỏa thuận.</li>
                <li>Bên A cam kết cung cấp dịch vụ giảng dạy theo chương trình đã đăng ký.</li>
                <li>Học phí đã đóng không được hoàn trả, trừ trường hợp bất khả kháng.</li>
                <li>Bên B có quyền bảo lưu khóa học trong thời gian tối đa 3 tháng.</li>
                <li>Hợp đồng có hiệu lực kể từ ngày ký.</li>
              </ol>
            </div>

            {/* Signatures */}
            <div className="signatures flex justify-between mt-12">
              <div className="signature-box text-center">
                <p className="font-bold">ĐẠI DIỆN BÊN A</p>
                <p className="text-sm text-gray-500">(Ký, ghi rõ họ tên)</p>
                <div className="signature-line border-t border-gray-400 mt-16 pt-2"></div>
              </div>
              <div className="signature-box text-center">
                <p className="font-bold">ĐẠI DIỆN BÊN B</p>
                <p className="text-sm text-gray-500">(Ký, ghi rõ họ tên)</p>
                <div className="signature-line border-t border-gray-400 mt-16 pt-2"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Printer size={18} />
            In hợp đồng
          </button>
        </div>
      </div>
    </div>
  );
};

export const ContractCreation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { students } = useStudents();
  const { createContract } = useContracts();
  const { curriculums } = useCurriculums({ status: 'Active' });
  const { products } = useProducts({ status: 'Kích hoạt' });

  // Form state
  const [contractType, setContractType] = useState<ContractType>(ContractType.STUDENT);
  const [contractCategory, setContractCategory] = useState<ContractCategory>(ContractCategory.NEW);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [items, setItems] = useState<ContractItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.FULL);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showContractPreview, setShowContractPreview] = useState(false);
  const [createdContract, setCreatedContract] = useState<Partial<Contract> | null>(null);

  // Convert curriculums to course format for contract
  const availableCourses: Course[] = curriculums.map(c => ({
    id: c.id || '',
    code: c.code,
    name: c.name,
    totalSessions: c.totalSessions,
    pricePerSession: Math.round(c.tuitionFee / c.totalSessions),
    totalPrice: c.tuitionFee,
    status: c.status,
    createdAt: c.createdAt || '',
    updatedAt: c.updatedAt || '',
  }));

  // Convert products to expected format
  const availableProducts: Product[] = products.map(p => ({
    id: p.id || '',
    name: p.name,
    price: p.price,
    category: p.category,
    stock: p.stock,
    status: p.status,
  }));

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDiscount = items.reduce((sum, item) => sum + (item.subtotal - item.finalPrice), 0);
    const totalAmount = items.reduce((sum, item) => sum + item.finalPrice, 0);
    const totalAmountInWords = numberToWords(totalAmount);

    return { subtotal, totalDiscount, totalAmount, totalAmountInWords };
  }, [items]);

  // Add course item
  const addCourseItem = (course: Course) => {
    const newItem: ContractItem = {
      type: 'course',
      id: course.id,
      name: course.name,
      unitPrice: course.pricePerSession,
      quantity: course.totalSessions,
      subtotal: course.totalPrice,
      discount: 0,
      finalPrice: course.totalPrice,
    };
    setItems([...items, newItem]);
  };

  // Add product item
  const addProductItem = (product: Product) => {
    const newItem: ContractItem = {
      type: 'product',
      id: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity: 1,
      subtotal: product.price,
      discount: 0,
      finalPrice: product.price,
    };
    setItems([...items, newItem]);
  };

  // Update item
  const updateItem = (index: number, field: keyof ContractItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    
    if (field === 'quantity' || field === 'unitPrice') {
      item[field] = value;
      item.subtotal = item.quantity * item.unitPrice;
      item.finalPrice = calculateDiscount(item.subtotal, item.discount);
    } else if (field === 'discount') {
      item.discount = value;
      item.finalPrice = calculateDiscount(item.subtotal, value);
    } else {
      (item as any)[field] = value;
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  // Remove item
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Handle submit
  const handleSubmit = async (status: ContractStatus) => {
    if (!user) {
      alert('Bạn cần đăng nhập để tạo hợp đồng');
      return;
    }

    if (contractType === ContractType.STUDENT && !selectedStudent) {
      alert('Vui lòng chọn học viên');
      return;
    }

    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất một khóa học hoặc sản phẩm');
      return;
    }

    try {
      setLoading(true);

      const contractData: Partial<Contract> = {
        type: contractType,
        category: contractCategory,
        studentId: selectedStudent?.id,
        studentName: selectedStudent?.fullName,
        studentDOB: selectedStudent?.dob,
        parentName: selectedStudent?.parentName,
        parentPhone: selectedStudent?.phone,
        items,
        subtotal: calculations.subtotal,
        totalDiscount: calculations.totalDiscount,
        totalAmount: calculations.totalAmount,
        totalAmountInWords: calculations.totalAmountInWords,
        paymentMethod,
        paidAmount: status === ContractStatus.PAID ? calculations.totalAmount : 0,
        remainingAmount: status === ContractStatus.PAID ? 0 : calculations.totalAmount,
        contractDate: new Date().toISOString(),
        status,
        notes,
        createdBy: user.uid || user.email || 'unknown',
      };

      const contractId = await createContract(contractData);
      const contractCode = contractId ? `Brisky${String(Date.now()).slice(-3)}` : 'Brisky001';
      
      // Create enrollment record for each course item when contract is PAID
      if (status === ContractStatus.PAID && selectedStudent) {
        // Map contract category to enrollment type
        const enrollmentType = contractCategory === ContractCategory.RENEWAL 
          ? 'Hợp đồng tái phí' 
          : contractCategory === ContractCategory.MIGRATION
          ? 'Hợp đồng liên kết' as any
          : 'Hợp đồng mới';
        
        for (const item of items) {
          if (item.type === 'course') {
            try {
              await createEnrollment({
                studentId: selectedStudent.id,
                studentName: selectedStudent.fullName || selectedStudent.name || '',
                sessions: item.quantity || item.sessions || 0,
                type: enrollmentType,
                contractCode: contractCode,
                finalAmount: item.finalPrice,
                createdDate: new Date().toLocaleDateString('vi-VN'),
                createdBy: user.displayName || user.email || 'Unknown',
                note: `Ghi danh từ hợp đồng ${contractCode} - ${item.name}`,
                courseName: item.name,
                classId: item.classId || '',
                className: item.className || '',
              });
            } catch (err) {
              console.error('Error creating enrollment:', err);
            }
          }
        }
      }
      
      if (status === ContractStatus.PAID) {
        // Show preview only for paid contracts
        setCreatedContract({
          ...contractData,
          id: contractId,
          code: contractCode,
        });
        setShowContractPreview(true);
      } else {
        // Draft: just show success and redirect
        alert('Đã lưu hợp đồng nháp thành công!');
        navigate('/finance/contracts');
      }
    } catch (error: any) {
      console.error('Error creating contract:', error);
      alert(`Không thể tạo hợp đồng: ${error.message || 'Vui lòng thử lại.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-indigo-600" size={28} />
              Tạo hợp đồng mới
            </h2>
            <p className="text-sm text-gray-500 mt-1">Mã hợp đồng sẽ được tạo tự động (Brisky001-999)</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Ngày tạo</p>
            <p className="font-semibold text-gray-800">{new Date().toLocaleDateString('vi-VN')}</p>
          </div>
        </div>
      </div>

      {/* Contract Type */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Loại hợp đồng</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setContractType(ContractType.STUDENT)}
            className={`flex-1 p-4 border-2 rounded-lg transition-all ${
              contractType === ContractType.STUDENT
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <User className="mx-auto mb-2" size={24} />
            <p className="font-semibold">Học viên</p>
          </button>
          <button
            onClick={() => setContractType(ContractType.PRODUCT)}
            className={`flex-1 p-4 border-2 rounded-lg transition-all ${
              contractType === ContractType.PRODUCT
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileText className="mx-auto mb-2" size={24} />
            <p className="font-semibold">Học liệu</p>
          </button>
        </div>

        {/* Contract Category - only for student type */}
        {contractType === ContractType.STUDENT && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-700 mb-3">Phân loại hợp đồng</h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setContractCategory(ContractCategory.NEW)}
                className={`p-3 border-2 rounded-lg text-sm transition-all ${
                  contractCategory === ContractCategory.NEW
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold">Hợp đồng mới</p>
                <p className="text-xs text-gray-500 mt-1">Học sinh mới đăng ký</p>
              </button>
              <button
                onClick={() => setContractCategory(ContractCategory.RENEWAL)}
                className={`p-3 border-2 rounded-lg text-sm transition-all ${
                  contractCategory === ContractCategory.RENEWAL
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold">Hợp đồng tái phí</p>
                <p className="text-xs text-gray-500 mt-1">Gia hạn/Đăng ký thêm</p>
              </button>
              <button
                onClick={() => setContractCategory(ContractCategory.MIGRATION)}
                className={`p-3 border-2 rounded-lg text-sm transition-all ${
                  contractCategory === ContractCategory.MIGRATION
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold">Hợp đồng liên kết</p>
                <p className="text-xs text-gray-500 mt-1">Chuyển từ hệ thống cũ</p>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student Selection (only if type is STUDENT) */}
      {contractType === ContractType.STUDENT && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Thông tin học viên</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn học viên <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => {
                  const student = students.find(s => s.id === e.target.value);
                  setSelectedStudent(student || null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">-- Chọn học viên --</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} ({student.code}) - {student.parentName}
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Ngày sinh</p>
                    <p className="font-semibold">
                      {new Date(selectedStudent.dob).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phụ huynh</p>
                    <p className="font-semibold">{selectedStudent.parentName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Điện thoại</p>
                    <p className="font-semibold">{selectedStudent.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Lớp học</p>
                    <p className="font-semibold">{selectedStudent.class || '---'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Items Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Khóa học / Sản phẩm</h3>
          <div className="flex gap-2">
            <select
              onChange={(e) => {
                const course = availableCourses.find(c => c.id === e.target.value);
                if (course) {
                  addCourseItem(course);
                  e.target.value = '';
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">+ Thêm khóa học</option>
              {availableCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} - {formatCurrency(course.totalPrice)}
                </option>
              ))}
            </select>
            <select
              onChange={(e) => {
                const product = availableProducts.find(p => p.id === e.target.value);
                if (product) {
                  addProductItem(product);
                  e.target.value = '';
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">+ Thêm sản phẩm</option>
              {availableProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {formatCurrency(product.price)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText size={48} className="mx-auto mb-2 opacity-20" />
            <p>Chưa có khóa học hoặc sản phẩm nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-right">Đơn giá</th>
                  <th className="px-4 py-3 text-center">Số lượng</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                  <th className="px-4 py-3 text-center">Ưu đãi (%)</th>
                  <th className="px-4 py-3 text-right">Thành tiền</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs mb-1 ${
                        item.type === 'course' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.type === 'course' ? 'Khóa học' : 'Sản phẩm'}
                      </span>
                      <p className="font-medium">{item.name}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(item.subtotal)}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={item.discount * 100}
                        onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) / 100 || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-600">
                      {formatCurrency(item.finalPrice)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calculator size={20} />
          Tổng kết tài chính
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tổng tiền:</span>
            <span className="font-semibold text-lg">{formatCurrency(calculations.subtotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Ưu đãi:</span>
            <span className="font-semibold text-orange-600">- {formatCurrency(calculations.totalDiscount)}</span>
          </div>
          <div className="h-px bg-gray-200"></div>
          <div className="flex justify-between items-center">
            <span className="text-gray-800 font-bold">Số tiền cần thanh toán:</span>
            <span className="font-bold text-2xl text-indigo-600">{formatCurrency(calculations.totalAmount)}</span>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Số tiền bằng chữ:</p>
            <p className="font-medium text-indigo-900 italic">{calculations.totalAmountInWords}</p>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Hình thức thanh toán</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(PaymentMethod).map(method => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`p-4 border-2 rounded-lg transition-all ${
                paymentMethod === method
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <DollarSign className="mx-auto mb-2" size={20} />
              <p className="font-medium">{method}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Ghi chú</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Nhập ghi chú cho hợp đồng..."
        />
      </div>

      {/* Action Buttons (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex gap-3 justify-end">
          <button
            onClick={() => navigate(-1)}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={() => handleSubmit(ContractStatus.DRAFT)}
            disabled={loading || items.length === 0}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={18} />
            Lưu nháp
          </button>
          <button
            onClick={() => handleSubmit(ContractStatus.PAID)}
            disabled={loading || items.length === 0}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <FileCheck size={18} />
            Thanh toán
          </button>
        </div>
      </div>

      {/* Contract Preview Modal */}
      {showContractPreview && createdContract && (
        <ContractPreview
          contract={createdContract}
          onClose={() => {
            setShowContractPreview(false);
            navigate('/finance/contracts');
          }}
          onPrint={() => {}}
        />
      )}
    </div>
  );
};
