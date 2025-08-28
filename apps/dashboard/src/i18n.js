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
      modeReal: "Real mode",
      errorCreateJob: "Failed to create job",
      outreachSeeded: "Outreach seeded",
      outreachFailed: "Outreach failed",
      flowExecuted: "Flow executed",
      flowFailed: "Flow failed"
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
      modeReal: "وضع حقيقي",
      errorCreateJob: "فشل إنشاء الوظيفة",
      outreachSeeded: "تمت محاكاة التواصل",
      outreachFailed: "فشلت المحاكاة",
      flowExecuted: "تم تشغيل التدفق",
      flowFailed: "فشل تشغيل التدفق"
    }
  },
  es: {
    translation: {
      title: "Agente Reclutador — Demostración",
      kpiTiles: "Indicadores KPI",
      funnel: "Embudo",
      opsConsole: "Consola de Operaciones",
      controls: "Controles",
      createJob: "Crear Puesto",
      simulateOutreach: "Simular Contacto",
      runFlow: "Ejecutar Flujo",
      auditTrail: "Bitácora (últimos 250)",
      hiringSimulator: "Simulador de Contratación",
      viewPolicy: "Ver Políticas",
      dark: "Oscuro",
      modeDemo: "Modo demo",
      modeReal: "Modo real",
      errorCreateJob: "Error al crear el puesto",
      outreachSeeded: "Contacto simulado",
      outreachFailed: "Error en la simulación",
      flowExecuted: "Flujo ejecutado",
      flowFailed: "Error al ejecutar el flujo"
    }
  },
  zh: {
    translation: {
      title: "招聘代理 — 实时演示",
      kpiTiles: "关键指标",
      funnel: "转化漏斗",
      opsConsole: "运维控制台",
      controls: "控制",
      createJob: "创建职位",
      simulateOutreach: "模拟外联",
      runFlow: "运行流程",
      auditTrail: "审计日志（最近250条）",
      hiringSimulator: "招聘模拟器",
      viewPolicy: "查看策略",
      dark: "深色",
      modeDemo: "演示模式",
      modeReal: "真实模式",
      errorCreateJob: "创建职位失败",
      outreachSeeded: "已模拟外联",
      outreachFailed: "外联失败",
      flowExecuted: "流程已执行",
      flowFailed: "流程执行失败"
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


