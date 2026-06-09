/**
 * Danh sách hotline khủng hoảng. Các số dưới đây là số công khai tại Việt Nam.
 * ⚠️ Vận hành: nên kiểm tra lại giờ hoạt động định kỳ (có thể thay đổi).
 */
export interface Hotline {
  name: string;
  number: string;
  hours: string;
  is24h: boolean;
  isFree: boolean;
  note?: string;
}

export const HOTLINES: Hotline[] = [
  {
    name: 'Cấp cứu y tế',
    number: '115',
    hours: '24/7',
    is24h: true,
    isFree: true,
    note: 'Nguy hiểm tức thời đến tính mạng',
  },
  {
    name: 'Đường dây nóng Ngày Mai',
    number: '096 306 1414',
    hours: '13:00–20:30 (các ngày trong tuần)',
    is24h: false,
    isFree: false,
    note: 'Hỗ trợ tâm lý cho người trầm cảm & có ý định tự tử',
  },
  {
    name: 'Tổng đài Quốc gia Bảo vệ Trẻ em',
    number: '111',
    hours: '24/7',
    is24h: true,
    isFree: true,
    note: 'Dành cho trẻ em & người dưới 18 tuổi',
  },
];

export const DISCLAIMER =
  'Các bài đánh giá và thông tin trên website chỉ mang tính chất tham khảo, không có giá trị thay thế chẩn đoán y khoa chuyên môn.';
