import React from "react";
import { Link } from "react-router-dom";

interface AppLogoProps {
  collapsed?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ collapsed }) => {
  return (
    <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
      <img src="/logo.png" alt="Logo" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
      {!collapsed && (
        <span style={{ fontSize: "18px", fontWeight: "bold", color: "inherit", whiteSpace: "nowrap" }}>
          UniAdmission
        </span>
      )}
    </Link>
  );
};
