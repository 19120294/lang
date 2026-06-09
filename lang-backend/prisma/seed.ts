import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ARTICLE_CONTENT } from './articles-content';
import { BOOKS_SEED } from './books-seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user (kiểm duyệt cộng đồng)
  const adminPass = await bcrypt.hash('admin12345', 12);
  await prisma.user.upsert({
    where: { email: 'admin@lang.dev' },
    update: { isAdmin: true },
    create: { email: 'admin@lang.dev', password: adminPass, isAdmin: true },
  });

  // Articles
  const articles = [
    { slug: 'lo-au-la-gi', title: 'Lo âu là gì và khi nào cần lo?', excerpt: 'Lo âu là phản ứng tự nhiên của cơ thể trước nguy hiểm. Tuy nhiên khi nó kéo dài và ảnh hưởng đến sinh hoạt, đó là lúc cần chú ý.', category: 'lo_au' as const, readMinutes: 5, reviewedBy: 'ThS. Tâm lý học lâm sàng', tags: ['lo âu', 'triệu chứng', 'nguyên nhân'], content: '# Lo âu là gì?\n\nLo âu là trạng thái cảm xúc mang tính bảo vệ...', published: true },
    { slug: 'tram-cam-khong-chi-la-buon', title: 'Trầm cảm không chỉ là buồn', excerpt: 'Nhiều người nhầm lẫn trầm cảm với đơn giản là đang buồn. Bài viết giải thích sự khác biệt và những dấu hiệu cần lưu ý.', category: 'tram_cam' as const, readMinutes: 7, reviewedBy: 'BS. Tâm thần', tags: ['trầm cảm', 'triệu chứng', 'nhận biết'], content: '# Trầm cảm không chỉ là buồn\n\n...', published: true },
    { slug: 've-sinh-giac-ngu', title: 'Vệ sinh giấc ngủ: 8 thói quen giúp ngủ ngon hơn', excerpt: 'Giấc ngủ ảnh hưởng sâu sắc đến sức khỏe tâm lý. Những thói quen nhỏ mỗi tối có thể tạo ra sự khác biệt lớn.', category: 'giac_ngu' as const, readMinutes: 4, reviewedBy: 'ThS. Tâm lý học lâm sàng', tags: ['giấc ngủ', 'thói quen', 'thực hành'], content: '...', published: true },
    { slug: 'ky-thuat-tho-4-7-8', title: 'Kỹ thuật thở 4-7-8: Giải tỏa lo âu trong 1 phút', excerpt: 'Kỹ thuật thở 4-7-8 được bác sĩ Andrew Weil phổ biến, giúp kích hoạt hệ thần kinh phó giao cảm và giảm lo âu nhanh chóng.', category: 'tu_cham_soc' as const, readMinutes: 3, reviewedBy: 'ThS. Tâm lý học lâm sàng', tags: ['thở', 'thực hành', 'lo âu'], content: '...', published: true },
    { slug: 'roi-loan-hoang-loan', title: 'Rối loạn hoảng loạn: Hiểu để không sợ', excerpt: 'Cơn hoảng loạn có thể rất đáng sợ nhưng không nguy hiểm đến tính mạng. Hiểu đúng về nó là bước đầu để kiểm soát.', category: 'lo_au' as const, readMinutes: 6, reviewedBy: 'BS. Tâm thần', tags: ['hoảng loạn', 'lo âu', 'cơ chế'], content: '...', published: true },
    { slug: 'cang-thang-man-tinh', title: 'Stress mãn tính và cách nhận biết sớm', excerpt: 'Khác với stress cấp tính, stress mãn tính âm thầm tích lũy và có thể dẫn đến nhiều vấn đề sức khỏe nghiêm trọng.', category: 'cang_thang' as const, readMinutes: 6, reviewedBy: 'BS. Tâm thần', tags: ['căng thẳng', 'mãn tính', 'dấu hiệu'], content: '...', published: true },
    { slug: 'ranh-gioi-lanh-manh', title: 'Ranh giới lành mạnh trong các mối quan hệ', excerpt: 'Thiết lập ranh giới không phải là ích kỷ — đó là cách bảo vệ sức khỏe tâm lý và nuôi dưỡng mối quan hệ lành mạnh.', category: 'quan_he' as const, readMinutes: 5, reviewedBy: 'ThS. Tâm lý học lâm sàng', tags: ['ranh giới', 'mối quan hệ', 'giao tiếp'], content: '...', published: true },
    { slug: 'khi-nao-gap-chuyen-gia', title: 'Khi nào nên tìm gặp chuyên gia tâm lý?', excerpt: 'Nhiều người trì hoãn tìm trợ giúp chuyên môn. Bài viết giúp bạn nhận biết dấu hiệu cho thấy đã đến lúc cần hỗ trợ.', category: 'tu_cham_soc' as const, readMinutes: 4, reviewedBy: 'BS. Tâm thần', tags: ['chuyên gia', 'trị liệu', 'quyết định'], content: '...', published: true },
    { slug: 'tram-cam-sau-sinh', title: 'Trầm cảm sau sinh: Điều các mẹ cần biết', excerpt: 'Trầm cảm sau sinh rất phổ biến và không phải lỗi của bạn. Nhận biết sớm giúp mẹ và bé được chăm sóc tốt hơn.', category: 'tram_cam' as const, readMinutes: 7, reviewedBy: 'BS. Sản & Tâm thần', tags: ['sau sinh', 'thai kỳ', 'trầm cảm', 'EPDS'], content: '...', published: true },
    { slug: 'suc-khoe-tinh-than-nguoi-cao-tuoi', title: 'Sức khỏe tinh thần ở người cao tuổi', excerpt: 'Trầm cảm ở người già thường bị bỏ sót vì lầm tưởng là "chuyện tuổi tác". Quan tâm đúng cách tạo khác biệt lớn.', category: 'tram_cam' as const, readMinutes: 6, reviewedBy: 'BS. Lão khoa', tags: ['người cao tuổi', 'trầm cảm', 'GDS'], content: '...', published: true },
    { slug: 'chanh-niem-cho-nguoi-moi', title: 'Chánh niệm cho người mới bắt đầu', excerpt: 'Chánh niệm không phải là "làm trống tâm trí". Đó là cách quan sát suy nghĩ mà không phán xét — và ai cũng học được.', category: 'tu_cham_soc' as const, readMinutes: 5, reviewedBy: 'ThS. Tâm lý học lâm sàng', tags: ['chánh niệm', 'thiền', 'thực hành'], content: '...', published: true },
    { slug: 'mat-ngu-va-lo-au', title: 'Vòng xoáy mất ngủ và lo âu', excerpt: 'Lo âu gây mất ngủ, mất ngủ lại làm lo âu nặng hơn. Hiểu vòng xoáy này giúp bạn tìm cách thoát ra.', category: 'giac_ngu' as const, readMinutes: 5, reviewedBy: 'BS. Tâm thần', tags: ['mất ngủ', 'lo âu', 'giấc ngủ'], content: '...', published: true },
    { slug: 'tu-cham-soc-moi-ngay', title: '7 thói quen tự chăm sóc tinh thần mỗi ngày', excerpt: 'Chăm sóc sức khỏe tinh thần không cần điều to tát. Những thói quen nhỏ, đều đặn mới tạo nên sự bền vững.', category: 'tu_cham_soc' as const, readMinutes: 4, reviewedBy: 'ThS. Tâm lý học lâm sàng', tags: ['tự chăm sóc', 'thói quen', 'hằng ngày'], content: '...', published: true },
    { slug: 'giup-do-nguoi-than-tram-cam', title: 'Đồng hành cùng người thân đang trầm cảm', excerpt: 'Khi người mình yêu thương bị trầm cảm, sự hiện diện kiên nhẫn của bạn quan trọng hơn những lời khuyên.', category: 'quan_he' as const, readMinutes: 6, reviewedBy: 'ThS. Tâm lý học lâm sàng', tags: ['người thân', 'hỗ trợ', 'trầm cảm'], content: '...', published: true },
    { slug: 'quan-ly-cang-thang-cong-viec', title: 'Quản lý căng thẳng nơi công việc', excerpt: 'Áp lực công việc kéo dài dễ dẫn đến kiệt sức (burnout). Vài chiến lược nhỏ giúp bạn giữ cân bằng.', category: 'cang_thang' as const, readMinutes: 5, reviewedBy: 'ThS. Tâm lý học lâm sàng', tags: ['công việc', 'burnout', 'căng thẳng'], content: '...', published: true },
  ];

  for (const a of articles) {
    // Gắn nội dung đầy đủ + nguồn từ articles-content.ts (nếu có)
    const full = ARTICLE_CONTENT[a.slug];
    const data = { ...a, content: full?.content ?? a.content, sources: full?.sources ?? [] };
    await prisma.article.upsert({ where: { slug: a.slug }, update: data, create: data });
  }

  // Facilities
  const facilities = [
    { name: 'Viện Sức khỏe Tâm thần Quốc gia', description: 'Đơn vị đầu ngành về sức khỏe tâm thần tại Việt Nam. Khám, điều trị và tư vấn tâm lý chuyên sâu.', address: '1A Tôn Thất Tùng, Đống Đa, Hà Nội', area: 'hn' as const, cost: ['insurance', 'private_pay'] as any[], type: ['clinic', 'hospital'] as any[], phone: '024 3869 2728', hours: 'Thứ 2–6: 7:30–16:30', verified: true, tags: ['tâm thần', 'trầm cảm', 'lo âu', 'trị liệu'], published: true },
    { name: 'Khoa Tâm thần - Bệnh viện Bạch Mai', description: 'Khoa Tâm thần BV Bạch Mai — khám và điều trị các rối loạn tâm thần theo chuẩn quốc tế.', address: '78 Giải Phóng, Đống Đa, Hà Nội', area: 'hn' as const, cost: ['insurance', 'affordable'] as any[], type: ['hospital', 'clinic'] as any[], phone: '024 3869 3731', hours: 'Thứ 2–6: 7:00–17:00', verified: true, tags: ['bệnh viện', 'BHYT', 'trầm cảm'], published: true },
    { name: 'Trung tâm Tư vấn Tâm lý Việt Tâm An', description: 'Tư vấn và trị liệu tâm lý cá nhân, cặp đôi và nhóm. Có hình thức tư vấn online.', address: '15 Hàng Bài, Hoàn Kiếm, Hà Nội', area: 'hn' as const, cost: ['affordable', 'private_pay'] as any[], type: ['clinic', 'online'] as any[], phone: '0987 654 321', hours: 'Thứ 2–7: 8:00–20:00', verified: true, tags: ['tư vấn', 'trị liệu', 'online'], published: true },
    { name: 'Bệnh viện Tâm thần TP. Hồ Chí Minh', description: 'Cơ sở điều trị tâm thần công lập lớn nhất phía Nam. Nhận khám BHYT và dịch vụ.', address: '766 Võ Văn Kiệt, Quận 5, TP. HCM', area: 'hcm' as const, cost: ['insurance', 'affordable'] as any[], type: ['hospital'] as any[], phone: '028 3923 4675', hours: 'Hàng ngày: 6:30–17:00', verified: true, tags: ['bệnh viện', 'BHYT', 'tâm thần'], published: true },
    { name: 'Phòng Tư vấn Tâm lý - ĐH KHXH&NV TP.HCM', description: 'Dịch vụ tư vấn tâm lý miễn phí và chi phí thấp cho sinh viên và cộng đồng.', address: '10-12 Đinh Tiên Hoàng, Quận 1, TP. HCM', area: 'hcm' as const, cost: ['free', 'affordable'] as any[], type: ['clinic'] as any[], phone: '028 3829 3828', hours: 'Thứ 2–6: 8:00–11:00, 13:30–16:30', verified: true, tags: ['miễn phí', 'sinh viên', 'tư vấn'], published: true },
    { name: 'Bệnh viện Tâm thần Đà Nẵng', description: 'Khám và điều trị các rối loạn tâm thần khu vực miền Trung. Nhận BHYT.', address: '193 Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng', area: 'dn' as const, cost: ['insurance', 'affordable'] as any[], type: ['hospital'] as any[], phone: '0236 3770 919', hours: 'Thứ 2–6: 7:00–16:30', verified: true, tags: ['bệnh viện', 'BHYT', 'Đà Nẵng'], published: true },
    { name: 'BrainCare - Tư vấn tâm lý trực tuyến', description: 'Nền tảng kết nối với chuyên gia tâm lý có chứng chỉ, tư vấn qua video call linh hoạt.', area: 'online' as const, cost: ['affordable', 'private_pay'] as any[], type: ['online'] as any[], website: 'https://braincare.vn', hours: 'Linh hoạt theo lịch chuyên gia', verified: false, tags: ['online', 'linh hoạt', 'tư vấn'], published: true },
    { name: 'Đường dây nóng Ngày Mai', description: 'Đường dây hỗ trợ tâm lý miễn phí cho người trầm cảm và có ý định tự tử.', area: 'online' as const, cost: ['free'] as any[], type: ['online'] as any[], phone: '096 306 1414', hours: '13:00–20:30 (Thứ 4–CN) · [CẦN VERIFY]', verified: false, tags: ['hotline', 'miễn phí', 'khủng hoảng'], published: true },
  ];

  // Dọn facility seed cũ (id cũ đặt theo tên) để tránh trùng lặp
  await prisma.facility.deleteMany({ where: { id: { startsWith: 'seed-' } } });
  for (let i = 0; i < facilities.length; i++) {
    const f = facilities[i];
    const id = `seed-facility-${i + 1}`;
    await prisma.facility.create({ data: { id, ...f } });
  }

  // Books — id cố định seed-book-N để upsert không trùng
  for (let i = 0; i < BOOKS_SEED.length; i++) {
    const id = `seed-book-${i + 1}`;
    const data = { ...BOOKS_SEED[i], category: BOOKS_SEED[i].category as any, published: true };
    await prisma.book.upsert({ where: { id }, update: data, create: { id, ...data } });
  }

  // Community posts (đã duyệt) — demo feed
  const posts = [
    { id: 'seed-post-1', content: 'Hồi mình mệt nhất, mình tập chỉ làm một việc nhỏ mỗi ngày — dọn giường, uống đủ nước. Nghe đơn giản nhưng nó kéo mình ra khỏi cảm giác bất lực. Bạn không cần phải ổn ngay, chỉ cần nhích từng chút một thôi.', status: 'approved' as const, likes: 128, hugs: 54, hasCW: false },
    { id: 'seed-post-2', content: 'Có những ngày mình thấy mọi thứ thật vô nghĩa. Nhưng việc viết ra cảm xúc mỗi tối và nói chuyện với một người bạn đã giúp mình thấy nhẹ hơn rất nhiều. Nếu bạn đang thấy như vậy, xin đừng giữ một mình…', status: 'approved' as const, likes: 96, hugs: 71, hasCW: true, cwLabel: 'Nhắc tới giai đoạn trầm cảm' },
    { id: 'seed-post-3', content: 'Mình đã từng nghĩ rằng tìm chuyên gia tâm lý là "yếu đuối". Bây giờ mình hiểu đó là hành động dũng cảm nhất mình từng làm. Nếu bạn đang phân vân, hãy thử một lần.', status: 'approved' as const, likes: 215, hugs: 88, hasCW: false },
  ];
  for (const p of posts) {
    await prisma.communityPost.upsert({ where: { id: p.id }, update: p, create: p });
  }

  console.log('✅ Seed completed');
}

main().catch(console.error).finally(() => prisma.$disconnect());
