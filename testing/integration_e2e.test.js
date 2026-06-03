const axios = require('axios');
const mysql = require('mysql2/promise');

const API_URL = 'http://localhost:8080/api';

// Khởi tạo định danh ngẫu nhiên để dữ liệu không bị trùng lặp giữa các phiên chạy
const randomId = Math.floor(Math.random() * 100000);
const testCandidateEmail = `sinhvien_test_${randomId}@gmail.com`;
const testPassword = 'Password123!';

// Cấu hình kết nối MySQL cục bộ
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'uniadmission_db'
};

async function runIntegrationAndE2ETest() {
    console.log('====== KÍCH HOẠT KIỂM THỬ TÍCH HỢP & TOÀN TRÌNH  ======');

    // Khai báo sẵn các biến dùng chung cho toàn bộ luồng
    let candidateToken = '';
    let adminToken = '';
    let applicationId = '';
    let userId = '';
    let candidateId = '';

    try {
        // ------------------------------------------------------------------------
        // BƯỚC 1: Đăng ký tài khoản thí sinh
        // ------------------------------------------------------------------------
        console.log('\n[1] Luồng E2E: Khởi tạo yêu cầu đăng ký tài khoản thí sinh...');
        await axios.post(`${API_URL}/auth/register`, {
            fullName: 'Thí Sinh Kiểm Thử Toàn Trình',
            email: testCandidateEmail,
            password: testPassword,
            phone: '0333133391'
        });
        console.log(`=> Trạng thái kiểm thử: Đăng ký thành công tài khoản [${testCandidateEmail}]`);

        // ------------------------------------------------------------------------
        // BƯỚC 1.5: Kết nối Database kích hoạt tài khoản
        // ------------------------------------------------------------------------
        console.log('\n[1.5] Luồng can thiệp từ Testing: Kết nối MySQL để kích hoạt tài khoản kiểm thử...');
        const connection = await mysql.createConnection(dbConfig);
        try {
            const [result] = await connection.execute(
                "UPDATE users SET status = 'ACTIVE', email_verified = 1 WHERE email = ?",
                [testCandidateEmail]
            );
            if (result.affectedRows > 0) {
                console.log('=> Trạng thái kiểm thử: Kích hoạt trạng thái ACTIVE thành công trên Cơ sở dữ liệu.');
            }
        } finally {
            await connection.end();
        }

        // ------------------------------------------------------------------------
        // BƯỚC 2: Đăng nhập lấy Token và User ID
        // ------------------------------------------------------------------------
        console.log('\n[2] Luồng E2E: Xác thực thông tin đăng nhập tài khoản thí sinh...');
        const loginCandidateRes = await axios.post(`${API_URL}/auth/login`, {
            email: testCandidateEmail,
            password: testPassword
        });
        candidateToken = loginCandidateRes.data.data.token || loginCandidateRes.data.data.accessToken;
        userId = loginCandidateRes.data.data.user.id; // TRÍCH XUẤT USER ID
        console.log(`=> Trạng thái kiểm thử: Đăng nhập thành công. Mã người dùng (User ID): [${userId}]`);

        // ------------------------------------------------------------------------
        // BƯỚC 2.5: Điền thông tin Profile để tạo Candidate ID
        // ------------------------------------------------------------------------
        console.log('\n[2.5] Luồng E2E: Giả lập hành động điền hồ sơ thông tin cá nhân thí sinh (UI)...');
        const profilePayload = {
            fullName: 'Thí Sinh Kiểm Thử Toàn Trình',
            email: testCandidateEmail,
            phone: '0333133391',
            citizenId: '001206' + Math.floor(100000 + Math.random() * 900000), // Render ngẫu nhiên CCCD
            dateOfBirth: '2006-08-23',
            gender: 'male',
            city: 'Hà Nội',
            address: 'Thạch Thất, Hà Nội',
            highSchool: 'THPT Chuyên Thử Nghiệm',
            graduationYear: 2026
        };
        const profileRes = await axios.put(`${API_URL}/candidates/my-profile/${userId}`, profilePayload, {
            headers: { 'Authorization': `Bearer ${candidateToken}` }
        });
        candidateId = profileRes.data.data.id; // TRÍCH XUẤT CANDIDATE ID
        console.log(`=> Trạng thái kiểm thử: Kích hoạt hồ sơ thành công. Mã thí sinh (Candidate ID): [${candidateId}]`);

        // ------------------------------------------------------------------------
        // BƯỚC 3: Nộp hồ sơ xét tuyển
        // ------------------------------------------------------------------------
        console.log('\n[3] Luồng E2E: Gửi yêu cầu khởi tạo hồ sơ đăng ký xét tuyển nguyện vọng...');
        const submitPayload = {
            candidateId: candidateId,
            universityId: 1,
            majorId: 1,
            admissionRoundId: 1,
            subjectGroupId: 1,
            admissionMethod: 'THPT_SCORE',
            scores: { math: 9.0, literature: 8.0, english: 8.5 },
            priorityGroup: 'KV2',
            priorityScore: 0.25
        };

        const submitRes = await axios.post(`${API_URL}/applications`, submitPayload, {
            headers: { 'Authorization': `Bearer ${candidateToken}` }
        });
        applicationId = submitRes.data.data.id;
        console.log(`=> Trạng thái kiểm thử: Khởi tạo hồ sơ thành công. Mã định danh trên UI: [${submitRes.data.data.applicationCode}]`);

        // ------------------------------------------------------------------------
        // BƯỚC 4: Chặn trùng hồ sơ (Business Rule)
        // ------------------------------------------------------------------------
        console.log('\n[4] Kiểm thử Logic nghiệp vụ: Gửi yêu cầu nộp trùng lặp thông tin hồ sơ hiện tại...');
        try {
            await axios.post(`${API_URL}/applications`, submitPayload, {
                headers: { 'Authorization': `Bearer ${candidateToken}` }
            });
            console.log('❌ Kết quả kiểm thử: Thất bại. Hệ thống không chặn trùng lặp hồ sơ theo Business Rules.');
        } catch (error) {
            if (error.response && (error.response.status === 400 || error.response.status === 500)) {
                console.log('=== KẾT QUẢ KIỂM THỬ LOGIC NGHIỆP VỤ (BUSINESS RULE) ===');
                console.log('✅ KẾT LUẬN: THÀNH CÔNG! Hệ thống đã chặn hành vi nộp trùng hồ sơ theo đúng Business Rules.');
                console.log(`=> Mã lỗi phản hồi hệ thống: ${error.response.status}`);
            } else {
                console.log(`=> Lỗi phát sinh ngoài kịch bản chặn trùng: Mã lỗi ${error.response ? error.response.status : error.message}`);
            }
        }

        // ------------------------------------------------------------------------
        // BƯỚC 5: Đăng nhập Admin
        // ------------------------------------------------------------------------
        console.log('\n[5] Luồng E2E: Xác thực thông tin đăng nhập với quyền Quản trị viên (Admin)...');
        const loginAdminRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: '123456'
        });
        adminToken = loginAdminRes.data.data.token || loginAdminRes.data.data.accessToken;
        console.log('=> Trạng thái kiểm thử: Đăng nhập quyền Admin thành công.');

        // ------------------------------------------------------------------------
        // BƯỚC 6: Phê duyệt hồ sơ
        // ------------------------------------------------------------------------
        console.log(`\n[6] Luồng E2E: Thực hiện thao tác phê duyệt hồ sơ mã định danh [${applicationId}]...`);
        const approveRes = await axios.put(`${API_URL}/applications/admin-update/${applicationId}`, {
            status: 'APPROVED',
            adminId: loginAdminRes.data.data.user.id,
            notes: 'Hồ sơ đầy đủ minh chứng hợp lệ, điểm đạt điều kiện. Phê duyệt.'
        }, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (approveRes.data.success || approveRes.status === 200) {
            console.log('\n LUỒNG KIỂM THỬ TÍCH HỢP TOÀN TRÌNH HOÀN THÀNH.');
            console.log('=> Quy trình nghiệp vụ vận hành thông suốt từ giao diện thí sinh đến giao diện quản trị.');
        }

    } catch (error) {
        console.log(`❌ Tiến trình kiểm thử bị ngắt quãng giữa chừng do lỗi: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
    }
}

runIntegrationAndE2ETest();