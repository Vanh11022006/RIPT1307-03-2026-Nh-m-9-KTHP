import React from "react";
import { Tag } from "antd";
import type {  EntityStatus  } from "../../types/common.types";

interface EntityStatusTagProps {
  status: EntityStatus;
}

export const EntityStatusTag: React.FC<EntityStatusTagProps> = ({ status }) => {
  const config = {
    active: { color: "success", text: "Đang hoạt động" },
    inactive: { color: "default", text: "Ngừng hoạt động" }
  };

  const { color, text } = config[status] || config.inactive;

  return <Tag color={color}>{text}</Tag>;
};
