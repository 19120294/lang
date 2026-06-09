import { Component, signal } from '@angular/core';
import { LucideAngularModule, Leaf, Search, LifeBuoy, ShieldCheck, ArrowRight, ArrowLeft, X, Users, HeartHandshake } from 'lucide-angular';

const SEEN_KEY = 'lang_onboarding_seen';
const AGE_KEY = 'lang_age_group'; // 'adult' | 'minor'

interface Slide {
  icon: any;
  title: string;
  body: string;
  accent: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent {
  readonly ArrowRight = ArrowRight;
  readonly ArrowLeft = ArrowLeft;
  readonly X = X;
  readonly Users = Users;
  readonly HeartHandshake = HeartHandshake;

  visible = signal(!localStorage.getItem(SEEN_KEY));
  step = signal(0);
  /** 'slides' → giới thiệu | 'age' → hỏi tuổi | 'minor' → lưu ý cho <18 */
  phase = signal<'slides' | 'age' | 'minor'>('slides');

  readonly slides: Slide[] = [
    {
      icon: Leaf,
      title: 'Chào mừng đến với Lặng',
      body: 'Một khoảng lặng để bạn lắng nghe chính mình. Tại đây bạn có thể hiểu cảm xúc, tra cứu kiến thức tâm lý và tìm sự hỗ trợ — hoàn toàn riêng tư.',
      accent: 'bg-sage-100 dark:bg-sage-700 text-sage-600 dark:text-sage-200',
    },
    {
      icon: Search,
      title: 'Khám phá nhẹ nhàng',
      body: 'Làm các bài đánh giá chuẩn quốc tế, đọc cẩm nang được chuyên gia review, theo dõi cảm xúc và viết nhật ký. Dữ liệu của bạn được lưu riêng tư.',
      accent: 'bg-calm-100 dark:bg-calm-600/40 text-calm-600 dark:text-calm-200',
    },
    {
      icon: ShieldCheck,
      title: 'Thông tin chỉ để tham khảo',
      body: 'Các bài đánh giá và nội dung trên Lặng không thay thế chẩn đoán y khoa chuyên môn. Nếu cần, hãy tìm gặp bác sĩ hoặc chuyên gia tâm lý.',
      accent: 'bg-sage-100 dark:bg-sage-700 text-sage-600 dark:text-sage-200',
    },
    {
      icon: LifeBuoy,
      title: 'Luôn có hỗ trợ khẩn cấp',
      body: 'Nếu bạn đang gặp khủng hoảng, nút "Cần hỗ trợ ngay" màu cam ở góc phải-dưới màn hình luôn sẵn sàng — kết nối bạn với hotline và số cấp cứu 115.',
      accent: 'bg-sos-100 dark:bg-sos-900/40 text-sos-600 dark:text-sos-300',
    },
  ];

  next(): void {
    if (this.step() < this.slides.length - 1) this.step.update(s => s + 1);
    else this.phase.set('age'); // sau giới thiệu → hỏi tuổi
  }

  prev(): void {
    if (this.step() > 0) this.step.update(s => s - 1);
  }

  skip(): void { this.phase.set('age'); }

  /** Xác nhận nhóm tuổi (age-gating theo NĐ13) */
  confirmAge(isAdult: boolean): void {
    localStorage.setItem(AGE_KEY, isAdult ? 'adult' : 'minor');
    if (isAdult) this.finish();
    else this.phase.set('minor'); // hiện lưu ý cho người dưới 18
  }

  private finish(): void {
    localStorage.setItem(SEEN_KEY, '1');
    this.visible.set(false);
  }

  finishMinor(): void { this.finish(); }
}
