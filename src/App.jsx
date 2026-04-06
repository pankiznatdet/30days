import { useState, useEffect, useCallback, useRef } from "react";
import storage from "./storage.js";

const HABITS = [
  "Wake up early (before 7 AM)",
  "Exercise / movement (30 min)",
  "Drink 2+ liters of water",
  "Read (book or article)",
  "Limit screen time (< 2 hrs)",
  "Daily planning & review",
];

const REFLECTIONS = [
  "What was my single biggest win today?",
  "Where can I improve tomorrow?",
  "What moment brought me the most joy?",
  "Is there a lesson I want to carry forward?",
  "How much time did I dedicate to myself?",
  "What obstacles did I face and how did I overcome them?",
  "What emotions surfaced today — and why?",
  "Is there someone I should thank today?",
  "What gave me the most energy?",
  "How well did I stick to my priorities?",
  "Which habit contributed most to my progress?",
  "What would I do differently tomorrow?",
  "What was my main source of motivation?",
  "How would I rate my focus quality today?",
  "Am I satisfied with today's decisions?",
  "What did I learn? Write at least one thing.",
  "Which goal did I move closer to?",
  "Did I experience a moment of calm today?",
  "How well did I maintain my boundaries?",
  "What was my superpower today?",
  "Did I do something healing or restorative?",
  "Rate my inner peace today (1–5).",
  "Who positively influenced me today?",
  "How did I feel physically today?",
  "Did I create something today?",
  "What's one more step I can take?",
  "Do I appreciate the effort I put in today?",
  "Which habit is slowing me down?",
  "What should my priority list look like next week?",
  "What is the biggest transformation from these 30 days?",
];

const PRIORITY_COLORS = { A: "#D4432F", B: "#1A7A6D", C: "#636366" };
const STORAGE_KEY = "productivity-tracker-v3";

const emptyDay = () => ({
  goals: [{ text: "", done: false }, { text: "", done: false }, { text: "", done: false }],
  habits: [false, false, false, false, false, false],
  energy: 0, focus: 0, reflection: "", notes: "",
  water: 0, coffee: 0, steps: 0,
});

export default function App() {
  const [data, setData] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [tab, setTab] = useState("today");
  const [loaded, setLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const saveTimeout = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await storage.get(STORAGE_KEY);
        if (r?.value) {
          const p = JSON.parse(r.value);
          Object.keys(p.days).forEach(k => {
            if (p.days[k].water === undefined) p.days[k].water = 0;
            if (p.days[k].coffee === undefined) p.days[k].coffee = 0;
            if (p.days[k].steps === undefined) p.days[k].steps = 0;
          });
          setData(p); setCurrentDay(p.currentDay || 1);
        } else setShowOnboarding(true);
      } catch { setShowOnboarding(true); }
      setLoaded(true); setTimeout(() => setAnimIn(true), 50);
    })();
  }, []);

  const persist = useCallback((nd) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => { try { await storage.set(STORAGE_KEY, JSON.stringify(nd)); } catch {} }, 400);
  }, []);

  const startTracker = (name) => {
    const days = {}; for (let i = 1; i <= 30; i++) days[i] = emptyDay();
    const d = { name: name || "Explorer", startDate: new Date().toISOString(), days, currentDay: 1 };
    setData(d); setCurrentDay(1); setShowOnboarding(false); persist(d);
  };

  const updateDay = (dn, f, v) => {
    setData(prev => { const n = { ...prev, days: { ...prev.days, [dn]: { ...prev.days[dn], [f]: v } }, currentDay }; persist(n); return n; });
  };

  const goDay = (d) => { setCurrentDay(d); setData(prev => { const n = { ...prev, currentDay: d }; persist(n); return n; }); };

  const resetAll = async () => { try { await storage.delete(STORAGE_KEY); } catch {} setData(null); setShowOnboarding(true); };

  if (!loaded) return <Loading />;
  if (showOnboarding) return <Onboarding onStart={startTracker} />;
  if (!data) return <Loading />;

  const pct = Math.round((currentDay / 30) * 100);

  const TABS = [
    { id: "today", label: "Today", icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M18.36 5.64l1.41-1.41"/></svg> },
    { id: "calendar", label: "Calendar", icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
    { id: "wrapped", label: "Wrapped", icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg> },
    { id: "overview", label: "Stats", icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
    { id: "settings", label: "Settings", icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
  ];

  return (
    <div style={S.shell}><style>{CSS}</style>
      <div style={{ ...S.app, opacity: animIn ? 1 : 0, transform: animIn ? "none" : "translateY(8px)", transition: "all .5s cubic-bezier(.4,0,.2,1)" }}>
        {tab === "today" && <TodayView day={currentDay} dd={data.days[currentDay] || emptyDay()} pct={pct} name={data.name} upd={updateDay} goDay={goDay} />}
        {tab === "calendar" && <CalendarView data={data} cur={currentDay} onSel={d => { goDay(d); setTab("today"); }} />}
        {tab === "wrapped" && <WrappedView data={data} />}
        {tab === "overview" && <OverviewView data={data} />}
        {tab === "settings" && <SettingsView name={data.name} start={data.startDate} onReset={resetAll} />}
        <nav style={S.nav}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ ...S.navBtn, color: tab === t.id ? "#D4432F" : "#8E8E93" }}>
              {t.icon}<span style={{ fontSize: 10, marginTop: 2, fontWeight: tab === t.id ? 600 : 400 }}>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*               ONBOARDING               */
/* ═══════════════════════════════════════ */
function Onboarding({ onStart }) {
  const [name, setName] = useState(""); const [step, setStep] = useState(0);
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 100); }, []);
  return (
    <div style={S.shell}><style>{CSS}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", opacity: vis ? 1 : 0, transition: "opacity .8s" }}>
        {step === 0 ? (
          <div style={{ textAlign: "center", padding: 36 }}>
            <div style={{ fontSize: 110, fontWeight: 800, color: "#1C1C1E", lineHeight: 1, letterSpacing: "-.04em" }}>30</div>
            <div style={{ fontSize: 16, color: "#8E8E93", letterSpacing: ".35em", marginTop: -2 }}>D A Y S</div>
            <div style={{ width: 40, height: 2, background: "#D4432F", margin: "24px auto" }} />
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1C1C1E", letterSpacing: ".05em", lineHeight: 1.3 }}>PRODUCTIVITY<br/>TRACKER</div>
            <div style={{ fontSize: 13, color: "#8E8E93", letterSpacing: ".05em", margin: "16px 0 44px" }}>Goals · Habits · Reflection · Focus</div>
            <button style={S.bigBtn} onClick={() => setStep(1)}>Get Started</button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 36 }}>
            <div style={{ fontSize: 15, color: "#8E8E93", letterSpacing: ".12em", marginBottom: 28 }}>WELCOME</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#1C1C1E", marginBottom: 10 }}>What's your name?</div>
            <div style={{ fontSize: 14, color: "#636366", marginBottom: 36 }}>Let's personalize your journey.</div>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoFocus
              style={{ width: "100%", maxWidth: 280, padding: "14px 0", border: "none", borderBottom: "2px solid #1C1C1E", fontSize: 20, fontWeight: 500, textAlign: "center", outline: "none", background: "transparent", color: "#1C1C1E", marginBottom: 36 }} />
            <button style={{ ...S.bigBtn, opacity: name.trim() ? 1 : .4 }} onClick={() => name.trim() && onStart(name.trim())}>Begin My 30 Days</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*               TODAY VIEW               */
/* ═══════════════════════════════════════ */
function TodayView({ day, dd, pct, name, upd, goDay }) {
  const pri = ["A", "B", "C"];
  const prompt = REFLECTIONS[(day - 1) % REFLECTIONS.length];
  const nav = dir => { const n = day + dir; if (n >= 1 && n <= 30) goDay(n); };

  return (
    <div style={S.scroll}>
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={S.dayBadge}>{String(day).padStart(2, "0")}</div>
          <div>
            <div style={{ fontSize: 12, color: "#8E8E93", letterSpacing: ".08em" }}>DAY {day} OF 30</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1E", marginTop: 2 }}>Hi, {name}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => nav(-1)} style={S.arrowBtn} disabled={day <= 1}>‹</button>
          <button onClick={() => nav(1)} style={S.arrowBtn} disabled={day >= 30}>›</button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 20px 16px" }}>
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: "#E5E5EA", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg,#D4432F,#E8654F)", width: `${pct}%`, transition: "width .4s" }} />
        </div>
        <span style={{ fontSize: 12, color: "#8E8E93", fontWeight: 600, minWidth: 30 }}>{pct}%</span>
      </div>

      <Lbl text="Today's Goals" />
      <div style={S.card}>
        {pri.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: PRIORITY_COLORS[p], color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{p}</div>
            <button onClick={() => { const g = [...dd.goals]; g[i] = { ...g[i], done: !g[i].done }; upd(day, "goals", g); }}
              style={{ width: 24, height: 24, borderRadius: 7, border: `1.5px solid ${dd.goals[i].done ? PRIORITY_COLORS[p] : "#C7C7CC"}`, background: dd.goals[i].done ? PRIORITY_COLORS[p] : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all .2s" }}>
              {dd.goals[i].done && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}
            </button>
            <input type="text" value={dd.goals[i].text}
              onChange={e => { const g = [...dd.goals]; g[i] = { ...g[i], text: e.target.value }; upd(day, "goals", g); }}
              placeholder={`Priority ${p} goal...`}
              style={{ flex: 1, border: "none", borderBottom: "1px dashed #E5E5EA", padding: "5px 0", fontSize: 14, outline: "none", background: "transparent", textDecoration: dd.goals[i].done ? "line-through" : "none", color: dd.goals[i].done ? "#8E8E93" : "#1C1C1E" }} />
          </div>
        ))}
      </div>

      <Lbl text="Habit Tracker" />
      <div style={S.card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {HABITS.map((h, i) => (
            <button key={i} onClick={() => { const nh = [...dd.habits]; nh[i] = !nh[i]; upd(day, "habits", nh); }}
              style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, borderRadius: 12, border: `1.5px solid ${dd.habits[i] ? "#1A7A6D" : "transparent"}`, background: dd.habits[i] ? "#E3F0EE" : "#F9F9FB", textAlign: "left", cursor: "pointer", transition: "all .2s" }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, background: dd.habits[i] ? "#1A7A6D" : "#E5E5EA", color: dd.habits[i] ? "#fff" : "#C7C7CC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{dd.habits[i] ? "✓" : ""}</div>
              <span style={{ fontSize: 12, color: dd.habits[i] ? "#1A7A6D" : "#48484A", fontWeight: dd.habits[i] ? 600 : 400, lineHeight: 1.35 }}>{h}</span>
            </button>
          ))}
        </div>
      </div>

      <Lbl text="Daily Metrics" />
      <div style={S.card}>
        <div style={{ display: "flex", gap: 8 }}>
          <Counter label="Water" unit="glasses" val={dd.water} color="#3B82F6" emoji="💧" set={v => upd(day, "water", v)} />
          <Counter label="Coffee" unit="cups" val={dd.coffee} color="#92400E" emoji="☕" set={v => upd(day, "coffee", v)} />
          <StepInput label="Steps" val={dd.steps} color="#8B5CF6" emoji="👟" set={v => upd(day, "steps", v)} />
        </div>
      </div>

      <Lbl text="Energy & Focus" />
      <div style={S.card}>
        <Rating label="Energy" value={dd.energy} color="#D4432F" set={v => upd(day, "energy", v)} />
        <div style={{ height: 1, background: "#F2F2F7", margin: "14px 0" }} />
        <Rating label="Focus" value={dd.focus} color="#1A7A6D" set={v => upd(day, "focus", v)} />
      </div>

      <Lbl text="Daily Reflection" />
      <div style={S.card}>
        <div style={{ background: "#FDF5F4", borderRadius: 12, padding: "14px 16px", marginBottom: 14, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 3, minHeight: 28, borderRadius: 2, background: "#D4432F", flexShrink: 0 }} />
          <div style={{ fontSize: 14, color: "#1C1C1E", fontStyle: "italic", lineHeight: 1.5, fontWeight: 500 }}>{prompt}</div>
        </div>
        <textarea value={dd.reflection} onChange={e => upd(day, "reflection", e.target.value)} placeholder="Take a moment to reflect..." style={S.ta} rows={4} />
      </div>

      <Lbl text="Notes & Gratitude" />
      <div style={{ ...S.card, marginBottom: 100 }}>
        <textarea value={dd.notes} onChange={e => upd(day, "notes", e.target.value)} placeholder="Anything on your mind..." style={S.ta} rows={3} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*            METRIC WIDGETS              */
/* ═══════════════════════════════════════ */
function Counter({ label, unit, val, color, emoji, set }) {
  return (
    <div style={{ flex: 1, background: "#F9F9FB", borderRadius: 14, padding: "14px 6px", textAlign: "center" }}>
      <div style={{ fontSize: 24 }}>{emoji}</div>
      <div style={{ fontSize: 11, color: "#8E8E93", fontWeight: 500, margin: "4px 0 10px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <button onClick={() => set(Math.max(0, val - 1))} style={{ ...S.cntBtn, borderColor: color, color }}>−</button>
        <span style={{ fontSize: 24, fontWeight: 700, color, minWidth: 28 }}>{val}</span>
        <button onClick={() => set(val + 1)} style={{ ...S.cntBtn, borderColor: color, color }}>+</button>
      </div>
      <div style={{ fontSize: 10, color: "#C7C7CC", marginTop: 4 }}>{unit}</div>
    </div>
  );
}

function StepInput({ label, val, color, emoji, set }) {
  return (
    <div style={{ flex: 1, background: "#F9F9FB", borderRadius: 14, padding: "14px 6px", textAlign: "center" }}>
      <div style={{ fontSize: 24 }}>{emoji}</div>
      <div style={{ fontSize: 11, color: "#8E8E93", fontWeight: 500, margin: "4px 0 6px" }}>{label}</div>
      <input type="number" value={val || ""} onChange={e => set(parseInt(e.target.value) || 0)} placeholder="0"
        style={{ width: "100%", border: "none", borderBottom: `2px solid ${color}`, background: "transparent", textAlign: "center", fontSize: 22, fontWeight: 700, color, outline: "none", padding: "2px 0" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6, justifyContent: "center" }}>
        {[3000, 5000, 8000, 10000].map(p => (
          <button key={p} onClick={() => set(p)}
            style={{ fontSize: 9, padding: "3px 6px", borderRadius: 6, border: `1px solid ${val === p ? color : "#E5E5EA"}`, background: val === p ? color : "#fff", color: val === p ? "#fff" : "#8E8E93", cursor: "pointer" }}>
            {p / 1000}k
          </button>
        ))}
      </div>
    </div>
  );
}

function Rating({ label, value, color, set }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 56, flexShrink: 0, fontSize: 13, fontWeight: 600, color: "#48484A" }}>{label}</div>
      <span style={{ fontSize: 9, color: "#C7C7CC", flexShrink: 0 }}>LOW</span>
      <div style={{ display: "flex", gap: 8, flex: 1, justifyContent: "center" }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => set(value === n ? 0 : n)}
            style={{ width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${n <= value ? color : "#E5E5EA"}`, background: n <= value ? color : "#fff", color: n <= value ? "#fff" : "#8E8E93", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
            {n}
          </button>
        ))}
      </div>
      <span style={{ fontSize: 9, color: "#C7C7CC", flexShrink: 0 }}>HIGH</span>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*              CALENDAR VIEW             */
/* ═══════════════════════════════════════ */
function CalendarView({ data, cur, onSel }) {
  const st = d => { const dy = data.days[d]; if (!dy) return 0; let s = dy.goals.filter(g => g.done).length + dy.habits.filter(Boolean).length; if (dy.energy) s++; if (dy.focus) s++; if (dy.reflection) s++; if (dy.notes) s++; return Math.min(s / 14, 1); };
  return (
    <div style={S.scroll}>
      <div style={{ padding: "20px 20px 10px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#1C1C1E" }}>Calendar</div>
        <div style={{ fontSize: 13, color: "#8E8E93", marginTop: 4 }}>Tap a day to view or edit.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, padding: "12px 20px" }}>
        {Array.from({ length: 30 }, (_, i) => i + 1).map(d => {
          const s = st(d), isA = d === cur, has = s > 0;
          return (
            <button key={d} onClick={() => onSel(d)} style={{ aspectRatio: "1", borderRadius: 14, border: `2px solid ${isA ? "#D4432F" : has ? "#E5E5EA" : "transparent"}`, background: has ? `rgba(26,122,109,${.05 + s * .15})` : "#F9F9FB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: isA ? "#D4432F" : has ? "#1A7A6D" : "#8E8E93" }}>{String(d).padStart(2, "0")}</div>
              <div style={{ fontSize: 9, color: "#8E8E93", marginTop: 2 }}>{has ? `${Math.round(s * 100)}%` : "—"}</div>
              {isA && <div style={{ width: 5, height: 5, borderRadius: 3, background: "#D4432F", marginTop: 3 }} />}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "16px 20px 100px" }}>
        <Lbl text="Habit Streaks" />
        <div style={S.card}>
          {HABITS.map((h, hi) => (
            <div key={hi} style={{ marginBottom: hi < HABITS.length - 1 ? 12 : 0 }}>
              <div style={{ fontSize: 11, color: "#636366", marginBottom: 4, fontWeight: 500 }}>{h}</div>
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: 30 }, (_, i) => <div key={i} style={{ flex: 1, aspectRatio: "1", borderRadius: 3, background: data.days[i + 1]?.habits[hi] ? "#1A7A6D" : "#F2F2F7", minWidth: 3 }} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*          WRAPPED (Spotify-style)       */
/* ═══════════════════════════════════════ */
function WrappedView({ data }) {
  const D = Object.values(data.days);
  const act = D.filter(d => d.habits.some(Boolean) || d.goals.some(g => g.done));
  const tw = D.reduce((s, d) => s + (d.water || 0), 0);
  const tc = D.reduce((s, d) => s + (d.coffee || 0), 0);
  const ts = D.reduce((s, d) => s + (d.steps || 0), 0);
  const tg = D.reduce((s, d) => s + d.goals.filter(g => g.done).length, 0);
  const th = D.reduce((s, d) => s + d.habits.filter(Boolean).length, 0);
  const eA = act.filter(d => d.energy > 0), fA = act.filter(d => d.focus > 0);
  const eAvg = eA.length ? (eA.reduce((s, d) => s + d.energy, 0) / eA.length).toFixed(1) : "0";
  const fAvg = fA.length ? (fA.reduce((s, d) => s + d.focus, 0) / fA.length).toFixed(1) : "0";
  const refs = D.filter(d => d.reflection?.trim()).length;
  let best = 0, cr = 0;
  for (let i = 1; i <= 30; i++) { if (data.days[i]?.habits.some(Boolean)) { cr++; best = Math.max(best, cr); } else cr = 0; }
  const hc = HABITS.map((h, i) => ({ name: h, count: D.filter(d => d.habits[i]).length })).sort((a, b) => b.count - a.count);
  const waterL = (tw * 0.25).toFixed(1);
  const stepsKm = (ts * 0.00075).toFixed(1);

  // Best energy day
  let bestEDay = 0, bestE = 0;
  for (let i = 1; i <= 30; i++) { if ((data.days[i]?.energy || 0) > bestE) { bestE = data.days[i].energy; bestEDay = i; } }

  const CARDS = [
    { type: "hero", bg: "linear-gradient(135deg,#0D0D0D,#1C1C1E)", name: data.name, activeDays: act.length },
    { type: "stat", bg: "linear-gradient(135deg,#1e3a5f,#3B82F6)", emoji: "💧", big: tw, unit: "glasses of water", detail: `That's roughly ${waterL} liters of hydration` },
    { type: "stat", bg: "linear-gradient(135deg,#451a03,#92400E)", emoji: "☕", big: tc, unit: "cups of coffee", detail: tc > 0 ? `${(tc / Math.max(act.length, 1)).toFixed(1)} cups per active day on average` : "No coffee logged yet — staying natural!" },
    { type: "stat", bg: "linear-gradient(135deg,#3b0764,#8B5CF6)", emoji: "👟", big: ts.toLocaleString(), unit: "total steps", detail: `Approximately ${stepsKm} km walked this month` },
    { type: "stat", bg: "linear-gradient(135deg,#7f1d1d,#D4432F)", emoji: "🎯", big: tg, unit: "goals completed", detail: `${act.length * 3 > 0 ? Math.round(tg / (act.length * 3) * 100) : 0}% completion rate across ${act.length} active days` },
    { type: "stat", bg: "linear-gradient(135deg,#064e3b,#1A7A6D)", emoji: "🔥", big: best, unit: "day best streak", detail: `${th} total habit check-ins logged` },
    { type: "dual", bg: "linear-gradient(135deg,#1e1b4b,#4F46E5)", l1: "ENERGY", v1: eAvg, s1: "avg / 5", l2: "FOCUS", v2: fAvg, s2: "avg / 5" },
    { type: "stat", bg: "linear-gradient(135deg,#4a1942,#BE185D)", emoji: "✍️", big: refs, unit: "reflections written", detail: refs > 0 ? "Self-awareness is your superpower" : "Try writing your first reflection today!" },
    { type: "tophabit", bg: "linear-gradient(135deg,#1C1C1E,#48484A)", habit: hc[0]?.name || "—", count: hc[0]?.count || 0 },
    bestEDay > 0 ? { type: "stat", bg: "linear-gradient(135deg,#78350f,#F59E0B)", emoji: "⚡", big: `Day ${bestEDay}`, unit: "was your peak energy day", detail: `You rated your energy ${bestE}/5 that day` } : null,
  ].filter(Boolean);

  return (
    <div style={S.scroll}>
      <div style={{ padding: "20px 20px 10px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#1C1C1E" }}>Wrapped</div>
        <div style={{ fontSize: 13, color: "#8E8E93", marginTop: 4 }}>Your month, visualized. Always live.</div>
      </div>
      <div style={{ padding: "8px 20px 100px", display: "flex", flexDirection: "column", gap: 14 }}>
        {CARDS.map((c, i) => <WCard key={i} c={c} i={i} />)}
      </div>
    </div>
  );
}

function WCard({ c, i }) {
  const [v, setV] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect();
  }, []);

  const base = {
    background: c.bg, borderRadius: 22, padding: "30px 26px", minHeight: 180,
    display: "flex", flexDirection: "column", justifyContent: "center",
    opacity: v ? 1 : 0, transform: v ? "translateY(0) scale(1)" : "translateY(40px) scale(0.96)",
    transition: `all .7s cubic-bezier(.4,0,.2,1) ${i * .06}s`,
    position: "relative", overflow: "hidden",
  };
  const circle1 = { position: "absolute", top: -30, right: -30, width: 130, height: 130, borderRadius: 65, background: "rgba(255,255,255,.06)" };
  const circle2 = { position: "absolute", bottom: -25, left: -25, width: 90, height: 90, borderRadius: 45, background: "rgba(255,255,255,.04)" };

  if (c.type === "hero") return (
    <div ref={ref} style={{ ...base, minHeight: 220, justifyContent: "flex-end" }}>
      <div style={circle1} /><div style={circle2} />
      <div style={{ position: "absolute", top: 28, left: 26, fontSize: 13, fontWeight: 700, color: "#D4432F", letterSpacing: ".15em" }}>YOUR 30-DAY</div>
      <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", letterSpacing: ".06em", lineHeight: 1, marginBottom: 8 }}>WRAPPED</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{c.name}</div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,.5)" }}>{c.activeDays} active days and counting</div>
    </div>
  );

  if (c.type === "dual") return (
    <div ref={ref} style={{ ...base, minHeight: 160 }}>
      <div style={circle1} /><div style={circle2} />
      <div style={{ display: "flex", gap: 16 }}>
        {[{ l: c.l1, v: c.v1, s: c.s1 }, { l: c.l2, v: c.v2, s: c.s2 }].map((x, j) => (
          <div key={j} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.5)", letterSpacing: ".1em", marginBottom: 10 }}>{x.l}</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{x.v}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.55)", marginTop: 8 }}>{x.s}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (c.type === "tophabit") return (
    <div ref={ref} style={base}>
      <div style={circle1} /><div style={circle2} />
      <div style={{ fontSize: 13, fontWeight: 700, color: "#D4432F", letterSpacing: ".12em", marginBottom: 10 }}>🏆 TOP HABIT</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.35, marginBottom: 8 }}>{c.habit}</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>Completed {c.count} out of 30 days</div>
    </div>
  );

  return (
    <div ref={ref} style={base}>
      <div style={circle1} /><div style={circle2} />
      <div style={{ fontSize: 40, marginBottom: 10 }}>{c.emoji}</div>
      <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-.02em" }}>{c.big}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,.7)", marginTop: 8, letterSpacing: ".02em" }}>{c.unit}</div>
      {c.detail && <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginTop: 12, lineHeight: 1.5 }}>{c.detail}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*              OVERVIEW VIEW             */
/* ═══════════════════════════════════════ */
function OverviewView({ data }) {
  const D = Object.values(data.days);
  const act = D.filter(d => d.habits.some(Boolean) || d.goals.some(g => g.done)).length;
  const tg = D.reduce((s, d) => s + d.goals.filter(g => g.done).length, 0);
  const th = D.reduce((s, d) => s + d.habits.filter(Boolean).length, 0);
  const eA = D.filter(d => d.energy > 0), fA = D.filter(d => d.focus > 0);
  const eAvg = eA.length ? (eA.reduce((s, d) => s + d.energy, 0) / eA.length).toFixed(1) : "—";
  const fAvg = fA.length ? (fA.reduce((s, d) => s + d.focus, 0) / fA.length).toFixed(1) : "—";
  let best = 0, cr = 0;
  for (let i = 1; i <= 30; i++) { if (data.days[i]?.habits.some(Boolean)) { cr++; best = Math.max(best, cr); } else cr = 0; }
  const hs = HABITS.map((h, i) => ({ name: h, pct: Math.round(D.filter(d => d.habits[i]).length / 30 * 100) }));
  return (
    <div style={S.scroll}>
      <div style={{ padding: "20px 20px 10px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#1C1C1E" }}>Stats</div>
        <div style={{ fontSize: 13, color: "#8E8E93", marginTop: 4 }}>Your 30-day journey at a glance.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "12px 20px" }}>
        {[
          { l: "Days Active", v: act, s: "/30", clr: "#D4432F" },
          { l: "Goals Done", v: tg, s: "", clr: "#1A7A6D" },
          { l: "Habits Hit", v: th, s: "", clr: "#B8860B" },
          { l: "Best Streak", v: best, s: "days", clr: "#636366" },
          { l: "Avg Energy", v: eAvg, s: "/5", clr: "#D4432F" },
          { l: "Avg Focus", v: fAvg, s: "/5", clr: "#1A7A6D" },
        ].map((x, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "14px 12px", boxShadow: "0 1px 3px rgba(0,0,0,.04),0 0 0 1px rgba(0,0,0,.02)" }}>
            <div style={{ fontSize: 10, color: "#8E8E93", letterSpacing: ".06em", fontWeight: 500, marginBottom: 6 }}>{x.l.toUpperCase()}</div>
            <span style={{ fontSize: 28, fontWeight: 700, color: x.clr, lineHeight: 1 }}>{x.v}</span>
            <span style={{ fontSize: 12, color: "#C7C7CC" }}>{x.s}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 20px" }}>
        <Lbl text="Habit Breakdown" />
        <div style={S.card}>
          {hs.map((h, i) => (
            <div key={i} style={{ marginBottom: i < hs.length - 1 ? 14 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#48484A", fontWeight: 500 }}>{h.name}</span>
                <span style={{ fontSize: 12, color: "#8E8E93", fontWeight: 600 }}>{h.pct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "#F2F2F7", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg,#1A7A6D,#2AAA9A)", width: `${h.pct}%`, transition: "width .6s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 20px 100px" }}>
        <Lbl text="Energy & Focus Trend" />
        <div style={S.card}><TrendChart data={data} /></div>
      </div>
    </div>
  );
}

function TrendChart({ data }) {
  const w = 280, h = 90, p = 24, pw = w - p * 2, ph = h - p;
  const pts = (key) => Array.from({ length: 30 }, (_, i) => { const v = data.days[i + 1]?.[key] || 0; return `${p + (i / 29) * pw},${h - p - (v / 5) * ph}`; }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 110 }}>
      {[1,2,3,4,5].map(v => <line key={v} x1={p} y1={h - p - (v / 5) * ph} x2={w - p} y2={h - p - (v / 5) * ph} stroke="#F2F2F7" strokeWidth={.5} />)}
      <polyline fill="none" stroke="#D4432F" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" points={pts("energy")} />
      <polyline fill="none" stroke="#1A7A6D" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" points={pts("focus")} />
      <circle cx={p} cy={9} r={3.5} fill="#D4432F" /><text x={p + 8} y={12} fontSize={8} fill="#636366">Energy</text>
      <circle cx={p + 52} cy={9} r={3.5} fill="#1A7A6D" /><text x={p + 60} y={12} fontSize={8} fill="#636366">Focus</text>
    </svg>
  );
}

/* ═══════════════════════════════════════ */
/*              SETTINGS VIEW             */
/* ═══════════════════════════════════════ */
function SettingsView({ name, start, onReset }) {
  const [cfm, setCfm] = useState(false);
  return (
    <div style={S.scroll}>
      <div style={{ padding: "20px 20px 10px" }}><div style={{ fontSize: 24, fontWeight: 700, color: "#1C1C1E" }}>Settings</div></div>
      <div style={{ padding: "8px 20px 100px" }}>
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0" }}>
            <span style={{ fontSize: 14, color: "#8E8E93" }}>Name</span><span style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1E" }}>{name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderTop: "1px solid #F2F2F7" }}>
            <span style={{ fontSize: 14, color: "#8E8E93" }}>Started</span>
            <span style={{ fontSize: 15, fontWeight: 500, color: "#48484A" }}>{new Date(start).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          {!cfm ? (
            <button onClick={() => setCfm(true)} style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: "#FDF5F4", color: "#D4432F", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Reset All Data</button>
          ) : (
            <div style={S.card}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#D4432F", marginBottom: 8 }}>Are you sure?</div>
              <div style={{ fontSize: 13, color: "#636366", marginBottom: 16 }}>This will permanently delete all your progress.</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setCfm(false)} style={{ flex: 1, padding: 13, borderRadius: 10, border: "none", background: "#F2F2F7", color: "#48484A", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={onReset} style={{ flex: 1, padding: 13, borderRadius: 10, border: "none", background: "#D4432F", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Delete Everything</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 48, textAlign: "center", color: "#C7C7CC", fontSize: 12 }}>
          <div style={{ fontWeight: 700, letterSpacing: ".1em", marginBottom: 4 }}>30-DAY PRODUCTIVITY TRACKER</div>
          <div>Designed for intentional living</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*              SHARED / MISC             */
/* ═══════════════════════════════════════ */
function Lbl({ text }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 20px 8px" }}><span style={{ fontSize: 11, fontWeight: 700, color: "#1C1C1E", letterSpacing: ".1em", whiteSpace: "nowrap" }}>{text.toUpperCase()}</span><div style={{ flex: 1, height: 1, background: "#E5E5EA" }} /></div>;
}

function Loading() {
  return <div style={{ ...S.shell, display: "flex", alignItems: "center", justifyContent: "center" }}><style>{CSS}</style>
    <div style={{ textAlign: "center" }}><div style={{ fontSize: 36, fontWeight: 800, color: "#1C1C1E" }}>30</div><div style={{ fontSize: 12, color: "#8E8E93", letterSpacing: ".15em" }}>LOADING</div></div></div>;
}

/* ═══════════════════════════════════════ */
/*                 STYLES                 */
/* ═══════════════════════════════════════ */
const CSS = `
*{box-sizing:border-box;margin:0;padding:0;font-family:'DM Sans',-apple-system,sans-serif;-webkit-tap-highlight-color:transparent}
input,textarea,button{font-family:'DM Sans',-apple-system,sans-serif}textarea{resize:none}button{cursor:pointer}
::-webkit-scrollbar{width:0}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
input[type=number]{-moz-appearance:textfield}
`;

const S = {
  shell: { width: "100%", minHeight: "100vh", background: "linear-gradient(180deg,#FAFAFA,#F2F2F7)" },
  app: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#FAFAFA", position: "relative", boxShadow: "0 0 40px rgba(0,0,0,.04)" },
  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(255,255,255,.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid #F2F2F7", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "6px 0 20px", zIndex: 100 },
  navBtn: { background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 6px", transition: "color .2s", gap: 1 },
  scroll: { overflowY: "auto", height: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 8px" },
  dayBadge: { width: 50, height: 50, borderRadius: 15, background: "#1C1C1E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" },
  arrowBtn: { width: 38, height: 38, borderRadius: 10, border: "1px solid #E5E5EA", background: "#fff", color: "#48484A", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" },
  card: { margin: "0 20px 14px", background: "#fff", borderRadius: 18, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.04),0 0 0 1px rgba(0,0,0,.02)" },
  ta: { width: "100%", border: "none", borderBottom: "1px dashed #E5E5EA", fontSize: 14, color: "#1C1C1E", outline: "none", background: "transparent", padding: "6px 0", lineHeight: 1.6 },
  cntBtn: { width: 32, height: 32, borderRadius: 8, border: "1.5px solid", background: "#fff", fontSize: 18, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  bigBtn: { padding: "16px 44px", borderRadius: 14, background: "#1C1C1E", color: "#fff", border: "none", fontSize: 15, fontWeight: 600, letterSpacing: ".02em", transition: "opacity .3s" },
};
