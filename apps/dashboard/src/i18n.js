import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      title: "Recruiter Agent",
      kpiTiles: "Key metrics",
      funnel: "Funnel",
      opsConsole: "Ops Console",
      controls: "Controls",
      outreachTab: "Outreach",
      qualificationTab: "Qualification & Scheduling",
      auditTab: "Audit & Planning",
      createJob: "Create Job",
      simulateOutreach: "Start Outreach",
      runFlow: "Run Automation",
      auditTrail: "Audit Trail (latest 250)",
      hiringSimulator: "Capacity Planner",
      viewPolicy: "View Policy",
      dark: "Dark",
      systemOk: "System OK",
      errorCreateJob: "Failed to create job",
      outreachSeeded: "Outreach started",
      outreachFailed: "Outreach failed",
      flowExecuted: "Automation executed",
      flowFailed: "Automation failed",
      noActivity: "No recent activity yet. Start outreach and automation to populate."
    }
  },
  ar: {
    translation: {
      title: "وكيل التوظيف",
      kpiTiles: "المؤشرات الرئيسية",
      funnel: "المسار",
      opsConsole: "لوحة العمليات",
      controls: "التحكم",
      outreachTab: "التواصل",
      qualificationTab: "التأهيل والجدولة",
      auditTab: "التدقيق والتخطيط",
      createJob: "إنشاء وظيفة",
      simulateOutreach: "بدء التواصل",
      runFlow: "تشغيل الأتمتة",
      auditTrail: "سجل التدقيق (آخر ٢٥٠)",
      hiringSimulator: "مُخطِّط السعة",
      viewPolicy: "عرض السياسات",
      dark: "داكن",
      systemOk: "النظام يعمل",
      errorCreateJob: "فشل إنشاء الوظيفة",
      outreachSeeded: "تم بدء التواصل",
      outreachFailed: "فشل التواصل",
      flowExecuted: "تم تنفيذ الأتمتة",
      flowFailed: "فشل الأتمتة",
      noActivity: "لا توجد أنشطة حديثة بعد. ابدأ التواصل والأتمتة لعرض البيانات."
    }
  },
  es: {
    translation: {
      title: "Agente Reclutador",
      kpiTiles: "Indicadores clave",
      funnel: "Embudo",
      opsConsole: "Consola de Operaciones",
      controls: "Controles",
      outreachTab: "Contacto",
      qualificationTab: "Calificación y Agenda",
      auditTab: "Auditoría y Planificación",
      createJob: "Crear Puesto",
      simulateOutreach: "Iniciar Contacto",
      runFlow: "Ejecutar Automatización",
      auditTrail: "Bitácora (últimos 250)",
      hiringSimulator: "Planificador de Capacidad",
      viewPolicy: "Ver Políticas",
      dark: "Oscuro",
      systemOk: "Sistema OK",
      errorCreateJob: "Error al crear el puesto",
      outreachSeeded: "Contacto iniciado",
      outreachFailed: "Error en el contacto",
      flowExecuted: "Automatización ejecutada",
      flowFailed: "Error en la automatización",
      noActivity: "Sin actividad reciente. Inicia contacto y automatización para ver datos."
    }
  },
  zh: {
    translation: {
      title: "招聘代理",
      kpiTiles: "关键指标",
      funnel: "转化漏斗",
      opsConsole: "运维控制台",
      controls: "控制",
      outreachTab: "外联",
      qualificationTab: "资格与排期",
      auditTab: "审计与规划",
      createJob: "创建职位",
      simulateOutreach: "开始外联",
      runFlow: "运行自动化",
      auditTrail: "审计日志（最近250条）",
      hiringSimulator: "容量规划",
      viewPolicy: "查看策略",
      dark: "深色",
      systemOk: "系统正常",
      errorCreateJob: "创建职位失败",
      outreachSeeded: "已开始外联",
      outreachFailed: "外联失败",
      flowExecuted: "自动化已执行",
      flowFailed: "自动化失败",
      noActivity: "暂无最新活动。开始外联并运行自动化以填充数据。"
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


