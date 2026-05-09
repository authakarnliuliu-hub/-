import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileDown, FileUp, FileText, Settings, Activity, Plus, Search, Edit2, Eye, Download, Trash2, MoreVertical, RefreshCw, Loader2, Users, UserPlus, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { DocumentForm } from './DocumentForm';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';

const COLORS = ['#ea580c', '#c2410c', '#f97316', '#fb923c'];

export function Dashboard({ documents, loading, isAdmin, currentUser, users, onAddUser, onUpdateUser, onDeleteUser, onAdd, onUpdate, onDelete, onRefresh }) {
  function getNextSerial() {
    if (!documents || documents.length === 0) return 1;
    const serials = documents.map(d => Number(d.serial)).filter(s => !isNaN(s));
    return serials.length === 0 ? 1 : Math.max(...serials) + 1;
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [quickDoc, setQuickDoc] = useState({
    type: 'INBOUND',
    serial: getNextSerial().toString(),
    date: format(new Date(), 'yyyy-MM-dd'),
    docNumber: '',
    from: '',
    to: '',
    subject: '',
    action: '',
    remarks: '',
  });

  const activeDocs = documents.filter(d => d.status === 'ACTIVE');
  
  const filteredDocs = activeDocs
    .filter(d => 
      d.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.from.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.serial - a.serial);

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    onAdd(quickDoc);
    setQuickDoc({
      type: 'INBOUND',
      serial: (getNextSerial() + 1).toString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      docNumber: '',
      from: '',
      to: '',
      subject: '',
      action: '',
      remarks: '',
    });
  };

  const handleEdit = (doc) => {
    if (!isAdmin) return;
    setEditingDoc(doc);
    setViewingDoc(null);
    setIsFormOpen(true);
  };

  const handleView = (doc) => {
    setViewingDoc(doc);
    setEditingDoc(null);
    setIsFormOpen(true);
  };

  const handleSubmit = (data) => {
    if (editingDoc) {
      onUpdate(editingDoc.id, data);
    } else {
      onAdd(data);
    }
  };
  
  const stats = [
    { label: 'หนังสือรับ', count: activeDocs.filter(d => d.type === 'INBOUND').length, icon: FileDown, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'หนังสือส่ง', count: activeDocs.filter(d => d.type === 'OUTBOUND').length, icon: FileUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'คำสั่ง', count: activeDocs.filter(d => d.type === 'ORDER').length, icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'บันทึกข้อความ', count: activeDocs.filter(d => d.type === 'MEMO').length, icon: Settings, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const monthlyData = [
    { name: 'ม.ค.', inbound: 12, outbound: 8, order: 5, memo: 10 },
    { name: 'ก.พ.', inbound: 19, outbound: 12, order: 8, memo: 15 },
    { name: 'มี.ค.', inbound: 15, outbound: 10, order: 6, memo: 12 },
    { name: 'เม.ย.', inbound: 22, outbound: 15, order: 10, memo: 20 },
    { name: 'พ.ค.', inbound: activeDocs.filter(d => d.type === 'INBOUND').length, outbound: activeDocs.filter(d => d.type === 'OUTBOUND').length, order: activeDocs.filter(d => d.type === 'ORDER').length, memo: activeDocs.filter(d => d.type === 'MEMO').length },
  ];

  const typeData = [
    { name: 'หนังสือรับ', value: activeDocs.filter(d => d.type === 'INBOUND').length || 1 },
    { name: 'หนังสือส่ง', value: activeDocs.filter(d => d.type === 'OUTBOUND').length || 1 },
    { name: 'คำสั่ง', value: activeDocs.filter(d => d.type === 'ORDER').length || 1 },
    { name: 'บันทึกข้อความ', value: activeDocs.filter(d => d.type === 'MEMO').length || 1 },
  ];

  const getTypeBadge = (type) => {
    switch (type) {
      case 'INBOUND': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none">หนังสือรับ</Badge>;
      case 'OUTBOUND': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">หนังสือส่ง</Badge>;
      case 'ORDER': return <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-none">คำสั่ง</Badge>;
      case 'MEMO': return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none">บันทึกข้อความ</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Registration Section - FOR ANY LOGGED IN USER */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Card className="border-none bg-white shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4">
             <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                ลงทะเบียนเอกสาร (Registration)
             </h3>
             <p className="text-orange-50 text-[11px] opacity-80">กรอกข้อมูลเพื่อลงทะเบียนเอกสารใหม่</p>
          </div>
          <CardContent className="p-8">
            <form onSubmit={handleQuickSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">1. ประเภทหนังสือ</label>
                  <select 
                    className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm font-semibold focus:ring-2 focus:ring-orange-200 outline-none transition-all cursor-pointer"
                    value={quickDoc.type}
                    onChange={(e) => setQuickDoc({ ...quickDoc, type: e.target.value })}
                  >
                    <option value="INBOUND">หนังสือรับ</option>
                    <option value="OUTBOUND">หนังสือส่ง</option>
                    <option value="ORDER">คำสั่ง</option>
                    <option value="MEMO">บันทึกข้อความ</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">2. ลำดับ</label>
                  <input 
                    placeholder="ลำดับเอกสาร"
                    className="w-full h-12 bg-orange-50 text-orange-700 border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    value={quickDoc.serial}
                    onChange={(e) => setQuickDoc({ ...quickDoc, serial: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">3. วันที่ลงรับ</label>
                  <input 
                    type="date"
                    className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    value={quickDoc.date}
                    onChange={(e) => setQuickDoc({ ...quickDoc, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">4. ที่ (เลขที่หนังสือ)</label>
                  <input 
                    placeholder="เช่น ศธ 0100/..."
                    className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    value={quickDoc.docNumber}
                    onChange={(e) => setQuickDoc({ ...quickDoc, docNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">5. จาก</label>
                  <input 
                    placeholder="หน่วยงานต้นทาง"
                    className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    value={quickDoc.from}
                    onChange={(e) => setQuickDoc({ ...quickDoc, from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">6. ถึง/ผู้รับผิดชอบ</label>
                  <input 
                    placeholder="หน่วยงานปลายทาง"
                    className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    value={quickDoc.to}
                    onChange={(e) => setQuickDoc({ ...quickDoc, to: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">7. เรื่อง</label>
                <input 
                  placeholder="ระบุหัวข้อเรื่อง"
                  className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  value={quickDoc.subject}
                  onChange={(e) => setQuickDoc({ ...quickDoc, subject: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">8. การปฏิบัติ</label>
                  <input 
                    placeholder="ระบุการปฏิบัติ..."
                    className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    value={quickDoc.action}
                    onChange={(e) => setQuickDoc({ ...quickDoc, action: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">9. หมายเหตุ</label>
                  <input 
                    placeholder="บันทึกข้อความเพิ่มเติม..."
                    className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    value={quickDoc.remarks}
                    onChange={(e) => setQuickDoc({ ...quickDoc, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">10. อัพโหลดไฟล์รูปภาพ หรือ PDF เอกสาร</label>
                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 text-center hover:border-orange-400 hover:bg-orange-50/30 transition-all cursor-pointer group">
                  <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                     <Plus className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-slate-600 font-bold">คลิกเลือกไฟล์หรือลากไฟล์มาวาง</p>
                  <p className="text-xs text-slate-400 mt-2">รองรับไฟล์ภาพคมชัดสูงจากมือถือ และไฟล์ PDF ทุกขนาด</p>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                 <button 
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-12 rounded-2xl shadow-xl shadow-orange-100 transition-all active:scale-95 flex items-center gap-3"
                 >
                   <Plus className="w-6 h-6" />
                   ยืนยันการลงทะเบียนเอกสาร
                 </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
      )}

      {/* COMPREHENSIVE DOCUMENT LIST */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-orange-950 tracking-tight flex items-center gap-2">
             <FileText className="w-5 h-5 text-orange-600" />
             รายการเอกสาร (Document Archive)
          </h2>
          <div className="flex items-center gap-3">
            {loading && <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              className="h-10 border-none bg-white rounded-xl shadow-sm flex items-center gap-2 text-slate-600"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </Button>
            <div className="relative w-48 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="ค้นหาเรื่อง หรือ เลขที่..." 
                className="pl-10 h-10 bg-white border-none rounded-xl focus:ring-2 focus:ring-orange-100 shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Card className="border-none bg-white/60 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-[100px] font-bold text-gray-600 py-6 pl-8">ลำดับ</TableHead>
                    <TableHead className="w-[120px] font-bold text-gray-600">ประเภท</TableHead>
                    <TableHead className="w-[120px] font-bold text-gray-600">วันที่</TableHead>
                    <TableHead className="w-[180px] font-bold text-gray-600">เลขที่หนังสือ</TableHead>
                    <TableHead className="font-bold text-gray-600">เรื่อง</TableHead>
                    <TableHead className="font-bold text-gray-600">ผู้ลงบันทึก</TableHead>
                    <TableHead className="font-bold text-gray-600 text-right pr-8">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode='popLayout'>
                    {filteredDocs.length > 0 ? (
                      filteredDocs.map((doc, idx) => (
                        <motion.tr
                          key={doc.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group border-b border-gray-50 hover:bg-orange-50/40 transition-colors"
                        >
                          <TableCell className="pl-8 py-5">
                            <span className="text-orange-700 font-bold text-xs">
                              {(documents.findIndex(d => d.id === doc.id) + 1).toString().padStart(5, '0')}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(doc.type)}
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm font-medium">
                            {format(new Date(doc.date), 'dd MMM yy', { locale: th })}
                          </TableCell>
                          <TableCell className="text-gray-900 font-bold text-sm">
                            {doc.docNumber}
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <p className="font-bold text-gray-900 truncate group-hover:text-orange-700 transition-colors">{doc.subject}</p>
                            <div className="flex gap-2 mt-1">
                               <span className="text-[10px] text-gray-400 font-medium">จาก: {doc.from}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-500 text-xs font-semibold">
                            {doc.recordedBy || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {(isAdmin || (currentUser && doc.recordedBy === currentUser.name)) && (
                                <Button size="icon" variant="ghost" onClick={() => handleEdit(doc)} className="h-9 w-9 rounded-xl hover:bg-white hover:text-orange-600 shadow-sm border-transparent">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" onClick={() => handleView(doc)} className="h-9 w-9 rounded-xl hover:bg-white hover:text-green-600 shadow-sm border-transparent">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => toast.success('กำลังดาวน์โหลดไฟล์...')} className="h-9 w-9 rounded-xl hover:bg-white hover:text-amber-600 shadow-sm border-transparent">
                                <Download className="w-4 h-4" />
                              </Button>
                              {isAdmin && (
                                <>
                                  <div className="w-px h-4 bg-gray-200 mx-1" />
                                  <Button size="icon" variant="ghost" onClick={() => onDelete(doc.id)} className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 border-transparent">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                            <div className="group-hover:hidden text-gray-300">
                               <MoreVertical className="w-5 h-5 ml-auto" />
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-40 text-center py-10 bg-gray-50/30">
                           <p className="text-sm text-gray-400 font-medium italic">ไม่พบบันทึกข้อมูลในระบบ</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DASHBOARD SECTION - NOW AT BOTTOM */}
      <div className="space-y-8">
        <h4 className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] px-2 flex items-center gap-2">
           <Activity className="w-4 h-4" /> 
           สรุปภาพรวมสถิติ (System Statistics)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all border-none bg-white/60 backdrop-blur-sm overflow-hidden group">
                <div className={cn("h-1 w-full", idx % 2 === 0 ? "bg-orange-500" : "bg-orange-300")} />
                <CardContent className="p-6" id={`stat-${idx}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                      <h3 className="text-3xl font-extrabold mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">
                        {stat.count}
                      </h3>
                    </div>
                    <div className={cn("p-4 rounded-2xl transition-all group-hover:rotate-12", stat.bg)}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none bg-white/60 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-orange-950 font-bold">
                วิเคราะห์แนวโน้มการรับ-ส่งเอกสาร (Monthly Trend)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="inbound" name="หนังสือรับ" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="outbound" name="หนังสือส่ง" fill="#c2410c" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="order" name="คำสั่ง" fill="#0891b2" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="memo" name="บันทึกข้อความ" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/60 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg text-orange-950 font-bold">ความถี่ประเภทงานวิชาการ</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#ea580c" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#06b6d4" />
                    <Cell fill="#6366f1" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {isAdmin && (
        <Card className="border-none bg-white/60 backdrop-blur-sm shadow-xl p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-3 rounded-2xl text-white shadow-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-950">จัดการบัญชีผู้รับผิดชอบ</h3>
                <p className="text-xs font-bold text-orange-600/70 uppercase tracking-widest leading-none mt-1">User Management (Admins Only)</p>
              </div>
            </div>
            
            <Button 
              onClick={() => { setIsUserManagementOpen(true); setEditingUser(null); }}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl px-6"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              เพิ่มผู้รับผิดชอบ
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(users || []).map(user => (
              <div 
                key={user.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{user.name}</h4>
                    <p className="text-xs font-medium text-slate-400">@{user.username}</p>
                    <Badge variant="outline" className={cn("mt-2 text-[10px]", user.role === 'ADMIN' ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-600 border-slate-100")}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => { setEditingUser(user); setIsUserManagementOpen(true); setNewUser({ name: user.name, username: user.username, password: user.password }); }}
                    className="h-9 w-9 rounded-xl hover:bg-orange-50 hover:text-orange-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {user.id !== 'admin' && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onDeleteUser(user.id)}
                      className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600"
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Dialog open={isUserManagementOpen} onOpenChange={setIsUserManagementOpen}>
            <DialogContent className="sm:max-w-[400px] border-none rounded-3xl p-8 bg-white shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-orange-600 text-center uppercase tracking-tight">
                  {editingUser ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้รับผิดชอบ'}
                </DialogTitle>
                <DialogDescription className="text-center font-medium text-slate-500">
                  ระบุรายละเอียดบัญชีผู้ใช้งาน
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">ชื่อ-นามสกุล</Label>
                    <Input 
                      className="h-12 border-slate-100 bg-slate-50 rounded-xl focus:ring-2 focus:ring-orange-100 font-bold text-slate-950"
                      placeholder="ใส่ชื่อผู้รับผิดชอบ"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</Label>
                    <Input 
                      className="h-12 border-slate-100 bg-slate-50 rounded-xl focus:ring-2 focus:ring-orange-100 font-bold text-slate-950"
                      placeholder="ชื่อที่ใช้ล็อคอิน"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</Label>
                    <Input 
                      className="h-12 border-slate-100 bg-slate-50 rounded-xl focus:ring-2 focus:ring-orange-100 font-bold text-slate-950"
                      placeholder="รหัสผ่าน"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    if (editingUser) {
                      onUpdateUser(editingUser.id, newUser);
                      toast.success('อัปเดตผู้ใช้สำเร็จ');
                    } else {
                      onAddUser(newUser);
                      toast.success('เพิ่มผู้ใช้ใหม่สำเร็จ');
                    }
                    setIsUserManagementOpen(false);
                    setNewUser({ name: '', username: '', password: '' });
                  }}
                  className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-lg shadow-xl shadow-orange-100"
                >
                  {editingUser ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้งานใหม่'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      )}

      <DocumentForm 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingDoc(null); setViewingDoc(null); }}
        onSubmit={handleSubmit}
        initialData={editingDoc || viewingDoc}
        type={editingDoc?.type || viewingDoc?.type || 'INBOUND'}
        nextSerial={getNextSerial()}
        readOnly={!!viewingDoc}
      />
    </div>
  );
}
