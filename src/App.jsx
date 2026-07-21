import React, { useState, useMemo } from "react";
import {
  LayoutGrid, Users, FolderKanban, Boxes, UserCog, Plus, X, ChevronRight,
  AlertTriangle, CheckCircle2, Circle, Trash2, Radio, ShieldCheck, TrendingUp,
  Briefcase, Link2, Info, HeartHandshake, Target, BookOpen, Search, Tag,
  DollarSign, Megaphone, GraduationCap, FileText, Settings, Bell, ListChecks,
  BarChart3, Lock, Anchor, GitCommitHorizontal, Rocket, Timer, Printer,
  Calendar, ClipboardList, HelpCircle,
} from "lucide-react";

/* ============================== DESIGN TOKENS ==============================
   Same Mira for AI Adoption identity: slate/ink + orange "signal" accent + functional RAG semaphore.
   Design system: TCF Meridian (see project's DESIGN_SYSTEM.md).
   ink #0F172A · canvas #F8FAFC · surface #FFFFFF · line #E2E8F0 · signal #F97316
   Type: Space Grotesk (headers) · Inter (body) · Fira Code (data/ids)
============================================================================ */

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=Fira+Code:wght@400;500&display=swap');`;

const RAG = {
  green: { label: "Green", hex: "#10B981", bg: "#E5F9F1" },
  amber: { label: "Amber", hex: "#F59E0B", bg: "#FEF3E0" },
  red: { label: "Red", hex: "#dc2626", bg: "#FDEAEA" },
};

const TOTAL_MONTHS = 12;

/* ============================== MOCK DATA ============================== */

const INITIAL_CLIENTS = [
  { id: "cl-andes", name: "Andes Group", tier: "Tier 1 — Strategic", contact: "Marina Ossa · CTO" },
  { id: "cl-vantis", name: "Vantis Corp", tier: "Tier 2 — Growth", contact: "Diego Farfán · VP Engineering" },
];

const INITIAL_PROGRAMS = [
  { id: "prog-andes", name: "AI Adoption — Andes Group", clientId: "cl-andes" },
  { id: "prog-vantis", name: "SDLC Transformation — Vantis Corp", clientId: "cl-vantis" },
];

const PHASE_TEMPLATE = [
  { id: "inicio", name: "Initiation", startMonth: 0, endMonth: 1, dependsOn: [], critical: true },
  { id: "planificacion", name: "Planning", startMonth: 1, endMonth: 2, dependsOn: ["inicio"], critical: true },
  { id: "ejecucion", name: "Execution", startMonth: 2, endMonth: 9, dependsOn: ["planificacion"], critical: true },
  { id: "monitoreo", name: "Monitoring", startMonth: 8, endMonth: 11, dependsOn: ["ejecucion"], critical: true },
  { id: "cierre", name: "Closure", startMonth: 11, endMonth: 12, dependsOn: ["monitoreo"], critical: true },
];

/* ---- Baseline and weekly progress update ----
   As of the v2.5 scope redefinition: the baseline is no longer a budget
   schedule. Project scope = complete delivery of the 6 TCF Stages within a
   PM-configurable duration (6 or 12 months). Each Stage carries an editable
   weight (must sum to 100%); overall progress is the weight-adjusted sum of
   each Stage's TCF practice completion (checked off in the TCF Adoption tab —
   never entered manually here). No cost/budget data exists anywhere in this
   model — health is derived purely from schedule (weighted % vs. % of time
   elapsed) plus critical RIDA, which is simple, predictive, and defensible
   without needing a budget line. */

const DEFAULT_STAGE_WEIGHTS = { 1: 7, 2: 16, 3: 25, 4: 14, 5: 32, 6: 6 }; // proportional to practice count per stage, sums to 100

const INITIAL_BASELINES = {
  "p-fenix": {
    locked: true, durationMonths: 12, stageWeights: { ...DEFAULT_STAGE_WEIGHTS },
    committedDate: "2027-01-15",
    riskNotes: "Staging access delay with the client could push the QA pilot back about a week.",
  },
  "p-nebula": {
    locked: true, durationMonths: 12, stageWeights: { ...DEFAULT_STAGE_WEIGHTS },
    committedDate: "2027-01-10",
    riskNotes: "Unvalidated data architecture is blocking Stage 3; needs a client decision this week.",
  },
  "p-orion": {
    locked: true, durationMonths: 12, stageWeights: { ...DEFAULT_STAGE_WEIGHTS },
    committedDate: "2026-12-20",
    riskNotes: "No active risks; monitoring stakeholder availability for upcoming validations.",
  },
  "p-atlas": {
    locked: true, durationMonths: 12, stageWeights: { ...DEFAULT_STAGE_WEIGHTS },
    committedDate: "2026-12-01",
    riskNotes: "Closure in progress; no open risks.",
  },
};

const INITIAL_UPDATES = {
  "p-fenix": [
    { id: 1, week: "Week of Jul 07, 2026", selfReportedRag: "green", comment: "QA pilot starting late due to staging access delays." },
  ],
  "p-nebula": [
    { id: 1, week: "Week of Jul 07, 2026", selfReportedRag: "amber", comment: "Data architecture still not validated by the client." },
  ],
  "p-orion": [
    { id: 1, week: "Week of Jul 07, 2026", selfReportedRag: "green", comment: "Planning closeout in progress, no material blockers." },
  ],
  "p-atlas": [
    { id: 1, week: "Week of Jul 07, 2026", selfReportedRag: "green", comment: "Closure and lessons learned nearly complete." },
  ],
};

/* ---- Weekly Status Report — per-project narrative fields ----
   Achievements/next steps/decisions are inherently manual weekly PM input.
   Blockers/risks are read live from RIDA (red/amber items) plus an optional
   ad-hoc note field for anything not yet formally logged in RIDA. */

const INITIAL_REPORT_NOTES = {
  "p-fenix": {
    statusContext: "Foundations closed out on schedule; Adoption stage underway with one staging-access delay to watch.",
    achievements: ["Completed Flow Metrics Baselining workshop with the client's dev team", "Closed all 7 Foundations-stage practices"],
    manualRisks: [],
    nextSteps: [
      { action: "Escalate staging access request to client IT lead", owner: "Lucía Rendón", due: "2026-07-22" },
      { action: "Schedule Stage 3 kickoff workshop", owner: "AI Consultant", due: "2026-07-25" },
    ],
    decisions: [],
  },
  "p-nebula": {
    statusContext: "Adoption stage progress is behind plan; data architecture validation is the critical path blocker.",
    achievements: ["Held architecture review meeting with client's technical leadership"],
    manualRisks: [],
    nextSteps: [
      { action: "Get client sign-off on data architecture approach", owner: "Ana Souza", due: "2026-07-21" },
    ],
    decisions: [
      { description: "Whether to descope the legacy ERP integration from Stage 3 given schedule risk", owner: "Sponsor", due: "2026-07-24" },
    ],
  },
  "p-orion": {
    statusContext: "Foundations stage complete; Readiness stage starting, pace slightly behind plan but no blockers.",
    achievements: ["Closed Foundations stage 3/3 practices"],
    manualRisks: [],
    nextSteps: [
      { action: "Confirm stakeholder availability for Readiness-stage validations", owner: "Carlos Beltrán", due: "2026-07-23" },
    ],
    decisions: [],
  },
  "p-atlas": {
    statusContext: "Project in closure; only Orchestration and Autonomy stage tail items remain.",
    achievements: ["Delivered closure and lessons-learned report draft"],
    manualRisks: [],
    nextSteps: [
      { action: "Finalize remaining Autonomy-stage practice evidence", owner: "Marco Iglesias", due: "2026-07-20" },
    ],
    decisions: [],
  },
};

/* ---- Schedule-only health engine (no cost/budget) ----
   Replaces EVM. weightedActualPct comes from TCF practice completion ×
   Stage weights (see computeWeightedProgress, defined near TCF_STAGES).
   These are PROJECT progress metrics; DORA (team dev efficiency) is a
   separate family — see TCF Adoption. */

function computeScheduleStatus(baseline, monthsElapsed, weightedActualPct) {
  if (!baseline || !baseline.durationMonths) return null;
  const expectedPct = (monthsElapsed / baseline.durationMonths) * 100;
  const variance = weightedActualPct - expectedPct;
  return { expectedPct: Math.round(expectedPct), actualPct: Math.round(weightedActualPct), variance: Math.round(variance) };
}

function computeCalculatedRag(variance, ridaRedCount) {
  if (variance < -15 || ridaRedCount >= 2) return "red";
  if (variance < -5 || ridaRedCount >= 1) return "amber";
  return "green";
}

function buildPhases(monthsElapsed) {
  return PHASE_TEMPLATE.map((p) => ({
    ...p,
    status: monthsElapsed >= p.endMonth ? "done" : monthsElapsed >= p.startMonth ? "current" : "pending",
  }));
}

const INITIAL_PROJECTS = [
  {
    id: "p-fenix", name: "Project Phoenix", clientId: "cl-andes", programId: "prog-andes",
    pm: "Lucía Rendón", status: "Active", monthsElapsed: 6,
    ragCalculated: "amber", ragReported: "green", satisfaction: 8.1,
  },
  {
    id: "p-orion", name: "Project Orion", clientId: "cl-andes", programId: "prog-andes",
    pm: "Carlos Beltrán", status: "Active", monthsElapsed: 2,
    ragCalculated: "green", ragReported: "green", satisfaction: 9.0,
  },
  {
    id: "p-nebula", name: "Project Nebula", clientId: "cl-andes", programId: "prog-andes",
    pm: "Ana Souza", status: "Active", monthsElapsed: 5,
    ragCalculated: "red", ragReported: "amber", satisfaction: 6.4,
  },
  {
    id: "p-atlas", name: "Project Atlas", clientId: "cl-vantis", programId: "prog-vantis",
    pm: "Marco Iglesias", status: "Active", monthsElapsed: 11,
    ragCalculated: "green", ragReported: "green", satisfaction: 9.4,
  },
];

const INITIAL_RIDA = {
  "p-fenix": [
    { id: 1, type: "Risk", title: "Dependency on client dataset not yet delivered", severity: "amber", owner: "Lucía Rendón", due: "Jul 20" },
    { id: 2, type: "Risk", title: "Turnover on the client's QA team", severity: "amber", owner: "Lucía Rendón", due: "Jul 25" },
    { id: 3, type: "Issue", title: "Staging environment access pending from client IT", severity: "red", owner: "AI Consultant", due: "Jul 16" },
  ],
  "p-nebula": [
    { id: 1, type: "Risk", title: "Data architecture not validated by the client", severity: "red", owner: "Ana Souza", due: "overdue" },
    { id: 2, type: "Risk", title: "Ambiguous scope in legacy ERP integration", severity: "red", owner: "Ana Souza", due: "Jul 14" },
    { id: 3, type: "Issue", title: "Phase 2 deliverable without Director approval", severity: "red", owner: "Ana Souza", due: "overdue" },
  ],
  "p-orion": [
    { id: 1, type: "Risk", title: "Availability of key stakeholders for validations", severity: "amber", owner: "Carlos Beltrán", due: "Jul 22" },
  ],
  "p-atlas": [],
};

const INITIAL_PEOPLE = [
  { id: "res-lucia", name: "Lucía Rendón", role: "Project Manager", allocations: [{ projectId: "p-fenix", pct: 60 }] },
  { id: "res-carlos", name: "Carlos Beltrán", role: "Project Manager", allocations: [{ projectId: "p-orion", pct: 50 }] },
  { id: "res-ana", name: "Ana Souza", role: "Project Manager", allocations: [{ projectId: "p-nebula", pct: 80 }] },
  { id: "res-marco", name: "Marco Iglesias", role: "Project Manager", allocations: [{ projectId: "p-atlas", pct: 40 }] },
  { id: "res-juan", name: "Juan Pérez", role: "Change Consultant", allocations: [{ projectId: "p-fenix", pct: 50 }, { projectId: "p-nebula", pct: 60 }] },
  { id: "res-vale", name: "Valentina Ríos", role: "AI Consultant", allocations: [{ projectId: "p-orion", pct: 40 }, { projectId: "p-atlas", pct: 30 }] },
];

/* ---- TCF adoption map by Stage (1-6) ----
   Verified directly against the TCF portal (api/practices): every practice has
   a paradigm AND a stage — they are independent axes. Here we group by stage,
   which is the sequential axis (the "adoption arc"), with the 44 real names. */

const TCF_STAGES = [
  {
    key: 1, name: "Awareness", startMonth: 0, endMonth: 2,
    subtitle: "Baseline measurement established — the team knows where it stands before AI arrives.",
    practices: ["Flow Metrics Baselining", "Value Stream Mapping", "Unified Backlog Management"],
  },
  {
    key: 2, name: "Foundations", startMonth: 1, endMonth: 3,
    subtitle: "Governance and procurement underway — AI tools evaluated and approved.",
    practices: ["AI Definition of Done", "Context Engineering", "AI Use-Case Prioritization", "Enterprise AI Tooling Procurement", "AI-Ready Engineering Cross-Training", "Execution Spec Design", "AI Regulatory Risk Classification"],
  },
  {
    key: 3, name: "Adoption", startMonth: 2, endMonth: 6,
    subtitle: "AI-assisted development is a team standard — practices are documented, not ad hoc.",
    practices: ["Team Zero Pilot Kickoff", "Manual IP and PII Safeguard Enforcement", "AI Instruction Asset Registry", "Delivery Cycle ROI Pulse Check", "Knowledge Transfer & Enablement Kit", "AI Governance Management System", "Human Oversight Architecture", "AI-Augmented Delivery Model", "AI-Assisted Backlog Grooming", "AI Results Inspection", "Pipeline Review"],
  },
  {
    key: 4, name: "Integration", startMonth: 5, endMonth: 8,
    subtitle: "AI embedded in QA, deployment, and planning ceremonies.",
    practices: ["Cohort Scaling Model", "Community of Practice", "Cohort Flow Metrics Tracking", "AI Cost Governance", "AI-Augmented QA Strategy", "AI-Augmented QA Automation"],
  },
  {
    key: 5, name: "Orchestration", startMonth: 7, endMonth: 11,
    subtitle: "Multi-agent systems and automated pipelines operating under safety controls.",
    practices: ["Agentic TDD (Spec-Driven AI Development)", "AST Safety Gates", "CI/CD Coverage Enforcement", "OWASP LLM Top 10 Compliance", "Strict Sandboxing and Least Privilege", "Multi-Agent System Design", "Agent Memory Architecture", "MCP Server Architecture", "RAG System Design", "AI Supply Chain Security", "AI-Generated Test Review", "AI Workflow Skills Architecture", "Prompt-Defined Subagent Patterns", "Framework-Based Agent Orchestration"],
  },
  {
    key: 6, name: "Autonomy", startMonth: 10, endMonth: 12,
    subtitle: "AI systems operate with bounded autonomy — post-market monitoring is operational.",
    practices: ["Data Lineage and LLM Tracing", "Automated Circuit Breakers", "Post-Market AI Monitoring"],
  },
].map((s) => ({ ...s, total: s.practices.length }));

/* Weighted overall progress: Σ(stageWeight% × stage practice completion %).
   This is what feeds the schedule-only health engine above and the new
   weighted-progress timeline in the Baseline tab. */
function computeWeightedProgress(practices, stageWeights) {
  if (!practices || !stageWeights) return 0;
  let total = 0;
  TCF_STAGES.forEach((st) => {
    const list = practices[st.key] || [];
    const pct = list.length ? (list.filter((p) => p.closed).length / list.length) * 100 : 0;
    total += ((stageWeights[st.key] || 0) / 100) * pct;
  });
  return total;
}

function makePractices(stage, closedCount) {
  return stage.practices.map((name, i) => ({ id: `s${stage.key}-${i}`, name, closed: i < closedCount, workshops: [] }));
}

const INITIAL_TCF_STATE = {
  "p-fenix": { 1: 3, 2: 6, 3: 8, 4: 2, 5: 1, 6: 0 },
  "p-nebula": { 1: 2, 2: 3, 3: 4, 4: 1, 5: 0, 6: 0 },
  "p-orion": { 1: 3, 2: 2, 3: 0, 4: 0, 5: 0, 6: 0 },
  "p-atlas": { 1: 3, 2: 7, 3: 11, 4: 6, 5: 13, 6: 2 },
};

// Seed workshop(s) — illustrative example taken literally from spec v2.4:
// the "Flow Metrics Baselining" workshop (Stage 1) captures the client's
// initial DORA + Cycle Time values.
const SEED_WORKSHOPS = {
  "p-fenix": {
    "s1-0": [ // Flow Metrics Baselining
      {
        id: 1, date: "Jun 18, 2026", facilitator: "Lucía Rendón", participants: "Client development team (4)",
        dataPoints: [
          { key: "Initial Cycle Time", value: "9 days" },
          { key: "Initial Lead Time for Changes", value: "12 days" },
          { key: "Initial Deployment Frequency", value: "Monthly" },
          { key: "Initial Change Failure Rate", value: "28%" },
        ],
      },
    ],
  },
};

function buildInitialPractices() {
  const out = {};
  Object.entries(INITIAL_TCF_STATE).forEach(([projectId, counts]) => {
    out[projectId] = {};
    TCF_STAGES.forEach((s) => {
      out[projectId][s.key] = makePractices(s, counts[s.key] || 0);
    });
  });
  // Inject seed workshops
  Object.entries(SEED_WORKSHOPS).forEach(([projectId, byPractice]) => {
    Object.entries(byPractice).forEach(([practiceId, workshops]) => {
      Object.keys(out[projectId]).forEach((stageKey) => {
        out[projectId][stageKey] = out[projectId][stageKey].map((pr) =>
          pr.id === practiceId ? { ...pr, workshops } : pr
        );
      });
    });
  });
  return out;
}

/* ---- DORA — AI-assisted software development efficiency ----
   A metrics family distinct from EVM: EVM measures the PROJECT's progress/cost;
   DORA measures how efficient the TEAM is at shipping software with AI support.
   Shown within the TCF Adoption tab, since the TCF "Foundation" paradigm is
   precisely where its baseline gets established. */

const DORA_BENCHMARKS = {
  Elite: { color: "#10B981", bg: "#E5F9F1" },
  High: { color: "#F97316", bg: "#FDF1E7" },
  Medium: { color: "#F59E0B", bg: "#FEF3E0" },
  Low: { color: "#dc2626", bg: "#FDEAEA" },
};

/* Cycle Time classification: Elite <1d, High 1-3d, Medium 3-7d, Low >7d */
function classifyCycleTime(days) {
  if (days < 1)  return "Elite";
  if (days <= 3) return "High";
  if (days <= 7) return "Medium";
  return "Low";
}

const INITIAL_DORA = {
  "p-fenix": {
    deploymentFrequency: { value: "Weekly", level: "High" },
    leadTimeForChanges: { value: "2 days", level: "High" },
    changeFailureRate: { value: "18%", level: "Medium" },
    mttr: { value: "4 hours", level: "High" },
    cycleTime: { value: "3.5 days", level: classifyCycleTime(3.5) },
  },
  "p-nebula": {
    deploymentFrequency: { value: "Monthly", level: "Medium" },
    leadTimeForChanges: { value: "12 days", level: "Medium" },
    changeFailureRate: { value: "32%", level: "Low" },
    mttr: { value: "2 days", level: "Medium" },
    cycleTime: { value: "8 days", level: classifyCycleTime(8) },
  },
  "p-orion": {
    deploymentFrequency: { value: "Weekly", level: "High" },
    leadTimeForChanges: { value: "1 day", level: "High" },
    changeFailureRate: { value: "12%", level: "Elite" },
    mttr: { value: "3 hours", level: "High" },
    cycleTime: { value: "1.5 days", level: classifyCycleTime(1.5) },
  },
  "p-atlas": {
    deploymentFrequency: { value: "Daily", level: "Elite" },
    leadTimeForChanges: { value: "4 hours", level: "Elite" },
    changeFailureRate: { value: "8%", level: "Elite" },
    mttr: { value: "45 min", level: "Elite" },
    cycleTime: { value: "0.5 days", level: classifyCycleTime(0.5) },
  },
};

function expectedByMonth(group, month) {
  const { total, startMonth, endMonth } = group;
  if (month <= startMonth) return 0;
  if (month >= endMonth) return total;
  return total * ((month - startMonth) / (endMonth - startMonth));
}

/* ---- 5.3 Change Management & Adoption ---- */

/* ---- SPACE Framework seed data ----
   Five dimensions per project, each with a level (Low/Medium/High), trend, and PM note.
   Resistances → E (Efficiency & Flow blockers)
   Comms       → C (Communication & Collaboration plan)
   Trainings   → A (Activity — meaningful learning actions) */

const SPACE_DIMS = [
  { key: "s", label: "Satisfaction & Wellbeing", abbr: "S", color: "#6d28d9", bg: "#EDE9FE", desc: "Team fulfillment, AI tool satisfaction, and sustainable pace." },
  { key: "p", label: "Performance", abbr: "P", color: "#0284c7", bg: "#E0F2FE", desc: "Quality of outcomes — not volume. Rework rate, defect density, CFR trend." },
  { key: "a", label: "Activity", abbr: "A", color: "#10B981", bg: "#E5F9F1", desc: "Meaningful engineering actions: trainings completed, PRs reviewed, incidents resolved." },
  { key: "c", label: "Communication & Collaboration", abbr: "C", color: "#F97316", bg: "#FDF1E7", desc: "Knowledge sharing effectiveness, shared AI standards, cross-team coordination." },
  { key: "e", label: "Efficiency & Flow", abbr: "E", color: "#F59E0B", bg: "#FEF3E0", desc: "Uninterrupted focus time, friction points, CI wait, blocked PRs." },
];

const SPACE_LEVEL_STYLE = {
  High:   { color: "#10B981", bg: "#E5F9F1" },
  Medium: { color: "#F59E0B", bg: "#FEF3E0" },
  Low:    { color: "#dc2626", bg: "#FDEAEA" },
};

const SPACE_TREND_LABEL = { improving: "↑ Improving", stable: "→ Stable", declining: "↓ Declining" };
const SPACE_TREND_COLOR = { improving: "#10B981", stable: "#94A3B8", declining: "#dc2626" };

const INITIAL_CHANGE = {
  "p-fenix": {
    space: {
      s: { level: "Medium", trend: "stable",    note: "QA team anxious about role changes; dev team broadly positive about AI tools." },
      p: { level: "Medium", trend: "stable",    note: "CFR stable at 18%; slight rework increase on AI-generated PRs under review." },
      a: { level: "High",   trend: "improving", note: "Strong training completion (82% Copilot, 40% QA prompting); regular AI-assisted PR reviews." },
      c: { level: "Medium", trend: "stable",    note: "Active communication plan; shared prompt library not yet established with the client team." },
      e: { level: "Medium", trend: "stable",    note: "CI wait times improving; staging access blocker is the main friction point this sprint." },
    },
    resistances: [
      { id: 1, text: "QA team perceives AI as a threat to their role" },
    ],
    comms: [
      { id: 1, date: "Jul 10", audience: "Development team", channel: "In-person workshop", status: "Done" },
      { id: 2, date: "Jul 24", audience: "Client leadership", channel: "Executive newsletter", status: "Planned" },
    ],
    trainings: [
      { id: 1, name: "Code Copilot Fundamentals", attendance: 82 },
      { id: 2, name: "Prompting Best Practices for QA", attendance: 40 },
    ],
  },
  "p-nebula": {
    space: {
      s: { level: "Low",    trend: "declining", note: "Team lacks dedicated time for training; leadership skepticism is eroding morale." },
      p: { level: "Low",    trend: "declining", note: "CFR rising alongside AI adoption; rework rate high on agent-generated outputs." },
      a: { level: "Low",    trend: "stable",    note: "Only 35% Copilot training completion; minimal structured AI review activity." },
      c: { level: "Low",    trend: "stable",    note: "Architecture review held but no shared AI standards; prompt practices ad hoc." },
      e: { level: "Low",    trend: "declining", note: "Data architecture blocker unresolved; team context-switching frequently." },
    },
    resistances: [
      { id: 1, text: "Client's technical leadership questions the reliability of AI agents" },
      { id: 2, text: "Team lacks dedicated time for training" },
    ],
    comms: [
      { id: 1, date: "Jul 08", audience: "Client architecture team", channel: "Meeting", status: "Done" },
    ],
    trainings: [
      { id: 1, name: "Code Copilot Fundamentals", attendance: 35 },
    ],
  },
  "p-orion": {
    space: {
      s: { level: "High",   trend: "improving", note: "Team highly satisfied with AI tooling; no resistance signals detected this sprint." },
      p: { level: "High",   trend: "stable",    note: "CFR at 12% (Elite range); strong spec discipline keeping rework low." },
      a: { level: "High",   trend: "stable",    note: "95% Copilot training completion; consistent AI-assisted PR reviews in place." },
      c: { level: "High",   trend: "improving", note: "Good internal communication; team starting to document shared prompting standards." },
      e: { level: "High",   trend: "stable",    note: "Minimal friction; stakeholder availability for validations is the only watch item." },
    },
    resistances: [],
    comms: [
      { id: 1, date: "Jul 15", audience: "Whole team", channel: "Internal newsletter", status: "Done" },
    ],
    trainings: [
      { id: 1, name: "Code Copilot Fundamentals", attendance: 95 },
    ],
  },
  "p-atlas": {
    space: {
      s: { level: "High",   trend: "stable",    note: "Team fulfilled; closure phase with strong sense of accomplishment." },
      p: { level: "High",   trend: "stable",    note: "CFR at 8% (Elite); agentic outputs consistently meeting spec on first review." },
      a: { level: "High",   trend: "stable",    note: "100% multi-agent training completion; full AI-assisted delivery lifecycle in place." },
      c: { level: "High",   trend: "stable",    note: "Closure presentation delivered; lessons learned documented and shared across portfolio." },
      e: { level: "High",   trend: "stable",    note: "No active friction; autonomous pipelines running within guardrails." },
    },
    resistances: [],
    comms: [
      { id: 1, date: "Jul 05", audience: "Client steering committee", channel: "Closure presentation", status: "Done" },
    ],
    trainings: [
      { id: 1, name: "Multi-Agent Orchestration for Tech Leads", attendance: 100 },
    ],
  },
};

/* ---- 5.4 Value & Metrics Measurement ---- */

const INITIAL_KPIS = {
  "p-fenix": { stakeholderSatisfaction: 8.1, benefitExpected: 180000, benefitRealized: 96000 },
  "p-nebula": { stakeholderSatisfaction: 6.4, benefitExpected: 220000, benefitRealized: 41000 },
  "p-orion": { stakeholderSatisfaction: 9.0, benefitExpected: 95000, benefitRealized: 52000 },
  "p-atlas": { stakeholderSatisfaction: 9.4, benefitExpected: 210000, benefitRealized: 205000 },
};

/* ---- 5.4.1 ROI, Investment & Time Saved (v2.6) ----
   A third metrics family, independent from the schedule engine (5.1) and
   from DORA (5.3): does the AI-adoption engagement pay for itself?
   Investment is broken into categories; time saved per team/role carries a
   confidence level (Estimated / Validated / Measured) so the number stays
   credible instead of just being a PM's optimistic guess. */

const INITIAL_INVESTMENT = {
  "p-fenix": [
    { category: "Consulting fees", amount: 45000 },
    { category: "Tooling licensing", amount: 8000 },
    { category: "Client internal time", amount: 12000 },
    { category: "Infrastructure / compute", amount: 3000 },
  ],
  "p-nebula": [
    { category: "Consulting fees", amount: 62000 },
    { category: "Tooling licensing", amount: 14000 },
    { category: "Client internal time", amount: 15000 },
    { category: "Infrastructure / compute", amount: 4000 },
  ],
  "p-orion": [
    { category: "Consulting fees", amount: 20000 },
    { category: "Tooling licensing", amount: 5000 },
    { category: "Client internal time", amount: 4000 },
    { category: "Infrastructure / compute", amount: 1000 },
  ],
  "p-atlas": [
    { category: "Consulting fees", amount: 88000 },
    { category: "Tooling licensing", amount: 18000 },
    { category: "Client internal time", amount: 11000 },
    { category: "Infrastructure / compute", amount: 3000 },
  ],
};

const INITIAL_TIME_SAVED = {
  "p-fenix": {
    loadedRate: 75,
    items: [
      { team: "Development Team", hoursWeek: 14, confidence: "Measured" },
      { team: "QA Team", hoursWeek: 9, confidence: "Validated" },
      { team: "Tech Leadership", hoursWeek: 5, confidence: "Estimated" },
    ],
  },
  "p-nebula": {
    loadedRate: 70,
    items: [
      { team: "Development Team", hoursWeek: 4, confidence: "Estimated" },
      { team: "QA Team", hoursWeek: 2, confidence: "Estimated" },
    ],
  },
  "p-orion": {
    loadedRate: 80,
    items: [
      { team: "Development Team", hoursWeek: 11, confidence: "Measured" },
      { team: "QA Team", hoursWeek: 6, confidence: "Validated" },
    ],
  },
  "p-atlas": {
    loadedRate: 85,
    items: [
      { team: "Development Team", hoursWeek: 18, confidence: "Measured" },
      { team: "QA Team", hoursWeek: 10, confidence: "Measured" },
      { team: "Tech Leadership", hoursWeek: 6, confidence: "Validated" },
    ],
  },
};

const CONFIDENCE = {
  Estimated: { hex: "#64748B", bg: "#F1F5F9" },
  Validated: { hex: "#F59E0B", bg: "#FEF3E0" },
  Measured: { hex: "#10B981", bg: "#E5F9F1" },
};

function totalInvestment(list) {
  return (list || []).reduce((s, i) => s + i.amount, 0);
}
function weeklyTimeSavedValue(timeSaved) {
  if (!timeSaved || !timeSaved.items) return { hours: 0, value: 0 };
  const hours = timeSaved.items.reduce((s, t) => s + t.hoursWeek, 0);
  return { hours, value: hours * timeSaved.loadedRate };
}
function computeRoi(investmentList, benefitRealized, monthsElapsed) {
  const inv = totalInvestment(investmentList);
  const roiPct = inv ? ((benefitRealized - inv) / inv) * 100 : 0;
  const monthlyRunRate = monthsElapsed ? benefitRealized / monthsElapsed : 0;
  const paybackMonths = monthlyRunRate > 0 ? inv / monthlyRunRate : null;
  return { investment: inv, roiPct, monthlyRunRate, paybackMonths };
}
/* Cumulative investment vs. cumulative benefit series for the breakeven
   chart. Investment is modeled as spent evenly across the first 3 months
   (typical consulting billing cadence); benefit accrues at the observed
   monthly run-rate from month 1. */
function buildBreakevenSeries(investment, monthlyRunRate, durationMonths) {
  const duration = durationMonths || 12;
  const rampMonths = Math.min(3, duration);
  const points = [];
  for (let m = 0; m <= duration; m++) {
    const invCum = m === 0 ? 0 : Math.min(investment, (investment / rampMonths) * Math.min(m, rampMonths));
    const benCum = monthlyRunRate * m;
    points.push({ month: m, investment: invCum, benefit: benCum });
  }
  return points;
}
function findBreakevenMonth(series) {
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1], cur = series[i];
    const prevDiff = prev.benefit - prev.investment;
    const curDiff = cur.benefit - cur.investment;
    if (prevDiff < 0 && curDiff >= 0) {
      const frac = prevDiff === curDiff ? 0 : -prevDiff / (curDiff - prevDiff);
      return prev.month + frac;
    }
  }
  return null;
}
const usd = (n) => `USD ${Math.round(n).toLocaleString("en-US")}`;

/* ---- 5.6 Administration ---- */

const INITIAL_USERS = [
  { id: 1, name: "Raúl Ferreira", email: "raul.ferreira@empresa.com", role: "PMO Director", status: "Active" },
  { id: 2, name: "Lucía Rendón", email: "lucia.rendon@empresa.com", role: "Project Manager", status: "Active" },
  { id: 3, name: "Ana Souza", email: "ana.souza@empresa.com", role: "Project Manager", status: "Active" },
  { id: 4, name: "Juan Pérez", email: "juan.perez@empresa.com", role: "Consultant / Change Lead", status: "Active" },
  { id: 5, name: "Marina Ossa", email: "marina.ossa@andesgroup.com", role: "Client", status: "Active" },
  { id: 6, name: "Susan Weller", email: "susan.weller@empresa.com", role: "Business Analyst/QA", status: "Invited" },
];

const ROLE_PERMISSIONS = [
  { role: "PMO Director", proyectos: "Read/Write", rida: "Read/Write", aprobaciones: "Approve", tcf: "Read/Write", clientes: "Read/Write" },
  { role: "Project Manager", proyectos: "Read/Write (assigned)", rida: "Read/Write", aprobaciones: "Request", tcf: "Read/Write", clientes: "Read-only" },
  { role: "Consultant / Change Lead", proyectos: "Read-only", rida: "Read/Write (own)", aprobaciones: "No access", tcf: "Read/Write (own)", clientes: "No access" },
  { role: "Client", proyectos: "Read-only (limited)", rida: "No access", aprobaciones: "Approve milestones", tcf: "Read-only (summary)", clientes: "No access" },
  { role: "System Administrator", proyectos: "Configuration", rida: "Configuration", aprobaciones: "Configuration", tcf: "Configuration", clientes: "Configuration" },
];

const INITIAL_CATALOGS = {
  "Project Types": ["AI Adoption in SDLC", "Agile Transformation", "Data Governance"],
  "Project Statuses": ["Pending", "In Progress", "Completed", "On Hold"],
  "Risk Types": ["Technical", "Organizational", "Contractual", "Adoption-related"],
  "Client Tiers (TCF)": ["Tier 1 — Strategic", "Tier 2 — Growth", "Tier 3 — Pilot", "Tier 4 — Exploratory"],
};

/* ---- 5.7 Reports & Dashboards ---- */

const REPORT_TYPES = [
  { key: "avance", name: "Project Progress Report", icon: TrendingUp },
  { key: "riesgos", name: "Risks & Issues Report", icon: AlertTriangle },
  { key: "adopcion", name: "AI Adoption Report", icon: ShieldCheck },
  { key: "satisfaccion", name: "Client Satisfaction Report", icon: HeartHandshake },
  { key: "beneficios", name: "Benefits Realization Report", icon: DollarSign },
];

/* ---- 5.5 Knowledge & Document Management ---- */

const INITIAL_DOCS = {
  "p-fenix": [
    { id: 1, name: "Project Plan — v3", type: "Plan", date: "Jul 02, 2026", version: "v3" },
    { id: 2, name: "Kickoff Minutes", type: "Minutes", date: "Jun 14, 2026", version: "v1" },
  ],
  "p-nebula": [
    { id: 1, name: "Project Plan — v2", type: "Plan", date: "Jun 20, 2026", version: "v2" },
    { id: 2, name: "Data Architecture Report", type: "Report", date: "Jul 01, 2026", version: "v1" },
  ],
  "p-orion": [
    { id: 1, name: "Project Plan — v1", type: "Plan", date: "Jun 28, 2026", version: "v1" },
  ],
  "p-atlas": [
    { id: 1, name: "Closure & Lessons Learned Report", type: "Report", date: "Jul 10, 2026", version: "v1" },
  ],
};

const INITIAL_KNOWLEDGE = [
  { id: 1, title: "How to negotiate staging access with client IT without blocking the pilot", type: "Lesson Learned", tags: ["Governance", "Access"], project: "Project Phoenix" },
  { id: 2, title: "Change readiness assessment template (TCF)", type: "Template", tags: ["Change", "TCF"], project: "Global" },
  { id: 3, title: "Data architecture kickoff checklist before Execution", type: "Best Practice", tags: ["Risks", "Architecture"], project: "Project Nebula" },
  { id: 4, title: "Code copilot fundamentals workshop script", type: "Template", tags: ["Training"], project: "Global" },
  { id: 5, title: "TCF practice naming standard by paradigm", type: "Standard", tags: ["TCF", "Documentation"], project: "Global" },
];

/* ============================== UI PRIMITIVES ============================== */

function RagDot({ level, size = 9 }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: RAG[level].hex, display: "inline-block" }} />;
}

function RagBadge({ level }) {
  const r = RAG[level];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, background: r.bg, color: r.hex, fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 500 }}>
      <RagDot level={level} size={7} /> {r.label}
    </span>
  );
}

function ConfidenceBadge({ level }) {
  const c = CONFIDENCE[level];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 999, background: c.bg, color: c.hex, fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 500 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.hex, display: "inline-block" }} />
      {level}
    </span>
  );
}

function BreakevenChart({ series, breakevenMonth, width = 720, height = 200 }) {
  const maxVal = Math.max(...series.map((p) => Math.max(p.investment, p.benefit)), 1);
  const padL = 60, padR = 20, padT = 16, padB = 28;
  const innerW = width - padL - padR, innerH = height - padT - padB;
  const maxMonth = series[series.length - 1].month;

  const x = (m) => padL + (m / maxMonth) * innerW;
  const y = (v) => padT + innerH - (v / maxVal) * innerH;

  const linePath = (key) =>
    series.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.month).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(" ");

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => padT + innerH * (1 - f));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block" }}>
      {gridLines.map((gy, i) => (
        <line key={i} x1={padL} x2={width - padR} y1={gy} y2={gy} stroke="#F1F5F9" strokeWidth={1} />
      ))}
      <text x={padL - 8} y={padT + 4} textAnchor="end" fontSize="10" fontFamily="Fira Code, monospace" fill="#94A3B8">{usd(maxVal)}</text>
      <text x={padL - 8} y={padT + innerH + 4} textAnchor="end" fontSize="10" fontFamily="Fira Code, monospace" fill="#94A3B8">USD 0</text>

      <path d={linePath("investment")} fill="none" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5,4" />
      <path d={linePath("benefit")} fill="none" stroke="#F97316" strokeWidth={2.5} />

      {breakevenMonth != null && (
        <>
          <line x1={x(breakevenMonth)} x2={x(breakevenMonth)} y1={padT} y2={padT + innerH} stroke="#10B981" strokeWidth={1.5} strokeDasharray="3,3" />
          <text x={x(breakevenMonth) + 6} y={padT + 12} fontSize="11" fontFamily="Inter, sans-serif" fontWeight="600" fill="#0F6B45">
            Breakeven: month {breakevenMonth.toFixed(1)}
          </text>
        </>
      )}

      {series.filter((p) => p.month % Math.max(1, Math.round(maxMonth / 6)) === 0).map((p) => (
        <text key={p.month} x={x(p.month)} y={height - 8} textAnchor="middle" fontSize="10" fontFamily="Fira Code, monospace" fill="#94A3B8">
          M{p.month}
        </text>
      ))}
    </svg>
  );
}

function Card({ children, style }) {
  return <div className="ds-card" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20, transition: "border-color .15s ease, box-shadow .15s ease", ...style }}>{children}</div>;
}

function KpiCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <Card style={{ flex: 1, minWidth: 150 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#0F172A", marginTop: 6 }}>{value}</div>
          {sub && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} color={accent} />
        </div>
      </div>
    </Card>
  );
}

function Btn({ onClick, children, icon: Icon, variant = "primary", small }) {
  const styles = {
    primary: { background: "#F97316", color: "#fff", border: "1px solid #F97316" },
    ghost: { background: "#fff", color: "#0F172A", border: "1px solid #E2E8F0" },
    danger: { background: "#fff", color: "#dc2626", border: "1px solid #FBD5D5" },
  }[variant];
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
        padding: small ? "6px 10px" : "9px 16px", borderRadius: 9, fontFamily: "'Inter', sans-serif",
        fontWeight: 600, fontSize: small ? 12.5 : 13.5, ...styles,
      }}
    >
      {Icon && <Icon size={small ? 13 : 15} />}
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#475569", fontWeight: 600 }}>
      {label}
      {children}
    </label>
  );
}

const inputStyle = {
  padding: "9px 11px", borderRadius: 8, border: "1px solid #E2E8F0", fontFamily: "'Inter', sans-serif",
  fontSize: 13.5, color: "#0F172A", outline: "none", background: "#fff",
};

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0F172Acc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 26, width: "100%", maxWidth: 460, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: "#0F172A" }}>{title}</div>
          <X size={18} color="#94A3B8" style={{ cursor: "pointer" }} onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

function NavItem({ active, onClick, icon: Icon, label }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 11, padding: "10px 14px 10px 11px", borderRadius: 7, cursor: "pointer",
        borderLeft: active ? "3px solid #F97316" : "3px solid transparent",
        background: active ? "rgba(249,115,22,0.12)" : "transparent",
        color: active ? "#F8FAFC" : "#94A3B8",
        fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13.5,
        transition: "all .15s ease",
      }}
    >
      <Icon size={16} />
      {label}
    </div>
  );
}

/* ============================== APP SHELL ============================== */

export default function App() {
  const [view, setView] = useState("resumen");
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [programs, setPrograms] = useState(INITIAL_PROGRAMS);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [ridaByProject, setRidaByProject] = useState(INITIAL_RIDA);
  const [people, setPeople] = useState(INITIAL_PEOPLE);
  const [practicesByProject, setPracticesByProject] = useState(buildInitialPractices());
  const [doraByProject] = useState(INITIAL_DORA);
  const [changeByProject, setChangeByProject] = useState(INITIAL_CHANGE);
  const [kpisByProject, setKpisByProject] = useState(INITIAL_KPIS);
  const [investmentByProject, setInvestmentByProject] = useState(INITIAL_INVESTMENT);
  const [timeSavedByProject, setTimeSavedByProject] = useState(INITIAL_TIME_SAVED);
  const [docsByProject, setDocsByProject] = useState(INITIAL_DOCS);
  const [knowledge, setKnowledge] = useState(INITIAL_KNOWLEDGE);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [catalogs, setCatalogs] = useState(INITIAL_CATALOGS);
  const [baselineByProject, setBaselineByProject] = useState(INITIAL_BASELINES);
  const [updatesByProject, setUpdatesByProject] = useState(INITIAL_UPDATES);
  const [reportNotesByProject, setReportNotesByProject] = useState(INITIAL_REPORT_NOTES);
  const [openProjectId, setOpenProjectId] = useState(null);
  const [modal, setModal] = useState(null); // 'client' | 'program' | 'project' | null

  const clientName = (id) => clients.find((c) => c.id === id)?.name || "—";
  const programName = (id) => programs.find((p) => p.id === id)?.name || "—";

  const openProject = projects.find((p) => p.id === openProjectId);

  const recomputeRag = (projectId, overrides = {}) => {
    const project = projects.find((p) => p.id === projectId);
    const baseline = overrides.baseline || baselineByProject[projectId];
    const practices = overrides.practices || practicesByProject[projectId];
    const ridaRedCount = (ridaByProject[projectId] || []).filter((r) => r.severity === "red").length;
    const weightedPct = computeWeightedProgress(practices, baseline?.stageWeights);
    const sched = computeScheduleStatus(baseline, project.monthsElapsed, weightedPct);
    const calculated = sched ? computeCalculatedRag(sched.variance, ridaRedCount) : project.ragCalculated;
    setProjects((s) => s.map((p) => (p.id === projectId ? { ...p, ragCalculated: calculated } : p)));
  };

  const togglePracticeFor = (projectId, stageKey, practiceId) => {
    const newStageList = practicesByProject[projectId][stageKey].map((pr) => (pr.id === practiceId ? { ...pr, closed: !pr.closed } : pr));
    const newPractices = { ...practicesByProject[projectId], [stageKey]: newStageList };
    setPracticesByProject((s) => ({ ...s, [projectId]: newPractices }));
    recomputeRag(projectId, { practices: newPractices });
  };

  const updateBaselineFor = (projectId, next) => {
    setBaselineByProject((s) => ({ ...s, [projectId]: next }));
    recomputeRag(projectId, { baseline: next });
  };

  const submitWeeklyUpdate = (projectId, update) => {
    setUpdatesByProject((s) => ({ ...s, [projectId]: [...(s[projectId] || []), { id: Date.now(), ...update }] }));
    setProjects((s) => s.map((p) => (p.id === projectId ? { ...p, ragReported: update.selfReportedRag } : p)));
    recomputeRag(projectId, {});
  };

  const nav = [
    { key: "resumen", label: "Overview", icon: LayoutGrid },
    { key: "programas", label: "Programs", icon: Boxes },
    { key: "proyectos", label: "Projects", icon: FolderKanban },
    { key: "cambio", label: "Change & Adoption", icon: HeartHandshake },
    { key: "metricas", label: "Value & Metrics", icon: Target },
    { key: "conocimiento", label: "Knowledge", icon: BookOpen },
    { key: "recursos", label: "Resources", icon: UserCog },
    { key: "reportes", label: "Reports & Dashboards", icon: BarChart3 },
    { key: "administracion", label: "Administration", icon: Settings },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter', sans-serif", display: "flex" }}>
      <style>{FONTS}{`
        :root {
          --bg-primary: #F8FAFC;
          --bg-surface: #FFFFFF;
          --bg-surface-2: #F1F5F9;
          --border: #E2E8F0;
          --border-2: #CBD5E1;
          --text: #0F172A;
          --text-muted: #475569;
          --text-dim: #94A3B8;
          --accent: #F97316;
          --sidebar-bg: #0F172A;
          --sidebar-border: #1E293B;
          --sidebar-text: #94A3B8;
          --sidebar-active: #F8FAFC;
          --sidebar-accent: #F97316;
          --sidebar-section: #334155;
          --rag-green: #10B981;
          --rag-amber: #F59E0B;
          --rag-red: #dc2626;
          --sidebar-width: 220px;
          --header-height: 56px;
        }
        * { box-sizing: border-box; }
        button:focus-visible, [tabindex]:focus-visible { outline: 2px solid #F97316; outline-offset: 2px; }
        .ds-card:hover { border-color: #F97316 !important; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08); }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: 220, background: "#0F172A", padding: "22px 14px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px", marginBottom: 22 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#F97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Radio size={15} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", lineHeight: 1.15 }}>Mira for<br />AI Adoption</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9.5, color: "#94A3B8" }}>PMO COMMAND CENTER</div>
          </div>
        </div>
        {nav.map((n) => (
          <NavItem key={n.key} active={view === n.key} onClick={() => { setView(n.key); setOpenProjectId(null); }} icon={n.icon} label={n.label} />
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: "28px 32px", maxWidth: 1180 }}>
        {view === "resumen" && <ResumenView clients={clients} programs={programs} projects={projects} practicesByProject={practicesByProject} clientName={clientName} setView={setView} setOpenProjectId={setOpenProjectId} />}
        {view === "programas" && <ProgramasView programs={programs} projects={projects} clients={clients} clientName={clientName} setModal={setModal} setView={setView} setOpenProjectId={setOpenProjectId} />}
        {view === "proyectos" && !openProject && (
          <ProyectosView projects={projects} clients={clients} programs={programs} clientName={clientName} programName={programName} setModal={setModal} setOpenProjectId={setOpenProjectId} />
        )}
        {view === "proyectos" && openProject && (
          <ProyectoDetalle
            project={openProject} clientName={clientName} programName={programName}
            rida={ridaByProject[openProject.id] || []}
            setRida={(next) => setRidaByProject((s) => ({ ...s, [openProject.id]: next }))}
            people={people}
            practices={practicesByProject[openProject.id]}
            dora={doraByProject[openProject.id]}
            togglePractice={(stageKey, practiceId) => togglePracticeFor(openProject.id, stageKey, practiceId)}
            addWorkshop={(stageKey, practiceId, workshop) =>
              setPracticesByProject((s) => ({
                ...s,
                [openProject.id]: {
                  ...s[openProject.id],
                  [stageKey]: s[openProject.id][stageKey].map((pr) =>
                    pr.id === practiceId ? { ...pr, workshops: [...(pr.workshops || []), { id: Date.now(), ...workshop }] } : pr
                  ),
                },
              }))
            }
            change={changeByProject[openProject.id]}
            setChange={(next) => setChangeByProject((s) => ({ ...s, [openProject.id]: next }))}
            kpiData={kpisByProject[openProject.id]}
            setKpiData={(next) => setKpisByProject((s) => ({ ...s, [openProject.id]: next }))}
            investment={investmentByProject[openProject.id] || []}
            setInvestment={(next) => setInvestmentByProject((s) => ({ ...s, [openProject.id]: next }))}
            timeSaved={timeSavedByProject[openProject.id]}
            setTimeSaved={(next) => setTimeSavedByProject((s) => ({ ...s, [openProject.id]: next }))}
            docs={docsByProject[openProject.id] || []}
            setDocs={(next) => setDocsByProject((s) => ({ ...s, [openProject.id]: next }))}
            baseline={baselineByProject[openProject.id]}
            setBaseline={(next) => updateBaselineFor(openProject.id, next)}
            updates={updatesByProject[openProject.id] || []}
            onSubmitUpdate={(update) => submitWeeklyUpdate(openProject.id, update)}
            onBack={() => setOpenProjectId(null)}
          />
        )}
        {view === "cambio" && !openProject && (
          <CambioPortfolioView projects={projects} clientName={clientName} changeByProject={changeByProject} setOpenProjectId={setOpenProjectId} setView={setView} />
        )}
        {view === "metricas" && !openProject && (
          <MetricasPortfolioView projects={projects} clientName={clientName} kpisByProject={kpisByProject} investmentByProject={investmentByProject} baselineByProject={baselineByProject} setOpenProjectId={setOpenProjectId} setView={setView} />
        )}
        {view === "conocimiento" && (
          <ConocimientoView knowledge={knowledge} setKnowledge={setKnowledge} />
        )}
        {view === "recursos" && <RecursosView people={people} projects={projects} />}
        {view === "reportes" && (
          <ReportesView
            projects={projects} clients={clients} programs={programs} programName={programName} clientName={clientName}
            ridaByProject={ridaByProject} practicesByProject={practicesByProject} kpisByProject={kpisByProject} changeByProject={changeByProject}
            baselineByProject={baselineByProject} doraByProject={doraByProject}
            reportNotesByProject={reportNotesByProject}
            setReportNotes={(projectId, next) => setReportNotesByProject((s) => ({ ...s, [projectId]: next }))}
            setView={setView} setOpenProjectId={setOpenProjectId}
          />
        )}
        {view === "administracion" && (
          <AdministracionView users={users} setUsers={setUsers} catalogs={catalogs} setCatalogs={setCatalogs} clients={clients} projects={projects} setModal={setModal} />
        )}
      </div>

      {modal === "cliente" && (
        <Modal title="New Client" onClose={() => setModal(null)}>
          <FormCliente onSave={(c) => { setClients((s) => [...s, c]); setModal(null); }} />
        </Modal>
      )}
      {modal === "programa" && (
        <Modal title="New Program / Portfolio" onClose={() => setModal(null)}>
          <FormPrograma clients={clients} onSave={(p) => { setPrograms((s) => [...s, p]); setModal(null); }} />
        </Modal>
      )}
      {modal === "proyecto" && (
        <Modal title="New Project" onClose={() => setModal(null)}>
          <FormProyecto
            clients={clients} programs={programs}
            onSave={(p) => {
              setProjects((s) => [...s, p]);
              setRidaByProject((s) => ({ ...s, [p.id]: [] }));
              setPracticesByProject((s) => ({
                ...s,
                [p.id]: Object.fromEntries(TCF_STAGES.map((st) => [st.key, makePractices(st, 0)])),
              }));
              setChangeByProject((s) => ({ ...s, [p.id]: { space: { s: { level: "Medium", trend: "stable", note: "" }, p: { level: "Medium", trend: "stable", note: "" }, a: { level: "Medium", trend: "stable", note: "" }, c: { level: "Medium", trend: "stable", note: "" }, e: { level: "Medium", trend: "stable", note: "" } }, resistances: [], comms: [], trainings: [] } }));
              setKpisByProject((s) => ({ ...s, [p.id]: { stakeholderSatisfaction: 0, benefitExpected: 0, benefitRealized: 0 } }));
              setDocsByProject((s) => ({ ...s, [p.id]: [] }));
              setBaselineByProject((s) => ({
                ...s,
                [p.id]: {
                  locked: false, durationMonths: 12, stageWeights: { ...DEFAULT_STAGE_WEIGHTS },
                  committedDate: "", riskNotes: "",
                },
              }));
              setUpdatesByProject((s) => ({ ...s, [p.id]: [] }));
              setModal(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

/* ============================== RESUMEN ============================== */

function ResumenView({ clients, programs, projects, practicesByProject, clientName, setView, setOpenProjectId }) {
  const kpis = useMemo(() => {
    const atRisk = projects.filter((p) => p.ragCalculated !== "green").length;
    let closed = 0, possible = 0;
    projects.forEach((p) => {
      const pr = practicesByProject[p.id];
      if (!pr) return;
      TCF_STAGES.forEach((st) => { closed += pr[st.key].filter((x) => x.closed).length; possible += st.total; });
    });
    return {
      clients: clients.length, programs: programs.length, projects: projects.length,
      atRisk, tcfPct: possible ? Math.round((closed / possible) * 100) : 0,
    };
  }, [clients, programs, projects, practicesByProject]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#F97316", fontWeight: 500, marginBottom: 4 }}>PORTFOLIO & PROJECT MANAGEMENT MODULE</div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 25, color: "#0F172A", margin: 0 }}>Portfolio Overview</h1>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <KpiCard label="Clients" value={kpis.clients} icon={Users} accent="#F97316" />
        <KpiCard label="Programs" value={kpis.programs} icon={Boxes} accent="#F97316" />
        <KpiCard label="Active Projects" value={kpis.projects} icon={FolderKanban} accent="#F97316" />
        <KpiCard label="At Risk" value={kpis.atRisk} icon={AlertTriangle} accent="#F59E0B" />
        <KpiCard label="Adoption Map (portfolio)" value={`${kpis.tcfPct}%`} icon={ShieldCheck} accent="#10B981" />
      </div>

      <Card>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A", marginBottom: 14 }}>Projects</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {projects.map((p, i) => (
            <div
              key={p.id}
              onClick={() => { setView("proyectos"); setOpenProjectId(p.id); }}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 4px", borderTop: i > 0 ? "1px solid #E2E8F0" : "none", cursor: "pointer" }}
            >
              <RagDot level={p.ragCalculated} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13.5, color: "#0F172A" }}>{p.name}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569" }}>{clientName(p.clientId)} · PM: {p.pm} · Month {p.monthsElapsed}/{TOTAL_MONTHS}</div>
              </div>
              <ChevronRight size={15} color="#94A3B8" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function FormCliente({ onSave }) {
  const [name, setName] = useState("");
  const [tier, setTier] = useState("Tier 1 — Strategic");
  const [contact, setContact] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Client name"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g. Nortek Solutions" /></Field>
      <Field label="TCF Tier">
        <select style={inputStyle} value={tier} onChange={(e) => setTier(e.target.value)}>
          <option>Tier 1 — Strategic</option>
          <option>Tier 2 — Growth</option>
          <option>Tier 3 — Pilot</option>
          <option>Tier 4 — Exploratory</option>
        </select>
      </Field>
      <Field label="Primary contact"><input style={inputStyle} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Name · Role" /></Field>
      <Btn onClick={() => name && onSave({ id: `cl-${Date.now()}`, name, tier, contact })}>Save Client</Btn>
    </div>
  );
}

/* ============================== PROGRAMS ============================== */

function ProgramasView({ programs, projects, clients, clientName, setModal, setView, setOpenProjectId }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: "#0F172A", margin: 0 }}>Programs / Portfolios</h1>
        <Btn icon={Plus} onClick={() => setModal("programa")}>New Program</Btn>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {programs.map((prog) => {
          const progProjects = projects.filter((p) => p.programId === prog.id);
          const worst = progProjects.reduce((acc, p) => {
            const order = { green: 0, amber: 1, red: 2 };
            return order[p.ragCalculated] > order[acc] ? p.ragCalculated : acc;
          }, "green");
          return (
            <Card key={prog.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#94A3B8" }}>{clientName(prog.clientId)}</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, color: "#0F172A", marginTop: 2 }}>{prog.name}</div>
                </div>
                {progProjects.length > 0 && <RagBadge level={worst} />}
              </div>
              <div style={{ display: "flex", flexDirection: "column", marginTop: 14 }}>
                {progProjects.length === 0 && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94A3B8" }}>No projects associated yet.</div>}
                {progProjects.map((p, i) => (
                  <div
                    key={p.id}
                    onClick={() => { setView("proyectos"); setOpenProjectId(p.id); }}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: i > 0 ? "1px solid #E2E8F0" : "none", cursor: "pointer" }}
                  >
                    <RagDot level={p.ragCalculated} size={7} />
                    <div style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0F172A" }}>{p.name}</div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#475569" }}>PM: {p.pm}</div>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function FormPrograma({ clients, onSave }) {
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Program name"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g. AI Adoption — Nortek" /></Field>
      <Field label="Client">
        <select style={inputStyle} value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <Btn onClick={() => name && onSave({ id: `prog-${Date.now()}`, name, clientId })}>Save Program</Btn>
    </div>
  );
}

/* ============================== PROJECTS (list) ============================== */

function ProyectosView({ projects, clients, programs, clientName, programName, setModal, setOpenProjectId }) {
  const [filterClient, setFilterClient] = useState("all");
  const filtered = filterClient === "all" ? projects : projects.filter((p) => p.clientId === filterClient);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: "#0F172A", margin: 0 }}>Projects</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <select style={{ ...inputStyle, padding: "8px 10px" }} value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
            <option value="all">All clients</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Btn icon={Plus} onClick={() => setModal("proyecto")}>New Project</Btn>
        </div>
      </div>
      <Card style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F1F5F9" }}>
              {["Project", "Client", "Program", "PM", "Month", "Status"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} onClick={() => setOpenProjectId(p.id)} style={{ borderTop: i > 0 ? "1px solid #E2E8F0" : "none", cursor: "pointer" }}>
                <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 9, fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13.5, color: "#0F172A" }}>
                  <RagDot level={p.ragCalculated} size={8} /> {p.name}
                </td>
                <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#475569" }}>{clientName(p.clientId)}</td>
                <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#475569" }}>{programName(p.programId)}</td>
                <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0F172A" }}>{p.pm}</td>
                <td style={{ padding: "12px 16px", fontFamily: "'Fira Code', monospace", fontSize: 12.5, color: "#475569" }}>{p.monthsElapsed}/{TOTAL_MONTHS}</td>
                <td style={{ padding: "12px 16px" }}>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function FormProyecto({ clients, programs, onSave }) {
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [programId, setProgramId] = useState(programs[0]?.id || "");
  const [pm, setPm] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Project name"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g. Project Helios" /></Field>
      <Field label="Client">
        <select style={inputStyle} value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Program">
        <select style={inputStyle} value={programId} onChange={(e) => setProgramId(e.target.value)}>
          {programs.filter((p) => p.clientId === clientId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>
      <Field label="Project Manager"><input style={inputStyle} value={pm} onChange={(e) => setPm(e.target.value)} placeholder="PM name" /></Field>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#FDF1E7", border: "1px solid #FBE0C4", borderRadius: 8, padding: "10px 12px" }}>
        <Info size={14} color="#F97316" style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9A3412" }}>
          The project will be created with the standard predictive phase template (Initiation → Planning → Execution → Monitoring → Closure) at month 0 of 12.
        </div>
      </div>
      <Btn onClick={() => name && pm && onSave({
        id: `p-${Date.now()}`, name, clientId, programId, pm, status: "Active", monthsElapsed: 0,
        ragCalculated: "green", ragReported: "green", satisfaction: 0,
      })}>Save Project</Btn>
    </div>
  );
}

/* ============================== PROJECT DETAIL ============================== */

function ProyectoDetalle({ project, clientName, programName, rida, setRida, people, practices, togglePractice, addWorkshop, dora, change, setChange, kpiData, setKpiData, investment, setInvestment, timeSaved, setTimeSaved, docs, setDocs, baseline, setBaseline, updates, onSubmitUpdate, onBack }) {
  const [tab, setTab] = useState("fases");
  const phases = buildPhases(project.monthsElapsed);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#F97316", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 12 }}>
          ← Back to projects
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#F97316" }}>{clientName(project.clientId)} · {programName(project.programId)}</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, color: "#0F172A", margin: "4px 0 0" }}>{project.name}</h1>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#475569", marginTop: 4 }}>PM: {project.pm} · Methodology: Predictive · Month {project.monthsElapsed} of {TOTAL_MONTHS}</div>
          </div>
          <RagBadge level={project.ragCalculated} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #E2E8F0", flexWrap: "wrap" }}>
        {[
          ["fases", "Phases (Predictive)"], ["baseline", "Baseline & Progress"], ["rida", "RIDA"], ["cambio", "Change & Adoption"],
          ["tcf", "Adoption Map"], ["metricas", "Value & Metrics"], ["documentos", "Documents"], ["recursos", "Resources"],
        ].map(([key, label]) => (
          <div
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "10px 4px", marginRight: 16, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13,
              color: tab === key ? "#F97316" : "#475569", borderBottom: tab === key ? "2px solid #F97316" : "2px solid transparent", whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {tab === "fases" && <FasesTab phases={phases} monthsElapsed={project.monthsElapsed} practices={practices} />}
      {tab === "baseline" && (
        <BaselineTab
          project={project} baseline={baseline} setBaseline={setBaseline} updates={updates} onSubmitUpdate={onSubmitUpdate}
          ridaRedCount={rida.filter((r) => r.severity === "red").length} practices={practices}
        />
      )}
      {tab === "rida" && <RidaTab rida={rida} setRida={setRida} />}
      {tab === "cambio" && <CambioTab change={change} setChange={setChange} />}
      {tab === "tcf" && <TcfTab practices={practices} monthsElapsed={project.monthsElapsed} togglePractice={togglePractice} addWorkshop={addWorkshop} dora={dora} onSpacePulse={(pulse, pcts) => {
          // Auto-derive P from DORA CFR
          const cfrLevel = dora?.changeFailureRate?.level;
          const pLevel = (cfrLevel === "Elite" || cfrLevel === "High") ? "High" : cfrLevel === "Medium" ? "Medium" : "Low";
          // Auto-derive A from practice completion %
          const totalClosed = Object.values(pcts).flat().filter((p) => p.closed).length;
          const totalPossible = TCF_STAGES.reduce((s, st) => s + st.total, 0);
          const aRatio = totalPossible ? totalClosed / totalPossible : 0;
          const aLevel = aRatio > 0.7 ? "High" : aRatio > 0.4 ? "Medium" : "Low";
          // Trend: compare new vs existing
          const existing = change?.space || {};
          const n = { Low: 1, Medium: 2, High: 3 };
          const trend = (oldLvl, newLvl) => n[newLvl] > n[oldLvl || "Medium"] ? "improving" : n[newLvl] < n[oldLvl || "Medium"] ? "declining" : "stable";
          const mk = (key, newLvl) => ({ level: newLvl, trend: trend(existing[key]?.level, newLvl), note: existing[key]?.note || "" });
          setChange({ ...change, space: {
            s: pulse.s ? mk("s", pulse.s) : (existing.s || { level: "Medium", trend: "stable", note: "" }),
            c: pulse.c ? mk("c", pulse.c) : (existing.c || { level: "Medium", trend: "stable", note: "" }),
            e: pulse.e ? mk("e", pulse.e) : (existing.e || { level: "Medium", trend: "stable", note: "" }),
            p: mk("p", pLevel),
            a: mk("a", aLevel),
          }});
        }} />}
      {tab === "metricas" && <MetricasTab kpiData={kpiData} setKpiData={setKpiData} project={project} baseline={baseline} investment={investment} setInvestment={setInvestment} timeSaved={timeSaved} setTimeSaved={setTimeSaved} />}
      {tab === "documentos" && <DocumentosTab docs={docs} setDocs={setDocs} />}
      {tab === "recursos" && <RecursosTab people={people} projectId={project.id} />}
    </div>
  );
}

function FasesTab({ phases, monthsElapsed, practices }) {
  const [showStages, setShowStages] = useState(true);
  const stagesData = practices ? computeStagesData(practices, monthsElapsed) : null;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>Predictive Schedule (12 months)</div>
        <div style={{ display: "flex", gap: 16, fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 8, borderRadius: 2, background: "#F97316", display: "inline-block" }} /> Critical path</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 8, borderRadius: 2, background: "#E2E8F0", display: "inline-block" }} /> With slack</span>
        </div>
      </div>

      <div style={{ display: "flex", fontFamily: "'Fira Code', monospace", fontSize: 10.5, color: "#94A3B8", marginBottom: 6, paddingLeft: 170 }}>
        {Array.from({ length: 12 }, (_, i) => <div key={i} style={{ flex: 1, textAlign: "left" }}>M{i + 1}</div>)}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {phases.map((ph) => (
          <React.Fragment key={ph.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 160, flexShrink: 0, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#0F172A", fontWeight: ph.status === "current" ? 600 : 500, display: "flex", alignItems: "center", gap: 6 }}>
                {ph.name}
                {ph.id === "ejecucion" && stagesData && (
                  <span onClick={() => setShowStages((s) => !s)} style={{ cursor: "pointer", display: "flex", color: "#F97316" }} title="View Adoption Map detail by Stage">
                    <ChevronRight size={13} style={{ transform: showStages ? "rotate(90deg)" : "none" }} />
                  </span>
                )}
              </div>
              <div style={{ position: "relative", flex: 1, height: 22, background: "#F8FAFC", borderRadius: 5 }}>
                <div
                  title={`${ph.name}: month ${ph.startMonth}–${ph.endMonth}`}
                  style={{
                    position: "absolute", top: 2, bottom: 2,
                    left: `${(ph.startMonth / 12) * 100}%`, width: `${((ph.endMonth - ph.startMonth) / 12) * 100}%`,
                    background: ph.critical ? "#F97316" : "#E2E8F0",
                    borderRadius: 4,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: ph.status === "pending" ? 0.55 : 1,
                  }}
                >
                  {ph.status === "done" && <CheckCircle2 size={12} color="#fff" />}
                </div>
                <div style={{ position: "absolute", top: -2, bottom: -2, left: `${(monthsElapsed / 12) * 100}%`, width: 2, background: "#dc2626" }} title={`Current month: ${monthsElapsed}`} />
              </div>
            </div>

            {ph.id === "ejecucion" && stagesData && showStages && (
              <div style={{ marginLeft: 170, marginBottom: 6, padding: "12px 14px", background: "#F9FAFB", borderRadius: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#94A3B8", fontWeight: 600, marginBottom: 2 }}>
                  <Rocket size={12} color="#F97316" /> ADOPTION MAP BY STAGE — fed by what the PM logs in "Adoption Map"
                </div>
                {stagesData.map((st) => {
                  const pct = st.total ? Math.round((st.closed / st.total) * 100) : 0;
                  const onPace = st.closed >= st.expected;
                  return (
                    <div key={st.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 140, flexShrink: 0, fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#0F172A" }}>
                        Stage {st.key} · {st.name}
                      </div>
                      <div style={{ position: "relative", flex: 1, height: 8, background: "#E2E8F0", borderRadius: 4 }}>
                        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: onPace ? "#10B981" : "#F59E0B" }} />
                        <div style={{ position: "absolute", top: -2, bottom: -2, left: `${st.total ? (st.expected / st.total) * 100 : 0}%`, width: 2, background: "#94A3B8" }} title={`Expected target: ${st.expected}`} />
                      </div>
                      <div style={{ width: 90, textAlign: "right", fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#475569", flexShrink: 0 }}>
                        {st.closed}/{st.total} · {pct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#94A3B8" }}>
        <span style={{ width: 2, height: 12, background: "#dc2626", display: "inline-block" }} /> Red line: current month of the project
      </div>
    </Card>
  );
}

/* ============================== BASELINE & PROGRESS (tab) ============================== */

function BaselineTab({ project, baseline, setBaseline, updates, onSubmitUpdate, ridaRedCount, practices }) {
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [draft, setDraft] = useState({ week: "", selfReportedRag: "green", comment: "" });

  if (!baseline) return <Card><div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#475569" }}>No baseline defined for this project yet.</div></Card>;

  const stagesProgress = TCF_STAGES.map((st) => {
    const list = (practices && practices[st.key]) || [];
    const pct = list.length ? Math.round((list.filter((p) => p.closed).length / list.length) * 100) : 0;
    return { ...st, pct, weight: baseline.stageWeights[st.key] || 0 };
  });
  const weightTotal = stagesProgress.reduce((s, st) => s + st.weight, 0);
  const weightedPct = computeWeightedProgress(practices, baseline.stageWeights);
  const sched = computeScheduleStatus(baseline, project.monthsElapsed, weightedPct);

  const toggleLock = () => setBaseline({ ...baseline, locked: !baseline.locked });
  const setDuration = (months) => setBaseline({ ...baseline, durationMonths: months });
  const setWeight = (stageKey, value) => setBaseline({ ...baseline, stageWeights: { ...baseline.stageWeights, [stageKey]: Math.max(0, Number(value) || 0) } });
  const setCommittedDate = (value) => setBaseline({ ...baseline, committedDate: value });
  const setRiskNotes = (value) => setBaseline({ ...baseline, riskNotes: value });
  const setReported = (level) => onSubmitUpdate({ week: `Week of ${new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}`, selfReportedRag: level, comment: "(status updated)" });

  const submitUpdate = () => {
    if (!draft.comment) return;
    onSubmitUpdate({
      week: draft.week || `Week of ${new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}`,
      selfReportedRag: draft.selfReportedRag, comment: draft.comment,
    });
    setDraft({ week: "", selfReportedRag: "green", comment: "" });
    setShowUpdateForm(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Anchor size={16} color="#F97316" />
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>Project Scope — 6 TCF Stages</div>
          </div>
          <button
            onClick={toggleLock}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, cursor: "pointer",
              fontFamily: "'Fira Code', monospace", fontSize: 11.5, fontWeight: 500,
              border: baseline.locked ? "1px solid #FBE0C4" : "1px solid #E2E8F0",
              background: baseline.locked ? "#FDF1E7" : "#fff", color: baseline.locked ? "#F97316" : "#475569",
            }}
          >
            <Lock size={12} /> {baseline.locked ? "Locked (approved)" : "Unlocked · editable"}
          </button>
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8", marginBottom: 16 }}>
          Scope is the complete delivery of the 6 TCF Stages within a PM-configurable duration. Each Stage carries an editable weight; the weights must always sum to 100%. No cost/budget is tracked anywhere in this model.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#475569", fontWeight: 600 }}>Target duration:</span>
          {[6, 12].map((m) => (
            <button
              key={m}
              disabled={baseline.locked}
              onClick={() => setDuration(m)}
              style={{
                padding: "6px 14px", borderRadius: 999, cursor: baseline.locked ? "default" : "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12.5,
                border: baseline.durationMonths === m ? "1px solid #F97316" : "1px solid #E2E8F0",
                background: baseline.durationMonths === m ? "#FDF1E7" : "#fff", color: baseline.durationMonths === m ? "#F97316" : "#475569",
                opacity: baseline.locked && baseline.durationMonths !== m ? 0.5 : 1,
              }}
            >
              {m} months
            </button>
          ))}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F1F5F9" }}>
              {["Stage", "Weight (%)", "TCF Completion", "Contribution"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#475569", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stagesProgress.map((st, i) => (
              <tr key={st.key} style={{ borderTop: i > 0 ? "1px solid #E2E8F0" : "none" }}>
                <td style={{ padding: "8px 12px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0F172A" }}>Stage {st.key} · {st.name}</td>
                <td style={{ padding: "8px 12px" }}>
                  <input
                    style={{ ...inputStyle, width: 80, padding: "5px 8px" }} disabled={baseline.locked} value={st.weight}
                    onChange={(e) => setWeight(st.key, e.target.value)}
                  />
                </td>
                <td style={{ padding: "8px 12px", fontFamily: "'Fira Code', monospace", fontSize: 12.5, color: "#475569" }}>{st.pct}% ({st.list ? st.list.filter((p) => p.closed).length : 0}/{st.total} practices)</td>
                <td style={{ padding: "8px 12px", fontFamily: "'Fira Code', monospace", fontSize: 12.5, color: "#0F172A" }}>{((st.weight * st.pct) / 100).toFixed(1)} pts</td>
              </tr>
            ))}
            <tr style={{ borderTop: "2px solid #E2E8F0" }}>
              <td style={{ padding: "8px 12px", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, color: "#0F172A" }}>Total</td>
              <td style={{ padding: "8px 12px", fontFamily: "'Fira Code', monospace", fontWeight: 700, fontSize: 13, color: weightTotal === 100 ? "#10B981" : "#dc2626" }}>
                {weightTotal}% {weightTotal !== 100 && "⚠"}
              </td>
              <td></td>
              <td style={{ padding: "8px 12px", fontFamily: "'Fira Code', monospace", fontWeight: 700, fontSize: 13, color: "#0F172A" }}>{Math.round(weightedPct)}%</td>
            </tr>
          </tbody>
        </table>
        {weightTotal !== 100 && (
          <div style={{ marginTop: 8, fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#dc2626" }}>
            Stage weights must sum to 100% (currently {weightTotal}%). Adjust before locking the scope.
          </div>
        )}
      </Card>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <ShieldCheck size={16} color="#F97316" />
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>Project Status</div>
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8", marginBottom: 14 }}>
          A simple, predictive, and defensible way to track progress with no budget line: status, commitment date, and risk notes.
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#94A3B8", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>Reported Status</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["green", "amber", "red"].map((level) => (
                <div
                  key={level}
                  onClick={() => setReported(level)}
                  title={RAG[level].label}
                  style={{
                    width: 30, height: 30, borderRadius: "50%", cursor: "pointer",
                    background: project.ragReported === level ? RAG[level].hex : "#E2E8F0",
                    border: project.ragReported === level ? `2px solid ${RAG[level].hex}` : "2px solid transparent",
                    boxShadow: project.ragReported === level ? `0 0 0 3px ${RAG[level].bg}` : "none",
                    transition: "all .15s ease",
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <Field label="Committed date (full scope)">
              <input type="date" style={{ ...inputStyle, width: 200 }} value={baseline.committedDate || ""} onChange={(e) => setCommittedDate(e.target.value)} />
            </Field>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Field label="Risk observations">
            <textarea
              rows={2} style={{ ...inputStyle, width: "100%", resize: "vertical", fontFamily: "'Inter', sans-serif" }}
              value={baseline.riskNotes || ""} onChange={(e) => setRiskNotes(e.target.value)}
              placeholder="Current risk commentary for this project..."
            />
          </Field>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid #E2E8F0" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#0F172A" }}>Status calculated by MIRA (schedule + RIDA)</span>
          <RagBadge level={project.ragCalculated} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#0F172A" }}>Status reported by PM</span>
          <RagBadge level={project.ragReported} />
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <GitCommitHorizontal size={16} color="#F97316" />
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>Weighted Schedule (% progress, no cost)</div>
        </div>
        {sched && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 130, background: "#F1F5F9", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569", fontWeight: 600 }}>% Expected to date</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 18, color: "#0F172A", marginTop: 3 }}>{sched.expectedPct}%</div>
            </div>
            <div style={{ flex: 1, minWidth: 130, background: "#F1F5F9", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569", fontWeight: 600 }}>% Actual (weighted)</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 18, color: "#0F172A", marginTop: 3 }}>{sched.actualPct}%</div>
            </div>
            <div style={{ flex: 1, minWidth: 130, background: sched.variance < 0 ? "#FDEAEA" : "#E5F9F1", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569", fontWeight: 600 }}>Variance</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 18, color: sched.variance < 0 ? "#dc2626" : "#10B981", marginTop: 3 }}>{sched.variance >= 0 ? "+" : ""}{sched.variance} pts</div>
            </div>
            <div style={{ flex: 1, minWidth: 130, background: ridaRedCount > 0 ? "#FDEAEA" : "#F1F5F9", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569", fontWeight: 600 }}>Red RIDA items</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 18, color: ridaRedCount > 0 ? "#dc2626" : "#0F172A", marginTop: 3 }}>{ridaRedCount}</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#94A3B8", marginBottom: 6, paddingLeft: 150 }}>
          {Array.from({ length: baseline.durationMonths }, (_, i) => <div key={i} style={{ flex: 1, textAlign: "left" }}>M{i + 1}</div>)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(() => {
            let cursor = 0;
            return stagesProgress.map((st) => {
              const widthPct = (st.weight / (weightTotal || 100)) * 100;
              const left = cursor;
              cursor += widthPct;
              return (
                <div key={st.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 140, flexShrink: 0, fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#0F172A" }}>Stage {st.key} · {st.name}</div>
                  <div style={{ position: "relative", flex: 1, height: 18, background: "#F8FAFC", borderRadius: 4 }}>
                    <div
                      title={`Stage ${st.key}: ${st.weight}% weight, ${st.pct}% complete`}
                      style={{
                        position: "absolute", top: 1, bottom: 1, left: `${left}%`, width: `${widthPct}%`,
                        background: "#E2E8F0", borderRadius: 3, overflow: "hidden",
                      }}
                    >
                      <div style={{ height: "100%", width: `${st.pct}%`, background: st.pct === 100 ? "#10B981" : "#F97316" }} />
                    </div>
                    <div
                      style={{ position: "absolute", top: -2, bottom: -2, left: `${(project.monthsElapsed / baseline.durationMonths) * 100}%`, width: 2, background: "#dc2626" }}
                      title={`Current month: ${project.monthsElapsed}`}
                    />
                  </div>
                  <div style={{ width: 40, textAlign: "right", fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#475569", flexShrink: 0 }}>{st.pct}%</div>
                </div>
              );
            });
          })()}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#94A3B8" }}>
          <span style={{ width: 2, height: 12, background: "#dc2626", display: "inline-block" }} /> Red line: current month of the project · segment width = Stage weight · fill = TCF completion
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>Weekly Log</div>
          <Btn small icon={Plus} variant="ghost" onClick={() => setShowUpdateForm((s) => !s)}>Log this week</Btn>
        </div>
        {showUpdateForm && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16, padding: 14, background: "#F1F5F9", borderRadius: 10 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input style={{ ...inputStyle, flex: 1, minWidth: 180 }} placeholder="Week (e.g. Week of Jul 14, 2026)" value={draft.week} onChange={(e) => setDraft({ ...draft, week: e.target.value })} />
              <select style={{ ...inputStyle, width: 170 }} value={draft.selfReportedRag} onChange={(e) => setDraft({ ...draft, selfReportedRag: e.target.value })}>
                <option value="green">Self-assessment: Green</option>
                <option value="amber">Self-assessment: Amber</option>
                <option value="red">Self-assessment: Red</option>
              </select>
            </div>
            <input style={inputStyle} placeholder="Status comment" value={draft.comment} onChange={(e) => setDraft({ ...draft, comment: e.target.value })} />
            <div>
              <Btn small onClick={submitUpdate}>Save Update</Btn>
            </div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {updates.length === 0 && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94A3B8" }}>No progress updates logged.</div>}
          {[...updates].reverse().map((u, i) => (
            <div key={u.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 0", borderTop: i > 0 ? "1px solid #E2E8F0" : "none" }}>
              <RagDot level={u.selfReportedRag} size={8} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{u.week}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#475569", marginTop: 2 }}>{u.comment}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RidaTab({ rida, setRida }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ type: "Risk", title: "", owner: "", due: "", severity: "amber" });

  const add = () => {
    if (!draft.title) return;
    setRida([...rida, { id: Date.now(), ...draft }]);
    setDraft({ type: "Risk", title: "", owner: "", due: "", severity: "amber" });
    setShowForm(false);
  };
  const remove = (id) => setRida(rida.filter((r) => r.id !== id));

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>Risks, Issues, Decisions & Actions</div>
        <Btn small icon={Plus} variant="ghost" onClick={() => setShowForm((s) => !s)}>Add</Btn>
      </div>

      {showForm && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, padding: 14, background: "#F1F5F9", borderRadius: 10 }}>
          <select style={{ ...inputStyle, width: 110 }} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
            <option>Risk</option><option>Issue</option><option>Decision</option><option>Action</option>
          </select>
          <input style={{ ...inputStyle, flex: 1, minWidth: 200 }} placeholder="Description" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <input style={{ ...inputStyle, width: 140 }} placeholder="Owner" value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} />
          <input style={{ ...inputStyle, width: 100 }} placeholder="Due" value={draft.due} onChange={(e) => setDraft({ ...draft, due: e.target.value })} />
          <select style={{ ...inputStyle, width: 110 }} value={draft.severity} onChange={(e) => setDraft({ ...draft, severity: e.target.value })}>
            <option value="green">Green</option><option value="amber">Amber</option><option value="red">Red</option>
          </select>
          <Btn small onClick={add}>Save</Btn>
        </div>
      )}

      {rida.length === 0 && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94A3B8" }}>No RIDA items logged.</div>}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rida.map((r, i) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i > 0 ? "1px solid #E2E8F0" : "none" }}>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#475569", width: 60 }}>{r.type}</span>
            <RagDot level={r.severity} size={8} />
            <div style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#0F172A" }}>{r.title}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", width: 120 }}>{r.owner}</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: r.due?.includes("overdue") ? "#dc2626" : "#475569", width: 64, textAlign: "right" }}>{r.due}</div>
            <Trash2 size={14} color="#CBD5E1" style={{ cursor: "pointer" }} onClick={() => remove(r.id)} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecursosTab({ people, projectId }) {
  const assigned = people.filter((p) => p.allocations.some((a) => a.projectId === projectId));
  return (
    <Card>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A", marginBottom: 14 }}>Assigned Resources</div>
      {assigned.length === 0 && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94A3B8" }}>No resources assigned.</div>}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {assigned.map((p, i) => {
          const pct = p.allocations.find((a) => a.projectId === projectId)?.pct || 0;
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 0", borderTop: i > 0 ? "1px solid #E2E8F0" : "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13.5, color: "#0F172A" }}>{p.name}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569" }}>{p.role}</div>
              </div>
              <div style={{ width: 140 }}>
                <div style={{ height: 6, borderRadius: 4, background: "#E2E8F0" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: "#F97316" }} />
                </div>
              </div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12.5, color: "#475569", width: 40, textAlign: "right" }}>{pct}%</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ============================== PRACTICE ROW (Practice → Workshop) ============================== */
/* Implements the spec v2.4 three-level WBS: each Practice expands to show
   its Workshops — the execution unit where the actual work information is
   captured (e.g. initial DORA + Cycle Time values). */

const PULSE_OPTIONS = {
  s: [{ val: "High", label: "😊 Satisfied", color: "#10B981", bg: "#E5F9F1" }, { val: "Medium", label: "😐 Neutral", color: "#F59E0B", bg: "#FEF3E0" }, { val: "Low", label: "😟 Dissatisfied", color: "#dc2626", bg: "#FDEAEA" }],
  c: [{ val: "High", label: "✓ Clear standards", color: "#10B981", bg: "#E5F9F1" }, { val: "Medium", label: "~ Partially clear", color: "#F59E0B", bg: "#FEF3E0" }, { val: "Low", label: "✗ Unclear", color: "#dc2626", bg: "#FDEAEA" }],
  e: [{ val: "High", label: "⚡ No friction", color: "#10B981", bg: "#E5F9F1" }, { val: "Medium", label: "~ Some friction", color: "#F59E0B", bg: "#FEF3E0" }, { val: "Low", label: "✗ High friction", color: "#dc2626", bg: "#FDEAEA" }],
};

function PracticeRow({ practice, onToggleClosed, onAddWorkshop }) {
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ date: "", facilitator: "", participants: "", dataPoints: [{ key: "", value: "" }], spacePulse: { s: null, c: null, e: null } });
  const workshops = practice.workshops || [];

  const updateDataPoint = (i, field, val) => {
    const next = [...draft.dataPoints];
    next[i] = { ...next[i], [field]: val };
    setDraft({ ...draft, dataPoints: next });
  };
  const addDataPointRow = () => setDraft({ ...draft, dataPoints: [...draft.dataPoints, { key: "", value: "" }] });

  const submit = () => {
    if (!draft.date || !draft.facilitator) return;
    onAddWorkshop({
      date: draft.date, facilitator: draft.facilitator, participants: draft.participants,
      dataPoints: draft.dataPoints.filter((d) => d.key),
      spacePulse: draft.spacePulse,
    });
    setDraft({ date: "", facilitator: "", participants: "", dataPoints: [{ key: "", value: "" }], spacePulse: { s: null, c: null, e: null } });
    setShowForm(false);
    setExpanded(true);
  };

  return (
    <div style={{ borderTop: "1px solid #F1F5F9" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
        <div onClick={onToggleClosed} style={{ cursor: "pointer", display: "flex", flexShrink: 0 }}>
          {practice.closed ? <CheckCircle2 size={16} color="#10B981" /> : <Circle size={16} color="#CBD5E1" />}
        </div>
        <span
          onClick={onToggleClosed}
          style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 13, color: practice.closed ? "#475569" : "#0F172A", cursor: "pointer" }}
        >
          {practice.name}
        </span>
        <span
          onClick={() => setExpanded((e) => !e)}
          style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#94A3B8", flexShrink: 0 }}
        >
          {workshops.length} workshop{workshops.length !== 1 ? "s" : ""}
          {expanded ? <ChevronRight size={13} style={{ transform: "rotate(90deg)" }} /> : <ChevronRight size={13} />}
        </span>
      </div>

      {expanded && (
        <div style={{ marginLeft: 26, marginBottom: 10, paddingLeft: 12, borderLeft: "2px solid #F1F5F9" }}>
          {workshops.map((w) => (
            <div key={w.id} style={{ padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#14213D" }}>
                <span style={{ fontFamily: "'Fira Code', monospace", color: "#94A3B8" }}>{w.date}</span>
                <span>Facilitator: <strong>{w.facilitator}</strong></span>
                {w.participants && <span style={{ color: "#475569" }}>Participants: {w.participants}</span>}
              </div>
              {w.dataPoints && w.dataPoints.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                  {w.dataPoints.map((d, i) => (
                    <span key={i} style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, color: "#F97316", background: "#FDF1E7", padding: "3px 8px", borderRadius: 6 }}>
                      {d.key}: {d.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {workshops.length === 0 && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8", padding: "6px 0" }}>No workshops logged.</div>}

          {!showForm && (
            <Btn small variant="ghost" icon={Plus} onClick={() => setShowForm(true)}>Log Workshop</Btn>
          )}
          {showForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, marginTop: 8, background: "#F9FAFB", borderRadius: 10 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input style={{ ...inputStyle, width: 130 }} placeholder="Date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
                <input style={{ ...inputStyle, flex: 1, minWidth: 140 }} placeholder="Facilitator" value={draft.facilitator} onChange={(e) => setDraft({ ...draft, facilitator: e.target.value })} />
                <input style={{ ...inputStyle, flex: 1, minWidth: 160 }} placeholder="Participants" value={draft.participants} onChange={(e) => setDraft({ ...draft, participants: e.target.value })} />
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#94A3B8", fontWeight: 600, marginTop: 4 }}>
                Data captured (form configurable per practice)
              </div>
              {draft.dataPoints.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="Metric (e.g. Initial Cycle Time)" value={d.key} onChange={(e) => updateDataPoint(i, "key", e.target.value)} />
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="Value (e.g. 9 days)" value={d.value} onChange={(e) => updateDataPoint(i, "value", e.target.value)} />
                </div>
              ))}
              {/* SPACE Pulse Survey */}
              <div style={{ marginTop: 8, padding: "10px 12px", background: "#F1F5F9", borderRadius: 8, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, color: "#F97316", fontWeight: 600 }}>SPACE PULSE · 3 quick questions (optional)</div>
                {[
                  { key: "s", question: "How satisfied is the team with AI adoption?" },
                  { key: "c", question: "How clear are AI usage standards for the team?" },
                  { key: "e", question: "How much friction/interruption is the team experiencing?" },
                ].map(({ key, question }) => (
                  <div key={key}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#475569", marginBottom: 5 }}><strong>{key.toUpperCase()}</strong> — {question}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {PULSE_OPTIONS[key].map((opt) => {
                        const active = draft.spacePulse[key] === opt.val;
                        return (
                          <button key={opt.val} onClick={() => setDraft({ ...draft, spacePulse: { ...draft.spacePulse, [key]: opt.val } })}
                            style={{ padding: "4px 10px", borderRadius: 999, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 11, border: active ? `1px solid ${opt.color}` : "1px solid #E2E8F0", background: active ? opt.bg : "#fff", color: active ? opt.color : "#94A3B8" }}>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <Btn small variant="ghost" icon={Plus} onClick={addDataPointRow}>Add Data Point</Btn>
                <Btn small onClick={submit}>Save Workshop</Btn>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function computeStagesData(practices, monthsElapsed) {
  return TCF_STAGES.map((st) => {
    const list = practices[st.key];
    const closed = list.filter((p) => p.closed).length;
    const expected = Math.round(expectedByMonth(st, monthsElapsed));
    return { ...st, list, closed, expected };
  });
}

function TcfTab({ practices, monthsElapsed, togglePractice, addWorkshop, dora, onSpacePulse }) {
  if (!practices) return <Card><div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#475569" }}>No TCF adoption data for this project yet.</div></Card>;

  const stagesData = computeStagesData(practices, monthsElapsed);
  const totalClosed = stagesData.reduce((s, p) => s + p.closed, 0);
  const totalPossible = stagesData.reduce((s, p) => s + p.total, 0);

  const doraMetrics = dora ? [
    { key: "deploymentFrequency", label: "Deployment Frequency", icon: Rocket, ...dora.deploymentFrequency, isDora: true },
    { key: "leadTimeForChanges", label: "Lead Time for Changes", icon: Timer, ...dora.leadTimeForChanges, isDora: true },
    { key: "changeFailureRate", label: "Change Failure Rate", icon: AlertTriangle, ...dora.changeFailureRate, isDora: true },
    { key: "mttr", label: "Time to Restore (MTTR)", icon: GitCommitHorizontal, ...dora.mttr, isDora: true },
    { key: "cycleTime", label: "Cycle Time", icon: Anchor, ...dora.cycleTime, isDora: false },
  ] : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {dora && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Rocket size={16} color="#F97316" />
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>DORA + Cycle Time — AI-Assisted Development Efficiency</div>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8", marginBottom: 14 }}>
            Measure how efficiently the team ships software with AI support. 4 official DORA indicators + Cycle Time (complementary, not an official DORA metric).
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {doraMetrics.map((m) => {
              const b = DORA_BENCHMARKS[m.level];
              return (
                <div key={m.key} style={{
                  flex: 1, minWidth: 160, background: b.bg, borderRadius: 10, padding: "12px 14px",
                  border: m.isDora ? "none" : `1.5px dashed ${b.color}`,
                  position: "relative",
                }}>
                  {!m.isDora && (
                    <div style={{ position: "absolute", top: 7, right: 8, fontFamily: "'Fira Code', monospace", fontSize: 9, color: b.color, fontWeight: 600, letterSpacing: "0.04em", opacity: 0.75 }}>
                      complementary
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <m.icon size={13} color={b.color} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569", fontWeight: 600 }}>{m.label}</span>
                  </div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{m.value}</div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: b.color, marginTop: 4, fontWeight: 600 }}>{m.level} tier</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>TCF Practices Closed</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#475569", marginTop: 2 }}>Mark each practice closed as the team completes it.</div>
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24, color: "#0F172A" }}>{totalClosed}/{totalPossible}</div>
        </div>
      </Card>

      {stagesData.map((st) => (
        <Card key={st.key}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14.5, color: "#0F172A" }}>
              Stage {st.key} · {st.name}
            </div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#475569" }}>{st.closed}/{st.total} · target to date: {st.expected}</div>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8", marginBottom: 10 }}>{st.subtitle}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {st.list.map((pr) => (
              <PracticeRow
                key={pr.id}
                practice={pr}
                onToggleClosed={() => togglePractice(st.key, pr.id)}
                onAddWorkshop={(workshop) => {
                    if (onSpacePulse && workshop.spacePulse) onSpacePulse(workshop.spacePulse, practices);
                    addWorkshop(st.key, pr.id, workshop);
                  }}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ============================== 5.3 CHANGE & ADOPTION — SPACE Framework (tab) ============================== */

function SpaceDimCard({ dim, data, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.note || "");
  const ls = SPACE_LEVEL_STYLE[data.level];

  const save = () => { onChange({ ...data, note: draft }); setEditing(false); };

  return (
    <div style={{ border: `1px solid ${dim.color}33`, borderRadius: 12, padding: 16, background: "#FAFAFA" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: dim.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: dim.color }}>{dim.abbr}</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13.5, color: "#0F172A" }}>{dim.label}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#94A3B8", marginTop: 1 }}>{dim.desc}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: SPACE_TREND_COLOR[data.trend] }}>{SPACE_TREND_LABEL[data.trend]}</span>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, fontWeight: 600, color: ls.color, background: ls.bg, padding: "3px 10px", borderRadius: 999 }}>{data.level}</span>
        </div>
      </div>

      {/* Level selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {["Low", "Medium", "High"].map((lvl) => {
          const s = SPACE_LEVEL_STYLE[lvl];
          const active = data.level === lvl;
          return (
            <button key={lvl} onClick={() => onChange({ ...data, level: lvl })}
              style={{ padding: "4px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 11.5, border: active ? `1px solid ${s.color}` : "1px solid #E2E8F0", background: active ? s.bg : "#fff", color: active ? s.color : "#94A3B8" }}>
              {lvl}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        {["improving", "stable", "declining"].map((t) => {
          const active = data.trend === t;
          return (
            <button key={t} onClick={() => onChange({ ...data, trend: t })}
              style={{ padding: "4px 10px", borderRadius: 999, cursor: "pointer", fontFamily: "'Fira Code', monospace", fontSize: 10.5, border: active ? `1px solid ${SPACE_TREND_COLOR[t]}` : "1px solid #E2E8F0", background: active ? "#fff" : "#fff", color: active ? SPACE_TREND_COLOR[t] : "#CBD5E1" }}>
              {SPACE_TREND_LABEL[t]}
            </button>
          );
        })}
      </div>

      {/* Note */}
      {editing ? (
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <input style={{ ...inputStyle, flex: 1, fontSize: 12.5 }} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
          <Btn small onClick={save}>Save</Btn>
          <Btn small variant="ghost" onClick={() => setEditing(false)}>Cancel</Btn>
        </div>
      ) : (
        <div onClick={() => { setDraft(data.note || ""); setEditing(true); }}
          style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: data.note ? "#475569" : "#CBD5E1", cursor: "pointer", marginTop: 4, fontStyle: data.note ? "normal" : "italic" }}>
          {data.note || "Click to add a PM observation…"}
        </div>
      )}
    </div>
  );
}

function CambioTab({ change, setChange }) {
  const [newResistance, setNewResistance] = useState("");
  const [newComm, setNewComm] = useState({ date: "", audience: "", channel: "", status: "Planned" });
  const [showCommForm, setShowCommForm] = useState(false);

  if (!change) return <Card><div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#475569" }}>No change management data for this project yet.</div></Card>;

  const space = change.space || {};
  const updateDim = (key, val) => setChange({ ...change, space: { ...space, [key]: val } });

  const addResistance = () => {
    if (!newResistance) return;
    setChange({ ...change, resistances: [...(change.resistances || []), { id: Date.now(), text: newResistance }] });
    setNewResistance("");
  };
  const removeResistance = (id) => setChange({ ...change, resistances: change.resistances.filter((r) => r.id !== id) });
  const addComm = () => {
    if (!newComm.audience) return;
    setChange({ ...change, comms: [...(change.comms || []), { id: Date.now(), ...newComm }] });
    setNewComm({ date: "", audience: "", channel: "", status: "Planned" });
    setShowCommForm(false);
  };

  /* Overall SPACE score: Low=1, Medium=2, High=3 → avg → label */
  const levelNum = { Low: 1, Medium: 2, High: 3 };
  const dims = SPACE_DIMS.map((d) => space[d.key] || { level: "Medium", trend: "stable", note: "" });
  const avg = dims.reduce((s, d) => s + (levelNum[d.level] || 2), 0) / dims.length;
  const overallLevel = avg >= 2.5 ? "High" : avg >= 1.5 ? "Medium" : "Low";
  const overallStyle = SPACE_LEVEL_STYLE[overallLevel];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* SPACE header */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#F97316", fontWeight: 500, marginBottom: 4 }}>SPACE FRAMEWORK · ACM Queue 2021 · Forsgren et al.</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: "#0F172A" }}>Developer Productivity Assessment</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#475569", marginTop: 4 }}>Five dimensions — use as lenses, not scorecards. No universal benchmarks apply.</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>Overall SPACE</div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: overallStyle.color, background: overallStyle.bg, padding: "6px 18px", borderRadius: 999 }}>{overallLevel}</span>
          </div>
        </div>

        {/* 5-dim summary bar */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          {SPACE_DIMS.map((d) => {
            const dimData = space[d.key] || { level: "Medium", trend: "stable" };
            const ls = SPACE_LEVEL_STYLE[dimData.level];
            return (
              <div key={d.key} style={{ flex: 1, minWidth: 80, textAlign: "center", padding: "10px 8px", borderRadius: 10, background: d.bg, border: `1px solid ${d.color}22` }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: d.color }}>{d.abbr}</div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, fontWeight: 600, color: ls.color, marginTop: 4 }}>{dimData.level}</div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9.5, color: SPACE_TREND_COLOR[dimData.trend], marginTop: 2 }}>{SPACE_TREND_LABEL[dimData.trend]}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Per-dimension cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SPACE_DIMS.map((d) => (
          <SpaceDimCard key={d.key} dim={d} data={space[d.key] || { level: "Medium", trend: "stable", note: "" }} onChange={(val) => updateDim(d.key, val)} />
        ))}
      </div>

      {/* E — Friction points (Efficiency & Flow) */}
      <Card>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: "#0F172A", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: "#F59E0B", background: "#FEF3E0", padding: "2px 8px", borderRadius: 6 }}>E</span>
          Friction & Resistance Points
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>Blockers and resistance signals that reduce efficiency and flow for this project.</div>
        {(change.resistances || []).length === 0 && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94A3B8" }}>No friction points logged.</div>}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {(change.resistances || []).map((r, i) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i > 0 ? "1px solid #E2E8F0" : "none" }}>
              <AlertTriangle size={14} color="#F59E0B" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0F172A" }}>{r.text}</div>
              <Trash2 size={14} color="#CBD5E1" style={{ cursor: "pointer" }} onClick={() => removeResistance(r.id)} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Describe a friction or resistance point" value={newResistance} onChange={(e) => setNewResistance(e.target.value)} />
          <Btn small icon={Plus} variant="ghost" onClick={addResistance}>Add</Btn>
        </div>
      </Card>

      {/* C — Communication plan */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: "#F97316", background: "#FDF1E7", padding: "2px 8px", borderRadius: 6 }}>C</span>
            <Megaphone size={15} color="#F97316" /> Communication Plan
          </div>
          <Btn small icon={Plus} variant="ghost" onClick={() => setShowCommForm((s) => !s)}>Add</Btn>
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>Key communications to stakeholders — tracks knowledge sharing and coordination quality.</div>
        {showCommForm && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, padding: 12, background: "#F1F5F9", borderRadius: 10 }}>
            <input style={{ ...inputStyle, width: 100 }} placeholder="Date" value={newComm.date} onChange={(e) => setNewComm({ ...newComm, date: e.target.value })} />
            <input style={{ ...inputStyle, flex: 1, minWidth: 160 }} placeholder="Audience" value={newComm.audience} onChange={(e) => setNewComm({ ...newComm, audience: e.target.value })} />
            <input style={{ ...inputStyle, width: 150 }} placeholder="Channel" value={newComm.channel} onChange={(e) => setNewComm({ ...newComm, channel: e.target.value })} />
            <select style={{ ...inputStyle, width: 130 }} value={newComm.status} onChange={(e) => setNewComm({ ...newComm, status: e.target.value })}>
              <option>Planned</option><option>Done</option>
            </select>
            <Btn small onClick={addComm}>Save</Btn>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {(change.comms || []).map((c, i) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: i > 0 ? "1px solid #E2E8F0" : "none" }}>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#94A3B8", width: 54 }}>{c.date}</span>
              <div style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0F172A" }}>{c.audience}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", width: 150 }}>{c.channel}</div>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, padding: "2px 8px", borderRadius: 6, color: c.status === "Done" ? "#10B981" : "#F59E0B", background: c.status === "Done" ? "#E5F9F1" : "#FEF3E0" }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* A — Training */}
      <Card>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: "#0F172A", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: "#10B981", background: "#E5F9F1", padding: "2px 8px", borderRadius: 6 }}>A</span>
          <GraduationCap size={15} color="#10B981" /> Training Activity
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>Meaningful learning actions — attendance rate tracks whether the team is building AI capability.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(change.trainings || []).map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0F172A" }}>{t.name}</div>
              <div style={{ width: 140, height: 6, borderRadius: 4, background: "#E2E8F0" }}>
                <div style={{ height: "100%", width: `${t.attendance}%`, borderRadius: 4, background: t.attendance >= 80 ? "#10B981" : t.attendance >= 50 ? "#F59E0B" : "#dc2626" }} />
              </div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#475569", width: 36, textAlign: "right" }}>{t.attendance}%</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================== 5.4 VALUE & METRICS (tab) ============================== */

function MetricasTab({ kpiData, setKpiData, project, baseline, investment, setInvestment, timeSaved, setTimeSaved }) {
  const [showInvForm, setShowInvForm] = useState(false);
  const [invDraft, setInvDraft] = useState({ category: "", amount: "" });
  const [showTsForm, setShowTsForm] = useState(false);
  const [tsDraft, setTsDraft] = useState({ team: "", hoursWeek: "", confidence: "Estimated" });

  if (!kpiData) return <Card><div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#475569" }}>No value data defined for this project yet.</div></Card>;

  const benefitPct = kpiData.benefitExpected ? Math.round((kpiData.benefitRealized / kpiData.benefitExpected) * 100) : 0;
  const setSatisfaction = (v) => setKpiData({ ...kpiData, stakeholderSatisfaction: Number(v) || 0 });
  const setRealized = (v) => setKpiData({ ...kpiData, benefitRealized: Number(v) || 0 });
  const setExpected = (v) => setKpiData({ ...kpiData, benefitExpected: Number(v) || 0 });

  const { investment: totalInv, roiPct, monthlyRunRate, paybackMonths } = computeRoi(investment, kpiData.benefitRealized, project.monthsElapsed);
  const { hours, value: weeklyValue } = weeklyTimeSavedValue(timeSaved);
  const durationMonths = (baseline && baseline.durationMonths) || 12;
  const series = buildBreakevenSeries(totalInv, monthlyRunRate, durationMonths);
  const breakevenMonth = findBreakevenMonth(series);
  const maxInvestment = investment && investment.length ? Math.max(...investment.map((i) => i.amount)) : 1;

  const addInvestment = () => {
    if (!invDraft.category || !invDraft.amount) return;
    setInvestment([...(investment || []), { category: invDraft.category, amount: Number(invDraft.amount) || 0 }]);
    setInvDraft({ category: "", amount: "" });
    setShowInvForm(false);
  };
  const removeInvestment = (idx) => setInvestment(investment.filter((_, i) => i !== idx));

  const addTimeSaved = () => {
    if (!tsDraft.team || !tsDraft.hoursWeek) return;
    setTimeSaved({ ...timeSaved, items: [...((timeSaved && timeSaved.items) || []), { team: tsDraft.team, hoursWeek: Number(tsDraft.hoursWeek) || 0, confidence: tsDraft.confidence }] });
    setTsDraft({ team: "", hoursWeek: "", confidence: "Estimated" });
    setShowTsForm(false);
  };
  const removeTimeSaved = (idx) => setTimeSaved({ ...timeSaved, items: timeSaved.items.filter((_, i) => i !== idx) });
  const setLoadedRate = (v) => setTimeSaved({ ...timeSaved, loadedRate: Number(v) || 0 });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#FDF1E7", border: "1px solid #FBE0C4", borderRadius: 8, padding: "10px 12px" }}>
        <Info size={14} color="#F97316" style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9A3412" }}>
          This module measures <strong>business value</strong> exclusively. Project progress/health is measured with the weighted schedule engine (the "Baseline & Progress" tab), AI development efficiency is measured with DORA (the "Adoption Map" tab), and ROI (below) is a third, independent family answering whether the engagement pays for itself.
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <KpiCard label="Stakeholder Satisfaction" value={kpiData.stakeholderSatisfaction.toFixed(1)} sub="out of 10" icon={TrendingUp} accent="#F97316" />
        <KpiCard label="Benefits Realized" value={`${benefitPct}%`} sub={`${usd(kpiData.benefitRealized)} of ${usd(kpiData.benefitExpected)}`} icon={DollarSign} accent="#10B981" />
      </div>

      <Card>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A", marginBottom: 14 }}>Benefits Realization</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <Field label="Expected benefit (USD, business case)">
            <input style={{ ...inputStyle, width: 200 }} value={kpiData.benefitExpected} onChange={(e) => setExpected(e.target.value)} />
          </Field>
          <Field label="Benefit realized to date (USD)">
            <input style={{ ...inputStyle, width: 200 }} value={kpiData.benefitRealized} onChange={(e) => setRealized(e.target.value)} />
          </Field>
        </div>
        <div style={{ height: 8, borderRadius: 5, background: "#E2E8F0" }}>
          <div style={{ height: "100%", width: `${Math.min(100, benefitPct)}%`, borderRadius: 5, background: "#10B981" }} />
        </div>
      </Card>

      <Card>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A", marginBottom: 10 }}>Stakeholder Satisfaction</div>
        <Field label="Most recent survey score (out of 10)">
          <input style={{ ...inputStyle, width: 120 }} value={kpiData.stakeholderSatisfaction} onChange={(e) => setSatisfaction(e.target.value)} />
        </Field>
      </Card>

      {/* ============================== ROI (v2.6) ============================== */}

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Target size={16} color="#F97316" />
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>Return on AI Investment (ROI)</div>
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8", marginBottom: 14 }}>
          Independent from the schedule engine (5.1) and DORA (5.3) — measures whether the AI-adoption engagement pays for itself.
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <KpiCard label="Total Investment" value={usd(totalInv)} icon={DollarSign} accent="#0F172A" />
          <KpiCard label="ROI" value={`${roiPct >= 0 ? "+" : ""}${roiPct.toFixed(0)}%`} icon={Target} accent={roiPct >= 0 ? "#10B981" : "#dc2626"} />
          <KpiCard
            label="Payback"
            value={paybackMonths ? `${paybackMonths.toFixed(1)} months` : "—"}
            sub={paybackMonths && paybackMonths <= project.monthsElapsed ? "already reached" : "projected"}
            icon={Timer}
            accent="#F97316"
          />
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>Investment Breakdown</div>
          <Btn small icon={Plus} variant="ghost" onClick={() => setShowInvForm((s) => !s)}>Add</Btn>
        </div>
        {showInvForm && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, padding: 12, background: "#F1F5F9", borderRadius: 10 }}>
            <input style={{ ...inputStyle, flex: 1, minWidth: 180 }} placeholder="Category (e.g. Consulting fees)" value={invDraft.category} onChange={(e) => setInvDraft({ ...invDraft, category: e.target.value })} />
            <input style={{ ...inputStyle, width: 140 }} placeholder="Amount (USD)" value={invDraft.amount} onChange={(e) => setInvDraft({ ...invDraft, amount: e.target.value })} />
            <Btn small onClick={addInvestment}>Save</Btn>
          </div>
        )}
        {(!investment || investment.length === 0) && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94A3B8" }}>No investment logged yet.</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(investment || []).map((i, idx) => (
            <div key={idx}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#0F172A", marginBottom: 4 }}>
                <span>{i.category}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'Fira Code', monospace", color: "#475569" }}>{usd(i.amount)}</span>
                  <Trash2 size={13} color="#CBD5E1" style={{ cursor: "pointer" }} onClick={() => removeInvestment(idx)} />
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 4, background: "#F1F5F9" }}>
                <div style={{ height: "100%", width: `${(i.amount / maxInvestment) * 100}%`, borderRadius: 4, background: "#0F172A" }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>Time Saved by Team</div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#475569" }}>{hours} h/week · {usd(weeklyValue)}/week</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8" }}>Loaded rate:</span>
          <input style={{ ...inputStyle, width: 100, padding: "5px 8px" }} value={(timeSaved && timeSaved.loadedRate) || 0} onChange={(e) => setLoadedRate(e.target.value)} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8" }}>USD/hour</span>
          <div style={{ flex: 1 }} />
          <Btn small icon={Plus} variant="ghost" onClick={() => setShowTsForm((s) => !s)}>Add</Btn>
        </div>
        {showTsForm && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, padding: 12, background: "#F1F5F9", borderRadius: 10 }}>
            <input style={{ ...inputStyle, flex: 1, minWidth: 160 }} placeholder="Team / role" value={tsDraft.team} onChange={(e) => setTsDraft({ ...tsDraft, team: e.target.value })} />
            <input style={{ ...inputStyle, width: 110 }} placeholder="Hours/week" value={tsDraft.hoursWeek} onChange={(e) => setTsDraft({ ...tsDraft, hoursWeek: e.target.value })} />
            <select style={{ ...inputStyle, width: 130 }} value={tsDraft.confidence} onChange={(e) => setTsDraft({ ...tsDraft, confidence: e.target.value })}>
              <option value="Estimated">Estimated</option>
              <option value="Validated">Validated</option>
              <option value="Measured">Measured</option>
            </select>
            <Btn small onClick={addTimeSaved}>Save</Btn>
          </div>
        )}
        {(!timeSaved || !timeSaved.items || timeSaved.items.length === 0) && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94A3B8" }}>No time-saved entries logged yet.</div>}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {((timeSaved && timeSaved.items) || []).map((t, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: idx > 0 ? "1px solid #E2E8F0" : "none" }}>
              <div style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0F172A" }}>{t.team}</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12.5, color: "#475569" }}>{t.hoursWeek} h/week</div>
              <ConfidenceBadge level={t.confidence} />
              <Trash2 size={13} color="#CBD5E1" style={{ cursor: "pointer" }} onClick={() => removeTimeSaved(idx)} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A", marginBottom: 4 }}>Breakeven Timeline</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>
          Cumulative investment (dashed grey) vs. cumulative benefit (orange). The crossing point is when the engagement pays for itself.
        </div>
        <BreakevenChart series={series} breakevenMonth={breakevenMonth} />
        <div style={{ display: "flex", gap: 16, marginTop: 10, fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#475569" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 2, background: "#94A3B8", display: "inline-block" }} /> Cumulative investment</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 2, background: "#F97316", display: "inline-block" }} /> Cumulative benefit</span>
        </div>
      </Card>
    </div>
  );
}

/* ============================== 5.5 KNOWLEDGE & DOCUMENT MANAGEMENT (tab) ============================== */

function DocumentosTab({ docs, setDocs }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ name: "", type: "Plan" });

  const addDoc = () => {
    if (!draft.name) return;
    setDocs([...docs, { id: Date.now(), name: draft.name, type: draft.type, date: "today", version: "v1" }]);
    setDraft({ name: "", type: "Plan" });
    setShowForm(false);
  };
  const removeDoc = (id) => setDocs(docs.filter((d) => d.id !== id));

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>Project Document Repository</div>
        <Btn small icon={Plus} variant="ghost" onClick={() => setShowForm((s) => !s)}>Upload Document</Btn>
      </div>
      {showForm && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, padding: 12, background: "#F1F5F9", borderRadius: 10 }}>
          <input style={{ ...inputStyle, flex: 1, minWidth: 200 }} placeholder="Document name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <select style={{ ...inputStyle, width: 130 }} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
            <option>Plan</option><option>Minutes</option><option>Report</option><option>Template</option>
          </select>
          <Btn small onClick={addDoc}>Save (simulated)</Btn>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {docs.map((d, i) => (
          <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i > 0 ? "1px solid #E2E8F0" : "none" }}>
            <FileText size={16} color="#475569" />
            <div style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#0F172A" }}>{d.name}</div>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#94A3B8" }}>{d.type}</span>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#94A3B8", width: 60 }}>{d.version}</span>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#94A3B8", width: 90, textAlign: "right" }}>{d.date}</span>
            <Trash2 size={14} color="#CBD5E1" style={{ cursor: "pointer" }} onClick={() => removeDoc(d.id)} />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============================== 5.3 CHANGE & ADOPTION (portfolio view) ============================== */

function CambioPortfolioView({ projects, clientName, changeByProject, setOpenProjectId, setView }) {
  const goTo = (id) => { setOpenProjectId(id); setView("proyectos"); };
  const levelNum = { Low: 1, Medium: 2, High: 3 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#F97316", fontWeight: 500, marginBottom: 4 }}>CHANGE MANAGEMENT & ADOPTION · SPACE FRAMEWORK</div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: "#0F172A", margin: 0 }}>Change & Adoption by Project</h1>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#94A3B8", marginTop: 4 }}>Five SPACE dimensions — Satisfaction · Performance · Activity · Communication · Efficiency</div>
      </div>
      <Card style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F1F5F9" }}>
              {["Project", "Client", ...SPACE_DIMS.map((d) => d.abbr), "Overall", "Friction"].map((h, i) => (
                <th key={i} style={{ textAlign: "left", padding: "12px 14px", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => {
              const c = changeByProject[p.id];
              if (!c) return null;
              const space = c.space || {};
              const dims = SPACE_DIMS.map((d) => space[d.key] || { level: "Medium", trend: "stable" });
              const avg = dims.reduce((s, d) => s + (levelNum[d.level] || 2), 0) / dims.length;
              const overallLevel = avg >= 2.5 ? "High" : avg >= 1.5 ? "Medium" : "Low";
              const os = SPACE_LEVEL_STYLE[overallLevel];
              return (
                <tr key={p.id} onClick={() => goTo(p.id)} style={{ borderTop: i > 0 ? "1px solid #E2E8F0" : "none", cursor: "pointer" }}>
                  <td style={{ padding: "12px 14px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13.5, color: "#0F172A" }}>{p.name}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#475569" }}>{clientName(p.clientId)}</td>
                  {SPACE_DIMS.map((d) => {
                    const dd = space[d.key] || { level: "Medium", trend: "stable" };
                    const ls = SPACE_LEVEL_STYLE[dd.level];
                    return (
                      <td key={d.key} style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, fontWeight: 600, color: ls.color, background: ls.bg, padding: "2px 7px", borderRadius: 999 }}>{dd.level}</span>
                          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9.5, color: SPACE_TREND_COLOR[dd.trend] }}>{SPACE_TREND_LABEL[dd.trend]}</span>
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, fontWeight: 700, color: os.color, background: os.bg, padding: "3px 10px", borderRadius: 999 }}>{overallLevel}</span>
                  </td>
                  <td style={{ padding: "12px 14px", fontFamily: "'Fira Code', monospace", fontSize: 13, color: (c.resistances || []).length > 0 ? "#dc2626" : "#94A3B8" }}>{(c.resistances || []).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ============================== 5.4 VALUE & METRICS (portfolio view) ============================== */

function MetricasPortfolioView({ projects, clientName, kpisByProject, investmentByProject, baselineByProject, setOpenProjectId, setView }) {
  const goTo = (id) => { setOpenProjectId(id); setView("proyectos"); };
  const totals = projects.reduce((acc, p) => {
    const k = kpisByProject[p.id];
    if (!k) return acc;
    acc.expected += k.benefitExpected; acc.realized += k.benefitRealized;
    return acc;
  }, { expected: 0, realized: 0 });
  const pct = totals.expected ? Math.round((totals.realized / totals.expected) * 100) : 0;

  const roiRows = projects.map((p) => {
    const k = kpisByProject[p.id];
    const inv = (investmentByProject && investmentByProject[p.id]) || [];
    const { investment, roiPct, paybackMonths } = computeRoi(inv, k ? k.benefitRealized : 0, p.monthsElapsed);
    return { id: p.id, p, k, investment, roiPct, paybackMonths };
  });
  const portfolioInvestment = roiRows.reduce((s, r) => s + r.investment, 0);
  const portfolioBenefit = roiRows.reduce((s, r) => s + (r.k ? r.k.benefitRealized : 0), 0);
  const blendedRoi = portfolioInvestment ? ((portfolioBenefit - portfolioInvestment) / portfolioInvestment) * 100 : 0;
  const validPaybacks = roiRows.filter((r) => r.paybackMonths != null);
  const avgPayback = validPaybacks.length ? validPaybacks.reduce((s, r) => s + r.paybackMonths, 0) / validPaybacks.length : null;

  const maxDuration = Math.max(...projects.map((p) => ((baselineByProject && baselineByProject[p.id] && baselineByProject[p.id].durationMonths) || 12)));
  const aggSeries = [];
  for (let m = 0; m <= maxDuration; m++) {
    let inv = 0, ben = 0;
    roiRows.forEach((r) => {
      const duration = (baselineByProject && baselineByProject[r.id] && baselineByProject[r.id].durationMonths) || 12;
      const monthlyRunRate = r.p.monthsElapsed ? (r.k ? r.k.benefitRealized : 0) / r.p.monthsElapsed : 0;
      const s = buildBreakevenSeries(r.investment, monthlyRunRate, duration);
      const point = s[Math.min(m, s.length - 1)];
      inv += point.investment;
      ben += point.benefit;
    });
    aggSeries.push({ month: m, investment: inv, benefit: ben });
  }
  const aggBreakeven = findBreakevenMonth(aggSeries);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#F97316", fontWeight: 500, marginBottom: 4 }}>VALUE & METRICS MEASUREMENT MODULE</div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: "#0F172A", margin: 0 }}>Portfolio Value & Benefits</h1>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <KpiCard label="Benefits Realized (portfolio)" value={`${pct}%`} sub={`${usd(totals.realized)} of ${usd(totals.expected)}`} icon={DollarSign} accent="#10B981" />
      </div>
      <Card style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F1F5F9" }}>
              {["Project", "Client", "Expected Benefit", "Stakeholder Satisfaction", "Benefits Realized"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => {
              const k = kpisByProject[p.id];
              if (!k) return null;
              const bpct = k.benefitExpected ? Math.round((k.benefitRealized / k.benefitExpected) * 100) : 0;
              return (
                <tr key={p.id} onClick={() => goTo(p.id)} style={{ borderTop: i > 0 ? "1px solid #E2E8F0" : "none", cursor: "pointer" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13.5, color: "#0F172A" }}>{p.name}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#475569" }}>{clientName(p.clientId)}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#0F172A" }}>{usd(k.benefitExpected)}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#0F172A" }}>{k.stakeholderSatisfaction.toFixed(1)}/10</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Fira Code', monospace", fontSize: 13, color: bpct >= 80 ? "#10B981" : bpct >= 40 ? "#F59E0B" : "#dc2626" }}>{bpct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* ============================== ROI (v2.6, portfolio rollup) ============================== */}

      <div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#F97316", fontWeight: 500, marginBottom: 4 }}>ROI & BUSINESS VALUE — PORTFOLIO ROLLUP</div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: "#0F172A", margin: 0 }}>Return on AI Investment</h2>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <KpiCard label="Portfolio Investment" value={usd(portfolioInvestment)} icon={DollarSign} accent="#0F172A" />
        <KpiCard label="Portfolio ROI" value={`${blendedRoi >= 0 ? "+" : ""}${blendedRoi.toFixed(0)}%`} icon={Target} accent={blendedRoi >= 0 ? "#10B981" : "#dc2626"} />
        <KpiCard label="Average Payback" value={avgPayback != null ? `${avgPayback.toFixed(1)} months` : "—"} icon={Timer} accent="#F97316" />
      </div>

      <Card style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F1F5F9" }}>
              {["Project", "Client", "Investment", "Benefit Realized", "ROI %", "Payback"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roiRows.map((r, i) => (
              <tr key={r.id} onClick={() => goTo(r.id)} style={{ borderTop: i > 0 ? "1px solid #E2E8F0" : "none", cursor: "pointer" }}>
                <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 9, fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13.5, color: "#0F172A" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: RAG[r.p.ragCalculated].hex, display: "inline-block" }} />
                  {r.p.name}
                </td>
                <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#475569" }}>{clientName(r.p.clientId)}</td>
                <td style={{ padding: "12px 16px", fontFamily: "'Fira Code', monospace", fontSize: 12.5, color: "#0F172A" }}>{usd(r.investment)}</td>
                <td style={{ padding: "12px 16px", fontFamily: "'Fira Code', monospace", fontSize: 12.5, color: "#0F172A" }}>{r.k ? usd(r.k.benefitRealized) : "—"}</td>
                <td style={{ padding: "12px 16px", fontFamily: "'Fira Code', monospace", fontSize: 12.5, fontWeight: 600, color: r.roiPct >= 0 ? "#10B981" : "#dc2626" }}>
                  {r.roiPct >= 0 ? "+" : ""}{r.roiPct.toFixed(0)}%
                </td>
                <td style={{ padding: "12px 16px", fontFamily: "'Fira Code', monospace", fontSize: 12.5, color: "#475569" }}>
                  {r.paybackMonths ? `${r.paybackMonths.toFixed(1)} mo` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A", marginBottom: 4 }}>Breakeven Timeline — Consolidated Portfolio</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>
          Sum of investment and benefit across the {roiRows.length} active projects, month by month.
        </div>
        <BreakevenChart series={aggSeries} breakevenMonth={aggBreakeven} />
        <div style={{ display: "flex", gap: 16, marginTop: 10, fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#475569" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 2, background: "#94A3B8", display: "inline-block" }} /> Cumulative investment</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 2, background: "#F97316", display: "inline-block" }} /> Cumulative benefit</span>
        </div>
      </Card>
    </div>
  );
}

/* ============================== 5.5 KNOWLEDGE (portfolio view) ============================== */

function ConocimientoView({ knowledge, setKnowledge }) {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ title: "", type: "Lesson Learned", tags: "", project: "Global" });

  const filtered = knowledge.filter((k) =>
    !query || k.title.toLowerCase().includes(query.toLowerCase()) || k.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const addItem = () => {
    if (!draft.title) return;
    setKnowledge([...knowledge, { id: Date.now(), title: draft.title, type: draft.type, tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean), project: draft.project }]);
    setDraft({ title: "", type: "Lesson Learned", tags: "", project: "Global" });
    setShowForm(false);
  };

  const typeColor = { "Lesson Learned": "#F97316", "Template": "#7C3AED", "Best Practice": "#10B981", "Standard": "#F59E0B" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#F97316", fontWeight: 500, marginBottom: 4 }}>KNOWLEDGE & DOCUMENT MANAGEMENT MODULE</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: "#0F172A", margin: 0 }}>Organizational Knowledge</h1>
        </div>
        <Btn icon={Plus} onClick={() => setShowForm((s) => !s)}>New Entry</Btn>
      </div>

      <div style={{ position: "relative", maxWidth: 360 }}>
        <Search size={15} color="#94A3B8" style={{ position: "absolute", left: 12, top: 11 }} />
        <input style={{ ...inputStyle, width: "100%", paddingLeft: 34 }} placeholder="Search by title or tag..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {showForm && (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Title"><input style={inputStyle} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
            <div style={{ display: "flex", gap: 10 }}>
              <Field label="Type">
                <select style={inputStyle} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
                  <option>Lesson Learned</option><option>Template</option><option>Best Practice</option><option>Standard</option>
                </select>
              </Field>
              <Field label="Source project"><input style={inputStyle} value={draft.project} onChange={(e) => setDraft({ ...draft, project: e.target.value })} /></Field>
            </div>
            <Field label="Tags (comma-separated)"><input style={inputStyle} value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} /></Field>
            <Btn onClick={addItem}>Save Entry</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((k) => (
          <Card key={k.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <BookOpen size={17} color={typeColor[k.type] || "#475569"} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13.5, color: "#0F172A" }}>{k.title}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", marginTop: 3 }}>{k.project}</div>
                </div>
              </div>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: typeColor[k.type] || "#475569", background: (typeColor[k.type] || "#475569") + "18", padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>
                {k.type}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {k.tags.map((t) => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Fira Code', monospace", fontSize: 10.5, color: "#475569", background: "#F8FAFC", padding: "3px 8px", borderRadius: 6 }}>
                  <Tag size={10} /> {t}
                </span>
              ))}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94A3B8" }}>No results for that search.</div>}
      </div>
    </div>
  );
}

/* ============================== 5.7 REPORTS & DASHBOARDS ============================== */

/* ============================== WEEKLY STATUS REPORT ============================== */
/* Adapted from the Cardway weekly status report template, restyled in Meridian.
   Auto-fills from live project data (status, TCF practice progress, RIDA);
   narrative sections (achievements, next steps, decisions, ad-hoc risks) are
   editable weekly PM input, persisted per project. */

function ReportSection({ num, title, children }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ background: "#0F172A", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: "'Fira Code', monospace" }}>{num}</div>
        <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: "#0F172A" }}>{title}</h3>
        <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
      </div>
      {children}
    </div>
  );
}

function WeeklyStatusReport({ project, clientName, programName, rida, practices, baseline, dora, notes, setNotes }) {
  const [newAchievement, setNewAchievement] = useState("");
  const [newRisk, setNewRisk] = useState({ label: "Risk", description: "", impact: "", action: "" });
  const [newStep, setNewStep] = useState({ action: "", owner: "", due: "" });
  const [newDecision, setNewDecision] = useState({ description: "", owner: "", due: "" });
  const printRef = React.useRef(null);

  if (!project || !baseline || !practices) return <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94A3B8" }}>No data available for this project yet.</div>;

  const stagesData = computeStagesData(practices, project.monthsElapsed);
  const currentStage = stagesData.find((st) => st.closed < st.total) || stagesData[stagesData.length - 1];
  const weightedPct = computeWeightedProgress(practices, baseline.stageWeights);
  const reportDate = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const autoRisks = rida.filter((r) => r.severity === "red" || r.severity === "amber");

  const addAchievement = () => { if (!newAchievement) return; setNotes({ ...notes, achievements: [...notes.achievements, newAchievement] }); setNewAchievement(""); };
  const removeAchievement = (i) => setNotes({ ...notes, achievements: notes.achievements.filter((_, idx) => idx !== i) });

  const addRisk = () => { if (!newRisk.description) return; setNotes({ ...notes, manualRisks: [...notes.manualRisks, newRisk] }); setNewRisk({ label: "Risk", description: "", impact: "", action: "" }); };
  const removeRisk = (i) => setNotes({ ...notes, manualRisks: notes.manualRisks.filter((_, idx) => idx !== i) });

  const addStep = () => { if (!newStep.action) return; setNotes({ ...notes, nextSteps: [...notes.nextSteps, newStep] }); setNewStep({ action: "", owner: "", due: "" }); };
  const removeStep = (i) => setNotes({ ...notes, nextSteps: notes.nextSteps.filter((_, idx) => idx !== i) });

  const addDecision = () => { if (!newDecision.description) return; setNotes({ ...notes, decisions: [...notes.decisions, newDecision] }); setNewDecision({ description: "", owner: "", due: "" }); };
  const removeDecision = (i) => setNotes({ ...notes, decisions: notes.decisions.filter((_, idx) => idx !== i) });

  return (
    <div ref={printRef} style={{ border: "1px solid #E2E8F0", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
      {/* Header */}
      <div style={{ background: "#0F172A", padding: "22px 28px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, color: "#fff" }}>{project.name}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12, color: "#F97316", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 3 }}>Weekly Status Report</div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#94A3B8", lineHeight: 1.6 }}>
            <div><strong style={{ color: "#fff" }}>Report date:</strong> {reportDate}</div>
            <div><strong style={{ color: "#fff" }}>Prepared by:</strong> {project.pm}</div>
            <div><strong style={{ color: "#fff" }}>Client:</strong> {clientName(project.clientId)} · {programName(project.programId)}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          {[
            ["Framework", "TCF v0.7"],
            ["Stage", `Stage ${currentStage.key} — ${currentStage.name}`],
            ["Elapsed", `Month ${project.monthsElapsed} of ${baseline.durationMonths}`],
            ["Committed date", baseline.committedDate || "—"],
          ].map(([label, val]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.08)", color: "#CBD5E1", borderRadius: 20, padding: "4px 14px", fontSize: 11.5, fontFamily: "'Inter', sans-serif" }}>
              {label}: <strong style={{ color: "#fff" }}>{val}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Status banner */}
      <div style={{ display: "flex", gap: 24, padding: "16px 28px", borderBottom: "1px solid #E2E8F0", flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>1 — Overall Status</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <RagBadge level={project.ragReported} />
            {project.ragCalculated !== project.ragReported && (
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, color: "#94A3B8" }}>(MIRA calculated: <span style={{ color: RAG[project.ragCalculated].hex, fontWeight: 600 }}>{RAG[project.ragCalculated].label}</span>)</span>
            )}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 220, background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px" }}>
          <textarea
            rows={2} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#0F172A", resize: "none", outline: "none" }}
            placeholder="One-line context: what's happening this week and why the status is what it is..."
            value={notes.statusContext} onChange={(e) => setNotes({ ...notes, statusContext: e.target.value })}
          />
        </div>
      </div>

      <div style={{ padding: "0 28px 26px" }}>
        {/* 2. Practice progress */}
        <ReportSection num={2} title="Practice Progress">
          {stagesData.map((st) => (
            <div key={st.key} style={{ marginBottom: 14, opacity: st.key > currentStage.key ? 0.45 : 1 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                Stage {st.key} — {st.name} ({st.closed}/{st.total})
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                {st.list.map((pr) => (
                  <div key={pr.id} style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", background: "#F9FAFB" }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#0F172A", marginBottom: 6, lineHeight: 1.3 }}>{pr.name}</div>
                    <div style={{ height: 6, borderRadius: 4, background: "#E2E8F0" }}>
                      <div style={{ height: "100%", width: pr.closed ? "100%" : "0%", borderRadius: 4, background: "#10B981" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#475569", marginTop: 4 }}>
            Weighted progress: <strong style={{ color: "#0F172A", marginLeft: 4 }}>{Math.round(weightedPct)}%</strong>
          </div>
        </ReportSection>

        {/* 3. Achievements */}
        <ReportSection num={3} title="Week's Achievements">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notes.achievements.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 6, padding: "9px 12px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F97316", marginTop: 5, flexShrink: 0 }} />
                <span style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0F172A" }}>{a}</span>
                <Trash2 size={13} color="#CBD5E1" style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => removeAchievement(i)} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="What was completed or significantly progressed this week..." value={newAchievement} onChange={(e) => setNewAchievement(e.target.value)} />
            <Btn small icon={Plus} variant="ghost" onClick={addAchievement}>Add</Btn>
          </div>
        </ReportSection>

        {/* 4. Blockers / Risks */}
        <ReportSection num={4} title="Blockers / Risks">
          {autoRisks.length === 0 && notes.manualRisks.length === 0 && (
            <div style={{ background: "#E5F9F1", border: "1px solid #B8ECD4", borderRadius: 8, padding: "10px 14px", color: "#0F6B45", fontFamily: "'Inter', sans-serif", fontSize: 13, fontStyle: "italic" }}>
              No blockers or risks to report this week. Project on track.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {autoRisks.map((r) => (
              <div key={r.id} style={{ border: "1px solid #E2E8F0", borderLeft: `4px solid ${r.severity === "red" ? "#dc2626" : "#F59E0B"}`, borderRadius: 8, padding: "10px 14px", background: r.severity === "red" ? "#FDEAEA" : "#FEF3E0" }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: r.severity === "red" ? "#dc2626" : "#B45309", marginBottom: 4 }}>
                  {r.type} · from RIDA
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0F172A" }}>{r.title}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#475569", marginTop: 3 }}>Owner: {r.owner} · Due: {r.due}</div>
              </div>
            ))}
            {notes.manualRisks.map((r, i) => (
              <div key={i} style={{ border: "1px solid #E2E8F0", borderLeft: `4px solid ${r.label === "Blocker" ? "#dc2626" : "#F59E0B"}`, borderRadius: 8, padding: "10px 14px", background: r.label === "Blocker" ? "#FDEAEA" : "#FEF3E0" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: r.label === "Blocker" ? "#dc2626" : "#B45309" }}>{r.label}</div>
                  <Trash2 size={13} color="#94A3B8" style={{ cursor: "pointer" }} onClick={() => removeRisk(i)} />
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0F172A", marginTop: 4 }}>{r.description}</div>
                {r.impact && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#475569", marginTop: 3 }}>Impact: {r.impact}</div>}
                {r.action && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#475569", marginTop: 2 }}>Proposed action: {r.action}</div>}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10, padding: 12, background: "#F9FAFB", borderRadius: 8 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select style={{ ...inputStyle, width: 110 }} value={newRisk.label} onChange={(e) => setNewRisk({ ...newRisk, label: e.target.value })}>
                <option>Risk</option><option>Blocker</option>
              </select>
              <input style={{ ...inputStyle, flex: 1, minWidth: 160 }} placeholder="Description" value={newRisk.description} onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder="Impact (optional)" value={newRisk.impact} onChange={(e) => setNewRisk({ ...newRisk, impact: e.target.value })} />
              <input style={{ ...inputStyle, flex: 1 }} placeholder="Proposed action (optional)" value={newRisk.action} onChange={(e) => setNewRisk({ ...newRisk, action: e.target.value })} />
              <Btn small icon={Plus} variant="ghost" onClick={addRisk}>Add</Btn>
            </div>
          </div>
        </ReportSection>

        {/* 5. Next steps */}
        <ReportSection num={5} title="Next Steps">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notes.nextSteps.map((s, i) => (
              <div key={i} style={{ border: "1px solid #E2E8F0", borderLeft: "4px solid #0F172A", borderRadius: 8, padding: "10px 14px", background: "#F9FAFB", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 2, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0F172A" }}>{s.action}</div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#475569" }}>{s.owner}</div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#94A3B8" }}>{s.due}</div>
                <Trash2 size={13} color="#94A3B8" style={{ cursor: "pointer" }} onClick={() => removeStep(i)} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <input style={{ ...inputStyle, flex: 2, minWidth: 180 }} placeholder="Concrete action for next week..." value={newStep.action} onChange={(e) => setNewStep({ ...newStep, action: e.target.value })} />
            <input style={{ ...inputStyle, width: 140 }} placeholder="Owner" value={newStep.owner} onChange={(e) => setNewStep({ ...newStep, owner: e.target.value })} />
            <input type="date" style={{ ...inputStyle, width: 140 }} value={newStep.due} onChange={(e) => setNewStep({ ...newStep, due: e.target.value })} />
            <Btn small icon={Plus} variant="ghost" onClick={addStep}>Add</Btn>
          </div>
        </ReportSection>

        {/* 6. Decisions required */}
        <ReportSection num={6} title="Decisions Required">
          {notes.decisions.length === 0 && (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94A3B8", fontStyle: "italic" }}>No decisions required from the Sponsor or PM this week.</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notes.decisions.map((d, i) => (
              <div key={i} style={{ border: "1px solid #E2E8F0", borderLeft: "4px solid #F97316", borderRadius: 8, padding: "10px 14px", background: "#F9FAFB" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#F97316" }}>Decision Required</div>
                  <Trash2 size={13} color="#94A3B8" style={{ cursor: "pointer" }} onClick={() => removeDecision(i)} />
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0F172A", marginTop: 4 }}>{d.description}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#475569", marginTop: 3 }}>Owner: {d.owner || "—"} · Needed by: {d.due || "—"}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <input style={{ ...inputStyle, flex: 2, minWidth: 180 }} placeholder="What needs to be decided..." value={newDecision.description} onChange={(e) => setNewDecision({ ...newDecision, description: e.target.value })} />
            <input style={{ ...inputStyle, width: 140 }} placeholder="Decision owner" value={newDecision.owner} onChange={(e) => setNewDecision({ ...newDecision, owner: e.target.value })} />
            <input type="date" style={{ ...inputStyle, width: 140 }} value={newDecision.due} onChange={(e) => setNewDecision({ ...newDecision, due: e.target.value })} />
            <Btn small icon={Plus} variant="ghost" onClick={addDecision}>Add</Btn>
          </div>
        </ReportSection>
      </div>

      <div style={{ background: "#F9FAFB", borderTop: "1px solid #E2E8F0", padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: "#94A3B8" }}>
          <strong style={{ color: "#0F172A" }}>{project.name}</strong> · TCF v0.7 · Mira for AI Adoption
        </div>
        <Btn small icon={Printer} variant="ghost" onClick={() => window.print()}>Print / Export PDF</Btn>
      </div>
    </div>
  );
}

function ReportesView({ projects, clients, programs, programName, clientName, ridaByProject, practicesByProject, kpisByProject, changeByProject, baselineByProject, doraByProject, reportNotesByProject, setReportNotes, setView, setOpenProjectId }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusReportProjectId, setStatusReportProjectId] = useState(projects[0]?.id || "");
  const goTo = (id) => { setOpenProjectId(id); setView("proyectos"); };

  const alerts = useMemo(() => {
    const out = [];
    projects.forEach((p) => {
      if (p.ragCalculated !== p.ragReported) {
        out.push({ id: `disc-${p.id}`, level: "red", text: `${p.name}: the calculated status (${RAG[p.ragCalculated].label}) differs from the status reported by the PM (${RAG[p.ragReported].label}).`, projectId: p.id });
      }
      const rida = ridaByProject[p.id] || [];
      const overdue = rida.filter((r) => r.due?.includes("overdue"));
      if (overdue.length > 0) {
        out.push({ id: `rida-${p.id}`, level: "amber", text: `${p.name}: ${overdue.length} overdue RIDA item(s) unresolved.`, projectId: p.id });
      }
      const practices = practicesByProject[p.id];
      if (practices) {
        let closed = 0, expected = 0;
        TCF_STAGES.forEach((st) => {
          closed += practices[st.key].filter((x) => x.closed).length;
          expected += expectedByMonth(st, p.monthsElapsed);
        });
        if (closed - expected < -6) {
          out.push({ id: `tcf-${p.id}`, level: "red", text: `${p.name}: significant lag in TCF practice adoption relative to the expected target.`, projectId: p.id });
        }
      }
    });
    return out;
  }, [projects, ridaByProject, practicesByProject]);

  const generateReport = (key) => {
    if (key === "avance") {
      return projects.map((p) => ({ label: p.name, value: `Month ${p.monthsElapsed}/${TOTAL_MONTHS} · ${Math.round((p.monthsElapsed / TOTAL_MONTHS) * 100)}% elapsed` }));
    }
    if (key === "riesgos") {
      const all = projects.flatMap((p) => (ridaByProject[p.id] || []).map((r) => ({ ...r, project: p.name })));
      const bySeverity = { red: all.filter((r) => r.severity === "red").length, amber: all.filter((r) => r.severity === "amber").length, green: all.filter((r) => r.severity === "green").length };
      return [
        { label: "Total open RIDA items", value: all.length },
        { label: "Red severity", value: bySeverity.red },
        { label: "Amber severity", value: bySeverity.amber },
      ];
    }
    if (key === "adopcion") {
      return projects.map((p) => {
        const practices = practicesByProject[p.id];
        if (!practices) return { label: p.name, value: "No data" };
        let closed = 0, possible = 0;
        TCF_STAGES.forEach((st) => { closed += practices[st.key].filter((x) => x.closed).length; possible += st.total; });
        return { label: p.name, value: `${closed}/${possible} practices (${Math.round((closed / possible) * 100)}%)` };
      });
    }
    if (key === "satisfaccion") {
      return projects.map((p) => {
        const c = changeByProject[p.id];
        const k = kpisByProject[p.id];
        const spaceS = c?.space?.s?.level ?? "—";
        const stakeholder = k ? k.stakeholderSatisfaction.toFixed(1) : "—";
        return { label: p.name, value: `Team S (SPACE): ${spaceS} · Stakeholders: ${stakeholder}/10` };
      });
    }
    if (key === "beneficios") {
      return projects.map((p) => {
        const k = kpisByProject[p.id];
        if (!k) return { label: p.name, value: "No data" };
        const pct = k.benefitExpected ? Math.round((k.benefitRealized / k.benefitExpected) * 100) : 0;
        return { label: p.name, value: `USD ${k.benefitRealized.toLocaleString()} of USD ${k.benefitExpected.toLocaleString()} (${pct}%)` };
      });
    }
    return [];
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#F97316", fontWeight: 500, marginBottom: 4 }}>REPORTS & DASHBOARDS MODULE</div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: "#0F172A", margin: 0 }}>Status Engine & Proactive Alerts</h1>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>Calculated vs. Reported Status</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F1F5F9" }}>
              {["Project", "Client", "Calculated", "Reported by PM", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => {
              const disc = p.ragCalculated !== p.ragReported;
              return (
                <tr key={p.id} onClick={() => goTo(p.id)} style={{ borderTop: i > 0 ? "1px solid #E2E8F0" : "none", cursor: "pointer" }}>
                  <td style={{ padding: "10px 14px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13.5, color: "#0F172A" }}>{p.name}</td>
                  <td style={{ padding: "10px 14px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#475569" }}>{clientName(p.clientId)}</td>
                  <td style={{ padding: "10px 14px" }}><RagBadge level={p.ragCalculated} /></td>
                  <td style={{ padding: "10px 14px" }}><RagBadge level={p.ragReported} /></td>
                  <td style={{ padding: "10px 14px" }}>
                    {disc && <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, color: "#dc2626", background: "#FDEAEA", padding: "2px 7px", borderRadius: 6 }}>discrepancy</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Bell size={16} color="#F97316" />
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>Proactive Alerts</div>
        </div>
        {alerts.length === 0 && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94A3B8" }}>No active alerts right now.</div>}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {alerts.map((a, i) => (
            <div key={a.id} onClick={() => goTo(a.projectId)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderTop: i > 0 ? "1px solid #E2E8F0" : "none", cursor: "pointer" }}>
              <AlertTriangle size={15} color={RAG[a.level].hex} style={{ marginTop: 1, flexShrink: 0 }} />
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0F172A" }}>{a.text}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A", marginBottom: 14 }}>Report Generator</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          {REPORT_TYPES.map((r) => (
            <button
              key={r.key}
              onClick={() => setSelectedReport(r.key)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10, cursor: "pointer",
                border: selectedReport === r.key ? "1px solid #F97316" : "1px solid #E2E8F0",
                background: selectedReport === r.key ? "#F97316" : "#fff", color: selectedReport === r.key ? "#fff" : "#0F172A",
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12.5,
              }}
            >
              <r.icon size={14} /> {r.name}
            </button>
          ))}
        </div>
        {selectedReport && (
          <div style={{ background: "#F1F5F9", borderRadius: 10, padding: 16 }}>
            {generateReport(selectedReport).map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: i > 0 ? "1px solid #E2E8F0" : "none" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#0F172A" }}>{row.label}</span>
                <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 12.5, color: "#F97316" }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ClipboardList size={16} color="#F97316" />
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, color: "#0F172A" }}>Weekly Status Report</div>
          </div>
          <select style={{ ...inputStyle, width: 220 }} value={statusReportProjectId} onChange={(e) => setStatusReportProjectId(e.target.value)}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8", marginBottom: 16 }}>
          A printable weekly status document per project — status, TCF practice progress, achievements, blockers, next steps, and decisions. Available for every project in the portfolio.
        </div>
        {statusReportProjectId && (
          <WeeklyStatusReport
            project={projects.find((p) => p.id === statusReportProjectId)}
            clientName={clientName} programName={programName}
            rida={ridaByProject[statusReportProjectId] || []}
            practices={practicesByProject[statusReportProjectId]}
            baseline={baselineByProject[statusReportProjectId]}
            dora={doraByProject[statusReportProjectId]}
            notes={reportNotesByProject[statusReportProjectId] || { statusContext: "", achievements: [], manualRisks: [], nextSteps: [], decisions: [] }}
            setNotes={(next) => setReportNotes(statusReportProjectId, next)}
          />
        )}
      </Card>
    </div>
  );
}

/* ============================== 5.6 ADMINISTRATION ============================== */

function AdministracionView({ users, setUsers, catalogs, setCatalogs, clients, projects, setModal }) {
  const [tab, setTab] = useState("clientes");
  const [showUserForm, setShowUserForm] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", role: "Project Manager" });
  const [catalogDrafts, setCatalogDrafts] = useState({});

  const addUser = () => {
    if (!draft.name) return;
    setUsers([...users, { id: Date.now(), ...draft, status: "Invited" }]);
    setDraft({ name: "", email: "", role: "Project Manager" });
    setShowUserForm(false);
  };
  const removeUser = (id) => setUsers(users.filter((u) => u.id !== id));

  const addCatalogItem = (cat) => {
    const value = catalogDrafts[cat];
    if (!value) return;
    setCatalogs({ ...catalogs, [cat]: [...catalogs[cat], value] });
    setCatalogDrafts({ ...catalogDrafts, [cat]: "" });
  };
  const removeCatalogItem = (cat, item) => setCatalogs({ ...catalogs, [cat]: catalogs[cat].filter((i) => i !== item) });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#F97316", fontWeight: 500, marginBottom: 4 }}>ADMINISTRATION MODULE</div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: "#0F172A", margin: 0 }}>Clients, Users, Roles & Catalogs</h1>
      </div>

      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #E2E8F0" }}>
        {[["clientes", "Clients"], ["usuarios", "Users & Roles"], ["permisos", "Permissions by Role"], ["catalogos", "Catalogs"]].map(([key, label]) => (
          <div
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "10px 4px", marginRight: 18, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13.5,
              color: tab === key ? "#F97316" : "#475569", borderBottom: tab === key ? "2px solid #F97316" : "2px solid transparent",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {tab === "clientes" && (
        <Card style={{ padding: 0 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: 16 }}>
            <Btn small icon={Plus} onClick={() => setModal("cliente")}>New Client</Btn>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F1F5F9" }}>
                {["Client", "TCF Tier", "Contact", "Projects"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 18px", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i > 0 ? "1px solid #E2E8F0" : "none" }}>
                  <td style={{ padding: "12px 18px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13.5, color: "#0F172A" }}>{c.name}</td>
                  <td style={{ padding: "12px 18px", fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#F97316" }}>{c.tier}</td>
                  <td style={{ padding: "12px 18px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#475569" }}>{c.contact}</td>
                  <td style={{ padding: "12px 18px", fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#0F172A" }}>
                    {projects.filter((p) => p.clientId === c.id).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "usuarios" && (
        <Card style={{ padding: 0 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: 16 }}>
            <Btn small icon={Plus} onClick={() => setShowUserForm((s) => !s)}>New User</Btn>
          </div>
          {showUserForm && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 16px 16px" }}>
              <input style={{ ...inputStyle, flex: 1, minWidth: 160 }} placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              <input style={{ ...inputStyle, flex: 1, minWidth: 200 }} placeholder="Email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              <select style={{ ...inputStyle, width: 210 }} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
                {ROLE_PERMISSIONS.map((r) => <option key={r.role}>{r.role}</option>)}
              </select>
              <Btn small onClick={addUser}>Save</Btn>
            </div>
          )}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F1F5F9" }}>
                {["User", "Email", "Role", "Status", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderTop: i > 0 ? "1px solid #E2E8F0" : "none" }}>
                  <td style={{ padding: "10px 16px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{u.name}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#475569" }}>{u.email}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#F97316" }}>{u.role}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: u.status === "Active" ? "#10B981" : "#F59E0B", background: u.status === "Active" ? "#E5F9F1" : "#FEF3E0", padding: "2px 8px", borderRadius: 999 }}>{u.status}</span>
                  </td>
                  <td style={{ padding: "10px 16px" }}><Trash2 size={14} color="#CBD5E1" style={{ cursor: "pointer" }} onClick={() => removeUser(u.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "permisos" && (
        <Card style={{ padding: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 16px 0" }}>
            <Lock size={14} color="#94A3B8" />
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8" }}>The Client role keeps a limited scope by design (see section 4 of the specifications).</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr style={{ background: "#F1F5F9" }}>
                {["Role", "Projects", "RIDA", "Approvals", "TCF Adoption", "Clients"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLE_PERMISSIONS.map((r, i) => (
                <tr key={r.role} style={{ borderTop: i > 0 ? "1px solid #E2E8F0" : "none", background: r.role === "Client" ? "#FEF3E0" : "transparent" }}>
                  <td style={{ padding: "10px 16px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{r.role}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#475569" }}>{r.proyectos}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#475569" }}>{r.rida}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#475569" }}>{r.aprobaciones}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#475569" }}>{r.tcf}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#475569" }}>{r.clientes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "catalogos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Object.entries(catalogs).map(([cat, items]) => (
            <Card key={cat}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <ListChecks size={15} color="#F97316" />
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14.5, color: "#0F172A" }}>{cat}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {items.map((item) => (
                  <span key={item} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#0F172A", background: "#F8FAFC", padding: "5px 10px", borderRadius: 8 }}>
                    {item}
                    <X size={12} color="#94A3B8" style={{ cursor: "pointer" }} onClick={() => removeCatalogItem(cat, item)} />
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1, maxWidth: 260 }}
                  placeholder="New value"
                  value={catalogDrafts[cat] || ""}
                  onChange={(e) => setCatalogDrafts({ ...catalogDrafts, [cat]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addCatalogItem(cat)}
                />
                <Btn small icon={Plus} variant="ghost" onClick={() => addCatalogItem(cat)}>Add</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== RESOURCES (global view) ============================== */

function RecursosView({ people, projects }) {
  const projectName = (id) => projects.find((p) => p.id === id)?.name || "—";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: "#0F172A", margin: 0 }}>Resources</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {people.map((p) => {
          const total = p.allocations.reduce((s, a) => s + a.pct, 0);
          const overallocated = total > 100;
          return (
            <Card key={p.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{p.name}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#475569" }}>{p.role}</div>
                </div>
                <span style={{
                  fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 500,
                  color: overallocated ? "#dc2626" : "#10B981", background: overallocated ? "#FDEAEA" : "#E5F9F1",
                  padding: "4px 10px", borderRadius: 999,
                }}>
                  {total}% assigned {overallocated && "· overallocated"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {p.allocations.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 150, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#0F172A" }}>{projectName(a.projectId)}</div>
                    <div style={{ flex: 1, height: 6, borderRadius: 4, background: "#E2E8F0" }}>
                      <div style={{ height: "100%", width: `${a.pct}%`, borderRadius: 4, background: "#F97316" }} />
                    </div>
                    <div style={{ width: 34, fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#475569", textAlign: "right" }}>{a.pct}%</div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
