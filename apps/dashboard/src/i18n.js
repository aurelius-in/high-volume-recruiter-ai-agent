import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      title: "Recruiter Agent",
      kpiTiles: "Key metrics",
      kpi: {
        reply_rate: "Reply Rate",
        qualified_rate: "Qualified Rate",
        show_rate: "Show Rate",
        ats_success_rate: "ATS Success Rate",
        cost_per_qualified: "Cost Per Qualified",
        active_candidates: "Active Candidates"
      },
      funnel: "Funnel",
      opsConsole: "Ops Console",
      controls: "Controls",
      outreachTab: "Outreach",
      qualificationTab: "Scheduling",
      auditTab: "Audit & Ask",
      createJob: "Create Job",
      simulateOutreach: "Start Outreach",
      runFlow: "Run Automation",
      auditTrail: "Audit Trail (latest 250)",
      hiringSimulator: "Capacity Planner",
      planning: "Planning",
      slaHeatmap: "SLA Heatmap",
      capacity: "Capacity",
      actions: { autoPackSlots: "Auto-Pack Slots" },
      capacityLabels: { holds: "Holds", confirmed: "Confirmed", noShow: "No-show" },
      funnelLabels: { contacted: "Contacted", replied: "Replied", qualified: "Qualified", scheduled: "Scheduled", showed: "Showed", offer: "Offer", hired: "Hired" },
      ask: {
        title: "Ask Anything",
        placeholder: "Ask about candidates or jobs...",
        suggestionLine: "Ask about candidates or jobs. Try: ‘Does Aisha Rahman have 10+ years of experience building agentic systems?’ or ‘Should Sabbar hire Miguel Santos?’ You can also ask ‘List jobs in Dallas’ or ‘How many candidates are qualified?’",
        suggest1: "Does Aisha Rahman have 10+ years of agentic AI experience?",
        suggest2: "Should Sabbar hire Miguel Santos?",
        suggest3: "How many candidates are qualified?",
        suggest4: "List jobs in Dallas"
      },
      heatmap: {
        title: "Monthly Reply Window Heatmap",
        caption: "Reply rate by hour × weekday. Favor green, avoid red.",
        legend: { low: "Low", moderate: "Moderate", high: "High", highest: "Highest" }
      },
      timezone: { local: "Local" },
      sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat",
      ops: {
        createCandidate: "Create candidate",
        addTime: "Add time",
        sendMessage: "Send message",
        candidateId: "Candidate ID",
        month: "Month",
        day: "Day",
        year: "Year",
        hour: "Hour",
        ampm: "AM/PM",
        am: "AM",
        pm: "PM",
        propose: "Propose",
        name: "Name",
        phone: "Phone",
        create: "Create",
        message: "Message",
        recipientPhone: "Recipient phone",
        send: "Send",
        confirmInterview: "Confirm interview"
      },
      planning: "Planning",
      slaHeatmap: "SLA Heatmap",
      capacity: "Capacity",
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
      kpi: {
        reply_rate: "معدل الرد",
        qualified_rate: "معدل التأهيل",
        show_rate: "معدل الحضور",
        ats_success_rate: "نسبة نجاح نظام التوظيف",
        cost_per_qualified: "تكلفة لكل مؤهل",
        active_candidates: "المرشحون النشطون"
      },
      funnel: "المسار",
      opsConsole: "لوحة العمليات",
      controls: "التحكم",
      outreachTab: "التواصل",
      qualificationTab: "التأهيل والجدولة",
      auditTab: "التدقيق والسؤال",
      createJob: "إنشاء وظيفة",
      simulateOutreach: "بدء التواصل",
      runFlow: "تشغيل الأتمتة",
      auditTrail: "سجل التدقيق (آخر ٢٥٠)",
      hiringSimulator: "مُخطِّط السعة",
      planning: "التخطيط",
      slaHeatmap: "خريطة الردود",
      capacity: "السعة",
      actions: { autoPackSlots: "حزم المواعيد تلقائيًا" },
      capacityLabels: { holds: "الحجوزات", confirmed: "المؤكد", noShow: "عدم الحضور" },
      funnelLabels: { contacted: "تم التواصل", replied: "تم الرد", qualified: "مؤهل", scheduled: "مجدول", showed: "حضر", offer: "عرض", hired: "توظيف" },
      ask: {
        title: "اسأل أي شيء",
        placeholder: "اسأل عن المرشحين أو الوظائف...",
        suggestionLine: "اسأل عن المرشحين أو الوظائف. جرِّب: ‘هل لدى عائشة رحمن خبرة تزيد عن 10 سنوات في بناء الأنظمة الوكيلية؟’ أو ‘هل يجب على صبّار توظيف ميغيل سانتوس؟’ ويمكنك أيضًا أن تسأل ‘اعرض الوظائف في دالاس’ أو ‘كم عدد المرشحين المؤهلين؟’.",
        suggest1: "هل لدى عائشة رحمن خبرة تزيد عن 10 سنوات في الذكاء الاصطناعي الوكيلي؟",
        suggest2: "هل يجب على صبّار توظيف ميغيل سانتوس؟",
        suggest3: "كم عدد المرشحين المؤهلين؟",
        suggest4: "اعرض الوظائف في دالاس"
      },
      heatmap: {
        title: "خريطة نوافذ الرد الشهرية",
        caption: "معدل الرد حسب الساعة × أيام الأسبوع. فضّل الأخضر وتجنّب الأحمر.",
        legend: { low: "منخفض", moderate: "متوسط", high: "مرتفع", highest: "مرتفع جدًا" }
      },
      timezone: { local: "المحلي" },
      sun: "الأحد", mon: "الاثنين", tue: "الثلاثاء", wed: "الأربعاء", thu: "الخميس", fri: "الجمعة", sat: "السبت",
      ops: {
        createCandidate: "إنشاء مرشح",
        addTime: "إضافة وقت",
        sendMessage: "إرسال رسالة",
        candidateId: "معرّف المرشح",
        month: "الشهر",
        day: "اليوم",
        year: "السنة",
        hour: "الساعة",
        ampm: "ص/م",
        am: "ص",
        pm: "م",
        propose: "اقتراح",
        name: "الاسم",
        phone: "الهاتف",
        create: "إنشاء",
        message: "الرسالة",
        recipientPhone: "هاتف المستلم",
        send: "إرسال",
        confirmInterview: "تأكيد المقابلة"
      },
      planning: "التخطيط",
      slaHeatmap: "خريطة استجابة",
      capacity: "السعة",
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
  zh: {
    translation: {
      title: "招聘代理",
      kpiTiles: "关键指标",
      kpi: {
        reply_rate: "回复率",
        qualified_rate: "合格率",
        show_rate: "到场率",
        ats_success_rate: "ATS 成功率",
        cost_per_qualified: "每位合格成本",
        active_candidates: "活跃候选人"
      },
      funnel: "转化漏斗",
      opsConsole: "运维控制台",
      controls: "控制",
      outreachTab: "外联",
      qualificationTab: "资格与排期",
      auditTab: "审计与提问",
      createJob: "创建职位",
      simulateOutreach: "开始外联",
      runFlow: "运行自动化",
      auditTrail: "审计日志（最近250条）",
      hiringSimulator: "容量规划",
      planning: "规划",
      slaHeatmap: "SLA 热力图",
      capacity: "容量",
      actions: { autoPackSlots: "自动打包时段" },
      capacityLabels: { holds: "保留", confirmed: "已确认", noShow: "未到场" },
      funnelLabels: { contacted: "已联系", replied: "已回复", qualified: "合格", scheduled: "已排期", showed: "已到场", offer: "发放Offer", hired: "已录用" },
      ask: {
        title: "随便问",
        placeholder: "询问候选人或职位...",
        suggestionLine: "可以询问候选人或职位。例如：“艾莎·拉赫曼是否有10年以上构建代理系统的经验？” 或 “Sabbar是否应该录用米格尔·桑托斯？” 还可以问 “列出达拉斯的职位” 或 “有多少候选人已合格？”。",
        suggest1: "艾莎·拉赫曼是否有10年以上代理式AI经验？",
        suggest2: "Sabbar是否应该录用米格尔·桑托斯？",
        suggest3: "有多少候选人已合格？",
        suggest4: "列出达拉斯的职位"
      },
      heatmap: {
        title: "月度回复时间窗口热力图",
        caption: "按小时 × 星期的回复率。尽量选择绿色，避免红色。",
        legend: { low: "低", moderate: "中", high: "高", highest: "最高" }
      },
      timezone: { local: "本地" },
      sun: "周日", mon: "周一", tue: "周二", wed: "周三", thu: "周四", fri: "周五", sat: "周六",
      ops: {
        createCandidate: "创建候选人",
        addTime: "添加时间",
        sendMessage: "发送消息",
        candidateId: "候选人ID",
        month: "月",
        day: "日",
        year: "年",
        hour: "时",
        ampm: "上/下午",
        am: "上午",
        pm: "下午",
        propose: "提议",
        name: "姓名",
        phone: "电话",
        create: "创建",
        message: "消息",
        recipientPhone: "收件人电话",
        send: "发送",
        confirmInterview: "确认面试"
      },
      planning: "规划",
      slaHeatmap: "SLA 热力图",
      capacity: "容量",
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


