import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Smooth reveal on scroll using IntersectionObserver
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll(".landing-page-root section");
    sections.forEach((section) => {
      section.classList.add("transition-all", "duration-1000", "opacity-0", "translate-y-10");
      observer.observe(section);
    });

    // Mouse move effect for glass panels (subtle hover glow)
    const handleMouseMove = (e: MouseEvent) => {
      const panel = e.currentTarget as HTMLElement;
      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      panel.style.setProperty("--mouse-x", `${x}px`);
      panel.style.setProperty("--mouse-y", `${y}px`);
    };

    const panels = document.querySelectorAll(".landing-page-root .glass-panel");
    panels.forEach((panel) => {
      panel.addEventListener("mousemove", handleMouseMove as EventListener);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
      panels.forEach((panel) => {
        panel.removeEventListener("mousemove", handleMouseMove as EventListener);
      });
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-page-root w-full font-body-md text-on-surface bg-white relative">
      
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] rounded-full bg-white/70 backdrop-blur-xl border border-black/5 shadow-lg z-50 flex justify-between items-center px-8 py-3">
        <div
          onClick={() => navigate("/")}
          className="font-display-md text-2xl md:text-3xl font-bold text-primary tracking-tight cursor-pointer"
        >
          UniAdmission
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <button
            onClick={() => scrollToSection("discovery")}
            className="text-secondary-fixed-dim font-bold border-b-2 border-secondary-fixed-dim pb-1 font-body-md bg-transparent border-0 cursor-pointer"
          >
            Khám phá
          </button>
          <button
            onClick={() => scrollToSection("journey")}
            className="text-on-surface-variant hover:text-secondary transition-colors font-body-md bg-transparent border-0 cursor-pointer"
          >
            Quy trình
          </button>
          <button
            onClick={() => scrollToSection("metrics")}
            className="text-on-surface-variant hover:text-secondary transition-colors font-body-md bg-transparent border-0 cursor-pointer"
          >
            Thành tựu
          </button>
          <button
            onClick={() => scrollToSection("footer")}
            className="text-on-surface-variant hover:text-secondary transition-colors font-body-md bg-transparent border-0 cursor-pointer"
          >
            Kết nối
          </button>
        </div>
        <button
          onClick={() => navigate("/register")}
          className="bg-primary text-white font-bold px-6 py-2 rounded-full hover:scale-105 transition-all active:scale-95 border-0 cursor-pointer"
        >
          Bắt đầu ngay
        </button>
      </nav>

      
      <section className="relative min-h-screen flex items-center justify-center pt-32 overflow-hidden hero-gradient px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-secondary-container/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-tertiary-container/30 blur-[120px] rounded-full"></div>
        </div>
        <div className="max-w-container-max mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10 w-full">
          <div className="text-left space-y-8">
            <h1 className="font-display-lg text-5xl md:text-7xl font-bold leading-tight text-primary">
              Khởi tạo tương lai <br />
              <span className="text-secondary">đại học của bạn.</span>
            </h1>
            <p className="font-body-lg text-lg text-on-surface-variant max-w-lg leading-relaxed">
              Nền tảng tuyển sinh thông minh thế hệ mới, giúp bạn kết nối với những trường đại học hàng đầu Việt Nam và thế giới thông qua sức mạnh AI.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/register")}
                className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:brightness-110 transition-all shadow-lg shadow-primary/10 border-0 cursor-pointer"
              >
                Khám phá ngay
              </button>
              <button
                onClick={() => navigate("/login")}
                className="glass-panel text-on-surface px-8 py-4 rounded-full font-bold text-lg hover:bg-white/40 transition-all cursor-pointer border border-black/5"
              >
                Xem demo
              </button>
            </div>
          </div>

          
          <div className="relative h-[600px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full animate-pulse"></div>

            
            <div className="glass-panel w-80 h-96 rounded-3xl p-6 relative animate-float z-20 border-white/50 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-2xl">hub</span>
                </div>
                <div className="h-2 w-24 bg-black/5 rounded-full"></div>
              </div>
              <div className="space-y-4 flex-1">
                <div className="h-4 w-full bg-black/5 rounded-full"></div>
                <div className="h-4 w-3/4 bg-black/5 rounded-full"></div>
                <div className="pt-4">
                  <div className="text-sm text-secondary font-bold mb-2">Đang phân tích hồ sơ...</div>
                  <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-container w-[75%]"></div>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="absolute top-10 right-0 glass-panel p-4 rounded-2xl w-56 animate-float shadow-xl z-30" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-primary">school</span>
                </div>
                <div className="text-xs font-bold text-primary">HUST Match</div>
              </div>
              <div className="text-xl font-bold text-secondary">98.5%</div>
            </div>

            <div className="absolute bottom-20 left-0 glass-panel p-4 rounded-2xl w-48 animate-float shadow-xl z-30" style={{ animationDelay: "2s" }}>
              <div className="text-xs text-on-surface-variant mb-1">Thời gian phản hồi</div>
              <div className="text-lg font-bold text-primary">~0.8s</div>
            </div>
          </div>
        </div>
      </section>

      
      <section id="metrics" className="py-20 relative px-4 bg-surface-container-low">
        <div className="max-w-container-max mx-auto w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-8 glass-panel rounded-[40px] hover:scale-105 transition-transform border-black/5">
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">100+</div>
              <div className="font-body-md text-on-surface-variant">Trường đại học Việt Nam</div>
            </div>
            <div className="text-center p-8 glass-panel rounded-[40px] hover:scale-105 transition-transform border-black/5">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">98%</div>
              <div className="font-body-md text-on-surface-variant">Tỷ lệ trúng tuyển</div>
            </div>
            <div className="text-center p-8 glass-panel rounded-[40px] hover:scale-105 transition-transform border-black/5">
              <div className="text-4xl md:text-5xl font-bold text-tertiary mb-2">1M+</div>
              <div className="font-body-md text-on-surface-variant">Sinh viên thành công</div>
            </div>
            <div className="text-center p-8 glass-panel rounded-[40px] hover:scale-105 transition-transform border-secondary-container/30 shadow-glow">
              <div className="text-4xl md:text-5xl font-bold text-secondary-container mb-2">10s</div>
              <div className="font-body-md text-on-surface-variant">Xử lý mỗi hồ sơ</div>
            </div>
          </div>
        </div>
      </section>

      
      <section id="discovery" className="py-20 bg-white px-4">
        <div className="max-w-container-max mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-primary">
                Khám phá tiềm năng<br />
                <span className="text-secondary">không giới hạn.</span>
              </h2>
              <p className="text-on-surface-variant text-lg">
                Chúng tôi mang những ngôi trường danh giá nhất Việt Nam đến gần hơn với lộ trình học thuật của bạn.
              </p>
            </div>
            <button
              onClick={() => navigate("/universities")}
              className="text-secondary font-bold flex items-center gap-2 group bg-transparent border-0 cursor-pointer"
            >
              Xem tất cả đối tác
              <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
            </button>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[800px]">
            <div className="md:col-span-8 relative rounded-[48px] overflow-hidden group shadow-2xl h-[400px] md:h-full">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Đại học Bách khoa Hà Nội"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2k09UW_hmA0sjDJIKdPQEKOmhqcaFGqOO9VSF9MUWLqxxH7FkKsuQFewVqwmJIkItBIdiSl3tervv6TzTYQAVsL3uIPNIaDp1x0wzc3VK5YxIw2rLYEZ2Dab0W_YL_dK18PXy-4niBxxcSoGLNzHF0AF2K_dW_2x99iE3MYJViAG0OtyABQ9Ucfd7OKxD2hEIRBOeWTiRKMFoye2b9uDLJ5FRv-MhNEReoKz4z78F-dNHu2kQA-frQs4Aswa2aN-k2W9uPBfK_dZa"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10 text-white">
                <div className="text-sm font-bold uppercase tracking-widest text-secondary-fixed mb-2">KỸ THUẬT &amp; CÔNG NGHỆ</div>
                <div className="text-2xl md:text-4xl font-bold">Đại học Bách khoa Hà Nội</div>
              </div>
            </div>

            <div className="md:col-span-4 grid grid-rows-2 gap-6 h-[400px] md:h-full">
              <div className="relative rounded-[48px] overflow-hidden group shadow-lg">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt="Đại học Quốc gia TP.HCM"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDtnKFraCCF1HFu-reRSw_KPKOL2Mx3g3QB9kJTIOfSRkM12eGngP-SjaJcR88UOWFILQVzQsdX-yr6jdECKBMQ8W6xh1B-Pa3BVmLT1WxKrWATnH2fGNnWBtl5Jv17qVTb0CAfGpLvtn4LEXTspOXyiayiDmghjnqyvng83KC2LLrATRcBbEChzEAkc7lFQ552M-yw7sltuYsDlbN_2H_adjsK5AK1IEog1sH7OQ5uchW5DGUOHOuVjSIm4pz1lec30CNrDHyW1P6"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <div className="text-xl md:text-2xl font-bold">Đại học Quốc gia TP.HCM</div>
                </div>
              </div>

              <div className="relative rounded-[48px] overflow-hidden group shadow-lg">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt="VinUniversity"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-KtqqTLaR_-KAKVJI1Lr8bJdF51fCMeb6Uk99foD3r7Dhf2bEVkXuR6Kjp0l_ajSBqlDWhSd4IipIsg_KIXBQZhENsGYnFY2WZCMir1tI2Db_3p0sTSUQYL7wAHe3P3zZSeMED5FhfUksNxSEOPBJBp4TBbiOx1QFiTaE6To9hqzHxUEH8wfxF0PxGZVWMEc6tnwtOBRcAKx8EYpQP5fX9CwPIGcIEdWSiceGyLD2ze3XECvkCdxyDcNkXwGSzsnpNYpRfFFob8QR"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <div className="text-xl md:text-2xl font-bold">VinUniversity</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section id="journey" className="py-20 px-4 relative overflow-hidden bg-surface-container-low">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/20 to-transparent"></div>
        <div className="max-w-container-max mx-auto w-full">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-primary">Hành trình của bạn</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">Từ khát vọng đến hiện thực chỉ qua 4 bước được tối ưu hóa bằng trí tuệ nhân tạo.</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-black/5 -translate-y-1/2 z-0"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
              
              <div className="group">
                <div className="w-20 h-20 glass-panel rounded-3xl flex items-center justify-center mb-8 mx-auto group-hover:bg-secondary/10 transition-all border-secondary/10 group-hover:border-secondary/50">
                  <span className="material-symbols-outlined text-4xl text-secondary">search</span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-3 text-primary">Tìm kiếm</h3>
                  <p className="text-on-surface-variant text-sm">Khám phá hàng ngàn học bổng và chuyên ngành phù hợp.</p>
                </div>
              </div>

              
              <div className="group">
                <div className="w-20 h-20 glass-panel rounded-3xl flex items-center justify-center mb-8 mx-auto group-hover:bg-primary/5 transition-all border-black/5 group-hover:border-primary/50">
                  <span className="material-symbols-outlined text-4xl text-primary">description</span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-3 text-primary">Ứng tuyển</h3>
                  <p className="text-on-surface-variant text-sm">Quy trình nộp đơn tập trung, tinh gọn chỉ trong vài phút.</p>
                </div>
              </div>

              
              <div className="group">
                <div className="w-20 h-20 glass-panel rounded-3xl flex items-center justify-center mb-8 mx-auto group-hover:bg-tertiary/10 transition-all border-tertiary/10 group-hover:border-tertiary/50">
                  <span className="material-symbols-outlined text-4xl text-tertiary">monitoring</span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-3 text-primary">Theo dõi</h3>
                  <p className="text-on-surface-variant text-sm">Cập nhật trạng thái hồ sơ theo thời gian thực.</p>
                </div>
              </div>

              
              <div className="group">
                <div className="w-20 h-20 glass-panel rounded-3xl flex items-center justify-center mb-8 mx-auto group-hover:bg-secondary/10 transition-all border-secondary/10 group-hover:border-secondary/50">
                  <span className="material-symbols-outlined text-4xl text-secondary">notifications_active</span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-3 text-primary">Nhận thông báo</h3>
                  <p className="text-on-surface-variant text-sm">Chào đón tấm vé bước vào cánh cổng đại học mơ ước.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 px-4 bg-white">
        <div className="max-w-container-max mx-auto grid md:grid-cols-2 gap-24 items-center w-full">
          <div className="order-2 md:order-1">
            <div className="glass-panel p-8 rounded-[48px] border-black/5 relative overflow-hidden group shadow-2xl bg-surface-container-low/50">
              <img
                className="rounded-3xl shadow-xl border border-black/5 w-full"
                alt="Digital Dashboard"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB85rEhO5hlBaplatV36LyiBbx03_rZ6Jr07Q2jbqGDwmebjf6X74cqZ6RNC9NZnvhFIQpVS_cTR0Joj6HQ_0v6XjV0RndG8B4WmDl0FnG-rfPnyFK46PhMgORW3JdVLtLDjhxIBZRDuzmghEIgKKM8lI8sOXlAB7ZlNpbhkgFrwJEwit7WxGm_ROhDBc8_t0nDar4bqQx8ln3XCCkGLiVrVnSK--1Ek2F0EbVAWnI439Q4CMdXCYahY0zhOmVdhUMHVoC0_K_Ghe1F"
              />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 blur-3xl"></div>
            </div>
          </div>

          <div className="order-1 md:order-2 space-y-12">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-bold text-xs uppercase tracking-widest">
                Tính năng ưu việt
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-primary">
                Nền tảng quản lý<br />
                <span className="text-secondary">toàn diện.</span>
              </h2>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-2xl">psychology</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-primary">Trí tuệ nhân tạo tư vấn lộ trình</h4>
                  <p className="text-on-surface-variant leading-relaxed">
                    AI phân tích điểm mạnh và sở thích để gợi ý những ngôi trường và học bổng có tỷ lệ trúng tuyển cao nhất.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">inventory_2</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-primary">Quản lý nguyện vọng tập trung</h4>
                  <p className="text-on-surface-variant leading-relaxed">
                    Không còn lo lắng về hàng tá tài khoản khác nhau. Mọi hồ sơ đều nằm trên một bảng điều khiển duy nhất.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-2xl">bolt</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-primary">Thông báo thời gian thực</h4>
                  <p className="text-on-surface-variant leading-relaxed">
                    Nhận cập nhật tức thì về hạn chót, yêu cầu bổ sung và kết quả trúng tuyển qua thiết bị di động.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 px-4 overflow-hidden bg-surface-container-low">
        <div className="max-w-container-max mx-auto w-full">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-24 text-primary">Câu chuyện thành công</h2>
          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="glass-panel p-10 rounded-[48px] border-black/5 flex flex-col justify-between h-full hover:border-secondary/30 transition-all bg-white">
              <div className="mb-12">
                <div className="text-secondary mb-6">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                </div>
                <p className="text-lg leading-relaxed text-on-surface italic">
                  "Nhờ UniAdmission, mình đã tìm thấy lộ trình hoàn hảo để bước chân vào Đại học Bách Khoa Hà Nội. Hệ thống gợi ý vô cùng chính xác."
                </p>
              </div>
              <div className="flex items-center gap-4">
                <img
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/10"
                  alt="Minh Hoàng"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQlHvmIqPHYeklx8cYWPbNlJi4E-rbeKvuRB7tRkoHXq6enux0qEL1Lfp4tWaran1ndPzluOe2FuhNAx32D_ijVLi4XWI8cSg7_ehAhTQMCzFHHA07vCK2QPOAN7EuuQ5zgsCYWsz614rc40CRzxqLaLjP1xc9CKylNf2Xwo6nYGWa0fAlUHP85-YEefg3OtfkZKRr4KuS73hj13xoCmTzXOIEdJM_AlpPtXNW33uAHkLBYGySI1u0qGNnVeOECraGliNkpLW6E3YJ"
                />
                <div>
                  <div className="font-bold text-primary text-base">Minh Hoàng</div>
                  <div className="text-xs text-on-surface-variant">Sinh viên K68 ĐH Bách Khoa HN</div>
                </div>
              </div>
            </div>

            
            <div className="glass-panel p-10 rounded-[48px] border-secondary/10 flex flex-col justify-between h-full bg-secondary/5">
              <div className="mb-12">
                <div className="text-secondary mb-6">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                </div>
                <p className="text-lg leading-relaxed text-on-surface italic">
                  "Quy trình nộp đơn tối ưu giúp mình tiết kiệm rất nhiều thời gian khi ứng tuyển vào VinUniversity. Cảm ơn UniAdmission rất nhiều!"
                </p>
              </div>
              <div className="flex items-center gap-4">
                <img
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/10"
                  alt="Linh Chi"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAg-rNik_K6ccO8McBX_R2_xOO3VVr_j9aw5o3ruO1TBAEn3_PJOtLJEiTw3iWMuMuBMUBMRebNq50e9SIIyDX8cIZ46-sjnUhbMm1A8bPXEPoYLJh9L0EEsSdehYv-4hiKukCLYCBfrg0_GzJF2T4CrTVVmyrRo61XWCNu3pJcjer9zQ_me6RTjzI-pnS3e7EH97OfyqS8hxN8sqxVMUBKdVWpVrWms0RXFjl43Vy5-M6QMksj4ZXh1mYZ7yvgj1b2gQZ5TP9_WdkP"
                />
                <div>
                  <div className="font-bold text-primary text-base">Linh Chi</div>
                  <div className="text-xs text-on-surface-variant">Sinh viên Học bổng VinUniversity</div>
                </div>
              </div>
            </div>

            
            <div className="glass-panel p-10 rounded-[48px] border-black/5 flex flex-col justify-between h-full hover:border-tertiary/30 transition-all bg-white">
              <div className="mb-12">
                <div className="text-tertiary mb-6">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                </div>
                <p className="text-lg leading-relaxed text-on-surface italic">
                  "Hệ thống nhắc nhở thông minh đã giúp mình không bỏ lỡ bất kỳ thời hạn quan trọng nào của Đại học Quốc gia. Một trợ thủ đắc lực!"
                </p>
              </div>
              <div className="flex items-center gap-4">
                <img
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/10"
                  alt="Tuấn Anh"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWWg8q4Qnmts6o2wod8Vb6eo3onnz-Q-2_F1ju1699BUmAfrnM4WagREmG-WP7T9-N6WyVF0Cr7mJMXjzLdsp6orJv4TN77dK9YU48KhNbSUkceJWrJ5VxjqzfNGQZClr817gqGiAD8pyydTd5UpTCJ13pvB4bzYkkEJHuQcgDVYG3aTBPKtUqj3avkJe0v6Tz1Y1Em8rm8G9ESEIq_wGhLWqE_w2Q7zmMkdsSP5D_sp86v1OI9WofnbYcmSQCOXVh6q12in-uS9Ib"
                />
                <div>
                  <div className="font-bold text-primary text-base">Tuấn Anh</div>
                  <div className="text-xs text-on-surface-variant">Sinh viên ĐHQG TP.HCM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-32 px-4 relative bg-white">
        <div className="max-w-4xl mx-auto glass-panel rounded-[64px] p-16 text-center border-black/5 relative overflow-hidden bg-surface-container-low/80 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-tertiary/5"></div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight text-primary">
              Tương lai của bạn<br />bắt đầu từ hôm nay.
            </h2>
            <p className="text-on-surface-variant text-xl max-w-xl mx-auto">
              Gia nhập cộng đồng 1M+ sinh viên và bắt đầu hành trình chinh phục ước mơ ngay bây giờ.
            </p>
            <div className="pt-8">
              <button
                onClick={() => navigate("/register")}
                className="bg-primary text-white font-bold px-12 py-6 rounded-full text-xl md:text-2xl hover:scale-105 transition-all shadow-xl active:scale-95 border-0 cursor-pointer"
              >
                Bắt đầu hành trình ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      
      <footer id="footer" className="w-full rounded-t-[48px] bg-white border-t border-black/5 shadow-2xl">
        <div className="max-w-container-max mx-auto px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <div className="text-2xl md:text-3xl font-bold text-primary">UniAdmission</div>
            <p className="text-on-surface-variant font-body-md max-w-xs leading-relaxed">
              Nâng tầm giáo dục thông qua công nghệ số và trí tuệ nhân tạo.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-body-md text-on-surface-variant">
            <a className="hover:text-secondary transition-colors" href="#">Chính sách bảo mật</a>
            <a className="hover:text-secondary transition-colors" href="#">Điều khoản sử dụng</a>
            <a className="hover:text-secondary transition-colors" href="#">Liên hệ hợp tác</a>
          </div>
          <div className="text-on-surface-variant font-body-md text-center">
            © 2026 UniAdmission. Tương lai giáo dục số.
          </div>
        </div>
      </footer>

      
      <button
        onClick={() => navigate("/register")}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-90 z-40 border-0 cursor-pointer"
      >
        <span className="material-symbols-outlined text-3xl">chat</span>
      </button>
    </div>
  );
};
