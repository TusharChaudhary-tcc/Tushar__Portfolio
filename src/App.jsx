import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Terminal, Cpu, Code2, Folder, FileCode, Play, RotateCcw, Volume2, VolumeX, 
  ExternalLink, Github, Linkedin, Award, Activity, Search, Settings, 
  GitBranch, ChevronRight, ChevronDown, CheckCircle2, Flame, Sparkles, 
  Layers, Box, Send, X, Maximize2, Minimize2, Trophy, Zap, Shield,
  ArrowRight, Compass, RefreshCw, User, FileText, Check, BadgeCheck,
  Radio, Clock, Music, ShoppingCart, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Audio Synthesizer (Subtle mechanical click sounds)
const playSynthSound = (type = 'click', muted = false) => {
  if (muted || typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      osc.start(now);
      osc.stop(now + 0.025);
    } else if (type === 'step') {
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.03);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.08);
      osc.frequency.setValueAtTime(659.25, now + 0.16);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {}
};

// Maze Grid Settings
const ROWS = 13;
const COLS = 21;
const START_POS = { r: 1, c: 1 };
const END_POS = { r: ROWS - 2, c: COLS - 2 };

export default function App() {
  const [muted, setMuted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home.tsx');
  const [openTabs, setOpenTabs] = useState([
    'home.tsx',
    'projects.tsx',
    'competitive_programming.json',
    'certifications.json',
    'maze_challenge.ts',
    'about.html'
  ]);

  // Subtle Mouse Spotlight Coordinates
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [imgSrc, setImgSrc] = useState('/profile.png');
  const [avatarError, setAvatarError] = useState(false);

  // Track Cursor Position for Background Glow
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // --- MAZE & PATHFINDING STATE ---
  const [grid, setGrid] = useState([]);
  const [playerPos, setPlayerPos] = useState({ ...START_POS });
  const [aiRunning, setAiRunning] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [aiWon, setAiWon] = useState(false);
  const [visitedCount, setVisitedCount] = useState(0);
  const [userSteps, setUserSteps] = useState(0);
  const [superpowerUnlocked, setSuperpowerUnlocked] = useState(false);

  const generateMaze = useCallback(() => {
    const newGrid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) {
          row.push('WALL');
        } else if (
          (r === START_POS.r && c === START_POS.c) ||
          (r === END_POS.r && c === END_POS.c)
        ) {
          row.push('EMPTY');
        } else {
          row.push(Math.random() < 0.28 ? 'WALL' : 'EMPTY');
        }
      }
      newGrid.push(row);
    }

    let currR = START_POS.r;
    let currC = START_POS.c;
    while (currR !== END_POS.r || currC !== END_POS.c) {
      if (currR < END_POS.r && Math.random() < 0.5) currR++;
      else if (currC < END_POS.c) currC++;
      else if (currR < END_POS.r) currR++;
      newGrid[currR][currC] = 'EMPTY';
    }

    setGrid(newGrid);
    setPlayerPos({ ...START_POS });
    setGameWon(false);
    setAiWon(false);
    setAiRunning(false);
    setVisitedCount(0);
    setUserSteps(0);
  }, []);

  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

  // Keyboard navigation for Maze
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        if (activeTab !== 'maze_challenge.ts' || gameWon || aiWon) return;
        e.preventDefault();

        let dr = 0, dc = 0;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dr = -1;
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dr = 1;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dc = -1;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dc = 1;

        const newR = playerPos.r + dr;
        const newC = playerPos.c + dc;

        if (newR >= 0 && newR < ROWS && newC >= 0 && newC < COLS && grid[newR][newC] !== 'WALL') {
          playSynthSound('step', muted);
          setPlayerPos({ r: newR, c: newC });
          setUserSteps(s => s + 1);

          if (newR === END_POS.r && newC === END_POS.c) {
            setGameWon(true);
            setSuperpowerUnlocked(true);
            playSynthSound('win', muted);
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, grid, activeTab, gameWon, aiWon, muted]);

  // Run Dijkstra / BFS
  const runDijkstraAi = () => {
    if (aiRunning || gameWon || aiWon) return;
    setAiRunning(true);
    playSynthSound('click', muted);

    const queue = [[START_POS.r, START_POS.c]];
    const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const parent = {};
    visited[START_POS.r][START_POS.c] = true;

    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let found = false;
    let stepCount = 0;

    const interval = setInterval(() => {
      if (queue.length === 0 || found) {
        clearInterval(interval);
        setAiRunning(false);
        if (found && !gameWon) {
          setAiWon(true);
        }
        return;
      }

      const [r, c] = queue.shift();
      stepCount++;
      setVisitedCount(stepCount);

      if (r === END_POS.r && c === END_POS.c) {
        found = true;
        let curr = `${r},${c}`;
        setGrid(prev => {
          const next = prev.map(row => [...row]);
          while (parent[curr]) {
            const [pr, pc] = curr.split(',').map(Number);
            if (!(pr === START_POS.r && pc === START_POS.c) && !(pr === END_POS.r && pc === END_POS.c)) {
              next[pr][pc] = 'AI_PATH';
            }
            curr = parent[curr];
          }
          return next;
        });
        return;
      }

      setGrid(prev => {
        const next = prev.map(row => [...row]);
        if (!(r === START_POS.r && c === START_POS.c) && !(r === END_POS.r && c === END_POS.c)) {
          next[r][c] = 'AI_VISITED';
        }
        return next;
      });

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc] && grid[nr][nc] !== 'WALL') {
          visited[nr][nc] = true;
          parent[`${nr},${nc}`] = `${r},${c}`;
          queue.push([nr, nc]);
        }
      }
    }, 40);
  };

  const openFile = (tabName) => {
    playSynthSound('click', muted);
    if (!openTabs.includes(tabName)) {
      setOpenTabs([...openTabs, tabName]);
    }
    setActiveTab(tabName);
  };

  const closeTab = (tabName, e) => {
    e.stopPropagation();
    playSynthSound('click', muted);
    const filtered = openTabs.filter(t => t !== tabName);
    setOpenTabs(filtered);
    if (activeTab === tabName) {
      setActiveTab(filtered[filtered.length - 1] || '');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#08090C] text-slate-200 font-sans select-none overflow-hidden text-xs relative">
      
      {/* SUBTLE LINEAR-STYLE MOUSE GLOW */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.05), transparent 75%)`
        }}
      />

      {/* 1. TOP TITLE BAR (VS CODE / RAYCAST MINIMALISM) */}
      <div className="h-10 bg-[#0C0D11] border-b border-[#1A1C24] px-4 flex items-center justify-between z-30 font-mono">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#333742] inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#333742] inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#333742] inline-block"></span>
          </div>

          <div className="hidden lg:flex items-center space-x-4 text-[11px] text-slate-400">
            <span className="text-white font-medium">Tushar Chaudhary</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">Software Engineer</span>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 px-3.5 py-1 rounded-md bg-[#13151D] border border-[#20232F] text-slate-400 text-[11px] w-64 sm:w-72 justify-center hover:border-slate-600 transition">
            <Search className="w-3 h-3 text-slate-500" />
            <span className="text-slate-300 text-[11px]">portfolio / core-systems</span>
            <span className="text-[10px] bg-[#1C1F2B] px-1 rounded text-slate-400 ml-auto">⌘P</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => { playSynthSound('click', muted); setMuted(!muted); }}
            className="p-1.5 rounded hover:bg-[#181A22] text-slate-400 hover:text-white transition"
            title="Audio Feedback"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-blue-400" />}
          </button>
          <a 
            href="https://github.com/TusharChaudhary-tcc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 rounded hover:bg-[#181A22] text-slate-400 hover:text-white transition"
            title="GitHub"
          >
            <Github className="w-3.5 h-3.5" />
          </a>
          <a 
            href="https://www.linkedin.com/in/chaudharytushar01/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 rounded hover:bg-[#181A22] text-slate-400 hover:text-white transition"
            title="LinkedIn"
          >
            <Linkedin className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative z-10 font-mono">
        
        {/* ACTIVITY BAR */}
        <div className="w-12 bg-[#090A0D] border-r border-[#161820] flex flex-col items-center py-3 space-y-4 z-20">
          <button 
            onClick={() => { playSynthSound('click', muted); setSidebarOpen(!sidebarOpen); }}
            className={`p-2 rounded-md transition ${sidebarOpen ? 'text-white bg-[#151720]' : 'text-slate-500 hover:text-slate-300'}`}
            title="Explorer"
          >
            <Folder className="w-4 h-4" />
          </button>
          <button 
            onClick={() => openFile('projects.tsx')}
            className={`p-2 rounded-md transition ${activeTab === 'projects.tsx' ? 'text-white bg-[#151720]' : 'text-slate-500 hover:text-slate-300'}`}
            title="Projects (4 Live Systems)"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button 
            onClick={() => openFile('competitive_programming.json')}
            className={`p-2 rounded-md transition ${activeTab === 'competitive_programming.json' ? 'text-white bg-[#151720]' : 'text-slate-500 hover:text-slate-300'}`}
            title="220+ LeetCode"
          >
            <Trophy className="w-4 h-4" />
          </button>
          <button 
            onClick={() => openFile('certifications.json')}
            className={`p-2 rounded-md transition ${activeTab === 'certifications.json' ? 'text-white bg-[#151720]' : 'text-slate-500 hover:text-slate-300'}`}
            title="Certifications"
          >
            <BadgeCheck className="w-4 h-4" />
          </button>
          <button 
            onClick={() => openFile('maze_challenge.ts')}
            className={`p-2 rounded-md transition ${activeTab === 'maze_challenge.ts' ? 'text-white bg-[#151720]' : 'text-slate-500 hover:text-slate-300'}`}
            title="Maze Game"
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>

        {/* SIDEBAR EXPLORER */}
        {sidebarOpen && (
          <div className="w-56 bg-[#0B0C10] border-r border-[#161820] flex flex-col overflow-hidden text-xs">
            <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-500 flex items-center justify-between border-b border-[#161820]">
              <span>EXPLORER</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-600 hover:text-slate-300">
                <Minimize2 className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2 px-1 text-[11px] space-y-0.5">
              
              <div 
                onClick={() => openFile('home.tsx')}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded cursor-pointer transition ${activeTab === 'home.tsx' ? 'bg-[#151720] text-white font-medium' : 'text-slate-400 hover:bg-[#111319] hover:text-slate-200'}`}
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate">home.tsx</span>
              </div>

              {/* projects.tsx */}
              <div 
                onClick={() => openFile('projects.tsx')}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded cursor-pointer transition ${activeTab === 'projects.tsx' ? 'bg-[#151720] text-white font-medium' : 'text-slate-400 hover:bg-[#111319] hover:text-slate-200'}`}
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">projects.tsx</span>
              </div>

              <div 
                onClick={() => openFile('competitive_programming.json')}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded cursor-pointer transition ${activeTab === 'competitive_programming.json' ? 'bg-[#151720] text-white font-medium' : 'text-slate-400 hover:bg-[#111319] hover:text-slate-200'}`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate">cp_dossier.json</span>
              </div>

              <div 
                onClick={() => openFile('certifications.json')}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded cursor-pointer transition ${activeTab === 'certifications.json' ? 'bg-[#151720] text-white font-medium' : 'text-slate-400 hover:bg-[#111319] hover:text-slate-200'}`}
              >
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">certifications.json</span>
              </div>

              <div 
                onClick={() => openFile('maze_challenge.ts')}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded cursor-pointer transition ${activeTab === 'maze_challenge.ts' ? 'bg-[#151720] text-white font-medium' : 'text-slate-400 hover:bg-[#111319] hover:text-slate-200'}`}
              >
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate">maze_challenge.ts</span>
              </div>

              <div 
                onClick={() => openFile('about.html')}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded cursor-pointer transition ${activeTab === 'about.html' ? 'bg-[#151720] text-white font-medium' : 'text-slate-400 hover:bg-[#111319] hover:text-slate-200'}`}
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">about.html</span>
              </div>

              {/* Profiles Section */}
              <div className="pt-4 px-2.5 py-1 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                ONLINE PROFILES
              </div>

              <a 
                href="https://leetcode.com/u/TUSHAR_CHAUDHARY_01/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between px-2.5 py-1 text-slate-400 hover:bg-[#111319] hover:text-white rounded transition"
              >
                <span>LeetCode (220+)</span>
                <ExternalLink className="w-3 h-3 text-slate-600" />
              </a>

              <a 
                href="https://www.codechef.com/users/tushar_tcc" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between px-2.5 py-1 text-slate-400 hover:bg-[#111319] hover:text-white rounded transition"
              >
                <span>CodeChef</span>
                <ExternalLink className="w-3 h-3 text-slate-600" />
              </a>

              <a 
                href="https://www.geeksforgeeks.org/profile/tusharchauml4q?tab=overview" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between px-2.5 py-1 text-slate-400 hover:bg-[#111319] hover:text-white rounded transition"
              >
                <span>GeeksforGeeks</span>
                <ExternalLink className="w-3 h-3 text-slate-600" />
              </a>

              <a 
                href="https://codolio.com/profile/Tushar_Chaudhary_01" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between px-2.5 py-1 text-slate-400 hover:bg-[#111319] hover:text-white rounded transition"
              >
                <span>Codolio</span>
                <ExternalLink className="w-3 h-3 text-slate-600" />
              </a>

              <a 
                href="https://www.hackerrank.com/profile/tusharchaudhar30" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between px-2.5 py-1 text-slate-400 hover:bg-[#111319] hover:text-white rounded transition"
              >
                <span>HackerRank</span>
                <ExternalLink className="w-3 h-3 text-slate-600" />
              </a>
            </div>
          </div>
        )}

        {/* 3. CENTER EDITOR WORKSPACE */}
        <div className="flex-1 flex flex-col bg-[#08090C] overflow-hidden">
          
          {/* TABS HEADER */}
          <div className="h-9 bg-[#0C0D11] border-b border-[#161820] flex items-center overflow-x-auto scrollbar-none">
            {openTabs.map(tab => {
              const isActive = activeTab === tab;
              return (
                <div
                  key={tab}
                  onClick={() => { playSynthSound('click', muted); setActiveTab(tab); }}
                  className={`h-full px-3.5 flex items-center space-x-2 border-r border-[#161820] cursor-pointer text-[11px] transition ${
                    isActive 
                      ? 'bg-[#08090C] text-white border-t-2 border-t-blue-500 font-medium' 
                      : 'bg-[#0C0D11] text-slate-500 hover:bg-[#111218] hover:text-slate-300'
                  }`}
                >
                  <span>{tab}</span>
                  <button 
                    onClick={(e) => closeTab(tab, e)}
                    className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* BREADCRUMBS BAR */}
          <div className="h-6 bg-[#08090C] px-4 flex items-center space-x-1.5 text-[10px] text-slate-600 border-b border-[#13151D]">
            <span>src</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-400">{activeTab}</span>
          </div>

          {/* TAB CONTENTS */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 font-sans">

            {/* TAB: home.tsx */}
            {activeTab === 'home.tsx' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                
                {/* Hero Profile Block */}
                <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-8 pt-2">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white uppercase leading-none">
                        Tushar
                      </h1>
                      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-300 uppercase leading-none">
                        Chaudhary
                      </h1>
                    </div>

                    {/* Minimalist Monochrome Tag Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-mono">
                      <span className="px-3 py-1 rounded-md bg-[#111319] border border-[#1E222D] text-slate-300 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Backend &amp; Distributed Systems</span>
                      </span>
                      <span className="px-3 py-1 rounded-md bg-[#111319] border border-[#1E222D] text-slate-300 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span>220+ LeetCode Solved</span>
                      </span>
                      <span className="px-3 py-1 rounded-md bg-[#111319] border border-[#1E222D] text-slate-300 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <span>Full-Stack &amp; Cloud (AWS)</span>
                      </span>
                      <span className="px-3 py-1 rounded-md bg-[#111319] border border-[#1E222D] text-slate-300 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        <span>AWS Builder</span>
                      </span>
                    </div>

                    {/* Bio Statement */}
                    <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed pt-1">
                      Software Engineer specialized in <strong className="text-white font-medium">full-stack web platforms</strong>, <strong className="text-white font-medium">algorithmic problem solving (220+ LeetCode)</strong>, and <strong className="text-white font-medium">cloud architecture on AWS</strong>. Dedicated to building reliable, high-throughput software with clean architecture and optimal performance.
                    </p>
                  </div>

                  {/* Profile Photo Container */}
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <div className="relative group">
                      <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-xl p-1 bg-[#151720] border border-[#232735] shadow-xl overflow-hidden flex items-center justify-center">
                        {!avatarError ? (
                          <img 
                            src={imgSrc} 
                            alt="Tushar Chaudhary" 
                            onError={() => {
                              if (imgSrc === '/profile.png') setImgSrc('/profile.jpg');
                              else setAvatarError(true);
                            }}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#111319] rounded-lg flex flex-col items-center justify-center text-center p-3">
                            <User className="w-10 h-10 text-slate-400 mb-1" />
                            <span className="font-semibold text-white text-xs">Tushar Chaudhary</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-md bg-[#0D0E12] border border-[#232735] text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>ONLINE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minimalist Navigation Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 font-mono text-xs">
                  <button 
                    onClick={() => openFile('projects.tsx')}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-md bg-white hover:bg-slate-200 text-black font-semibold transition"
                  >
                    <Folder className="w-3.5 h-3.5 fill-black" />
                    <span>Projects (4 Live Apps)</span>
                  </button>

                  <button 
                    onClick={() => openFile('certifications.json')}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-md bg-[#13151D] hover:bg-[#1A1D27] border border-[#20232F] text-slate-200 transition"
                  >
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Certifications</span>
                  </button>

                  <button 
                    onClick={() => openFile('competitive_programming.json')}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-md bg-[#13151D] hover:bg-[#1A1D27] border border-[#20232F] text-slate-200 transition"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>220+ LeetCode Profiles</span>
                  </button>

                  <button 
                    onClick={() => openFile('maze_challenge.ts')}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-md bg-[#13151D] hover:bg-[#1A1D27] border border-[#20232F] text-slate-200 transition"
                  >
                    <Zap className="w-3.5 h-3.5 text-slate-300" />
                    <span>Maze Challenge</span>
                  </button>

                  <button 
                    onClick={() => openFile('about.html')}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-md bg-[#13151D] hover:bg-[#1A1D27] border border-[#20232F] text-slate-200 transition"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>About Me</span>
                  </button>
                </div>

                {/* Clean Key Performance Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#0D0E13] border border-[#181A23] font-mono">
                  <div className="text-center sm:border-r border-[#181A23]">
                    <div className="text-2xl font-bold text-white">220+</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">LEETCODE PROBLEMS</div>
                  </div>
                  <div className="text-center sm:border-r border-[#181A23]">
                    <div className="text-2xl font-bold text-slate-200">4</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">DEPLOYED PROJECTS</div>
                  </div>
                  <div className="text-center sm:border-r border-[#181A23]">
                    <div className="text-2xl font-bold text-blue-400">O(log N)</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">COMPLEXITY TARGET</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">AWS</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">AP-SOUTHEAST-2</div>
                  </div>
                </div>

                {/* Clean Social Links Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-2 font-mono text-[11px]">
                  <a 
                    href="https://github.com/TusharChaudhary-tcc" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#111319] hover:bg-[#171922] border border-[#1E222D] text-slate-300 hover:text-white transition"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>

                  <a 
                    href="https://www.linkedin.com/in/chaudharytushar01/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#111319] hover:bg-[#171922] border border-[#1E222D] text-slate-300 hover:text-white transition"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                    <span>LinkedIn</span>
                  </a>

                  <a 
                    href="https://leetcode.com/u/TUSHAR_CHAUDHARY_01/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#111319] hover:bg-[#171922] border border-[#1E222D] text-slate-300 hover:text-white transition"
                  >
                    <Flame className="w-3.5 h-3.5 text-[#FFA116]" />
                    <span>LeetCode</span>
                  </a>

                  <a 
                    href="https://www.codechef.com/users/tushar_tcc" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#111319] hover:bg-[#171922] border border-[#1E222D] text-slate-300 hover:text-white transition"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span>CodeChef</span>
                  </a>

                  <a 
                    href="https://www.geeksforgeeks.org/profile/tusharchauml4q?tab=overview" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#111319] hover:bg-[#171922] border border-[#1E222D] text-slate-300 hover:text-white transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>GFG</span>
                  </a>

                  <a 
                    href="https://codolio.com/profile/Tushar_Chaudhary_01" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#111319] hover:bg-[#171922] border border-[#1E222D] text-slate-300 hover:text-white transition"
                  >
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    <span>Codolio</span>
                  </a>

                  <a 
                    href="https://www.hackerrank.com/profile/tusharchaudhar30" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#111319] hover:bg-[#171922] border border-[#1E222D] text-slate-300 hover:text-white transition"
                  >
                    <Code2 className="w-3.5 h-3.5 text-green-500" />
                    <span>HackerRank</span>
                  </a>
                </div>

              </div>
            )}

            {/* TAB: projects.tsx (YOUR 4 ACTUAL REAL-WORLD PROJECTS!) */}
            {activeTab === 'projects.tsx' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn font-sans">
                <div className="p-6 rounded-xl bg-[#0D0E13] border border-[#181A23]">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#181A23]">
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">// PRODUCTION APPLICATIONS</div>
                      <h2 className="text-xl font-bold text-white">Featured Projects &amp; Live Systems</h2>
                    </div>
                    <a 
                      href="https://github.com/TusharChaudhary-tcc" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md bg-[#13151D] hover:bg-[#1A1D27] border border-[#20232F] text-slate-200 text-xs font-mono flex items-center space-x-1.5 transition"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>All Repositories</span>
                    </a>
                  </div>

                  <p className="text-xs text-slate-400 mb-6">
                    A curated selection of my live web applications, incident response monitoring systems, and e-commerce platforms. Each project features live deployments and public source code.
                  </p>

                  <div className="space-y-5">
                    
                    {/* PROJECT 1: Campus Event Hub */}
                    <div className="p-5 rounded-lg bg-[#111319] border border-[#1E222D] hover:border-slate-500 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161822] text-blue-400 border border-[#222533] font-semibold">
                              FULL STACK &amp; CAMPUS PLATFORM
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white mt-1">Campus Event Hub</h3>
                        </div>

                        {/* Live Demo & GitHub Action Links */}
                        <div className="flex items-center space-x-2 font-mono text-xs">
                          <a 
                            href="https://campus-event-hub-tawny.vercel.app/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-3 py-1.5 rounded bg-white hover:bg-slate-200 text-black font-semibold flex items-center space-x-1.5 transition"
                          >
                            <span>Live Demo</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a 
                            href="https://github.com/TusharChaudhary-tcc/campus-event-hub" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-3 py-1.5 rounded bg-[#161922] hover:bg-[#202432] text-slate-300 hover:text-white border border-[#242838] flex items-center space-x-1.5 transition"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>Source</span>
                          </a>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Centralized event discovery and registration platform for colleges and student communities. Streamlines event ticketing, RSVP management, speaker announcements, and workshop schedules with responsive user registration and category filters.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-xs font-mono">
                        <div className="p-3 rounded bg-[#090A0D] border border-[#181A23]">
                          <span className="text-slate-500 text-[10px] block">PLATFORM</span>
                          <span className="text-sm font-semibold text-white">Event Registration</span>
                        </div>
                        <div className="p-3 rounded bg-[#090A0D] border border-[#181A23]">
                          <span className="text-slate-500 text-[10px] block">DEPLOYMENT</span>
                          <span className="text-sm font-semibold text-emerald-400">Vercel Edge</span>
                        </div>
                        <div className="p-3 rounded bg-[#090A0D] border border-[#181A23]">
                          <span className="text-slate-500 text-[10px] block">USER FLOW</span>
                          <span className="text-sm font-semibold text-blue-400">Instant RSVP &amp; Tix</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 font-mono text-[10px] pt-1">
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">React</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">Node.js</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">Express.js</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">MongoDB</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">Tailwind CSS</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">Vercel</span>
                      </div>
                    </div>

                    {/* PROJECT 2: Incident Zero */}
                    <div className="p-5 rounded-lg bg-[#111319] border border-[#1E222D] hover:border-slate-500 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161822] text-amber-400 border border-[#222533] font-semibold">
                              IT / DEVOPS INCIDENT MONITORING
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white mt-1">Incident Zero</h3>
                        </div>

                        {/* Live Demo & GitHub Action Links */}
                        <div className="flex items-center space-x-2 font-mono text-xs">
                          <a 
                            href="https://incident-zero-seven.vercel.app/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-3 py-1.5 rounded bg-white hover:bg-slate-200 text-black font-semibold flex items-center space-x-1.5 transition"
                          >
                            <span>Live Demo</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a 
                            href="https://github.com/TusharChaudhary-tcc/incident-zero" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-3 py-1.5 rounded bg-[#161922] hover:bg-[#202432] text-slate-300 hover:text-white border border-[#242838] flex items-center space-x-1.5 transition"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>Source</span>
                          </a>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        IT &amp; DevOps incident reporting and system downtime tracking platform. Designed to manage real-time outage triage, severity categorization (P1–P4), SLA uptime monitoring, and post-mortem resolution workflows to reduce MTTR (Mean Time to Resolution).
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-xs font-mono">
                        <div className="p-3 rounded bg-[#090A0D] border border-[#181A23]">
                          <span className="text-slate-500 text-[10px] block">INCIDENT TRIAGE</span>
                          <span className="text-sm font-semibold text-white">Severity (P1-P4)</span>
                        </div>
                        <div className="p-3 rounded bg-[#090A0D] border border-[#181A23]">
                          <span className="text-slate-500 text-[10px] block">UPTIME METRIC</span>
                          <span className="text-sm font-semibold text-emerald-400">Real-time SLA Tracking</span>
                        </div>
                        <div className="p-3 rounded bg-[#090A0D] border border-[#181A23]">
                          <span className="text-slate-500 text-[10px] block">TARGET</span>
                          <span className="text-sm font-semibold text-amber-400">Zero Downtime MTTR</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 font-mono text-[10px] pt-1">
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">React</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">TypeScript</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">Node.js</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">REST API</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">Tailwind CSS</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">Vercel</span>
                      </div>
                    </div>

                    {/* PROJECT 3: Spotify Clone */}
                    <div className="p-5 rounded-lg bg-[#111319] border border-[#1E222D] hover:border-slate-500 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161822] text-emerald-400 border border-[#222533] font-semibold">
                              AUDIO STREAMING &amp; MEDIA
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white mt-1">Spotify Web Player Clone</h3>
                        </div>

                        {/* Live Demo & GitHub Action Links */}
                        <div className="flex items-center space-x-2 font-mono text-xs">
                          <a 
                            href="https://spotify-clone-orpin-three-87.vercel.app/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-3 py-1.5 rounded bg-white hover:bg-slate-200 text-black font-semibold flex items-center space-x-1.5 transition"
                          >
                            <span>Live Demo</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a 
                            href="https://github.com/TusharChaudhary-tcc/spotify-clone" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-3 py-1.5 rounded bg-[#161922] hover:bg-[#202432] text-slate-300 hover:text-white border border-[#242838] flex items-center space-x-1.5 transition"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>Source</span>
                          </a>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        High-fidelity web music streaming player inspired by Spotify. Engineered with the HTML5 Audio API featuring seamless track playback, dynamic audio progress seekbars, interactive playlist browsing, and a responsive dark-mode glassmorphic interface.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-xs font-mono">
                        <div className="p-3 rounded bg-[#090A0D] border border-[#181A23]">
                          <span className="text-slate-500 text-[10px] block">AUDIO ENGINE</span>
                          <span className="text-sm font-semibold text-white">HTML5 Audio API</span>
                        </div>
                        <div className="p-3 rounded bg-[#090A0D] border border-[#181A23]">
                          <span className="text-slate-500 text-[10px] block">PLAYBACK</span>
                          <span className="text-sm font-semibold text-emerald-400">Zero-Lag Scrubbing</span>
                        </div>
                        <div className="p-3 rounded bg-[#090A0D] border border-[#181A23]">
                          <span className="text-slate-500 text-[10px] block">INTERFACE</span>
                          <span className="text-sm font-semibold text-blue-400">Spotify Dark Theme</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 font-mono text-[10px] pt-1">
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">React</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">JavaScript</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">HTML5 Audio</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">Tailwind CSS</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">Vercel</span>
                      </div>
                    </div>

                    {/* PROJECT 4: Flipkart Clone */}
                    <div className="p-5 rounded-lg bg-[#111319] border border-[#1E222D] hover:border-slate-500 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161822] text-blue-400 border border-[#222533] font-semibold">
                              E-COMMERCE &amp; RETAIL UI
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white mt-1">Flipkart E-Commerce Clone</h3>
                        </div>

                        {/* Live Demo & GitHub Action Links */}
                        <div className="flex items-center space-x-2 font-mono text-xs">
                          <a 
                            href="https://tusharchaudhary-tcc.github.io/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-3 py-1.5 rounded bg-white hover:bg-slate-200 text-black font-semibold flex items-center space-x-1.5 transition"
                          >
                            <span>Live Demo</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a 
                            href="https://github.com/TusharChaudhary-tcc/TusharChaudhary-tcc.github.io" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-3 py-1.5 rounded bg-[#161922] hover:bg-[#202432] text-slate-300 hover:text-white border border-[#242838] flex items-center space-x-1.5 transition"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>Source</span>
                          </a>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Responsive retail frontend recreation of Flipkart. Features product category sliders, categorical product browsing, dynamic cart item management, search bar simulation, and multi-viewport responsive layouts deployed on GitHub Pages.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-xs font-mono">
                        <div className="p-3 rounded bg-[#090A0D] border border-[#181A23]">
                          <span className="text-slate-500 text-[10px] block">UI REPLICA</span>
                          <span className="text-sm font-semibold text-white">Flipkart Retail UX</span>
                        </div>
                        <div className="p-3 rounded bg-[#090A0D] border border-[#181A23]">
                          <span className="text-slate-500 text-[10px] block">DEPLOYMENT</span>
                          <span className="text-sm font-semibold text-emerald-400">GitHub Pages</span>
                        </div>
                        <div className="p-3 rounded bg-[#090A0D] border border-[#181A23]">
                          <span className="text-slate-500 text-[10px] block">INTERACTION</span>
                          <span className="text-sm font-semibold text-blue-400">Cart &amp; Product Sliders</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 font-mono text-[10px] pt-1">
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">HTML5</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">CSS3</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">JavaScript</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">GitHub Pages</span>
                        <span className="px-2 py-0.5 rounded bg-[#161822] text-slate-300 border border-[#20232F]">Responsive Design</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB: competitive_programming.json */}
            {activeTab === 'competitive_programming.json' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn font-mono">
                <div className="p-6 rounded-xl bg-[#0D0E13] border border-[#181A23]">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#181A23]">
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">// COMPETITIVE DOSSIER</div>
                      <h2 className="text-xl font-bold text-white font-sans">Competitive Programming Command Center</h2>
                    </div>
                    <div className="px-3 py-1 rounded-md bg-[#151720] border border-[#232735] text-amber-400 text-xs font-semibold flex items-center space-x-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      <span>220+ LEETCODE SOLVED</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-6 font-sans">
                    Direct platform connections across 5 major competitive programming websites. Practicing algorithms, data structures, and optimal time complexity.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {/* LeetCode */}
                    <a 
                      href="https://leetcode.com/u/TUSHAR_CHAUDHARY_01/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-lg bg-[#111319] border border-[#1E222D] hover:border-slate-500 transition group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-semibold text-white">LeetCode</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition" />
                        </div>
                        <div className="text-base font-bold text-white mb-0.5">@TUSHAR_CHAUDHARY_01</div>
                        <div className="text-[11px] text-slate-400">220+ Problems Solved</div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#181A23] flex justify-between text-[10px] text-slate-500">
                        <span>DSA Track</span>
                        <span className="text-slate-300 group-hover:underline">Visit Profile &rarr;</span>
                      </div>
                    </a>

                    {/* CodeChef */}
                    <a 
                      href="https://www.codechef.com/users/tushar_tcc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-lg bg-[#111319] border border-[#1E222D] hover:border-slate-500 transition group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-semibold text-white">CodeChef</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition" />
                        </div>
                        <div className="text-base font-bold text-white mb-0.5">@tushar_tcc</div>
                        <div className="text-[11px] text-slate-400">Contest &amp; Rating Track</div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#181A23] flex justify-between text-[10px] text-slate-500">
                        <span>Division Track</span>
                        <span className="text-slate-300 group-hover:underline">Visit Profile &rarr;</span>
                      </div>
                    </a>

                    {/* GeeksforGeeks */}
                    <a 
                      href="https://www.geeksforgeeks.org/profile/tusharchauml4q?tab=overview"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-lg bg-[#111319] border border-[#1E222D] hover:border-slate-500 transition group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-semibold text-white">GeeksforGeeks</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition" />
                        </div>
                        <div className="text-base font-bold text-white mb-0.5">@tusharchauml4q</div>
                        <div className="text-[11px] text-slate-400">Coding Score &amp; Articles</div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#181A23] flex justify-between text-[10px] text-slate-500">
                        <span>Algorithms</span>
                        <span className="text-slate-300 group-hover:underline">Visit Profile &rarr;</span>
                      </div>
                    </a>

                    {/* Codolio */}
                    <a 
                      href="https://codolio.com/profile/Tushar_Chaudhary_01"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-lg bg-[#111319] border border-[#1E222D] hover:border-slate-500 transition group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-semibold text-white">Codolio</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition" />
                        </div>
                        <div className="text-base font-bold text-white mb-0.5">@Tushar_Chaudhary_01</div>
                        <div className="text-[11px] text-slate-400">Unified Developer Stats</div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#181A23] flex justify-between text-[10px] text-slate-500">
                        <span>Aggregator</span>
                        <span className="text-slate-300 group-hover:underline">Visit Profile &rarr;</span>
                      </div>
                    </a>

                    {/* HackerRank */}
                    <a 
                      href="https://www.hackerrank.com/profile/tusharchaudhar30"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-lg bg-[#111319] border border-[#1E222D] hover:border-slate-500 transition group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-semibold text-white">HackerRank</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition" />
                        </div>
                        <div className="text-base font-bold text-white mb-0.5">@tusharchaudhar30</div>
                        <div className="text-[11px] text-slate-400">Problem Solving Badges</div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#181A23] flex justify-between text-[10px] text-slate-500">
                        <span>Skill Badges</span>
                        <span className="text-slate-300 group-hover:underline">Visit Profile &rarr;</span>
                      </div>
                    </a>

                    {/* GitHub */}
                    <a 
                      href="https://github.com/TusharChaudhary-tcc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-lg bg-[#111319] border border-[#1E222D] hover:border-slate-500 transition group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-semibold text-white">GitHub</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition" />
                        </div>
                        <div className="text-base font-bold text-white mb-0.5">@TusharChaudhary-tcc</div>
                        <div className="text-[11px] text-slate-400">Public Repositories</div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#181A23] flex justify-between text-[10px] text-slate-500">
                        <span>Source Code</span>
                        <span className="text-slate-300 group-hover:underline">Visit GitHub &rarr;</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: certifications.json */}
            {activeTab === 'certifications.json' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn font-sans">
                <div className="p-6 rounded-xl bg-[#0D0E13] border border-[#181A23]">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#181A23]">
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">// ACCREDITATIONS</div>
                      <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                        <BadgeCheck className="w-5 h-5 text-emerald-400" />
                        <span>Verified Certifications &amp; Credentials</span>
                      </h2>
                    </div>
                    <div className="px-2.5 py-1 rounded-md bg-[#151720] border border-[#232735] text-slate-300 text-[11px] font-mono">
                      VERIFIED CREDENTIALS
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-6">
                    Professional certifications and verified assessments in Cloud Infrastructure, Problem Solving, and Object-Oriented Software Design.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Cert 1: AWS */}
                    <div className="p-5 rounded-lg bg-[#111319] border border-[#1E222D] hover:border-slate-500 transition flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-semibold text-white flex items-center space-x-1.5">
                            <span>Amazon Web Services</span>
                          </span>
                          <span className="text-[10px] font-mono bg-[#161822] text-slate-300 px-2 py-0.5 rounded border border-[#222533]">
                            Cloud Architecture
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">AWS Certified Cloud Practitioner</h3>
                        <p className="text-xs text-slate-400 mb-3">
                          Proficiency in AWS cloud infrastructure, security, IAM policies, global edge deployment, and serverless architectures.
                        </p>
                        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-[#161922] text-slate-300 border border-[#202432]">AWS Amplify</span>
                          <span className="px-2 py-0.5 rounded bg-[#161922] text-slate-300 border border-[#202432]">Lambda</span>
                          <span className="px-2 py-0.5 rounded bg-[#161922] text-slate-300 border border-[#202432]">IAM &amp; S3</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#181A23] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center space-x-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                        <a href="https://builder.aws.com" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center space-x-1">
                          <span>View Credential</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Cert 2: HackerRank */}
                    <div className="p-5 rounded-lg bg-[#111319] border border-[#1E222D] hover:border-slate-500 transition flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-semibold text-white">HackerRank</span>
                          <span className="text-[10px] font-mono bg-[#161822] text-slate-300 px-2 py-0.5 rounded border border-[#222533]">
                            Algorithms
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">Problem Solving (Intermediate &amp; Advanced)</h3>
                        <p className="text-xs text-slate-400 mb-3">
                          Algorithmic rigor in Data Structures, Dynamic Programming, Graph Traversals, and asymptotic complexity proofs.
                        </p>
                        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-[#161922] text-slate-300 border border-[#202432]">Data Structures</span>
                          <span className="px-2 py-0.5 rounded bg-[#161922] text-slate-300 border border-[#202432]">Graph Theory</span>
                          <span className="px-2 py-0.5 rounded bg-[#161922] text-slate-300 border border-[#202432]">C++ / Java</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#181A23] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center space-x-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                        <a href="https://www.hackerrank.com/profile/tusharchaudhar30" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center space-x-1">
                          <span>Verify Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Cert 3: Java & OOP */}
                    <div className="p-5 rounded-lg bg-[#111319] border border-[#1E222D] hover:border-slate-500 transition flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-semibold text-white">Software Architecture</span>
                          <span className="text-[10px] font-mono bg-[#161822] text-slate-300 px-2 py-0.5 rounded border border-[#222533]">
                            Backend
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">Core Java &amp; Multithreading Specialization</h3>
                        <p className="text-xs text-slate-400 mb-3">
                          Object-oriented system design, JVM memory execution model, thread synchronization, and concurrency primitives.
                        </p>
                        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-[#161922] text-slate-300 border border-[#202432]">JVM Model</span>
                          <span className="px-2 py-0.5 rounded bg-[#161922] text-slate-300 border border-[#202432]">Multithreading</span>
                          <span className="px-2 py-0.5 rounded bg-[#161922] text-slate-300 border border-[#202432]">OOP</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#181A23] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center space-x-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                        <a href="https://www.linkedin.com/in/chaudharytushar01/" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center space-x-1">
                          <span>View on LinkedIn</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Cert 4: CP Milestone */}
                    <div className="p-5 rounded-lg bg-[#111319] border border-[#1E222D] hover:border-slate-500 transition flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-semibold text-white">Competitive Milestone</span>
                          <span className="text-[10px] font-mono bg-[#161822] text-slate-300 px-2 py-0.5 rounded border border-[#222533]">
                            220+ Solved
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">220+ Problem Solving Milestone</h3>
                        <p className="text-xs text-slate-400 mb-3">
                          Milestone across LeetCode, CodeChef, and Codolio covering Arrays, Trees, Dynamic Programming, and Binary Search.
                        </p>
                        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-[#161922] text-slate-300 border border-[#202432]">LeetCode</span>
                          <span className="px-2 py-0.5 rounded bg-[#161922] text-slate-300 border border-[#202432]">CodeChef</span>
                          <span className="px-2 py-0.5 rounded bg-[#161922] text-slate-300 border border-[#202432]">Codolio</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#181A23] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center space-x-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active Practice</span>
                        </span>
                        <a href="https://leetcode.com/u/TUSHAR_CHAUDHARY_01/" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center space-x-1">
                          <span>Inspect LeetCode</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB: maze_challenge.ts */}
            {activeTab === 'maze_challenge.ts' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn font-mono">
                <div className="p-6 rounded-xl bg-[#0D0E13] border border-[#181A23]">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#181A23]">
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">// HACKATHON TECH SUPERPOWER</div>
                      <h2 className="text-xl font-bold text-white font-sans flex items-center space-x-2">
                        <span>Pathfinding Maze Challenge</span>
                        {superpowerUnlocked && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#151720] border border-emerald-500/30 text-emerald-400">
                            UNLOCKED
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 font-sans">
                        Navigate to the target exit with <strong className="text-white">Arrow Keys</strong> or <strong className="text-white">WASD</strong>. Or execute Dijkstra AI to watch real-time graph traversal.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={generateMaze}
                        className="px-3 py-1.5 rounded-md bg-[#13151D] hover:bg-[#1A1D27] border border-[#20232F] text-slate-300 text-xs flex items-center space-x-1.5 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>New Maze</span>
                      </button>

                      <button
                        onClick={runDijkstraAi}
                        disabled={aiRunning || gameWon || aiWon}
                        className="px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-200 text-black text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-40"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>Run Dijkstra AI</span>
                      </button>
                    </div>
                  </div>

                  {/* Telemetry Strip */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#090A0D] border border-[#181A23] mb-4 text-xs font-mono">
                    <div className="flex items-center space-x-6">
                      <div>
                        <span className="text-slate-500 text-[10px] block">YOUR STEPS</span>
                        <span className="text-sm font-bold text-white">{userSteps}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">NODES VISITED</span>
                        <span className="text-sm font-bold text-slate-300">{visitedCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                        <span>Player</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
                        <span>Target Exit</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-slate-600"></span>
                        <span>AI Path</span>
                      </div>
                    </div>
                  </div>

                  {/* Maze Grid */}
                  <div className="p-4 rounded-xl bg-[#08090C] border border-[#181A23] overflow-x-auto flex justify-center">
                    <div className="grid gap-[2px] bg-[#12141C] p-1.5 rounded-lg border border-[#1E212C]"
                         style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
                      {grid.map((row, r) => 
                        row.map((cell, c) => {
                          const isPlayer = playerPos.r === r && playerPos.c === c;
                          const isEnd = END_POS.r === r && END_POS.c === c;
                          const isWall = cell === 'WALL';
                          const isVisited = cell === 'AI_VISITED';
                          const isAiPath = cell === 'AI_PATH';

                          return (
                            <div 
                              key={`${r}-${c}`}
                              className={`w-6 h-6 rounded-[2px] flex items-center justify-center text-[10px] font-bold transition-all duration-75 ${
                                isPlayer ? 'bg-blue-500 text-white shadow-md' :
                                isEnd ? 'bg-amber-400 text-black font-extrabold' :
                                isWall ? 'bg-[#181B24]' :
                                isAiPath ? 'bg-blue-400/80' :
                                isVisited ? 'bg-[#141620]' :
                                'bg-[#0A0C10]'
                              }`}
                            >
                              {isPlayer ? '●' : isEnd ? '★' : ''}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {gameWon && (
                    <div className="mt-4 p-4 rounded-lg bg-[#111319] border border-emerald-500/30 flex items-center justify-between font-sans">
                      <div className="flex items-center space-x-3">
                        <Trophy className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div className="text-sm font-semibold text-white">Target Reached in {userSteps} steps!</div>
                          <div className="text-xs text-slate-400">Algorithmic Pathfinding Master unlocked.</div>
                        </div>
                      </div>
                      <button 
                        onClick={generateMaze}
                        className="px-3 py-1.5 rounded-md bg-white text-black text-xs font-semibold hover:bg-slate-200 font-mono"
                      >
                        Play Again
                      </button>
                    </div>
                  )}

                  {aiWon && !gameWon && (
                    <div className="mt-4 p-4 rounded-lg bg-[#111319] border border-[#232735] flex items-center justify-between font-sans">
                      <div className="flex items-center space-x-3">
                        <Cpu className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-sm font-semibold text-white">Dijkstra AI Solved the Maze</div>
                          <div className="text-xs text-slate-400">Shortest path computed. Generate a fresh maze to try again.</div>
                        </div>
                      </div>
                      <button 
                        onClick={generateMaze}
                        className="px-3 py-1.5 rounded-md bg-[#181A23] hover:bg-[#202432] text-white text-xs font-mono"
                      >
                        Reset Maze
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* TAB: about.html */}
            {activeTab === 'about.html' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn font-sans">
                <div className="p-6 rounded-xl bg-[#0D0E13] border border-[#181A23]">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">// BIO &amp; PHILOSOPHY</div>
                  <h2 className="text-xl font-bold text-white mb-4">About Tushar Chaudhary</h2>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    I am a software engineer focused on core computing principles: efficiency, reliability, and algorithmic rigor. Having solved over 220+ problems across LeetCode, CodeChef, and GeeksforGeeks, I analyze software not just by whether it works, but by how it behaves at scale.
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    My engineering approach bridges low-level memory mechanics (C++/Java) with modern cloud scalability on AWS. Whether tuning lock contention or configuring automated CI/CD deployment pipelines on AWS Amplify, I build systems meant to endure high throughput without degradation.
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>220+ LeetCode DSA Solutions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>AWS Cloud Practitioner Trainee</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
                      <span>Multithreaded Systems Developer</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* 4. BOTTOM STATUS BAR */}
      <footer className="h-6 bg-[#090A0D] border-t border-[#161820] px-4 flex items-center justify-between text-[11px] text-slate-500 font-mono z-30">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-slate-300">
            <GitBranch className="w-3 h-3" />
            <span>main*</span>
          </div>
          <span className="text-slate-700">|</span>
          <span>UTF-8</span>
          <span className="text-slate-700">|</span>
          <span>TypeScript / React</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-slate-400">Deployed on: <strong className="text-white font-medium">AWS Amplify</strong></span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">&copy; 2026 Tushar Chaudhary</span>
        </div>
      </footer>

    </div>
  );
}
