import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { router } from "./router";
import { useAuthStore } from "../stores/auth.store";

export const App: React.FC = () => {
  const { loadCurrentUserFromStorage } = useAuthStore();

  useEffect(() => {
    loadCurrentUserFromStorage();
  }, [loadCurrentUserFromStorage]);

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 6,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

export default App;
