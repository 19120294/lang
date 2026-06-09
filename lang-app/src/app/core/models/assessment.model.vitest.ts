import { describe, it, expect } from 'vitest';
import { TESTS, PHQ9, GAD7, DASS21, EPDS, GDS15, PSS10, TestId } from './assessment.model';

/** Helper: tìm range chứa điểm số */
function rangeFor(ranges: any[], score: number) {
  return ranges.find(r => score >= r.min && score <= r.max);
}

describe('Bộ thang đo (TESTS)', () => {
  it('có đủ 6 thang đo', () => {
    const ids: TestId[] = ['phq9', 'gad7', 'dass21', 'epds', 'gds15', 'pss10'];
    for (const id of ids) expect(TESTS[id]).toBeTruthy();
  });

  it('id của mỗi định nghĩa khớp key trong map', () => {
    for (const [key, def] of Object.entries(TESTS)) expect(def.id).toBe(key);
  });
});

describe('PHQ-9', () => {
  it('chấm điểm = tổng các câu (0 → 0, toàn 3 → 27)', () => {
    expect(PHQ9.score(Array(9).fill(0))).toBe(0);
    expect(PHQ9.score(Array(9).fill(3))).toBe(27);
  });

  it('câu 9 là câu nguy cơ (crisis)', () => {
    const crisis = PHQ9.questions.filter(q => q.isCrisisQuestion);
    expect(crisis).toHaveLength(1);
    expect(crisis[0].id).toBe(9);
  });

  it('phân loại đúng mức độ theo điểm', () => {
    expect(rangeFor(PHQ9.ranges as any[], 2).severity).toBe('minimal');
    expect(rangeFor(PHQ9.ranges as any[], 7).severity).toBe('mild');
    expect(rangeFor(PHQ9.ranges as any[], 12).severity).toBe('moderate');
    expect(rangeFor(PHQ9.ranges as any[], 27).severity).toBe('severe');
  });
});

describe('GAD-7', () => {
  it('7 câu, toàn 3 → 21', () => {
    expect(GAD7.questions).toHaveLength(7);
    expect(GAD7.score(Array(7).fill(3))).toBe(21);
  });
});

describe('DASS-21', () => {
  it('trả về mảng [trầm cảm, lo âu, căng thẳng]', () => {
    const s = DASS21.score(Array(21).fill(0)) as number[];
    expect(Array.isArray(s)).toBe(true);
    expect(s).toHaveLength(3);
    expect(s).toEqual([0, 0, 0]);
  });

  it('mỗi nhóm 7 câu × giá trị × hệ số 2 (toàn 3 → mỗi nhóm 42)', () => {
    const s = DASS21.score(Array(21).fill(3)) as number[];
    expect(s).toEqual([42, 42, 42]);
  });
});

describe('EPDS (trầm cảm chu sinh)', () => {
  it('10 câu, mỗi câu có đáp án riêng', () => {
    expect(EPDS.questions).toHaveLength(10);
    expect(EPDS.options).toHaveLength(0); // dùng options riêng từng câu
    expect(EPDS.questions.every(q => (q.options?.length ?? 0) === 4)).toBe(true);
  });

  it('câu 10 là câu nguy cơ (ý nghĩ tự hại)', () => {
    const crisis = EPDS.questions.filter(q => q.isCrisisQuestion);
    expect(crisis).toHaveLength(1);
    expect(crisis[0].id).toBe(10);
  });

  it('câu đảo (id 3) có "Không bao giờ" = 0 điểm', () => {
    const q3 = EPDS.questions.find(q => q.id === 3)!;
    const never = q3.options!.find(o => o.label === 'Không bao giờ')!;
    expect(never.value).toBe(0);
  });
});

describe('GDS-15 (người cao tuổi)', () => {
  it('15 câu Có/Không', () => {
    expect(GDS15.questions).toHaveLength(15);
    expect(GDS15.questions.every(q => (q.options?.length ?? 0) === 2)).toBe(true);
  });
});

describe('PSS-10 (căng thẳng)', () => {
  it('10 câu', () => {
    expect(PSS10.questions).toHaveLength(10);
  });
});
