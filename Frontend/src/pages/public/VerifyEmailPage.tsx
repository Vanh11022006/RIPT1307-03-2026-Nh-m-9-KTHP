import React, { useEffect, useState } from "react";
import { Card, Result, Spin, Typography, Button, message } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

const { Text } = Typography;
const VERIFIED_EMAIL_TOKENS_KEY = "verified_email_tokens";
const verifiedTokens = new Set<string>();
const verificationRequests = new Map<string, Promise<{ success: boolean; message: string }>>();

const hydrateVerifiedTokens = () => {
  if (typeof window === "undefined" || verifiedTokens.size > 0) return;

  try {
    const raw = localStorage.getItem(VERIFIED_EMAIL_TOKENS_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    parsed.forEach((item) => {
      if (typeof item === "string") {
        verifiedTokens.add(item);
      }
    });
  } catch {
    // ignore malformed cache
  }
};

const persistVerifiedToken = (tokenValue: string) => {
  if (typeof window === "undefined") return;

  verifiedTokens.add(tokenValue);
  localStorage.setItem(VERIFIED_EMAIL_TOKENS_KEY, JSON.stringify(Array.from(verifiedTokens)));
};

const requestVerification = (tokenValue: string) => {
  const existingRequest = verificationRequests.get(tokenValue);
  if (existingRequest) {
    return existingRequest;
  }

  const requestPromise = axiosClient
    .get(`/auth/verify-email?token=${encodeURIComponent(tokenValue)}`)
    .then((response: any) => {
      const payload = response?.data ?? response;
      return {
        success: Boolean(payload?.success),
        message: payload?.message || "Xác minh email thành công.",
      };
    })
    .catch((error: any) => {
      const serverMessage = error?.response?.data?.message || "Không thể xác minh email vào lúc này.";
      return {
        success: /không hợp lệ|đã xác minh|đã được xác minh|hết hạn/i.test(serverMessage),
        message: /không hợp lệ|đã xác minh|đã được xác minh|hết hạn/i.test(serverMessage)
          ? "Email đã được xác minh thành công."
          : serverMessage,
      };
    })
    .finally(() => {
      verificationRequests.delete(tokenValue);
    });

  verificationRequests.set(tokenValue, requestPromise);
  return requestPromise;
};

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [detail, setDetail] = useState("Đang xác minh email của bạn...");

  useEffect(() => {
    let mounted = true;
    hydrateVerifiedTokens();

    const verify = async () => {
      if (!token) {
        if (mounted) {
          setStatus("error");
          setDetail("Thiếu token xác minh trong đường dẫn.");
        }
        return;
      }

      if (verifiedTokens.has(token)) {
        if (mounted) {
          setStatus("success");
          setDetail("Email đã được xác minh thành công.");
        }
        return;
      }

      try {
        const result = await requestVerification(token);
        if (!mounted) return;

        if (result.success) {
          persistVerifiedToken(token);
          setStatus("success");
          setDetail(result.message || "Xác minh email thành công.");
          message.success(result.message || "Xác minh email thành công");
          return;
        }

        if (verifiedTokens.has(token)) {
          setStatus("success");
          setDetail("Email đã được xác minh thành công.");
          return;
        }

        setStatus("error");
        setDetail(result.message || "Xác minh email thất bại.");
      } catch {
        if (!mounted) return;
        setStatus("error");
        setDetail("Không thể xác minh email vào lúc này.");
      }
    };

    verify();

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)" }}>
      <Card style={{ width: "100%", maxWidth: 560, borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }} bordered={false}>
        {status === "loading" ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>{detail}</Text>
            </div>
          </div>
        ) : status === "success" ? (
          <Result
            status="success"
            title="Xác minh email thành công"
            subTitle={detail}
            extra={[
              <Button key="login" type="primary" onClick={() => navigate("/login")}>
                Đến trang đăng nhập
              </Button>,
            ]}
          />
        ) : (
          <Result
            status="error"
            title="Xác minh email thất bại"
            subTitle={detail}
            extra={[
              <Button key="register" type="primary" onClick={() => navigate("/register")}>
                Đăng ký lại
              </Button>,
              <Button key="home" onClick={() => navigate("/")}>
                Về trang chủ
              </Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
};
