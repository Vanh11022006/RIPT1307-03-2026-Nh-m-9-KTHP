import axios from 'axios';

// Khởi tạo instance của axios
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout sau 10s
});

// Interceptor cho các Request gửi lên server
axiosClient.interceptors.request.use(
  (config) => {
    // 1. Lấy token từ localStorage (hoặc Zustand store)
    const token = localStorage.getItem('access_token');
    
    // 2. Nếu có token, đính kèm vào Header để xác thực
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho các Response trả về từ server
axiosClient.interceptors.response.use(
  (response) => {
    // Nếu BE trả về đúng định dạng (vd: { data, message, status }), bạn có thể rút gọn ở đây
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Xử lý các mã lỗi HTTP phổ biến
    const statusCode = error.response?.status;
    switch (statusCode) {
      case 401:
        // Hết hạn token hoặc chưa đăng nhập -> Xóa token và đẩy về trang /login
        console.warn('Unauthorized. Redirecting to login...');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        break;
      case 403:
        console.warn('Forbidden. Bạn không có quyền truy cập.');
        break;
      case 404:
        console.warn('Not Found. Không tìm thấy tài nguyên.');
        break;
      case 500:
        console.error('Internal Server Error. Lỗi từ phía hệ thống máy chủ.');
        break;
      default:
        console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
