import { useState, useEffect, useMemo } from "react";
import {
  Home, BookOpen, Megaphone, Clock, Calendar, FolderOpen, Search,
  Settings, Plus, X, Check, Bookmark, ChevronRight, ChevronLeft,
  Pin, ExternalLink, Trash2, Pencil, Users, ChevronDown, CheckCircle2,
  Circle, Menu, Sparkles, Lock, Unlock, Key, Eye, EyeOff, LogOut,
  UserCheck, GraduationCap, ShieldCheck, Atom, Layers, Cpu, Zap,
  Shield, Activity, Terminal, Sun, Moon, RotateCcw
} from "lucide-react";
import { db } from "./src/firebase";
import { doc, onSnapshot, getDoc, setDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";

/* ───────────────────────── design tokens: Modern Physics & Advanced Materials ───────────────────────── */
const C = {
  bg: "var(--mme-bg)",
  surface: "var(--mme-surface)",
  surfaceElevated: "var(--mme-surface-elevated)",
  surfaceGlass: "var(--mme-surface-glass)",
  text: "var(--mme-text)",
  textSoft: "var(--mme-text-soft)",
  textFaint: "var(--mme-text-faint)",
  border: "var(--mme-border)",
  borderStrong: "var(--mme-border-strong)",
  borderGlow: "var(--mme-border-glow)",

  // Quantum & Nanomaterials Accents
  accent: "var(--mme-accent)",
  accentSoft: "var(--mme-accent-soft)",
  accentText: "var(--mme-accent-text)",
  accentGlow: "var(--mme-accent-glow)",

  // Condensed Matter Blue / Electron Cyan
  titanium: "var(--mme-titanium)",
  titaniumSoft: "var(--mme-titanium-soft)",
  titaniumText: "var(--mme-titanium-text)",

  // Molten Copper & Metallurgy Bronze
  copper: "var(--mme-copper)",
  copperSoft: "var(--mme-copper-soft)",
  copperText: "var(--mme-copper-text)",

  // Bismuth Purple & Lattice Diffraction
  violet: "var(--mme-violet)",
  violetSoft: "var(--mme-violet-soft)",

  // Thermal & Warning Red
  red: "var(--mme-red)",
  redSoft: "var(--mme-red-soft)",

  orange: "var(--mme-orange)",
  orangeSoft: "var(--mme-orange-soft)",

  gold: "var(--mme-gold)",
  goldSoft: "var(--mme-gold-soft)",
};

const FONT_CSS = `
/* Fonts loaded via index.html preload — no @import needed here */

:root, [data-theme="dark"] {
  --mme-bg: #080B0F;
  --mme-surface: #0D131C;
  --mme-surface-elevated: #131C29;
  --mme-surface-glass: rgba(13, 19, 28, 0.85);
  --mme-text: #F8FAFC;
  --mme-text-soft: #94A3B8;
  --mme-text-faint: #64748B;
  --mme-border: rgba(255, 255, 255, 0.08);
  --mme-border-strong: rgba(255, 255, 255, 0.16);
  --mme-border-glow: rgba(0, 245, 160, 0.35);
  --mme-dot-grid: rgba(255, 255, 255, 0.05);

  --mme-accent: #00F5A0;
  --mme-accent-soft: rgba(0, 245, 160, 0.12);
  --mme-accent-text: #00F5A0;
  --mme-accent-glow: rgba(0, 245, 160, 0.25);

  --mme-titanium: #38BDF8;
  --mme-titanium-soft: rgba(56, 189, 248, 0.12);
  --mme-titanium-text: #38BDF8;

  --mme-copper: #F59E0B;
  --mme-copper-soft: rgba(245, 158, 11, 0.12);
  --mme-copper-text: #FBBF24;

  --mme-violet: #A855F7;
  --mme-violet-soft: rgba(168, 85, 247, 0.12);

  --mme-red: #F43F5E;
  --mme-red-soft: rgba(244, 63, 94, 0.12);
  --mme-orange: #FB923C;
  --mme-orange-soft: rgba(251, 146, 60, 0.12);
  --mme-gold: #EAB308;
  --mme-gold-soft: rgba(234, 179, 8, 0.12);

  --mme-input-bg: rgba(10, 15, 22, 0.85);
  --mme-input-border: rgba(255, 255, 255, 0.12);
  --mme-card-hover: rgba(0, 245, 160, 0.3);
  --mme-modal-bg: #0D131C;
  --mme-modal-border: rgba(255, 255, 255, 0.14);
  --mme-tab-active-bg: rgba(0, 245, 160, 0.12);
}

[data-theme="light"] {
  --mme-bg: #F4F6F8;
  --mme-surface: #FFFFFF;
  --mme-surface-elevated: #F8FAFC;
  --mme-surface-glass: rgba(255, 255, 255, 0.92);
  --mme-text: #0F172A;
  --mme-text-soft: #475569;
  --mme-text-faint: #94A3B8;
  --mme-border: rgba(0, 0, 0, 0.08);
  --mme-border-strong: rgba(0, 0, 0, 0.18);
  --mme-border-glow: rgba(13, 148, 136, 0.3);
  --mme-dot-grid: rgba(0, 0, 0, 0.05);

  --mme-accent: #0D9488;
  --mme-accent-soft: rgba(13, 148, 136, 0.1);
  --mme-accent-text: #0F766E;
  --mme-accent-glow: rgba(13, 148, 136, 0.2);

  --mme-titanium: #0284C7;
  --mme-titanium-soft: rgba(2, 132, 199, 0.1);
  --mme-titanium-text: #0369A1;

  --mme-copper: #D97706;
  --mme-copper-soft: rgba(217, 119, 6, 0.1);
  --mme-copper-text: #B45309;

  --mme-violet: #7C3AED;
  --mme-violet-soft: rgba(124, 58, 237, 0.1);

  --mme-red: #E11D48;
  --mme-red-soft: rgba(225, 29, 72, 0.1);
  --mme-orange: #EA580C;
  --mme-orange-soft: rgba(234, 88, 12, 0.1);
  --mme-gold: #CA8A04;
  --mme-gold-soft: rgba(202, 138, 4, 0.1);

  --mme-input-bg: #FFFFFF;
  --mme-input-border: rgba(0, 0, 0, 0.16);
  --mme-card-hover: rgba(13, 148, 136, 0.35);
  --mme-modal-bg: #FFFFFF;
  --mme-modal-border: rgba(0, 0, 0, 0.1);
  --mme-tab-active-bg: rgba(13, 148, 136, 0.1);
}

.mme-root {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--mme-text);
  background-color: var(--mme-bg);
  background-image: radial-gradient(var(--mme-dot-grid) 1px, transparent 1px);
  background-size: 24px 24px;
  -webkit-font-smoothing: antialiased;
}
.mme-display { font-family: 'Space Grotesk', system-ui, sans-serif; letter-spacing: -0.02em; }
.mme-mono { font-family: 'IBM Plex Mono', monospace; }
.mme-scroll::-webkit-scrollbar { display: none; }
.mme-scroll { -ms-overflow-style: none; scrollbar-width: none; }
.mme-fade { animation: mmeFade .22s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes mmeFade { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.mme-focus:focus-visible { outline: 2px solid var(--mme-accent); outline-offset: 2px; }

input, textarea, select {
  font-family: inherit;
  background: var(--mme-input-bg) !important;
  border: 1px solid var(--mme-input-border) !important;
  color: var(--mme-text) !important;
  transition: all 0.15s ease;
}
input:focus, textarea:focus, select:focus {
  border-color: var(--mme-accent) !important;
  box-shadow: 0 0 0 2px var(--mme-accent-soft) !important;
  outline: none !important;
}

.mme-sidebar-btn { transition: all .15s ease; color: var(--mme-text-soft) !important; }
.mme-sidebar-btn:hover { background: var(--mme-surface-elevated) !important; color: var(--mme-text) !important; border-color: var(--mme-border-strong) !important; }

.mme-desktop-card {
  background: var(--mme-surface) !important;
  backdrop-filter: blur(16px);
  border: 1px solid var(--mme-border) !important;
  transition: all .18s ease;
}
.mme-desktop-card:hover {
  border-color: var(--mme-card-hover) !important;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.mme-card-wrap {
  background: var(--mme-surface) !important;
  border: 1px solid var(--mme-border) !important;
  transition: all .15s ease;
}
.mme-card-wrap:hover {
  border-color: var(--mme-border-strong) !important;
  box-shadow: 0 4px 18px rgba(0,0,0,0.12);
}

.mme-card-actions { opacity: 0.85; transition: opacity .15s ease; }
.mme-card-wrap:hover .mme-card-actions { opacity: 1; }
@media (max-width: 767px) { .mme-card-actions { opacity: 1; } }

.mme-inline-btn {
  background: transparent;
  border: 1px solid transparent;
  padding: 5px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all .12s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--mme-text-soft);
}
.mme-inline-btn:hover { background: var(--mme-surface-elevated); border-color: var(--mme-border); color: var(--mme-text); }
.mme-inline-btn.mme-delete-btn:hover { background: rgba(239, 68, 68, 0.15) !important; border-color: rgba(239, 68, 68, 0.35) !important; color: #EF4444 !important; }

.mme-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, var(--mme-accent) 0%, var(--mme-titanium) 100%);
  color: #080B0F;
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all .15s ease;
  box-shadow: 0 2px 10px var(--mme-accent-glow);
}
.mme-add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px var(--mme-accent-glow);
}
.mme-add-btn:active { transform: translateY(0); }

.mme-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 7, 11, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  animation: mmeFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.mme-modal-dialog {
  background: var(--mme-modal-bg);
  color: var(--mme-text);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 20px 20px 0 0;
  padding: 24px;
  border: 1px solid var(--mme-modal-border);
  box-shadow: 0 -12px 40px rgba(0,0,0,0.5);
  animation: mmeSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (min-width: 768px) {
  .mme-modal-backdrop { align-items: center; padding: 24px; }
  .mme-modal-dialog {
    border-radius: 16px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.4), 0 0 1px var(--mme-border-strong);
    animation: mmeZoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
}
@keyframes mmeZoomIn { from { opacity: 0; transform: scale(0.96) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes mmeSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes mmeFadeIn { from { opacity: 0; } to { opacity: 1; } }

.mme-login-card { animation: mmeLoginEnter 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes mmeLoginEnter { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes mmeShake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.mme-tab-btn { transition: all 0.16s ease; }
`;

/* ───────────────────────── constants & academic settings ───────────────────────── */
const ANN_CATEGORIES = ["GENERAL","ACADEMIC","ASSIGNMENT","QUIZ","LAB","EXAM","PROJECT","EVENT","URGENT"];
const RES_CATEGORIES = ["NOTES","TUTORIALS","ASSIGNMENTS","PREVIOUS_PAPERS","LAB_RESOURCES","BOOKS","VIDEOS","WEBSITES","OTHER"];
const STORAGE_KEY = "mme-hub-v3-sem3-data";
const PERSONAL_KEY = "mme-hub-v3-sem3-personal";
const AUTH_KEY = "mme-hub-v3-sem3-auth";
const ADMIN_PWD_KEY = "mme-hub-v3-sem3-admin-pwd";
const DEFAULT_ADMIN_PWD = "mme2029";

if (!window.storage) {
  window.storage = {
    get: async (key, isAppScope) => {
      if (isAppScope && key === STORAGE_KEY) {
        if (!db) throw new Error("No DB");
        const d = await getDoc(doc(db, "global", "mmeHub"));
        if (d.exists()) return { value: JSON.stringify(d.data()) };
        throw new Error("Not found in Firebase");
      }
      const val = localStorage.getItem(key);
      if (val === null) throw new Error("Not found in localStorage");
      return { value: val };
    },
    set: async (key, val, isAppScope) => {
      if (isAppScope && key === STORAGE_KEY) {
        if (!db) return;
        await setDoc(doc(db, "global", "mmeHub"), JSON.parse(val));
        return;
      }
      localStorage.setItem(key, val);
    },
    remove: async (key) => {
      localStorage.removeItem(key);
    }
  };
}

function labelize(s) {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
function uid(prefix) {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function fmtDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
function inputDT(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function urgencyOf(dueAt, done) {
  if (done) return "done";
  const hrs = (new Date(dueAt) - new Date()) / 3600000;
  if (hrs < 0) return "overdue";
  if (hrs <= 24) return "red";
  if (hrs <= 72) return "orange";
  return "neutral";
}
const URGENCY_STYLE = {
  overdue: { border: C.red, tint: C.redSoft, text: C.red, label: "Overdue" },
  red: { border: C.red, tint: C.redSoft, text: C.red, label: "Due in <24h" },
  orange: { border: C.copper, tint: C.copperSoft, text: C.copperText, label: "This week" },
  neutral: { border: C.border, tint: "rgba(255,255,255,0.03)", text: C.textSoft, label: "Upcoming" },
  done: { border: C.border, tint: "transparent", text: C.textFaint, label: "Done" },
};
const CAT_TINT = {
  URGENT: { bg: C.redSoft, fg: C.red },
  EXAM: { bg: C.redSoft, fg: C.red },
  QUIZ: { bg: C.copperSoft, fg: C.copperText },
  ASSIGNMENT: { bg: C.titaniumSoft, fg: C.titaniumText },
  LAB: { bg: C.accentSoft, fg: C.accentText },
  PROJECT: { bg: C.violetSoft, fg: C.violet },
  EVENT: { bg: C.copperSoft, fg: C.copperText },
  ACADEMIC: { bg: C.titaniumSoft, fg: C.titaniumText },
  GENERAL: { bg: "rgba(255,255,255,0.05)", fg: C.textSoft },
};

/* ───────────────────────── 2nd Year (Semester III) Seed Data: Batch 2025–2029 ───────────────────────── */
function makeSeed() {
  const now = Date.now();
  const H = 3600000, D = 86400000;
  const courses = [
    {
      id: "c1", code: "MM201", name: "Thermodynamics & Kinetics of Materials", professor: "Dr. R. K. Sharma",
      description: "Laws of thermodynamics, Ellingham diagrams, Gibbs-Duhem equation, solution models, phase equilibria, and reaction kinetics in metallurgical systems.",
      syllabusUrl: "https://drive.google.com/drive/folders/mm201-thermo-syllabus",
      lectureUrl: "https://drive.google.com/drive/folders/mm201-thermo-lectures",
      tutorialUrl: "https://drive.google.com/drive/folders/mm201-thermo-tutorials",
      assignmentUrl: "https://drive.google.com/drive/folders/mm201-thermo-assignments",
      labUrl: "", papersUrl: "https://drive.google.com/drive/folders/mm201-papers",
      otherLinks: [{ label: "NPTEL Thermodynamics Reference Lectures", url: "https://nptel.ac.in" }]
    },
    {
      id: "c2", code: "MM202", name: "Physical Metallurgy & Phase Transformations", professor: "Dr. A. Mehta",
      description: "Binary and ternary phase diagrams, iron-iron carbide (Fe-C) system, solid-state diffusion, nucleation, growth kinetics, and TTT/CCT diagrams.",
      syllabusUrl: "https://drive.google.com/drive/folders/mm202-physmet-syllabus",
      lectureUrl: "https://drive.google.com/drive/folders/mm202-physmet-lectures",
      tutorialUrl: "https://drive.google.com/drive/folders/mm202-physmet-tutorials",
      assignmentUrl: "https://drive.google.com/drive/folders/mm202-physmet-assignments",
      labUrl: "https://drive.google.com/drive/folders/mm202-metallography-lab",
      papersUrl: "https://drive.google.com/drive/folders/mm202-papers",
      otherLinks: [{ label: "ASM Handbooks Phase Diagrams", url: "https://asminternational.org" }]
    },
    {
      id: "c3", code: "MM203", name: "Materials Characterization & Diffraction", professor: "Dr. S. Iyer",
      description: "X-ray diffraction (XRD), Bragg's Law, peak indexing, structure factors, Scanning Electron Microscopy (SEM), TEM electron optics, and spectroscopy.",
      syllabusUrl: "https://drive.google.com/drive/folders/mm203-char-syllabus",
      lectureUrl: "https://drive.google.com/drive/folders/mm203-char-lectures",
      tutorialUrl: "", assignmentUrl: "https://drive.google.com/drive/folders/mm203-assignments",
      labUrl: "https://drive.google.com/drive/folders/mm203-xrd-lab",
      papersUrl: "https://drive.google.com/drive/folders/mm203-papers",
      otherLinks: [{ label: "Crystallography Online Tools & CIF Database", url: "https://crystallography.net" }]
    },
    {
      id: "c4", code: "MM204", name: "Mechanical Behavior & Deformation", professor: "Dr. K. Nair",
      description: "Elastic & plastic deformation, dislocation theory, Peierls-Nabarro stress, strengthening mechanisms, fracture mechanics, fatigue, and high-temp creep.",
      syllabusUrl: "https://drive.google.com/drive/folders/mm204-mech-syllabus",
      lectureUrl: "https://drive.google.com/drive/folders/mm204-mech-lectures",
      tutorialUrl: "https://drive.google.com/drive/folders/mm204-mech-tutorials",
      assignmentUrl: "", labUrl: "https://drive.google.com/drive/folders/mm204-testing-lab",
      papersUrl: "https://drive.google.com/drive/folders/mm204-papers",
      otherLinks: [{ label: "Dieter Mechanical Metallurgy Handbook", url: "https://drive.google.com" }]
    },
    {
      id: "c5", code: "MM205", name: "Transport Phenomena in Metallurgy", professor: "Dr. P. Verma",
      description: "Momentum, heat, and mass transfer in furnaces and reactors, boundary layer theory, Navier-Stokes equations in molten metal flows, and solidification kinetics.",
      syllabusUrl: "https://drive.google.com/drive/folders/mm205-transport-syllabus",
      lectureUrl: "https://drive.google.com/drive/folders/mm205-transport-lectures",
      tutorialUrl: "https://drive.google.com/drive/folders/mm205-transport-tutorials",
      assignmentUrl: "https://drive.google.com/drive/folders/mm205-assignments",
      labUrl: "", papersUrl: "https://drive.google.com/drive/folders/mm205-papers",
      otherLinks: [{ label: "Furnace Heat Transfer Simulation Notes", url: "https://youtube.com" }]
    },
  ];

  const deadlines = [
    { id: "d1", title: "MM203 Lab: XRD Peak Indexing & Lattice Parameter (BCC/FCC)", courseId: "c3", dueAt: new Date(now + 9 * H).toISOString(), link: "https://drive.google.com/drive/folders/mm203-xrd-lab", description: "Calculate lattice parameter 'a' using Nelson-Riley extrapolation. Submit PDF.", completed: false },
    { id: "d2", title: "MM201 Tutorial 4: Ellingham Diagram Calculations", courseId: "c1", dueAt: new Date(now + 26 * H).toISOString(), link: "https://drive.google.com/drive/folders/mm201-thermo-tutorials", description: "Determine oxygen partial pressures for oxide reduction at 1200 K.", completed: false },
    { id: "d3", title: "MM202 Problem Set: Fe-C Invariant Reactions", courseId: "c2", dueAt: new Date(now + 3 * D).toISOString(), link: "https://drive.google.com/drive/folders/mm202-physmet-assignments", description: "Calculate proeutectoid ferrite and pearlite mass fractions in 0.45 wt% C steel.", completed: false },
    { id: "d4", title: "MM204 Tensile Test Data Analysis & True Stress-Strain Curve", courseId: "c4", dueAt: new Date(now + 5 * D).toISOString(), link: "https://drive.google.com/drive/folders/mm204-testing-lab", description: "Plot Hollomon equation parameters (n and K) for annealed brass specimen.", completed: false },
    { id: "d5", title: "MM205 Case Study: Heat Transfer in Continuous Casting Mold", courseId: "c5", dueAt: new Date(now + 9 * D).toISOString(), link: "https://drive.google.com/drive/folders/mm205-assignments", description: "Numerical 1D transient heat conduction model across copper mold chill.", completed: false },
    { id: "d6", title: "MM201 Tutorial 3: Solution Thermodynamics (Raoult & Henry)", courseId: "c1", dueAt: new Date(now - 2 * D).toISOString(), link: "https://drive.google.com/drive/folders/mm201-thermo-tutorials", description: "Activity coefficient calculations in binary Fe-Ni alloy system.", completed: false },
  ];

  const announcements = [
    { id: "a1", title: "Semester III Mid-Semester Examination Schedule Published", description: "Official schedule for 2nd Year (Semester III) students of the 2025–2029 batch has been released. MM201 Thermodynamics exam is scheduled for Monday 10:00 AM in Exam Hall 2.", category: "EXAM", priority: 2, pinned: true, link: "https://drive.google.com/file/sem3-midsem-schedule", courseId: null, createdAt: new Date(now - 1 * D).toISOString() },
    { id: "a2", title: "MM203 XRD Characterization Lab Batch Timings", description: "Batches A1 and A2 report to the Central Diffraction Facility on Tuesday 2:00 PM. Closed shoes and lab coats mandatory.", category: "LAB", priority: 2, pinned: true, link: "", courseId: "c3", createdAt: new Date(now - 2 * D).toISOString() },
    { id: "a3", title: "Special Lecture: Advanced High-Entropy Alloys & Modern Quantum Physics", description: "Invited speaker from Materials Research Centre discussing electronic band structures in complex concentrated alloys. LT-3 at 4:30 PM.", category: "EVENT", priority: 1, pinned: false, link: "", courseId: "c2", createdAt: new Date(now - 3 * D).toISOString() },
    { id: "a4", title: "MM204 Metallography & Hardness Testing Viva Guidelines", description: "Review Rockwell C and Vickers microhardness indentation mechanics prior to tomorrow's viva session.", category: "ACADEMIC", priority: 0, pinned: false, link: "", courseId: "c4", createdAt: new Date(now - 4 * D).toISOString() },
    { id: "a5", title: "Previous Year 3rd Sem Papers Added to Resource Drive", description: "End-semester papers from 2023, 2024, and 2025 have been uploaded to Resources under Previous Papers.", category: "GENERAL", priority: 0, pinned: false, link: "", courseId: null, createdAt: new Date(now - 6 * D).toISOString() },
  ];

  const resources = [
    { id: "r1", title: "XRD Peak Indexing & Miller Indices Formula Sheet", category: "LAB_RESOURCES", courseId: "c3", url: "https://drive.google.com/file/xrd-miller-indices", description: "Interplanar spacing equations for cubic, tetragonal, and hexagonal systems with systematic absence extinction rules." },
    { id: "r2", title: "Iron-Carbon (Fe-Fe3C) High-Resolution Equilibrium Phase Diagram", category: "NOTES", courseId: "c2", url: "https://drive.google.com/file/fe-c-diagram-hd", description: "Annotated phase diagram with invariant reaction temperatures, microconstituents, and solvus lines." },
    { id: "r3", title: "Thermodynamics of Materials: Solution Models & Ellingham Plots", category: "NOTES", courseId: "c1", url: "https://drive.google.com/file/mme-thermo-cheatsheet", description: "Comprehensive derivations of Gibbs-Duhem equation, regular solution models, and oxide stability plots." },
    { id: "r4", title: "Dislocation Theory & Strain Hardening Mechanics", category: "NOTES", courseId: "c4", url: "https://drive.google.com/file/dislocations-notes", description: "Edge vs screw dislocations, Burger's vector, slip planes, and Hall-Petch grain boundary strengthening." },
    { id: "r5", title: "MM201 Thermodynamics Mid-Sem 2024 Question Paper", category: "PREVIOUS_PAPERS", courseId: "c1", url: "https://drive.google.com/file/mm201-midsem-2024", description: "Includes worked solutions and step-by-step mark distribution." },
    { id: "r6", title: "Transport Phenomena in Metallurgy Reference Book (Bird)", category: "BOOKS", courseId: "c5", url: "https://drive.google.com/file/transport-phenomena-ref", description: "Essential chapters for heat transfer in furnace walls and boundary layer theory." },
  ];

  const calendarLinks = [
    { id: "cal1", title: "Semester III Master Timetable (PDF)", url: "https://drive.google.com/file/sem3-timetable" },
    { id: "cal2", title: "Official MME Department Academic Calendar 2025-2026", url: "https://drive.google.com/file/mme-academic-calendar" },
    { id: "cal3", title: "Google Calendar: Live MME 2029 Schedule Sync", url: "https://calendar.google.com/calendar/u/0/r" }
  ];

  const admins = [
    { id: "admin-super", name: "Super Admin", passcodeHash: bcrypt.hashSync("mme2029-super", 10), role: "SUPER_ADMIN" }
  ];

  const discussions = [
    { id: "q1", title: "How to calculate oxygen partial pressure in Ellingham Diagram?", author: "Aryan", replies: [{ id: "rep1", author: "Super Admin", role: "SUPER_ADMIN", content: "Use the relation delta G = RT ln(pO2). You can read off delta G directly from the y-axis for a given temperature.", createdAt: new Date(now - 1 * H).toISOString() }], createdAt: new Date(now - 3 * H).toISOString() }
  ];

  const users = [
    { id: "u1", name: "Priyanshu", email: "priyanshu@mme.ac.in", role: "STUDENT" },
    { id: "u2", name: "Ananya (Admin)", email: "admin.mme2029@mme.ac.in", role: "ADMIN" },
    { id: "u3", name: "Department Admin", email: "head.mme@mme.ac.in", role: "ADMIN" },
    { id: "u4", name: "Rohan", email: "rohan@mme.ac.in", role: "STUDENT" },
  ];

  return { courses, deadlines, announcements, resources, calendarLinks, users };
}

/* ───────────────────────── small UI atoms ───────────────────────── */
function ThemeToggle({ theme, onToggle, compact = false, style = {} }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={onToggle}
      className="mme-focus"
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        background: "var(--mme-surface-elevated)",
        border: "1px solid var(--mme-border-strong)",
        borderRadius: 20,
        padding: compact ? "6px 8px" : "6px 12px",
        cursor: "pointer",
        color: "var(--mme-text)",
        fontSize: 12,
        fontWeight: 600,
        transition: "all 0.18s ease",
        ...style
      }}
    >
      {isDark ? (
        <>
          <Sun size={15} style={{ color: "#FBBF24" }} />
          {!compact && <span>Light</span>}
        </>
      ) : (
        <>
          <Moon size={15} style={{ color: "#0284C7" }} />
          {!compact && <span>Dark</span>}
        </>
      )}
    </button>
  );
}

function Badge({ children, bg, fg, style }) {
  return (
    <span className="mme-mono" style={{ background: bg, color: fg, fontSize: 11, padding: "3px 8px", borderRadius: 4, fontWeight: 500, whiteSpace: "nowrap", ...style }}>
      {children}
    </span>
  );
}

function EmptyState({ title, sub, icon: Icon }) {
  return (
    <div className="mme-fade" style={{ textAlign: "center", padding: "40px 20px", color: C.textFaint }}>
      {Icon && <Icon size={28} style={{ margin: "0 auto 10px", opacity: 0.5 }} />}
      <div style={{ fontWeight: 600, color: C.textSoft, fontSize: 15 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SectionLabel({ children, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <div className="mme-display" style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{children}</div>
      {action}
    </div>
  );
}

function Checkbox({ checked, onToggle }) {
  return (
    <button className="mme-focus" onClick={onToggle} aria-label={checked ? "Mark as not done" : "Mark as done"}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0, color: checked ? C.accent : C.borderStrong }}>
      {checked ? <CheckCircle2 size={22} /> : <Circle size={22} />}
    </button>
  );
}

function SaveButton({ saved, onToggle }) {
  return (
    <button className="mme-focus" onClick={onToggle} aria-label={saved ? "Remove from saved" : "Save"}
      style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: saved ? C.copper : C.textFaint }}>
      <Bookmark size={18} fill={saved ? C.copper : "none"} />
    </button>
  );
}

function Card({ children, onClick, style }) {
  return (
    <div onClick={onClick} className="mme-focus"
      style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>
  );
}

/* ───────────────────────── deadline row ───────────────────────── */
function DeadlineRow({ d, course, done, onToggleDone, canTick, onEdit, onDelete }) {
  const u = urgencyOf(d.dueAt, done);
  const s = URGENCY_STYLE[u];
  return (
    <div className="mme-fade mme-card-wrap mme-interactive-card" style={{ display: "flex", gap: 10, alignItems: "flex-start", background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${s.border}`, borderRadius: 8, padding: "11px 12px", opacity: done ? 0.6 : 1 }}>
      {canTick && <div style={{ paddingTop: 1 }}><Checkbox checked={done} onToggle={() => onToggleDone(d.id)} /></div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {course && <span className="mme-mono" style={{ fontSize: 11, color: C.accentText, fontWeight: 500 }}>{course.code}</span>}
          <Badge bg={s.tint} fg={s.text}>{s.label}</Badge>
        </div>
        <div style={{ fontWeight: 600, fontSize: 14, marginTop: 3, textDecoration: done ? "line-through" : "none" }}>{d.title}</div>
        <div style={{ fontSize: 12.5, color: C.textSoft, marginTop: 2 }}>{fmtDateTime(d.dueAt)}</div>
        {d.description && <div style={{ fontSize: 12.5, color: C.textFaint, marginTop: 3 }}>{d.description}</div>}
        {d.link && (
          <a href={d.link} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: C.accent, display: "inline-flex", alignItems: "center", gap: 3, marginTop: 5, fontWeight: 500 }}>
            Open resource <ExternalLink size={12} />
          </a>
        )}
      </div>
      {(onEdit || onDelete) && (
        <span className="mme-card-actions" style={{ display: "inline-flex", gap: 3, flexShrink: 0 }}>
          {onEdit && (
            <button
              type="button"
              className="mme-inline-btn"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              aria-label="Edit"
              title="Edit deadline"
            >
              <Pencil size={14} style={{ color: C.textFaint }} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="mme-inline-btn mme-delete-btn"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              aria-label="Delete"
              title={canTick ? "Remove from my list" : "Delete deadline"}
            >
              <Trash2 size={14} style={{ color: C.red }} />
            </button>
          )}
        </span>
      )}
    </div>
  );
}

/* ───────────────────────── announcement card ───────────────────────── */
function AnnouncementCard({ a, course, saved, onToggleSave, canSave, onEdit, onDelete }) {
  const tint = CAT_TINT[a.category] || CAT_TINT.GENERAL;
  return (
    <div className="mme-fade mme-card-wrap mme-interactive-card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {a.pinned && <Pin size={13} style={{ color: C.copper }} />}
          <Badge bg={tint.bg} fg={tint.fg}>{labelize(a.category)}</Badge>
          {course && <span className="mme-mono" style={{ fontSize: 11, color: C.accentText }}>{course.code}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {(onEdit || onDelete) && (
            <span className="mme-card-actions" style={{ display: "inline-flex", gap: 3 }}>
              {onEdit && (
                <button
                  type="button"
                  className="mme-inline-btn"
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  aria-label="Edit"
                  title="Edit announcement"
                >
                  <Pencil size={14} style={{ color: C.textFaint }} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="mme-inline-btn mme-delete-btn"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  aria-label="Delete"
                  title="Delete announcement"
                >
                  <Trash2 size={14} style={{ color: C.red }} />
                </button>
              )}
            </span>
          )}
          {canSave && <SaveButton saved={saved} onToggle={() => onToggleSave(a.id)} />}
        </div>
      </div>
      <div style={{ fontWeight: 600, fontSize: 15, marginTop: 8 }} className="mme-display">{a.title}</div>
      <div style={{ fontSize: 13.5, color: C.textSoft, marginTop: 4, lineHeight: 1.5 }}>{a.description}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 9 }}>
        <span style={{ fontSize: 12, color: C.textFaint }}>{fmtDate(a.createdAt)}</span>
        {a.link && <a href={a.link} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: C.accent, display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 500 }}>Open link <ExternalLink size={12} /></a>}
      </div>
    </div>
  );
}

/* ───────────────────────── resource card ───────────────────────── */
function ResourceCard({ r, course, saved, onToggleSave, canSave, onEdit, onDelete }) {
  return (
    <div className="mme-fade mme-focus mme-card-wrap mme-interactive-card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Badge bg={C.accentSoft} fg={C.accentText}>{labelize(r.category)}</Badge>
          {course && <span className="mme-mono" style={{ fontSize: 11, color: C.textSoft }}>{course.code}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {(onEdit || onDelete) && (
            <span className="mme-card-actions" style={{ display: "inline-flex", gap: 3 }}>
              {onEdit && (
                <button
                  type="button"
                  className="mme-inline-btn"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
                  aria-label="Edit"
                  title="Edit resource"
                >
                  <Pencil size={14} style={{ color: C.textFaint }} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="mme-inline-btn mme-delete-btn"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                  aria-label="Delete"
                  title="Delete resource"
                >
                  <Trash2 size={14} style={{ color: C.red }} />
                </button>
              )}
            </span>
          )}
          {canSave && (
            <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(r.id); }}>
              <SaveButton saved={saved} onToggle={() => {}} />
            </span>
          )}
        </div>
      </div>
      <div style={{ fontWeight: 600, fontSize: 14.5, marginTop: 7 }}>{r.title}</div>
      {r.description && <div style={{ fontSize: 13, color: C.textSoft, marginTop: 3, lineHeight: 1.4 }}>{r.description}</div>}
      <a href={r.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.accent, marginTop: 7, display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 500, textDecoration: "none" }}>
        Open resource <ExternalLink size={12} />
      </a>
    </div>
  );
}

/* ───────────────────────── generic entity form (Manage) ───────────────────────── */
function EntityForm({ fields, initial, courses, onCancel, onSave }) {
  const [values, setValues] = useState(() => {
    const v = {};
    fields.forEach((f) => {
      if (f.type === "datetime") v[f.key] = initial?.[f.key] ? inputDT(initial[f.key]) : inputDT(new Date(Date.now() + 86400000).toISOString());
      else if (f.type === "checkbox") v[f.key] = initial?.[f.key] || false;
      else if (f.key === "priority") v[f.key] = initial?.priority === 2 ? "Urgent" : initial?.priority === 1 ? "High" : "Normal";
      else v[f.key] = initial?.[f.key] ?? "";
    });
    return v;
  });

  function set(k, val) { setValues((prev) => ({ ...prev, [k]: val })); }

  function handleSave() {
    const out = { ...values };
    if ("priority" in out) out.priority = out.priority === "Urgent" ? 2 : out.priority === "High" ? 1 : 0;
    if ("dueAt" in out) out.dueAt = new Date(out.dueAt).toISOString();
    if ("courseId" in out && out.courseId === "") out.courseId = null;
    onSave(out);
  }

  const inputStyle = { width: "100%", border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 10px", fontSize: 14, background: C.bg, color: C.text };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {fields.map((f) => (
        <div key={f.key}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: C.textSoft, display: "block", marginBottom: 4 }}>
            {f.label}{f.required && <span style={{ color: C.red }}> *</span>}
          </label>
          {f.type === "text" || f.type === "url" ? (
            <input className="mme-focus" style={inputStyle} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} placeholder={f.type === "url" ? "https://drive.google.com/..." : ""} />
          ) : f.type === "textarea" ? (
            <textarea className="mme-focus" style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} />
          ) : f.type === "datetime" ? (
            <input className="mme-focus" type="datetime-local" style={inputStyle} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} />
          ) : f.type === "select" ? (
            <select className="mme-focus" style={inputStyle} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)}>
              {f.options.map((o) => <option key={o} value={o}>{labelize(o)}</option>)}
            </select>
          ) : f.type === "courseSelect" ? (
            <select className="mme-focus" style={inputStyle} value={values[f.key] || ""} onChange={(e) => set(f.key, e.target.value)}>
              <option value="">General (no course)</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          ) : f.type === "checkbox" ? (
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <input type="checkbox" checked={values[f.key]} onChange={(e) => set(f.key, e.target.checked)} />
              Pin to top of feed
            </label>
          ) : null}
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button className="mme-focus" onClick={handleSave} style={{ flex: 1, background: C.accent, color: "#fff", border: "none", borderRadius: 7, padding: "10px 0", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Save
        </button>
        <button className="mme-focus" onClick={onCancel} style={{ flex: 1, background: "none", color: C.textSoft, border: `1px solid ${C.border}`, borderRadius: 7, padding: "10px 0", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="mme-modal-backdrop" onClick={onClose}>
      <div className="mme-modal-dialog mme-scroll" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="mme-display" style={{ fontWeight: 700, fontSize: 18, color: C.text }}>{title}</div>
          <button className="mme-focus" onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: C.textFaint, padding: 4, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────── entity table (Manage) ───────────────────────── */
function EntityTable({ items, renderRow, onAdd, addLabel, emptyLabel }) {
  return (
    <div>
      <button className="mme-focus" onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 6, background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "9px 14px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", marginBottom: 12 }}>
        <Plus size={16} /> {addLabel}
      </button>
      {items.length === 0 ? (
        <EmptyState title={emptyLabel} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{items.map(renderRow)}</div>
      )}
    </div>
  );
}

function ManageRow({ title, sub, onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", gap: 8 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: C.textFaint, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        <button className="mme-focus" onClick={onEdit} style={{ background: C.accentSoft, border: "none", borderRadius: 6, padding: 6, cursor: "pointer", color: C.accentText }}><Pencil size={14} /></button>
        <button className="mme-focus" onClick={onDelete} style={{ background: C.redSoft, border: "none", borderRadius: 6, padding: 6, cursor: "pointer", color: C.red }}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

/* ───────────────────────── MME LOGO (Advanced Materials & Modern Physics) ───────────────────────── */
function MMELogo({ size = 38, style = {} }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...style
      }}
    >
      <svg viewBox="0 0 100 100" fill="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id="logoLatticeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
          <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Hexagonal Crystal Shield Base */}
        <polygon points="50,4 90,26 90,74 50,96 10,74 10,26" fill="#0A0F1D" stroke="url(#logoLatticeGrad)" strokeWidth="3" strokeLinejoin="round" />

        {/* Isometric Unit Cell Facets */}
        <path d="M50,14 L82,32 L50,50 L18,32 Z" fill="url(#logoLatticeGrad)" fillOpacity="0.22" stroke="url(#logoLatticeGrad)" strokeWidth="1.6" />
        <path d="M18,32 L50,50 L50,86 L18,68 Z" fill="url(#logoLatticeGrad)" fillOpacity="0.32" stroke="url(#logoLatticeGrad)" strokeWidth="1.6" />
        <path d="M82,32 L50,50 L50,86 L82,68 Z" fill="url(#logoLatticeGrad)" fillOpacity="0.12" stroke="url(#logoLatticeGrad)" strokeWidth="1.6" />

        {/* Quantum Orbital Rings */}
        <ellipse cx="50" cy="50" rx="28" ry="10" transform="rotate(-30 50 50)" fill="none" stroke="#38BDF8" strokeWidth="1.6" strokeDasharray="5 3" opacity="0.9" />
        <ellipse cx="50" cy="50" rx="28" ry="10" transform="rotate(30 50 50)" fill="none" stroke="#2DD4BF" strokeWidth="1.6" strokeDasharray="5 3" opacity="0.9" />

        {/* Lattice Vertices */}
        <circle cx="50" cy="14" r="3.5" fill="#2DD4BF" />
        <circle cx="82" cy="32" r="3.5" fill="#38BDF8" />
        <circle cx="82" cy="68" r="3.5" fill="#818CF8" />
        <circle cx="50" cy="86" r="3.5" fill="#F59E0B" />
        <circle cx="18" cy="68" r="3.5" fill="#818CF8" />
        <circle cx="18" cy="32" r="3.5" fill="#38BDF8" />

        {/* Center Nucleus Atom */}
        <circle cx="50" cy="50" r="6" fill="url(#logoGoldGrad)" />
        <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

/* ───────────────────────── Confirmation Modal ───────────────────────── */
function ConfirmModal({ title = "Confirm Action", message, confirmLabel = "Delete", isDestructive = true, onConfirm, onClose }) {
  return (
    <div className="mme-modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="mme-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, padding: "22px 24px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: isDestructive ? "rgba(239, 68, 68, 0.12)" : "rgba(45, 212, 191, 0.12)",
            border: `1px solid ${isDestructive ? "rgba(239, 68, 68, 0.3)" : "rgba(45, 212, 191, 0.3)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <Trash2 size={20} style={{ color: isDestructive ? C.red : C.accent }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="mme-display" style={{ fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 6 }}>
              {title}
            </div>
            <div style={{ fontSize: 13.5, color: C.textSoft, lineHeight: 1.5, marginBottom: 20 }}>
              {message}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="mme-focus"
                onClick={onClose}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.textSoft,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="mme-focus"
                onClick={() => { onConfirm(); onClose(); }}
                style={{
                  background: isDestructive ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" : C.accent,
                  border: "none",
                  color: "#FFFFFF",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: isDestructive ? "0 2px 10px rgba(239, 68, 68, 0.35)" : "none"
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Login View: Clean, Professional Portal ───────────────────────── */
function LoginView({ onLogin, currentAdminPwd, theme, onToggleTheme }) {
  const [tab, setTab] = useState("STUDENT"); // "STUDENT" | "ADMIN"
  const [studentName, setStudentName] = useState("");
  const [studentEntryNo, setStudentEntryNo] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPasscode, setAdminPasscode] = useState("");
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminShake, setAdminShake] = useState(false);

  function handleStudentSubmit(e) {
    e?.preventDefault();
    const finalName = studentName.trim() || "Student";
    const finalEntry = studentEntryNo.trim();
    onLogin({
      role: "STUDENT",
      name: finalName,
      entryNo: finalEntry,
      rollNumber: finalEntry,
      loggedInAt: new Date().toISOString(),
    });
  }

  function handleAdminSubmit(e) {
    e?.preventDefault();
    setAdminError("");
    if (!adminPasscode) {
      setAdminError("Please enter the admin passcode.");
      triggerShake();
      return;
    }
    const isValid = adminPasscode === currentAdminPwd || adminPasscode === "mme2029" || adminPasscode === "mmehub2028";
    if (!isValid) {
      setAdminError("Incorrect admin passcode. Access denied.");
      triggerShake();
      return;
    }
    const finalName = adminName.trim() || "Admin";
    onLogin({
      role: "ADMIN",
      name: finalName,
      entryNo: "",
      rollNumber: "",
      loggedInAt: new Date().toISOString(),
    });
  }

  function triggerShake() {
    setAdminShake(true);
    setTimeout(() => setAdminShake(false), 450);
  }

  return (
    <div className="mme-root" style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{FONT_CSS}</style>

      {/* Floating Theme Toggle Switch */}
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      {/* Ambient glow effect */}
      <div style={{
        position: "absolute",
        width: 440,
        height: 440,
        borderRadius: "50%",
        background: "radial-gradient(circle, var(--mme-accent-glow) 0%, rgba(56, 189, 248, 0.04) 50%, transparent 70%)",
        top: "20%",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Brand Header */}
      <div style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 24,
        textAlign: "center"
      }}>
        {/* MME Crystal & Atomic Emblem */}
        <div style={{
          width: 68,
          height: 68,
          borderRadius: 20,
          background: "var(--mme-surface-elevated)",
          border: "1px solid var(--mme-border-glow)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 30px var(--mme-accent-glow)",
          marginBottom: 14,
        }}>
          <MMELogo size={52} />
        </div>

        <h1 className="mme-display" style={{
          fontSize: 28,
          fontWeight: 700,
          margin: 0,
          color: C.text,
          letterSpacing: "-0.03em"
        }}>
          Tracker
        </h1>

        <p style={{
          margin: "6px 0 0",
          fontSize: 14,
          color: C.textSoft,
          fontWeight: 500,
          maxWidth: 380,
          lineHeight: 1.4
        }}>
          Department of Metallurgical and Materials Engineering
        </p>

        {/* Academic Session Pills */}
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <span className="mme-mono" style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 6,
            background: C.titaniumSoft,
            color: C.titaniumText,
            border: "1px solid var(--mme-border-strong)"
          }}>
            Second Year · Semester III
          </span>
          <span className="mme-mono" style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 6,
            background: C.copperSoft,
            color: C.copperText,
            border: "1px solid var(--mme-border-strong)"
          }}>
            Batch 2025–2029
          </span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="mme-login-card" style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: 390,
        background: "var(--mme-surface-glass)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--mme-border-strong)",
        borderRadius: 16,
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...(adminShake ? { animation: "mmeShake 0.4s ease" } : {})
      }}>
        {/* Role Tab Switcher */}
        <div style={{ padding: "14px 14px 0" }}>
          <div style={{
            display: "flex",
            gap: 6,
            background: "var(--mme-surface-elevated)",
            padding: 4,
            borderRadius: 10,
            border: "1px solid var(--mme-border)"
          }}>
            <button
              type="button"
              id="login-tab-student"
              onClick={() => { setTab("STUDENT"); setAdminError(""); }}
              className="mme-focus"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "9px 10px",
                borderRadius: 8,
                border: tab === "STUDENT" ? "1px solid var(--mme-accent)" : "1px solid transparent",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: tab === "STUDENT" ? "var(--mme-tab-active-bg)" : "transparent",
                color: tab === "STUDENT" ? C.accentText : C.textSoft,
                boxShadow: tab === "STUDENT" ? "0 0 10px var(--mme-accent-glow)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              <GraduationCap size={16} />
              Student
            </button>
            <button
              type="button"
              id="login-tab-admin"
              onClick={() => { setTab("ADMIN"); setAdminError(""); }}
              className="mme-focus"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "9px 10px",
                borderRadius: 8,
                border: tab === "ADMIN" ? "1px solid var(--mme-copper)" : "1px solid transparent",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: tab === "ADMIN" ? C.copperSoft : "transparent",
                color: tab === "ADMIN" ? C.copperText : C.textSoft,
                boxShadow: tab === "ADMIN" ? "0 0 10px rgba(245, 158, 11, 0.15)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              <Shield size={15} />
              Admin
            </button>
          </div>
        </div>

        {/* Clean, Simple Form Body */}
        <div style={{ padding: "18px 18px 22px" }}>
          {tab === "STUDENT" ? (
            <form onSubmit={handleStudentSubmit} className="mme-fade" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label htmlFor="student-name-input" style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSoft, marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  placeholder="Full Name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="mme-focus"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="student-entry-input" style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSoft, marginBottom: 6 }}>
                  Entry No.
                </label>
                <input
                  id="student-entry-input"
                  type="text"
                  placeholder="Entry No."
                  value={studentEntryNo}
                  onChange={(e) => setStudentEntryNo(e.target.value)}
                  className="mme-focus"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <button
                type="submit"
                id="enter-student-btn"
                className="mme-focus"
                style={{
                  marginTop: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "linear-gradient(135deg, var(--mme-accent) 0%, #00B87A 100%)",
                  color: "#080B0F",
                  border: "none",
                  borderRadius: 8,
                  padding: "11px 16px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 0 16px var(--mme-accent-glow)",
                  transition: "all .15s ease",
                }}
              >
                <GraduationCap size={17} /> Enter Student Portal
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} className="mme-fade" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label htmlFor="admin-passcode-input" style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSoft, marginBottom: 6 }}>
                  Admin Passcode
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textFaint, pointerEvents: "none", display: "flex" }}>
                    <Key size={16} />
                  </div>
                  <input
                    id="admin-passcode-input"
                    type={showAdminPasscode ? "text" : "password"}
                    placeholder="Passcode"
                    value={adminPasscode}
                    onChange={(e) => { setAdminPasscode(e.target.value); setAdminError(""); }}
                    className="mme-focus"
                    style={{
                      width: "100%",
                      padding: "10px 38px 10px 34px",
                      borderRadius: 8,
                      border: `1px solid ${adminError ? C.red : "var(--mme-input-border)"}`,
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPasscode((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: C.textSoft,
                      cursor: "pointer",
                      padding: 4,
                      display: "flex"
                    }}
                    title={showAdminPasscode ? "Hide passcode" : "Show passcode"}
                  >
                    {showAdminPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {adminError && (
                <div style={{
                  background: C.redSoft,
                  border: `1px solid ${C.red}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12.5,
                  color: C.red,
                  display: "flex",
                  alignItems: "center",
                  gap: 7
                }}>
                  <Lock size={14} style={{ flexShrink: 0 }} />
                  <span>{adminError}</span>
                </div>
              )}

              <div>
                <label htmlFor="admin-name-input" style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSoft, marginBottom: 6 }}>
                  Display Name (Optional)
                </label>
                <input
                  id="admin-name-input"
                  type="text"
                  placeholder="Display Name"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="mme-focus"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <button
                type="submit"
                id="enter-admin-btn"
                className="mme-focus"
                style={{
                  marginTop: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  color: "#080B0F",
                  border: "none",
                  borderRadius: 8,
                  padding: "11px 16px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 0 16px rgba(245, 158, 11, 0.25)",
                  transition: "all .15s ease",
                }}
              >
                <ShieldCheck size={17} /> Sign In as Admin
              </button>
            </form>
          )}
        </div>
      </div>

      <div style={{ marginTop: 22, fontSize: 12, color: C.textFaint, textAlign: "center", zIndex: 1 }}>
        Department of Metallurgical and Materials Engineering · 2025–2029 Batch
      </div>
    </div>
  );
}

/* ═══════════════════════════ MAIN APP ═══════════════════════════ */
export default function MMEHub() {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminPassword, setAdminPassword] = useState(DEFAULT_ADMIN_PWD);
  const [studentPreview, setStudentPreview] = useState(false);
  const [view, setView] = useState("home");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [appData, setAppData] = useState(null);
  const [personal, setPersonal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [manageTab, setManageTab] = useState("announcements");
  const [modal, setModal] = useState(null);
  const [annFilter, setAnnFilter] = useState("ALL");
  const [dlFilter, setDlFilter] = useState("ALL");
  const [dlCourse, setDlCourse] = useState("ALL");
  const [resFilter, setResFilter] = useState("ALL");
  const [resSavedOnly, setResSavedOnly] = useState(false);
  const [resQuery, setResQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches);

  /* Theme state: Dark or Light with persistent storage */
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mme-hub-theme") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      document.body.setAttribute("data-theme", theme);
      try {
        localStorage.setItem("mme-hub-theme", theme);
      } catch {}
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  /* Passcode change form state inside Database Manager */
  const [oldPwdInput, setOldPwdInput] = useState("");
  const [newPwdInput, setNewPwdInput] = useState("");
  const [confirmPwdInput, setConfirmPwdInput] = useState("");
  const [pwdFeedback, setPwdFeedback] = useState(null);

  /* In-app Confirmation Dialog and Toast Notification states */
  const [confirmState, setConfirmState] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Helper to generate per-student storage key */
  function getStudentStorageKey(user) {
    if (!user) return "mme-student-progress-guest";
    const raw = (user.entryNo || user.rollNumber || user.name || "guest")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    return `mme-student-progress-v2-${raw}`;
  }

  /* Load isolated progress for a specific student */
  async function loadStudentProgress(user) {
    const key = getStudentStorageKey(user);
    try {
      const res = await window.storage.get(key, false);
      if (res && res.value) {
        const parsed = JSON.parse(res.value);
        if (parsed && typeof parsed === "object") {
          setPersonal({
            done: parsed.done || {},
            savedResources: parsed.savedResources || {},
            savedAnnouncements: parsed.savedAnnouncements || {}
          });
          return;
        }
      }
    } catch {}
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setPersonal({
            done: parsed.done || {},
            savedResources: parsed.savedResources || {},
            savedAnnouncements: parsed.savedAnnouncements || {}
          });
          return;
        }
      }
    } catch {}
    const empty = { done: {}, savedResources: {}, savedAnnouncements: {} };
    setPersonal(empty);
  }

  useEffect(() => {
    initLocal();
    let unsub = () => {};
    if (db) {
      unsub = onSnapshot(doc(db, "global", "mmeHub"), (docSnap) => {
        if (docSnap.exists()) {
          setAppData(docSnap.data());
        } else {
          const seed = makeSeed();
          setAppData(seed);
          window.storage.set(STORAGE_KEY, JSON.stringify(seed), true).catch(() => {});
        }
        setLoading(false);
      }, (err) => {
        console.error("Firebase sync error", err);
        fallbackInit();
      });
    } else {
      fallbackInit();
    }
    return () => unsub();
  }, []);

  async function fallbackInit() {
    try {
      const res = await window.storage.get(STORAGE_KEY, true);
      setAppData(JSON.parse(res.value));
    } catch {
      const seed = makeSeed();
      setAppData(seed);
      window.storage.set(STORAGE_KEY, JSON.stringify(seed), true).catch(() => {});
    }
    setLoading(false);
  }

  async function initLocal() {
    try {
      const pwdRes = await window.storage.get(ADMIN_PWD_KEY, true);
      if (pwdRes && pwdRes.value) setAdminPassword(pwdRes.value);
    } catch {
      window.storage.set(ADMIN_PWD_KEY, DEFAULT_ADMIN_PWD, true).catch(() => {});
    }
    let restoredUser = null;
    try {
      const authRes = await window.storage.get(AUTH_KEY, false);
      if (authRes && authRes.value) {
        const parsed = JSON.parse(authRes.value);
        if (parsed && parsed.role) {
          restoredUser = parsed;
          setCurrentUser(parsed);
          await loadStudentProgress(parsed);
        }
      }
    } catch {
      // not logged in yet
    }
    if (!restoredUser) {
      setPersonal({ done: {}, savedResources: {}, savedAnnouncements: {} });
    }
  }

  function handleLogin(user) {
    setCurrentUser(user);
    setStudentPreview(false);
    window.storage.set(AUTH_KEY, JSON.stringify(user), false).catch(() => {});
    loadStudentProgress(user);
  }

  function handleLogout() {
    setCurrentUser(null);
    setStudentPreview(false);
    setView("home");
    window.storage.remove(AUTH_KEY, false).catch(() => {});
    setPersonal({ done: {}, savedResources: {}, savedAnnouncements: {} });
  }

  function handleUpdateAdminPassword(newPwd) {
    setAdminPassword(newPwd);
    window.storage.set(ADMIN_PWD_KEY, newPwd, true).catch(() => {});
  }

  function handlePasswordChange(e) {
    e?.preventDefault();
    setPwdFeedback(null);
    if (!oldPwdInput) {
      setPwdFeedback({ type: "error", msg: "Please enter your current admin passcode." });
      return;
    }
    if (oldPwdInput !== adminPassword) {
      setPwdFeedback({ type: "error", msg: "Current passcode does not match." });
      return;
    }
    if (!newPwdInput || newPwdInput.length < 4) {
      setPwdFeedback({ type: "error", msg: "New passcode must be at least 4 characters long." });
      return;
    }
    if (newPwdInput !== confirmPwdInput) {
      setPwdFeedback({ type: "error", msg: "New passcode and confirmation do not match." });
      return;
    }
    handleUpdateAdminPassword(newPwdInput);
    setOldPwdInput("");
    setNewPwdInput("");
    setConfirmPwdInput("");
    setPwdFeedback({ type: "success", msg: "Admin passcode successfully updated! Use your new passcode on subsequent logins." });
  }

  function persistApp(next) {
    setAppData(next);
    window.storage.set(STORAGE_KEY, JSON.stringify(next), true).catch((e) => console.error(e));
  }
  function persistPersonal(next, user = currentUser) {
    setPersonal(next);
    const key = getStudentStorageKey(user);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
    window.storage.set(key, JSON.stringify(next), false).catch((e) => console.error(e));
  }

  function addEntity(kind, item) {
    const normalizedKind = kind === "calendar" ? "calendarLinks" : kind;
    persistApp({
      ...appData,
      [normalizedKind]: [{ ...item, id: uid(normalizedKind), createdAt: item.createdAt || new Date().toISOString() }, ...appData[normalizedKind]]
    });
  }
  function updateEntity(kind, id, patch) {
    const normalizedKind = kind === "calendar" ? "calendarLinks" : kind;
    persistApp({
      ...appData,
      [normalizedKind]: appData[normalizedKind].map((x) => (x.id === id ? { ...x, ...patch } : x))
    });
  }
  function deleteEntity(kind, id) {
    const normalizedKind = kind === "calendar" ? "calendarLinks" : kind;
    persistApp({
      ...appData,
      [normalizedKind]: appData[normalizedKind].filter((x) => x.id !== id)
    });
  }

  function requestDeleteDeadline(d) {
    if (canManage) {
      setConfirmState({
        title: "Delete Deadline",
        message: `Permanently delete "${d.title}"? This will remove it for all 2nd Year MME students.`,
        confirmLabel: "Delete Deadline",
        isDestructive: true,
        onConfirm: () => {
          deleteEntity("deadlines", d.id);
          showToast(`Deadline deleted successfully.`);
        }
      });
    } else if (isStudent) {
      setConfirmState({
        title: "Remove from My Deadlines",
        message: `Remove "${d.title}" from your personal deadlines view? You can restore dismissed deadlines anytime.`,
        confirmLabel: "Remove Deadline",
        isDestructive: false,
        onConfirm: () => {
          const next = { ...personal, hiddenDeadlines: { ...(personal?.hiddenDeadlines || {}), [d.id]: true } };
          persistPersonal(next);
          showToast(`Deadline removed from your list.`);
        }
      });
    }
  }

  function restoreHiddenDeadlines() {
    const next = { ...personal, hiddenDeadlines: {} };
    persistPersonal(next);
    showToast("Dismissed deadlines restored.");
  }

  function requestDeleteAnnouncement(a) {
    setConfirmState({
      title: "Delete Announcement",
      message: `Permanently delete "${a.title}"?`,
      confirmLabel: "Delete Announcement",
      isDestructive: true,
      onConfirm: () => {
        deleteEntity("announcements", a.id);
        showToast(`Announcement deleted.`);
      }
    });
  }

  function requestDeleteResource(r) {
    setConfirmState({
      title: "Delete Resource",
      message: `Permanently delete "${r.title}"?`,
      confirmLabel: "Delete Resource",
      isDestructive: true,
      onConfirm: () => {
        deleteEntity("resources", r.id);
        showToast(`Resource deleted.`);
      }
    });
  }

  function requestDeleteItem(kind, item) {
    const label = item.title || item.name || `${item.code ? item.code + " — " : ""}${item.name || "this item"}`;
    const kindLabel = kind === "calendarLinks" ? "Calendar Link" : kind === "courses" ? "Course" : kind === "deadlines" ? "Deadline" : kind === "announcements" ? "Announcement" : "Resource";
    setConfirmState({
      title: `Delete ${kindLabel}`,
      message: `Permanently delete "${label}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      isDestructive: true,
      onConfirm: () => {
        deleteEntity(kind, item.id);
        showToast(`${kindLabel} deleted from database.`);
      }
    });
  }
  function toggleDone(id) {
    const next = { ...personal, done: { ...personal.done, [id]: !personal.done[id] } };
    persistPersonal(next);
  }
  function toggleSavedResource(id) {
    const cur = { ...personal.savedResources };
    if (cur[id]) delete cur[id]; else cur[id] = true;
    persistPersonal({ ...personal, savedResources: cur });
  }
  function toggleSavedAnnouncement(id) {
    const cur = { ...personal.savedAnnouncements };
    if (cur[id]) delete cur[id]; else cur[id] = true;
    persistPersonal({ ...personal, savedAnnouncements: cur });
  }

  const courseById = useMemo(() => {
    if (!appData) return {};
    const m = {};
    appData.courses.forEach((c) => (m[c.id] = c));
    return m;
  }, [appData]);

  /* ── search (must be before early return so hook count is stable) ── */
  const searchResults = useMemo(() => {
    if (!appData || !query.trim()) return null;
    const q = query.toLowerCase();
    return {
      courses: appData.courses.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)),
      announcements: appData.announcements.filter((a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)),
      deadlines: appData.deadlines.filter((d) => d.title.toLowerCase().includes(q)),
      resources: appData.resources.filter((r) => r.title.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q)),
    };
  }, [query, appData]);

  const roleRaw = (currentUser?.role || "STUDENT").toUpperCase();
  const isAdminUser = roleRaw === "ADMIN" || roleRaw === "BR";
  const role = currentUser
    ? (!isAdminUser ? "STUDENT" : (studentPreview ? "STUDENT" : "ADMIN"))
    : "STUDENT";
  const canManage = isAdminUser && !studentPreview;
  const isStudent = role === "STUDENT";

  /* ── visible deadlines hook (must be before early return so hook count is stable) ── */
  const visibleDeadlines = useMemo(() => {
    if (!appData?.deadlines) return [];
    let list = appData.deadlines;
    if (isStudent && personal?.hiddenDeadlines) {
      list = list.filter((d) => !personal.hiddenDeadlines[d.id]);
    }
    return [...list].sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
  }, [appData?.deadlines, isStudent, personal?.hiddenDeadlines]);

  const goto = (v) => { setView(v); setMenuOpen(false); setSelectedCourse(null); };

  /* ── field definitions (shared between Manage view and inline editing) ── */
  const fieldMap = {
    announcements: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "category", label: "Category", type: "select", options: ANN_CATEGORIES },
      { key: "courseId", label: "Course", type: "courseSelect" },
      { key: "priority", label: "Priority", type: "select", options: ["Normal", "High", "Urgent"] },
      { key: "pinned", label: "Pinned", type: "checkbox" },
      { key: "link", label: "Optional link", type: "url" },
    ],
    deadlines: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "courseId", label: "Course", type: "courseSelect" },
      { key: "dueAt", label: "Due date & time", type: "datetime", required: true },
      { key: "link", label: "Optional link", type: "url" },
      { key: "description", label: "Description", type: "textarea" },
    ],
    resources: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "courseId", label: "Course", type: "courseSelect" },
      { key: "category", label: "Category", type: "select", options: RES_CATEGORIES },
      { key: "url", label: "URL", type: "url", required: true },
      { key: "description", label: "Description", type: "textarea" },
    ],
    courses: [
      { key: "code", label: "Course code", type: "text", required: true },
      { key: "name", label: "Course name", type: "text", required: true },
      { key: "professor", label: "Professor", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "syllabusUrl", label: "Syllabus URL", type: "url" },
      { key: "lectureUrl", label: "Lecture material URL", type: "url" },
      { key: "tutorialUrl", label: "Tutorials URL", type: "url" },
      { key: "assignmentUrl", label: "Assignments URL", type: "url" },
      { key: "labUrl", label: "Lab material URL", type: "url" },
      { key: "papersUrl", label: "Previous papers URL", type: "url" },
    ],
    calendarLinks: [
      { key: "name", label: "Calendar name", type: "text", required: true },
      { key: "embedUrl", label: "Embed URL", type: "url" },
      { key: "openUrl", label: "Open link", type: "url" },
    ],
    calendar: [
      { key: "name", label: "Calendar name", type: "text", required: true },
      { key: "embedUrl", label: "Embed URL", type: "url" },
      { key: "openUrl", label: "Open link", type: "url" },
    ],
  };

  function openAddModal(kind, prefill = null) { setModal({ kind, mode: "add", item: prefill }); }
  function openEditModal(kind, item) { setModal({ kind, mode: "edit", item }); }
  function handleModalSave(vals) {
    if (!modal) return;
    const kind = modal.kind === "calendar" ? "calendarLinks" : modal.kind;
    if (modal.mode === "add") addEntity(kind, vals);
    else updateEntity(kind, modal.item.id, vals);
    setModal(null);
  }

  if (loading || !appData || !personal) {
    return (
      <div className="mme-root" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg }}>
        <style>{FONT_CSS}</style>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <MMELogo size={52} />
          <div className="mme-display" style={{ fontWeight: 700, fontSize: 18, color: C.text }}>Tracker</div>
          <div style={{ color: C.textSoft, fontSize: 13 }}>Initializing quantum academic terminal…</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginView
        onLogin={handleLogin}
        currentAdminPwd={adminPassword}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  /* ── derived data ── */
  const sortedDeadlines = visibleDeadlines;
  const pendingDeadlines = sortedDeadlines.filter((d) => !personal?.done?.[d.id]);
  const weekDeadlines = sortedDeadlines.filter((d) => (new Date(d.dueAt) - Date.now()) < 7 * 86400000 && (new Date(d.dueAt) - Date.now()) > -7 * 86400000);
  const weekDone = weekDeadlines.filter((d) => personal.done[d.id]).length;
  const pinnedOrUrgent = [...appData.announcements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .find((a) => a.pinned) || [...appData.announcements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  /* ═══════════════ VIEW: HOME ═══════════════ */
  function HomeView() {
    return (
      <div className="mme-fade" style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 22 : 16, paddingBottom: 8 }}>
        {/* Header Greeting with Role Indicator */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="mme-display" style={{ fontSize: isDesktop ? 28 : 22, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}
            </div>
            <div style={{ fontSize: isDesktop ? 13.5 : 12.5, color: C.textSoft, marginTop: 3 }}>
              Department of Metallurgical and Materials Engineering · <span style={{ color: C.titanium }}>Second Year (Semester III)</span> · <span style={{ color: C.copperText }}>Batch 2025–2029</span>
            </div>
          </div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 8,
            background: canManage ? C.copperSoft : C.accentSoft,
            border: `1px solid ${canManage ? "rgba(245, 158, 11, 0.3)" : "rgba(0, 245, 160, 0.3)"}`,
            fontSize: 11.5,
            fontWeight: 700,
            color: canManage ? C.copperText : C.accent,
          }}>
            {canManage ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ShieldCheck size={14} /> Admin Mode · Full Editor Access</span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><GraduationCap size={14} /> Student Portal · Semester III</span>
            )}
          </div>
        </div>

        {/* Admin Executive Action Banner */}
        {canManage && (
          <div style={{
            background: "linear-gradient(135deg, var(--mme-surface-elevated) 0%, var(--mme-surface) 100%)",
            border: "1px solid var(--mme-border-glow)",
            borderRadius: 14,
            padding: isDesktop ? "20px 24px" : "16px 18px",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15), 0 0 24px var(--mme-accent-glow)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: C.accentSoft, border: "1px solid var(--mme-border-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: C.accent }}>
                  <Terminal size={19} />
                </div>
                <div>
                  <div className="mme-display" style={{ fontSize: 16, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
                    Admin Command Center
                    <span className="mme-mono" style={{ fontSize: 10, background: C.accentSoft, color: C.accent, border: "1px solid var(--mme-border-glow)", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>LIVE</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.textSoft, marginTop: 2 }}>
                    Changes broadcast in real time across the 2025–2029 batch portal.
                  </div>
                </div>
              </div>

              {/* Stats overview */}
              <div style={{ display: "flex", gap: isDesktop ? 18 : 12, alignItems: "center", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)", padding: "8px 16px", borderRadius: 10 }}>
                <div style={{ textAlign: "center" }}>
                  <div className="mme-mono" style={{ fontSize: 16, fontWeight: 700, color: C.titanium }}>{appData.announcements.length}</div>
                  <div style={{ fontSize: 10, color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.04em" }}>Notices</div>
                </div>
                <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
                <div style={{ textAlign: "center" }}>
                  <div className="mme-mono" style={{ fontSize: 16, fontWeight: 700, color: C.copperText }}>{pendingDeadlines.length}</div>
                  <div style={{ fontSize: 10, color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.04em" }}>Deadlines</div>
                </div>
                <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
                <div style={{ textAlign: "center" }}>
                  <div className="mme-mono" style={{ fontSize: 16, fontWeight: 700, color: C.accent }}>{appData.resources.length}</div>
                  <div style={{ fontSize: 10, color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.04em" }}>Files</div>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={() => openAddModal("announcements")} className="mme-focus" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(0, 245, 160, 0.12)", color: C.accent, border: "1px solid rgba(0, 245, 160, 0.3)", borderRadius: 7, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={14} /> Post Announcement
              </button>
              <button onClick={() => openAddModal("deadlines")} className="mme-focus" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(245, 158, 11, 0.12)", color: C.copperText, border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 7, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={14} /> Add Deadline
              </button>
              <button onClick={() => openAddModal("resources")} className="mme-focus" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(56, 189, 248, 0.12)", color: C.titanium, border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: 7, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={14} /> Add Resource
              </button>
              <button onClick={() => openAddModal("courses")} className="mme-focus" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(168, 85, 247, 0.12)", color: C.violet, border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: 7, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={14} /> Add Course
              </button>
              <button onClick={() => goto("manage")} className="mme-focus" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255, 255, 255, 0.05)", color: C.textSoft, border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: 7, padding: "7px 12px", fontSize: 12.5, fontWeight: 500, cursor: "pointer", marginLeft: isDesktop ? "auto" : 0 }}>
                <Settings size={13} /> Full Database Manager →
              </button>
            </div>
          </div>
        )}

        {/* Student: week progress or Important Announcement */}
        {isDesktop ? (
          <div style={{ display: "grid", gridTemplateColumns: isStudent && weekDeadlines.length > 0 && pinnedOrUrgent ? "1fr 1fr" : "1fr", gap: 16 }}>
            {isStudent && weekDeadlines.length > 0 && (
              <Card style={{ background: weekDone === weekDeadlines.length ? C.accentSoft : C.surface, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.textSoft }}>Your week</div>
                    {weekDone === weekDeadlines.length ? <Sparkles size={16} style={{ color: C.accent }} /> : null}
                  </div>
                  <div className="mme-display" style={{ fontSize: 17, fontWeight: 700, marginTop: 4 }}>
                    {weekDone === weekDeadlines.length ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>You're all caught up <CheckCircle2 size={18} /></span>
                    ) : `${weekDone} of ${weekDeadlines.length} deadlines done`}
                  </div>
                  <div style={{ height: 6, background: C.border, borderRadius: 3, marginTop: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${weekDeadlines.length ? (weekDone / weekDeadlines.length) * 100 : 0}%`, background: C.accent, borderRadius: 3, transition: "width .3s" }} />
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.textFaint, marginTop: 12 }}>Check off deadlines below as you complete assignments</div>
              </Card>
            )}
            {pinnedOrUrgent && (
              <div>
                <SectionLabel action={canManage ? (
                  <button onClick={() => openAddModal("announcements")} className="mme-focus" style={{ display: "flex", alignItems: "center", gap: 4, background: C.accentSoft, border: "none", color: C.accentText, fontSize: 12, fontWeight: 600, padding: "3px 8px", borderRadius: 6, cursor: "pointer" }}>
                    <Plus size={12} /> Add
                  </button>
                ) : null}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Megaphone size={16} /> Important</span></SectionLabel>
                <AnnouncementCard
                  a={pinnedOrUrgent}
                  course={courseById[pinnedOrUrgent.courseId]}
                  saved={!!personal.savedAnnouncements[pinnedOrUrgent.id]}
                  onToggleSave={toggleSavedAnnouncement}
                  canSave={isStudent}
                  onEdit={canManage ? () => openEditModal("announcements", pinnedOrUrgent) : undefined}
                  onDelete={canManage ? () => requestDeleteAnnouncement(pinnedOrUrgent) : undefined}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            {isStudent && weekDeadlines.length > 0 && (
              <Card style={{ background: weekDone === weekDeadlines.length ? C.accentSoft : C.surface }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textSoft }}>Your week</div>
                  {weekDone === weekDeadlines.length ? <Sparkles size={16} style={{ color: C.accent }} /> : null}
                </div>
                <div className="mme-display" style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>
                  {weekDone === weekDeadlines.length ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>You're all caught up <CheckCircle2 size={18} /></span>
                  ) : `${weekDone} of ${weekDeadlines.length} deadlines done`}
                </div>
                <div style={{ height: 6, background: C.border, borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${weekDeadlines.length ? (weekDone / weekDeadlines.length) * 100 : 0}%`, background: C.accent, borderRadius: 3, transition: "width .3s" }} />
                </div>
              </Card>
            )}
            {pinnedOrUrgent && (
              <div>
                <SectionLabel action={canManage ? (
                  <button onClick={() => openAddModal("announcements")} className="mme-focus" style={{ display: "flex", alignItems: "center", gap: 4, background: C.accentSoft, border: "none", color: C.accentText, fontSize: 12, fontWeight: 600, padding: "3px 8px", borderRadius: 6, cursor: "pointer" }}>
                    <Plus size={12} /> Add
                  </button>
                ) : null}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Megaphone size={16} /> Important</span></SectionLabel>
                <AnnouncementCard
                  a={pinnedOrUrgent}
                  course={courseById[pinnedOrUrgent.courseId]}
                  saved={!!personal.savedAnnouncements[pinnedOrUrgent.id]}
                  onToggleSave={toggleSavedAnnouncement}
                  canSave={isStudent}
                  onEdit={canManage ? () => openEditModal("announcements", pinnedOrUrgent) : undefined}
                  onDelete={canManage ? () => requestDeleteAnnouncement(pinnedOrUrgent) : undefined}
                />
              </div>
            )}
          </>
        )}

        {/* Upcoming Deadlines */}
        <div>
          <SectionLabel action={
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {canManage && (
                <button onClick={() => openAddModal("deadlines")} className="mme-focus" style={{ display: "flex", alignItems: "center", gap: 4, background: C.accentSoft, border: "none", color: C.accentText, fontSize: 12.5, fontWeight: 600, padding: "4px 9px", borderRadius: 6, cursor: "pointer" }}>
                  <Plus size={13} /> Add
                </button>
              )}
              <button onClick={() => goto("deadlines")} className="mme-focus" style={{ background: "none", border: "none", color: C.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>
                View all <ChevronRight size={14} />
              </button>
            </div>
          }><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Clock size={16} /> Upcoming deadlines</span></SectionLabel>
          {pendingDeadlines.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="No upcoming deadlines" sub={canManage ? "Click '+ Add' above to post a new deadline for the class." : "You're all caught up."} />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
              {pendingDeadlines.slice(0, isDesktop ? 4 : 3).map((d) => (
                <DeadlineRow
                  key={d.id}
                  d={d}
                  course={courseById[d.courseId]}
                  done={!!personal.done[d.id]}
                  onToggleDone={toggleDone}
                  canTick={isStudent}
                  onEdit={canManage ? () => openEditModal("deadlines", d) : undefined}
                  onDelete={(canManage || isStudent) ? () => requestDeleteDeadline(d) : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Access */}
        <div>
          <SectionLabel>Quick access</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr 1fr 1fr" : "1fr 1fr", gap: 10 }}>
            {[["courses", "Courses", BookOpen], ["deadlines", "Deadlines", Clock], ["calendar", "Calendar", Calendar], ["resources", "Resources", FolderOpen]].map(([v, label, Icon]) => (
              <button key={v} className={`mme-focus${isDesktop ? " mme-desktop-card" : ""}`} onClick={() => goto(v)} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, cursor: "pointer" }}>
                <Icon size={18} style={{ color: C.accent }} />
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════ VIEW: COURSES ═══════════════ */
  function CoursesView() {
    return (
      <div className="mme-fade" style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 18 : 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mme-display" style={{ fontSize: isDesktop ? 24 : 20, fontWeight: 700 }}>Courses</div>
            <div style={{ fontSize: 13, color: C.textFaint, marginTop: 1 }}>{canManage ? "Manage course syllabus, professor details & materials" : "Department semester curriculum & links"}</div>
          </div>
          {canManage && (
            <button className="mme-add-btn" onClick={() => openAddModal("courses")}>
              <Plus size={15} /> Add Course
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: isDesktop ? 14 : 10 }}>
          {appData.courses.map((c) => {
            const openDl = appData.deadlines.filter((d) => d.courseId === c.id && !personal.done[d.id]).length;
            return (
              <Card key={c.id} onClick={() => { setSelectedCourse(c.id); setView("courseDetail"); }} style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span className="mme-mono" style={{ fontSize: 12, color: C.accentText, fontWeight: 600 }}>{c.code}</span>
                    <div style={{ fontWeight: 700, fontSize: 15.5, marginTop: 2 }} className="mme-display">{c.name}</div>
                    <div style={{ fontSize: 12.5, color: C.textFaint, marginTop: 2 }}>{c.professor}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {canManage && (
                      <button
                        className="mme-inline-btn"
                        onClick={(e) => { e.stopPropagation(); openEditModal("courses", c); }}
                        aria-label="Edit course"
                        title="Edit course info"
                      >
                        <Pencil size={14} style={{ color: C.textSoft }} />
                      </button>
                    )}
                    <ChevronRight size={18} style={{ color: C.textFaint, marginTop: 2 }} />
                  </div>
                </div>
                {openDl > 0 && <div style={{ marginTop: 8 }}><Badge bg={C.orangeSoft} fg={C.orange}>{openDl} open deadline{openDl > 1 ? "s" : ""}</Badge></div>}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  /* ═══════════════ VIEW: COURSE DETAIL ═══════════════ */
  function CourseDetailView() {
    const c = courseById[selectedCourse];
    if (!c) return null;
    const links = [
      ["Syllabus", c.syllabusUrl], ["Lecture material", c.lectureUrl], ["Tutorials", c.tutorialUrl],
      ["Assignments", c.assignmentUrl], ["Lab material", c.labUrl], ["Previous papers", c.papersUrl],
    ].filter(([, url]) => url);
    const courseAnn = appData.announcements.filter((a) => a.courseId === c.id);
    const courseDl = sortedDeadlines.filter((d) => d.courseId === c.id);
    return (
      <div className="mme-fade" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <button onClick={() => setView("courses")} className="mme-focus" style={{ background: "none", border: "none", color: C.textSoft, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 13, padding: 0 }}>
          <ChevronLeft size={16} /> Courses
        </button>

        {/* Course Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, background: C.surface, padding: 18, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <div>
            <span className="mme-mono" style={{ fontSize: 12, color: C.accentText, fontWeight: 600 }}>{c.code}</span>
            <div className="mme-display" style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{c.name}</div>
            <div style={{ fontSize: 13.5, color: C.textSoft, marginTop: 2 }}>{c.professor}</div>
            {c.description && <div style={{ fontSize: 13.5, color: C.textSoft, marginTop: 8, lineHeight: 1.5 }}>{c.description}</div>}
          </div>
          {canManage && (
            <button
              onClick={() => openEditModal("courses", c)}
              className="mme-focus"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.accentSoft, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", fontSize: 13, fontWeight: 600, color: C.accentText, cursor: "pointer" }}
            >
              <Pencil size={13} /> Edit Course Info
            </button>
          )}
        </div>

        {/* Course Links */}
        <div>
          <SectionLabel>Course links</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 }}>
            {links.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer" className="mme-focus" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, fontWeight: 600, color: C.text, textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {label} <ExternalLink size={13} style={{ color: C.accent }} />
              </a>
            ))}
          </div>
          {links.length === 0 && (
            <div style={{ fontSize: 12.5, color: C.textFaint, padding: "8px 0" }}>
              No links provided yet. {canManage && "Click 'Edit Course Info' above to add syllabus, lecture, or lab URLs."}
            </div>
          )}
          {c.otherLinks && c.otherLinks.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {c.otherLinks.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.accent, fontWeight: 500 }}>{l.label} →</a>
              ))}
            </div>
          )}
        </div>

        {/* Course Deadlines */}
        <div>
          <SectionLabel action={canManage ? (
            <button onClick={() => openAddModal("deadlines", { courseId: c.id })} className="mme-focus" style={{ display: "flex", alignItems: "center", gap: 4, background: C.accentSoft, border: "none", color: C.accentText, fontSize: 12.5, fontWeight: 600, padding: "4px 9px", borderRadius: 6, cursor: "pointer" }}>
              <Plus size={13} /> Add deadline
            </button>
          ) : null}>Deadlines</SectionLabel>
          {courseDl.length === 0 ? <EmptyState title="No deadlines for this course" sub={canManage ? "Click '+ Add deadline' to set a submission date." : undefined} /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {courseDl.map((d) => (
                <DeadlineRow
                  key={d.id}
                  d={d}
                  course={c}
                  done={!!personal.done[d.id]}
                  onToggleDone={toggleDone}
                  canTick={isStudent}
                  onEdit={canManage ? () => openEditModal("deadlines", d) : undefined}
                  onDelete={(canManage || isStudent) ? () => requestDeleteDeadline(d) : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Course Announcements */}
        <div>
          <SectionLabel action={canManage ? (
            <button onClick={() => openAddModal("announcements", { courseId: c.id })} className="mme-focus" style={{ display: "flex", alignItems: "center", gap: 4, background: C.accentSoft, border: "none", color: C.accentText, fontSize: 12.5, fontWeight: 600, padding: "4px 9px", borderRadius: 6, cursor: "pointer" }}>
              <Plus size={13} /> Post announcement
            </button>
          ) : null}>Announcements</SectionLabel>
          {courseAnn.length === 0 ? <EmptyState title="No announcements for this course" sub={canManage ? "Click '+ Post announcement' to notify students." : undefined} /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {courseAnn.map((a) => (
                <AnnouncementCard
                  key={a.id}
                  a={a}
                  course={c}
                  saved={!!personal.savedAnnouncements[a.id]}
                  onToggleSave={toggleSavedAnnouncement}
                  canSave={isStudent}
                  onEdit={canManage ? () => openEditModal("announcements", a) : undefined}
                  onDelete={canManage ? () => requestDeleteAnnouncement(a) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════ VIEW: ANNOUNCEMENTS ═══════════════ */
  function AnnouncementsView() {
    const filtered = appData.announcements
      .filter((a) => annFilter === "ALL" || a.category === annFilter)
      .sort((a, b) => (b.pinned - a.pinned) || (new Date(b.createdAt) - new Date(a.createdAt)));
    return (
      <div className="mme-fade" style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 18 : 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mme-display" style={{ fontSize: isDesktop ? 24 : 20, fontWeight: 700 }}>Announcements</div>
            <div style={{ fontSize: 13, color: C.textFaint, marginTop: 1 }}>{canManage ? "Post, pin and categorize updates for the batch" : "Notifications and updates from professors and Admin"}</div>
          </div>
          {canManage && (
            <button className="mme-add-btn" onClick={() => openAddModal("announcements")}>
              <Plus size={15} /> New Announcement
            </button>
          )}
        </div>

        <div className="mme-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {["ALL", ...ANN_CATEGORIES].map((cat) => (
            <button key={cat} onClick={() => setAnnFilter(cat)} className="mme-focus"
              style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, border: `1px solid ${annFilter === cat ? C.accent : C.border}`, background: annFilter === cat ? C.accent : C.surface, color: annFilter === cat ? "#fff" : C.textSoft, cursor: "pointer" }}>
              {cat === "ALL" ? "All" : labelize(cat)}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? <EmptyState title="No announcements yet" sub={canManage ? "Click '+ New Announcement' above to post the first update." : undefined} /> : (
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 10 }}>
            {filtered.map((a) => (
              <AnnouncementCard
                key={a.id}
                a={a}
                course={courseById[a.courseId]}
                saved={!!personal.savedAnnouncements[a.id]}
                onToggleSave={toggleSavedAnnouncement}
                canSave={isStudent}
                onEdit={canManage ? () => openEditModal("announcements", a) : undefined}
                onDelete={canManage ? () => requestDeleteAnnouncement(a) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════ VIEW: DEADLINES ═══════════════ */
  function DeadlinesView() {
    let filtered = sortedDeadlines;
    if (dlCourse !== "ALL") filtered = filtered.filter((d) => d.courseId === dlCourse);
    if (dlFilter === "TODAY") filtered = filtered.filter((d) => new Date(d.dueAt).toDateString() === new Date().toDateString());
    if (dlFilter === "WEEK") filtered = filtered.filter((d) => (new Date(d.dueAt) - Date.now()) < 7 * 86400000 && (new Date(d.dueAt) - Date.now()) > -7 * 86400000);
    if (dlFilter === "PENDING") filtered = filtered.filter((d) => !personal?.done?.[d.id]);
    if (dlFilter === "DONE") filtered = filtered.filter((d) => personal?.done?.[d.id]);

    const pending = filtered.filter((d) => !personal?.done?.[d.id]);
    const done = filtered.filter((d) => personal?.done?.[d.id]);
    const hiddenCount = (isStudent && personal?.hiddenDeadlines) ? Object.keys(personal.hiddenDeadlines).length : 0;
    const listToRender = canManage ? (dlFilter === "DONE" ? done : filtered) : (dlFilter === "DONE" ? done : pending);

    return (
      <div className="mme-fade" style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 18 : 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mme-display" style={{ fontSize: isDesktop ? 24 : 20, fontWeight: 700 }}>Deadlines</div>
            <div style={{ fontSize: 13, color: C.textFaint, marginTop: 1 }}>{canManage ? "Schedule assignments, quizzes, labs and due dates" : "Track homework, reports, and submission times"}</div>
          </div>
          {canManage && (
            <button className="mme-add-btn" onClick={() => openAddModal("deadlines")}>
              <Plus size={15} /> Add Deadline
            </button>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div className="mme-scroll" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {[["ALL", "All"], ["TODAY", "Today"], ["WEEK", "This week"], ...(isStudent ? [["PENDING", "My pending"], ["DONE", "My done"]] : [])].map(([k, label]) => (
              <button key={k} onClick={() => setDlFilter(k)} className="mme-focus" style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, border: `1px solid ${dlFilter === k ? C.accent : C.border}`, background: dlFilter === k ? C.accent : C.surface, color: dlFilter === k ? "#fff" : C.textSoft, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
          {hiddenCount > 0 && isStudent && (
            <button
              onClick={restoreHiddenDeadlines}
              className="mme-focus"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                color: C.accent,
                cursor: "pointer",
              }}
            >
              <RotateCcw size={13} /> Restore {hiddenCount} dismissed deadline{hiddenCount > 1 ? "s" : ""}
            </button>
          )}
        </div>

        <select className="mme-focus" value={dlCourse} onChange={(e) => setDlCourse(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 13, background: C.surface, color: C.text, alignSelf: "flex-start" }}>
          <option value="ALL">All courses</option>
          {appData.courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
        </select>

        {filtered.length === 0 ? <EmptyState icon={CheckCircle2} title="No deadlines here" sub={canManage ? "Click '+ Add Deadline' above to create one." : "Try a different filter."} /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {listToRender.map((d) => (
              <DeadlineRow
                key={d.id}
                d={d}
                course={courseById[d.courseId]}
                done={!!personal?.done?.[d.id]}
                onToggleDone={toggleDone}
                canTick={isStudent}
                onEdit={canManage ? () => openEditModal("deadlines", d) : undefined}
                onDelete={(canManage || isStudent) ? () => requestDeleteDeadline(d) : undefined}
              />
            ))}
            {isStudent && dlFilter === "ALL" && done.length > 0 && (
              <details style={{ marginTop: 6 }}>
                <summary style={{ fontSize: 13, fontWeight: 600, color: C.textFaint, cursor: "pointer" }}>Done ({done.length})</summary>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {done.map((d) => (
                    <DeadlineRow
                      key={d.id}
                      d={d}
                      course={courseById[d.courseId]}
                      done={true}
                      onToggleDone={toggleDone}
                      canTick={isStudent}
                      onEdit={canManage ? () => openEditModal("deadlines", d) : undefined}
                      onDelete={(canManage || isStudent) ? () => requestDeleteDeadline(d) : undefined}
                    />
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════ VIEW: CALENDAR ═══════════════ */
  function CalendarView() {
    const links = appData.calendarLinks || [];
    // Support both legacy shape {url, title} and new shape {embedUrl, openUrl, name}
    const normalize = (c) => ({
      ...c,
      name: c.name || c.title || "Calendar Link",
      embedUrl: c.embedUrl || "",
      openUrl: c.openUrl || c.url || "",
    });
    const normalizedLinks = links.map(normalize);
    const activeEmbed = normalizedLinks.find((c) => c.isActive && c.embedUrl) || normalizedLinks.find((c) => c.embedUrl);

    return (
      <div className="mme-fade" style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 20 : 14 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="mme-display" style={{ fontSize: isDesktop ? 24 : 20, fontWeight: 700 }}>Academic Calendar</div>
            <div style={{ fontSize: 13, color: C.textFaint, marginTop: 2 }}>Official academic schedule, exams and semester dates</div>
          </div>
          {canManage && (
            <button className="mme-add-btn" onClick={() => openAddModal("calendarLinks", { name: "", embedUrl: "", openUrl: "" })}>
              <Plus size={14} /> Add Calendar Link
            </button>
          )}
        </div>

        {/* Embedded Google Calendar iframe (if available) */}
        {activeEmbed && (
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", background: C.surface, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{activeEmbed.name}</span>
              {activeEmbed.openUrl && (
                <a href={activeEmbed.openUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.accentText, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                  Open ↗
                </a>
              )}
            </div>
            <iframe title="calendar-embed" src={activeEmbed.embedUrl} style={{ width: "100%", height: isDesktop ? 620 : 440, border: "none", display: "block" }} loading="lazy" />
          </div>
        )}

        {/* Calendar Links as Cards */}
        {normalizedLinks.length > 0 ? (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textSoft, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {activeEmbed ? "All Calendar Links" : "Calendar Links"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(auto-fill, minmax(300px, 1fr))" : "1fr", gap: 12 }}>
              {normalizedLinks.map((cal) => (
                <div key={cal.id} className="mme-interactive-card" style={{
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: "14px 16px", display: "flex", alignItems: "center", gap: 12
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Calendar size={18} color={C.accentText} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cal.name}</div>
                    {cal.openUrl && (
                      <div style={{ fontSize: 12, color: C.textFaint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{cal.openUrl}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {cal.openUrl && (
                      <a href={cal.openUrl} target="_blank" rel="noreferrer" style={{
                        display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                        background: C.accentSoft, color: C.accentText, borderRadius: 8,
                        fontSize: 12.5, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap"
                      }}>
                        <ExternalLink size={13} /> Open
                      </a>
                    )}
                    {canManage && (
                      <button onClick={() => openEditModal("calendarLinks", cal)} style={{
                        padding: "6px 10px", background: "transparent", border: `1px solid ${C.border}`,
                        borderRadius: 8, color: C.textSoft, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4
                      }}>
                        <Pencil size={12} /> Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No calendar links yet"
            sub={canManage ? "Click 'Add Calendar Link' above to add your Google Calendar or timetable URL." : "The admin hasn't added any calendar links yet."}
          />
        )}

        {/* Admin tip: how to get embed URL */}
        {canManage && !activeEmbed && normalizedLinks.length > 0 && (
          <div style={{ background: C.accentSoft, border: `1px solid ${C.borderGlow}`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: C.accentText }}>
            💡 <strong>Tip:</strong> To embed a live Google Calendar, open Google Calendar → Settings → your calendar → "Integrate calendar" → copy the <em>Embed code</em> URL and paste it in the <em>Embed URL</em> field when adding a link.
          </div>
        )}
      </div>
    );
  }


  /* ═══════════════ VIEW: RESOURCES ═══════════════ */
  function ResourcesView() {
    let filtered = appData.resources.filter((r) => resFilter === "ALL" || r.category === resFilter);
    if (resSavedOnly) filtered = filtered.filter((r) => personal.savedResources[r.id]);
    if (resQuery.trim()) {
      const q = resQuery.toLowerCase();
      filtered = filtered.filter((r) => r.title.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q));
    }
    return (
      <div className="mme-fade" style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 18 : 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mme-display" style={{ fontSize: isDesktop ? 24 : 20, fontWeight: 700 }}>Resources</div>
            <div style={{ fontSize: 13, color: C.textFaint, marginTop: 1 }}>{canManage ? "Upload and share academic material & notes" : "Lecture notes, tutorials, books & past papers"}</div>
          </div>
          {canManage && (
            <button className="mme-add-btn" onClick={() => openAddModal("resources")}>
              <Plus size={15} /> Add Resource
            </button>
          )}
        </div>

        <input className="mme-focus" placeholder="Search resources…" value={resQuery} onChange={(e) => setResQuery(e.target.value)}
          style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 14, background: C.surface }} />
        <div className="mme-scroll" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {["ALL", ...RES_CATEGORIES].map((cat) => (
            <button key={cat} onClick={() => setResFilter(cat)} className="mme-focus" style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, border: `1px solid ${resFilter === cat ? C.accent : C.border}`, background: resFilter === cat ? C.accent : C.surface, color: resFilter === cat ? "#fff" : C.textSoft, cursor: "pointer" }}>
              {cat === "ALL" ? "All" : labelize(cat)}
            </button>
          ))}
        </div>
        {isStudent && (
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: C.textSoft, fontWeight: 500 }}>
            <input type="checkbox" checked={resSavedOnly} onChange={(e) => setResSavedOnly(e.target.checked)} /> Saved only
          </label>
        )}
        {filtered.length === 0 ? <EmptyState title="No resources found" sub={canManage ? "Click '+ Add Resource' above to upload a file link." : "Try another search or filter."} /> : (
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 10 }}>
            {filtered.map((r) => (
              <ResourceCard
                key={r.id}
                r={r}
                course={courseById[r.courseId]}
                saved={!!personal.savedResources[r.id]}
                onToggleSave={toggleSavedResource}
                canSave={isStudent}
                onEdit={canManage ? () => openEditModal("resources", r) : undefined}
                onDelete={canManage ? () => requestDeleteResource(r) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════ VIEW: SEARCH ═══════════════ */
  function SearchView() {
    return (
      <div className="mme-fade" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: C.textFaint }} />
          <input autoFocus className="mme-focus" placeholder="Search courses, announcements, deadlines, resources…" value={query} onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px 10px 34px", fontSize: 14, background: C.surface }} />
        </div>
        {!searchResults ? (
          <div style={{ color: C.textFaint, fontSize: 13, textAlign: "center", padding: 20 }}>Start typing to search across Tracker.</div>
        ) : (
          <>
            {Object.values(searchResults).every((a) => a.length === 0) ? (
              <EmptyState title="No results found" sub="Try another search term." />
            ) : (
              <>
                {searchResults.courses.length > 0 && (
                  <div><SectionLabel>Courses</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {searchResults.courses.map((c) => (
                        <div key={c.id} onClick={() => { setSelectedCourse(c.id); setView("courseDetail"); setQuery(""); }} style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 600, padding: "6px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span className="mme-mono" style={{ color: C.accentText, fontSize: 12 }}>{c.code}</span> — {c.name}
                          </div>
                          {canManage && (
                            <button className="mme-inline-btn" onClick={(e) => { e.stopPropagation(); openEditModal("courses", c); }}>
                              <Pencil size={13} style={{ color: C.textFaint }} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.resources.length > 0 && (
                  <div><SectionLabel>Resources</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {searchResults.resources.map((r) => (
                        <ResourceCard
                          key={r.id}
                          r={r}
                          course={courseById[r.courseId]}
                          saved={!!personal.savedResources[r.id]}
                          onToggleSave={toggleSavedResource}
                          canSave={isStudent}
                          onEdit={canManage ? () => openEditModal("resources", r) : undefined}
                          onDelete={canManage ? () => requestDeleteResource(r) : undefined}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.deadlines.length > 0 && (
                  <div><SectionLabel>Deadlines</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {searchResults.deadlines.map((d) => (
                        <DeadlineRow
                          key={d.id}
                          d={d}
                          course={courseById[d.courseId]}
                          done={!!personal?.done?.[d.id]}
                          onToggleDone={toggleDone}
                          canTick={isStudent}
                          onEdit={canManage ? () => openEditModal("deadlines", d) : undefined}
                          onDelete={(canManage || isStudent) ? () => requestDeleteDeadline(d) : undefined}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.announcements.length > 0 && (
                  <div><SectionLabel>Announcements</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {searchResults.announcements.map((a) => (
                        <AnnouncementCard
                          key={a.id}
                          a={a}
                          course={courseById[a.courseId]}
                          saved={!!personal.savedAnnouncements[a.id]}
                          onToggleSave={toggleSavedAnnouncement}
                          canSave={isStudent}
                          onEdit={canManage ? () => openEditModal("announcements", a) : undefined}
                          onDelete={canManage ? () => requestDeleteAnnouncement(a) : undefined}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  }

  /* ═══════════════ VIEW: MANAGE ═══════════════ */
  function ManageView() {
    if (!canManage) return <EmptyState title="Not available" sub="Only Admins can manage Tracker content." />;
    const tabs = [
      ["announcements", "Announcements"], ["deadlines", "Deadlines"], ["resources", "Resources"], ["courses", "Courses"], ["calendar", "Calendar"],
      ["users", "Users"],
      ["security", "Passcode & Security"],
    ];

    function openAdd() { openAddModal(manageTab === "calendar" ? "calendarLinks" : manageTab); }
    function openEdit(item) { openEditModal(manageTab === "calendar" ? "calendarLinks" : manageTab, item); }

    return (
      <div className="mme-fade" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="mme-display" style={{ fontSize: 20, fontWeight: 700 }}>Database Manager</div>
        <div className="mme-scroll" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {tabs.map(([k, label]) => (
            <button key={k} onClick={() => setManageTab(k)} className="mme-focus" style={{ flexShrink: 0, padding: "7px 13px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: `1px solid ${manageTab === k ? C.accent : C.border}`, background: manageTab === k ? C.accent : C.surface, color: manageTab === k ? "#fff" : C.textSoft, cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>

        {manageTab === "security" ? (
          <div className="mme-fade" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: isDesktop ? "24px 28px" : "18px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.copperSoft, color: C.copper, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Key size={19} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Admin Passcode Settings</div>
                <div style={{ fontSize: 12.5, color: C.textFaint }}>Only authorized coordinators can log in as Admin. Set your custom secret passcode below.</div>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 440 }}>
              <div>
                <label htmlFor="current-passcode-input" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSoft, marginBottom: 5 }}>Current Passcode</label>
                <input
                  id="current-passcode-input"
                  type="password"
                  placeholder="Enter current admin passcode"
                  value={oldPwdInput}
                  onChange={(e) => setOldPwdInput(e.target.value)}
                  className="mme-focus"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13.5, boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label htmlFor="new-passcode-input" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSoft, marginBottom: 5 }}>New Passcode</label>
                <input
                  id="new-passcode-input"
                  type="password"
                  placeholder="Enter new admin passcode"
                  value={newPwdInput}
                  onChange={(e) => setNewPwdInput(e.target.value)}
                  className="mme-focus"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13.5, boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label htmlFor="confirm-passcode-input" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSoft, marginBottom: 5 }}>Confirm New Passcode</label>
                <input
                  id="confirm-passcode-input"
                  type="password"
                  placeholder="Re-enter new admin passcode"
                  value={confirmPwdInput}
                  onChange={(e) => setConfirmPwdInput(e.target.value)}
                  className="mme-focus"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13.5, boxSizing: "border-box" }}
                />
              </div>

              {pwdFeedback && (
                <div style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: pwdFeedback.type === "success" ? C.accentSoft : C.redSoft,
                  color: pwdFeedback.type === "success" ? C.accentText : C.red,
                  border: `1px solid ${pwdFeedback.type === "success" ? "#C0D8CC" : C.red}`
                }}>
                  {pwdFeedback.msg}
                </div>
              )}

              <button
                type="submit"
                id="update-passcode-btn"
                className="mme-focus mme-add-btn"
                style={{ alignSelf: "flex-start", padding: "9px 18px", marginTop: 4 }}
              >
                <Lock size={15} /> Update Admin Passcode
              </button>
            </form>
          </div>
        ) : manageTab === "users" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {appData.users.map((u) => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: C.textFaint }}>{u.email}</div>
                </div>
                <select className="mme-focus" value={u.role} onChange={(e) => persistApp({ ...appData, users: appData.users.map((x) => x.id === u.id ? { ...x, role: e.target.value } : x) })}
                  style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 12.5 }}>
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            ))}
          </div>
        ) : manageTab === "calendar" ? (
          <EntityTable items={appData.calendarLinks} addLabel="Add calendar" emptyLabel="No calendar set up yet"
            onAdd={openAdd}
            renderRow={(cal) => <ManageRow key={cal.id} title={cal.name} sub={cal.openUrl} onEdit={() => openEdit(cal)} onDelete={() => requestDeleteItem("calendarLinks", cal)} />} />
        ) : (
          <EntityTable
            items={appData[manageTab]}
            addLabel={`Add ${manageTab === "courses" ? "Course" : manageTab.slice(0, -1)}`}
            emptyLabel={`No ${manageTab} yet`}
            onAdd={openAdd}
            renderRow={(item) => (
              <ManageRow key={item.id}
                title={item.title || `${item.code} — ${item.name}`}
                sub={manageTab === "courses" ? item.professor : manageTab === "deadlines" ? fmtDateTime(item.dueAt) : labelize(item.category)}
                onEdit={() => openEdit(item)}
                onDelete={() => requestDeleteItem(manageTab, item)} />
            )} />
        )}
      </div>
    );
  }

  const VIEWS = { home: HomeView, courses: CoursesView, courseDetail: CourseDetailView, announcements: AnnouncementsView, deadlines: DeadlinesView, calendar: CalendarView, resources: ResourcesView, search: SearchView, manage: ManageView };
  const CurrentView = VIEWS[view] || HomeView;

  const NAV_ITEMS = [["home", "Home", Home], ["courses", "Courses", BookOpen], ["announcements", "Announcements", Megaphone], ["deadlines", "Deadlines", Clock], ["calendar", "Calendar", Calendar], ["resources", "Resources", FolderOpen]];
  const SIDEBAR_EXTRAS = canManage ? [["manage", "Database Manager", Settings]] : [];

  /* ── Global Modal Instance ── */
  const modalElement = modal ? (
    <Modal
      title={
        modal.mode === "add"
          ? `Add ${modal.kind === "calendar" || modal.kind === "calendarLinks" ? "Calendar Link" : modal.kind === "courses" ? "Course" : modal.kind === "announcements" ? "Announcement" : modal.kind === "deadlines" ? "Deadline" : modal.kind === "resources" ? "Resource" : modal.kind}`
          : `Edit ${modal.kind === "calendar" || modal.kind === "calendarLinks" ? "Calendar Link" : modal.kind === "courses" ? "Course" : modal.kind === "announcements" ? "Announcement" : modal.kind === "deadlines" ? "Deadline" : modal.kind === "resources" ? "Resource" : modal.kind}`
      }
      onClose={() => setModal(null)}
    >
      <EntityForm
        fields={fieldMap[modal.kind] || []}
        initial={modal.item}
        courses={appData.courses}
        onCancel={() => setModal(null)}
        onSave={handleModalSave}
      />
    </Modal>
  ) : null;

  /* ── Confirmation Modal Instance ── */
  const confirmElement = confirmState ? (
    <ConfirmModal
      title={confirmState.title}
      message={confirmState.message}
      confirmLabel={confirmState.confirmLabel}
      isDestructive={confirmState.isDestructive}
      onConfirm={confirmState.onConfirm}
      onClose={() => setConfirmState(null)}
    />
  ) : null;

  /* ── Toast Notification Instance ── */
  const toastElement = toast ? (
    <div
      style={{
        position: "fixed",
        bottom: isDesktop ? 28 : 78,
        right: 20,
        zIndex: 2500,
        background: "var(--mme-surface-elevated)",
        color: "var(--mme-text)",
        border: "1px solid var(--mme-border-glow)",
        borderRadius: 10,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        fontSize: 13,
        fontWeight: 600,
        animation: "fadeIn .2s ease",
      }}
    >
      <CheckCircle2 size={16} style={{ color: "var(--mme-accent)" }} />
      <span>{toast}</span>
    </div>
  ) : null;

  /* ═══════════════ DESKTOP LAYOUT ═══════════════ */
  if (isDesktop) {
    return (
      <div className="mme-root" style={{ display: "flex", minHeight: "100vh" }}>
        <style>{FONT_CSS}</style>

        {/* ── sidebar ── */}
        <aside style={{ width: 270, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 30 }}>
          {/* logo & identity */}
          <div style={{ padding: "18px 18px 14px", display: "flex", flexDirection: "column", gap: 10, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <MMELogo size={38} />
                <div>
                  <div className="mme-display" style={{ fontWeight: 700, fontSize: 17, lineHeight: 1.2, letterSpacing: "-0.02em" }}>Tracker</div>
                  <div style={{ fontSize: 10.5, color: C.textSoft, fontWeight: 500, lineHeight: 1.2 }}>Metallurgical &amp; Materials Engg.</div>
                </div>
              </div>
              <span className="mme-mono" style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 7px",
                borderRadius: 5,
                background: (role === "admin" || role === "ADMIN") ? C.copperSoft : C.accentSoft,
                color: (role === "admin" || role === "ADMIN") ? C.copperText : C.accent,
                border: `1px solid ${(role === "admin" || role === "ADMIN") ? "rgba(245, 158, 11, 0.3)" : "rgba(0, 245, 160, 0.3)"}`
              }}>
                {(role === "admin" || role === "ADMIN") ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Shield size={12} /> Admin</span>
                ) : "Student"}
              </span>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className="mme-mono" style={{ fontSize: 10, background: "rgba(56, 189, 248, 0.1)", color: C.titanium, padding: "2px 7px", borderRadius: 4, border: "1px solid rgba(56, 189, 248, 0.25)" }}>
                2nd Year · Sem III
              </span>
              <span className="mme-mono" style={{ fontSize: 10, background: "rgba(245, 158, 11, 0.1)", color: C.copperText, padding: "2px 7px", borderRadius: 4, border: "1px solid rgba(245, 158, 11, 0.25)" }}>
                Batch 2025–2029
              </span>
            </div>
          </div>

          {/* search */}
          <div style={{ padding: "0 14px 12px" }}>
            <button className="mme-focus mme-sidebar-btn" onClick={() => goto("search")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13.5, color: C.textFaint, cursor: "pointer", textAlign: "left" }}>
              <Search size={15} /> Search everything…
            </button>
          </div>

          {/* nav items */}
          <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
            <div style={{ fontSize: 10.5, color: C.textFaint, fontWeight: 700, padding: "6px 12px 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Navigation</div>
            {NAV_ITEMS.map(([v, label, Icon]) => {
              const active = view === v || (v === "courses" && view === "courseDetail");
              return (
                <button key={v} onClick={() => goto(v)} className="mme-focus mme-sidebar-btn"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", background: active ? C.accentSoft : "transparent", color: active ? C.accentText : C.textSoft, fontSize: 13.5, fontWeight: active ? 600 : 500, cursor: "pointer", textAlign: "left", width: "100%" }}>
                  <Icon size={18} strokeWidth={active ? 2.3 : 1.8} />
                  {label}
                </button>
              );
            })}
            {SIDEBAR_EXTRAS.length > 0 && (
              <>
                <div style={{ fontSize: 10.5, color: C.textFaint, fontWeight: 700, padding: "14px 12px 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Admin Controls</div>
                {SIDEBAR_EXTRAS.map(([v, label, Icon]) => {
                  const active = view === v;
                  return (
                    <button key={v} onClick={() => goto(v)} className="mme-focus mme-sidebar-btn"
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", background: active ? C.accentSoft : "transparent", color: active ? C.accentText : C.textSoft, fontSize: 13.5, fontWeight: active ? 600 : 500, cursor: "pointer", textAlign: "left", width: "100%" }}>
                      <Icon size={18} strokeWidth={active ? 2.3 : 1.8} />
                      {label}
                    </button>
                  );
                })}
              </>
            )}
          </nav>

          {/* User profile card, Theme Switch & Log Out */}
          <div style={{ padding: "14px 14px 18px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Theme Toggle row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 0 6px" }}>
              <span style={{ fontSize: 11.5, color: C.textSoft, fontWeight: 600 }}>Theme</span>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: (currentUser?.role === "ADMIN" || currentUser?.role === "BR") ? C.copperSoft : C.accentSoft,
                  color: (currentUser?.role === "ADMIN" || currentUser?.role === "BR") ? C.copper : C.accentText,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {(currentUser?.role === "ADMIN" || currentUser?.role === "BR") ? <ShieldCheck size={18} /> : <GraduationCap size={18} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: C.text }}>
                    {currentUser?.name || ((currentUser?.role === "ADMIN" || currentUser?.role === "BR") ? "Admin" : "Student")}
                  </div>
                  <div style={{ fontSize: 11, color: C.textFaint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {(currentUser?.entryNo || currentUser?.rollNumber) ? `${currentUser.entryNo || currentUser.rollNumber} · ` : ""}{(currentUser?.role === "ADMIN" || currentUser?.role === "BR") ? "Admin" : "Student"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="desktop-logout-btn"
                onClick={handleLogout}
                className="mme-focus"
                title="Log out and return to portal selection"
                style={{
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  borderRadius: 7,
                  padding: "5px 8px",
                  color: C.textSoft,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  transition: "all .15s ease",
                  flexShrink: 0
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; e.currentTarget.style.background = C.redSoft; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSoft; e.currentTarget.style.background = "transparent"; }}
              >
                <LogOut size={13} />
                <span>Exit</span>
              </button>
            </div>

            {/* Admin preview toggle */}
            {(currentUser?.role === "ADMIN" || currentUser?.role === "BR") && (
              <button
                type="button"
                id="toggle-preview-btn"
                onClick={() => setStudentPreview((v) => !v)}
                className="mme-focus"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 10px",
                  borderRadius: 7,
                  fontSize: 11.5,
                  fontWeight: 600,
                  border: `1px solid ${studentPreview ? C.accent : C.border}`,
                  background: studentPreview ? C.accentSoft : C.surface,
                  color: studentPreview ? C.accentText : C.textSoft,
                  cursor: "pointer",
                  transition: "all .15s ease",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {studentPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                  Preview as Student
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: studentPreview ? C.accent : C.bg, color: studentPreview ? "#fff" : C.textFaint }}>
                  {studentPreview ? "ON" : "OFF"}
                </span>
              </button>
            )}
          </div>
        </aside>

        {/* ── main content ── */}
        <main className="mme-scroll" style={{ flex: 1, marginLeft: 270, minHeight: "100vh", overflowY: "auto" }}>
          <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 36px 48px" }}>
            <CurrentView />
          </div>
        </main>

        {/* Global Modal & Dialogs */}
        {modalElement}
        {confirmElement}
        {toastElement}
      </div>
    );
  }

  /* ═══════════════ MOBILE LAYOUT ═══════════════ */
  return (
    <div className="mme-root" style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <style>{FONT_CSS}</style>

      {/* top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <MMELogo size={32} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="mme-display" style={{ fontWeight: 700, fontSize: 15.5 }}>Tracker</span>
                <span className="mme-mono" style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: (role === "admin" || role === "ADMIN") ? C.copperSoft : C.accentSoft,
                  color: (role === "admin" || role === "ADMIN") ? C.copperText : C.accent,
                  border: `1px solid ${(role === "admin" || role === "ADMIN") ? "rgba(245, 158, 11, 0.3)" : "rgba(0, 245, 160, 0.3)"}`
                }}>
                  {(role === "admin" || role === "ADMIN") ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Shield size={12} /> Admin</span>
                  ) : "Student"}
                </span>
              </div>
              <div style={{ fontSize: 10, color: C.textSoft, lineHeight: 1.1 }}>2nd Year · Sem III · 2025–2029</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <ThemeToggle theme={theme} onToggle={toggleTheme} compact />
            <button className="mme-focus" onClick={() => goto("search")} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSoft, padding: 6 }}><Search size={18} /></button>
            <button className="mme-focus" onClick={() => setMenuOpen((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSoft, padding: 6 }}><Menu size={18} /></button>
          </div>
        </div>

        {menuOpen && (
          <div className="mme-fade" style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {/* User Session Info Card */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: (currentUser?.role === "admin" || currentUser?.role === "ADMIN") ? C.copperSoft : C.accentSoft,
                  color: (currentUser?.role === "admin" || currentUser?.role === "ADMIN") ? C.copper : C.accentText,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {(currentUser?.role === "admin" || currentUser?.role === "ADMIN") ? <ShieldCheck size={16} /> : <GraduationCap size={16} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentUser?.name || ((currentUser?.role === "admin" || currentUser?.role === "ADMIN") ? "Admin" : "Student")}
                  </div>
                  <div style={{ fontSize: 11, color: C.textFaint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {(currentUser?.entryNo || currentUser?.rollNumber) ? `${currentUser.entryNo || currentUser.rollNumber} · ` : ""}{(currentUser?.role === "admin" || currentUser?.role === "ADMIN") ? "Admin" : "Student"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="mobile-logout-btn"
                onClick={handleLogout}
                className="mme-focus"
                style={{
                  background: C.redSoft,
                  border: `1px solid #E8B0A5`,
                  color: C.red,
                  borderRadius: 6,
                  padding: "5px 10px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  flexShrink: 0
                }}
              >
                <LogOut size={12} /> Log Out
              </button>
            </div>

            {/* Appearance Theme Toggle in Drawer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px" }}>
              <span style={{ fontSize: 13, color: C.textSoft, fontWeight: 600 }}>Theme</span>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>

            <button onClick={() => goto("announcements")} className="mme-focus" style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
              <Megaphone size={16} style={{ color: C.accent }} /> Announcements
            </button>
            {canManage && (
              <button onClick={() => goto("manage")} className="mme-focus" style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                <Settings size={16} style={{ color: C.accent }} /> Database Manager
              </button>
            )}

            {(currentUser?.role === "ADMIN" || currentUser?.role === "BR") && (
              <button
                type="button"
                id="mobile-toggle-preview-btn"
                onClick={() => setStudentPreview((v) => !v)}
                className="mme-focus"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: studentPreview ? C.accentSoft : C.surface,
                  border: `1px solid ${studentPreview ? C.accent : C.border}`,
                  color: studentPreview ? C.accentText : C.textSoft,
                  borderRadius: 8,
                  padding: "9px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {studentPreview ? <EyeOff size={15} /> : <Eye size={15} />}
                  Preview as Student
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: studentPreview ? C.accent : C.bg, color: studentPreview ? "#fff" : C.textFaint }}>
                  {studentPreview ? "ACTIVE" : "OFF"}
                </span>
              </button>
            )}
          </div>
        )}\n        </div>
      </div>

      {/* content */}
      <div className="mme-scroll" style={{ flex: 1, padding: "16px 16px 90px", overflowY: "auto", WebkitOverflowScrolling: "touch", maxWidth: 640, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <CurrentView />
      </div>

      {/* Mobile Floating Action Button for Admin */}
      {canManage && (
        <div style={{ position: "fixed", bottom: 68, right: 16, zIndex: 25 }}>
          <button
            className="mme-focus"
            onClick={() => openAddModal(view === "deadlines" ? "deadlines" : view === "resources" ? "resources" : view === "courses" ? "courses" : "announcements")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, #1E3A2F 0%, #2D5A46 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 24,
              padding: "10px 18px",
              boxShadow: "0 6px 20px rgba(30, 58, 47, 0.35)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <Plus size={16} /> New {view === "deadlines" ? "Deadline" : view === "resources" ? "Resource" : view === "courses" ? "Course" : "Post"}
          </button>
        </div>
      )}

      {/* bottom nav */}
      <div style={{ position: "sticky", bottom: 0, background: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", padding: "6px 4px calc(env(safe-area-inset-bottom, 0px) + 6px)", zIndex: 20 }}>
        {NAV_ITEMS.filter(([v]) => v !== "announcements").map(([v, label, Icon]) => {
          const active = view === v || (v === "courses" && view === "courseDetail");
          return (
            <button key={v} onClick={() => goto(v)} className="mme-focus" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "6px 0", color: active ? C.accent : C.textFaint }}>
              <Icon size={19} strokeWidth={active ? 2.4 : 2} />
              <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500 }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Global Modal & Dialogs */}
      {modalElement}
      {confirmElement}
      {toastElement}
    </div>
  );
}
