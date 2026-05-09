import React from "react";
import { Typography, Breadcrumb } from "antd";

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  breadcrumbs?: { title: string; href?: string }[];
  extra?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs, extra }) => {
  return (
    <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} style={{ marginBottom: 8 }} />
        )}
        <Title level={2} style={{ margin: 0 }}>
          {title}
        </Title>
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
};
