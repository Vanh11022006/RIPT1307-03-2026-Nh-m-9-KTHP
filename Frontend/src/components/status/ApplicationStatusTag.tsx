import React from "react";
import { Tag } from "antd";
import type {  ApplicationStatus  } from "../../types/common.types";

interface ApplicationStatusTagProps {
  status: ApplicationStatus;
}

export const ApplicationStatusTag: React.FC<ApplicationStatusTagProps> = ({ status }) => {
  const config = {
    pending: { color: "warning", text: "Chờ duyệt" },
    approved: { color: "success", text: "Đã duyệt" },
    rejected: { color: "error", text: "Từ chối" }
  };

  const { color, text } = config[status] || { color: "default", text: "Không rõ" };

  return <Tag color={color}>{text}</Tag>;
};
