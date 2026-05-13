import React from "react";
import { Spin } from "antd";

interface LoadingScreenProps {
  tip?: string;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  tip = "Đang tải dữ liệu...", 
  fullScreen = false 
}) => {
  const containerStyle: React.CSSProperties = fullScreen 
    ? { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }
    : { padding: "50px", textAlign: "center" };

  return (
    <div style={containerStyle}>
      <Spin size="large" tip={tip}>
        {/* Empty div needed for tip to show properly in some AntD versions when wrapping content */}
        <div style={{ padding: 20 }} />
      </Spin>
    </div>
  );
};
