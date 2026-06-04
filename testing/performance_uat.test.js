const axios = require('axios');
const FormData = require('form-data');
const { performance } = require('perf_hooks');

// Cấu hình đường dẫn API Backend
const API_URL = 'http://localhost:8080/api';

// Tài khoản Thí sinh dùng để test 
const testEmail = 'sinhvien_test_22898@gmail.com';
const testPassword = 'Password123!';

async function runPerformanceTest() {
    console.log('====== KÍCH HOẠT KIỂM THỬ HIỆU NĂNG & UAT  ======');
    console.log('=> Mục tiêu: Đo lường thời gian phản hồi khi Upload file minh chứng (Yêu cầu < 2000ms)\n');

    try {
        // ------------------------------------------------------------------------
        // [BƯỚC 1] Đăng nhập lấy Token xác thực
        // ------------------------------------------------------------------------
        console.log('[1] Đang xác thực tài khoản thí sinh...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testEmail,
            password: testPassword
        });
        const token = loginRes.data.data.token || loginRes.data.data.accessToken;
        console.log('=> Trạng thái: Đăng nhập thành công, đã cấp Token.\n');

        // ------------------------------------------------------------------------
        // [BƯỚC 2] Khởi tạo dữ liệu giả lập (File minh chứng 4MB)
        // ------------------------------------------------------------------------
        console.log('[2] Đang tạo file giả lập (Dummy File) dung lượng 4MB để mô phỏng Học bạ/CCCD...');
        const fileSizeInBytes = 4 * 1024 * 1024; // 4MB
        const dummyBuffer = Buffer.alloc(fileSizeInBytes, 'a'); // Tạo buffer chứa toàn chữ 'a'

        const form = new FormData();
        // Giả lập gửi file với tên minh_chung_hoc_ba.pdf
        form.append('file', dummyBuffer, {
            filename: 'minh_chung_hoc_ba.pdf',
            contentType: 'application/pdf'
        });

        // ------------------------------------------------------------------------
        // [BƯỚC 3] Thực hiện Upload và Đo lường thời gian (Performance Test)
        // ------------------------------------------------------------------------
        console.log('[3] Bắt đầu đẩy file lên máy chủ (Upload to Server/S3)...');

        // Bắt đầu bấm giờ
        const startTime = performance.now();

        // GỌI API UPLOAD 
        const uploadRes = await axios.post(`${API_URL}/uploads/evidence`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        // Kết thúc bấm giờ
        const endTime = performance.now();
        const durationMs = (endTime - startTime).toFixed(2); // Tính ra mili-giây

        console.log(`=> Kết quả trả về từ Server: Phản hồi mã [${uploadRes.status}]`);

        // ------------------------------------------------------------------------
        // [BƯỚC 4] Đánh giá kết quả (UAT Acceptance)
        // ------------------------------------------------------------------------
        console.log('\n====== KẾT QUẢ NGHIỆM THU HIỆU NĂNG ======');
        console.log(`Thời gian phản hồi thực tế: ${durationMs} ms`);

        if (durationMs < 2000) {
            console.log('✅ KẾT LUẬN: ĐẠT (PASSED). Hệ thống xử lý mượt mà, phản hồi dưới 2 giây theo đúng chuẩn UAT.');
        } else {
            console.log('❌ KẾT LUẬN: KHÔNG ĐẠT (FAILED). Hệ thống phản hồi chậm hơn 2 giây. Cần tối ưu lại băng thông hoặc hạ tầng S3.');
        }

    } catch (error) {
        console.log(`\n❌ Quá trình kiểm thử thất bại do lỗi API:`);
        console.log(error.response ? error.response.data : error.message);
    }
}

runPerformanceTest();