import { Component, signal, inject, OnInit } from '@angular/core';
import { LucideAngularModule, ShieldCheck, EyeOff, Send, Heart, HandHeart, Flag, Clock, BadgeCheck, TriangleAlert, Eye, UserRound } from 'lucide-angular';
import { CrisisService } from '../../core/services/crisis.service';
import { CommunityApiService, ApiPost } from '../../core/services/community-api.service';

interface Post {
  id: string;
  content: string;
  likes: number;
  hugs: number;
  time: string;
  status: 'approved' | 'pending';
  hasCW: boolean;
  cwLabel?: string;
  cwVisible?: boolean;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './community.component.html',
})
export class CommunityComponent implements OnInit {
  readonly ShieldCheck = ShieldCheck;
  readonly EyeOff = EyeOff;
  readonly Send = Send;
  readonly Heart = Heart;
  readonly HandHeart = HandHeart;
  readonly Flag = Flag;
  readonly Clock = Clock;
  readonly BadgeCheck = BadgeCheck;
  readonly TriangleAlert = TriangleAlert;
  readonly Eye = Eye;
  readonly UserRound = UserRound;

  private crisis = inject(CrisisService);
  private api = inject(CommunityApiService);

  draft = signal('');
  submitted = signal(false);
  sending = signal(false);

  private readonly mockPosts: Post[] = [
    {
      id: '1',
      content: 'Hồi mình mệt nhất, mình tập chỉ làm một việc nhỏ mỗi ngày — dọn giường, uống đủ nước. Nghe đơn giản nhưng nó kéo mình ra khỏi cảm giác bất lực. Bạn không cần phải ổn ngay, chỉ cần nhích từng chút một thôi.',
      likes: 128, hugs: 54, time: '2 giờ trước', status: 'approved', hasCW: false,
    },
    {
      id: '2',
      content: 'Có những ngày mình thấy mọi thứ thật vô nghĩa. Nhưng việc viết ra cảm xúc mỗi tối và nói chuyện với một người bạn đã giúp mình thấy nhẹ hơn rất nhiều. Nếu bạn đang thấy như vậy, xin đừng giữ một mình…',
      likes: 96, hugs: 71, time: 'Hôm qua', status: 'approved', hasCW: true, cwLabel: 'Nhắc tới giai đoạn trầm cảm', cwVisible: false,
    },
    {
      id: '3',
      content: 'Mình đã từng nghĩ rằng tìm chuyên gia tâm lý là "yếu đuối". Bây giờ mình hiểu đó là hành động dũng cảm nhất mình từng làm. Nếu bạn đang phân vân, hãy thử một lần.',
      likes: 215, hugs: 88, time: '2 ngày trước', status: 'approved', hasCW: false,
    },
  ];

  posts = signal<Post[]>(this.mockPosts);

  ngOnInit(): void {
    this.api.getApproved().subscribe({
      next: list => this.posts.set(list.length ? list.map(p => this.toPost(p)) : []),
      error: () => { /* offline → giữ mock */ },
    });
  }

  onDraft(e: Event): void {
    const text = (e.target as HTMLTextAreaElement).value;
    this.draft.set(text);
    if (this.crisis.detectRisk(text)) this.crisis.openSos();
  }

  submit(): void {
    const content = this.draft().trim();
    if (!content || this.sending()) return;
    this.sending.set(true);
    this.api.submit(content).subscribe({
      next: res => {
        this.sending.set(false);
        this.submitted.set(true);
        this.draft.set('');
        if (res.riskDetected) this.crisis.openSos();
      },
      error: () => {
        // Offline: vẫn hiển thị màn "chờ duyệt" để không mất nội dung trải nghiệm
        this.sending.set(false);
        this.submitted.set(true);
        this.draft.set('');
      },
    });
  }

  toggleCW(id: string): void {
    this.posts.update(list => list.map(p => p.id === id ? { ...p, cwVisible: true } : p));
  }

  like(id: string): void {
    this.posts.update(list => list.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    this.api.react(id, 'like').subscribe({ error: () => {} });
  }

  hug(id: string): void {
    this.posts.update(list => list.map(p => p.id === id ? { ...p, hugs: p.hugs + 1 } : p));
    this.api.react(id, 'hug').subscribe({ error: () => {} });
  }

  reported = signal<Set<string>>(new Set());

  report(id: string): void {
    if (this.reported().has(id)) return;
    this.reported.update(s => new Set(s).add(id));
    this.api.report(id).subscribe({ error: () => {} });
  }

  private toPost(p: ApiPost): Post {
    return {
      id: p.id,
      content: p.content,
      likes: p.likes,
      hugs: p.hugs,
      time: this.relativeTime(p.createdAt),
      status: 'approved',
      hasCW: p.hasCW,
      cwLabel: p.cwLabel ?? undefined,
      cwVisible: false,
    };
  }

  private relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Hôm qua';
    return `${days} ngày trước`;
  }
}
