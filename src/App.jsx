/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { useDocuments } from './hooks/useDocuments';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  LogOut, 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  Lock, 
  History, 
  PieChart,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // landing, dashboard
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { 
    documents, 
    users,
    loading,
    addDocument, 
    updateDocument, 
    deleteDocument, 
    recoverDocument, 
    permanentDelete,
    addUser,
    deleteUser,
    refresh
  } = useDocuments();

  const handleLogin = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setIsAdmin(user.role === 'ADMIN');
      setCurrentPage('dashboard');
      toast.success(`ยินดีต้อนรับ ${user.name}`);
      return true;
    }
    toast.error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    return false;
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    setCurrentPage('landing');
    toast.info('ออกจากระบบแล้ว');
  };

  const startSearching = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  const handleAdd = (data) => {
    if (!currentUser) {
      toast.error('ระบบลงทะเบียนสำหรับเจ้าหน้าที่เท่านั้น');
      return;
    }
    addDocument(data, currentUser);
    toast.success('บันทึกข้อมูลเรียบร้อยแล้ว');
  };

  const handleUpdate = (id, data) => {
    if (!isAdmin) return;
    updateDocument(id, data);
    toast.success('อัพเดทข้อมูลเรียบร้อยแล้ว');
  };

  const handleDelete = (id) => {
    if (!isAdmin) return;
    deleteDocument(id);
    toast.info('ย้ายรายการไปที่ถังขยะแล้ว');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100 selection:text-orange-900">
      <AnimatePresence mode="wait">
        {currentPage === 'landing' ? (
          <LandingPage 
            key="landing" 
            onSearch={startSearching} 
            onLogin={handleLogin}
            documents={documents}
          />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen"
          >
            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
              <header className="flex items-center justify-between mb-12">
                <div 
                  className="flex items-center gap-4 cursor-pointer group" 
                  onClick={() => setCurrentPage('landing')}
                >
                  <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-100 rotate-3 group-hover:rotate-0 transition-transform">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-orange-600 tracking-tighter">DOCSFLOW</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Saraban Management System</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {isAdmin && (
                    <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <span className="text-sm font-bold text-slate-600">Admin Mode Active</span>
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="group flex items-center gap-2 font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl px-4 py-7 transition-all border border-transparent hover:border-red-100"
                  >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    {isAdmin ? 'ออกจากระบบแอดมิน' : 'กลับหน้าหลัก'}
                  </Button>
                </div>
              </header>

              <Dashboard 
                documents={documents}
                loading={loading}
                isAdmin={isAdmin}
                currentUser={currentUser}
                users={users}
                onAddUser={addUser}
                onDeleteUser={deleteUser}
                onAdd={handleAdd}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onRefresh={refresh}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

function LandingPage({ onSearch, onLogin, documents }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const totalDocs = documents.length;
  const inboundDocs = documents.filter(d => d.type === 'INBOUND').length;
  const outboundDocs = documents.filter(d => d.type === 'OUTBOUND').length;
  const internalDocs = documents.filter(d => d.type === 'INTERNAL').length;

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onLogin(loginData.username, loginData.password);
    if (success) setIsLoginOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-50 via-white to-slate-50 overflow-hidden relative">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-100 rounded-full blur-[100px] opacity-40" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-slate-200 rounded-full blur-[100px] opacity-30" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center relative z-10"
      >
        <div className="space-y-12 text-center md:text-left">
          <div className="inline-flex items-center gap-3 bg-orange-50 p-2 pr-6 rounded-full border border-orange-100">
            <div className="bg-orange-600 p-2 rounded-full text-white shadow-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-orange-700 tracking-wider uppercase">กองอำนวยการสารบรรณ</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
              งาน <br />
              <span className="text-orange-600 underline decoration-orange-100 decoration-8 underline-offset-8">สารบรรณ</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
              ระบบสืบค้นและบริหารจัดการเอกสารราชการอิเล็กทรอนิกส์ <br />
              โรงเรียนองครักษ์
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
            <Button 
              onClick={onSearch}
              className="h-16 px-10 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-lg font-bold shadow-2xl shadow-orange-200 group flex items-center gap-4 transition-transform active:scale-95"
            >
              <Search className="w-6 h-6" />
              ค้นหาเอกสาร
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsLoginOpen(true)}
              className="h-16 px-10 border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl text-lg font-bold shadow-lg flex items-center gap-4 transition-transform active:scale-95"
            >
              <Lock className="w-6 h-6" />
              เจ้าหน้าที่ (Admin)
            </Button>
          </div>

          {/* Mini Stats for Mobile (Visible on small screens) */}
          <div className="md:hidden grid grid-cols-3 gap-4 pt-4">
             <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">รวม</p>
                <p className="text-xl font-black text-slate-900">{totalDocs}</p>
             </div>
             <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">รับ</p>
                <p className="text-xl font-black text-orange-600">{inboundDocs}</p>
             </div>
             <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">ส่ง</p>
                <p className="text-xl font-black text-blue-600">{outboundDocs}</p>
             </div>
          </div>
        </div>

        <div className="hidden md:block relative">
          {/* Main Dashboard Preview Card */}
          <div className="relative bg-white p-12 rounded-[56px] shadow-[0_50px_120px_-20px_rgba(234,88,12,0.15)] border border-slate-100">
            <div className="space-y-10">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                    <PieChart className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">สถิติระบบสารบรรณ</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Real-time Insights</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-black text-slate-900 leading-none">{totalDocs}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">เอกสารทั้งหมด</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-orange-50 rounded-[32px] border border-orange-100/50 space-y-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-orange-700">{inboundDocs}</p>
                    <p className="text-xs font-bold text-orange-600/70 uppercase tracking-wider">หนังสือรับ</p>
                  </div>
                </div>
                <div className="p-6 bg-amber-50 rounded-[32px] border-amber-100/50 space-y-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-600">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-amber-700">{outboundDocs}</p>
                    <p className="text-xs font-bold text-amber-600/70 uppercase tracking-wider">หนังสือส่ง</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-[32px] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">เอกสารคำสั่งภายใน</p>
                    <p className="text-[10px] font-bold text-slate-400">{internalDocs} รายการ</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                  ACTIVE
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-600 rounded-3xl -rotate-12 shadow-2xl flex items-center justify-center text-white">
             <Settings className="w-12 h-12" />
          </div>
          <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-white rounded-2xl rotate-12 shadow-xl border border-slate-100 flex items-center justify-center text-orange-600">
             <Search className="w-8 h-8" />
          </div>
        </div>
      </motion.div>

      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-[400px] border-none rounded-3xl p-8 bg-white/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-orange-600 text-center uppercase tracking-tight">Staff Login</DialogTitle>
            <DialogDescription className="text-center font-medium text-slate-500">
              สำหรับเจ้าหน้าที่อำนวยการและผู้ปฏิบัติงานประจำวัน
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</Label>
                <Input 
                  className="h-14 border-slate-100 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-orange-100 font-bold text-orange-950 text-base"
                  placeholder="อำนวยการ"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</Label>
                <Input 
                  type="password"
                  className="h-14 border-slate-100 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-orange-100 font-bold text-orange-950 text-base"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-xl shadow-xl shadow-orange-100 transition-transform active:scale-95"
            >
              Sign In to System
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <p className="text-[10px] font-medium text-slate-400">
          พัฒนาโดย ครูภัทรพล เมืองโคตร โรงเรียนองครักษ์
        </p>
      </div>
    </div>
  );
}
