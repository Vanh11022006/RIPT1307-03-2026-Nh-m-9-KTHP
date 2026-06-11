import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { useCandidateStore } from "../../stores/candidate.store";
import { useApplicationStore } from "../../stores/application.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useAdmissionRoundStore } from "../../stores/admissionRound.store";
import { formatDate } from "../../utils/date";
import type { Application } from "../../types/application.types";

export const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { getCandidateByUserId, getProfile } = useCandidateStore();
  const { getApplicationsByCandidateId } = useApplicationStore();
  const { universities, getUniversities } = useUniversityStore();
  const { majors, getMajors } = useMajorStore();
  const { admissionRounds, getAdmissionRounds } = useAdmissionRoundStore();

  const [applications, setApplications] = useState<Application[]>([]);

  const safeUniversities = Array.isArray(universities) ? universities : [];
  const safeMajors = Array.isArray(majors) ? majors : [];
  const safeAdmissionRounds = Array.isArray(admissionRounds) ? admissionRounds : [];

  const candidate = currentUser ? getCandidateByUserId(currentUser.id) : null;

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      if (!currentUser?.id) {
        if (mounted) setApplications([]);
        return;
      }

      const resolvedCandidate = candidate ?? (await getProfile(currentUser.id));

      if (!resolvedCandidate?.id) {
        if (mounted) setApplications([]);
        return;
      }

      await Promise.all([getUniversities(), getMajors(), getAdmissionRounds()]);
      const data = await getApplicationsByCandidateId(resolvedCandidate.id);

      if (mounted) {
        setApplications(Array.isArray(data) ? data : []);
      }
    };

    loadDashboardData().catch((error) => {
      console.error("Failed to load candidate dashboard data", error);
    });

    return () => {
      mounted = false;
    };
  }, [candidate, currentUser?.id, getAdmissionRounds, getApplicationsByCandidateId, getMajors, getProfile, getUniversities]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === "pending").length,
      approved: applications.filter(a => a.status === "approved").length,
      rejected: applications.filter(a => a.status === "rejected").length,
    };
  }, [applications]);

  const getUniversityName = (id: string) => {
    return safeUniversities.find(u => u.id === id)?.name || "Không rõ trường";
  };

  const getMajorName = (id: string) => {
    return safeMajors.find(m => m.id === id)?.name || "Không rõ ngành";
  };

  const getRoundName = (id?: string) => {
    if (!id) return "Chưa xác định";
    const round = safeAdmissionRounds.find(r => r.id === id);
    return round ? `${round.code}` : "Chưa xác định";
  };

  return (
    <div className="space-y-12 relative">
      
      <div className="glow-bg -top-20 -left-20 pointer-events-none"></div>
      <div className="glow-bg top-1/2 -right-20 opacity-50 pointer-events-none"></div>

      {!candidate && (
        <Alert
          message="Chưa cập nhật thông tin cá nhân"
          description="Vui lòng cập nhật thông tin cá nhân của bạn trong phần Thông tin cá nhân trước khi nộp hồ sơ."
          type="warning"
          showIcon
          style={{ marginBottom: 24, borderRadius: 8 }}
        />
      )}

      
      <section className="relative overflow-hidden rounded-lg p-12 bg-white border border-black/[0.08] shadow-sm">
        <div className="relative z-10 flex flex-col xl:flex-row justify-between xl:items-end gap-6">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1C1E] leading-tight m-0">
              Xin chào, <span className="text-[#00616D]">{currentUser?.fullName || "Thí sinh"}!</span>
            </h2>
            <p className="text-base text-[#44474E] max-w-xl m-0 leading-relaxed">
              Hồ sơ của bạn hiện đạt 85% độ hoàn thiện. Bạn còn {stats.pending} ứng tuyển đang chờ xử lý và 2 hạn chót sắp tới trong tuần này.
            </p>
            <div className="flex flex-wrap gap-4 pt-3">
              <button
                onClick={() => navigate("/candidate/apply")}
                className="bg-[#00616D] text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:shadow-lg active:scale-95 transition-all border-0 cursor-pointer text-sm"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                Nộp hồ sơ ngay
              </button>
              <button
                onClick={() => navigate("/candidate/applications")}
                className="bg-[#F1F4F5] text-[#1A1C1E] font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-black/[0.08] active:scale-95 transition-all border-0 cursor-pointer text-sm"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                Xem hồ sơ của tôi
              </button>
            </div>
          </div>
          <div className="hidden xl:flex items-center gap-2 bg-[#00616D]/5 p-6 rounded-xl border border-[#00616D]/10 shrink-0">
            <div className="w-16 h-16 rounded-full border-4 border-[#00616D] border-t-transparent animate-spin duration-[2000ms]"></div>
            <div>
              <p className="text-[#00616D] font-bold text-2xl m-0">85%</p>
              <p className="text-xs text-[#44474E] uppercase tracking-tighter m-0 font-bold">Hoàn thiện hồ sơ</p>
            </div>
          </div>
        </div>
        
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#00616D]/5 blur-[100px] rounded-full pointer-events-none"></div>
      </section>

      
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-lg flex items-center gap-4 glass-card-hover border border-black/[0.08]">
          <div className="w-12 h-12 rounded-xl bg-[#00616D]/10 flex items-center justify-center text-[#00616D] shrink-0">
            <span className="material-symbols-outlined text-3xl">all_inbox</span>
          </div>
          <div>
            <p className="text-[#44474E] text-xs font-bold uppercase tracking-wider m-0">Tổng hồ sơ</p>
            <p className="text-2xl font-bold text-[#1A1C1E] m-0 mt-1">{String(stats.total).padStart(2, '0')}</p>
          </div>
        </div>

        
        <div className="bg-white p-6 rounded-lg flex items-center gap-4 glass-card-hover border border-black/[0.08] border-b-2 border-b-[#00E3FD]">
          <div className="w-12 h-12 rounded-xl bg-[#00E3FD]/10 flex items-center justify-center text-[#00616D] shrink-0">
            <span className="material-symbols-outlined text-3xl">pending_actions</span>
          </div>
          <div>
            <p className="text-[#44474E] text-xs font-bold uppercase tracking-wider m-0">Đang chờ</p>
            <p className="text-2xl font-bold text-[#1A1C1E] m-0 mt-1">{String(stats.pending).padStart(2, '0')}</p>
          </div>
        </div>

        
        <div className="bg-white p-6 rounded-lg flex items-center gap-4 glass-card-hover border border-black/[0.08] border-b-2 border-b-green-500">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
            <span className="material-symbols-outlined text-3xl">verified</span>
          </div>
          <div>
            <p className="text-[#44474E] text-xs font-bold uppercase tracking-wider m-0">Đã duyệt</p>
            <p className="text-2xl font-bold text-[#1A1C1E] m-0 mt-1">{String(stats.approved).padStart(2, '0')}</p>
          </div>
        </div>

        
        <div className="bg-white p-6 rounded-lg flex items-center gap-4 glass-card-hover border border-black/[0.08] border-b-2 border-b-[#BA1A1A]">
          <div className="w-12 h-12 rounded-xl bg-[#BA1A1A]/10 flex items-center justify-center text-[#BA1A1A] shrink-0">
            <span className="material-symbols-outlined text-3xl">cancel</span>
          </div>
          <div>
            <p className="text-[#44474E] text-xs font-bold uppercase tracking-wider m-0">Từ chối</p>
            <p className="text-2xl font-bold text-[#1A1C1E] m-0 mt-1">{String(stats.rejected).padStart(2, '0')}</p>
          </div>
        </div>
      </section>

      
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        <div className="xl:col-span-4 space-y-6">
          <h3 className="font-bold text-[#1A1C1E] text-xl m-0">Thao tác nhanh</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/candidate/apply")}
              className="w-full bg-white border border-black/[0.08] p-6 rounded-lg flex items-center gap-4 glass-card-hover text-left group cursor-pointer border-0"
            >
              <div className="w-10 h-10 rounded-full bg-[#00616D]/10 flex items-center justify-center text-[#00616D] group-hover:bg-[#00616D] group-hover:text-white transition-all shrink-0">
                <span className="material-symbols-outlined text-lg">add_circle</span>
              </div>
              <div>
                <p className="font-bold text-[#1A1C1E] m-0">Hồ sơ mới</p>
                <p className="text-xs text-[#44474E] m-0 mt-0.5">Tạo hồ sơ ứng tuyển mới</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/candidate/applications")}
              className="w-full bg-white border border-black/[0.08] p-6 rounded-lg flex items-center gap-4 glass-card-hover text-left group cursor-pointer border-0"
            >
              <div className="w-10 h-10 rounded-full bg-[#F1F4F5] flex items-center justify-center text-[#44474E] group-hover:bg-[#00616D] group-hover:text-white transition-all shrink-0">
                <span className="material-symbols-outlined text-lg">folder_shared</span>
              </div>
              <div>
                <p className="font-bold text-[#1A1C1E] m-0">Tài liệu của tôi</p>
                <p className="text-xs text-[#44474E] m-0 mt-0.5">Quản lý các chứng chỉ & học bạ</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/candidate/profile")}
              className="w-full bg-white border border-black/[0.08] p-6 rounded-lg flex items-center gap-4 glass-card-hover text-left group cursor-pointer border-0"
            >
              <div className="w-10 h-10 rounded-full bg-[#F1F4F5] flex items-center justify-center text-[#44474E] group-hover:bg-[#00616D] group-hover:text-white transition-all shrink-0">
                <span className="material-symbols-outlined text-lg">manage_accounts</span>
              </div>
              <div>
                <p className="font-bold text-[#1A1C1E] m-0">Cập nhật hồ sơ</p>
                <p className="text-xs text-[#44474E] m-0 mt-0.5">Cập nhật thông tin cá nhân</p>
              </div>
            </button>
          </div>

          
          <div className="p-6 rounded-lg bg-[#00616D]/5 border border-[#00616D]/10">
            <p className="font-bold text-[#00616D] flex items-center gap-2 m-0 text-sm">
              <span className="material-symbols-outlined text-base">school</span>
              Gợi ý định hướng học tập
            </p>
            <p className="text-sm text-[#44474E] mt-2 leading-relaxed m-0">
              Dựa trên kết quả học tập THPT và chỉ tiêu tuyển sinh, hệ thống khuyến nghị bạn tham khảo thêm các chương trình đào tạo chính quy ngành <span className="text-[#00616D] font-bold">Khoa học máy tính</span>.
            </p>
          </div>
        </div>

        
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between gap-4 pr-10">
            <h3 className="font-bold text-[#1A1C1E] text-xl m-0">Trạng thái hồ sơ gần đây</h3>
            <a
              onClick={() => navigate("/candidate/applications")}
              className="text-[#00616D] text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer whitespace-nowrap shrink-0"
            >
      Xem tất cả
              <span className="material-symbols-outlined text-xs font-bold">arrow_forward</span>
            </a>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {applications.length > 0 ? (
              [...applications]
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .slice(0, 3)
                .map((app) => {
                  const university = safeUniversities.find(u => u.id === app.universityId);
                  const univName = university?.name || getUniversityName(app.universityId);
                  const majorName = getMajorName(app.majorId);
                  const roundName = getRoundName(app.admissionRoundId);

                  // Resolve school logo URL
                  let logoUrl = "";
                  let imageAlt = university?.shortName || university?.name || univName;

                  if (university?.logo && (university.logo.startsWith("http") || university.logo.startsWith("/"))) {
                    logoUrl = university.logo;
                  } else {
                    const nameLower = univName.toLowerCase();
                    if (nameLower.includes("vinuniversity") || nameLower.includes("vinuni")) {
                      logoUrl = "https://upload.wikimedia.org/wikipedia/commons/0/05/Logo_VinUniversity.png";
                    } else if (nameLower.includes("ptit") || nameLower.includes("bưu chính") || nameLower.includes("viễn thông")) {
                      logoUrl = "https://upload.wikimedia.org/wikipedia/commons/e/e8/Logo_PTIT.png";
                    } else if (nameLower.includes("quốc gia") || nameLower.includes("vnu") || nameLower.includes("đhqg")) {
                      logoUrl = "https://upload.wikimedia.org/wikipedia/commons/d/d4/Logo_%C4%90HQG-HCM.png";
                    } else if (nameLower.includes("bách khoa") || nameLower.includes("hust") || nameLower.includes("science and technology")) {
                      logoUrl = "https://upload.wikimedia.org/wikipedia/commons/b/b8/Logo_Hust.png";
                    } else if (nameLower.includes("fpt")) {
                      logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo.svg/320px-FPT_logo.svg.png";
                    }
                  }

                  // Status configurations
                  let statusText = "Đang xử lý";
                  let statusClass = "bg-[#00616D]/5 text-[#00616D]";
                  let progressPercent = 60;
                  let progressBarColor = "bg-[#00616D]";

                  if (app.status === "approved") {
                    statusText = "Đã trúng tuyển";
                    statusClass = "bg-green-100 text-green-700";
                    progressPercent = 100;
                    progressBarColor = "bg-green-500";
                  } else if (app.status === "rejected") {
                    statusText = "Từ chối";
                    statusClass = "bg-rose-100 text-rose-700";
                    progressPercent = 100;
                    progressBarColor = "bg-rose-500";
                  }

                  return (
                    <div
                      key={app.id}
                      onClick={() => navigate(`/candidate/applications/${app.id}`)}
                      className="bg-white border border-black/[0.08] p-4 rounded-lg flex flex-row items-center gap-5 hover:border-[#00E3FD]/50 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,227,253,0.08)] transition-all duration-300 group cursor-pointer"
                    >
                      {logoUrl ? (
                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-black/[0.06] flex items-center justify-center p-2 flex-shrink-0">
                          <img
                            alt={imageAlt}
                            className="w-full h-full object-contain"
                            src={logoUrl}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="material-symbols-outlined text-3xl text-[#00616D]">school</span>`;
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-[#00616D]/5 border border-[#00616D]/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-3xl text-[#00616D]">school</span>
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-center py-1">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="text-xs font-bold text-[#00616D] uppercase tracking-wider m-0">{majorName}</p>
                            <h4 className="font-bold text-lg text-[#1A1C1E] m-0 mt-1">{univName}</h4>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter shrink-0 ${statusClass}`}>
                            {statusText}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#44474E] uppercase font-semibold">Ngày nộp</span>
                            <span className="text-sm font-bold text-[#1A1C1E] mt-0.5">{formatDate(app.submittedAt)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#44474E] uppercase font-semibold">Hệ đào tạo</span>
                            <span className="text-sm font-bold text-[#1A1C1E] mt-0.5">{roundName}</span>
                          </div>
                          <div className="flex-1 min-w-[120px] max-w-[180px]">
                            <div className="flex justify-between text-[10px] text-[#44474E] mb-1 font-semibold uppercase">
                              <span>Tiến độ</span>
                              <span className="text-[#00616D] font-bold">{progressPercent}%</span>
                            </div>
                            <div className="w-full h-1 bg-[#F1F4F5] rounded-full overflow-hidden">
                              <div className={`h-full ${progressBarColor}`} style={{ width: `${progressPercent}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="bg-white border border-black/[0.08] p-8 rounded-lg text-center">
                <span className="material-symbols-outlined text-slate-300 text-4xl">folder_off</span>
                <p className="text-[#44474E] text-sm mt-2 m-0">Bạn chưa có hồ sơ ứng tuyển nào</p>
                <button
                  onClick={() => navigate("/candidate/apply")}
                  className="mt-4 bg-[#00616D] text-white font-bold px-6 py-2 rounded-full border-0 cursor-pointer hover:shadow-md transition-all text-xs"
                >
                  Nộp hồ sơ ngay
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
