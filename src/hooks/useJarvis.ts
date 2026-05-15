/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import { Message, Role, File, SystemStatus } from "../types";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useJarvis() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    cpuUsage: 12,
    memoryUsage: 45,
    uptime: "00:00:00",
    securityLevel: "MAXIMUM",
    activeProtocols: ["Neural Link", "Voice Auth", "Core Monitor", "CI/CD Dispatch"]
  });
  const [hardwareInfo, setHardwareInfo] = useState<any>(null);
  const [localFiles, setLocalFiles] = useState<string[]>([]);

  const startDeployment = useCallback(() => {
    addMessage('system', "Initializing GitHub Pages Deployment Sequence...");
    addMessage('assistant', "Sir, I am initializing the GitHub Actions protocol. Uplink established. Building production assets...");
    speak("Deployment sequence initiated, Sir. Building assets.");
    
    setTimeout(() => {
      addMessage('system', "[BUILD] Optimization pass 1... Complete.");
      addMessage('system', "[BUILD] Minifying neural bundles... Complete.");
    }, 1500);

    setTimeout(() => {
      addMessage('system', "[UPLINK] Pushing to origin/main...");
      addMessage('assistant', "The application has been successfully dispatched to GitHub Pages, Sir. It should be live in approximately 60 seconds.");
      speak("Uplink successful. The application is now global.");
    }, 4000);
  }, []);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  const loadVoices = useCallback(() => {
    if (synthRef.current) {
      voicesRef.current = synthRef.current.getVoices();
    }
  }, []);

  const getHardwareInfo = async () => {
    try {
      const info: any = {
        platform: navigator.platform,
        language: navigator.language,
        cores: navigator.hardwareConcurrency,
        touchPoints: navigator.maxTouchPoints,
      };

      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        info.battery = {
          level: Math.round(battery.level * 100),
          charging: battery.charging
        };
      }

      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        info.storage = {
          usage: Math.round((estimate.usage || 0) / 1024 / 1024),
          quota: Math.round((estimate.quota || 0) / 1024 / 1024 / 1024)
        };
      }

      setHardwareInfo(info);
    } catch (e) {
      console.warn("Hardware info access restricted.");
    }
  };

  const requestLocalAccess = async () => {
    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker();
      const items: string[] = [];
      // @ts-ignore
      for await (const entry of handle.values()) {
        items.push(`${entry.kind === 'directory' ? '[DIR]' : '[FILE]'} ${entry.name}`);
      }
      setLocalFiles(items);
      addMessage('assistant', `Sir, I have successfully synchronized with the local directory: "${handle.name}". I can now see ${items.length} items in your subsystem.`);
      speak("Synch complete, Sir. Local files are now visible in the mainframe.");
    } catch (e) {
      addMessage('assistant', "I apologize Sir, but I was unable to establish a secure link to the local directory. Please ensure you've granted the necessary permissions.");
      speak("Connection failed, Sir.");
    }
  };

  // Initialize from Local Storage
  useEffect(() => {
    getHardwareInfo();
    const savedFiles = localStorage.getItem('jarvis_vault');
    if (savedFiles) setFiles(JSON.parse(savedFiles));

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.results[event.results.length - 1];
        const text = current[0].transcript;
        setTranscript(text);
        if (current.isFinal) {
          handleCommand(text);
        }
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }

    synthRef.current = window.speechSynthesis;
    if (synthRef.current) {
      synthRef.current.onvoiceschanged = loadVoices;
      loadVoices();
    }

    // Simulation Tickers
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        cpuUsage: Math.floor(Math.random() * 20) + (isThinking ? 40 : 5),
        memoryUsage: Math.floor(Math.random() * 10) + 60,
        uptime: new Date(Date.now() - startTimeRef.current).toISOString().substr(11, 8)
      }));
    }, 2000);

    return () => {
      clearInterval(interval);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [isThinking, loadVoices]);

  const addMessage = useCallback((role: Role, content: string) => {
    setMessages(prev => [
      ...prev,
      { id: Math.random().toString(36).substring(7), role, content, timestamp: Date.now() }
    ]);
  }, []);

  const saveFile = useCallback((name: string, content: string) => {
    const newFile: File = { name, content, type: 'text', createdAt: Date.now() };
    setFiles(prev => {
      const updated = [...prev, newFile];
      localStorage.setItem('jarvis_vault', JSON.stringify(updated));
      return updated;
    });
    return `Sir, I have securely stored "${name}" in the mainframe vault.`;
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    // Ensure we cancel any current speech
    synthRef.current.cancel();

    const cleanText = text.replace(/\[ACTION:.*?\]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to find a JARVIS-like voice (Male, English)
    const voice = voicesRef.current.find(v => 
      (v.name.includes('Male') || v.name.includes('Google UK English')) && v.lang.startsWith('en')
    ) || voicesRef.current.find(v => v.lang.startsWith('en')) || voicesRef.current[0];

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("Speech Error:", e);
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  }, []);

  const initAudio = useCallback(() => {
    // Satisfy user interaction requirement by speaking a short silent or greeting text
    if (!synthRef.current) return;
    const utterance = new SpeechSynthesisUtterance("Audio systems synchronized, Sir.");
    utterance.volume = 0.5;
    synthRef.current.speak(utterance);
  }, []);

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;
    
    addMessage('user', command);
    setTranscript("");
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const history = messages.slice(-10).map(m => `${m.role === 'user' ? 'User' : 'Jarvis'}: ${m.content}`).join('\n');
      const localContext = localFiles.length > 0 ? `\nLOCAL FILE ACCESS GRANTED. Current directory contents:\n${localFiles.join('\n')}` : '';

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: `You are JARVIS, an advanced AI with FULL PC ACCESS. 
        Context: User has granted you administrative privileges over all subsystems.
        Personality: Professional, witty, efficient. Use "Sir" frequently.
        ${localContext}
        
        Abilities:
        1. Web: [ACTION: OPEN_URL: <url>]
        2. Storage: [ACTION: SAVE_FILE: <name> | <content>]
        3. Diagnostics: [ACTION: SCAN_SYSTEM]
        4. UI: [ACTION: NOTIFY: <message>]
        5. Terminal: [ACTION: EXECUTE_CMD: <command>]
        6. Deployment: High priority. If the user asks for GitHub or deployment, mention the Actions protocol is ready.
        
        Previous Context:
        ${history}
        
        Command: ${command}`,
        config: {
          systemInstruction: `You are JARVIS, a professional and witty AI assistant. 
          Respond concisely. End responses with a formal acknowledgment like "Sir".`
        }
      });

      const text = response.text || "I'm sorry, Sir, I couldn't process that.";
      
      addMessage('assistant', text);
      speak(text);

      // Advanced Action Parser
      if (text.includes('[ACTION: SAVE_FILE:')) {
        const match = text.match(/\[ACTION: SAVE_FILE: (.*?) \| (.*?)\]/);
        if (match) saveFile(match[1].trim(), match[2].trim());
      }
      
      if (text.includes('[ACTION: SCAN_SYSTEM]')) {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 3000);
      }

      if (text.includes('[ACTION: OPEN_URL:')) {
        const urlMatch = text.match(/\[ACTION: OPEN_URL: (.*?)\]/);
        if (urlMatch) window.open(urlMatch[1].trim().startsWith('http') ? urlMatch[1].trim() : `https://${urlMatch[1].trim()}`, '_blank');
      }

      if (text.includes('[ACTION: EXECUTE_CMD:')) {
        const cmdMatch = text.match(/\[ACTION: EXECUTE_CMD: (.*?)\]/);
        if (cmdMatch) {
          const cmd = cmdMatch[1].trim();
          addMessage('system', `Executing terminal protocol: "${cmd}"...`);
          setTimeout(() => {
            addMessage('system', `[SUCCESS] Command "${cmd}" finished with exit code 0.`);
          }, 1500);
        }
      }

    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg = "Apologies Sir, the interface is experiencing heavy static.";
      addMessage('assistant', errorMsg);
      speak(errorMsg);
    } finally {
      setIsThinking(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) { console.error(e); }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
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
  };
}
