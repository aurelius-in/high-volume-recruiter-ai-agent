import React from "react";
import { useTranslation } from "react-i18next";

export default function TimezoneFooter(){
  const { t } = useTranslation();
  const now = new Date();
  const ksa = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
  return (
    <div style={{ padding: 8, textAlign: "right", color: "#666", fontSize: 12 }}>
      {t('timezone.local')}: {now.toLocaleTimeString()} • KSA: {ksa.toLocaleTimeString("en-GB", { hour12: false })}
    </div>
  );
}


