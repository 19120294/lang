export type TestId = 'phq9' | 'gad7' | 'dass21' | 'epds' | 'gds15' | 'pss10';

export interface Question {
  id: number;
  text: string;
  /** true = câu đặc biệt cần theo dõi riêng (PHQ-9 Q9, EPDS Q10) */
  isCrisisQuestion?: boolean;
  /** Đáp án riêng cho câu này — nếu không có thì dùng options chung của test */
  options?: { value: number; label: string }[];
}

export interface ScoreRange {
  min: number;
  max: number;
  label: string;
  /** Tone hiển thị — không dùng từ chẩn đoán trực tiếp */
  message: string;
  /** Gợi ý bước tiếp theo */
  nextStep: string;
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
}

export type Audience = 'chung' | 'thai-ky' | 'cao-tuoi';

export interface TestDefinition {
  id: TestId;
  name: string;
  subtitle: string;
  description: string;
  questions: Question[];
  options: { value: number; label: string }[];
  /** Hàm tính điểm từ mảng đáp án */
  score(answers: number[]): number | number[];
  ranges: ScoreRange[] | ScoreRange[][];
  /** Tên nhãn điểm (null = tổng hợp nhiều nhãn) */
  scoreLabel: string | null;
  /** Đối tượng phù hợp — để nhóm/lọc trên trang chọn bài */
  audience: Audience;
  /** Thời lượng ước tính */
  durationLabel: string;
}

export const AUDIENCE_LABELS: Record<Audience, string> = {
  'chung': 'Mọi người',
  'thai-ky': 'Thai kỳ & sau sinh',
  'cao-tuoi': 'Người cao tuổi',
};

/* ============================================================
   PHQ-9 — Patient Health Questionnaire
   9 câu, 0–3/câu, tổng 0–27
   ⚠️ Câu 9 > 0 → crisis escalation bắt buộc
   ============================================================ */
export const PHQ9: TestDefinition = {
  id: 'phq9',
  name: 'PHQ-9',
  subtitle: 'Sàng lọc trầm cảm',
  audience: 'chung',
  durationLabel: '~3 phút',
  description: 'Thang đo PHQ-9 giúp đánh giá các triệu chứng trầm cảm trong 2 tuần qua. Gồm 9 câu hỏi, mỗi câu chọn từ 0–3 điểm.',
  options: [
    { value: 0, label: 'Không có ngày nào' },
    { value: 1, label: 'Vài ngày' },
    { value: 2, label: 'Hơn nửa số ngày' },
    { value: 3, label: 'Gần như mỗi ngày' },
  ],
  questions: [
    { id: 1, text: 'Ít hứng thú hoặc không có niềm vui khi làm mọi việc' },
    { id: 2, text: 'Cảm thấy chán nản, trầm uất hoặc tuyệt vọng' },
    { id: 3, text: 'Khó ngủ, hay thức giấc hoặc ngủ quá nhiều' },
    { id: 4, text: 'Cảm thấy mệt mỏi hoặc ít năng lượng' },
    { id: 5, text: 'Ăn kém ngon miệng hoặc ăn quá nhiều' },
    { id: 6, text: 'Cảm thấy tệ về bản thân — hoặc thấy mình thất bại, khiến bản thân hay người thân thất vọng' },
    { id: 7, text: 'Khó tập trung vào các việc như đọc báo hay xem truyền hình' },
    { id: 8, text: 'Cử động hoặc nói chuyện chậm đến mức người khác nhận thấy — hoặc ngược lại bồn chồn, không thể ngồi yên' },
    { id: 9, text: 'Có những suy nghĩ rằng tốt hơn là nên chết đi hoặc tự làm hại bản thân', isCrisisQuestion: true },
  ],
  score: (answers) => answers.reduce((s, v) => s + v, 0),
  scoreLabel: 'Tổng điểm',
  ranges: [
    { min: 0,  max: 4,  severity: 'minimal',          label: 'Tối thiểu',   message: 'Bạn đang ở mức ổn định. Hãy tiếp tục chăm sóc bản thân mỗi ngày.', nextStep: 'Thử theo dõi cảm xúc hằng ngày với Mood Tracker.' },
    { min: 5,  max: 9,  severity: 'mild',              label: 'Nhẹ',        message: 'Kết quả cho thấy bạn đang có một số dấu hiệu trầm cảm nhẹ. Điều đó hoàn toàn bình thường và có thể được chăm sóc.', nextStep: 'Thử bài tập thở, ghi nhật ký, hoặc chia sẻ với người thân.' },
    { min: 10, max: 14, severity: 'moderate',          label: 'Vừa',        message: 'Kết quả gợi ý bạn đang có những dấu hiệu cần được chú ý. Đừng lo — có nhiều cách để bạn cảm thấy nhẹ hơn.', nextStep: 'Cân nhắc trò chuyện với chuyên gia tâm lý để được đồng hành.' },
    { min: 15, max: 19, severity: 'moderately-severe', label: 'Vừa-nặng',  message: 'Những gì bạn đang trải qua có vẻ khá nặng. Hãy biết rằng bạn không cần phải đối mặt một mình.', nextStep: 'Nên tìm gặp chuyên gia sức khỏe tâm thần hoặc bác sĩ sớm.' },
    { min: 20, max: 27, severity: 'severe',            label: 'Nặng',       message: 'Kết quả cho thấy bạn đang chịu đựng rất nhiều. Điều quan trọng nhất lúc này là tìm được sự hỗ trợ phù hợp.', nextStep: 'Hãy liên hệ hotline hỗ trợ hoặc đến cơ sở y tế ngay hôm nay.' },
  ] as ScoreRange[],
};

/* ============================================================
   GAD-7 — Generalized Anxiety Disorder
   7 câu, 0–3/câu, tổng 0–21
   ============================================================ */
export const GAD7: TestDefinition = {
  id: 'gad7',
  name: 'GAD-7',
  subtitle: 'Sàng lọc lo âu',
  audience: 'chung',
  durationLabel: '~2 phút',
  description: 'Thang đo GAD-7 đánh giá mức độ lo âu lan tỏa trong 2 tuần qua. Gồm 7 câu hỏi, mỗi câu chọn từ 0–3 điểm.',
  options: [
    { value: 0, label: 'Không có ngày nào' },
    { value: 1, label: 'Vài ngày' },
    { value: 2, label: 'Hơn nửa số ngày' },
    { value: 3, label: 'Gần như mỗi ngày' },
  ],
  questions: [
    { id: 1, text: 'Cảm thấy lo lắng, bứt rứt hoặc căng thẳng' },
    { id: 2, text: 'Không thể ngừng lo lắng hoặc kiểm soát được nỗi lo' },
    { id: 3, text: 'Lo lắng quá nhiều về nhiều thứ khác nhau' },
    { id: 4, text: 'Khó thư giãn' },
    { id: 5, text: 'Bồn chồn đến mức khó ngồi yên' },
    { id: 6, text: 'Dễ bực bội hoặc cáu kỉnh' },
    { id: 7, text: 'Cảm thấy sợ như thể điều gì tệ sắp xảy ra' },
  ],
  score: (answers) => answers.reduce((s, v) => s + v, 0),
  scoreLabel: 'Tổng điểm',
  ranges: [
    { min: 0,  max: 4,  severity: 'minimal',  label: 'Tối thiểu', message: 'Mức lo âu của bạn đang ở ngưỡng rất thấp. Giữ vững những thói quen tốt của bạn.', nextStep: 'Tiếp tục duy trì lối sống lành mạnh và theo dõi cảm xúc.' },
    { min: 5,  max: 9,  severity: 'mild',     label: 'Nhẹ',       message: 'Bạn đang có một số dấu hiệu lo âu nhẹ. Điều này phổ biến hơn bạn nghĩ.', nextStep: 'Thử bài tập thở hoặc thiền định ngắn để giảm căng thẳng.' },
    { min: 10, max: 14, severity: 'moderate', label: 'Vừa',       message: 'Lo âu đang ảnh hưởng đến cuộc sống hằng ngày của bạn ở mức độ đáng kể.', nextStep: 'Nên tham khảo ý kiến chuyên gia tâm lý để có hướng hỗ trợ phù hợp.' },
    { min: 15, max: 21, severity: 'severe',   label: 'Nặng',      message: 'Bạn đang trải qua mức lo âu khá cao. Bạn xứng đáng được hỗ trợ và chăm sóc đúng cách.', nextStep: 'Hãy tìm gặp chuyên gia sức khỏe tâm thần hoặc bác sĩ sớm.' },
  ] as ScoreRange[],
};

/* ============================================================
   DASS-21 — Depression Anxiety Stress Scale
   21 câu, 0–3/câu, x2 theo chuẩn DASS-42
   3 tiểu thang: Depression (câu lẻ D), Anxiety (A), Stress (S)
   ============================================================ */
const DASS_OPTIONS = [
  { value: 0, label: 'Không đúng với tôi chút nào' },
  { value: 1, label: 'Đúng với tôi một phần, hoặc đôi khi' },
  { value: 2, label: 'Đúng với tôi khá nhiều, hoặc thường xuyên' },
  { value: 3, label: 'Hoàn toàn đúng với tôi, hoặc hầu hết thời gian' },
];

/** Index 0-based của từng tiểu thang trong 21 câu */
const DASS_D_IDX = [2, 4, 9, 12, 15, 16, 20];   // Depression
const DASS_A_IDX = [1, 3, 6, 8, 14, 18, 19];    // Anxiety
const DASS_S_IDX = [0, 5, 7, 10, 11, 13, 17];   // Stress

export const DASS21: TestDefinition = {
  id: 'dass21',
  name: 'DASS-21',
  subtitle: 'Đánh giá tổng hợp Trầm cảm · Lo âu · Căng thẳng',
  audience: 'chung',
  durationLabel: '~5 phút',
  description: 'Thang đo DASS-21 đánh giá đồng thời ba khía cạnh: trầm cảm, lo âu và căng thẳng trong tuần qua. Gồm 21 câu hỏi.',
  options: DASS_OPTIONS,
  questions: [
    { id: 1,  text: 'Tôi thấy khó thư giãn' },
    { id: 2,  text: 'Tôi bị khô miệng' },
    { id: 3,  text: 'Tôi dường như không có cảm xúc tích cực nào' },
    { id: 4,  text: 'Tôi bị khó thở (ví dụ thở gấp, không thở được trong khi không hoạt động thể chất)' },
    { id: 5,  text: 'Tôi thấy khó bắt đầu làm việc' },
    { id: 6,  text: 'Tôi có xu hướng phản ứng thái quá với các tình huống' },
    { id: 7,  text: 'Tôi bị run tay chân' },
    { id: 8,  text: 'Tôi cảm thấy mình đang sử dụng rất nhiều năng lượng tinh thần' },
    { id: 9,  text: 'Tôi lo lắng về những tình huống mà tôi có thể bị hoảng loạn và tự làm xấu hổ mình' },
    { id: 10, text: 'Tôi cảm thấy mình không có gì để mong đợi' },
    { id: 11, text: 'Tôi thấy bản thân dễ bị kích động' },
    { id: 12, text: 'Tôi thấy khó thư giãn' },
    { id: 13, text: 'Tôi cảm thấy buồn chán, ủ rũ' },
    { id: 14, text: 'Tôi không thể chịu đựng được bất cứ điều gì cản trở tôi làm việc' },
    { id: 15, text: 'Tôi cảm thấy sắp hoảng loạn' },
    { id: 16, text: 'Tôi không thể hào hứng về bất cứ điều gì' },
    { id: 17, text: 'Tôi cảm thấy mình không có giá trị như một người' },
    { id: 18, text: 'Tôi cảm thấy dễ bị kích động' },
    { id: 19, text: 'Tôi nhận thức được nhịp tim ngay cả khi không hoạt động thể chất (như tăng nhịp tim, tim bỏ nhịp)' },
    { id: 20, text: 'Tôi cảm thấy sợ hãi mà không có lý do chính đáng' },
    { id: 21, text: 'Tôi cảm thấy cuộc sống thật vô nghĩa' },
  ],
  score: (answers) => [
    DASS_D_IDX.reduce((s, i) => s + (answers[i] ?? 0), 0) * 2,
    DASS_A_IDX.reduce((s, i) => s + (answers[i] ?? 0), 0) * 2,
    DASS_S_IDX.reduce((s, i) => s + (answers[i] ?? 0), 0) * 2,
  ],
  scoreLabel: null,
  ranges: [
    // Depression
    [
      { min: 0,  max: 9,  severity: 'minimal',  label: 'Bình thường', message: 'Không có dấu hiệu trầm cảm đáng kể.', nextStep: 'Tiếp tục chăm sóc bản thân.' },
      { min: 10, max: 13, severity: 'mild',     label: 'Nhẹ',        message: 'Một số dấu hiệu trầm cảm nhẹ xuất hiện.', nextStep: 'Thử ghi nhật ký và bài tập thở.' },
      { min: 14, max: 20, severity: 'moderate', label: 'Vừa',        message: 'Dấu hiệu trầm cảm ở mức vừa phải.', nextStep: 'Cân nhắc tư vấn với chuyên gia.' },
      { min: 21, max: 27, severity: 'moderately-severe', label: 'Nặng', message: 'Dấu hiệu trầm cảm đáng lo ngại.', nextStep: 'Nên gặp chuyên gia sức khỏe tâm thần sớm.' },
      { min: 28, max: 42, severity: 'severe',   label: 'Rất nặng',   message: 'Dấu hiệu trầm cảm nghiêm trọng.', nextStep: 'Hãy tìm kiếm hỗ trợ chuyên môn ngay.' },
    ],
    // Anxiety
    [
      { min: 0,  max: 7,  severity: 'minimal',  label: 'Bình thường', message: 'Mức lo âu trong giới hạn bình thường.', nextStep: 'Duy trì thói quen sinh hoạt lành mạnh.' },
      { min: 8,  max: 9,  severity: 'mild',     label: 'Nhẹ',        message: 'Lo âu nhẹ, có thể kiểm soát được.', nextStep: 'Thử thiền định và bài tập thở.' },
      { min: 10, max: 14, severity: 'moderate', label: 'Vừa',        message: 'Lo âu đang ảnh hưởng đến sinh hoạt.', nextStep: 'Nên tham khảo chuyên gia tâm lý.' },
      { min: 15, max: 19, severity: 'moderately-severe', label: 'Nặng', message: 'Lo âu ở mức độ cao.', nextStep: 'Tìm kiếm hỗ trợ từ chuyên gia sớm.' },
      { min: 20, max: 42, severity: 'severe',   label: 'Rất nặng',   message: 'Lo âu nghiêm trọng cần được chăm sóc.', nextStep: 'Gặp chuyên gia sức khỏe tâm thần ngay.' },
    ],
    // Stress
    [
      { min: 0,  max: 14, severity: 'minimal',  label: 'Bình thường', message: 'Mức căng thẳng trong giới hạn bình thường.', nextStep: 'Tiếp tục các thói quen thư giãn.' },
      { min: 15, max: 18, severity: 'mild',     label: 'Nhẹ',        message: 'Căng thẳng nhẹ, cần để ý.', nextStep: 'Tạo thời gian nghỉ ngơi mỗi ngày.' },
      { min: 19, max: 25, severity: 'moderate', label: 'Vừa',        message: 'Căng thẳng đang ảnh hưởng đến bạn.', nextStep: 'Thử các kỹ thuật quản lý stress.' },
      { min: 26, max: 33, severity: 'moderately-severe', label: 'Nặng', message: 'Căng thẳng ở mức cao.', nextStep: 'Cân nhắc tham khảo chuyên gia.' },
      { min: 34, max: 42, severity: 'severe',   label: 'Rất nặng',   message: 'Căng thẳng nghiêm trọng.', nextStep: 'Tìm kiếm hỗ trợ chuyên môn.' },
    ],
  ] as ScoreRange[][],
};

/* ============================================================
   EPDS — Edinburgh Postnatal Depression Scale
   Trầm cảm trong thai kỳ & sau sinh. 10 câu, tổng 0–30.
   Mỗi câu có đáp án riêng (giá trị = điểm thực).
   ⚠️ Câu 10 (ý nghĩ tự hại) > 0 → crisis escalation.
   ============================================================ */
export const EPDS: TestDefinition = {
  id: 'epds',
  name: 'EPDS',
  subtitle: 'Trầm cảm thai kỳ & sau sinh',
  audience: 'thai-ky',
  durationLabel: '~4 phút',
  description: 'Thang đo EPDS (Edinburgh) sàng lọc trầm cảm ở phụ nữ mang thai và sau sinh, đánh giá cảm xúc trong 7 ngày qua. Gồm 10 câu hỏi.',
  options: [], // dùng options riêng từng câu
  questions: [
    { id: 1, text: 'Tôi có thể cười và thấy được khía cạnh vui của sự việc', options: [
      { value: 0, label: 'Nhiều như trước đây' }, { value: 1, label: 'Không hẳn nhiều như trước' },
      { value: 2, label: 'Chắc chắn ít hơn trước' }, { value: 3, label: 'Hoàn toàn không' } ] },
    { id: 2, text: 'Tôi mong chờ mọi việc với sự thích thú', options: [
      { value: 0, label: 'Như trước đây' }, { value: 1, label: 'Hơi ít hơn trước' },
      { value: 2, label: 'Chắc chắn ít hơn trước' }, { value: 3, label: 'Gần như không' } ] },
    { id: 3, text: 'Tôi tự trách mình một cách không cần thiết khi mọi việc không như ý', options: [
      { value: 3, label: 'Có, hầu hết thời gian' }, { value: 2, label: 'Có, thỉnh thoảng' },
      { value: 1, label: 'Không thường xuyên' }, { value: 0, label: 'Không bao giờ' } ] },
    { id: 4, text: 'Tôi lo lắng hoặc bồn chồn mà không có lý do rõ ràng', options: [
      { value: 0, label: 'Không, không hề' }, { value: 1, label: 'Hầu như không' },
      { value: 2, label: 'Có, đôi khi' }, { value: 3, label: 'Có, rất thường xuyên' } ] },
    { id: 5, text: 'Tôi cảm thấy sợ hãi hoặc hoảng loạn mà không có lý do rõ ràng', options: [
      { value: 3, label: 'Có, khá nhiều' }, { value: 2, label: 'Có, đôi khi' },
      { value: 1, label: 'Không, không nhiều' }, { value: 0, label: 'Không, không hề' } ] },
    { id: 6, text: 'Mọi việc dồn dập khiến tôi khó xoay xở', options: [
      { value: 3, label: 'Hầu hết thời gian tôi không xoay xở được' }, { value: 2, label: 'Đôi khi tôi không xoay xở như trước' },
      { value: 1, label: 'Hầu hết thời gian tôi xoay xở khá tốt' }, { value: 0, label: 'Tôi vẫn xoay xở tốt như trước' } ] },
    { id: 7, text: 'Tôi buồn đến mức khó ngủ', options: [
      { value: 3, label: 'Có, hầu hết thời gian' }, { value: 2, label: 'Có, đôi khi' },
      { value: 1, label: 'Không thường xuyên' }, { value: 0, label: 'Không bao giờ' } ] },
    { id: 8, text: 'Tôi cảm thấy buồn bã hoặc khốn khổ', options: [
      { value: 3, label: 'Có, hầu hết thời gian' }, { value: 2, label: 'Có, khá thường xuyên' },
      { value: 1, label: 'Không thường xuyên' }, { value: 0, label: 'Không bao giờ' } ] },
    { id: 9, text: 'Tôi buồn đến mức đã khóc', options: [
      { value: 3, label: 'Có, hầu hết thời gian' }, { value: 2, label: 'Có, khá thường xuyên' },
      { value: 1, label: 'Chỉ thỉnh thoảng' }, { value: 0, label: 'Không bao giờ' } ] },
    { id: 10, text: 'Tôi đã có ý nghĩ tự làm hại bản thân', isCrisisQuestion: true, options: [
      { value: 3, label: 'Có, khá thường xuyên' }, { value: 2, label: 'Thỉnh thoảng' },
      { value: 1, label: 'Hầu như không' }, { value: 0, label: 'Không bao giờ' } ] },
  ],
  score: (answers) => answers.reduce((s, v) => s + v, 0),
  scoreLabel: 'Tổng điểm',
  ranges: [
    { min: 0,  max: 9,  severity: 'minimal',  label: 'Thấp',      message: 'Kết quả cho thấy ít dấu hiệu trầm cảm. Hãy tiếp tục chăm sóc bản thân và nghỉ ngơi đủ.', nextStep: 'Theo dõi cảm xúc và chia sẻ với người thân khi cần.' },
    { min: 10, max: 12, severity: 'mild',     label: 'Ranh giới', message: 'Có một số dấu hiệu cần lưu ý. Giai đoạn thai kỳ/sau sinh nhiều thay đổi là điều hoàn toàn bình thường.', nextStep: 'Nên làm lại sau 1–2 tuần và cân nhắc trò chuyện với bác sĩ sản khoa.' },
    { min: 13, max: 19, severity: 'moderate', label: 'Cần chú ý', message: 'Kết quả gợi ý khả năng trầm cảm chu sinh. Bạn không có lỗi và không cô đơn — đây là điều rất nhiều người trải qua.', nextStep: 'Hãy trao đổi với bác sĩ hoặc chuyên gia tâm lý để được hỗ trợ phù hợp.' },
    { min: 20, max: 30, severity: 'severe',   label: 'Cao',       message: 'Kết quả cho thấy dấu hiệu trầm cảm rõ rệt. Việc tìm hỗ trợ chuyên môn lúc này rất quan trọng cho cả bạn và em bé.', nextStep: 'Hãy liên hệ bác sĩ/chuyên gia sớm, hoặc hotline nếu bạn cần ngay.' },
  ] as ScoreRange[],
};

/* ============================================================
   GDS-15 — Geriatric Depression Scale (15 câu)
   Trầm cảm ở người cao tuổi. Trả lời Có/Không, tổng 0–15.
   ============================================================ */
const GDS_YES = [{ value: 1, label: 'Có' }, { value: 0, label: 'Không' }];   // "Có" = 1 điểm
const GDS_NO  = [{ value: 0, label: 'Có' }, { value: 1, label: 'Không' }];   // "Không" = 1 điểm (câu đảo)

export const GDS15: TestDefinition = {
  id: 'gds15',
  name: 'GDS-15',
  subtitle: 'Trầm cảm ở người cao tuổi',
  audience: 'cao-tuoi',
  durationLabel: '~3 phút',
  description: 'Thang đo trầm cảm lão khoa GDS-15 dành cho người cao tuổi, đánh giá cảm xúc trong 1 tuần qua. Trả lời Có/Không cho 15 câu.',
  options: [],
  questions: [
    { id: 1,  text: 'Về cơ bản, ông/bà có hài lòng với cuộc sống của mình không?', options: GDS_NO },
    { id: 2,  text: 'Ông/bà có bỏ bớt nhiều hoạt động và sở thích của mình không?', options: GDS_YES },
    { id: 3,  text: 'Ông/bà có cảm thấy cuộc sống của mình trống rỗng không?', options: GDS_YES },
    { id: 4,  text: 'Ông/bà có thường cảm thấy buồn chán không?', options: GDS_YES },
    { id: 5,  text: 'Ông/bà có cảm thấy phấn chấn, vui vẻ phần lớn thời gian không?', options: GDS_NO },
    { id: 6,  text: 'Ông/bà có sợ rằng điều gì đó tồi tệ sắp xảy ra với mình không?', options: GDS_YES },
    { id: 7,  text: 'Ông/bà có cảm thấy hạnh phúc phần lớn thời gian không?', options: GDS_NO },
    { id: 8,  text: 'Ông/bà có thường cảm thấy bất lực không?', options: GDS_YES },
    { id: 9,  text: 'Ông/bà có thích ở nhà hơn là ra ngoài làm những việc mới không?', options: GDS_YES },
    { id: 10, text: 'Ông/bà có cảm thấy gặp nhiều vấn đề về trí nhớ hơn người khác không?', options: GDS_YES },
    { id: 11, text: 'Ông/bà có nghĩ rằng được sống lúc này là điều tuyệt vời không?', options: GDS_NO },
    { id: 12, text: 'Ông/bà có cảm thấy mình khá vô dụng theo cách hiện tại không?', options: GDS_YES },
    { id: 13, text: 'Ông/bà có cảm thấy mình tràn đầy năng lượng không?', options: GDS_NO },
    { id: 14, text: 'Ông/bà có cảm thấy tình cảnh của mình là vô vọng không?', options: GDS_YES },
    { id: 15, text: 'Ông/bà có nghĩ rằng hầu hết mọi người đều khá hơn mình không?', options: GDS_YES },
  ],
  score: (answers) => answers.reduce((s, v) => s + v, 0),
  scoreLabel: 'Tổng điểm',
  ranges: [
    { min: 0,  max: 4,  severity: 'minimal',  label: 'Bình thường', message: 'Kết quả không gợi ý trầm cảm. Hãy tiếp tục duy trì các hoạt động và kết nối xã hội.', nextStep: 'Giữ thói quen vận động nhẹ và gặp gỡ người thân, bạn bè.' },
    { min: 5,  max: 8,  severity: 'mild',     label: 'Nhẹ',        message: 'Có một số dấu hiệu trầm cảm nhẹ. Điều này khá phổ biến ở tuổi này và có thể cải thiện.', nextStep: 'Cân nhắc trò chuyện với bác sĩ trong lần khám tới.' },
    { min: 9,  max: 11, severity: 'moderate', label: 'Vừa',        message: 'Dấu hiệu trầm cảm ở mức cần được chú ý. Đừng ngần ngại tìm sự hỗ trợ.', nextStep: 'Nên trao đổi với bác sĩ hoặc chuyên gia sức khỏe tâm thần.' },
    { min: 12, max: 15, severity: 'severe',   label: 'Nặng',       message: 'Kết quả cho thấy dấu hiệu trầm cảm rõ rệt. Việc thăm khám sớm sẽ giúp ích nhiều.', nextStep: 'Hãy cùng người thân đến gặp bác sĩ chuyên khoa sớm.' },
  ] as ScoreRange[],
};

/* ============================================================
   PSS-10 — Perceived Stress Scale (10 câu)
   Mức căng thẳng cảm nhận trong 1 tháng qua. Tổng 0–40.
   Câu 4,5,7,8 tích cực → chấm ngược.
   ============================================================ */
const PSS_POS = [ // câu tích cực: chấm ngược
  { value: 4, label: 'Không bao giờ' }, { value: 3, label: 'Hầu như không' },
  { value: 2, label: 'Thỉnh thoảng' }, { value: 1, label: 'Khá thường xuyên' }, { value: 0, label: 'Rất thường xuyên' },
];
const PSS_NEG = [ // câu tiêu cực: chấm xuôi
  { value: 0, label: 'Không bao giờ' }, { value: 1, label: 'Hầu như không' },
  { value: 2, label: 'Thỉnh thoảng' }, { value: 3, label: 'Khá thường xuyên' }, { value: 4, label: 'Rất thường xuyên' },
];

export const PSS10: TestDefinition = {
  id: 'pss10',
  name: 'PSS-10',
  subtitle: 'Mức căng thẳng cảm nhận',
  audience: 'chung',
  durationLabel: '~4 phút',
  description: 'Thang đo PSS-10 đánh giá mức độ căng thẳng bạn cảm nhận trong 1 tháng qua. Gồm 10 câu hỏi.',
  options: [],
  questions: [
    { id: 1,  text: 'Bạn cảm thấy buồn bực vì điều gì đó xảy ra bất ngờ', options: PSS_NEG },
    { id: 2,  text: 'Bạn cảm thấy không thể kiểm soát được những điều quan trọng trong cuộc sống', options: PSS_NEG },
    { id: 3,  text: 'Bạn cảm thấy căng thẳng và áp lực', options: PSS_NEG },
    { id: 4,  text: 'Bạn cảm thấy tự tin về khả năng xử lý các vấn đề cá nhân', options: PSS_POS },
    { id: 5,  text: 'Bạn cảm thấy mọi việc đang diễn ra theo ý mình', options: PSS_POS },
    { id: 6,  text: 'Bạn nhận thấy mình không thể đương đầu với tất cả việc phải làm', options: PSS_NEG },
    { id: 7,  text: 'Bạn có thể kiểm soát được những điều khó chịu trong cuộc sống', options: PSS_POS },
    { id: 8,  text: 'Bạn cảm thấy mình làm chủ được mọi thứ', options: PSS_POS },
    { id: 9,  text: 'Bạn tức giận vì những việc nằm ngoài tầm kiểm soát của mình', options: PSS_NEG },
    { id: 10, text: 'Bạn cảm thấy khó khăn chồng chất đến mức không thể vượt qua', options: PSS_NEG },
  ],
  score: (answers) => answers.reduce((s, v) => s + v, 0),
  scoreLabel: 'Tổng điểm',
  ranges: [
    { min: 0,  max: 13, severity: 'minimal',  label: 'Thấp',       message: 'Mức căng thẳng của bạn đang thấp. Bạn đang xoay xở khá tốt với các áp lực.', nextStep: 'Duy trì những thói quen lành mạnh giúp bạn cân bằng.' },
    { min: 14, max: 26, severity: 'moderate', label: 'Trung bình', message: 'Bạn đang chịu mức căng thẳng vừa phải. Đây là lúc nên chú ý chăm sóc bản thân nhiều hơn.', nextStep: 'Thử bài tập thở, vận động nhẹ và sắp xếp lại ưu tiên.' },
    { min: 27, max: 40, severity: 'severe',   label: 'Cao',        message: 'Mức căng thẳng của bạn đang cao. Hãy cho phép mình nghỉ ngơi và tìm sự hỗ trợ.', nextStep: 'Cân nhắc trò chuyện với chuyên gia nếu căng thẳng kéo dài.' },
  ] as ScoreRange[],
};

export const TESTS: Record<TestId, TestDefinition> = {
  phq9: PHQ9, gad7: GAD7, dass21: DASS21, epds: EPDS, gds15: GDS15, pss10: PSS10,
};
