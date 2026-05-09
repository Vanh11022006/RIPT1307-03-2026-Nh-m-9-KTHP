import React, { useEffect } from "react";
import { Card, Form, Input, Button, DatePicker, Select, InputNumber, Row, Col, message, Divider, Typography } from "antd";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuthStore } from "../../stores/auth.store";
import { useCandidateStore } from "../../stores/candidate.store";
import dayjs from "dayjs";

const { Option } = Select;

export const Profile: React.FC = () => {
  const [form] = Form.useForm();
  const { currentUser } = useAuthStore();
  const { getCandidateByUserId, saveProfile } = useCandidateStore();

  useEffect(() => {
    if (currentUser) {
      const profile = getCandidateByUserId(currentUser.id);
      if (profile) {
        form.setFieldsValue({
          ...profile,
          dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
        });
      } else {
        // If they just registered, pre-fill from user mock data
        form.setFieldsValue({
          fullName: currentUser.fullName,
          email: currentUser.email,
          phone: currentUser.phone,
        });
      }
    }
  }, [currentUser, getCandidateByUserId, form]);

  const onFinish = (values: any) => {
    if (!currentUser) return;
    
    // Format dateOfBirth to ISO string
    const formattedValues = {
      ...values,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : undefined,
    };

    saveProfile(currentUser.id, formattedValues);
    message.success("Cập nhật thông tin cá nhân thành công!");
  };

  const currentYear = new Date().getFullYear();

  return (
    <div>
      <PageHeader title="Thông tin cá nhân" />
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark="optional"
        >
          <Divider />
          <Typography.Title level={4}>Thông tin cơ bản</Typography.Title>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên" },
                  { min: 2, message: "Họ tên phải có ít nhất 2 ký tự" }
                ]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="citizenId"
                label="Số CCCD"
                rules={[
                  { required: true, message: "Vui lòng nhập số CCCD" },
                  { pattern: /^[0-9]{12}$/, message: "Số CCCD phải bao gồm đúng 12 chữ số" }
                ]}
              >
                <Input placeholder="Nhập 12 chữ số CCCD" maxLength={12} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Typography.Title level={4}>Thông tin liên hệ</Typography.Title>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  { pattern: /^[0-9]{10}$/, message: "Số điện thoại phải bao gồm đúng 10 chữ số" }
                ]}
              >
                <Input placeholder="Nhập 10 chữ số" maxLength={10} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" }
                ]}
              >
                <Input placeholder="example@gmail.com" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="city"
                label="Tỉnh/Thành phố"
                rules={[{ required: true, message: "Vui lòng nhập tỉnh/thành phố" }]}
              >
                <Input placeholder="Ví dụ: Hà Nội" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="address"
                label="Địa chỉ chi tiết"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ chi tiết" }]}
              >
                <Input placeholder="Số nhà, tên đường, phường/xã, quận/huyện" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Typography.Title level={4}>Thông tin học tập</Typography.Title>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="highSchool"
                label="Trường THPT"
                rules={[{ required: true, message: "Vui lòng nhập tên trường THPT" }]}
              >
                <Input placeholder="Ví dụ: THPT Chuyên Hà Nội - Amsterdam" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="graduationYear"
                label="Năm tốt nghiệp"
                rules={[
                  { required: true, message: "Vui lòng nhập năm tốt nghiệp" },
                  {
                    validator: (_, value) => {
                      if (!value || (value >= 2000 && value <= currentYear)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(`Năm tốt nghiệp phải từ 2000 đến ${currentYear}`));
                    }
                  }
                ]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="Ví dụ: 2026" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button type="primary" htmlType="submit" size="large">
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};
