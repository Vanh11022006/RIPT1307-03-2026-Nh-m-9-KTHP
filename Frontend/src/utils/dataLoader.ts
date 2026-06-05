import { useCandidateStore } from '../stores/candidate.store';
import { useUniversityStore } from '../stores/university.store';
import { useMajorStore } from '../stores/major.store';
import { useApplicationStore } from '../stores/application.store';
import { useAdmissionRoundStore } from '../stores/admissionRound.store';
import { useSubjectGroupStore } from '../stores/subjectGroup.store';
import { useNotificationLogStore } from '../stores/notificationLog.store';
import { useAuthStore } from '../stores/auth.store';

export const loadAdminDashboardData = async () => {
  const startTime = performance.now();
  
  try {
    const [candidates, universities, majors, applications, admissionRounds] = await Promise.all([
      useCandidateStore.getState().getCandidates(),
      useUniversityStore.getState().getUniversities(),
      useMajorStore.getState().getMajors(),
      useApplicationStore.getState().getApplications(),
      useAdmissionRoundStore.getState().getAdmissionRounds(),
    ]);

    const endTime = performance.now();
    if (import.meta.env.DEV) console.log(`✅ [dataLoader] Admin Dashboard data loaded in ${(endTime - startTime).toFixed(2)}ms`);

    return { candidates, universities, majors, applications, admissionRounds };
  } catch (error) {
    console.error('❌ [dataLoader] Failed to load admin dashboard data:', error);
    throw error;
  }
};

export const loadUniversityManagementData = async () => {
  const startTime = performance.now();
  
  try {
    const [universities, majors, admissionRounds, subjectGroups] = await Promise.all([
      useUniversityStore.getState().getUniversities(),
      useMajorStore.getState().getMajors(),
      useAdmissionRoundStore.getState().getAdmissionRounds(),
      useSubjectGroupStore.getState().getAllSubjectGroups(),
    ]);

    const endTime = performance.now();
    if (import.meta.env.DEV) console.log(`✅ [dataLoader] University Management data loaded in ${(endTime - startTime).toFixed(2)}ms`);

    return { universities, majors, admissionRounds, subjectGroups };
  } catch (error) {
    console.error('❌ [dataLoader] Failed to load university management data:', error);
    throw error;
  }
};

export const loadMajorManagementData = async () => {
  const startTime = performance.now();
  
  try {
    const [universities, majors, subjectGroups, admissionRounds] = await Promise.all([
      useUniversityStore.getState().getUniversities(),
      useMajorStore.getState().getMajors(),
      useSubjectGroupStore.getState().getAllSubjectGroups(),
      useAdmissionRoundStore.getState().getAdmissionRounds(),
    ]);

    const endTime = performance.now();
    if (import.meta.env.DEV) console.log(`✅ [dataLoader] Major Management data loaded in ${(endTime - startTime).toFixed(2)}ms`);

    return { universities, majors, subjectGroups, admissionRounds };
  } catch (error) {
    console.error('❌ [dataLoader] Failed to load major management data:', error);
    throw error;
  }
};

export const loadApplicationManagementData = async (): Promise<void> => {
  const startTime = performance.now();
  
  try {
    await Promise.all([
      useUniversityStore.getState().getUniversities(),
      useMajorStore.getState().getMajors(),
      useCandidateStore.getState().getCandidates(),
      useAdmissionRoundStore.getState().getAdmissionRounds(),
    ]);

    const endTime = performance.now();
    if (import.meta.env.DEV) console.log(`✅ [dataLoader] Application Management reference data loaded in ${(endTime - startTime).toFixed(2)}ms`);

    // Danh sách hồ sơ cố tình không được fetch ở đây để tránh tranh chấp dữ liệu (race conditions).
  } catch (error) {
    console.error('❌ [dataLoader] Failed to load application management data:', error);
    throw error;
  }
};

export const loadCandidateManagementData = async () => {
  const startTime = performance.now();
  
  try {
    const [candidates, applications, universities, admissionRounds] = await Promise.all([
      useCandidateStore.getState().getCandidates(),
      useApplicationStore.getState().getApplications(),
      useUniversityStore.getState().getUniversities(),
      useAdmissionRoundStore.getState().getAdmissionRounds(),
    ]);

    const endTime = performance.now();
    if (import.meta.env.DEV) console.log(`✅ [dataLoader] Candidate Management data loaded in ${(endTime - startTime).toFixed(2)}ms`);

    return { candidates, applications, universities, admissionRounds };
  } catch (error) {
    console.error('❌ [dataLoader] Failed to load candidate management data:', error);
    throw error;
  }
};

export const loadCandidateDashboardData = async () => {
  const startTime = performance.now();
  const currentUser = useAuthStore.getState().currentUser;
  
  try {
    await Promise.all([
      useUniversityStore.getState().getUniversities(),
      useMajorStore.getState().getMajors(),
      useAdmissionRoundStore.getState().getAdmissionRounds(),
    ]);

    if (currentUser?.id) {
      await useApplicationStore.getState().getApplicationsByCandidateId(String(currentUser.id));
    }

    const universities = useUniversityStore.getState().universities;
    const majors = useMajorStore.getState().majors;
    const admissionRounds = useAdmissionRoundStore.getState().admissionRounds;
    const applications = useApplicationStore.getState().applications;

    const endTime = performance.now();
    if (import.meta.env.DEV) console.log(`✅ [dataLoader] Candidate Dashboard data loaded in ${(endTime - startTime).toFixed(2)}ms`);

    return { universities, majors, admissionRounds, applications };
  } catch (error) {
    console.error('❌ [dataLoader] Failed to load candidate dashboard data:', error);
    throw error;
  }
};

export const loadUniversityListData = async () => {
  const startTime = performance.now();
  
  try {
    const universities = await useUniversityStore.getState().getUniversities();

    const endTime = performance.now();
    if (import.meta.env.DEV) console.log(`✅ [dataLoader] University List data loaded in ${(endTime - startTime).toFixed(2)}ms`);

    return { universities };
  } catch (error) {
    console.error('❌ [dataLoader] Failed to load university list data:', error);
    throw error;
  }
};

export const loadMyApplicationsData = async () => {
  const startTime = performance.now();
  const currentUser = useAuthStore.getState().currentUser;
  
  try {
    let applications: any[] = [];

    if (currentUser?.id) {
      await Promise.all([
        useApplicationStore.getState().getApplicationsByCandidateId(String(currentUser.id)),
        useUniversityStore.getState().getUniversities(),
        useMajorStore.getState().getMajors(),
      ]);
    } else {
      await Promise.all([
        useUniversityStore.getState().getUniversities(),
        useMajorStore.getState().getMajors(),
      ]);
    }

    applications = useApplicationStore.getState().applications;
    const universities = useUniversityStore.getState().universities;
    const majors = useMajorStore.getState().majors;

    const endTime = performance.now();
    if (import.meta.env.DEV) console.log(`✅ [dataLoader] My Applications data loaded in ${(endTime - startTime).toFixed(2)}ms`);

    return { applications, universities, majors };
  } catch (error) {
    console.error('❌ [dataLoader] Failed to load my applications data:', error);
    throw error;
  }
};

export const loadNotificationData = async () => {
  const startTime = performance.now();
  const currentUser = useAuthStore.getState().currentUser;
  
  try {
    let notificationLogs: any[] = [];
    
    if (currentUser?.id) {
      notificationLogs = await useNotificationLogStore.getState().getNotificationLogsByUserId(String(currentUser.id));
    }

    const endTime = performance.now();
    if (import.meta.env.DEV) console.log(`✅ [dataLoader] Notification data loaded in ${(endTime - startTime).toFixed(2)}ms`);

    return { notificationLogs };
  } catch (error) {
    console.error('❌ [dataLoader] Failed to load notification data:', error);
    throw error;
  }
};

export const loadDataInParallel = async <T extends Record<string, () => Promise<any>>>(
  loaders: T
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> => {
  const startTime = performance.now();
  
  try {
    const keys = Object.keys(loaders) as Array<keyof T>;
    const results = await Promise.all(keys.map(key => loaders[key]()));
    
    const data = {} as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
    keys.forEach((key, index) => {
      data[key] = results[index];
    });

    const endTime = performance.now();
    if (import.meta.env.DEV) console.log(`✅ [dataLoader] Parallel data loaded in ${(endTime - startTime).toFixed(2)}ms`);

    return data;
  } catch (error) {
    console.error('❌ [dataLoader] Failed to load data in parallel:', error);
    throw error;
  }
};
