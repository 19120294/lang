import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // SSR on-demand: server render HTML đầy đủ mỗi request (tốt cho SEO),
    // không prerender lúc build nên không phụ thuộc backend khi build frontend.
    path: '**',
    renderMode: RenderMode.Server,
  },
];
