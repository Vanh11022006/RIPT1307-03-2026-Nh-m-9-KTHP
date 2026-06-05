import React, { useMemo, useState, useEffect } from "react";
import { Select } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useCandidateStore } from "../../stores/candidate.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useApplicationStore } from "../../stores/application.store";
import { useAdmissionRoundStore } from "../../stores/admissionRound.store";
import { useAuthStore } from "../../stores/auth.store";
import { useTheme } from "../../contexts/ThemeContext";
import { formatDate } from "../../utils/date";
import { loadAdminDashboardData } from "../../utils/dataLoader";
import type { Application } from "../../types/application.types";

const { Option } = Select;

type AdminApplicationBreakdownRow = {
  id: string;
  code?: string;
  name: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
};

type AdminApplicationStatistics = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  byUniversity: AdminApplicationBreakdownRow[];
  byMajor: AdminApplicationBreakdownRow[];
  byAdmissionRound: AdminApplicationBreakdownRow[];
};

type BreakdownMeta = {
  id: string;
  code?: string;
  name: string;
};

const emptyBreakdownRows: AdminApplicationBreakdownRow[] = [];

const buildBreakdownRows = (
  applications: Application[],
  resolveMeta: (application: Application) => BreakdownMeta | null
): AdminApplicationBreakdownRow[] => {
  const rows = new Map<string, AdminApplicationBreakdownRow>();

  applications.forEach((application) => {
    const meta = resolveMeta(application);
    if (!meta) {
      return;
    }

    if (!rows.has(meta.id)) {
      rows.set(meta.id, {
        id: meta.id,
        code: meta.code,
        name: meta.name,
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
      });
    }

    const next = rows.get(meta.id);
    if (!next) {
      return;
    }

    next.total += 1;
    if (application.status === "pending") next.pending += 1;
    if (application.status === "approved") next.approved += 1;
    if (application.status === "rejected") next.rejected += 1;
    if (application.status === "cancelled") next.cancelled += 1;
  });

  return Array.from(rows.values()).sort((left, right) => {
    if (right.total !== left.total) {
      return right.total - left.total;
    }

    return left.name.localeCompare(right.name, "vi");
  });
};

// Custom pagination helper
const Pagination: React.FC<{
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}> = ({ current, total, pageSize, onChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className="px-3 py-1 rounded-md border border-black/[0.08] text-xs font-semibold hover:bg-slate-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed bg-transparent transition-all"
      >
        Trước
      </button>
      <span className="text-xs text-[#44474E] font-medium">
        Trang {current} / {totalPages}
      </span>
      <button
        disabled={current === totalPages}
        onClick={() => onChange(current + 1)}
        className="px-3 py-1 rounded-md border border-black/[0.08] text-xs font-semibold hover:bg-slate-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed bg-transparent transition-all"
      >
        Sau
      </button>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { isDarkMode } = useTheme();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [adminApplicationStats, setAdminApplicationStats] = useState<AdminApplicationStatistics | null>(null);

  // Pagination states for breakdowns
  const [uniPage, setUniPage] = useState(1);
  const [majorPage, setMajorPage] = useState(1);
  const [roundPage, setRoundPage] = useState(1);

  const pageSize = 4;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { candidates, loading: candidatesLoading, getCandidateById, getCandidates } = useCandidateStore();
  const { universities, loading: universitiesLoading, getUniversityById, getUniversities } = useUniversityStore();
  const { majors, loading: majorsLoading, getMajorById, getMajors } = useMajorStore();
  const { applications, loading: applicationsLoading, getApplications, getAdminApplicationStatistics } = useApplicationStore();
  const { admissionRounds, loading: admissionRoundsLoading, getAdmissionRounds, getAdmissionRoundById } = useAdmissionRoundStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadAdminDashboardData();
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };
    loadData();
  }, [getCandidates, getUniversities, getMajors, getApplications, getAdmissionRounds]);

  const [selectedAdmissionRoundId, setSelectedAdmissionRoundId] = useState<string>("all");
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>("all");
  const [selectedMajorId, setSelectedMajorId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadStatistics = async () => {
      try {
        const nextStats = await getAdminApplicationStatistics({
          universityId: selectedUniversityId,
          majorId: selectedMajorId,
          admissionRoundId: selectedAdmissionRoundId,
        });

        if (!cancelled) {
          setAdminApplicationStats(nextStats);
          // Reset pagination when filter changes
          setUniPage(1);
          setMajorPage(1);
          setRoundPage(1);
        }
      } catch (error) {
        if (!cancelled) {
          setAdminApplicationStats(null);
        }
      }
    };

    loadStatistics();

    return () => {
      cancelled = true;
    };
  }, [getAdminApplicationStatistics, selectedUniversityId, selectedAdmissionRoundId, selectedMajorId]);

  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  const safeUniversities = Array.isArray(universities) ? universities : [];
  const safeMajors = Array.isArray(majors) ? majors : [];
  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeAdmissionRounds = Array.isArray(admissionRounds) ? admissionRounds : [];

  const loading = candidatesLoading || universitiesLoading || majorsLoading || applicationsLoading || admissionRoundsLoading;

  const filteredApplications = useMemo(() => {
    return safeApplications.filter(app => {
      const matchRound = selectedAdmissionRoundId === "all" || app.admissionRoundId === selectedAdmissionRoundId;
      const matchUni = selectedUniversityId === "all" || app.universityId === selectedUniversityId;
      const matchMajor = selectedMajorId === "all" || app.majorId === selectedMajorId;

      let matchSearch = true;
      if (searchQuery.trim()) {
        const candidate = getCandidateById(app.candidateId);
        const candidateName = candidate?.fullName?.toLowerCase() || "";
        const appCode = app.applicationCode?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        matchSearch = candidateName.includes(query) || appCode.includes(query);
      }

      return matchRound && matchUni && matchMajor && matchSearch;
    });
  }, [safeApplications, selectedAdmissionRoundId, selectedUniversityId, selectedMajorId, searchQuery, getCandidateById]);

  const localStats = useMemo(() => {
    return {
      total: filteredApplications.length,
      pending: filteredApplications.filter(a => a.status === 'pending').length,
      approved: filteredApplications.filter(a => a.status === 'approved').length,
      rejected: filteredApplications.filter(a => a.status === 'rejected').length,
      cancelled: filteredApplications.filter(a => a.status === 'cancelled').length,
      byUniversity: emptyBreakdownRows,
      byMajor: emptyBreakdownRows,
      byAdmissionRound: emptyBreakdownRows,
    };
  }, [filteredApplications]);

  const stats = adminApplicationStats ?? localStats;

  const latestApplications = useMemo(() => {
    return filteredApplications
      .slice()
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 8);
  }, [filteredApplications]);

  const percentPending = stats.total > 0 ? (stats.pending / stats.total) * 100 : 0;
  const percentApproved = stats.total > 0 ? (stats.approved / stats.total) * 100 : 0;
  const percentRejected = stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0;
  const percentCancelled = stats.total > 0 ? (stats.cancelled / stats.total) * 100 : 0;

  const universityBreakdown = useMemo(() => {
    if (adminApplicationStats?.byUniversity?.length) {
      return adminApplicationStats.byUniversity;
    }

    return buildBreakdownRows(filteredApplications, (application) => {
      const university = getUniversityById(application.universityId);
      if (!university) {
        return null;
      }

      return {
        id: university.id,
        code: university.code,
        name: university.name || "Chưa cập nhật",
      };
    });
  }, [adminApplicationStats, filteredApplications, getUniversityById]);

  const majorBreakdown = useMemo(() => {
    if (adminApplicationStats?.byMajor?.length) {
      return adminApplicationStats.byMajor;
    }

    return buildBreakdownRows(filteredApplications, (application) => {
      const major = getMajorById(application.majorId);
      if (!major) {
        return null;
      }

      return {
        id: major.id,
        code: major.code,
        name: major.name || "Chưa cập nhật",
      };
    });
  }, [adminApplicationStats, filteredApplications, getMajorById]);

  const admissionRoundBreakdown = useMemo(() => {
    if (adminApplicationStats?.byAdmissionRound?.length) {
      return adminApplicationStats.byAdmissionRound;
    }

    return buildBreakdownRows(filteredApplications, (application) => {
      const round = getAdmissionRoundById(application.admissionRoundId ?? "");
      if (!round) {
        return null;
      }

      return {
        id: round.id,
        code: round.code,
        name: round.name || "Chưa cập nhật",
      };
    });
  }, [adminApplicationStats, filteredApplications, getAdmissionRoundById]);

  const paginatedUnis = useMemo(() => {
    return universityBreakdown.slice((uniPage - 1) * pageSize, uniPage * pageSize);
  }, [universityBreakdown, uniPage]);

  const paginatedMajors = useMemo(() => {
    return majorBreakdown.slice((majorPage - 1) * pageSize, majorPage * pageSize);
  }, [majorBreakdown, majorPage]);

  const paginatedRounds = useMemo(() => {
    return admissionRoundBreakdown.slice((roundPage - 1) * pageSize, roundPage * pageSize);
  }, [admissionRoundBreakdown, roundPage]);

  if (loading && safeCandidates.length === 0 && safeUniversities.length === 0 && safeMajors.length === 0 && safeApplications.length === 0 && safeAdmissionRounds.length === 0) {
    return <LoadingScreen fullScreen tip="Đang tải bảng điều khiển..." />;
  }

  const cardBgClass = isDarkMode ? "bg-slate-900 border-white/[0.08] text-slate-200" : "bg-white border-black/[0.08] text-slate-800";

  return (
    <div className="space-y-12 relative pb-10">
      
      <div className="glow-bg -top-20 -left-20 pointer-events-none"></div>
      <div className="glow-bg top-1/2 -right-20 opacity-50 pointer-events-none"></div>

      
      <section className={`relative overflow-hidden rounded-lg p-12 shadow-sm border ${cardBgClass}`}>
        <div className="relative z-10 flex flex-col xl:flex-row justify-between xl:items-center gap-6">
          <div className="space-y-3">
            <h2 className={`text-3xl md:text-4xl font-extrabold m-0 ${isDarkMode ? 'text-white' : 'text-[#1A1C1E]'}`}>
              Chào mừng trở lại, <span className="text-[#00616D]">{currentUser?.fullName || "System Admin"}! 👋</span>
            </h2>
            <p className="text-base text-[#44474E] max-w-xl m-0 leading-relaxed">
              Theo dõi và quản lý toàn bộ hệ thống xét tuyển. Bạn có <strong className="text-[#00616D]">{stats.pending}</strong> hồ sơ đang chờ phê duyệt hôm nay.
            </p>
            <div className="flex flex-wrap gap-4 pt-3">
              <button
                onClick={() => navigate("/admin/applications")}
                className="bg-[#00616D] text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:shadow-lg active:scale-95 transition-all border-0 cursor-pointer text-sm"
              >
                Xử lý hồ sơ ngay
              </button>
              <div className="flex items-center gap-2 px-4 py-3 bg-[#00616D]/5 border border-[#00616D]/10 rounded-full text-sm font-semibold text-[#00616D]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
                Hệ thống ổn định
              </div>
            </div>
          </div>
          <div className="bg-[#00616D]/5 p-6 rounded-xl border border-[#00616D]/10 shrink-0 text-right">
            <h4 className="text-2xl font-extrabold text-[#00616D] m-0">
              {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </h4>
            <p className="text-xs text-[#44474E] font-bold uppercase tracking-wider m-0 mt-2">
              {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#00616D]/5 blur-[100px] rounded-full pointer-events-none"></div>
      </section>

      
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-6">
        
        <div className={`p-6 rounded-lg flex items-center justify-between border glass-card-hover ${cardBgClass}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00E3FD]/10 flex items-center justify-center text-[#00616D] shrink-0">
              <span className="material-symbols-outlined text-3xl">groups</span>
            </div>
            <div>
              <p className="text-[#44474E] text-xs font-bold uppercase tracking-wider m-0">Tổng thí sinh</p>
              <p className={`text-2xl font-bold m-0 mt-1 ${isDarkMode ? 'text-white' : 'text-[#1A1C1E]'}`}>{safeCandidates.length}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold text-emerald-600 bg-emerald-50 shrink-0 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">arrow_upward</span>12%
          </span>
        </div>

        
        <div className={`p-6 rounded-lg flex items-center justify-between border glass-card-hover ${cardBgClass}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00616D]/10 flex items-center justify-center text-[#00616D] shrink-0">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            <div>
              <p className="text-[#44474E] text-xs font-bold uppercase tracking-wider m-0">Tổng trường ĐH</p>
              <p className={`text-2xl font-bold m-0 mt-1 ${isDarkMode ? 'text-white' : 'text-[#1A1C1E]'}`}>{safeUniversities.length}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold text-emerald-600 bg-emerald-50 shrink-0 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">arrow_upward</span>8%
          </span>
        </div>

        
        <div className={`p-6 rounded-lg flex items-center justify-between border glass-card-hover ${cardBgClass}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00616D]/10 flex items-center justify-center text-[#00616D] shrink-0">
              <span className="material-symbols-outlined text-3xl">book</span>
            </div>
            <div>
              <p className="text-[#44474E] text-xs font-bold uppercase tracking-wider m-0">Ngành đào tạo</p>
              <p className={`text-2xl font-bold m-0 mt-1 ${isDarkMode ? 'text-white' : 'text-[#1A1C1E]'}`}>{safeMajors.length}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50 shrink-0 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">arrow_downward</span>2%
          </span>
        </div>

        
        <div className={`p-6 rounded-lg flex items-center justify-between border glass-card-hover ${cardBgClass}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00616D]/10 flex items-center justify-center text-[#00616D] shrink-0">
              <span className="material-symbols-outlined text-3xl">description</span>
            </div>
            <div>
              <p className="text-[#44474E] text-xs font-bold uppercase tracking-wider m-0">Tổng hồ sơ</p>
              <p className={`text-2xl font-bold m-0 mt-1 ${isDarkMode ? 'text-white' : 'text-[#1A1C1E]'}`}>{stats.total}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold text-emerald-600 bg-emerald-50 shrink-0 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">arrow_upward</span>24%
          </span>
        </div>
      </section>

      
      <section className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-12 gap-8">
        
        <div className={`xl:col-span-1 2xl:col-span-4 p-6 rounded-lg border shadow-sm flex flex-col justify-between ${cardBgClass}`}>
          <h3 className="font-bold text-[#1A1C1E] text-base m-0 mb-4">Trạng thái xét duyệt</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs text-[#44474E] mb-1 font-semibold uppercase">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00E3FD]"></span>Chờ duyệt</span>
                <span className="font-bold">{stats.pending} ({percentPending.toFixed(1)}%)</span>
              </div>
              <div className="w-full h-2 bg-[#F1F4F5] rounded-full overflow-hidden">
                <div className="h-full bg-[#00E3FD]" style={{ width: `${percentPending}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs text-[#44474E] mb-1 font-semibold uppercase">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10B981]"></span>Đã duyệt</span>
                <span className="font-bold">{stats.approved} ({percentApproved.toFixed(1)}%)</span>
              </div>
              <div className="w-full h-2 bg-[#F1F4F5] rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981]" style={{ width: `${percentApproved}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs text-[#44474E] mb-1 font-semibold uppercase">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>Từ chối</span>
                <span className="font-bold">{stats.rejected} ({percentRejected.toFixed(1)}%)</span>
              </div>
              <div className="w-full h-2 bg-[#F1F4F5] rounded-full overflow-hidden">
                <div className="h-full bg-[#EF4444]" style={{ width: `${percentRejected}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs text-[#44474E] mb-1 font-semibold uppercase">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#A855F7]"></span>Đã hủy</span>
                <span className="font-bold">{stats.cancelled} ({percentCancelled.toFixed(1)}%)</span>
              </div>
              <div className="w-full h-2 bg-[#F1F4F5] rounded-full overflow-hidden">
                <div className="h-full bg-[#A855F7]" style={{ width: `${percentCancelled}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        
        <div className={`xl:col-span-1 2xl:col-span-4 p-6 rounded-lg border shadow-sm flex flex-col justify-between gap-4 ${cardBgClass}`}>
          <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Trường</span>
              <h4 className="text-2xl font-bold text-blue-900 m-0 mt-1">{universityBreakdown.length}</h4>
            </div>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">ĐANG CÓ HỒ SƠ</span>
          </div>

          <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Ngành</span>
              <h4 className="text-2xl font-bold text-emerald-900 m-0 mt-1">{majorBreakdown.length}</h4>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">ĐANG ĐÀO TẠO</span>
          </div>

          <div className="p-4 rounded-lg bg-purple-50/50 border border-purple-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-purple-600 font-bold uppercase tracking-wider">Đợt</span>
              <h4 className="text-2xl font-bold text-purple-900 m-0 mt-1">{admissionRoundBreakdown.length}</h4>
            </div>
            <span className="text-[10px] text-purple-700 font-bold bg-purple-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">ĐANG XÉT TUYỂN</span>
          </div>
        </div>

        
        <div className="xl:col-span-2 2xl:col-span-4 p-6 rounded-lg border shadow-sm bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E3FD]/10 blur-2xl rounded-full"></div>
          <div>
            <span className="text-xs text-[#00E3FD] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>QUẢN LÝ HIỆU QUẢ
            </span>
            <h4 className="text-lg font-bold text-white m-0">Hệ thống tự động xét duyệt</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed m-0">
              Hệ thống xử lý hồ sơ tự động giúp xét duyệt nhanh chóng và chính xác cho hàng nghìn nguyện vọng mỗi năm.
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <span className="material-symbols-outlined text-3xl text-[#00E3FD]">insights</span>
          </div>
        </div>
      </section>

      
      <section className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
        
        <div className={`p-6 rounded-lg border shadow-sm ${cardBgClass}`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-[#1A1C1E] text-base m-0">Breakdown theo trường</h3>
              <p className="text-xs text-[#44474E] m-0 mt-0.5">Số hồ sơ và trạng thái theo từng trường đại học</p>
            </div>
            <span className="px-2.5 py-0.5 bg-[#00616D]/10 text-[#00616D] text-xs font-bold rounded-full">
              {universityBreakdown.length} nhóm
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.08] text-[10px] font-bold text-[#44474E] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Tên trường</th>
                  <th className="py-2.5 px-3 text-center">Tổng</th>
                  <th className="py-2.5 px-3 text-center">Đã duyệt</th>
                  <th className="py-2.5 px-3 text-center">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-xs">
                {paginatedUnis.length > 0 ? (
                  paginatedUnis.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#1A1C1E]">
                        {item.name}
                        {item.code && <div className="text-[10px] text-[#44474E] font-medium mt-0.5">{item.code}</div>}
                      </td>
                      <td className="py-3 px-3 text-center font-bold">{item.total}</td>
                      <td className="py-3 px-3 text-center"><span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">{item.approved}</span></td>
                      <td className="py-3 px-3 text-center font-bold text-[#00616D]">
                        {stats.total > 0 ? `${((item.total / stats.total) * 100).toFixed(1)}%` : "0%"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            current={uniPage}
            total={universityBreakdown.length}
            pageSize={pageSize}
            onChange={setUniPage}
          />
        </div>

        
        <div className={`p-6 rounded-lg border shadow-sm ${cardBgClass}`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-[#1A1C1E] text-base m-0">Breakdown theo ngành</h3>
              <p className="text-xs text-[#44474E] m-0 mt-0.5">Số hồ sơ và trạng thái theo từng ngành đào tạo</p>
            </div>
            <span className="px-2.5 py-0.5 bg-[#00616D]/10 text-[#00616D] text-xs font-bold rounded-full">
              {majorBreakdown.length} nhóm
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.08] text-[10px] font-bold text-[#44474E] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Tên ngành</th>
                  <th className="py-2.5 px-3 text-center">Tổng</th>
                  <th className="py-2.5 px-3 text-center">Chờ duyệt</th>
                  <th className="py-2.5 px-3 text-center">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-xs">
                {paginatedMajors.length > 0 ? (
                  paginatedMajors.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#1A1C1E]">
                        {item.name}
                        {item.code && <div className="text-[10px] text-[#44474E] font-medium mt-0.5">{item.code}</div>}
                      </td>
                      <td className="py-3 px-3 text-center font-bold">{item.total}</td>
                      <td className="py-3 px-3 text-center"><span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">{item.pending}</span></td>
                      <td className="py-3 px-3 text-center font-bold text-[#00616D]">
                        {stats.total > 0 ? `${((item.total / stats.total) * 100).toFixed(1)}%` : "0%"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            current={majorPage}
            total={majorBreakdown.length}
            pageSize={pageSize}
            onChange={setMajorPage}
          />
        </div>
      </section>

      
      <section className={`p-6 rounded-lg border shadow-sm ${cardBgClass}`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-[#1A1C1E] text-base m-0">Breakdown theo đợt</h3>
            <p className="text-xs text-[#44474E] m-0 mt-0.5">Số hồ sơ và trạng thái theo từng đợt xét tuyển tuyển sinh</p>
          </div>
          <span className="px-2.5 py-0.5 bg-[#00616D]/10 text-[#00616D] text-xs font-bold rounded-full">
            {admissionRoundBreakdown.length} nhóm
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.08] text-[10px] font-bold text-[#44474E] uppercase tracking-wider">
                <th className="py-2.5 px-3">Tên đợt</th>
                <th className="py-2.5 px-3 text-center">Tổng</th>
                <th className="py-2.5 px-3 text-center">Chờ duyệt</th>
                <th className="py-2.5 px-3 text-center">Đã duyệt</th>
                <th className="py-2.5 px-3 text-center">Từ chối</th>
                <th className="py-2.5 px-3 text-center">Đã hủy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-xs">
              {paginatedRounds.length > 0 ? (
                paginatedRounds.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#1A1C1E]">
                      {item.name}
                      {item.code && <div className="text-[10px] text-[#44474E] font-medium mt-0.5">{item.code}</div>}
                    </td>
                    <td className="py-3 px-3 text-center font-bold">{item.total}</td>
                    <td className="py-3 px-3 text-center"><span className="text-amber-600 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full">{item.pending}</span></td>
                    <td className="py-3 px-3 text-center"><span className="text-green-600 font-bold bg-green-50 px-2.5 py-0.5 rounded-full">{item.approved}</span></td>
                    <td className="py-3 px-3 text-center"><span className="text-rose-600 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full">{item.rejected}</span></td>
                    <td className="py-3 px-3 text-center"><span className="text-purple-600 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full">{item.cancelled}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          current={roundPage}
          total={admissionRoundBreakdown.length}
          pageSize={pageSize}
          onChange={setRoundPage}
        />
      </section>

      
      <section className={`p-6 rounded-lg border shadow-sm ${cardBgClass}`}>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-6 pb-6 border-b border-black/[0.04]">
          <div>
            <h3 className="font-bold text-[#1A1C1E] text-xl m-0">Danh sách hồ sơ gần đây</h3>
            <p className="text-xs text-[#44474E] m-0 mt-0.5">Danh sách các hồ sơ đăng ký ứng tuyển mới nộp gần đây nhất</p>
          </div>

          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#44474E] uppercase font-bold mb-1">Đợt xét tuyển</span>
              <Select
                style={{ width: 180 }}
                value={selectedAdmissionRoundId}
                onChange={setSelectedAdmissionRoundId}
                dropdownStyle={{ borderRadius: 12 }}
              >
                <Option value="all">Tất cả đợt</Option>
                {safeAdmissionRounds.map(round => (
                  <Option key={round.id} value={round.id}>{round.code}</Option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-[#44474E] uppercase font-bold mb-1">Trường đại học</span>
              <Select
                style={{ width: 200 }}
                value={selectedUniversityId}
                onChange={setSelectedUniversityId}
                dropdownStyle={{ borderRadius: 12 }}
              >
                <Option value="all">Tất cả trường</Option>
                {safeUniversities.map(uni => (
                  <Option key={uni.id} value={uni.id}>{uni.name}</Option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-[#44474E] uppercase font-bold mb-1">Ngành đào tạo</span>
              <Select
                style={{ width: 180 }}
                value={selectedMajorId}
                onChange={setSelectedMajorId}
                dropdownStyle={{ borderRadius: 12 }}
                showSearch
                filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}
                disabled={safeMajors.length === 0}
              >
                <Option value="all">Tất cả ngành</Option>
                {safeMajors.map(m => (
                  <Option key={m.id} value={m.id}>{m.name}</Option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-[#44474E] uppercase font-bold mb-1">Tìm kiếm nhanh</span>
              <div className="relative w-48">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                <input
                  className="w-full bg-[#F1F4F5] border-transparent rounded-full py-1.5 pl-8 pr-4 text-slate-800 placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-[#00616D] focus:bg-white transition-all outline-none"
                  placeholder="Nhập tên, mã..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedAdmissionRoundId("all");
                setSelectedUniversityId("all");
                setSelectedMajorId("all");
                setSearchQuery("");
              }}
              className="mt-4 bg-[#F1F4F5] text-slate-700 font-bold px-4 py-2 rounded-full border-0 cursor-pointer hover:bg-slate-200 transition-all flex items-center gap-1.5 text-xs h-[34px]"
            >
              <ReloadOutlined style={{ fontSize: 10 }} />
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.08] text-xs font-bold text-[#44474E] uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Mã hồ sơ</th>
                <th className="py-3 px-4">Thí sinh</th>
                <th className="py-3 px-4">Trường / Ngành</th>
                <th className="py-3 px-4 text-center">Tổng điểm</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4">Ngày nộp</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-xs">
              {latestApplications.length > 0 ? (
                latestApplications.map((app) => {
                  const candidate = getCandidateById(app.candidateId);
                  const university = getUniversityById(app.universityId);
                  const major = getMajorById(app.majorId);
                  const finalScore = app.finalScore ?? (Number(app.totalScore ?? 0) + Number(app.priorityScore ?? 0));

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-[#1A1C1E]">
                        {app.applicationCode}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <img
                            className="w-6 h-6 rounded-full border border-black/[0.08]"
                            alt={candidate?.fullName}
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate?.fullName || 'TS'}`}
                          />
                          {candidate?.fullName || "Không rõ thí sinh"}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium leading-relaxed">
                        <div>{university?.name || "Không rõ trường"}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{major?.name || "Không rõ ngành"}</div>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-[#00616D]">
                        {finalScore !== undefined ? finalScore.toFixed(2) : "-"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <ApplicationStatusTag status={app.status} />
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-medium">
                        {formatDate(app.submittedAt)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/applications/${app.id}`)}
                          className="bg-transparent border-0 text-[#00616D] font-bold text-xs hover:underline cursor-pointer flex items-center gap-0.5 justify-end"
                        >
                          Chi tiết
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center">
                    <EmptyState description="Chưa có hồ sơ nào phù hợp" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
