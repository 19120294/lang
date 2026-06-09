import { Component, signal, computed, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Play, Pause, RotateCcw, ArrowLeft, Wind } from 'lucide-angular';

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'pause';

interface Exercise {
  id: string;
  name: string;
  description: string;
  phases: { phase: Phase; label: string; secs: number }[];
  benefit: string;
}

const EXERCISES: Exercise[] = [
  {
    id: '478',
    name: '4-7-8',
    description: 'Giảm lo âu, thư giãn sâu và cải thiện giấc ngủ.',
    benefit: 'Kích hoạt hệ thần kinh phó giao cảm',
    phases: [
      { phase: 'inhale', label: 'Hít vào', secs: 4 },
      { phase: 'hold',   label: 'Giữ hơi', secs: 7 },
      { phase: 'exhale', label: 'Thở ra',  secs: 8 },
    ],
  },
  {
    id: 'box',
    name: 'Hộp (Box Breathing)',
    description: 'Kỹ thuật của lực lượng đặc biệt Mỹ — giảm stress nhanh, lấy lại bình tĩnh.',
    benefit: 'Cân bằng hệ thần kinh, tăng tập trung',
    phases: [
      { phase: 'inhale', label: 'Hít vào', secs: 4 },
      { phase: 'hold',   label: 'Giữ hơi', secs: 4 },
      { phase: 'exhale', label: 'Thở ra',  secs: 4 },
      { phase: 'pause',  label: 'Nghỉ',    secs: 4 },
    ],
  },
  {
    id: 'belly',
    name: 'Thở bụng',
    description: 'Thở bụng sâu — kỹ thuật cơ bản nhất, phù hợp cho mọi người.',
    benefit: 'Tăng lượng oxy, giảm căng cơ',
    phases: [
      { phase: 'inhale', label: 'Hít vào',  secs: 5 },
      { phase: 'exhale', label: 'Thở ra',   secs: 5 },
    ],
  },
];

@Component({
  selector: 'app-breathe',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './breathe.component.html',
})
export class BreatheComponent implements OnDestroy {
  readonly Play = Play; readonly Pause = Pause;
  readonly RotateCcw = RotateCcw; readonly ArrowLeft = ArrowLeft; readonly Wind = Wind;

  readonly exercises = EXERCISES;
  selectedExercise = signal<Exercise>(EXERCISES[0]);

  running    = signal(false);
  phase      = signal<Phase>('idle');
  phaseLabel = signal('Sẵn sàng');
  timeLeft   = signal(0);
  cycles     = signal(0);
  phaseIdx   = signal(0);

  private timer: ReturnType<typeof setInterval> | null = null;
  private countDown = 0;

  readonly circleScale = computed(() => {
    const p = this.phase();
    if (p === 'idle') return 0.7;
    if (p === 'inhale') return 1;
    if (p === 'hold') return 1;
    if (p === 'exhale') return 0.65;
    return 0.65; // pause
  });

  readonly circleColor = computed(() => {
    const p = this.phase();
    if (p === 'inhale') return 'bg-sage-400/70 dark:bg-sage-500/60';
    if (p === 'hold')   return 'bg-calm-400/70 dark:bg-calm-500/60';
    if (p === 'exhale') return 'bg-stone-300/60 dark:bg-stone-600/50';
    return 'bg-sage-200/50 dark:bg-sage-700/40';
  });

  readonly phaseDuration = computed(() => {
    const ex  = this.selectedExercise();
    const idx = this.phaseIdx();
    return ex.phases[idx]?.secs ?? 4;
  });

  selectExercise(ex: Exercise): void {
    this.stop();
    this.selectedExercise.set(ex);
    this.reset();
  }

  toggle(): void { this.running() ? this.pause() : this.start(); }

  private start(): void {
    this.running.set(true);
    if (this.phase() === 'idle') {
      this.nextPhase();
    } else {
      this.tick();
    }
  }

  private pause(): void {
    this.running.set(false);
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private stop(): void {
    this.pause();
    this.phase.set('idle');
  }

  reset(): void {
    this.stop();
    this.phaseIdx.set(0);
    this.cycles.set(0);
    this.phaseLabel.set('Sẵn sàng');
    this.timeLeft.set(0);
  }

  private nextPhase(): void {
    if (this.timer) clearInterval(this.timer);
    const ex     = this.selectedExercise();
    const idx    = this.phaseIdx();
    const step   = ex.phases[idx];

    this.phase.set(step.phase);
    this.phaseLabel.set(step.label);
    this.countDown = step.secs;
    this.timeLeft.set(this.countDown);

    this.timer = setInterval(() => {
      this.countDown--;
      this.timeLeft.set(this.countDown);
      if (this.countDown <= 0) {
        clearInterval(this.timer!);
        const nextIdx = (idx + 1) % ex.phases.length;
        this.phaseIdx.set(nextIdx);
        if (nextIdx === 0) this.cycles.update(c => c + 1);
        if (this.running()) this.nextPhase();
      }
    }, 1000);
  }

  private tick(): void { this.nextPhase(); }

  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }
}
