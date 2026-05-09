import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

interface AppLogoProps {
  collapsed?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ collapsed }) => {
  return (
    <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
      <GraduationCap size={32} color="#1677ff" />
      {!collapsed && (
        <span style={{ fontSize: "16px", fontWeight: "bold", color: "inherit", whiteSpace: "nowrap" }}>
          UniAdmission
        </span>
      )}
    </Link>
  );
};
