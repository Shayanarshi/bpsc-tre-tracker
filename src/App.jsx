import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Circle, Clock3, GraduationCap, RotateCcw, Search, Target } from "lucide-react";
import { courseData } from "./data/courseData.js";
import { buildSchedule, formatDate, formatDuration, formatClock, TARGET_SECONDS } from "./utils/schedule.js";

const schedule = buildSchedule();
const STORAGE_KEY = "bpsc-tre4-progress-v1";
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
const allLectures = courseData.subjects.flatMap(s => s.lectures);
const totalVideoSeconds = allLectures.reduce((sum,l) => sum + l.durationSeconds, 0);
const subjectColor = {
  "Data Structures":"blue", "Algorithm":"blue", "Digital Logic & Circuits":"violet",
  "C Programming":"orange", "C++ Programming":"orange", "DBMS":"teal",
  "Operating System":"teal", "Computer Organization":"violet",
  "Computer Networks":"indigo", "Network Security and Attacks":"indigo",
  "English":"rose", "Reasoning":"amber", "Aptitude":"amber",
  "Physics":"emerald", "Chemistry":"emerald", "Biology":"emerald"
};

export default function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [selectedDay, setSelectedDay] = useState(1);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All subjects");
  const [showEstimated, setShowEstimated] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  const saveProgress = (next) => {
    setProgress(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };
  const selected = schedule[selectedDay - 1];
  const isDone = id => Boolean(progress[id]);
  const completedCount = allLectures.filter(l => isDone(l.id)).length;
  const watchedSeconds = allLectures.reduce((sum,l) => sum + (isDone(l.id) ? l.durationSeconds : 0), 0);
  const totalEstimated = allLectures.filter(l => l.estimated).length;
  const dayWatched = selected.lectures.reduce((sum,l) => sum + (isDone(l.id) ? l.durationSeconds : 0), 0);
  const dayCompleted = selected.lectures.filter(l => isDone(l.id)).length;
  const filteredLectures = selected.lectures.filter(l => {
    const queryMatch = `${l.title} ${l.subject}`.toLowerCase().includes(search.toLowerCase());
    const subjectMatch = subjectFilter === "All subjects" || l.subject === subjectFilter;
    const estimatedMatch = showEstimated || !l.estimated;
    const completedMatch = showCompleted || !isDone(l.id);
    return queryMatch && subjectMatch && estimatedMatch && completedMatch;
  });
  const subjectStats = useMemo(() => courseData.subjects.map(s => {
    const lectures = s.lectures;
    const completed = lectures.filter(l => isDone(l.id)).length;
    const seconds = lectures.reduce((n,l) => n + l.durationSeconds,0);
    const watched = lectures.reduce((n,l) => n + (isDone(l.id) ? l.durationSeconds : 0),0);
    return {...s, completed, count:lectures.length, seconds, watched};
  }).sort((a,b) => b.seconds-a.seconds), [progress]);
  const dailyMin = Math.min(...schedule.map(d => d.totalSeconds));
  const dailyMax = Math.max(...schedule.map(d => d.totalSeconds));
  const toggleLecture = (id) => saveProgress({...progress, [id]: !progress[id]});
  const markDay = (done) => {
    const next = {...progress};
    selected.lectures.forEach(l => { next[l.id] = done; });
    saveProgress(next);
  };
  const reset = () => { saveProgress({}); setConfirmReset(false); };

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-mark"><GraduationCap size={23}/></div>
      <div className="brand-copy"><strong>BPSC TRE 4.0</strong><span>COMPUTER SCIENCE STUDY TRACKER</span></div>
      <div className="topbar-right"><span className="status-dot"></span> Progress saved on this device</div>
    </header>

    <main className="container">
      <section className="hero">
        <div>
          <div className="eyebrow"><CalendarDays size={15}/> NOVEMBER 1–30, 2026</div>
          <h1>Your 30-day study plan</h1>
          <p>Every lecture accounted for. Tick videos as you finish them and your progress updates automatically.</p>
        </div>
        <div className="hero-target"><Target size={18}/><div><strong>6 hours/day</strong><span>Target video time</span></div></div>
      </section>

      <section className="salary-card" aria-label="BPSC teacher salary motivation">
        <div className="salary-card-header">
          <div className="salary-icon" aria-hidden="true">₹</div>
          <div className="salary-heading-copy">
            <h2>BPSC Higher Secondary Teacher (Classes 11–12)</h2>
            <p>Computer Science · TRE 4.0 target</p>
          </div>
        </div>
        <div className="salary-details">
          <div className="salary-metric">
            <p>Reported entry basic pay</p>
            <h3>₹32,000</h3>
            <small>Per month, as reported for TRE 4.0</small>
          </div>
          <div className="salary-metric">
            <p>Reported estimated net salary</p>
            <h3 className="salary-green">₹61,690</h3>
            
          </div>
        </div>
        <div className="salary-motivation"><Target size={17} /> Study today. Build your future.</div>
      </section>

      <section className="stats-grid">
        <Stat icon={<CheckCircle2/>} label="Course completion" value={`${Math.round(completedCount/allLectures.length*100)}%`} detail={`${completedCount} of ${allLectures.length} lectures`} progress={completedCount/allLectures.length}/>
        <Stat icon={<Clock3/>} label="Video watched" value={formatDuration(watchedSeconds)} detail={`${formatDuration(Math.max(0,totalVideoSeconds-watchedSeconds))} remaining`} progress={watchedSeconds/totalVideoSeconds}/>
        <Stat icon={<CalendarDays/>} label="Days planned" value="30" detail="Nov 1 – Nov 30, 2026"/>
        <Stat icon={<GraduationCap/>} label="Total video library" value={formatDuration(totalVideoSeconds)} detail={`${allLectures.length} lectures · ${totalEstimated} estimated`}/>
      </section>

      <section className="schedule-summary">
        <div><strong>Daily load check</strong><span>All recorded lectures are distributed across the 30 days.</span></div>
        <div className="load-value"><strong>{formatDuration(dailyMin)}–{formatDuration(dailyMax)}</strong><span>scheduled per day</span></div>
      </section>
      <div className="notice"><strong>Duration note:</strong> Your supplied timed lists contain fewer entries than some course overview counts. Missing entries are included as clearly labelled 30-minute estimates; they are not presented as verified titles or durations. The course data total is about {formatDuration(totalVideoSeconds)}, so the daily average is slightly above 6 hours to fit all supplied and estimated lectures into 30 days.</div>

      <section className="workspace">
        <aside className="day-sidebar">
          <div className="sidebar-heading"><h2>Study days</h2><span>30 DAYS</span></div>
          <div className="day-list">
            {schedule.map(day => {
              const done = day.lectures.filter(l=>isDone(l.id)).length;
              const percent = day.lectures.length ? Math.round(done/day.lectures.length*100) : 0;
              return <button key={day.day} className={`day-option ${selectedDay===day.day?"active":""}`} onClick={()=>setSelectedDay(day.day)}>
                <div className="day-number">{String(day.day).padStart(2,"0")}</div>
                <div className="day-option-copy"><strong>{formatDate(day.date)}</strong><span>{day.lectures.length} lectures · {formatDuration(day.totalSeconds)}</span><div className="mini-track"><i style={{width:`${percent}%`}}/></div></div>
                <span className={`day-percent ${percent===100?"finished":""}`}>{percent}%</span>
              </button>;
            })}
          </div>
        </aside>

        <section className="day-content">
          <div className="day-title-row">
            <div><div className="eyebrow">DAY {String(selectedDay).padStart(2,"0")} OF 30</div><h2>{formatDate(selected.date)}</h2><p>{selected.lectures.length} lectures scheduled for this day</p></div>
            <div className="day-ring" style={{"--progress":`${selected.lectures.length?dayCompleted/selected.lectures.length*100:0}%`}}><div><strong>{Math.round(dayCompleted/Math.max(1,selected.lectures.length)*100)}%</strong><span>complete</span></div></div>
          </div>
          <div className="day-metrics">
            <div><span>Planned video</span><strong>{formatDuration(selected.totalSeconds)}</strong></div>
            <div><span>Watched</span><strong>{formatDuration(dayWatched)}</strong></div>
            <div><span>Remaining</span><strong>{formatDuration(selected.totalSeconds-dayWatched)}</strong></div>
          </div>
          <div className="day-actions">
            <button className="btn btn-secondary" onClick={()=>markDay(true)}>Mark day complete</button>
            <button className="btn btn-quiet" onClick={()=>markDay(false)}>Uncheck day</button>
          </div>

          <div className="filters">
            <label className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search lecture or subject…"/></label>
            <select value={subjectFilter} onChange={e=>setSubjectFilter(e.target.value)} aria-label="Filter by subject"><option>All subjects</option>{courseData.subjects.map(s=><option key={s.name}>{s.name}</option>)}</select>
          </div>
          <div className="filter-toggles">
            <label><input type="checkbox" checked={showEstimated} onChange={e=>setShowEstimated(e.target.checked)}/> Show estimated lectures</label>
            <label><input type="checkbox" checked={showCompleted} onChange={e=>setShowCompleted(e.target.checked)}/> Show completed</label>
            <span>{filteredLectures.length} shown</span>
          </div>

          <div className="lecture-list">
            {filteredLectures.map((lecture, index) => <LectureRow key={lecture.id} lecture={lecture} checked={isDone(lecture.id)} onToggle={()=>toggleLecture(lecture.id)} number={selected.lectures.indexOf(lecture)+1}/>)}
            {!filteredLectures.length && <div className="empty-state">No lectures match these filters.</div>}
          </div>
          <div className="day-footer"><span><Circle size={13}/> Pending</span><span><CheckCircle2 size={13}/> Completed</span><span className="estimate-key">Est. = estimated duration</span></div>
        </section>
      </section>

      <section className="subject-section">
        <div className="section-heading"><div><h2>Subject-wise progress</h2><p>Track completion across the whole course.</p></div><span>{courseData.subjects.length} subjects</span></div>
        <div className="subject-grid">
          {subjectStats.map(s=><div className="subject-card" key={s.name}>
            <div className="subject-card-top"><span className={`subject-dot ${subjectColor[s.name]||"slate"}`}></span><strong>{s.name}</strong><span className="subject-count">{s.completed}/{s.count}</span></div>
            <div className="subject-track"><i style={{width:`${s.completed/Math.max(1,s.count)*100}%`}}/></div>
            <div className="subject-card-bottom"><span>{Math.round(s.completed/Math.max(1,s.count)*100)}% complete</span><span>{formatDuration(s.seconds)} video</span></div>
          </div>)}
        </div>
      </section>

      <footer className="footer">
        <div><strong>BPSC TRE 4.0 Tracker</strong><span>Progress is stored in this browser using local storage.</span></div>
        <button className="btn btn-quiet reset-btn" onClick={()=>setConfirmReset(true)}><RotateCcw size={15}/> Reset all progress</button>
      </footer>
    </main>

    {confirmReset && <div className="modal-backdrop" role="presentation" onClick={()=>setConfirmReset(false)}><div className="confirm-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><h3>Reset all progress?</h3><p>This will uncheck every lecture on this device. This cannot be undone.</p><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setConfirmReset(false)}>Cancel</button><button className="btn btn-danger" onClick={reset}>Reset progress</button></div></div></div>}
  </div>;
}

function Stat({icon,label,value,detail,progress}) {
  return <div className="stat-card"><div className="stat-top"><span className="stat-icon">{icon}</span><span>{label}</span></div><strong className="stat-value">{value}</strong><span className="stat-detail">{detail}</span>{progress!==undefined&&<div className="stat-track"><i style={{width:`${progress*100}%`}}/></div>}</div>;
}
function LectureRow({lecture,checked,onToggle,number}) {
  return <label className={`lecture-row ${checked?"is-complete":""}`}>
    <input type="checkbox" checked={checked} onChange={onToggle}/>
    <span className="custom-check">{checked?<CheckCircle2 size={19}/>:<Circle size={19}/>}</span>
    <span className="lecture-number">{String(number).padStart(2,"0")}</span>
    <span className="lecture-copy"><strong>{lecture.title}</strong><span className="lecture-subject">{lecture.subject}{lecture.estimated&&<em>Estimated</em>}</span></span>
    <span className="lecture-duration">{formatClock(lecture.durationSeconds)}</span>
  </label>;
}
