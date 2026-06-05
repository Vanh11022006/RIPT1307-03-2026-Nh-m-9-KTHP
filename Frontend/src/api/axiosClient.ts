import axios from 'axios';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REMEMBER_KEY = 'remember_me';

const readStorageValue = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
};

const readRememberFlag = (): boolean => {
  if (typeof window === 'undefined') return false;
  const flag = sessionStorage.getItem(REMEMBER_KEY) ?? localStorage.getItem(REMEMBER_KEY);
  return flag === 'true';
};

const getAccessToken = (): string | null => readStorageValue(ACCESS_TOKEN_KEY);

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const persistAccessToken = (token: string) => {
  if (typeof window === 'undefined') return;
  const remember = readRememberFlag() || Boolean(localStorage.getItem(REFRESH_TOKEN_KEY));
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(ACCESS_TOKEN_KEY, token);
};

const persistRefreshToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

const clearAuthStorage = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem('currentUser');
};

let refreshPromise: Promise<string> | null = null;

// Khởi tạo instance của axios
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://backend-production-eb2d.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout sau 10s
});

// Interceptor cho các Request gửi lên server
axiosClient.interceptors.request.use(
  (config) => {
    // 1. Lấy token từ localStorage (hoặc Zustand store)
    const token = getAccessToken();
    
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
    const originalRequest = error.config;
    // Xử lý làm mới token (refresh token) với chỉ một tiến trình yêu cầu làm mới đồng thời
    if (statusCode === 401 && originalRequest) {
      const refreshToken = getRefreshToken();
      if (!originalRequest._retry && refreshToken) {
        originalRequest._retry = true;

        // sử dụng một promise làm mới dùng chung để các lỗi 401 đồng thời cùng đợi kết quả làm mới đó
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${axiosClient.defaults.baseURL}/auth/refresh-token`, { refreshToken })
            .then((refreshResponse) => {
              const payload = refreshResponse?.data ?? refreshResponse;
              const authData = payload?.data ?? payload;
              const newAccessToken = authData?.accessToken ?? authData?.token ?? payload?.accessToken ?? payload?.token;
              const newRefreshToken = authData?.refreshToken ?? payload?.refreshToken;

              if (!newAccessToken) {
                clearAuthStorage();
                window.location.href = '/login';
                throw new Error('No access token from refresh');
              }

              persistAccessToken(newAccessToken);
              if (newRefreshToken) persistRefreshToken(newRefreshToken);

              return newAccessToken;
            })
            .catch((refreshError) => {
              clearAuthStorage();
              window.location.href = '/login';
              throw refreshError;
            })
            .finally(() => {
              setTimeout(() => { refreshPromise = null; }, 0);
            });
        }

        return refreshPromise!.then((newAccessToken: string) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        }).catch((e) => Promise.reject(e));
      }

    }

    switch (statusCode) {
      case 401:
        // Hết hạn token hoặc chưa đăng nhập -> Xóa token và đẩy về trang /login
        console.warn('Unauthorized. Redirecting to login...');
        clearAuthStorage();
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
