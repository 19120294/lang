export interface KnowledgeArticle {
  id: string;
  title: string;
  excerpt: string;
  category: KnowledgeCategory;
  readMinutes: number;
  reviewedBy: string;
  tags: string[];
  content: string;
  sources?: string[];
}

export type KnowledgeCategory = 'lo-au' | 'tram-cam' | 'giac-ngu' | 'cang-thang' | 'quan-he' | 'tu-cham-soc';

export const CATEGORIES: { id: KnowledgeCategory; label: string }[] = [
  { id: 'lo-au',       label: 'Lo âu' },
  { id: 'tram-cam',    label: 'Trầm cảm' },
  { id: 'giac-ngu',    label: 'Giấc ngủ' },
  { id: 'cang-thang',  label: 'Căng thẳng' },
  { id: 'quan-he',     label: 'Mối quan hệ' },
  { id: 'tu-cham-soc', label: 'Tự chăm sóc' },
];

export const ARTICLES: KnowledgeArticle[] = [
  {
    id: '1',
    title: 'Lo âu là gì và khi nào cần lo?',
    excerpt: 'Lo âu là phản ứng tự nhiên của cơ thể trước nguy hiểm. Tuy nhiên khi nó kéo dài và ảnh hưởng đến sinh hoạt, đó là lúc cần chú ý.',
    category: 'lo-au',
    readMinutes: 5,
    reviewedBy: 'ThS. Tâm lý học lâm sàng',
    tags: ['lo âu', 'triệu chứng', 'nguyên nhân'],
    content: '',
  },
  {
    id: '2',
    title: 'Trầm cảm không chỉ là buồn',
    excerpt: 'Nhiều người nhầm lẫn trầm cảm với đơn giản là đang buồn. Bài viết giải thích sự khác biệt và những dấu hiệu cần lưu ý.',
    category: 'tram-cam',
    readMinutes: 7,
    reviewedBy: 'BS. Tâm thần',
    tags: ['trầm cảm', 'triệu chứng', 'nhận biết'],
    content: '',
  },
  {
    id: '3',
    title: 'Vệ sinh giấc ngủ: 8 thói quen giúp ngủ ngon hơn',
    excerpt: 'Giấc ngủ ảnh hưởng sâu sắc đến sức khỏe tâm lý. Những thói quen nhỏ mỗi tối có thể tạo ra sự khác biệt lớn.',
    category: 'giac-ngu',
    readMinutes: 4,
    reviewedBy: 'ThS. Tâm lý học lâm sàng',
    tags: ['giấc ngủ', 'thói quen', 'thực hành'],
    content: '',
  },
  {
    id: '4',
    title: 'Stress mãn tính và cách nhận biết sớm',
    excerpt: 'Khác với stress cấp tính, stress mãn tính âm thầm tích lũy và có thể dẫn đến nhiều vấn đề sức khỏe nghiêm trọng.',
    category: 'cang-thang',
    readMinutes: 6,
    reviewedBy: 'BS. Tâm thần',
    tags: ['căng thẳng', 'mãn tính', 'dấu hiệu'],
    content: '',
  },
  {
    id: '5',
    title: 'Ranh giới lành mạnh trong các mối quan hệ',
    excerpt: 'Thiết lập ranh giới không phải là ích kỷ — đó là cách bảo vệ sức khỏe tâm lý và nuôi dưỡng mối quan hệ lành mạnh.',
    category: 'quan-he',
    readMinutes: 5,
    reviewedBy: 'ThS. Tâm lý học lâm sàng',
    tags: ['ranh giới', 'mối quan hệ', 'giao tiếp'],
    content: '',
  },
  {
    id: '6',
    title: 'Kỹ thuật thở 4-7-8: Giải tỏa lo âu trong 1 phút',
    excerpt: 'Kỹ thuật thở 4-7-8 được bác sĩ Andrew Weil phổ biến, giúp kích hoạt hệ thần kinh phó giao cảm và giảm lo âu nhanh chóng.',
    category: 'tu-cham-soc',
    readMinutes: 3,
    reviewedBy: 'ThS. Tâm lý học lâm sàng',
    tags: ['thở', 'thực hành', 'lo âu', 'nhanh'],
    content: '',
  },
  {
    id: '7',
    title: 'Khi nào nên tìm gặp chuyên gia tâm lý?',
    excerpt: 'Nhiều người trì hoãn tìm kiếm trợ giúp chuyên môn. Bài viết này giúp bạn nhận biết những dấu hiệu cho thấy đã đến lúc cần sự hỗ trợ.',
    category: 'tu-cham-soc',
    readMinutes: 4,
    reviewedBy: 'BS. Tâm thần',
    tags: ['chuyên gia', 'trị liệu', 'quyết định'],
    content: '',
  },
  {
    id: '8',
    title: 'Rối loạn hoảng loạn: Hiểu để không sợ',
    excerpt: 'Cơn hoảng loạn có thể rất đáng sợ nhưng không nguy hiểm đến tính mạng. Hiểu đúng về nó là bước đầu tiên để kiểm soát.',
    category: 'lo-au',
    readMinutes: 6,
    reviewedBy: 'BS. Tâm thần',
    tags: ['hoảng loạn', 'lo âu', 'cơ chế'],
    content: '',
  },
];
