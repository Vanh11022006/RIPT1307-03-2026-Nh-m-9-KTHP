import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { router } from "./router";
import { useAuthStore } from "../stores/auth.store";
import { useUniversityStore } from "../stores/university.store";
import { useMajorStore } from "../stores/major.store";
import { useAdmissionRoundStore } from "../stores/admissionRound.store";
import { useSubjectGroupStore } from "../stores/subjectGroup.store";
import { useCandidateStore } from "../stores/candidate.store";
import { useTheme } from "../contexts/ThemeContext";
import { theme as antTheme } from "antd";

export const App: React.FC = () => {
  const { loadCurrentUserFromStorage, currentUser } = useAuthStore();
  const { getUniversities } = useUniversityStore();
  const { getMajors } = useMajorStore();
  const { getAdmissionRounds } = useAdmissionRoundStore();
  const { getAllSubjectGroups } = useSubjectGroupStore();
  const { getProfile } = useCandidateStore();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    loadCurrentUserFromStorage();
    // Fetch initial data from backend
    getUniversities();
    getMajors();
    getAdmissionRounds();
    getAllSubjectGroups();
  }, [loadCurrentUserFromStorage, getUniversities, getMajors, getAdmissionRounds, getAllSubjectGroups]);

  // When currentUser is available, load candidate profile into store so Profile page
  // can render the saved data after reload.
  useEffect(() => {
    if (currentUser && currentUser.id && currentUser.role === "candidate") {
      getProfile(currentUser.id).catch((e) => console.error(e));
    }
  }, [currentUser, getProfile]);

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: isDarkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#10b981", // Eco-friendly green
          borderRadius: 8,
          colorBgContainer: isDarkMode ? "#0f172a" : "#ffffff", // slate-900 or white
          colorBgElevated: isDarkMode ? "#1e293b" : "#ffffff", // slate-800 or white
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        },
        components: {
          Card: {
            colorBgContainer: isDarkMode ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
            colorBorderSecondary: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#f0f0f0",
            boxShadowTertiary: isDarkMode ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "0 4px 20px rgba(0, 0, 0, 0.05)",
          },
          Layout: {
            bodyBg: "transparent",
            headerBg: "transparent",
            siderBg: isDarkMode ? "rgba(15, 23, 42, 0.8)" : "rgba(255, 255, 255, 0.8)",
          }
        }
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

export default App;
