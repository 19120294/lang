import { Component, inject, signal, computed, effect, ElementRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MessageCircle, X, Send, Bot, LifeBuoy } from 'lucide-angular';
import { CrisisService } from '../../../core/services/crisis.service';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
  isCrisis?: boolean;
  action?: { label: string; route: string };
}

interface Intent {
  id: string;
  keywords: string[];     // đã chuẩn hóa (không dấu)
  replies: string[];      // nhiều biến thể
  action?: { label: string; route: string };
}

const STORAGE_KEY = 'lang_chat_history';

/** Bỏ dấu tiếng Việt + lowercase để khớp linh hoạt (cả khi gõ không dấu) */
function normalize(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './chatbot.component.html',
})
export class ChatbotComponent {
  readonly MessageCircle = MessageCircle;
  readonly X = X;
  readonly Send = Send;
  readonly Bot = Bot;
  readonly LifeBuoy = LifeBuoy;

  readonly crisis = inject(CrisisService);
  private router = inject(Router);

  private scrollBox = viewChild<ElementRef<HTMLElement>>('scrollBox');

  open = signal(false);
  draft = signal('');
  typing = signal(false);
  messages = signal<ChatMessage[]>(this.load());

  readonly canSend = computed(() => this.draft().trim().length > 0 && !this.typing());

  /** Câu gợi ý nhanh (quick replies) */
  readonly quickReplies = ['Mình thấy lo âu', 'Khó ngủ quá', 'Muốn làm bài đánh giá', 'Cần tìm chuyên gia'];

  /** Nhớ reply đã dùng theo intent để không lặp lại liên tiếp */
  private lastReplyIdx: Record<string, number> = {};

  private readonly intents: Intent[] = [
    {
      id: 'anxiety',
      keywords: ['lo au', 'lo lang', 'bon chon', 'hoi hop', 'cang thang', 'stress', 'ap luc', 'so hai', 'hoang loan', 'panic', 'bat an'],
      replies: [
        'Cảm giác lo âu rất mệt mỏi, mình hiểu. Khi tim đập nhanh và đầu óc quay cuồng, thử tập trung vào hơi thở có thể giúp cơ thể dịu lại.',
        'Lo âu là phản ứng tự nhiên, nhưng bạn không cần phải chịu đựng một mình. Một bài tập thở ngắn có thể giúp bạn lấy lại bình tĩnh ngay bây giờ.',
        'Nghe có vẻ bạn đang căng thẳng nhiều. Hãy thử dừng lại một chút và thở chậm — mình có thể hướng dẫn bạn.',
      ],
      action: { label: 'Thử bài tập thở', route: '/breathe' },
    },
    {
      id: 'depression',
      keywords: ['buon', 'tram cam', 'chan', 'vo nghia', 'met moi', 'tuyet vong', 'co don', 'trong rong', 'khong con thiet', 'chan nan', 'u am'],
      replies: [
        'Cảm ơn bạn đã chia sẻ điều này — không dễ để nói ra. Nếu cảm giác nặng nề kéo dài, một bài đánh giá ngắn có thể giúp bạn hiểu rõ hơn mình đang ở đâu.',
        'Mình rất tiếc khi bạn đang thấy như vậy. Bạn xứng đáng được quan tâm. Bạn có muốn thử một bài đánh giá nhẹ nhàng để hiểu cảm xúc của mình hơn không?',
        'Những ngày trống rỗng thật khó khăn. Hãy nhớ rằng cảm xúc này rồi sẽ dịu đi. Mình ở đây cùng bạn.',
      ],
      action: { label: 'Làm bài đánh giá', route: '/assessment' },
    },
    {
      id: 'sleep',
      keywords: ['ngu', 'mat ngu', 'kho ngu', 'thuc', 'ngu khong duoc', 'trang dem', 'insomnia'],
      replies: [
        'Giấc ngủ ảnh hưởng rất nhiều đến tâm trạng. Vài thói quen nhỏ buổi tối có thể tạo khác biệt lớn — mình có bài viết về điều này.',
        'Khó ngủ thật mệt. Thử bài tập thở 4-7-8 trước khi ngủ xem sao, nó giúp cơ thể thư giãn tự nhiên.',
      ],
      action: { label: 'Đọc về giấc ngủ', route: '/knowledge' },
    },
    {
      id: 'test',
      keywords: ['test', 'danh gia', 'kiem tra', 'phq', 'gad', 'dass', 'trac nghiem', 'thang do'],
      replies: [
        'Lặng có 3 thang đo chuẩn quốc tế: PHQ-9 (trầm cảm), GAD-7 (lo âu) và DASS-21 (tổng hợp). Kết quả chỉ để tham khảo, giúp bạn hiểu mình hơn.',
        'Bạn có thể làm bài đánh giá ẩn danh, không ai biết. Mình gợi ý bắt đầu với bài phù hợp nhất với điều bạn đang cảm thấy.',
      ],
      action: { label: 'Đến trang đánh giá', route: '/assessment' },
    },
    {
      id: 'expert',
      keywords: ['chuyen gia', 'bac si', 'gap', 'kham', 'tu van', 'co so', 'phong kham', 'tri lieu', 'tham van', 'benh vien'],
      replies: [
        'Tìm đến chuyên gia là một bước rất dũng cảm và đáng quý. Mình có thể giúp bạn tìm cơ sở hỗ trợ theo khu vực và chi phí.',
        'Trò chuyện với chuyên gia tâm lý có thể giúp ích rất nhiều. Bạn muốn mình lọc giúp cơ sở gần bạn không?',
      ],
      action: { label: 'Tìm cơ sở hỗ trợ', route: '/facilities' },
    },
    {
      id: 'breathing',
      keywords: ['tho', 'thu gian', 'binh tinh', 'thien', 'relax'],
      replies: [
        'Bài tập thở có hướng dẫn động sẽ giúp bạn lấy lại bình tĩnh trong 1-2 phút. Cùng thử nhé?',
        'Hít vào chậm, thở ra dài hơn — đó là cách đơn giản để dịu hệ thần kinh. Mình có vài bài thở có hướng dẫn.',
      ],
      action: { label: 'Bắt đầu thở', route: '/breathe' },
    },
    {
      id: 'journal',
      keywords: ['nhat ky', 'viet', 'ghi lai', 'tam su'],
      replies: [
        'Viết ra cảm xúc giúp giải tỏa rất nhiều, như trút bớt gánh nặng. Nhật ký của bạn được lưu riêng tư trên thiết bị.',
        'Đôi khi viết ra điều trong lòng giúp ta nhìn rõ hơn. Bạn có muốn mở nhật ký không?',
      ],
      action: { label: 'Mở nhật ký', route: '/journal' },
    },
    {
      id: 'mood',
      keywords: ['cam xuc', 'tam trang', 'theo doi', 'mood'],
      replies: [
        'Theo dõi cảm xúc mỗi ngày giúp bạn nhận ra xu hướng và hiểu mình hơn theo thời gian.',
      ],
      action: { label: 'Theo dõi cảm xúc', route: '/mood' },
    },
    {
      id: 'work_study',
      keywords: ['cong viec', 'cong viec qua tai', 'deadline', 'sep', 'dong nghiep', 'hoc', 'hoc tap', 'thi cu', 'bai vo', 'diem so', 'truong', 'kiet suc', 'burnout', 'qua tai'],
      replies: [
        'Áp lực công việc/học hành dồn dập rất dễ khiến mình kiệt sức. Bạn đã cho phép bản thân nghỉ ngơi một chút chưa?',
        'Khi mọi thứ chất đống, thử chia nhỏ thành từng việc một và làm điều quan trọng nhất trước. Bạn không cần ôm hết cùng lúc đâu.',
        'Cảm giác quá tải là tín hiệu cơ thể cần được nghỉ. Một quãng nghỉ ngắn để thở có thể giúp bạn lấy lại sức.',
      ],
      action: { label: 'Thử bài tập thở', route: '/breathe' },
    },
    {
      id: 'relationship',
      keywords: ['nguoi yeu', 'chia tay', 'cai nhau', 'mau thuan', 'gia dinh', 'bo me', 'ban be', 'moi quan he', 'tinh cam', 'phan boi', 'ly hon'],
      replies: [
        'Những rạn nứt trong quan hệ có thể đau hơn cả vết thương thể xác. Bạn đang thấy thế nào về chuyện đó?',
        'Mâu thuẫn với người mình quan tâm thật sự mệt mỏi. Bạn xứng đáng được lắng nghe và tôn trọng.',
        'Cảm ơn bạn đã chia sẻ chuyện riêng tư này. Đôi khi viết ra cảm xúc về mối quan hệ giúp ta nhìn rõ hơn.',
      ],
      action: { label: 'Viết nhật ký', route: '/journal' },
    },
    {
      id: 'lonely',
      keywords: ['co don', 'co doc', 'mot minh', 'khong ai', 'lac long', 'bi bo roi', 'khong ai hieu'],
      replies: [
        'Cảm giác cô đơn thật nặng nề, nhưng ngay lúc này bạn đang trò chuyện cùng mình — và mình thực sự ở đây. Bạn không hoàn toàn một mình đâu.',
        'Mình nghe thấy nỗi cô đơn trong lời bạn. Kết nối với một người, dù chỉ một tin nhắn nhỏ, đôi khi giúp ích nhiều hơn ta nghĩ.',
      ],
      action: { label: 'Tìm cộng đồng', route: '/community' },
    },
    {
      id: 'anger',
      keywords: ['tuc gian', 'gian', 'buc boi', 'kho chiu', 'cau gat', 'phat dien', 'uc che', 'gian du'],
      replies: [
        'Tức giận là cảm xúc hợp lý — nó cho biết điều gì đó quan trọng với bạn bị tổn thương. Thử hít thở sâu vài nhịp để cơn nóng dịu xuống nhé.',
        'Khi bực bội dâng lên, dừng lại và thở chậm có thể giúp bạn không bị cuốn theo. Bạn muốn thử cùng mình không?',
      ],
      action: { label: 'Bài tập thở', route: '/breathe' },
    },
    {
      id: 'grief',
      keywords: ['mat mat', 'qua doi', 'mat nguoi', 'tang', 'chia ly', 'ra di', 'mat di'],
      replies: [
        'Mình rất tiếc về mất mát của bạn. Nỗi đau này cần thời gian, và không có cách nào "đúng" để vượt qua. Hãy cho phép mình được buồn.',
        'Mất đi điều/người quan trọng là một trong những đau đớn lớn nhất. Bạn không cần phải mạnh mẽ ngay lúc này.',
      ],
    },
    {
      id: 'self_esteem',
      keywords: ['tu ti', 'vo dung', 'kem coi', 'that bai', 'ghet ban than', 'khong xung dang', 'toi te', 'do bo'],
      replies: [
        'Cách bạn đang nói về bản thân nghe thật khắt khe. Bạn sẽ nói gì với một người bạn trong hoàn cảnh này? Hãy thử dành sự dịu dàng đó cho chính mình.',
        'Một thất bại không định nghĩa con người bạn. Ai cũng có lúc vấp ngã — điều đó không làm bạn kém giá trị đi.',
      ],
    },
    {
      id: 'thanks',
      keywords: ['cam on', 'cam o', 'thank', 'tot qua', 'hay qua', 'tuyet'],
      replies: [
        'Mình luôn ở đây nếu bạn cần. Hãy nhẹ nhàng với chính mình nhé 💚',
        'Rất vui khi giúp được bạn. Chăm sóc bản thân là điều đáng quý 🌿',
      ],
    },
    {
      id: 'greeting',
      keywords: ['xin chao', 'chao ban', 'chao', 'hi', 'hello', 'alo', 'co do', 'co ai'],
      replies: [
        'Chào bạn 🌿 Mình ở đây để lắng nghe. Hôm nay bạn cảm thấy thế nào?',
        'Xin chào! Mình có thể giúp gì cho bạn hôm nay?',
      ],
    },
    {
      id: 'decline',
      keywords: ['khong', 'khum', 'hong', 'ko', 'k', 'thoi', 'khoi', 'chua', 'de sau', 'khong can', 'khong muon'],
      replies: [
        'Không sao cả, mình hoàn toàn hiểu. Mình vẫn ở đây bất cứ khi nào bạn cần. Bạn cứ thong thả nhé.',
        'Được thôi. Không có áp lực gì đâu. Nếu chỉ muốn trò chuyện vu vơ cũng được mà.',
        'Mình tôn trọng điều đó. Khi nào sẵn sàng, bạn có thể thử bài tập thở hoặc viết vài dòng nhật ký nhé.',
      ],
    },
    {
      id: 'affirm',
      keywords: ['co', 'uh', 'um', 'okela', 'oke', 'ok', 'duoc', 'dong y', 'vang', 'co a', 'muon'],
      replies: [
        'Tuyệt vời. Bạn muốn bắt đầu với điều gì? Mình có thể gợi ý bài tập thở, bài đánh giá, hoặc tìm chuyên gia.',
        'Được rồi! Bạn chọn một trong những gợi ý phía dưới nhé, hoặc kể cho mình nghe thêm.',
      ],
    },
    {
      id: 'how_are_you',
      keywords: ['ban the nao', 'ban khoe khong', 'ban la ai', 'ban lam duoc gi', 'giup gi', 'lam duoc gi'],
      replies: [
        'Mình là trợ lý của Lặng — mình giúp bạn tìm bài đánh giá, bài tập thở, kiến thức tâm lý và cơ sở hỗ trợ. Mình luôn sẵn sàng lắng nghe. Bạn đang cần gì?',
      ],
    },
  ];

  /** Câu đồng cảm xoay vòng khi không khớp intent (thay cho 1 câu default cứng) */
  private readonly fallbacks = [
    'Mình đang lắng nghe. Bạn có thể kể thêm một chút về điều bạn đang trải qua không?',
    'Cảm ơn bạn đã chia sẻ. Bạn muốn mình gợi ý: làm bài đánh giá, thử bài tập thở, hay tìm chuyên gia?',
    'Mình hiểu. Điều gì đang khiến bạn bận lòng nhất lúc này?',
    'Mình ở đây cùng bạn. Bạn có muốn thử một bài tập thở ngắn để dịu lại không?',
  ];
  private fallbackIdx = 0;

  constructor() {
    // Tự cuộn xuống cuối mỗi khi có tin mới / đang gõ
    effect(() => {
      this.messages(); this.typing();
      queueMicrotask(() => {
        const el = this.scrollBox()?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
    // Lưu lịch sử
    effect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages())));
  }

  toggle(): void { this.open.update(v => !v); }

  sendQuick(text: string): void {
    this.draft.set(text);
    this.send();
  }

  send(): void {
    const text = this.draft().trim();
    if (!text || this.typing()) return;
    this.push({ from: 'user', text });
    this.draft.set('');

    // Ưu tiên cao nhất: phát hiện rủi ro
    if (this.crisis.detectRisk(text)) {
      this.crisis.logEvent('chatbot');
      this.botRespond({
        from: 'bot',
        isCrisis: true,
        text: 'Mình thực sự lo cho bạn và rất trân trọng việc bạn nói ra điều này. Bạn không cô đơn. Hãy để mình kết nối bạn với người có thể hỗ trợ ngay bây giờ.',
      }, () => this.crisis.openSos());
      return;
    }

    this.botRespond(this.match(text));
  }

  /** Hiện "đang gõ" rồi mới đẩy câu trả lời — tạo cảm giác tự nhiên */
  private botRespond(msg: ChatMessage, after?: () => void): void {
    this.typing.set(true);
    const delay = 500 + Math.min(msg.text.length * 12, 900);
    setTimeout(() => {
      this.typing.set(false);
      this.push(msg);
      after?.();
    }, delay);
  }

  /** Chủ đề gần nhất (để hiểu ngữ cảnh khi user nói tiếp) */
  private lastIntentId: string | null = null;

  /** Từ chỉ cường độ → thêm câu đồng cảm mở đầu */
  private readonly intensityWords = ['rat', 'qua', 'lam', 'kinh khung', 'cuc ky', 'vo cung', 'khong chiu noi', 'khong the chiu', 'het suc', 'tot do', 'nhieu lam'];
  /** Từ chỉ tiếp diễn → hiểu là nói tiếp chủ đề trước */
  private readonly continueWords = ['van', 'con', 'nua', 'hoai', 'mai', 'lai', 'tiep tuc', 'nhu cu'];

  /** Chọn intent khớp nhiều keyword nhất (có fuzzy + ngữ cảnh + cường độ) */
  private match(text: string): ChatMessage {
    const norm = normalize(text);
    const words = norm.split(' ');

    let best: Intent | null = null;
    let bestScore = 0;
    for (const intent of this.intents) {
      const score = intent.keywords.reduce((s, k) => s + (this.keywordHit(k, norm, words) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; best = intent; }
    }

    const intense = this.intensityWords.some(w => norm.includes(w));

    if (best && bestScore > 0) {
      this.lastIntentId = best.id;
      const prefix = intense && ['anxiety','depression','work_study','lonely','anger','self_esteem','relationship'].includes(best.id)
        ? 'Nghe có vẻ điều này đang đè nặng lên bạn nhiều. ' : '';
      return { from: 'bot', text: prefix + this.pickReply(best), action: best.action };
    }

    // Không khớp rõ, nhưng đang nói tiếp chủ đề trước (vd "vẫn vậy", "còn nhiều lắm")
    const continuing = this.continueWords.some(w => words.includes(w)) || intense || words.length <= 3;
    if (continuing && this.lastIntentId) {
      const prev = this.intents.find(i => i.id === this.lastIntentId);
      if (prev && !['greeting','thanks','decline','affirm'].includes(prev.id)) {
        return { from: 'bot', text: this.followUp(prev), action: prev.action };
      }
    }

    // Fallback đồng cảm, xoay vòng
    const fb = this.fallbacks[this.fallbackIdx % this.fallbacks.length];
    this.fallbackIdx++;
    return { from: 'bot', text: fb };
  }

  /** Khớp keyword: cụm nhiều từ → includes; từ đơn → khớp nguyên hoặc gần đúng (typo) */
  private keywordHit(k: string, norm: string, words: string[]): boolean {
    if (k.includes(' ')) return norm.includes(k);
    if (words.includes(k)) return true;
    // fuzzy: chịu 1 lỗi chính tả cho từ khóa đủ dài
    if (k.length >= 5) return words.some(w => Math.abs(w.length - k.length) <= 1 && this.lev(w, k) <= 1);
    return false;
  }

  /** Câu nối tiếp khi user nói thêm về cùng chủ đề — tránh cảm giác lặp */
  private followUp(intent: Intent): string {
    const openers = [
      'Mình vẫn đang nghe đây. ',
      'Cảm ơn bạn đã nói thêm. ',
      'Mình hiểu là điều này chưa nguôi. ',
    ];
    const o = openers[Math.floor(Math.random() * openers.length)];
    return o + this.pickReply(intent);
  }

  /** Khoảng cách Levenshtein (cho fuzzy match nhẹ) */
  private lev(a: string, b: string): number {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  /** Lấy 1 reply của intent, tránh lặp câu vừa dùng */
  private pickReply(intent: Intent): string {
    const n = intent.replies.length;
    if (n === 1) return intent.replies[0];
    let idx = Math.floor(Math.random() * n);
    if (idx === this.lastReplyIdx[intent.id]) idx = (idx + 1) % n;
    this.lastReplyIdx[intent.id] = idx;
    return intent.replies[idx];
  }

  private push(msg: ChatMessage): void {
    this.messages.update(list => [...list, msg]);
  }

  goAction(route: string): void {
    this.open.set(false);
    this.router.navigate([route]);
  }

  clearChat(): void {
    this.messages.set([this.greeting()]);
    this.lastReplyIdx = {};
    this.fallbackIdx = 0;
    this.lastIntentId = null;
  }

  private greeting(): ChatMessage {
    return {
      from: 'bot',
      text: 'Xin chào, mình là trợ lý của Lặng 🌿 Mình ở đây để lắng nghe và định hướng ban đầu. Mình không phải chuyên gia và không thể chẩn đoán — nhưng mình có thể giúp bạn tìm đúng công cụ. Bạn đang cảm thấy thế nào?',
    };
  }

  private load(): ChatMessage[] {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      if (Array.isArray(saved) && saved.length) return saved;
    } catch { /* ignore */ }
    return [this.greeting()];
  }
}
