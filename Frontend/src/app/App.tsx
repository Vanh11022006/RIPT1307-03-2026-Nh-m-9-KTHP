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

export const App: React.FC = () => {
  const { loadCurrentUserFromStorage } = useAuthStore();
  const { getUniversities } = useUniversityStore();
  const { getMajors } = useMajorStore();
  const { getAdmissionRounds } = useAdmissionRoundStore();
  const { getAllSubjectGroups } = useSubjectGroupStore();

  useEffect(() => {
    loadCurrentUserFromStorage();
    // Fetch initial data from backend
    getUniversities();
    getMajors();
    getAdmissionRounds();
    getAllSubjectGroups();
  }, [loadCurrentUserFromStorage, getUniversities, getMajors, getAdmissionRounds, getAllSubjectGroups]);

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
