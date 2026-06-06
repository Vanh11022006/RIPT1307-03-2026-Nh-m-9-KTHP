import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("discovery");
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | "cooperation" | null>(null);

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

    // Scroll spy logic
    const handleScroll = () => {
      const sectionIds = ["discovery", "journey", "metrics", "footer"];
      let currentSection = "discovery";
      let minDistance = Infinity;

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const distance = Math.abs(rect.top - 150);
          if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= 100) {
            if (distance < minDistance) {
              minDistance = distance;
              currentSection = id;
            }
          }
        }
      });

      // Special case: bottom of the page triggers footer active state
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
        currentSection = "footer";
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once initially

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
      panels.forEach((panel) => {
        panel.removeEventListener("mousemove", handleMouseMove as EventListener);
      });
      window.removeEventListener("scroll", handleScroll);
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
        <div className="hidden md:flex gap-12 items-center">
          <button
            onClick={() => scrollToSection("discovery")}
            className={`bg-transparent border-0 cursor-pointer text-lg tracking-wider transition-all duration-300 ${activeSection === "discovery"
              ? "text-secondary-fixed-dim font-bold border-b-2 border-secondary-fixed-dim pb-1"
              : "text-on-surface-variant hover:text-secondary font-medium pb-1 border-b-2 border-transparent"
              }`}
          >
            Khám phá
          </button>
          <button
            onClick={() => scrollToSection("metrics")}
            className={`bg-transparent border-0 cursor-pointer text-lg tracking-wider transition-all duration-300 ${activeSection === "metrics"
              ? "text-secondary-fixed-dim font-bold border-b-2 border-secondary-fixed-dim pb-1"
              : "text-on-surface-variant hover:text-secondary font-medium pb-1 border-b-2 border-transparent"
              }`}
          >
            Thành tựu
          </button>
          <button
            onClick={() => scrollToSection("journey")}
            className={`bg-transparent border-0 cursor-pointer text-lg tracking-wider transition-all duration-300 ${activeSection === "journey"
              ? "text-secondary-fixed-dim font-bold border-b-2 border-secondary-fixed-dim pb-1"
              : "text-on-surface-variant hover:text-secondary font-medium pb-1 border-b-2 border-transparent"
              }`}
          >
            Quy trình
          </button>
          <button
            onClick={() => scrollToSection("footer")}
            className={`bg-transparent border-0 cursor-pointer text-lg tracking-wider transition-all duration-300 ${activeSection === "footer"
              ? "text-secondary-fixed-dim font-bold border-b-2 border-secondary-fixed-dim pb-1"
              : "text-on-surface-variant hover:text-secondary font-medium pb-1 border-b-2 border-transparent"
              }`}
          >
            Kết nối
          </button>
        </div>
        <button
          onClick={() => navigate("/register")}
          className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:scale-105 transition-all active:scale-95 border-0 cursor-pointer text-lg"
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
              Cổng thông tin tuyển sinh trực tuyến chính thức của Bộ Giáo dục và Đào tạo, giúp kết nối học sinh với các trường Đại học và Cao đẳng trên toàn quốc.
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
                <div className="text-xs font-bold text-primary">PTIT Match</div>
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
              <h2
                className="text-3xl md:text-5xl font-bold text-primary"
                style={{ marginBottom: '28px', lineHeight: '1.45' }}
              >
                Khám phá tiềm năng<br />
                <span className="text-secondary">không giới hạn.</span>
              </h2>
              <p
                className="text-on-surface-variant text-lg"
                style={{ lineHeight: '1.75' }}
              >
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
                  style={{ aspectRatio: "1.5", objectFit: "cover" }}
                  alt="Học viện Công nghệ Bưu chính Viễn thông"
                  src="https://ptit.edu.vn/wp-content/uploads/old/2022/03/2-768x1024.jpg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <div className="text-xl md:text-2xl font-bold">Học viện Bưu chính Viễn thông (PTIT)</div>
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
            <h2
              className="text-3xl md:text-5xl font-bold text-primary"
              style={{ marginBottom: '16px' }}
            >
              Hành trình của bạn
            </h2>
            <p
              className="text-on-surface-variant max-w-xl"
              style={{ margin: '0 auto', lineHeight: '1.75' }}
            >
              Quy trình đăng ký tuyển sinh và định hướng học tập trực tuyến theo quy định của Bộ Giáo dục và Đào tạo.
            </p>
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
              <h2
                className="text-3xl md:text-5xl font-bold text-primary"
                style={{ lineHeight: '1.45' }}
              >
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
                  <h4
                    className="text-xl font-bold text-primary"
                    style={{ marginBottom: '8px' }}
                  >
                    Tư vấn lộ trình & Định hướng nghề nghiệp
                  </h4>
                  <p
                    className="text-on-surface-variant"
                    style={{ lineHeight: '1.75' }}
                  >
                    Hệ thống tích hợp dữ liệu ngành nghề và chỉ tiêu tuyển sinh chính thức giúp định hướng lộ trình học tập tối ưu cho từng học sinh.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">inventory_2</span>
                </div>
                <div>
                  <h4
                    className="text-xl font-bold text-primary"
                    style={{ marginBottom: '8px' }}
                  >
                    Quản lý nguyện vọng tập trung
                  </h4>
                  <p
                    className="text-on-surface-variant"
                    style={{ lineHeight: '1.75' }}
                  >
                    Không còn lo lắng về hàng tá tài khoản khác nhau. Mọi hồ sơ đều nằm trên một bảng điều khiển duy nhất.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-2xl">bolt</span>
                </div>
                <div>
                  <h4
                    className="text-xl font-bold text-primary"
                    style={{ marginBottom: '8px' }}
                  >
                    Thông báo thời gian thực
                  </h4>
                  <p
                    className="text-on-surface-variant"
                    style={{ lineHeight: '1.75' }}
                  >
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
          <h2
            className="text-3xl md:text-5xl font-bold text-center text-primary"
            style={{ marginBottom: '48px' }}
          >
            Câu chuyện thành công
          </h2>
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
                  "Quy trình nộp đơn tối ưu giúp mình tiết kiệm rất nhiều thời gian khi ứng tuyển vào Học viện Công nghệ Bưu chính Viễn thông. Cảm ơn cổng thông tin tuyển sinh rất nhiều!"
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
                  <div className="text-xs text-on-surface-variant">Sinh viên Học bổng PTIT</div>
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
              Phát triển giáo dục thông qua công nghệ số và chuyển đổi số quốc gia.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-body-md text-on-surface-variant">
            <button onClick={() => setActiveModal("privacy")} className="bg-transparent border-0 hover:text-secondary transition-colors cursor-pointer text-on-surface-variant font-body-md text-base">Chính sách bảo mật</button>
            <button onClick={() => setActiveModal("terms")} className="bg-transparent border-0 hover:text-secondary transition-colors cursor-pointer text-on-surface-variant font-body-md text-base">Điều khoản sử dụng</button>
            <button onClick={() => setActiveModal("cooperation")} className="bg-transparent border-0 hover:text-secondary transition-colors cursor-pointer text-on-surface-variant font-body-md text-base">Liên hệ hợp tác</button>
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

      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-[32px] max-w-2xl w-full border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] relative overflow-hidden animate-scaleUp">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors border-0 cursor-pointer flex items-center justify-center z-10"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            <div className="max-h-[85vh] overflow-y-auto p-8 md:p-10">

            {activeModal === "privacy" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#00616d]/10 text-[#00616d] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">security</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#00616d]">Chính sách bảo mật</h3>
                </div>
                <div className="h-px bg-slate-100"></div>
                <div className="space-y-4 text-on-surface-variant leading-relaxed text-sm md:text-base">
                  <p className="font-semibold text-slate-800">Cổng thông tin tuyển sinh UniAdmission cam kết bảo vệ tuyệt đối thông tin cá nhân của thí sinh và người dùng hệ thống.</p>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800">1. Thu thập thông tin</h4>
                    <p>Hệ thống chỉ thu thập các thông tin cần thiết phục vụ cho quá trình đăng ký xét tuyển bao gồm: Họ tên, Số điện thoại, Email, Thông tin học bạ, các chứng chỉ học thuật liên quan và nguyện vọng xét tuyển.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800">2. Sử dụng thông tin</h4>
                    <p>Dữ liệu của thí sinh chỉ được sử dụng cho mục đích: xử lý hồ sơ xét tuyển nguyện vọng, gửi thông báo cập nhật trạng thái hồ sơ, thông báo kết quả trúng tuyển từ các Trường Đại học và Cao đẳng liên kết.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800">3. Chia sẻ thông tin</h4>
                    <p>Thông tin hồ sơ học tập chỉ được chia sẻ trực tiếp với các Trường Đại học mà thí sinh đăng ký nguyện vọng. Hệ thống cam kết không chia sẻ dữ liệu cho bất kỳ bên thứ ba nào vì mục đích thương mại.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800">4. Bảo mật dữ liệu</h4>
                    <p>Mọi dữ liệu truyền tải trên hệ thống đều được mã hóa bằng chuẩn SSL/TLS. Hệ thống máy chủ được bảo mật đa tầng, sao lưu tự động định kỳ nhằm chống thất thoát dữ liệu và các hành vi truy cập trái phép.</p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === "terms" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#00616d]/10 text-[#00616d] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">gavel</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#00616d]">Điều khoản sử dụng</h3>
                </div>
                <div className="h-px bg-slate-100"></div>
                <div className="space-y-4 text-on-surface-variant leading-relaxed text-sm md:text-base">
                  <p className="font-semibold text-slate-800">Khi sử dụng hệ thống UniAdmission, bạn đồng ý tuân thủ các điều khoản và quy định sử dụng dịch vụ sau đây:</p>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800">1. Đăng ký tài khoản</h4>
                    <p>Thí sinh có trách nhiệm cung cấp thông tin tài khoản và thông tin cá nhân một cách trung thực, chính xác và tự chịu trách nhiệm bảo mật thông tin tài khoản đăng nhập của mình.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800">2. Tính trung thực của thông tin hồ sơ</h4>
                    <p>Hồ sơ học tập, điểm số học bạ và các chứng chỉ đính kèm phải trùng khớp với hồ sơ giấy gốc. Mọi hành vi làm giả thông tin hoặc cố ý nhập sai lệch dữ liệu sẽ bị hủy kết quả xét tuyển và xử lý kỷ luật theo quy chế của Bộ Giáo dục và Đào tạo.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800">3. Quyền hạn và Trách nhiệm hệ thống</h4>
                    <p>UniAdmission cung cấp dịch vụ mô phỏng và hỗ trợ thí sinh nộp hồ sơ xét tuyển. Chúng tôi có quyền tạm khóa tài khoản nếu phát hiện bất kỳ hành vi xâm nhập, phá hoại hoặc gian lận hệ thống.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800">4. Bản quyền sở hữu trí tuệ</h4>
                    <p>Toàn bộ tài nguyên, giao diện, mã nguồn và dữ liệu hiển thị trên cổng thông tin thuộc quyền sở hữu trí tuệ của dự án UniAdmission. Nghiêm cấm mọi hành vi sao chép, phân phối hoặc khai thác thương mại không được sự đồng ý bằng văn bản.</p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === "cooperation" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#00616d]/10 text-[#00616d] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">handshake</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#00616d]">Liên hệ hợp tác</h3>
                </div>
                <div className="h-px bg-slate-100"></div>
                <div className="space-y-4 text-on-surface-variant leading-relaxed text-sm md:text-base">
                  <p className="font-semibold text-slate-800">UniAdmission tự hào là cầu nối tin cậy giữa hàng ngàn thí sinh và các trường Đại học, Cao đẳng trên toàn lãnh thổ Việt Nam.</p>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800">1. Đối với các Trường Đại học & Cao đẳng</h4>
                    <p>Chúng tôi cung cấp giải pháp chuyển đổi số tuyển sinh toàn diện: Tích hợp cổng đăng ký xét tuyển riêng, phân tích nguồn thí sinh tiềm năng, xử lý hồ sơ tự động hóa và quản lý chỉ tiêu tuyển sinh thời gian thực.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800">2. Đối với các đối tác giáo dục & Doanh nghiệp</h4>
                    <p>Hợp tác định hướng nghề nghiệp, tài trợ học bổng học tập, tích hợp công cụ khảo sát xu hướng nghề nghiệp cho học sinh THPT.</p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h4 className="font-bold text-[#00616d] text-lg">Thông tin liên hệ Ban điều hành:</h4>
                    <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl">
                      <a 
                        href="mailto:hethongxettuyen.uniadmission@gmail.com" 
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 transition-all group cursor-pointer text-inherit"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-xl">mail</span>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 font-medium">Email đối tác</div>
                          <div className="text-sm font-semibold text-slate-850 group-hover:text-primary transition-colors">hethongxettuyen.uniadmission@gmail.com</div>
                        </div>
                      </a>

                      <a 
                        href="tel:094408601" 
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 transition-all group cursor-pointer text-inherit"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-xl">phone_in_talk</span>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 font-medium">Đường dây nóng</div>
                          <div className="text-sm font-semibold text-slate-850 group-hover:text-primary transition-colors">094408601</div>
                        </div>
                      </a>

                      <a 
                        href="https://www.google.com/maps/search/?api=1&query=Khu+Công+nghệ+cao+Hòa+Lạc,+Thạch+Thất,+Hà+Nội" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 transition-all group cursor-pointer text-inherit"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-xl">location_on</span>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 font-medium">Trụ sở Ban dự án</div>
                          <div className="text-sm font-semibold text-slate-850 group-hover:text-primary transition-colors">Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội</div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:scale-105 active:scale-95 transition-all border-0 cursor-pointer text-base"
              >
                Đồng ý & Đóng
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
