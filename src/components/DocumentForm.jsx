import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export function DocumentForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  type,
  nextSerial,
  readOnly = false
}) {
  const [formData, setFormData] = useState({
    type: type,
    serial: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    docNumber: '',
    from: '',
    to: '',
    subject: '',
    action: '',
    remarks: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: format(new Date(initialData.date), 'yyyy-MM-dd'),
      });
    } else {
      setFormData({
        type: type,
        serial: nextSerial.toString(),
        date: format(new Date(), 'yyyy-MM-dd'),
        docNumber: '',
        from: '',
        to: '',
        subject: '',
        action: '',
        remarks: '',
      });
    }
  }, [initialData, type, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-3xl border-none shadow-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {readOnly ? 'รายละเอียดเอกสาร' : (initialData ? 'แก้ไขข้อมูลเอกสาร' : 'ลงทะเบียนเอกสารใหม่')}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {readOnly ? 'ข้อมูลฉบับสมบูรณ์ที่บันทึกไว้ในระบบ' : 'กรอกรายละเอียดข้อมูลเพื่อให้ระบบทำการเก็บรวบรวมอย่างถูกต้อง'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">ประเภทหนังสือ</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => setFormData({ ...formData, type: v })}
                disabled={readOnly || !!initialData}
              >
                <SelectTrigger className="bg-gray-50 font-semibold h-11 rounded-xl">
                  <SelectValue placeholder="เลือกประเภทหนังสือ" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl shadow-xl border-gray-100">
                  <SelectItem value="INBOUND">หนังสือรับ</SelectItem>
                  <SelectItem value="OUTBOUND">หนังสือส่ง</SelectItem>
                  <SelectItem value="ORDER">คำสั่ง</SelectItem>
                  <SelectItem value="MEMO">บันทึกข้อความ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">ลำดับ (No.)</Label>
              <Input 
                placeholder="ลำดับเอกสาร"
                value={formData.serial} 
                onChange={e => setFormData({ ...formData, serial: e.target.value })}
                required
                disabled={readOnly}
                className="bg-gray-50 font-bold text-orange-600 h-11 rounded-xl" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">วันที่ลงรับ/วันที่ออก</Label>
              <Input 
                type="date" 
                value={formData.date} 
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                required
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">เลขที่หนังสือ (ศธ 0100/...)</Label>
              <Input 
                placeholder="ระบุเลขที่หนังสือ" 
                value={formData.docNumber} 
                onChange={e => setFormData({ ...formData, docNumber: e.target.value })}
                required
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">จาก</Label>
              <Input 
                placeholder="หน่วยงาน/บุคคลต้นทาง" 
                value={formData.from} 
                onChange={e => setFormData({ ...formData, from: e.target.value })}
                required
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">ถึง</Label>
              <Input 
                placeholder="หน่วยงาน/บุคคลปลายทาง" 
                value={formData.to} 
                onChange={e => setFormData({ ...formData, to: e.target.value })}
                required
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">เรื่อง (Subject)</Label>
            <Input 
              placeholder="ระบุหัวข้อเรื่อง" 
              value={formData.subject} 
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
              required
              disabled={readOnly}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">การปฏิบัติ</Label>
              <Input 
                placeholder="เช่น ทราบ, ดำเนินการ" 
                value={formData.action} 
                onChange={e => setFormData({ ...formData, action: e.target.value })}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">หมายเหตุ</Label>
              <Input 
                placeholder="ระบุเพิ่มเติม..." 
                value={formData.remarks} 
                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                disabled={readOnly}
              />
            </div>
          </div>

          {formData.recordedBy && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ผู้ลงบันทึก (Recorded By)</p>
              <p className="text-sm font-bold text-slate-700">{formData.recordedBy}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">แนบไฟล์ (รูปภาพ หรือ PDF)</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-orange-500 transition-colors cursor-pointer group">
              <p className="text-sm text-gray-500 group-hover:text-orange-600 transition-colors font-medium">คลิกเพื่ออัพโหลด หรือลากไฟล์มาวางที่นี่</p>
              <p className="text-[10px] text-gray-400 mt-1">ไฟล์ใหญ่เหมาะกับรูปถ่ายกล้องมือถือ คมชัดสูง</p>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">ปิด</Button>
            {!readOnly && (
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-8 shadow-lg shadow-orange-200">
                {initialData ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
