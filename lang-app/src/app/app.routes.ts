import { Routes } from '@angular/router';

const SUFFIX = ' · Lặng';

export const routes: Routes = [
  {
    path: '',
    title: 'Lặng · Cẩm nang & Tra cứu Sức khỏe Tâm lý',
    data: { description: 'Một khoảng lặng để bạn lắng nghe chính mình — đánh giá tâm lý, tra cứu kiến thức đáng tin cậy và tìm hỗ trợ. Miễn phí, ẩn danh.' },
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'assessment',
    title: 'Đánh giá tâm lý' + SUFFIX,
    data: { description: 'Các thang đo chuẩn quốc tế: PHQ-9, GAD-7, DASS-21, EPDS (thai kỳ), GDS-15 (cao tuổi), PSS-10. Kết quả chỉ mang tính tham khảo.' },
    loadComponent: () => import('./features/assessment/assessment.component').then(m => m.AssessmentComponent),
  },
  {
    path: 'assessment/history',
    title: 'Lịch sử đánh giá' + SUFFIX,
    data: { description: 'Xem lại và so sánh kết quả đánh giá tâm lý của bạn theo thời gian.' },
    loadComponent: () => import('./features/assessment/history.component').then(m => m.AssessmentHistoryComponent),
  },
  {
    path: 'knowledge',
    title: 'Cẩm nang tâm lý' + SUFFIX,
    data: { description: 'Thư viện kiến thức về lo âu, trầm cảm, giấc ngủ, căng thẳng… được chuyên gia review và trích dẫn nguồn.' },
    loadComponent: () => import('./features/knowledge/knowledge.component').then(m => m.KnowledgeComponent),
  },
  {
    path: 'knowledge/:id',
    title: 'Bài viết' + SUFFIX,
    data: { description: 'Bài viết cẩm nang sức khỏe tâm lý, có nguồn tham khảo.' },
    loadComponent: () => import('./features/knowledge/article.component').then(m => m.ArticleComponent),
  },
  {
    path: 'books',
    title: 'Thư viện sách' + SUFFIX,
    data: { description: 'Những cuốn sách đồng hành cho hành trình chăm sóc sức khỏe tâm lý, có chuyên gia gợi ý.' },
    loadComponent: () => import('./features/books/books.component').then(m => m.BooksComponent),
  },
  {
    path: 'community',
    title: 'Cộng đồng' + SUFFIX,
    data: { description: 'Nơi chia sẻ lời động viên ẩn danh, mọi bài viết đều được kiểm duyệt trước khi hiển thị.' },
    loadComponent: () => import('./features/community/community.component').then(m => m.CommunityComponent),
  },
  {
    path: 'mood',
    title: 'Theo dõi cảm xúc' + SUFFIX,
    data: { description: 'Ghi lại và xem xu hướng cảm xúc theo thời gian. Dữ liệu lưu riêng tư trên thiết bị.' },
    loadComponent: () => import('./features/mood/mood.component').then(m => m.MoodComponent),
  },
  {
    path: 'journal',
    title: 'Nhật ký' + SUFFIX,
    data: { description: 'Nhật ký số riêng tư — viết ra những gì trong lòng, lưu mã hóa.' },
    loadComponent: () => import('./features/journal/journal.component').then(m => m.JournalComponent),
  },
  {
    path: 'facilities',
    title: 'Cơ sở hỗ trợ' + SUFFIX,
    data: { description: 'Danh bạ cơ sở tư vấn và điều trị tâm lý tại Việt Nam, lọc theo khu vực, chi phí, hình thức.' },
    loadComponent: () => import('./features/facilities/facilities.component').then(m => m.FacilitiesComponent),
  },
  {
    path: 'breathe',
    title: 'Bài tập thở' + SUFFIX,
    data: { description: 'Bài tập thở 4-7-8, box breathing, thở bụng — có hướng dẫn động giúp thư giãn.' },
    loadComponent: () => import('./features/breathe/breathe.component').then(m => m.BreatheComponent),
  },
  {
    path: 'safety-plan',
    title: 'Kế hoạch an toàn' + SUFFIX,
    data: { description: 'Lập kế hoạch an toàn cá nhân cho những lúc khó khăn — riêng tư, lưu trên thiết bị.' },
    loadComponent: () => import('./features/safety-plan/safety-plan.component').then(m => m.SafetyPlanComponent),
  },
  {
    path: 'auth',
    title: 'Đăng nhập' + SUFFIX,
    data: { description: 'Đăng nhập hoặc đăng ký để đồng bộ dữ liệu của bạn an toàn.' },
    loadComponent: () => import('./features/auth/auth-page.component').then(m => m.AuthPageComponent),
  },
  {
    path: 'account',
    title: 'Tài khoản' + SUFFIX,
    data: { description: 'Quản lý tài khoản và dữ liệu của bạn.' },
    loadComponent: () => import('./features/auth/account.component').then(m => m.AccountComponent),
  },
  {
    path: 'admin',
    title: 'Kiểm duyệt' + SUFFIX,
    data: { description: 'Trang quản trị kiểm duyệt cộng đồng.' },
    loadComponent: () => import('./features/admin/moderation.component').then(m => m.ModerationComponent),
  },
  {
    path: 'admin/content',
    title: 'Quản lý nội dung' + SUFFIX,
    data: { description: 'Quản trị bài viết và cơ sở hỗ trợ.' },
    loadComponent: () => import('./features/admin/content.component').then(m => m.AdminContentComponent),
  },
  { path: '**', redirectTo: '' },
];
