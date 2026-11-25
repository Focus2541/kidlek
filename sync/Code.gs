/**
 * คิดเลขพอดี — ตัวซิงก์ประวัติระหว่างเครื่อง (เก็บในไฟล์ kidlek-sync.json บน Google Drive ของคุณเอง)
 * 1) เปลี่ยน SYNC_KEY ด้านล่างเป็นรหัสของคุณเอง (ตั้งยาว ๆ เดายาก)
 * 2) Deploy > New deployment > Web app : Execute as = Me, Who has access = Anyone
 * 3) เอาลิงก์ที่ลงท้าย /exec กับรหัสนี้ ไปใส่ในแอป (เมนู ⋯ > ซิงก์) ทั้งคอมและมือถือ
 */
const SYNC_KEY = 'เปลี่ยนเป็นรหัสของคุณ';
const FILE_NAME = 'kidlek-sync.json';

function file_() {
  const it = DriveApp.getFilesByName(FILE_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFile(FILE_NAME, JSON.stringify({ t: 0, data: null }), 'application/json');
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function ok_(key) {
  return SYNC_KEY.length >= 6 && !/[\u0E00-\u0E7F]/.test(SYNC_KEY) && key === SYNC_KEY;  // รหัสต้องยาว ≥ 6 ตัวและไม่ใช่ข้อความไทยตัวอย่าง
}

function doGet(e) {
  if (!ok_(e.parameter.key)) return out_({ error: 'key' });
  return out_(JSON.parse(file_().getBlob().getDataAsString()));
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (!ok_(body.key)) return out_({ error: 'key' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    file_().setContent(JSON.stringify({ t: Date.now(), data: body.data }));
  } finally {
    lock.releaseLock();
  }
  return out_({ ok: true });
}

/** กด Run ฟังก์ชันนี้ 1 ครั้งหลังวางโค้ด เพื่ออนุญาตสิทธิ์ Drive และสร้างไฟล์ */
function setup() {
  Logger.log('ไฟล์ซิงก์: ' + file_().getUrl());
}
