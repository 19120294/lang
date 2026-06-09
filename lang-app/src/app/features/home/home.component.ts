import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  CircleCheck, ShieldCheck, UserRoundX,
  CloudDrizzle, Wind, ChartNoAxesColumn,
  Search, NotebookPen, Lock,
  MapPin, Wallet, Stethoscope, ChevronDown,
  ArrowRight, Laugh, Smile, Meh, Angry, Frown,
  Sparkles, RefreshCw,
} from 'lucide-angular';
import { MoodService } from '../../core/services/mood.service';
import { MoodLevel, MOOD_META } from '../../core/models/mood.model';
import { TIPS, tipIndexForToday } from '../../core/models/tip.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly CircleCheck = CircleCheck;
  readonly ShieldCheck = ShieldCheck;
  readonly UserRoundX = UserRoundX;
  readonly CloudDrizzle = CloudDrizzle;
  readonly Wind = Wind;
  readonly ChartNoAxesColumn = ChartNoAxesColumn;
  readonly Search = Search;
  readonly NotebookPen = NotebookPen;
  readonly Lock = Lock;
  readonly MapPin = MapPin;
  readonly Wallet = Wallet;
  readonly Stethoscope = Stethoscope;
  readonly ChevronDown = ChevronDown;
  readonly ArrowRight = ArrowRight;
  readonly Laugh = Laugh;
  readonly Smile = Smile;
  readonly Meh = Meh;
  readonly Angry = Angry;
  readonly Frown = Frown;
  readonly Sparkles = Sparkles;
  readonly RefreshCw = RefreshCw;

  // Thẻ lời khuyên hôm nay (có thể bấm xem thẻ khác)
  tipIndex = signal(tipIndexForToday());
  readonly tip = () => TIPS[this.tipIndex()];
  nextTip(): void { this.tipIndex.update(i => (i + 1) % TIPS.length); }

  readonly moodIcons = [
    { level: 'great'   as MoodLevel, icon: Laugh,  meta: MOOD_META['great'] },
    { level: 'ok'      as MoodLevel, icon: Smile,  meta: MOOD_META['ok'] },
    { level: 'anxious' as MoodLevel, icon: Meh,    meta: MOOD_META['anxious'] },
    { level: 'angry'   as MoodLevel, icon: Angry,  meta: MOOD_META['angry'] },
    { level: 'bad'     as MoodLevel, icon: Frown,  meta: MOOD_META['bad'] },
  ];

  private moodService = inject(MoodService);

  logMood(level: MoodLevel): void {
    this.moodService.add(level);
  }
}
