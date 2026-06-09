export const environment = {
  production: true,
  // ⚠️ ĐỔI thành URL TUYỆT ĐỐI của backend (Render) trước khi deploy.
  // Phải tuyệt đối vì: (1) frontend & backend khác domain; (2) SSR gọi API từ phía server.
  // Ví dụ: 'https://lang-backend.onrender.com/api/v1'
  apiUrl: 'https://lang-backend.onrender.com/api/v1',
};
