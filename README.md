# Mira — PMO AI Adoption Prototype

Internal prototype for the Teravision PMO. Tracks consulting project portfolios, AI adoption progress via the TCF framework, and team health metrics.

**Status:** Active prototype (not production)  
**Stack:** React 18 + Vite · lucide-react · no backend (all state in-memory)

---

## What it does

- **Portfolio view** — project cards with RAG health status, client/program hierarchy
- **Baseline & Progress** — TCF Stage-weighted schedule engine (no EVM/budget)
- **Adoption Map** — 6-stage TCF EDT (Stage → Practice → Workshop) with practice completion tracking
- **DORA + Cycle Time** — 5 team efficiency metrics (4 DORA official + Cycle Time complementary)
- **SPACE Framework** — 5-dimension team wellbeing pulse (S/C/E via workshop survey, P/A auto-derived)
- **Change & Adoption** — resistance tracking, comms plan, training log
- **ROI & Value** — investment vs. benefit, ROI %, payback, time saved per team
- **Weekly Status Report** — per-project narrative report ready to print/export

---

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

---

## Spec

Full functional spec: `Especificaciones_Funcionales_Basicas_PMO_IA_v2.8.docx`  
Framework reference: [TCF Portal](https://tcl-framework-h9ybc.ondigitalocean.app)

---

*Teravision Technologies — internal use only*
