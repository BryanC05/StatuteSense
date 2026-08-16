"use client";

import CustomSelect from "./CustomSelect";

export const JURISDICTIONS = [
  { value: "US Federal", label: "🇺🇸 US Federal Law" },
  { value: "California", label: "🐻 California (UTSA & CCPA)" },
  { value: "New York", label: "🗽 New York Commercial Law" },
  { value: "Delaware", label: "🏛️ Delaware Corporate & Chancery" },
  { value: "EU / GDPR", label: "🇪🇺 European Union (GDPR)" },
  { value: "UK Common Law", label: "🇬🇧 UK & Wales Common Law" },
];

export default function JurisdictionSelector({ value, onChange, style }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", ...style }}>
      <span>
        JURISDICTION:
      </span>
      <CustomSelect
        compact
        value={value || "US Federal"}
        onChange={(e) => onChange?.(e.target.value)}
        options={JURISDICTIONS}
        style={{ minWidth: "180px" }}
      />
    </div>
  );
}
