export interface DailyTip {
  text: string;
  category: string;
}

/** Thẻ lời khuyên/bài học ngắn — nhẹ nhàng, không phán xét */
export const TIPS: DailyTip[] = [
  { category: 'Chánh niệm', text: 'Hôm nay, hãy thử dừng lại 1 phút và để ý 3 điều bạn đang nghe thấy. Quay về hiện tại là một cách nhẹ nhàng để bớt lo âu.' },
  { category: 'Tự chăm sóc', text: 'Bạn không cần phải làm xong mọi thứ hôm nay. Hoàn thành một việc nhỏ cũng đã là một thành công.' },
  { category: 'Lòng trắc ẩn', text: 'Hãy nói với chính mình điều bạn sẽ nói với một người bạn đang buồn. Bạn xứng đáng được đối xử dịu dàng.' },
  { category: 'Giấc ngủ', text: 'Thử tắt màn hình 30 phút trước khi ngủ. Một giấc ngủ ngon là món quà cho tâm trí ngày mai.' },
  { category: 'Kết nối', text: 'Nhắn cho một người bạn quý mến hôm nay — chỉ một câu "Dạo này bạn sao rồi?" cũng đủ ấm lòng cả hai.' },
  { category: 'Hơi thở', text: 'Khi căng thẳng, hãy thở ra dài hơn hít vào. Điều này giúp cơ thể dịu lại một cách tự nhiên.' },
  { category: 'Biết ơn', text: 'Trước khi ngủ, hãy nghĩ về một điều nhỏ khiến hôm nay bớt nặng nề hơn. Biết ơn nuôi dưỡng sự bình yên.' },
  { category: 'Ranh giới', text: 'Nói "không" với điều khiến bạn kiệt sức không phải là ích kỷ — đó là cách bạn bảo vệ năng lượng của mình.' },
  { category: 'Vận động', text: 'Một buổi đi bộ ngắn 10 phút có thể thay đổi tâm trạng nhiều hơn bạn nghĩ. Cơ thể và tâm trí luôn đi cùng nhau.' },
  { category: 'Chấp nhận', text: 'Cảm xúc khó chịu rồi cũng qua, như những đám mây. Bạn không phải là cảm xúc của mình — bạn là bầu trời.' },
];

/** Lấy chỉ số thẻ theo ngày trong năm (xoay vòng ổn định trong ngày) */
export function tipIndexForToday(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return dayOfYear % TIPS.length;
}
