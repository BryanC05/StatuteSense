export const TASKS = [
  "Summarize the document and highlight key clauses.",
  "Extract obligations and deadlines.",
  "Identify risk areas and provide advice.",
  "Compare this document to a standard contract.",
];

export const DOCTYPES = ["Contract", "NDA", "Lease", "Privacy Policy", "Other"];

export const LOADING_STEPS = [
  "Analyzing document structure...",
  "Extracting key provisions...",
  "Evaluating legal implications...",
  "Cross-referencing statutes...",
  "Generating analysis report...",
];

export const TABS = [
  { id: "desk", label: "Defense Desk", icon: "⚖️" },
  { id: "chat", label: "Cross-Examination", icon: "💬" },
  { id: "compare", label: "Evidence Comparison", icon: "🔍" },
  { id: "risk", label: "Risk Radar", icon: "🛡️" },
  { id: "compliance", label: "Verdict Verification", icon: "✅" },
  { id: "clauses", label: "Precedent Library", icon: "📖" },
  { id: "deadlines", label: "Statute Clock", icon: "📅" },
  { id: "prompts", label: "Court Directives", icon: "🛠️" },
  { id: "analytics", label: "Trial Analytics", icon: "📊" },
  { id: "search", label: "Evidence Vault", icon: "📂" },
];

export const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { id: "desk", icon: "📋", label: "Document Analysis" },
      { id: "chat", icon: "💬", label: "AI Chat" },
    ],
  },
  {
    label: "Analysis",
    items: [
      { id: "risk", icon: "⚠️", label: "Risk Analysis" },
      { id: "compliance", icon: "✓", label: "Compliance" },
      { id: "compare", icon: "📊", label: "Comparison" },
    ],
  },
  {
    label: "Library",
    items: [
      { id: "clauses", icon: "📜", label: "Clause Library" },
      { id: "deadlines", icon: "⏰", label: "Deadlines" },
      { id: "prompts", icon: "⚙️", label: "Custom Prompts" },
    ],
  },
  {
    label: "Records",
    items: [
      { id: "search", icon: "🔍", label: "Search" },
      { id: "analytics", icon: "📈", label: "Analytics" },
    ],
  },
];
