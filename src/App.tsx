/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, MicOff, Send, Terminal, Shield, Activity, Cpu, 
  Menu, X, Command, Database, HardDrive, LayoutGrid, 
  AlertCircle, ChevronRight, Zap, RefreshCcw, Camera, CameraOff
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Orb from "./components/Orb";
import { useJarvis } from "./hooks/useJarvis";

export default function App() {
  const {
    isListening,
    isSpeaking,
    isThinking,
    isScanning,
    messages,
    transcript,
    files,
    systemStatus,
    hardwareInfo,
    localFiles,
    startListening,
    stopListening,
    handleCommand,
    initAudio,
    requestLocalAccess,
    startDeployment
  } = useJarvis();

  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'vault' | 'subsystems' | 'hardware'>('console');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleCamera = async () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStream(stream);
      } catch (err) {
        console.error("Camera error:", err);
        handleCommand("System error: Camera access denied.");
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, transcript, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleCommand(input);
      setInput("");
    }
  };

  const getAssistantState = () => {
    if (isScanning) return 'thinking'; // Scanning uses thinking animation
    if (isThinking) return 'thinking';
    if (isListening) return 'listening';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] font-sans text-blue-50/90 overflow-hidden selection:bg-blue-500/30">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(59,130,246,0.02)_2px,rgba(59,130,246,0.02)_4px)]" />
      </div>

      {/* Diagnostic Scan Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none border-[20px] border-blue-500/10 flex items-center justify-center bg-blue-500/5 backdrop-blur-[2px]"
          >
            <motion.div
              animate={{ y: [-500, 500] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(96,165,250,0.8)]"
            />
            <div className="text-center font-mono space-y-4">
              <Zap className="w-12 h-12 text-blue-400 mx-auto animate-pulse" />
              <div className="text-2xl tracking-[0.5em] text-blue-400 animate-pulse">SCANNING SUBSYSTEMS</div>
              <div className="text-xs opacity-50 uppercase">Securing perimeter... checking core integrity...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <motion.div 
            animate={{ scale: isThinking ? [1, 1.1, 1] : 1 }}
            className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20"
          >
            <Shield className="w-5 h-5 text-blue-400" />
          </motion.div>
          <div>
            <h1 className="font-mono text-sm tracking-widest uppercase font-semibold text-blue-300">
              Jarvis <span className="text-blue-500/50">Elite v5.1</span>
            </h1>
            <div className="text-[8px] font-mono opacity-40 uppercase tracking-tighter">Class 7 Admin Credentials Active</div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-[10px] font-mono tracking-tighter uppercase">
          <div className="flex items-center gap-2 opacity-60">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>Link: SECURE</span>
          </div>
          <div className="flex items-center gap-2 hidden lg:flex opacity-60">
            <Cpu className="w-3 h-3 text-blue-400" />
            <span>CPU: {systemStatus.cpuUsage}%</span>
          </div>
          <div className="flex items-center gap-2 hidden lg:flex opacity-60">
            <Database className="w-3 h-3 text-blue-400" />
            <span>MEM: {systemStatus.memoryUsage}%</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-md transition-all ${isSidebarOpen ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/5'}`}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col pt-16">
        
        {/* HUD Visualizers */}
        <div className="absolute top-20 left-6 bottom-72 w-48 hidden xl:flex flex-col gap-6 pointer-events-none opacity-40">
          <div className="p-4 border border-white/5 bg-black/20 backdrop-blur-sm rounded-lg flex flex-col gap-4">
            <div className="text-[10px] uppercase font-mono tracking-widest text-blue-400">Subsystems</div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col gap-1">
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: [`${Math.random()*100}%`, `${Math.random()*100}%`] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-blue-500/40"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 border border-white/5 bg-black/20 backdrop-blur-sm rounded-lg p-2 overflow-hidden flex flex-col">
          <div className="text-[8px] font-mono uppercase opacity-50 mb-2">Network Flux</div>
            <div className="flex-1 flex items-end gap-0.5">
              {Array.from({length: 20}).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: [`${Math.random()*100}%`, `${Math.random()*100}%`] }}
                  transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                  className="flex-1 bg-emerald-500/20 min-h-[4px]"
                />
              ))}
            </div>
          </div>
        </div>

        {/* The Orb Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
            <div className="w-[600px] h-[600px] border border-blue-500/20 rounded-full animate-[spin_60s_linear_infinite]" />
            <div className="absolute w-[400px] h-[400px] border border-blue-500/20 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
          </div>
          
          <Orb state={getAssistantState()} cameraStream={cameraStream} />
          
          <AnimatePresence>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-12 max-w-xl text-center text-blue-200/70 italic text-xl font-light tracking-wide bg-blue-500/5 px-6 py-2 rounded-full border border-blue-500/10 backdrop-blur-sm"
              >
                "{transcript}"
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Multi-function Dock */}
        <div className="h-80 bg-black/60 backdrop-blur-3xl border-t border-white/5 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {/* Internal Tabs */}
          <div className="flex border-b border-white/5 px-4 bg-white/2">
            {[
              { id: 'console', icon: Terminal, label: 'Console' },
              { id: 'vault', icon: HardDrive, label: 'Vault' },
              { id: 'subsystems', icon: LayoutGrid, label: 'Subsystems' },
              { id: 'hardware', icon: Cpu, label: 'PC Hardware' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 text-[10px] font-mono uppercase tracking-[0.15em] transition-all ${
                  activeTab === tab.id 
                    ? 'border-blue-500 text-blue-300 bg-blue-500/5' 
                    : 'border-transparent opacity-40 hover:opacity-100'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto font-mono text-xs p-6 custom-scrollbar"
          >
            {activeTab === 'hardware' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 bg-white/2 border border-white/5 rounded-xl">
                  <div className="text-[10px] text-blue-400 uppercase mb-2">Platform</div>
                  <div className="text-lg font-bold">{hardwareInfo?.platform || 'Unknown'}</div>
                  <div className="text-[9px] opacity-40 mt-1">Arch: {hardwareInfo?.language}</div>
                </div>
                <div className="p-4 bg-white/2 border border-white/5 rounded-xl">
                  <div className="text-[10px] text-blue-400 uppercase mb-2">Processing</div>
                  <div className="text-lg font-bold">{hardwareInfo?.cores || 'N/A'} Virtual Cores</div>
                  <div className="text-[9px] opacity-40 mt-1">Optimization: ACTIVE</div>
                </div>
                <div className="p-4 bg-white/2 border border-white/5 rounded-xl">
                  <div className="text-[10px] text-blue-400 uppercase mb-2">Battery Status</div>
                  <div className="text-lg font-bold">
                    {hardwareInfo?.battery ? `${hardwareInfo.battery.level}%` : 'CONNECTED'}
                  </div>
                  <div className="text-[9px] opacity-40 mt-1">
                    {hardwareInfo?.battery?.charging ? 'Status: Charging' : 'Status: Discharging'}
                  </div>
                </div>
                <div className="p-4 bg-white/2 border border-white/5 rounded-xl">
                  <div className="text-[10px] text-blue-400 uppercase mb-2">Local Storage (Est)</div>
                  <div className="text-lg font-bold">{hardwareInfo?.storage?.quota ? `${hardwareInfo.storage.quota}GB` : 'UNLIMITED'}</div>
                  <div className="text-[9px] opacity-40 mt-1">Usage: {hardwareInfo?.storage?.usage || 0}MB</div>
                </div>

                {/* PC Access Card */}
                <div className="col-span-full p-6 border border-emerald-500/20 bg-emerald-500/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <HardDrive className="w-6 h-6 text-emerald-400" />
                    <div>
                      <div className="font-mono text-sm uppercase text-emerald-100">Local PC Access</div>
                      <div className="text-[10px] opacity-40 uppercase">Establish secure link to local directories</div>
                    </div>
                  </div>
                  <button 
                    onClick={requestLocalAccess}
                    className="px-6 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-emerald-500/40 transition-all text-emerald-300"
                  >
                    Establish Link
                  </button>
                </div>

                {/* GitHub Deployment Card */}
                <div className="col-span-full p-6 border border-blue-500/20 bg-blue-500/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <RefreshCcw className="w-6 h-6 text-blue-400 animate-spin-slow" />
                    <div>
                      <div className="font-mono text-sm uppercase text-blue-100">GitHub Pages Uplink</div>
                      <div className="text-[10px] opacity-40 uppercase">Dispatch production package via CI/CD Protocol</div>
                    </div>
                  </div>
                  <button 
                    onClick={startDeployment}
                    className="px-6 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-blue-500/40 transition-all text-blue-300"
                  >
                    Deploy to Web
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'console' && (
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="flex items-center gap-3 text-blue-500/30">
                    <RefreshCcw className="w-4 h-4 animate-spin-slow" />
                    <span>Neural Link standing by. Protocol check successful.</span>
                  </div>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-4 group`}>
                    <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                      <div className={`w-1 h-full rounded-full ${m.role === 'user' ? 'bg-blue-500/40' : 'bg-emerald-500/40'}`} />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className={`text-[9px] uppercase tracking-tighter opacity-30 group-hover:opacity-60 transition-opacity`}>
                        {m.role === 'user' ? 'Admin Interface' : 'JARVIS Unit-01'} • {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                      </div>
                      <div className={`prose prose-invert prose-xs max-w-none text-blue-100/90 leading-relaxed font-mono`}>
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'vault' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Local Directory Section */}
                {localFiles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-emerald-400">
                      <span>Synchronized Local Directory</span>
                      <span className="opacity-40">{localFiles.length} items cataloged</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {localFiles.map((item, i) => (
                        <div key={i} className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center gap-3 overflow-hidden">
                          <span className="text-emerald-400 shrink-0">{item.startsWith('[DIR]') ? '📁' : '📄'}</span>
                          <span className="truncate text-[10px] opacity-70 group-hover:opacity-100 transition-opacity">
                            {item.replace('[DIR] ', '').replace('[FILE] ', '')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mainframe Vault files */}
                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-blue-400">Mainframe Secure Vault</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.length === 0 ? (
                      <div className="col-span-full h-32 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl opacity-20">
                        <Database className="w-8 h-8 mb-2" />
                        <div className="uppercase tracking-widest text-[10px]">Vault Empty</div>
                      </div>
                    ) : (
                      files.map((file, i) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={i}
                          className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/30 transition-all group"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <HardDrive className="w-4 h-4 text-blue-400" />
                            <div className="flex-1 truncate font-semibold text-blue-200">{file.name}</div>
                          </div>
                          <div className="text-[10px] opacity-40 line-clamp-3 font-mono h-12">
                            {file.content}
                          </div>
                          <div className="mt-3 text-[8px] opacity-30 flex justify-between uppercase">
                            <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                            <span className="text-blue-400 group-hover:underline cursor-pointer">Explore</span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subsystems' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Neural Web', icon: Zap, status: 'Active', val: systemStatus.cpuUsage, color: 'text-blue-400' },
                  { label: 'Security Firewall', icon: Shield, status: 'Reinforced', val: systemStatus.memoryUsage, color: 'text-emerald-400' },
                  { label: 'Mainframe Integrity', icon: Database, status: 'Optimal', val: 95, color: 'text-purple-400' },
                  { label: 'External Uplink', icon: Activity, status: 'Connected', val: 82, color: 'text-cyan-400' }
                ].map((stat, i) => (
                  <div key={i} className="p-4 border border-white/5 rounded-xl bg-white/2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-white/5 rounded-lg ${stat.color}`}>
                          <stat.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-mono text-xs uppercase tracking-wider">{stat.label}</div>
                          <div className="text-[9px] opacity-40 uppercase">Status: {stat.status}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-mono ${stat.color}`}>{stat.val}%</div>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.val}%` }}
                        className={`h-full bg-current ${stat.color}`}
                      />
                    </div>
                  </div>
                ))}
                
                {/* Audio Sync Tool */}
                <div className="col-span-full p-6 border border-blue-500/20 bg-blue-500/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Zap className="w-6 h-6 text-blue-400" />
                    <div>
                      <div className="font-mono text-sm uppercase text-blue-100">Audio Protocol Sync</div>
                      <div className="text-[10px] opacity-40 uppercase">Synchronize neural voice output</div>
                    </div>
                  </div>
                  <button 
                    onClick={initAudio}
                    className="px-6 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-blue-500/40 transition-all text-blue-300"
                  >
                    Run Sync
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 flex gap-3 items-center bg-black/40 border-t border-white/5">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={isListening ? stopListening : startListening}
              className={`p-4 rounded-full border transition-all ${
                isListening 
                  ? 'bg-red-500/20 border-red-500/50 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse' 
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
              }`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={toggleCamera}
              className={`p-4 rounded-full border transition-all ${
                cameraStream 
                  ? 'bg-blue-500/30 border-blue-500/50 text-blue-100 shadow-[0_0_30px_rgba(59,130,246,0.3)]' 
                  : 'bg-white/5 border-white/10 text-blue-400 hover:bg-white/10'
              }`}
            >
              {cameraStream ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
            </motion.button>
            
            <div className="relative flex-1 group">
              <div className="absolute -inset-1 bg-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Access protocol terminal..."
                className="relative w-full h-14 bg-[#0a0a0a] border border-white/10 rounded-2xl px-6 font-mono text-base focus:outline-none focus:border-blue-500/50 transition-all text-blue-100"
                disabled={isThinking}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <AnimatePresence>
                  {isThinking && (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="text-blue-500"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  className="p-2 text-blue-400 hover:text-blue-200 disabled:opacity-20 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Sidebar: Advanced Tools */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-96 bg-[#080808] border-l border-white/10 z-50 p-8 flex flex-col gap-10 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-mono tracking-tighter uppercase font-bold text-blue-100">Jarvis OS Dashboard</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <section className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-widest text-blue-400">
                    <span>Performance Metrics</span>
                    <RefreshCcw className="w-3 h-3 cursor-pointer hover:rotate-180 transition-transform" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/2 border border-white/5 rounded-xl text-center">
                      <div className="text-2xl font-mono font-bold text-emerald-400">{systemStatus.cpuUsage}%</div>
                      <div className="text-[9px] uppercase opacity-30 mt-1">CPU Load</div>
                    </div>
                    <div className="p-4 bg-white/2 border border-white/5 rounded-xl text-center">
                      <div className="text-2xl font-mono font-bold text-blue-400">{systemStatus.memoryUsage}%</div>
                      <div className="text-[9px] uppercase opacity-30 mt-1">Memory</div>
                    </div>
                  </div>
                  <div className="p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-[10px] space-y-2">
                    <div className="flex justify-between">
                      <span className="opacity-40">OS Runtime</span>
                      <span className="text-blue-300">{systemStatus.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-40">Encryption</span>
                      <span className="text-emerald-400">AES-256 Enabled</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-blue-400">Active Protocols</div>
                  <div className="grid grid-cols-1 gap-2">
                    {systemStatus.activeProtocols.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 hover:border-blue-500/30 transition-all cursor-default group">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:animate-ping" />
                          <span className="font-mono text-xs">{p}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 opacity-30" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-blue-400">System Logs</div>
                  <div className="p-3 bg-black rounded-lg border border-white/5 h-40 font-mono text-[10px] overflow-y-auto space-y-1 opacity-50">
                    <div className="text-emerald-500/60">[SUCCESS] Neural link initialized.</div>
                    <div className="text-blue-500/60">[LOG] Protocol check alpha completed.</div>
                    <div className="text-emerald-500/60">[SUCCESS] User authorization confirmed.</div>
                    <div className="text-yellow-500/60">[WARN] Minor thermal variance in Core B.</div>
                    <div className="text-blue-500/60">[LOG] Vault sync with local buffer...</div>
                    <div className="text-emerald-500/60">[SUCCESS] Admin privileges established.</div>
                  </div>
                </div>

                <button 
                  onClick={initAudio}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all text-[11px] font-mono uppercase tracking-[0.1em] text-blue-300"
                >
                  <Zap className="w-4 h-4" />
                  Sync Voice Output
                </button>
              </section>

              <div className="mt-auto p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-center gap-4">
                <Shield className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-xs font-bold uppercase text-blue-100">Global Protection</div>
                  <div className="text-[10px] opacity-60">Status: FULL ACCESS GRANTED</div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.4);
        }
      `}} />
    </div>
  );
}

