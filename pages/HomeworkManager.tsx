import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Plus, X, Save, Trash2, Check, Edit2, ChevronDown } from 'lucide-react';
import { useClasses } from '../src/hooks/useClasses';
import { useStudents } from '../src/hooks/useStudents';
import { useAuth } from '../src/hooks/useAuth';
import { usePermissions } from '../src/hooks/usePermissions';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../src/config/firebase';
import { ClassModel, Student } from '../types';

interface Homework {
  id: string;
  name: string;
}

interface StudentHomeworkRecord {
  studentId: string;
  studentName: string;
  homeworks: {
    [homeworkId: string]: {
      completed: boolean;
      score: number | null;
    };
  };
  note: string;
}

interface HomeworkSession {
  id?: string;
  classId: string;
  className: string;
  sessionId: string;
  sessionNumber: number;
  sessionDate: string;
  homeworks: Homework[];
  studentRecords: StudentHomeworkRecord[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export const HomeworkManager: React.FC = () => {
  const { classes } = useClasses();
  const { students: allStudents } = useStudents({});
  const { user, staffData } = useAuth();
  const { shouldShowOnlyOwnClasses, staffId } = usePermissions();

  // State
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
  // Homework state
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [newHomeworkName, setNewHomeworkName] = useState('');
  const [studentRecords, setStudentRecords] = useState<StudentHomeworkRecord[]>([]);
  const [existingRecordId, setExistingRecordId] = useState<string | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Bulk homework state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkClassId, setBulkClassId] = useState('');
  const [bulkFromSession, setBulkFromSession] = useState(1);
  const [bulkToSession, setBulkToSession] = useState(10);
  const [bulkHomeworks, setBulkHomeworks] = useState<string[]>(['']);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkSessions, setBulkSessions] = useState<any[]>([]);

  // Filter classes for teachers
  const filteredClasses = useMemo(() => {
    const onlyOwn = shouldShowOnlyOwnClasses('homework');
    // Show all active classes (exclude only completed/cancelled)
    const excludeStatuses = ['Đã kết thúc', 'Đã hủy', 'Kết thúc'];
    
    // Debug log
    console.log('[HomeworkManager] Total classes:', classes.length);
    console.log('[HomeworkManager] Class statuses:', [...new Set(classes.map(c => c.status))]);
    
    if (!onlyOwn || !staffData) {
      const result = classes.filter(c => !excludeStatuses.includes(c.status || ''));
      console.log('[HomeworkManager] Filtered (all staff):', result.length);
      return result;
    }
    
    const myName = staffData.name;
    const result = classes.filter(cls => 
      !excludeStatuses.includes(cls.status || '') &&
      (cls.teacher === myName || cls.assistant === myName || cls.foreignTeacher === myName)
    );
    console.log('[HomeworkManager] Filtered (own classes):', result.length);
    return result;
  }, [classes, shouldShowOnlyOwnClasses, staffData]);

  // Get students in selected class
  const studentsInClass = useMemo(() => {
    if (!selectedClassId) return [];
    const selectedClass = classes.find(c => c.id === selectedClassId);
    if (!selectedClass) return [];
    
    return allStudents.filter(s => 
      s.classId === selectedClassId || 
      s.class === selectedClass.name ||
      s.className === selectedClass.name
    ).filter(s => s.status === 'Đang học' || s.status === 'Học thử' || s.status === 'Nợ phí');
  }, [selectedClassId, classes, allStudents]);

  // Load sessions when class is selected
  useEffect(() => {
    const loadSessions = async () => {
      if (!selectedClassId) {
        setSessions([]);
        return;
      }
      
      setLoadingSessions(true);
      try {
        const sessionsSnap = await getDocs(
          query(collection(db, 'classSessions'), where('classId', '==', selectedClassId))
        );
        const data = sessionsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a: any, b: any) => a.sessionNumber - b.sessionNumber);
        setSessions(data);
      } catch (err) {
        console.error('Error loading sessions:', err);
      } finally {
        setLoadingSessions(false);
      }
    };
    
    loadSessions();
  }, [selectedClassId]);

  // Load existing homework record when session is selected
  useEffect(() => {
    const loadExistingRecord = async () => {
      if (!selectedClassId || !selectedSessionId) {
        setHomeworks([]);
        setStudentRecords([]);
        setExistingRecordId(null);
        return;
      }
      
      setLoading(true);
      try {
        const recordsSnap = await getDocs(
          query(
            collection(db, 'homeworkRecords'),
            where('classId', '==', selectedClassId),
            where('sessionId', '==', selectedSessionId)
          )
        );
        
        if (!recordsSnap.empty) {
          const record = recordsSnap.docs[0];
          const data = record.data() as HomeworkSession;
          setExistingRecordId(record.id);
          setHomeworks(data.homeworks || []);
          setStudentRecords(data.studentRecords || []);
        } else {
          // Initialize empty records for students
          setExistingRecordId(null);
          setHomeworks([]);
          setStudentRecords(
            studentsInClass.map(s => ({
              studentId: s.id,
              studentName: s.fullName || s.name || '',
              homeworks: {},
              note: ''
            }))
          );
        }
      } catch (err) {
        console.error('Error loading homework record:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadExistingRecord();
  }, [selectedClassId, selectedSessionId, studentsInClass]);

  // Add new homework
  const handleAddHomework = () => {
    if (!newHomeworkName.trim()) return;
    
    const newHomework: Homework = {
      id: `hw_${Date.now()}`,
      name: newHomeworkName.trim()
    };
    
    setHomeworks([...homeworks, newHomework]);
    
    // Initialize this homework for all students
    setStudentRecords(prev => prev.map(record => ({
      ...record,
      homeworks: {
        ...record.homeworks,
        [newHomework.id]: { completed: false, score: null }
      }
    })));
    
    setNewHomeworkName('');
  };

  // Remove homework
  const handleRemoveHomework = (homeworkId: string) => {
    setHomeworks(prev => prev.filter(h => h.id !== homeworkId));
    setStudentRecords(prev => prev.map(record => {
      const { [homeworkId]: removed, ...rest } = record.homeworks;
      return { ...record, homeworks: rest };
    }));
  };

  // Toggle homework completion
  const handleToggleCompleted = (studentId: string, homeworkId: string) => {
    setStudentRecords(prev => prev.map(record => {
      if (record.studentId !== studentId) return record;
      return {
        ...record,
        homeworks: {
          ...record.homeworks,
          [homeworkId]: {
            ...record.homeworks[homeworkId],
            completed: !record.homeworks[homeworkId]?.completed
          }
        }
      };
    }));
  };

  // Update score
  const handleScoreChange = (studentId: string, homeworkId: string, score: string) => {
    const scoreNum = score === '' ? null : parseFloat(score);
    setStudentRecords(prev => prev.map(record => {
      if (record.studentId !== studentId) return record;
      return {
        ...record,
        homeworks: {
          ...record.homeworks,
          [homeworkId]: {
            ...record.homeworks[homeworkId],
            score: scoreNum
          }
        }
      };
    }));
  };

  // Update note
  const handleNoteChange = (studentId: string, note: string) => {
    setStudentRecords(prev => prev.map(record => {
      if (record.studentId !== studentId) return record;
      return { ...record, note };
    }));
  };

  // Save homework records
  const handleSave = async () => {
    if (!selectedClassId || !selectedSessionId) {
      alert('Vui lòng chọn lớp và buổi học!');
      return;
    }
    
    if (homeworks.length === 0) {
      alert('Vui lòng thêm ít nhất 1 bài tập!');
      return;
    }
    
    setSaving(true);
    try {
      const selectedClass = classes.find(c => c.id === selectedClassId);
      const selectedSession = sessions.find(s => s.id === selectedSessionId);
      
      // Build record data
      const recordData: any = {
        classId: selectedClassId,
        className: selectedClass?.name || '',
        sessionId: selectedSessionId,
        sessionNumber: selectedSession?.sessionNumber || 0,
        sessionDate: selectedSession?.date || '',
        homeworks,
        studentRecords: studentRecords || [],
        updatedAt: new Date().toISOString(),
        createdBy: staffData?.name || user?.displayName || 'Unknown'
      };
      
      if (existingRecordId) {
        // Update existing record - don't change createdAt
        await updateDoc(doc(db, 'homeworkRecords', existingRecordId), recordData);
      } else {
        // Create new record - add createdAt
        recordData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'homeworkRecords'), recordData);
        setExistingRecordId(docRef.id);
      }
      
      alert('Đã lưu thành công!');
    } catch (err: any) {
      console.error('Error saving homework:', err);
      alert('Có lỗi xảy ra khi lưu: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // Load sessions for bulk modal
  const loadBulkSessions = async (classId: string) => {
    if (!classId) {
      setBulkSessions([]);
      return;
    }
    try {
      const q = query(collection(db, 'classSessions'), where('classId', '==', classId));
      const snapshot = await getDocs(q);
      const sessionsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => a.sessionNumber - b.sessionNumber);
      setBulkSessions(sessionsData);
      
      // Set default range
      if (sessionsData.length > 0) {
        setBulkFromSession(1);
        setBulkToSession(Math.min(10, sessionsData.length));
      }
    } catch (err) {
      console.error('Error loading bulk sessions:', err);
    }
  };

  // Handle bulk class change
  const handleBulkClassChange = (classId: string) => {
    setBulkClassId(classId);
    loadBulkSessions(classId);
  };

  // Add bulk homework input
  const handleAddBulkHomeworkInput = () => {
    setBulkHomeworks(prev => [...prev, '']);
  };

  // Update bulk homework
  const handleBulkHomeworkChange = (index: number, value: string) => {
    setBulkHomeworks(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Remove bulk homework input
  const handleRemoveBulkHomeworkInput = (index: number) => {
    setBulkHomeworks(prev => prev.filter((_, i) => i !== index));
  };

  // Save bulk homework
  const handleSaveBulkHomework = async () => {
    const validHomeworks = bulkHomeworks.filter(h => h.trim());
    if (!bulkClassId || validHomeworks.length === 0) {
      alert('Vui lòng chọn lớp và nhập ít nhất 1 bài tập!');
      return;
    }

    if (bulkFromSession > bulkToSession) {
      alert('Buổi bắt đầu phải nhỏ hơn hoặc bằng buổi kết thúc!');
      return;
    }

    setBulkSaving(true);
    try {
      const selectedClass = classes.find(c => c.id === bulkClassId);
      const targetSessions = bulkSessions.filter(
        s => s.sessionNumber >= bulkFromSession && s.sessionNumber <= bulkToSession
      );

      if (targetSessions.length === 0) {
        alert('Không tìm thấy buổi học trong khoảng đã chọn!');
        return;
      }

      // Create homework list with IDs
      const homeworkList = validHomeworks.map(name => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name
      }));

      let created = 0;
      let updated = 0;

      for (const session of targetSessions) {
        // Check if record exists
        const existingQ = query(
          collection(db, 'homeworkRecords'),
          where('classId', '==', bulkClassId),
          where('sessionId', '==', session.id)
        );
        const existingSnap = await getDocs(existingQ);

        if (!existingSnap.empty) {
          // Update existing - merge homeworks
          const existingDoc = existingSnap.docs[0];
          const existingData = existingDoc.data();
          const existingHomeworks = existingData.homeworks || [];
          
          // Add new homeworks that don't exist
          const newHomeworks = homeworkList.filter(
            h => !existingHomeworks.some((eh: any) => eh.name === h.name)
          );
          
          if (newHomeworks.length > 0) {
            await updateDoc(doc(db, 'homeworkRecords', existingDoc.id), {
              homeworks: [...existingHomeworks, ...newHomeworks],
              updatedAt: new Date().toISOString()
            });
            updated++;
          }
        } else {
          // Create new record
          await addDoc(collection(db, 'homeworkRecords'), {
            classId: bulkClassId,
            className: selectedClass?.name || '',
            sessionId: session.id,
            sessionNumber: session.sessionNumber,
            sessionDate: session.date || '',
            homeworks: homeworkList,
            studentRecords: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: staffData?.name || user?.displayName || 'Unknown'
          });
          created++;
        }
      }

      alert(`Đã thêm bài tập vào ${created} buổi mới và cập nhật ${updated} buổi có sẵn!`);
      setShowBulkModal(false);
      setBulkHomeworks(['']);
      
      // Reload if viewing same class
      if (selectedClassId === bulkClassId && selectedSessionId) {
        loadHomeworkRecord(selectedSessionId);
      }
    } catch (err: any) {
      console.error('Error saving bulk homework:', err);
      alert('Có lỗi xảy ra: ' + (err.message || err));
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            Quản lý Bài tập về nhà
          </h2>
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={18} />
            Thêm bài tập hàng loạt
          </button>
        </div>
        
        {/* Class and Session Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn lớp học</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedSessionId('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn lớp --</option>
              {filteredClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn buổi học</label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              disabled={!selectedClassId || loadingSessions}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">-- Chọn buổi học --</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>
                  Buổi {session.sessionNumber} - {session.date} ({session.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Homework Management */}
      {selectedSessionId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Khai báo Bài tập</h3>
          
          {/* Add Homework */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newHomeworkName}
              onChange={(e) => setNewHomeworkName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddHomework()}
              placeholder="Tên bài tập..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddHomework}
              disabled={!newHomeworkName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={18} />
              Thêm Bài tập
            </button>
          </div>
          
          {/* Homework Tags */}
          {homeworks.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {homeworks.map(hw => (
                <span 
                  key={hw.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {hw.name}
                  <button
                    onClick={() => handleRemoveHomework(hw.id)}
                    className="ml-1 text-blue-500 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Student Records Table */}
      {selectedSessionId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                        Tên Học sinh
                      </th>
                      {homeworks.map(hw => (
                        <th key={hw.id} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b min-w-[150px]">
                          <div className="flex flex-col items-center">
                            <span>{hw.name}</span>
                            <span className="text-xs font-normal text-gray-500 flex items-center gap-1">
                              <Edit2 size={10} /> Điểm
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b min-w-[200px]">
                        Ghi chú
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {studentRecords.length > 0 ? (
                      studentRecords.map(record => (
                        <tr key={record.studentId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {record.studentName}
                          </td>
                          {homeworks.map(hw => {
                            const hwRecord = record.homeworks[hw.id] || { completed: false, score: null };
                            return (
                              <td key={hw.id} className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleToggleCompleted(record.studentId, hw.id)}
                                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                      hwRecord.completed 
                                        ? 'bg-green-500 border-green-500 text-white' 
                                        : 'border-gray-300 hover:border-green-400'
                                    }`}
                                  >
                                    {hwRecord.completed && <Check size={14} />}
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={hwRecord.score ?? ''}
                                    onChange={(e) => handleScoreChange(record.studentId, hw.id, e.target.value)}
                                    placeholder=""
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              </td>
                            );
                          })}
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={record.note}
                              onChange={(e) => handleNoteChange(record.studentId, e.target.value)}
                              placeholder="Ghi chú..."
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={homeworks.length + 2} className="px-4 py-8 text-center text-gray-400">
                          {homeworks.length === 0 
                            ? 'Vui lòng thêm bài tập để bắt đầu chấm điểm'
                            : 'Không có học sinh trong lớp này'
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Save Button */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                <button
                  onClick={handleSave}
                  disabled={saving || homeworks.length === 0}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Lưu Dữ liệu
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedSessionId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Chọn lớp và buổi học</h3>
          <p className="text-gray-400">Vui lòng chọn lớp học và buổi học để quản lý bài tập về nhà</p>
        </div>
      )}

      {/* Bulk Homework Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Thêm bài tập hàng loạt</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Class Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn lớp học</label>
                <select
                  value={bulkClassId}
                  onChange={(e) => handleBulkClassChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Chọn lớp --</option>
                  {filteredClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              {/* Session Range */}
              {bulkClassId && bulkSessions.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Từ buổi</label>
                    <select
                      value={bulkFromSession}
                      onChange={(e) => setBulkFromSession(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      {bulkSessions.map(s => (
                        <option key={s.id} value={s.sessionNumber}>Buổi {s.sessionNumber}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đến buổi</label>
                    <select
                      value={bulkToSession}
                      onChange={(e) => setBulkToSession(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      {bulkSessions.map(s => (
                        <option key={s.id} value={s.sessionNumber}>Buổi {s.sessionNumber}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {bulkClassId && bulkSessions.length === 0 && (
                <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                  Lớp này chưa có buổi học nào. Vui lòng tạo buổi học trước.
                </p>
              )}

              {/* Homework List */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh sách bài tập</label>
                <div className="space-y-2">
                  {bulkHomeworks.map((hw, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={hw}
                        onChange={(e) => handleBulkHomeworkChange(index, e.target.value)}
                        placeholder={`Bài tập ${index + 1}...`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                      {bulkHomeworks.length > 1 && (
                        <button
                          onClick={() => handleRemoveBulkHomeworkInput(index)}
                          className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddBulkHomeworkInput}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Thêm bài tập
                </button>
              </div>

              {/* Preview */}
              {bulkClassId && bulkSessions.length > 0 && (
                <div className="bg-purple-50 p-3 rounded-lg text-sm">
                  <p className="text-purple-700">
                    <strong>Xem trước:</strong> Sẽ thêm {bulkHomeworks.filter(h => h.trim()).length} bài tập 
                    vào {Math.max(0, bulkToSession - bulkFromSession + 1)} buổi 
                    (Buổi {bulkFromSession} → Buổi {bulkToSession})
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveBulkHomework}
                disabled={bulkSaving || !bulkClassId || bulkSessions.length === 0 || bulkHomeworks.filter(h => h.trim()).length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {bulkSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Thêm hàng loạt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
