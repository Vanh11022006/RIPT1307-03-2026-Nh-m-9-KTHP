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

export const App: React.FC = () => {
  const { loadCurrentUserFromStorage, currentUser } = useAuthStore();
  const { getUniversities } = useUniversityStore();
  const { getMajors } = useMajorStore();
  const { getAdmissionRounds } = useAdmissionRoundStore();
  const { getAllSubjectGroups } = useSubjectGroupStore();
  const { getProfile } = useCandidateStore();

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
    if (currentUser && currentUser.id) {
      getProfile(currentUser.id).catch((e) => console.error(e));
    }
  }, [currentUser, getProfile]);

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
