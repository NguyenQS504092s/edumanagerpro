
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Phone, Mail, MapPin, Calendar, BookOpen, DollarSign, Clock, MessageSquare, FileText, X } from 'lucide-react';
import { MOCK_FEEDBACKS } from '../mockData';
import { useClasses } from '../src/hooks/useClasses';
import { useStudents } from '../src/hooks/useStudents';

export const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'finance' | 'feedback'>('info');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { classes } = useClasses({});
  const { students, loading } = useStudents({});

  // Find student by ID from Firebase data
  const student = students.find(s => s.id === id);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    gender: 'Nam',
    dob: '',
    address: '',
    parentName: '',
    phone: '',
    email: '',
    parentName2: '',
    phone2: '',
  });

  // Update form when student data loads
  useEffect(() => {
    if (student) {
      setEditForm({
        fullName: student.fullName || '',
        gender: student.gender || 'Nam',
        dob: student.dob || '',
        address: '',
        parentName: student.parentName || '',
        phone: student.phone || '',
        email: '',
        parentName2: '',
        phone2: '',
      });
    }
  }, [student]);

  // Enroll form state
  const [enrollForm, setEnrollForm] = useState({
    classId: '',
    startDate: new Date().toISOString().split('T')[0],
    sessions: 48,
    notes: '',
  });
  
  // Filter feedbacks for this student (mock logic)
  const callFeedbacks = MOCK_FEEDBACKS.filter(f => f.type === 'Call');
  const formFeedbacks = MOCK_FEEDBACKS.filter(f => f.type === 'Form');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500 mb-4">Không tìm thấy học viên</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 mb-4 transition-colors"
        >
          <ChevronLeft size={18} /> Quay lại
        </button>
        
        <div className="flex flex-col md:flex-row gap-6 items-start">
           <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-white shadow-sm">
              {student.fullName.charAt(0)}
           </div>
           
           <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900">{student.fullName}</h1>
                    <p className="text-gray-500 font-medium">{student.code} • <span className={`text-${student.status === 'Đang học' ? 'green' : 'gray'}-600`}>{student.status}</span></p>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setShowEditModal(true)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors border border-indigo-200"
                    >
                       Sửa hồ sơ
                    </button>
                    <button 
                      onClick={() => setShowEnrollModal(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                       Đăng ký lớp mới
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                 <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="p-2 bg-gray-50 rounded-full text-gray-400"><Phone size={16} /></div>
                    <div>
                       <p className="text-xs text-gray-400">Điện thoại</p>
                       <p className="font-medium">{student.phone}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="p-2 bg-gray-50 rounded-full text-gray-400"><Calendar size={16} /></div>
                    <div>
                       <p className="text-xs text-gray-400">Ngày sinh</p>
                       <p className="font-medium">{student.dob}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="p-2 bg-gray-50 rounded-full text-gray-400"><User size={16} /></div>
                    <div>
                       <p className="text-xs text-gray-400">Phụ huynh</p>
                       <p className="font-medium">{student.parentName}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
         <div className="flex gap-6 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('info')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
               Thông tin chung
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
               Lịch sử học tập
            </button>
            <button 
              onClick={() => setActiveTab('finance')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'finance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
               Tài chính & Công nợ
            </button>
            <button 
              onClick={() => setActiveTab('feedback')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'feedback' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
               Chăm sóc & Feedback
            </button>
         </div>
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
         {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                     <User size={18} className="text-indigo-600" /> Thông tin cá nhân
                  </h3>
                  <div className="space-y-3 text-sm">
                     <div className="grid grid-cols-3 py-2 border-b border-gray-50">
                        <span className="text-gray-500">Họ và tên</span>
                        <span className="col-span-2 font-medium">{student.fullName}</span>
                     </div>
                     <div className="grid grid-cols-3 py-2 border-b border-gray-50">
                        <span className="text-gray-500">Giới tính</span>
                        <span className="col-span-2 font-medium">{student.gender}</span>
                     </div>
                     <div className="grid grid-cols-3 py-2 border-b border-gray-50">
                        <span className="text-gray-500">Ngày sinh</span>
                        <span className="col-span-2 font-medium">{student.dob}</span>
                     </div>
                     <div className="grid grid-cols-3 py-2 border-b border-gray-50">
                        <span className="text-gray-500">Địa chỉ</span>
                        <span className="col-span-2 font-medium">Chưa cập nhật</span>
                     </div>
                  </div>
               </div>
               
               <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                     <User size={18} className="text-indigo-600" /> Thông tin phụ huynh
                  </h3>
                   <div className="space-y-3 text-sm">
                     <div className="grid grid-cols-3 py-2 border-b border-gray-50">
                        <span className="text-gray-500">Họ tên PH1</span>
                        <span className="col-span-2 font-medium">{student.parentName}</span>
                     </div>
                     <div className="grid grid-cols-3 py-2 border-b border-gray-50">
                        <span className="text-gray-500">Số điện thoại 1</span>
                        <span className="col-span-2 font-medium text-blue-600 cursor-pointer">{student.phone}</span>
                     </div>
                     <div className="grid grid-cols-3 py-2 border-b border-gray-50">
                        <span className="text-gray-500">Họ tên PH2</span>
                        <span className="col-span-2 font-medium text-gray-400 italic">Chưa cập nhật</span>
                     </div>
                     <div className="grid grid-cols-3 py-2 border-b border-gray-50">
                        <span className="text-gray-500">Số điện thoại 2</span>
                        <span className="col-span-2 font-medium text-gray-400 italic">Chưa cập nhật</span>
                     </div>
                     <div className="grid grid-cols-3 py-2 border-b border-gray-50">
                        <span className="text-gray-500">Email</span>
                        <span className="col-span-2 font-medium text-gray-400 italic">Chưa cập nhật</span>
                     </div>
                     <div className="grid grid-cols-3 py-2 border-b border-gray-50">
                        <span className="text-gray-500">Địa chỉ</span>
                        <span className="col-span-2 font-medium text-gray-400 italic">Chưa cập nhật</span>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'history' && (
            <div>
               <h3 className="font-bold text-gray-800 mb-4">Các lớp đã tham gia</h3>
               <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-gray-50 font-semibold text-gray-600">
                        <tr>
                           <th className="px-4 py-3">Tên lớp</th>
                           <th className="px-4 py-3">Giáo trình</th>
                           <th className="px-4 py-3">Thời gian</th>
                           <th className="px-4 py-3">Kết quả</th>
                           <th className="px-4 py-3 text-center">Trạng thái</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        <tr className="hover:bg-gray-50">
                           <td className="px-4 py-3 font-medium text-indigo-600">Tiếng Anh Giao Tiếp K12</td>
                           <td className="px-4 py-3">Cambridge Movers</td>
                           <td className="px-4 py-3">01/09/2023 - Nay</td>
                           <td className="px-4 py-3">--</td>
                           <td className="px-4 py-3 text-center">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Đang học</span>
                           </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                           <td className="px-4 py-3 font-medium text-indigo-600">Tiếng Anh Mầm Non Bee 1</td>
                           <td className="px-4 py-3">Super Safari 1</td>
                           <td className="px-4 py-3">01/01/2023 - 30/08/2023</td>
                           <td className="px-4 py-3 font-medium">Giỏi (9.0)</td>
                           <td className="px-4 py-3 text-center">
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">Hoàn thành</span>
                           </td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {activeTab === 'finance' && (
            <div className="text-center py-10">
               <div className="bg-gray-50 inline-block p-4 rounded-full mb-3">
                  <DollarSign size={32} className="text-gray-400" />
               </div>
               <p className="text-gray-500">Chức năng đang được phát triển</p>
            </div>
         )}

         {activeTab === 'feedback' && (
            <div className="space-y-8">
               {/* Call Feedback Section */}
               <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="bg-green-500 text-white px-3 py-1 text-sm font-bold uppercase inline-block">
                         Phản hồi từ Khách hàng liên hệ qua điện thoại
                      </h3>
                      <button 
                        onClick={() => setShowReportModal(true)}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Xem báo cáo
                      </button>
                  </div>
                  <div className="overflow-x-auto border border-gray-200">
                      <table className="w-full text-sm text-left border-collapse">
                          <thead>
                              <tr className="bg-green-500 text-white font-bold text-xs">
                                  <th className="p-2 border-r border-green-400 text-center w-10">STT</th>
                                  <th className="p-2 border-r border-green-400">Phụ Huynh</th>
                                  <th className="p-2 border-r border-green-400">Học viên</th>
                                  <th className="p-2 border-r border-green-400 w-16">Trạng thái</th>
                                  <th className="p-2 border-r border-green-400">Giáo Viên</th>
                                  <th className="p-2 border-r border-green-400">Chương trình học</th>
                                  <th className="p-2 border-r border-green-400">Chăm sóc khách hàng</th>
                                  <th className="p-2 border-r border-green-400">Cơ sở vật chất</th>
                                  <th className="p-2 border-r border-green-400 w-16">Điểm TB</th>
                                  <th className="p-2 border-r border-green-400">Người gọi</th>
                              </tr>
                          </thead>
                          <tbody>
                              {callFeedbacks.map((fb, idx) => (
                                  <tr key={fb.id} className="border-b border-gray-200">
                                      <td className="p-2 border-r border-gray-200 text-center">{idx + 1}</td>
                                      <td className="p-2 border-r border-gray-200 font-bold">{student.parentName} <br/><span className="font-normal text-xs">{student.phone}</span></td>
                                      <td className="p-2 border-r border-gray-200">{fb.studentName} <br/><span className="text-xs text-gray-500">{fb.className}</span></td>
                                      <td className="p-2 border-r border-gray-200 text-center">{fb.status}</td>
                                      <td className="p-2 border-r border-gray-200 text-center">{fb.teacher || '---'}</td>
                                      <td className="p-2 border-r border-gray-200 text-center">{fb.curriculumScore || '---'}</td>
                                      <td className="p-2 border-r border-gray-200">
                                          {fb.content} <br/> 
                                          {fb.careScore && <span className="font-bold">{fb.careScore}</span>}
                                      </td>
                                      <td className="p-2 border-r border-gray-200 text-center">{fb.facilitiesScore || '---'}</td>
                                      <td className="p-2 border-r border-gray-200 text-center font-bold">{fb.averageScore || '---'}</td>
                                      <td className="p-2 border-r border-gray-200">{fb.caller}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
               </div>

               {/* Form Feedback Section */}
               <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="bg-green-500 text-white px-3 py-1 text-sm font-bold uppercase inline-block">
                         Phản hồi từ Khách hàng điền qua FORM
                      </h3>
                  </div>
                  <div className="overflow-x-auto border border-gray-200">
                      <table className="w-full text-sm text-left border-collapse">
                          <thead>
                              <tr className="bg-green-500 text-white font-bold text-xs">
                                  <th className="p-2 border-r border-green-400 text-center w-10">STT</th>
                                  <th className="p-2 border-r border-green-400">Phụ Huynh</th>
                                  <th className="p-2 border-r border-green-400">Học viên</th>
                                  <th className="p-2 border-r border-green-400">Giáo Viên</th>
                                  <th className="p-2 border-r border-green-400">Chương trình học</th>
                                  <th className="p-2 border-r border-green-400">Chăm sóc khách hàng</th>
                                  <th className="p-2 border-r border-green-400">Cơ sở vật chất</th>
                                  <th className="p-2 border-r border-green-400 w-16">Điểm TB</th>
                              </tr>
                          </thead>
                          <tbody>
                               {formFeedbacks.map((fb, idx) => (
                                  <tr key={fb.id} className="border-b border-gray-200">
                                      <td className="p-2 border-r border-gray-200 text-center">{idx + 1}</td>
                                      <td className="p-2 border-r border-gray-200 font-bold">{student.parentName} <br/><span className="font-normal text-xs">{student.phone}</span></td>
                                      <td className="p-2 border-r border-gray-200">{fb.studentName} <br/><span className="text-xs text-gray-500">{fb.className}</span></td>
                                      <td className="p-2 border-r border-gray-200 text-center">{fb.teacher || '---'}</td>
                                      <td className="p-2 border-r border-gray-200 text-center">{fb.curriculumScore || '---'}</td>
                                      <td className="p-2 border-r border-gray-200">
                                          {fb.content} <br/> 
                                          {fb.careScore && <span className="font-bold">{fb.careScore}</span>}
                                      </td>
                                      <td className="p-2 border-r border-gray-200 text-center">{fb.facilitiesScore || '---'}</td>
                                      <td className="p-2 border-r border-gray-200 text-center font-bold">{fb.averageScore || '---'}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Sửa hồ sơ học viên</h3>
                <p className="text-sm text-indigo-600">{student.fullName}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={22} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <User size={16} className="text-indigo-600" /> Thông tin cá nhân
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                      <input
                        type="date"
                        value={editForm.dob}
                        onChange={(e) => setEditForm({...editForm, dob: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Parent Info */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <User size={16} className="text-indigo-600" /> Thông tin phụ huynh
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên PH1 *</label>
                        <input
                          type="text"
                          value={editForm.parentName}
                          onChange={(e) => setEditForm({...editForm, parentName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SĐT 1 *</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên PH2</label>
                        <input
                          type="text"
                          value={editForm.parentName2}
                          onChange={(e) => setEditForm({...editForm, parentName2: e.target.value})}
                          placeholder="Nhập tên PH2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SĐT 2</label>
                        <input
                          type="tel"
                          value={editForm.phone2}
                          onChange={(e) => setEditForm({...editForm, phone2: e.target.value})}
                          placeholder="Nhập SĐT 2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        placeholder="Nhập email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        placeholder="Nhập địa chỉ"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={() => { alert('Đã lưu thay đổi!'); setShowEditModal(false); }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Class Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-teal-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Đăng ký lớp mới</h3>
                <p className="text-sm text-teal-600">Học viên: {student.fullName}</p>
              </div>
              <button onClick={() => setShowEnrollModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={22} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn lớp học *</label>
                <select
                  value={enrollForm.classId}
                  onChange={(e) => setEnrollForm({...enrollForm, classId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Chọn lớp --</option>
                  {classes.filter(c => c.status === 'Đang học').map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.teacher} ({cls.schedule})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={enrollForm.startDate}
                  onChange={(e) => setEnrollForm({...enrollForm, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số buổi đăng ký</label>
                <input
                  type="number"
                  value={enrollForm.sessions}
                  onChange={(e) => setEnrollForm({...enrollForm, sessions: parseInt(e.target.value)})}
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={enrollForm.notes}
                  onChange={(e) => setEnrollForm({...enrollForm, notes: e.target.value})}
                  rows={3}
                  placeholder="Ghi chú thêm..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {enrollForm.classId && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Lớp đã chọn:</strong> {classes.find(c => c.id === enrollForm.classId)?.name}
                  </p>
                  <p className="text-sm text-blue-600">
                    Giáo viên: {classes.find(c => c.id === enrollForm.classId)?.teacher}
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowEnrollModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={() => { 
                  if (!enrollForm.classId) {
                    alert('Vui lòng chọn lớp học!');
                    return;
                  }
                  alert('Đã đăng ký lớp thành công!'); 
                  setShowEnrollModal(false); 
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Xác nhận đăng ký
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-teal-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Báo cáo phản hồi khách hàng</h3>
                <p className="text-sm text-teal-600">Học viên: {student.fullName}</p>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={22} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[60vh]">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-700">{callFeedbacks.length + formFeedbacks.length}</p>
                  <p className="text-xs text-blue-600">Tổng phản hồi</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-700">{callFeedbacks.length}</p>
                  <p className="text-xs text-green-600">Qua điện thoại</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-700">{formFeedbacks.length}</p>
                  <p className="text-xs text-purple-600">Qua Form</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-700">4.5</p>
                  <p className="text-xs text-orange-600">Điểm TB</p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Điểm đánh giá chi tiết</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-40">Giáo viên</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{width: '90%'}}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-12">4.5/5</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-40">Chương trình học</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-12">4.3/5</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-40">Chăm sóc khách hàng</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div className="bg-purple-500 h-3 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-12">4.6/5</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-40">Cơ sở vật chất</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div className="bg-orange-500 h-3 rounded-full" style={{width: '88%'}}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-12">4.4/5</span>
                  </div>
                </div>
              </div>

              {/* Recent Feedbacks */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Phản hồi gần đây</h4>
                <div className="space-y-3">
                  {[...callFeedbacks, ...formFeedbacks].slice(0, 3).map((fb, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-800">{fb.studentName}</span>
                        <span className={`text-xs px-2 py-1 rounded ${fb.type === 'Call' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                          {fb.type === 'Call' ? 'Điện thoại' : 'Form'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{fb.content}</p>
                      {fb.averageScore && (
                        <p className="text-sm mt-2"><span className="text-gray-500">Điểm TB:</span> <span className="font-bold text-orange-600">{fb.averageScore}</span></p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Đóng
              </button>
              <button
                onClick={() => { alert('Đang xuất báo cáo...'); }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Xuất PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
