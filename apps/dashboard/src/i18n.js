import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      title: "Recruiter Agent — Live Demo",
      kpiTiles: "KPI Tiles",
      funnel: "Funnel",
      opsConsole: "Ops Console",
      controls: "Controls",
      createJob: "Create Job",
      simulateOutreach: "Simulate Outreach",
      runFlow: "Run Flow",
      auditTrail: "Audit Trail (latest 250)",
      hiringSimulator: "Hiring Simulator",
      viewPolicy: "View Policy",
      dark: "Dark",
      modeDemo: "Demo mode",
      modeReal: "Real mode"
    }
  },
  ar: {
    translation: {
      title: "وكيل التوظيف — عرض مباشر",
      kpiTiles: "مؤشرات الأداء",
      funnel: "المسار",
      opsConsole: "لوحة العمليات",
      controls: "التحكم",
      createJob: "إنشاء وظيفة",
      simulateOutreach: "محاكاة التواصل",
      runFlow: "تشغيل التدفق",
      auditTrail: "سجل التدقيق (آخر ٢٥٠)",
      hiringSimulator: "محاكاة التوظيف",
      viewPolicy: "عرض السياسات",
      dark: "داكن",
      modeDemo: "وضع العرض",
      modeReal: "وضع حقيقي"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: import.meta.env.VITE_LOCALE || "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;


