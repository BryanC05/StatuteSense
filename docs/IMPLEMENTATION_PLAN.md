# StatuteSense — Ace Attorney Legal AI Courtroom Platform

Comprehensive architectural implementation plan for StatuteSense, transforming contract analysis into an interactive **Ace Attorney Courtroom Command Desk** featuring real statutory citation engines, contextual applicability logic, RAG JSON schemas, interactive follow-up interrogations, and an advanced 6-feature legal suite.

---

## 🏛️ UI & UX Design System (No Trademark Words)

> [!IMPORTANT]
> **Zero Trademark Text References Policy**: All UI copy, labels, headers, and comments strictly avoid trademarked words (such as "Phoenix Wright", "Ace Attorney", or "Capcom"). We use authentic courtroom terminology: *Defense Counsel*, *Courtroom Stage*, *Testimony Board*, *Exhibit Vault*, *Prosecution Threat Radar*, *Cross-Examination Chamber*, *Verdict Verification*, and *Statute Clock*.

### Palette & Visual Language
- **Defense Blue (`#1d70f5`)**: Primary defense counsel accent, badges, and active focus rings.
- **Prosecution Crimson (`#e01b24`)**: High-risk severity tags, objection banners, and threat indicators.
- **Attorney Gold (`#ffcb3d`)**: 3D borders, judge scales, star badges, and section headers.
- **Speedline Canvas**: Radiant spotlight backdrop with 3D angular stroke buttons and speech-burst click effects.

---

## 🛠️ Core Application Architecture & Feature Modules

### 1. Defense Command Desk ([app/page.jsx](file:///Users/user/OpenCode/StatuteSense/app/page.jsx))
- **Court Stage Hero Strip**: Compact horizontal bench strip featuring the Golden Attorney Star Badge and live `[ COURT IN SESSION ]` ticker.
- **Form Toolbar**: Evidence type, preset tasks, and the **Multi-Jurisdiction Selector** (US Federal, CA, NY, DE, EU/GDPR, UK).
- **Official Court Brief Viewer**: Displays generated briefs with a prominent **`COURT AI ADVISORY`** banner, **`📄 EXPORT PDF DOCKET`** generator, and **`💬 FOLLOW-UP INTERROGATION`** action.
- **Jury-Friendly Plain English Translator**: Translates dense legalese into 8th-grade executive summaries.

### 2. Cross-Examination & Witness Interrogation Chamber ([components/ChatInterface.jsx](file:///Users/user/OpenCode/StatuteSense/components/ChatInterface.jsx))
- Active case banner showing loaded context (`📜 ACTIVE INTERROGATION RECORD: [Title]`).
- Quick 1-click interrogation chips (`What are the liability risks?`, `What statutes apply?`, `How to counter clause #2?`).
- Dialogue message cards with `🛡️ DEFENSE COUNSEL` (blue) and `📜 AI CO-COUNSEL` (gold) badges.

### 3. Prosecution Threat Radar & OBJECTION Contradiction Detector ([components/ContradictionDetector.jsx](file:///Users/user/OpenCode/StatuteSense/components/ContradictionDetector.jsx) & [components/RiskAnalyzer.jsx](file:///Users/user/OpenCode/StatuteSense/components/RiskAnalyzer.jsx))
- **"OBJECTION!" Contradiction Detector**: Scans contract text for internal term clashes (e.g. term length vs survival, liability cap vs indemnity) and displays a 3D **OBJECTION!** speech burst with resolution recommendations.
- **Prosecution Threat Radar**: Calculates document risk score (0-100) and exposes severity factors.

### 4. Precedent Archive & Defense Clause Redline Rewriter ([components/ClauseRedliner.jsx](file:///Users/user/OpenCode/StatuteSense/components/ClauseRedliner.jsx) & [components/ClauseLibrary.jsx](file:///Users/user/OpenCode/StatuteSense/components/ClauseLibrary.jsx))
- **Defense Clause Redline Rewriter**: Selects aggressive prosecution clauses and generates 3 tailored rewrites (*Balanced*, *Strong Defense*, *Compromise Fallback*).
- **Precedent Archive**: Pre-loaded with verified legal precedents and clause bank.

### 5. Exhibit A vs B Comparison & Batch Portfolio Analyzer ([components/BatchAnalyzer.jsx](file:///Users/user/OpenCode/StatuteSense/components/BatchAnalyzer.jsx) & [components/DocumentComparison.jsx](file:///Users/user/OpenCode/StatuteSense/components/DocumentComparison.jsx))
- **Exhibit Comparison Bench**: Side-by-side diffing for two contract versions.
- **Batch Evidence Portfolio Analyzer**: Parallel upload and analysis of multiple contracts across a portfolio matrix.

---

## 📜 Statutory & Anti-Hallucination Legal Citation Engine

> [!NOTE]
> **Anti-Hallucination & Legal Citation Engine**: Strict system prompt directives prevent fake citations or fabricated reporter volume/page numbers. All outputs cite 100% verified statutes and landmark case precedents:
> - **Defend Trade Secrets Act (DTSA), 18 U.S.C. § 1836 et seq.** / **UTSA § 1(4)**
> - **Restatement (Second) of Contracts § 71 & § 75** (Exchange & Mutual Consideration)
> - **E.I. du Pont de Nemours & Co. v. Christopher, 431 F.2d 1012 (5th Cir. 1970)**
> - **Rockwell Graphic Systems, Inc. v. DEV Industries, Inc., 925 F.2d 174 (7th Cir. 1991)**
> - **Silvaco Data Systems v. Intel Corp., 184 Cal. App. 4th 210 (2010)**

### Contextual Scope Logic Rules
1. **UCC Article 2 Rule**: Only cite UCC Article 2 when the text explicitly involves physical goods, manufacturing, or inventory.
2. **GDPR / CCPA / DPA Rule**: Only flag privacy statutes or Data Processing Addenda if "Personal Data", "PII", or "User Records" are present in the text.
3. **RAG JSON Legal Schema**: Append structured JSON Legal Schema (`document_type`, `meta`, `clauses`, `legal_citations`) at the end of outputs for RAG vector stores.

---

## 🧪 Verification Plan

### Automated Build Verification
- Execute `npm run build` to verify clean compilation across all Next.js API routes and pages.
