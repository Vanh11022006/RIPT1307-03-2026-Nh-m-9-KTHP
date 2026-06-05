/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-fixed": "#1D1D1F",
        "secondary-container": "#00E3FD",
        "on-error-container": "#ffdad6",
        "surface-container": "#F5F5F7",
        "on-tertiary-fixed-variant": "#6b00af",
        "surface-container-low": "#FBFBFB",
        "on-secondary": "#FFFFFF",
        "on-secondary-fixed": "#001f24",
        "surface-variant": "#E8E8ED",
        "surface-container-high": "#EBEBEB",
        "surface-bright": "#FFFFFF",
        "inverse-surface": "#121414",
        "surface-dim": "#F5F5F7",
        "secondary-fixed-dim": "#00616d",
        "tertiary-fixed": "#f2daff",
        "secondary": "#00A3B5",
        "primary-container": "#F5F5F7",
        "on-secondary-container": "#004f58",
        "tertiary": "#6b00af",
        "outline": "#86868B",
        "inverse-primary": "#4e616a",
        "tertiary-container": "#F2DAFF",
        "surface-container-lowest": "#FFFFFF",
        "on-primary": "#FFFFFF",
        "on-surface-variant": "#424245",
        "on-tertiary-container": "#2e004e",
        "on-primary-fixed": "#1D1D1F",
        "background": "#FFFFFF",
        "on-background": "#1D1D1F",
        "primary": "#1D1D1F",
        "on-tertiary": "#FFFFFF",
        "tertiary-fixed-dim": "#6b00af",
        "surface": "#FFFFFF",
        "error": "#BA1A1A",
        "surface-container-highest": "#D2D2D7",
        "on-primary-fixed-variant": "#424245",
        "inverse-on-surface": "#F5F5F7",
        "outline-variant": "#D2D2D7",
        "on-primary-container": "#1D1D1F",
        "on-error": "#FFFFFF",
        "on-surface": "#1D1D1F",
        "error-container": "#FFDAD6",
        "on-tertiary-fixed": "#2e004e",
        "on-secondary-fixed-variant": "#004f58",
        "surface-tint": "#1D1D1F",
        "primary-fixed-dim": "#424245",
        "secondary-fixed": "#00E3FD"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      spacing: {
        "xs": "4px",
        "lg": "48px",
        "sm": "12px",
        "container-max": "1440px",
        "gutter": "24px",
        "base": "8px",
        "md": "24px",
        "xl": "80px"
      },
      fontFamily: {
        "headline-lg": ["Plus Jakarta Sans"],
        "label-sm": ["Inter"],
        "body-md": ["Inter"],
        "display-lg": ["Plus Jakarta Sans"],
        "display-md": ["Plus Jakarta Sans"],
        "body-lg": ["Inter"]
      },
      fontSize: {
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "0.01em", fontWeight: "600" }],
        "display-lg": ["72px", { lineHeight: "80px", letterSpacing: "0.02em", fontWeight: "700" }],
        "display-md": ["48px", { lineHeight: "56px", letterSpacing: "0.01em", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }]
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Tắt preflight để tránh xung đột với Ant Design hiện tại
  }
}
