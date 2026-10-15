import jsPDF from 'jspdf';

export interface ContractData {
  contractId: string;
  studentName: string;
  mssv: string;
  bedCode: string;
  createdAt: string;
  roomFee?: number;
  deposit?: number;
  startDate?: string;
  endDate?: string;
  building?: string;
  room?: string;
  citizenId?: string;
  phone?: string;
}

// jsPDF helvetica has no Unicode support, strip diacritics to avoid broken font.
const ascii = (v: string): string =>
  v.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

const fmtDate = (v?: string): string => {
  if (!v) return '...';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? ascii(v) : d.toLocaleDateString('vi-VN');
};

const fmtMoney = (v?: number): string =>
  typeof v === 'number' && Number.isFinite(v) ? `${v.toLocaleString('vi-VN')} VND` : '...';

export const generateContractPDF = (data: ContractData) => {
  const doc = new jsPDF();
  const t = (s: string) => ascii(s);
  let y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(t('CONG HOA XA HOI CHU NGHIA VIET NAM'), 105, y, { align: 'center' });
  y += 7;
  doc.setFontSize(11);
  doc.text(t('Doc lap - Tu do - Hanh phuc'), 105, y, { align: 'center' });
  y += 10;
  doc.setFontSize(16);
  doc.text(t('HOP DONG THUE CHO O KY TUC XA'), 105, y, { align: 'center' });
  y += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(t(`So hop dong: ${data.contractId}`), 105, y, { align: 'center' });
  y += 6;
  doc.text(t(`Ngay tao: ${fmtDate(data.createdAt)}`), 105, y, { align: 'center' });
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text(t('BEN A: BAN QUAN LY KTX FPT'), 20, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  for (const line of [
    'Don vi: Ban quan ly Ky tuc xa FPT',
    'Dia chi: Khu Giao duc va Dao tao, KCNC Hoa Lac, Ha Noi',
    'Dai dien: Truong Ban quan ly KTX',
  ]) {
    doc.text(t(line), 20, y);
    y += 6;
  }
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.text(t('BEN B: SINH VIEN THUE CHO O'), 20, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  for (const line of [
    `Ho va ten: ${data.studentName}`,
    `MSSV: ${data.mssv}`,
    `CCCD: ${data.citizenId ?? '...'}`,
    `SDT: ${data.phone ?? '...'}`,
  ]) {
    doc.text(t(line), 20, y);
    y += 6;
  }
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.text(t('DIEU KHOAN HOP DONG'), 20, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  const terms = [
    `1. Ma giuong: ${data.bedCode} - Phong: ${data.room ?? '...'} - Toa: ${data.building ?? '...'}.`,
    `2. Thoi han thue: tu ${fmtDate(data.startDate)} den ${fmtDate(data.endDate)}.`,
    `3. Gia thue: ${fmtMoney(data.roomFee)}/thang. Tien coc: ${fmtMoney(data.deposit)}.`,
    '4. Noi quy tom tat: giu ve sinh chung, khong tu y doi giuong/phong,',
    '   bao quan tai san KTX, khong dan nguoi la qua dem khi chua dang ky.',
    '5. Gio gioi nghiem: 23:00. Ra/vao sau gio tren phai tuan thu quy dinh truc dem.',
    '6. Ben B cam ket dong phi dung han va chiu trach nhiem boi thuong neu lam hu hong co so vat chat.',
  ];
  for (const line of terms) {
    doc.text(t(line), 20, y);
    y += 6;
  }
  y += 6;

  doc.text(t('Dai dien Ben A'), 40, y, { align: 'center' });
  doc.text(t('Ben B (Sinh vien)'), 150, y, { align: 'center' });
  y += 6;
  doc.text(t('(Ky, ghi ro ho ten)'), 40, y, { align: 'center' });
  doc.text(t('(Ky, ghi ro ho ten)'), 150, y, { align: 'center' });

  doc.save(`Contract_${ascii(data.mssv)}_${ascii(data.bedCode)}.pdf`);
};
