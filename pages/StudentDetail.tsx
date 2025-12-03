
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Phone, Mail, MapPin, Calendar, BookOpen, DollarSign, Clock, MessageSquare, FileText } from 'lucide-react';
import { MOCK_STUDENTS, MOCK_FEEDBACKS } from '../mockData';

export const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'finance' | 'feedback'>('info');

  // In a real app, fetch data based on ID
  const student = MOCK_STUDENTS.find(s => s.id === id) || MOCK_STUDENTS[0];
  
  // Filter feedbacks for this student (mock logic)
  const callFeedbacks = MOCK_FEEDBACKS.filter(f => f.type === 'Call');
  const formFeedbacks = MOCK_FEEDBACKS.filter(f => f.type === 'Form');

  if (!student) return <div>Không tìm thấy học viên</div>;

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
                    <button className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors">
                       Sửa hồ sơ
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
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
                        <span className="text-gray-500">Họ tên PH</span>
                        <span className="col-span-2 font-medium">{student.parentName}</span>
                     </div>
                     <div className="grid grid-cols-3 py-2 border-b border-gray-50">
                        <span className="text-gray-500">Số điện thoại</span>
                        <span className="col-span-2 font-medium text-blue-600 cursor-pointer">{student.phone}</span>
                     </div>
                     <div className="grid grid-cols-3 py-2 border-b border-gray-50">
                        <span className="text-gray-500">Email</span>
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
                      <button className="text-xs text-blue-600 hover:underline">Xem báo cáo</button>
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
    </div>
  );
};
