import React from "react";
import { Empty, Button } from "antd";

interface EmptyStateProps {
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  description = "Không có dữ liệu", 
  actionText, 
  onAction 
}) => {
  return (
    <Empty
      description={description}
      style={{ margin: "40px 0" }}
    >
      {actionText && onAction && (
        <Button type="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Empty>
  );
};
