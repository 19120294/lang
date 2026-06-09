export type FacilityArea = 'hn' | 'hcm' | 'dn' | 'online';
export type FacilityCost = 'free' | 'insurance' | 'affordable' | 'private';
export type FacilityType = 'online' | 'clinic' | 'hospital';

export interface Facility {
  id: string;
  name: string;
  description: string;
  address?: string;
  area: FacilityArea;
  cost: FacilityCost[];
  type: FacilityType[];
  phone?: string;
  website?: string;
  hours: string;
  verified: boolean;
  tags: string[];
}

export const AREA_LABELS: Record<FacilityArea, string> = {
  hn: 'Hà Nội', hcm: 'TP. Hồ Chí Minh', dn: 'Đà Nẵng', online: 'Online',
};
export const COST_LABELS: Record<FacilityCost, string> = {
  free: 'Miễn phí', insurance: 'BHYT', affordable: 'Bình dân', private: 'Dịch vụ',
};
export const TYPE_LABELS: Record<FacilityType, string> = {
  online: 'Online (video call)', clinic: 'Phòng khám', hospital: 'Bệnh viện',
};

export const FACILITIES: Facility[] = [
  {
    id: '1',
    name: 'Viện Sức khỏe Tâm thần Quốc gia',
    description: 'Đơn vị đầu ngành về sức khỏe tâm thần tại Việt Nam. Khám, điều trị và tư vấn tâm lý chuyên sâu.',
    address: '1A Tôn Thất Tùng, Đống Đa, Hà Nội',
    area: 'hn',
    cost: ['insurance', 'private'],
    type: ['clinic', 'hospital'],
    phone: '024 3869 2728',
    hours: 'Thứ 2–6: 7:30–16:30',
    verified: true,
    tags: ['tâm thần', 'trầm cảm', 'lo âu', 'trị liệu'],
  },
  {
    id: '2',
    name: 'Phòng Tâm lý Bệnh viện Bạch Mai',
    description: 'Khoa Tâm thần BV Bạch Mai — khám và điều trị các rối loạn tâm thần theo chuẩn quốc tế.',
    address: '78 Giải Phóng, Đống Đa, Hà Nội',
    area: 'hn',
    cost: ['insurance', 'affordable'],
    type: ['hospital', 'clinic'],
    phone: '024 3869 3731',
    hours: 'Thứ 2–6: 7:00–17:00',
    verified: true,
    tags: ['bệnh viện', 'BHYT', 'trầm cảm'],
  },
  {
    id: '3',
    name: 'Trung tâm Tư vấn Tâm lý Live & Love',
    description: 'Trung tâm tư vấn tâm lý, trị liệu cá nhân và nhóm tại Hà Nội. Có tư vấn online.',
    address: 'Hà Nội (địa chỉ cụ thể theo lịch hẹn)',
    area: 'hn',
    cost: ['affordable', 'private'],
    type: ['clinic', 'online'],
    hours: 'Thứ 2–7: 8:00–20:00',
    verified: true,
    tags: ['tư vấn', 'trị liệu', 'online'],
  },
  {
    id: '4',
    name: 'Bệnh viện Tâm thần TP. Hồ Chí Minh',
    description: 'Cơ sở điều trị tâm thần công lập lớn nhất phía Nam. Nhận khám BHYT và dịch vụ.',
    address: '766 Võ Văn Kiệt, Quận 5, TP. HCM',
    area: 'hcm',
    cost: ['insurance', 'affordable'],
    type: ['hospital'],
    phone: '028 3835 5243',
    hours: 'Hàng ngày: 6:30–17:00',
    verified: true,
    tags: ['bệnh viện', 'BHYT', 'tâm thần'],
  },
  {
    id: '5',
    name: 'Phòng Tư vấn Tâm lý – ĐH Khoa học Xã hội và Nhân văn HCM',
    description: 'Cung cấp dịch vụ tư vấn tâm lý miễn phí và chi phí thấp cho sinh viên và cộng đồng.',
    address: '10-12 Đinh Tiên Hoàng, Quận 1, TP. HCM',
    area: 'hcm',
    cost: ['free', 'affordable'],
    type: ['clinic'],
    hours: 'Thứ 2–6: 8:00–11:00, 13:30–16:30',
    verified: true,
    tags: ['miễn phí', 'sinh viên', 'tư vấn'],
  },
  {
    id: '6',
    name: 'MindCare Vietnam (Online)',
    description: 'Nền tảng tư vấn tâm lý online kết nối với chuyên gia có chứng chỉ hành nghề.',
    area: 'online',
    cost: ['affordable', 'private'],
    type: ['online'],
    website: '[CẦN VERIFY]',
    hours: 'Linh hoạt theo lịch chuyên gia',
    verified: false,
    tags: ['online', 'linh hoạt', 'tư vấn'],
  },
  {
    id: '7',
    name: 'Khoa Tâm thần – Bệnh viện C Đà Nẵng',
    description: 'Khoa tâm thần của Bệnh viện C Đà Nẵng, nhận khám và điều trị các rối loạn tâm thần.',
    address: '122 Hải Phòng, Hải Châu, Đà Nẵng',
    area: 'dn',
    cost: ['insurance', 'affordable'],
    type: ['hospital'],
    phone: '0236 3822 410',
    hours: 'Thứ 2–6: 7:00–16:30',
    verified: true,
    tags: ['bệnh viện', 'BHYT', 'Đà Nẵng'],
  },
  {
    id: '8',
    name: 'Đường dây hỗ trợ sức khỏe tâm thần 1800 599 920',
    description: 'Đường dây hỗ trợ miễn phí, tư vấn và can thiệp khủng hoảng tâm lý. Hoạt động trong giờ hành chính.',
    area: 'online',
    cost: ['free'],
    type: ['online'],
    phone: '1800 599 920',
    hours: '8:00–22:00 hàng ngày · [CẦN VERIFY giờ chính xác]',
    verified: false,
    tags: ['hotline', 'miễn phí', 'khủng hoảng'],
  },
];
