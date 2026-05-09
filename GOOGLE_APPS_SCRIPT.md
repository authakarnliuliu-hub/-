# คู่มือการติดตั้งระบบจัดเก็บข้อมูลบน Google Sheets (ฉบับสมบูรณ์) 📝

คู่มือนี้จะช่วยให้คุณเชื่อมต่อระบบเข้ากับ **Google Sheets** เพื่อเก็บข้อมูลทั้ง **เอกสาร** และ **บัญชีผู้ใช้งาน** อย่างถาวร

---

## ขั้นตอนที่ 1: เตรียม Google Sheets
1. สร้างไฟล์ **Google Sheets** ใหม่ (ตั้งชื่อว่า "ระบบบริหารจัดการเอกสาร")
2. ระบบจะสร้างแผ่นงาน (Sheet) ให้โดยอัตโนมัติ 2 แผ่น คือ `Documents` และ `Users` เมื่อรันโค้ดครั้งแรก

---

## ขั้นตอนที่ 2: ตั้งค่า Google Apps Script
1. ในหน้า Google Sheets ไปที่เมนู **ส่วนขยาย (Extensions)** > **Apps Script**
2. จะเห็นไฟล์ชื่อ `รหัส.gs` (หรือ `Code.gs`) ให้ลบโค้ดเก่าออกให้หมด 
3. วางโค้ด "ฉบับสมบูรณ์" ด้านล่างนี้ลงไปครับ (ไม่ต้องสร้างไฟล์ `index.html` ใน Apps Script เพราะเราใช้หน้าเว็บจาก AI Studio ตัวนี้):

```javascript
/**
 * ระบบบริหารจัดการเอกสารและผู้ใช้งาน (ฉบับสมบูรณ์)
 * พัฒนาโดย ครูภัทรพล เมืองโคตร โรงเรียนองครักษ์
 */

const DOCS_SHEET = 'Documents';
const USERS_SHEET = 'Users';

const DOC_HEADERS = ['id', 'type', 'serial', 'date', 'docNumber', 'from', 'to', 'subject', 'action', 'remarks', 'status', 'recordedBy', 'createdAt'];
const USER_HEADERS = ['id', 'name', 'username', 'password', 'role', 'createdAt'];

function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // สร้างแผ่นงาน Documents
  let docSheet = ss.getSheetByName(DOCS_SHEET);
  if (!docSheet) {
    docSheet = ss.insertSheet(DOCS_SHEET);
    docSheet.getRange(1, 1, 1, DOC_HEADERS.length).setValues([DOC_HEADERS]);
    docSheet.setFrozenRows(1);
    docSheet.getRange(1, 1, 1, DOC_HEADERS.length).setBackground('#ea580c').setFontColor('#ffffff').setFontWeight('bold');
  }

  // สร้างแผ่นงาน Users
  let userSheet = ss.getSheetByName(USERS_SHEET);
  if (!userSheet) {
    userSheet = ss.insertSheet(USERS_SHEET);
    userSheet.getRange(1, 1, 1, USER_HEADERS.length).setValues([USER_HEADERS]);
    userSheet.setFrozenRows(1);
    userSheet.getRange(1, 1, 1, USER_HEADERS.length).setBackground('#1e293b').setFontColor('#ffffff').setFontWeight('bold');
    
    // เพิ่ม Admin เริ่มต้น
    userSheet.appendRow(['admin', 'แอดมินฝ่ายอำนวยการ', 'อำนวยการ', 'อำนวยการ', 'ADMIN', new Date()]);
  }
}

function doGet() {
  initSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // อ่านข้อมูลเอกสาร
  const docData = ss.getSheetByName(DOCS_SHEET).getDataRange().getValues();
  const docHeaders = docData.shift();
  const documents = docData.map(row => {
    let obj = {};
    docHeaders.forEach((h, i) => {
      let val = row[i];
      if (val instanceof Date) val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      obj[h] = val;
    });
    return obj;
  });

  // อ่านข้อมูลผู้ใช้
  const userData = ss.getSheetByName(USERS_SHEET).getDataRange().getValues();
  const userHeaders = userData.shift();
  const users = userData.map(row => {
    let obj = {};
    userHeaders.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });

  return ContentService.createTextOutput(JSON.stringify({ documents, users }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // จัดการเอกสาร
  if (params.target === 'DOCS') {
    const sheet = ss.getSheetByName(DOCS_SHEET);
    const headers = sheet.getRange(1, 1, 1, DOC_HEADERS.length).getValues()[0];
    
    if (params.actionType === 'ADD') {
      sheet.appendRow(headers.map(h => params.data[h] || ''));
    } else if (params.actionType === 'UPDATE') {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == params.id) {
          headers.forEach((h, hi) => {
            if (params.data[h] !== undefined && h !== 'id') sheet.getRange(i+1, hi+1).setValue(params.data[h]);
          });
          break;
        }
      }
    } else if (params.actionType === 'DELETE' || params.actionType === 'RECOVER') {
       // อัพเดทสถานะ
       const data = sheet.getDataRange().getValues();
       for (let i = 1; i < data.length; i++) {
         if (data[i][0] == params.id) {
           const statusIdx = headers.indexOf('status');
           sheet.getRange(i+1, statusIdx+1).setValue(params.actionType === 'DELETE' ? 'TRASHED' : 'ACTIVE');
           break;
         }
       }
    } else if (params.actionType === 'PERMANENT_DELETE') {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == params.id) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }
  } 
  
  // จัดการผู้ใช้
  else if (params.target === 'USERS') {
    const sheet = ss.getSheetByName(USERS_SHEET);
    const headers = sheet.getRange(1, 1, 1, USER_HEADERS.length).getValues()[0];
    
    if (params.actionType === 'ADD') {
      sheet.appendRow(headers.map(h => params.data[h] || ''));
    } else if (params.actionType === 'DELETE') {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == params.id) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }
  }

  return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
}
```

---

## ขั้นตอนที่ 3: ทำให้ใช้งานได้ (Deploy) - **สำคัญมาก!**
1. กดปุ่ม **บันทึก (แผ่นดิสก์)**
2. กดปุ่ม **การทำให้ใช้งานได้ (Deploy)** > **การทำให้ใช้งานได้ใหม่ (New Deployment)**
3. เลือกเฟือง > **แอปเว็บ (Web App)**
4. ตั้งค่า (ต้องตั้งตามนี้เท่านั้นไม่งั้นจะขึ้น Fetch Error):
   - **คำอธิบาย:** ตั้งอะไรก็ได้ เช่น "v1"
   - **เรียกใช้งานในฐานะ (Execute as):** `ฉัน (Me)`
   - **ผู้มีสิทธิ์เข้าถึง (Who has access):** `ทุกคน (Anyone)` <--- **ห้ามลืม! ต้องเลือกทุกคน (Anyone) ไม่ใช่ "ทุกคนที่มีบัญชี Google"**
5. กด **Deploy**
   - หากมีปุ่ม **ให้สิทธิ์เข้าถึง (Authorize Access)** ให้กดและเลือกบัญชี Google ของคุณ
   - หากขึ้นว่า "Google hasn't verified this app" ให้กด **Advanced** (ขั้นสูง) และกด **Go to... (unsafe)**
   - กด **Allow** (อนุญาต)
6. คัดลอก **URL แอปเว็บ** (ที่ลงท้ายด้วย `/exec`) มาครับ

> [!CAUTION]  
> **วิธีเช็คว่า URL ใช้ได้จริงไหม:**  
> ลองเปิด Browser ในโหมด **ไม่ระบุตัวตน (Incognito)** แล้ววาง URL นั้นลงไป ถ้ามันโชว์ข้อมูลเป็นตัวอักษร JSON (เช่น `{"documents":...}`) แสดงว่าใช้ได้ 100% ถ้ามันขึ้นหน้า Login Google แสดงว่าคุณยังไม่ได้ตั้งค่าเป็น "Anyone" ในขั้นตอนที่ 3.4 ครับ

---

## ขั้นตอนที่ 4: วาง URL ในโปรแกรม
1. กลับมาที่โปรแกรมนี้ เปิดไฟล์ `src/hooks/useDocuments.js`
2. วาง URL ใน `const API_URL = 'ที่นี่';` (บรรทัดที่ 4)
3. ระบบจะซิงค์ข้อมูลผู้ใช้งานและเอกสารไปยัง Google Sheets โดยอัตโนมัติ!

---
**พัฒนาโดย ครูภัทรพล เมืองโคตร โรงเรียนองครักษ์** 🚀
