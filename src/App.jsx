import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import {
  Home, Users, Clock, CheckCircle2, AlertTriangle, Calendar, CalendarDays,
  CalendarCheck, Search, RefreshCw, ChevronRight, ChevronDown, X, Settings,
  Briefcase, MessageSquare, Laptop, UserPlus, Coffee, FileText, Building2,
  MapPin, User, Sparkles, ArrowUpRight, Link2, Bell, Inbox, Filter,
  LayoutGrid, List, ShieldCheck, Loader2
} from 'lucide-react';

/* ============================================================
   SIMPLIFIED 4-PHASE TASK MODEL
   ============================================================ */
const PHASES = [
  {
    id: 'pre-stakeholder',
    name: 'Pre-Joining',
    sub: 'Stakeholder Notifications',
    timing: 'Before Joining',
    daysOffset: -14,
    icon: MessageSquare,
    tasks: [
      { id: 'mgr-notif', name: 'Manager team notified',
        desc: 'Auto Teams ping to manager group chat with joiner profile, DOJ, and action items.',
        owner: 'Automation', ownerRole: 'HR', evidence: 'Teams message ID', auto: true },
      { id: 'it-notif', name: 'IT/Admin team notified',
        desc: 'Auto Teams ping to IT and Admin group chats with prep checklist.',
        owner: 'Automation', ownerRole: 'IT', evidence: 'Teams message ID', auto: true }
    ]
  },
  {
    id: 'pre-prep',
    name: 'Pre-Joining',
    sub: 'Preparation',
    timing: 'Before Joining',
    daysOffset: -7,
    icon: CalendarDays,
    tasks: [
      { id: 'seating', name: 'Seating arrangement',
        desc: 'Workspace allocated. Desk, chair, monitor, and peripherals confirmed.',
        owner: 'Admin Team', ownerRole: 'IT', evidence: 'Desk number / location' },
      { id: 'buddy', name: 'Team buddy assigned',
        desc: 'Reporting manager appoints a peer buddy to support the new joiner.',
        owner: 'Reporting Manager', ownerRole: 'LM', evidence: 'Buddy name', editable: true },
      { id: 'sys-reqs', name: 'IT system requirements',
        desc: 'Manager shares tools, software access, and hardware needs with IT.',
        owner: 'Reporting Manager', ownerRole: 'LM', evidence: 'Requirements doc', editable: true },
      { id: 'preboard-email', name: 'Pre-boarding welcome email',
        desc: 'Welcome email with Day 1 agenda, dress code, and document checklist sent to joiner.',
        owner: 'HR Team', ownerRole: 'HR', evidence: 'Email sent timestamp' }
    ]
  },
  {
    id: 'day1',
    name: 'Day 1',
    sub: 'Day of Joining',
    timing: 'Day 1',
    daysOffset: 0,
    icon: Sparkles,
    tasks: [
      { id: 'office-tour', name: 'Office tour',
        desc: 'Walk through facilities, introduce to support teams.',
        owner: 'HR Team', ownerRole: 'HR', evidence: 'Tour completed' },
      { id: 'it-orient', name: 'IT orientation',
        desc: 'Laptop handover, account activation, VPN, security briefing.',
        owner: 'IT Team', ownerRole: 'IT', evidence: 'Devices issued' },
      { id: 'hr-orient', name: 'HR orientation',
        desc: 'Policies, benefits, employment terms, and HR support channels.',
        owner: 'HR Team', ownerRole: 'HR', evidence: 'Acknowledgement signed' },
      { id: 'lunch', name: 'Welcome lunch',
        desc: 'Team lunch arranged to welcome the new joiner.',
        owner: 'Reporting Manager', ownerRole: 'LM', evidence: 'Lunch arranged' },
      { id: 'decibel', name: 'Decibel induction',
        desc: 'HR portal walkthrough, account activation, and self-service training.',
        owner: 'HR Team', ownerRole: 'HR', evidence: 'Login verified' },
      { id: 'post-email', name: 'Post-joining email',
        desc: 'Confirmation email from leadership and welcome announcement.',
        owner: 'HR Team', ownerRole: 'HR', evidence: 'Email sent' },
      { id: 'team-orient', name: 'Team orientation',
        desc: 'Introduce to team, walk through ways of working and communication norms.',
        owner: 'Reporting Manager', ownerRole: 'LM', evidence: 'Intros done' },
      { id: 'buddy-session', name: 'HR buddy session',
        desc: 'First check-in with assigned buddy. Discuss Day 1 experience.',
        owner: 'Buddy', ownerRole: 'LM', evidence: 'Session held' },
      { id: 'docs-d1', name: 'Document compliance',
        desc: 'Collect ID, academic certificates, photos, and tax forms.',
        owner: 'HR Team', ownerRole: 'HR', evidence: 'Documents collected' }
    ]
  },
  {
    id: 'week1',
    name: 'First Week',
    sub: 'Week of Joining',
    timing: 'First Week',
    daysOffset: 3,
    icon: CalendarCheck,
    tasks: [
      { id: 'docs-w1', name: 'Document compliance follow-up',
        desc: 'Verify, upload, and confirm completeness of all submitted documents.',
        owner: 'HR Team', ownerRole: 'HR', evidence: 'Documents verified' },
      { id: 'banner', name: 'New joiner banner',
        desc: 'Internal announcement banner created, approved, and published.',
        owner: 'Marketing', ownerRole: 'HR', evidence: 'Banner link' },
      { id: 'salary', name: 'Salary account setup',
        desc: 'Bank details collected, verified, and payroll configured.',
        owner: 'Finance', ownerRole: 'HR', evidence: 'Payroll active' },
      { id: '90-day', name: '30 / 60 / 90 day plan from LM',
        desc: 'Reporting manager submits structured ramp-up plan with milestones.',
        owner: 'Reporting Manager', ownerRole: 'LM', evidence: 'Plan document', editable: true }
    ]
  }
];

const ALL_TASKS = PHASES.flatMap(p => p.tasks.map(t => ({ ...t, phaseId: p.id, phaseName: p.name, phaseSub: p.sub, timing: p.timing, daysOffset: p.daysOffset })));

/* ============================================================
   MOCK CSV
   ============================================================ */
const MOCK_CSV = `Name,Designation,Department,Team,Date of Joining,Confirmation Date,Reporting Manager,Project/Department,Location
Hina Aslam,HR Business Partner,Human Resources,HRBP,2026-04-15,2026-10-15,Imran Qureshi,People Ops,Karachi
Ahmed Khan,Software Engineer,Engineering,Backend,2026-04-20,2026-10-20,Sarah Ali,Platform,Karachi
Fatima Hussain,UX Designer,Design,Product Design,2026-04-25,2026-10-25,Bilal Raza,Mobile App,Karachi
Usman Tariq,Data Analyst,Analytics,Insights,2026-05-01,2026-11-01,Nida Sheikh,Reporting,Lahore
Sara Malik,Product Manager,Product,Growth,2026-05-04,2026-11-04,Imran Qureshi,Acquisition,Karachi
Hassan Riaz,DevOps Engineer,Engineering,Infrastructure,2026-05-11,2026-11-11,Sarah Ali,Platform,Islamabad
Ayesha Noor,Marketing Specialist,Marketing,Brand,2026-05-15,2026-11-15,Zainab Iqbal,Brand Campaigns,Karachi
Bilal Ahmed,QA Engineer,Engineering,Quality,2026-05-18,2026-11-18,Sarah Ali,Platform,Lahore`;

/* ============================================================
   HELPERS
   ============================================================ */
const today = () => new Date();

const parseDate = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

const fmtDate = (d) => d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—';
const fmtFullDate = (d) => d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const daysBetween = (a, b) => Math.floor((a.getTime() - b.getTime()) / 86400000);

const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967295;
};

const relativeDOJ = (doj) => {
  if (!doj) return '—';
  const d = daysBetween(doj, today());
  if (d > 0) return `in ${d} day${d === 1 ? '' : 's'}`;
  if (d === 0) return 'today';
  return `${-d} day${-d === 1 ? '' : 's'} ago`;
};

const relativeDue = (targetDate) => {
  const d = daysBetween(targetDate, today());
  if (d > 1) return `Due in ${d} days`;
  if (d === 1) return 'Due tomorrow';
  if (d === 0) return 'Due today';
  if (d === -1) return '1 day overdue';
  return `${-d} days overdue`;
};

/* ============================================================
   TASK GENERATION + STATUS
   ============================================================ */
const generateTasks = (employee) => {
  const doj = parseDate(employee['Date of Joining']);
  if (!doj) return [];
  return ALL_TASKS.map(t => {
    const targetDate = new Date(doj);
    targetDate.setDate(targetDate.getDate() + t.daysOffset);
    return {
      ...t,
      id: `${employee.id}__${t.id}`,
      taskKey: t.id,
      employeeId: employee.id,
      targetDate
    };
  });
};

const computeAutoStatus = (task, manualOverrides) => {
  const override = manualOverrides[task.id];
  if (override) return override;
  const t = today();
  const d = daysBetween(task.targetDate, t);
  const seed = hash(task.id);
  // Auto tasks (Teams notifs) complete as soon as their window opens
  if (task.auto) {
    if (d <= 0) return 'Completed';
    return 'Pending';
  }
  if (d > 5) return 'Pending';
  if (d > 0) return seed > 0.7 ? 'In Progress' : 'Pending';
  if (d === 0) return seed > 0.5 ? 'In Progress' : 'Pending';
  if (d >= -2) return seed > 0.3 ? 'Completed' : (seed > 0.1 ? 'In Progress' : 'Delayed');
  if (d >= -5) return seed > 0.2 ? 'Completed' : 'Delayed';
  return seed > 0.12 ? 'Completed' : 'Delayed';
};

const computeProgress = (tasks, statuses) => {
  if (!tasks.length) return { pct: 0, completed: 0, pending: 0, delayed: 0, inProgress: 0, total: 0 };
  let completed = 0, pending = 0, delayed = 0, inProgress = 0;
  tasks.forEach((t) => {
    const s = statuses[t.id];
    if (s === 'Completed') completed++;
    else if (s === 'Delayed') delayed++;
    else if (s === 'In Progress') inProgress++;
    else pending++;
  });
  return { pct: Math.round((completed / tasks.length) * 100), completed, pending, delayed, inProgress, total: tasks.length };
};

const employeeStatus = (progress) => {
  if (progress.pct === 100) return 'Completed';
  if (progress.delayed > 0) return 'Delayed';
  return 'On Track';
};

// "What's the single most important thing for this employee right now?"
const nextBestAction = (employee, tasks, statuses) => {
  const doj = parseDate(employee['Date of Joining']);
  if (!doj) return { label: 'Awaiting DOJ', urgency: 'low' };

  // 1. Anything delayed wins
  const delayed = tasks.find(t => statuses[t.id] === 'Delayed');
  if (delayed) return { label: `Resolve: ${delayed.name}`, urgency: 'high', owner: delayed.owner };

  const daysToDOJ = daysBetween(doj, today());

  // 2. Within 7 days of DOJ — check LM inputs
  if (daysToDOJ <= 7 && daysToDOJ >= -1) {
    const buddyTask = tasks.find(t => t.taskKey === 'buddy');
    if (buddyTask && statuses[buddyTask.id] !== 'Completed')
      return { label: `Awaiting buddy from ${employee['Reporting Manager']}`, urgency: 'high', owner: employee['Reporting Manager'] };
    const sysTask = tasks.find(t => t.taskKey === 'sys-reqs');
    if (sysTask && statuses[sysTask.id] !== 'Completed')
      return { label: 'Share system requirements with IT', urgency: 'high', owner: employee['Reporting Manager'] };
    const seatTask = tasks.find(t => t.taskKey === 'seating');
    if (seatTask && statuses[seatTask.id] !== 'Completed')
      return { label: 'Confirm seating arrangement', urgency: 'medium', owner: 'Admin Team' };
  }

  // 3. DOJ today/yesterday with Day 1 tasks pending
  if (daysToDOJ <= 0 && daysToDOJ >= -1) {
    const day1Pending = tasks.find(t => t.phaseId === 'day1' && statuses[t.id] === 'Pending');
    if (day1Pending) return { label: `Begin: ${day1Pending.name}`, urgency: 'high', owner: day1Pending.owner };
  }

  // 4. Past first week, 30/60/90 plan missing
  if (daysToDOJ <= -3) {
    const planTask = tasks.find(t => t.taskKey === '90-day');
    if (planTask && statuses[planTask.id] !== 'Completed')
      return { label: `30/60/90 plan due from ${employee['Reporting Manager']}`, urgency: 'medium', owner: employee['Reporting Manager'] };
    const docsTask = tasks.find(t => t.taskKey === 'docs-w1');
    if (docsTask && statuses[docsTask.id] !== 'Completed')
      return { label: 'Complete document compliance', urgency: 'medium', owner: 'HR Team' };
  }

  // 5. Find the next pending task in order
  const nextPending = tasks
    .filter(t => statuses[t.id] !== 'Completed')
    .sort((a, b) => a.targetDate - b.targetDate)[0];
  if (nextPending) {
    const d = daysBetween(nextPending.targetDate, today());
    const timing = d > 0 ? `in ${d}d` : d === 0 ? 'today' : `${-d}d overdue`;
    return { label: `${nextPending.name} (${timing})`, urgency: 'low', owner: nextPending.owner };
  }

  return { label: 'Onboarding complete', urgency: 'done' };
};

// Bucket employees by lifecycle phase based on DOJ
const employeeBucket = (employee, progress) => {
  if (progress.pct === 100) return 'completed';
  const doj = parseDate(employee['Date of Joining']);
  if (!doj) return 'pre';
  const d = daysBetween(doj, today());
  if (d > 0) return 'pre';
  if (d === 0 || d === -1) return 'day1';
  if (d >= -7) return 'week1';
  return 'post';
};

/* ============================================================
   THEME
   ============================================================ */
const C = {
  navy: '#1F3864', ice: '#C8D8F0', iceLight: '#EEF3FB',
  green: '#1A7A4A', greenSoft: '#E8F4ED',
  amber: '#B8730D', amberSoft: '#FDF4E1',
  red: '#B8362B', redSoft: '#FAEAE7',
  gray: '#64748B', graySoft: '#F4F5F7',
  bg: '#F7F8FA', border: '#EAECEF'
};

/* ============================================================
   UI ATOMS
   ============================================================ */
const Avatar = ({ name, size = 32, ring = false }) => {
  const initials = (name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const seed = hash(name || '');
  const palette = [C.navy, '#2C5282', '#34577A', '#264653', '#1E3A5F', '#3B5998'];
  const bg = palette[Math.floor(seed * palette.length)];
  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold text-white flex-shrink-0 ${ring ? 'ring-2 ring-white' : ''}`}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
};

const StatusDot = ({ status, size = 8 }) => {
  const color = status === 'Completed' ? C.green
    : status === 'Delayed' ? C.red
    : status === 'In Progress' ? C.amber
    : C.gray;
  return <span className="rounded-full flex-shrink-0" style={{ width: size, height: size, background: color }} />;
};

const StatusPill = ({ status }) => {
  const styles = {
    'Completed':   { bg: C.greenSoft, fg: C.green },
    'On Track':    { bg: C.iceLight,  fg: C.navy },
    'In Progress': { bg: C.amberSoft, fg: C.amber },
    'Pending':     { bg: C.graySoft,  fg: C.gray },
    'Delayed':     { bg: C.redSoft,   fg: C.red }
  };
  const s = styles[status] || styles['Pending'];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium"
      style={{ background: s.bg, color: s.fg }}>
      <StatusDot status={status} size={6} />
      {status}
    </span>
  );
};

const ProgressBar = ({ pct, height = 4 }) => {
  const color = pct === 100 ? C.green : pct >= 60 ? C.navy : pct >= 30 ? C.amber : C.gray;
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: '#EDF0F4' }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
};

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {
  // CSV / data
  const [employees, setEmployees] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [csvUrl, setCsvUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Status overrides + evidence
  const [manualStatuses, setManualStatuses] = useState({});
  const [taskEvidence, setTaskEvidence] = useState({}); // { taskId: 'free text' }

  // Navigation
  const [section, setSection] = useState('overview'); // overview, active, pre, day1, week1, post, atrisk, completed
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('all');

  // Filters / view
  const [searchQ, setSearchQ] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // cards | rows
  const [role, setRole] = useState('HR'); // HR | LM | IT
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Task accordion expansion
  const [expandedTasks, setExpandedTasks] = useState({});

  /* -------- Data fetch -------- */
  const loadData = (url) => {
    setLoading(true); setError(null);
    const parser = (text) => {
      try {
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        const rows = result.data
          .filter(r => r.Name && r['Date of Joining'])
          .map((r, i) => ({ ...r, id: `EMP${String(i + 1).padStart(3, '0')}` }));
        setEmployees(rows);
        setLastRefreshed(new Date());
      } catch (e) {
        setError('Failed to parse CSV. Showing sample data.');
        const result = Papa.parse(MOCK_CSV, { header: true, skipEmptyLines: true });
        setEmployees(result.data.map((r, i) => ({ ...r, id: `EMP${String(i + 1).padStart(3, '0')}` })));
        setLastRefreshed(new Date());
      } finally { setLoading(false); }
    };
    if (url && url.trim()) {
      fetch(url).then(r => { if (!r.ok) throw new Error('fetch failed'); return r.text(); })
        .then(parser).catch(() => { setError('Could not reach the sheet — showing sample data.'); parser(MOCK_CSV); });
    } else {
      setTimeout(() => parser(MOCK_CSV), 200);
    }
  };

  useEffect(() => {
    loadData('');
    const iv = setInterval(() => loadData(csvUrl), 120000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------- Derived data -------- */
  const employeeWorkflows = useMemo(() => {
    const map = {};
    employees.forEach(e => { map[e.id] = generateTasks(e); });
    return map;
  }, [employees]);

  const allStatuses = useMemo(() => {
    const out = {};
    Object.values(employeeWorkflows).flat().forEach(t => { out[t.id] = computeAutoStatus(t, manualStatuses); });
    return out;
  }, [employeeWorkflows, manualStatuses]);

  const employeeProgress = useMemo(() => {
    const out = {};
    employees.forEach(e => { out[e.id] = computeProgress(employeeWorkflows[e.id] || [], allStatuses); });
    return out;
  }, [employees, employeeWorkflows, allStatuses]);

  const employeeBuckets = useMemo(() => {
    const out = {};
    employees.forEach(e => { out[e.id] = employeeBucket(e, employeeProgress[e.id] || {}); });
    return out;
  }, [employees, employeeProgress]);

  // Role-based employee filter (LM sees only their reports)
  const roleFilteredEmployees = useMemo(() => {
    if (role === 'LM') {
      // Demo: assume current LM is the most common manager
      const managerCounts = {};
      employees.forEach(e => {
        const m = e['Reporting Manager'];
        managerCounts[m] = (managerCounts[m] || 0) + 1;
      });
      const topMgr = Object.entries(managerCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      return employees.filter(e => e['Reporting Manager'] === topMgr);
    }
    return employees;
  }, [employees, role]);

  // Section filter
  const sectionEmployees = useMemo(() => {
    let list = roleFilteredEmployees;
    if (section === 'overview' || section === 'active') {
      list = list.filter(e => employeeProgress[e.id]?.pct < 100);
    } else if (section === 'pre') {
      list = list.filter(e => employeeBuckets[e.id] === 'pre');
    } else if (section === 'day1') {
      list = list.filter(e => employeeBuckets[e.id] === 'day1');
    } else if (section === 'week1') {
      list = list.filter(e => employeeBuckets[e.id] === 'week1');
    } else if (section === 'post') {
      list = list.filter(e => employeeBuckets[e.id] === 'post');
    } else if (section === 'atrisk') {
      list = list.filter(e => employeeProgress[e.id]?.delayed > 0);
    } else if (section === 'completed') {
      list = list.filter(e => employeeProgress[e.id]?.pct === 100);
    }
    if (searchQ) {
      const q = searchQ.toLowerCase();
      list = list.filter(e =>
        e.Name.toLowerCase().includes(q) ||
        (e.Department || '').toLowerCase().includes(q) ||
        (e.Designation || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [roleFilteredEmployees, section, searchQ, employeeBuckets, employeeProgress]);

  // Overall stats (across role-filtered set)
  const stats = useMemo(() => {
    let total = roleFilteredEmployees.length;
    let active = 0, completed = 0, delayed = 0, pending = 0, onTrack = 0;
    let pendingMgrInputs = 0;
    roleFilteredEmployees.forEach(e => {
      const p = employeeProgress[e.id] || {};
      if (p.pct === 100) completed++;
      else {
        active++;
        if (p.delayed > 0) delayed++;
        else onTrack++;
      }
      pending += p.pending + p.inProgress;

      // Pending manager inputs: buddy / sys-reqs / 90-day for active employees
      const tasks = employeeWorkflows[e.id] || [];
      const mgrTasks = tasks.filter(t => ['buddy', 'sys-reqs', '90-day'].includes(t.taskKey));
      if (mgrTasks.some(t => allStatuses[t.id] !== 'Completed') && p.pct < 100) pendingMgrInputs++;
    });
    return { total, active, completed, delayed, pending, onTrack, pendingMgrInputs,
      onTrackPct: active ? Math.round((onTrack / active) * 100) : 100 };
  }, [roleFilteredEmployees, employeeProgress, employeeWorkflows, allStatuses]);

  // Section counts for sidebar badges
  const sectionCounts = useMemo(() => {
    const out = { active: 0, pre: 0, day1: 0, week1: 0, post: 0, atrisk: 0, completed: 0 };
    roleFilteredEmployees.forEach(e => {
      const p = employeeProgress[e.id] || {};
      const b = employeeBuckets[e.id];
      if (p.pct < 100) out.active++;
      if (b === 'pre' && p.pct < 100) out.pre++;
      if (b === 'day1' && p.pct < 100) out.day1++;
      if (b === 'week1' && p.pct < 100) out.week1++;
      if (b === 'post' && p.pct < 100) out.post++;
      if (p.delayed > 0) out.atrisk++;
      if (p.pct === 100) out.completed++;
    });
    return out;
  }, [roleFilteredEmployees, employeeProgress, employeeBuckets]);

  /* -------- Handlers -------- */
  const openEmployee = (empId) => {
    setSelectedEmpId(empId);
    setDrawerTab('all');
    setExpandedTasks({});
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);

  const setTaskStatus = (taskId, status) => {
    setManualStatuses(prev => ({ ...prev, [taskId]: status }));
  };

  const setEvidence = (taskId, value) => {
    setTaskEvidence(prev => ({ ...prev, [taskId]: value }));
  };

  const toggleTask = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const selectedEmp = employees.find(e => e.id === selectedEmpId);
  const selectedTasks = selectedEmp ? employeeWorkflows[selectedEmp.id] || [] : [];

  /* ============================================================ */
  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
      {/* TOP BAR */}
      <TopBar
        stats={stats}
        lastRefreshed={lastRefreshed}
        searchQ={searchQ} setSearchQ={setSearchQ}
        loading={loading}
        onRefresh={() => loadData(csvUrl)}
        onOpenSettings={() => setShowSettings(true)}
        role={role} setRole={setRole}
        onMobileMenuClick={() => setMobileSidebar(s => !s)}
      />

      <div className="flex max-w-[1440px] mx-auto">
        {/* SIDEBAR */}
        <Sidebar
          section={section} setSection={setSection}
          counts={sectionCounts}
          mobileOpen={mobileSidebar}
          onMobileClose={() => setMobileSidebar(false)}
        />

        {/* MAIN */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          {loading && employees.length === 0 && (
            <div className="rounded-2xl p-12 text-center bg-white" style={{ border: `1px solid ${C.border}` }}>
              <Loader2 className="w-7 h-7 animate-spin mx-auto mb-3" style={{ color: C.navy }} />
              <p className="text-sm text-slate-500">Loading onboarding data…</p>
            </div>
          )}

          {error && !loading && (
            <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
              style={{ background: C.amberSoft, color: C.amber }}>
              <AlertTriangle size={15} /> <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
            </div>
          )}

          {!loading && employees.length > 0 && (
            <>
              {section === 'overview' ? (
                <OverviewPage
                  stats={stats}
                  employees={roleFilteredEmployees}
                  employeeProgress={employeeProgress}
                  employeeWorkflows={employeeWorkflows}
                  allStatuses={allStatuses}
                  openEmployee={openEmployee}
                  setSection={setSection}
                />
              ) : (
                <ListPage
                  section={section}
                  employees={sectionEmployees}
                  totalInRole={roleFilteredEmployees.length}
                  employeeProgress={employeeProgress}
                  employeeWorkflows={employeeWorkflows}
                  allStatuses={allStatuses}
                  viewMode={viewMode} setViewMode={setViewMode}
                  openEmployee={openEmployee}
                  role={role}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* SLIDE-OVER PANEL */}
      <SlideOver
        open={drawerOpen}
        onClose={closeDrawer}
        employee={selectedEmp}
        tasks={selectedTasks}
        statuses={allStatuses}
        progress={selectedEmp ? employeeProgress[selectedEmp.id] : null}
        drawerTab={drawerTab} setDrawerTab={setDrawerTab}
        expandedTasks={expandedTasks} toggleTask={toggleTask}
        setTaskStatus={setTaskStatus}
        taskEvidence={taskEvidence} setEvidence={setEvidence}
        role={role}
      />

      {/* SETTINGS MODAL */}
      {showSettings && (
        <SettingsModal
          csvUrl={csvUrl} setCsvUrl={setCsvUrl}
          onApply={() => { loadData(csvUrl); setShowSettings(false); }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

/* ============================================================
   TOP BAR
   ============================================================ */
function TopBar({ stats, lastRefreshed, searchQ, setSearchQ, loading, onRefresh, onOpenSettings, role, setRole, onMobileMenuClick }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.85)', borderBottom: `1px solid ${C.border}` }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
        {/* Logo */}
        <button onClick={onMobileMenuClick} className="lg:hidden p-1.5 rounded-md hover:bg-slate-100" aria-label="Menu">
          <List size={18} style={{ color: C.navy }} />
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.navy }}>
            <Briefcase size={14} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold tracking-tight" style={{ color: C.navy }}>Onboarding</div>
          </div>
        </div>

        {/* Quick stats - hidden on small */}
        <div className="hidden md:flex items-center gap-5 ml-2 pl-4" style={{ borderLeft: `1px solid ${C.border}` }}>
          <QuickStat label="Joiners" value={stats.total} />
          <QuickStat label="Pending" value={stats.pending} />
          <QuickStat label="At Risk" value={stats.delayed} accent={stats.delayed > 0 ? C.red : null} />
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md ml-auto md:ml-0 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search employees…"
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-sm bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 transition"
            style={{ border: `1px solid ${C.border}` }}
          />
        </div>

        {/* Role switcher */}
        <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5">
          {['HR', 'LM', 'IT'].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className="px-2.5 py-1 rounded-md text-xs font-semibold transition"
              style={{
                background: role === r ? 'white' : 'transparent',
                color: role === r ? C.navy : C.gray,
                boxShadow: role === r ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}>
              {r}
            </button>
          ))}
        </div>

        {/* Last refresh + actions */}
        <div className="flex items-center gap-1">
          {lastRefreshed && (
            <span className="hidden lg:block text-[11px] text-slate-500 mr-2">
              Updated {fmtTime(lastRefreshed)}
            </span>
          )}
          <button onClick={onRefresh} className="p-2 rounded-md hover:bg-slate-100 transition" title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} style={{ color: C.gray }} />
          </button>
          <button onClick={onOpenSettings} className="p-2 rounded-md hover:bg-slate-100 transition" title="Data source">
            <Settings size={14} style={{ color: C.gray }} />
          </button>
        </div>
      </div>
    </header>
  );
}

function QuickStat({ label, value, accent }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-base font-semibold" style={{ color: accent || C.navy }}>{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

/* ============================================================
   SIDEBAR
   ============================================================ */
function Sidebar({ section, setSection, counts, mobileOpen, onMobileClose }) {
  const items = [
    { id: 'overview',  label: 'Overview',     icon: Home,          count: null },
    { id: 'active',    label: 'Active',       icon: Users,         count: counts.active },
    { divider: 'Lifecycle' },
    { id: 'pre',       label: 'Pre-Joining',  icon: CalendarDays,  count: counts.pre },
    { id: 'day1',      label: 'Day 1',        icon: Sparkles,      count: counts.day1 },
    { id: 'week1',     label: 'First Week',   icon: CalendarCheck, count: counts.week1 },
    { id: 'post',      label: 'Post-Joining', icon: Calendar,      count: counts.post },
    { divider: 'Status' },
    { id: 'atrisk',    label: 'At Risk',      icon: AlertTriangle, count: counts.atrisk, accent: C.red },
    { id: 'completed', label: 'Completed',    icon: CheckCircle2,  count: counts.completed, accent: C.green }
  ];

  const sidebarBody = (
    <nav className="flex flex-col gap-0.5 p-3">
      {items.map((item, i) => {
        if (item.divider) {
          return (
            <div key={`d${i}`} className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              {item.divider}
            </div>
          );
        }
        const Icon = item.icon;
        const active = section === item.id;
        return (
          <button key={item.id}
            onClick={() => { setSection(item.id); onMobileClose && onMobileClose(); }}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition group"
            style={{
              background: active ? C.iceLight : 'transparent',
              color: active ? C.navy : C.gray
            }}>
            <Icon size={15} style={{ color: active ? C.navy : (item.accent || C.gray), opacity: active ? 1 : 0.7 }} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.count !== null && item.count !== undefined && item.count > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: active ? 'white' : C.graySoft,
                  color: item.accent || (active ? C.navy : C.gray)
                }}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-14 self-start h-[calc(100vh-56px)] overflow-y-auto"
        style={{ borderRight: `1px solid ${C.border}` }}>
        {sidebarBody}
      </aside>

      {/* Mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex" onClick={onMobileClose}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-64 bg-white h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: C.border }}>
              <span className="text-sm font-semibold" style={{ color: C.navy }}>Navigation</span>
              <button onClick={onMobileClose} className="p-1 rounded hover:bg-slate-100">
                <X size={16} style={{ color: C.gray }} />
              </button>
            </div>
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   OVERVIEW PAGE
   ============================================================ */
function OverviewPage({ stats, employees, employeeProgress, employeeWorkflows, allStatuses, openEmployee, setSection }) {
  // Recent at-risk / needs attention
  const atRiskEmployees = useMemo(() => {
    return employees
      .map(e => ({ e, p: employeeProgress[e.id] }))
      .filter(({ p }) => p && p.delayed > 0)
      .sort((a, b) => b.p.delayed - a.p.delayed)
      .slice(0, 4);
  }, [employees, employeeProgress]);

  const upcomingJoiners = useMemo(() => {
    return employees
      .filter(e => {
        const doj = parseDate(e['Date of Joining']);
        const d = doj ? daysBetween(doj, today()) : null;
        return d !== null && d >= 0 && d <= 14;
      })
      .sort((a, b) => parseDate(a['Date of Joining']) - parseDate(b['Date of Joining']))
      .slice(0, 4);
  }, [employees]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: C.navy }}>Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">Today's onboarding pulse at CodeNinja</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiTile icon={Users} label="Active Onboardings" value={stats.active}
          sub={`${stats.completed} completed this cycle`} accent={C.navy} />
        <KpiTile icon={CheckCircle2} label="On Track" value={`${stats.onTrackPct}%`}
          sub={`${stats.onTrack} of ${stats.active} active`} accent={C.green} />
        <KpiTile icon={AlertTriangle} label="Delayed Cases" value={stats.delayed}
          sub={stats.delayed === 0 ? 'All clear' : 'Need attention'} accent={stats.delayed > 0 ? C.red : C.gray} />
        <KpiTile icon={UserPlus} label="Pending Manager Inputs" value={stats.pendingMgrInputs}
          sub="Buddy / Sys reqs / 90-day" accent={C.amber} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* At Risk panel */}
        <Panel title="Needs Attention" icon={AlertTriangle}
          iconColor={atRiskEmployees.length > 0 ? C.red : C.green}
          action={atRiskEmployees.length > 0 ? { label: 'View all', onClick: () => setSection('atrisk') } : null}>
          {atRiskEmployees.length === 0 ? (
            <EmptyState icon={CheckCircle2} message="All clear — no delayed cases" tone="success" />
          ) : (
            <div className="divide-y" style={{ borderColor: C.border }}>
              {atRiskEmployees.map(({ e, p }) => {
                const tasks = employeeWorkflows[e.id] || [];
                const action = nextBestAction(e, tasks, allStatuses);
                return (
                  <button key={e.id} onClick={() => openEmployee(e.id)}
                    className="w-full flex items-center gap-3 py-2.5 -mx-1 px-1 rounded-md hover:bg-slate-50 transition text-left">
                    <Avatar name={e.Name} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: C.navy }}>{e.Name}</div>
                      <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <AlertTriangle size={10} style={{ color: C.red }} />
                        <span style={{ color: C.red }}>{action.label}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 hidden sm:block">{p.delayed} delayed</div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Upcoming joiners */}
        <Panel title="Upcoming Joiners" icon={CalendarDays} iconColor={C.navy}
          action={upcomingJoiners.length > 0 ? { label: 'View all', onClick: () => setSection('pre') } : null}>
          {upcomingJoiners.length === 0 ? (
            <EmptyState icon={CalendarDays} message="No joiners in the next 14 days" />
          ) : (
            <div className="divide-y" style={{ borderColor: C.border }}>
              {upcomingJoiners.map((e) => {
                const doj = parseDate(e['Date of Joining']);
                const tasks = employeeWorkflows[e.id] || [];
                const action = nextBestAction(e, tasks, allStatuses);
                return (
                  <button key={e.id} onClick={() => openEmployee(e.id)}
                    className="w-full flex items-center gap-3 py-2.5 -mx-1 px-1 rounded-md hover:bg-slate-50 transition text-left">
                    <Avatar name={e.Name} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate" style={{ color: C.navy }}>{e.Name}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 truncate">{e.Designation}</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">{action.label}</div>
                    </div>
                    <div className="text-right text-xs flex-shrink-0">
                      <div className="font-medium" style={{ color: C.navy }}>{fmtDate(doj)}</div>
                      <div className="text-slate-400">{relativeDOJ(doj)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function KpiTile({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl p-4" style={{ border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <Icon size={14} style={{ color: accent }} />
      </div>
      <div className="text-2xl font-semibold tracking-tight" style={{ color: C.navy }}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

function Panel({ title, icon: Icon, iconColor, action, children }) {
  return (
    <div className="bg-white rounded-2xl p-4" style={{ border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} style={{ color: iconColor || C.navy }} />}
          <h2 className="text-sm font-semibold tracking-tight" style={{ color: C.navy }}>{title}</h2>
        </div>
        {action && (
          <button onClick={action.onClick}
            className="text-xs font-medium flex items-center gap-0.5 hover:underline"
            style={{ color: C.navy }}>
            {action.label} <ChevronRight size={12} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, message, tone = 'neutral' }) {
  const color = tone === 'success' ? C.green : C.gray;
  return (
    <div className="py-8 text-center">
      <Icon size={24} className="mx-auto mb-2" style={{ color, opacity: 0.6 }} />
      <p className="text-xs text-slate-500">{message}</p>
    </div>
  );
}

/* ============================================================
   LIST PAGE (used for all filtered sections)
   ============================================================ */
function ListPage({ section, employees, totalInRole, employeeProgress, employeeWorkflows, allStatuses, viewMode, setViewMode, openEmployee, role }) {
  const titles = {
    active:    { title: 'Active Onboardings', sub: 'Employees currently being onboarded' },
    pre:       { title: 'Pre-Joining',        sub: 'Joiners with DOJ in the future' },
    day1:      { title: 'Day 1',              sub: 'Joiners on or just past their first day' },
    week1:     { title: 'First Week',         sub: 'Within first 7 days of joining' },
    post:      { title: 'Post-Joining',       sub: 'Past first week, onboarding ongoing' },
    atrisk:    { title: 'At Risk',            sub: 'Employees with delayed tasks' },
    completed: { title: 'Completed',          sub: 'Fully onboarded' }
  };
  const t = titles[section] || { title: section, sub: '' };

  return (
    <div>
      <div className="flex items-end justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: C.navy }}>{t.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t.sub}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
            {role === 'LM' && <span> · viewing as LM</span>}
          </span>
          <div className="flex items-center bg-white rounded-lg p-0.5" style={{ border: `1px solid ${C.border}` }}>
            <button onClick={() => setViewMode('cards')}
              className="p-1.5 rounded-md transition"
              style={{ background: viewMode === 'cards' ? C.iceLight : 'transparent', color: viewMode === 'cards' ? C.navy : C.gray }}>
              <LayoutGrid size={13} />
            </button>
            <button onClick={() => setViewMode('rows')}
              className="p-1.5 rounded-md transition"
              style={{ background: viewMode === 'rows' ? C.iceLight : 'transparent', color: viewMode === 'rows' ? C.navy : C.gray }}>
              <List size={13} />
            </button>
          </div>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center" style={{ border: `1px solid ${C.border}` }}>
          <Inbox size={28} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium" style={{ color: C.navy }}>
            {section === 'atrisk' ? 'No delayed tasks — all on track ✅' :
             section === 'completed' ? 'No completed onboardings yet' :
             'No employees in this section'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {section === 'atrisk' ? 'Great work staying ahead of deadlines.' : 'Check back as onboardings progress.'}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {employees.map(e => (
            <EmployeeCard key={e.id} employee={e}
              progress={employeeProgress[e.id]}
              tasks={employeeWorkflows[e.id] || []}
              statuses={allStatuses}
              onClick={() => openEmployee(e.id)} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          {employees.map((e, i) => (
            <EmployeeRow key={e.id} employee={e}
              progress={employeeProgress[e.id]}
              tasks={employeeWorkflows[e.id] || []}
              statuses={allStatuses}
              divider={i > 0}
              onClick={() => openEmployee(e.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   EMPLOYEE CARD (grid view)
   ============================================================ */
function EmployeeCard({ employee, progress, tasks, statuses, onClick }) {
  const doj = parseDate(employee['Date of Joining']);
  const status = employeeStatus(progress);
  const action = nextBestAction(employee, tasks, statuses);
  const urgencyColor = action.urgency === 'high' ? C.red :
                       action.urgency === 'medium' ? C.amber :
                       action.urgency === 'done' ? C.green : C.gray;

  return (
    <button onClick={onClick}
      className="bg-white rounded-2xl p-4 text-left transition hover:shadow-sm group"
      style={{ border: `1px solid ${C.border}` }}>
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={employee.Name} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 justify-between">
            <h3 className="font-semibold text-sm truncate" style={{ color: C.navy }}>{employee.Name}</h3>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition flex-shrink-0" />
          </div>
          <div className="text-xs text-slate-500 truncate">{employee.Designation}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-3 flex-wrap">
        <span className="flex items-center gap-1"><Calendar size={10} />DOJ {fmtDate(doj)}</span>
        <span className="text-slate-300">·</span>
        <span>{relativeDOJ(doj)}</span>
        <span className="text-slate-300">·</span>
        <span className="flex items-center gap-1"><MapPin size={10} />{employee.Location}</span>
      </div>

      {/* Next best action */}
      <div className="rounded-lg px-2.5 py-2 mb-3 flex items-start gap-2"
        style={{ background: `${urgencyColor}10` }}>
        <Sparkles size={11} className="mt-0.5 flex-shrink-0" style={{ color: urgencyColor }} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: urgencyColor }}>Next action</div>
          <div className="text-xs leading-snug" style={{ color: C.navy }}>{action.label}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-1.5">
        <StatusPill status={status} />
        <span className="text-xs font-semibold" style={{ color: C.navy }}>{progress.pct}%</span>
      </div>
      <ProgressBar pct={progress.pct} />
    </button>
  );
}

/* ============================================================
   EMPLOYEE ROW (list view)
   ============================================================ */
function EmployeeRow({ employee, progress, tasks, statuses, divider, onClick }) {
  const doj = parseDate(employee['Date of Joining']);
  const status = employeeStatus(progress);
  const action = nextBestAction(employee, tasks, statuses);
  const urgencyColor = action.urgency === 'high' ? C.red :
                       action.urgency === 'medium' ? C.amber :
                       action.urgency === 'done' ? C.green : C.gray;

  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition text-left group"
      style={divider ? { borderTop: `1px solid ${C.border}` } : {}}>
      <Avatar name={employee.Name} size={32} />
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-3 min-w-0">
          <div className="font-medium text-sm truncate" style={{ color: C.navy }}>{employee.Name}</div>
          <div className="text-xs text-slate-500 truncate">{employee.Designation}</div>
        </div>
        <div className="md:col-span-2 text-xs hidden md:block">
          <div style={{ color: C.navy }}>{fmtDate(doj)}</div>
          <div className="text-slate-400">{relativeDOJ(doj)}</div>
        </div>
        <div className="md:col-span-4 min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: urgencyColor }}>Next</div>
          <div className="text-xs truncate" style={{ color: C.navy }}>{action.label}</div>
        </div>
        <div className="md:col-span-2 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <ProgressBar pct={progress.pct} />
            <span className="text-xs font-semibold" style={{ color: C.navy }}>{progress.pct}%</span>
          </div>
        </div>
        <div className="md:col-span-1 flex justify-end">
          <StatusPill status={status} />
        </div>
      </div>
      <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition flex-shrink-0" />
    </button>
  );
}

/* ============================================================
   SLIDE-OVER PANEL (Employee Detail)
   ============================================================ */
function SlideOver({ open, onClose, employee, tasks, statuses, progress, drawerTab, setDrawerTab, expandedTasks, toggleTask, setTaskStatus, taskEvidence, setEvidence, role }) {
  // Filter tasks by tab
  const visibleTasks = useMemo(() => {
    if (!tasks) return [];
    if (drawerTab === 'all') return tasks;
    if (drawerTab === 'pre') return tasks.filter(t => t.phaseId === 'pre-stakeholder' || t.phaseId === 'pre-prep');
    if (drawerTab === 'day1') return tasks.filter(t => t.phaseId === 'day1');
    if (drawerTab === 'week1') return tasks.filter(t => t.phaseId === 'week1');
    return tasks;
  }, [tasks, drawerTab]);

  // Smart grouping for visible tasks
  const grouped = useMemo(() => {
    const attention = [];
    const inProgress = [];
    const completed = [];
    const pending = [];
    visibleTasks.forEach(t => {
      const s = statuses[t.id];
      if (s === 'Delayed') attention.push(t);
      else if (s === 'In Progress') inProgress.push(t);
      else if (s === 'Completed') completed.push(t);
      else pending.push(t);
    });
    return { attention, inProgress, pending, completed };
  }, [visibleTasks, statuses]);

  // What needs attention - top priority section
  const needsAttention = useMemo(() => {
    if (!employee || !tasks) return [];
    return tasks
      .filter(t => statuses[t.id] === 'Delayed' || (statuses[t.id] === 'Pending' && t.editable))
      .slice(0, 4);
  }, [employee, tasks, statuses]);

  if (!employee) return null;

  const doj = parseDate(employee['Date of Joining']);
  const status = employeeStatus(progress);
  const action = nextBestAction(employee, tasks, statuses);
  const urgencyColor = action.urgency === 'high' ? C.red :
                       action.urgency === 'medium' ? C.amber :
                       action.urgency === 'done' ? C.green : C.gray;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full md:max-w-xl lg:max-w-2xl bg-white shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <Avatar name={employee.Name} size={44} />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold tracking-tight truncate" style={{ color: C.navy }}>{employee.Name}</h2>
                <div className="text-sm text-slate-500 truncate">{employee.Designation} · {employee.Team}</div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Building2 size={10} />{employee.Department}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} />{employee.Location}</span>
                  <span className="flex items-center gap-1"><User size={10} />Reports to {employee['Reporting Manager']}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 -mr-1">
              <X size={16} style={{ color: C.gray }} />
            </button>
          </div>

          {/* Summary strip */}
          <div className="flex items-center gap-4 flex-wrap">
            <StatusPill status={status} />
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-slate-400" />
              <span className="text-xs text-slate-600">DOJ {fmtFullDate(doj)} <span className="text-slate-400">· {relativeDOJ(doj)}</span></span>
            </div>
            <div className="flex items-center gap-2 ml-auto min-w-[140px]">
              <ProgressBar pct={progress.pct} />
              <span className="text-sm font-semibold" style={{ color: C.navy }}>{progress.pct}%</span>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Needs Attention block */}
          {needsAttention.length > 0 && (
            <div className="px-5 pt-4">
              <div className="rounded-2xl p-4" style={{ background: `${urgencyColor}08`, border: `1px solid ${urgencyColor}30` }}>
                <div className="flex items-center gap-2 mb-2.5">
                  <AlertTriangle size={13} style={{ color: urgencyColor }} />
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: urgencyColor }}>What Needs Attention</h3>
                </div>
                <div className="flex flex-col gap-1.5">
                  {needsAttention.map(t => (
                    <div key={t.id} className="flex items-center gap-2 text-sm">
                      <StatusDot status={statuses[t.id]} />
                      <span className="font-medium" style={{ color: C.navy }}>{t.name}</span>
                      <span className="text-xs text-slate-500">· {t.owner}</span>
                      <span className="text-xs ml-auto" style={{ color: statuses[t.id] === 'Delayed' ? C.red : C.gray }}>
                        {relativeDue(t.targetDate)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="px-5 pt-4 sticky top-0 bg-white z-10" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-1 overflow-x-auto -mb-px">
              {[
                { id: 'all',   label: 'All',         count: tasks.length },
                { id: 'pre',   label: 'Pre-Joining', count: tasks.filter(t => t.phaseId.startsWith('pre')).length },
                { id: 'day1',  label: 'Day 1',       count: tasks.filter(t => t.phaseId === 'day1').length },
                { id: 'week1', label: 'First Week',  count: tasks.filter(t => t.phaseId === 'week1').length }
              ].map(tab => {
                const active = drawerTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setDrawerTab(tab.id)}
                    className="px-3 py-2 text-xs font-medium transition whitespace-nowrap"
                    style={{
                      color: active ? C.navy : C.gray,
                      borderBottom: active ? `2px solid ${C.navy}` : '2px solid transparent'
                    }}>
                    {tab.label}
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded font-semibold"
                      style={{ background: active ? C.iceLight : C.graySoft, color: active ? C.navy : C.gray }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task groups */}
          <div className="px-5 py-4 space-y-4">
            {grouped.attention.length > 0 && (
              <TaskGroup label="🚨 Needs Attention" tone={C.red} tasks={grouped.attention}
                statuses={statuses} expandedTasks={expandedTasks} toggleTask={toggleTask}
                setTaskStatus={setTaskStatus} taskEvidence={taskEvidence} setEvidence={setEvidence} role={role} />
            )}
            {grouped.inProgress.length > 0 && (
              <TaskGroup label="⏳ In Progress" tone={C.amber} tasks={grouped.inProgress}
                statuses={statuses} expandedTasks={expandedTasks} toggleTask={toggleTask}
                setTaskStatus={setTaskStatus} taskEvidence={taskEvidence} setEvidence={setEvidence} role={role} />
            )}
            {grouped.pending.length > 0 && (
              <TaskGroup label="○ Not Started" tone={C.gray} tasks={grouped.pending}
                statuses={statuses} expandedTasks={expandedTasks} toggleTask={toggleTask}
                setTaskStatus={setTaskStatus} taskEvidence={taskEvidence} setEvidence={setEvidence} role={role} />
            )}
            {grouped.completed.length > 0 && (
              <TaskGroup label="✅ Completed" tone={C.green} tasks={grouped.completed} collapsedByDefault
                statuses={statuses} expandedTasks={expandedTasks} toggleTask={toggleTask}
                setTaskStatus={setTaskStatus} taskEvidence={taskEvidence} setEvidence={setEvidence} role={role} />
            )}

            {visibleTasks.length === 0 && (
              <EmptyState icon={CheckCircle2} message="No tasks in this view" tone="neutral" />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-3 flex items-center justify-between" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="text-xs text-slate-500">
            {progress.completed} of {progress.total} tasks complete
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Press</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: C.graySoft, color: C.gray }}>Esc</kbd>
            <span className="text-xs text-slate-400">to close</span>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ============================================================
   TASK GROUP (collapsible group inside drawer)
   ============================================================ */
function TaskGroup({ label, tone, tasks, statuses, expandedTasks, toggleTask, setTaskStatus, taskEvidence, setEvidence, role, collapsedByDefault }) {
  const [groupCollapsed, setGroupCollapsed] = useState(!!collapsedByDefault);

  return (
    <div>
      <button
        onClick={() => setGroupCollapsed(c => !c)}
        className="flex items-center gap-2 mb-2 group">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: tone }}>{label}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: `${tone}15`, color: tone }}>
          {tasks.length}
        </span>
        <ChevronRight size={12} className={`text-slate-400 transition-transform ${groupCollapsed ? '' : 'rotate-90'}`} />
      </button>
      {!groupCollapsed && (
        <div className="space-y-1">
          {tasks.map(t => (
            <TaskRow key={t.id} task={t}
              status={statuses[t.id]}
              expanded={expandedTasks[t.id]}
              onToggle={() => toggleTask(t.id)}
              onSetStatus={(s) => setTaskStatus(t.id, s)}
              evidence={taskEvidence[t.id] || ''}
              setEvidence={(v) => setEvidence(t.id, v)}
              role={role} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TASK ROW (compact, with accordion expand)
   ============================================================ */
function TaskRow({ task, status, expanded, onToggle, onSetStatus, evidence, setEvidence, role }) {
  const canEdit = role === 'HR' || role === task.ownerRole;
  const ownerInitials = (task.owner || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const isOverdue = status === 'Delayed';

  return (
    <div className="rounded-lg transition" style={{ background: expanded ? C.graySoft : 'transparent' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-50 transition text-left group">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!canEdit) return;
            onSetStatus(status === 'Completed' ? 'Pending' : 'Completed');
          }}
          className="flex-shrink-0"
          title={canEdit ? (status === 'Completed' ? 'Mark pending' : 'Mark complete') : 'View only'}
        >
          {status === 'Completed' ? (
            <CheckCircle2 size={16} style={{ color: C.green }} />
          ) : status === 'Delayed' ? (
            <AlertTriangle size={16} style={{ color: C.red }} />
          ) : status === 'In Progress' ? (
            <Clock size={16} style={{ color: C.amber }} />
          ) : (
            <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: '#CBD5E1' }} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${status === 'Completed' ? 'line-through opacity-50' : ''}`} style={{ color: C.navy }}>
              {task.name}
            </span>
            {task.auto && (
              <span className="text-[9px] uppercase tracking-wider font-bold px-1 py-px rounded" style={{ background: C.iceLight, color: C.navy }}>
                Auto
              </span>
            )}
            {task.editable && canEdit && (
              <span className="text-[9px] uppercase tracking-wider font-bold px-1 py-px rounded opacity-0 group-hover:opacity-100 transition" style={{ background: C.amberSoft, color: C.amber }}>
                Your input
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 truncate">
            {task.phaseSub}
          </div>
        </div>

        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0"
          style={{ background: C.iceLight, color: C.navy }}
          title={task.owner}>
          {ownerInitials}
        </div>

        <span className={`text-xs whitespace-nowrap hidden sm:block ${isOverdue ? 'font-semibold' : ''}`}
          style={{ color: isOverdue ? C.red : C.gray }}>
          {relativeDue(task.targetDate)}
        </span>

        <ChevronDown size={14}
          className={`text-slate-300 transition-transform ${expanded ? 'rotate-180' : ''} flex-shrink-0`} />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-9 pb-3 pt-1 text-xs space-y-3">
          <div className="text-slate-600 leading-relaxed">{task.desc}</div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <Field label="Owner" value={task.owner} />
            <Field label="Target" value={fmtFullDate(task.targetDate)} />
            <Field label="Phase" value={`${task.phaseName} · ${task.phaseSub}`} />
            <Field label="Status" value={status} />
          </div>

          {task.evidence && (
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Evidence / Output</div>
              <input
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                disabled={!canEdit}
                placeholder={task.evidence}
                className="w-full px-2.5 py-1.5 rounded-md text-xs bg-white outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
                style={{ border: `1px solid ${C.border}` }}
              />
            </div>
          )}

          {canEdit && (
            <div className="flex items-center gap-1">
              {['Pending', 'In Progress', 'Completed', 'Delayed'].map(s => (
                <button key={s} onClick={() => onSetStatus(s)}
                  className="text-[10px] px-2 py-1 rounded font-medium transition"
                  style={{
                    background: status === s ? C.navy : 'white',
                    color: status === s ? 'white' : C.gray,
                    border: `1px solid ${status === s ? C.navy : C.border}`
                  }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {!canEdit && (
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck size={11} /> Owned by {task.ownerRole} — view only in {role} role
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{label}</div>
      <div className="text-xs text-slate-700">{value}</div>
    </div>
  );
}

/* ============================================================
   SETTINGS MODAL
   ============================================================ */
function SettingsModal({ csvUrl, setCsvUrl, onApply, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight" style={{ color: C.navy }}>Data Source</h3>
            <p className="text-xs text-slate-500 mt-0.5">Connect a Google Sheet published as CSV</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X size={16} style={{ color: C.gray }} /></button>
        </div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Sheet CSV URL</label>
        <input
          value={csvUrl} onChange={(e) => setCsvUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
          className="w-full px-3 py-2 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-slate-200"
          style={{ border: `1px solid ${C.border}` }}
        />
        <p className="text-[11px] text-slate-400 mt-1.5">
          Leave blank to use sample data. The sheet is fetched every 2 minutes automatically.
        </p>
        <div className="flex items-center gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            style={{ border: `1px solid ${C.border}`, color: C.gray }}>
            Cancel
          </button>
          <button onClick={onApply}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90"
            style={{ background: C.navy, color: 'white' }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
