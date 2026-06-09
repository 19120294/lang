/**
 * Kế hoạch an toàn cá nhân — dựa trên Stanley-Brown Safety Planning Intervention.
 * Dữ liệu CỰC kỳ nhạy cảm → chỉ lưu local trên thiết bị, không gửi server.
 */
export interface SafetyPlan {
  warningSigns: string[];     // 1. Dấu hiệu cảnh báo
  copingStrategies: string[]; // 2. Cách tự xoa dịu (làm một mình)
  distractions: string[];     // 3. Người/nơi giúp xao nhãng
  supportPeople: string[];    // 4. Người thân có thể nhờ giúp
  reasonsToLive: string[];    // 5. Lý do để sống / điều quan trọng
  safeEnvironment: string;    // 6. Làm cho môi trường an toàn hơn
}

export interface SafetyPlanSection {
  key: keyof SafetyPlan;
  title: string;
  hint: string;
  list: boolean;        // true = danh sách nhiều mục, false = 1 đoạn text
  placeholder: string;
}

export const SAFETY_SECTIONS: SafetyPlanSection[] = [
  {
    key: 'warningSigns', title: 'Dấu hiệu cảnh báo', list: true,
    hint: 'Những suy nghĩ, cảm xúc hoặc tình huống cho biết bạn đang bắt đầu khó khăn.',
    placeholder: 'VD: Mất ngủ nhiều đêm, thấy mọi thứ vô nghĩa…',
  },
  {
    key: 'copingStrategies', title: 'Cách tự xoa dịu', list: true,
    hint: 'Những việc bạn có thể tự làm để cảm thấy dịu lại (không cần ai khác).',
    placeholder: 'VD: Tập thở 4-7-8, nghe bản nhạc yêu thích, đi dạo…',
  },
  {
    key: 'distractions', title: 'Người & nơi giúp xao nhãng', list: true,
    hint: 'Gặp gỡ hoặc đến những nơi giúp bạn quên đi căng thẳng.',
    placeholder: 'VD: Quán cà phê quen, gọi cho bạn thân, ra công viên…',
  },
  {
    key: 'supportPeople', title: 'Người có thể nhờ giúp', list: true,
    hint: 'Người thân/bạn bè bạn có thể chia sẻ khi cần. Ghi cả tên và số nếu muốn.',
    placeholder: 'VD: Chị Lan – 09xx…, Mẹ, Người bạn thân…',
  },
  {
    key: 'reasonsToLive', title: 'Lý do để tiếp tục', list: true,
    hint: 'Những điều, con người, mục tiêu khiến cuộc sống của bạn đáng quý.',
    placeholder: 'VD: Gia đình, chú mèo của mình, chuyến đi sắp tới…',
  },
  {
    key: 'safeEnvironment', title: 'Giữ môi trường an toàn', list: false,
    hint: 'Cách hạn chế tiếp cận những thứ có thể gây hại khi bạn đang yếu lòng.',
    placeholder: 'VD: Nhờ người thân giữ giúp thuốc, tránh ở một mình khi quá buồn…',
  },
];

export const EMPTY_PLAN: SafetyPlan = {
  warningSigns: [], copingStrategies: [], distractions: [],
  supportPeople: [], reasonsToLive: [], safeEnvironment: '',
};
