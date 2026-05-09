import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  const handleBack = () => {
    if (currentUser?.role === "admin") {
      navigate("/admin/dashboard");
    } else if (currentUser?.role === "candidate") {
      navigate("/candidate/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <Result
      status="403"
      title="403"
      subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
      extra={<Button type="primary" onClick={handleBack}>Quay lại trang chủ</Button>}
    />
  );
};
