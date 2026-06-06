const axios = require('axios');

const API_URL = 'http://localhost:8080/api/v1/applications';

async function runIdorTest() {
    console.log('Đang kích hoạt kịch bản Automation Test lỗ hổng IDOR...');
    try {
        // Giả lập gửi request lấy hồ sơ ID 102 với Token của Thí sinh A
        const response = await axios.get(`${API_URL}/102`, {
            headers: {
                'Authorization': 'Bearer TOKEN_VALID_OF_STUDENT_A',
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            console.log('❌ CẢNH BÁO BẢO MẬT: Hệ thống dính lỗ hổng IDOR chí mạng! Thí sinh A đọc được hồ sơ người khác.');
        }
    } catch (error) {
        // Nếu server tắt hoặc chặn chuẩn 403 thì sẽ nhảy vào đây
        if (error.response && error.response.status === 403) {
            console.log('THÀNH CÔNG: Hệ thống bảo mật tốt, đã chặn truy cập trái phép (403 Forbidden).');
        } else {
            console.log(`Trạng thái hệ thống: Server phản hồi mã lỗi hoặc đang offline (${error.message})`);
        }
    }
}

// Kích hoạt chạy hàm
runIdorTest();