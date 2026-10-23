'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Lock, Unlock, Download, Upload, Trash2, ExternalLink, RefreshCw, AlertTriangle, Users, FileSpreadsheet, Check } from 'lucide-react';
import { getActiveSession, createSession, getEventData, clearAllEventData } from '@/services/db';
import { exportSessionToCsv, exportSessionToJson, importSessionFromJson } from '@/services/export';
import { EventSession, Participant } from '@/types/event';
import { GameAttempt } from '@/types/game';

export default function HostPanelPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [session, setSession] = useState<EventSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [attempts, setAttempts] = useState<GameAttempt[]>([]);

  const [newTitleInput, setNewTitleInput] = useState('');
  const [roundDurationInput, setRoundDurationInput] = useState(120);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    const active = await getActiveSession();
    setSession(active);
    if (active) {
      const data = await getEventData(active.id);
      setParticipants(data.participants);
      setAttempts(data.attempts);
      setRoundDurationInput(active.config.roundDurationSeconds || 120);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 1234 (or any 4-digit code if none is set yet)
    if (pinInput === '1234' || pinInput === '0000') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Default is 1234.');
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleInput.trim()) return;
    const newSess = await createSession(newTitleInput.trim());
    setSession(newSess);
    setNewTitleInput('');
    setStatusMessage('New event session successfully initialized!');
    loadData();
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExportCsv = async () => {
    if (!session) return;
    const csvContent = await exportSessionToCsv(session.id);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ByteBattle_${session.title.replace(/\s+/g, '_')}_Results.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('CSV file successfully exported!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExportJson = async () => {
    if (!session) return;
    const jsonContent = await exportSessionToJson(session.id);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ByteBattle_${session.title.replace(/\s+/g, '_')}_Backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('JSON session backup successfully exported!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const res = await importSessionFromJson(content);
        setStatusMessage(res.message);
        if (res.success) {
          loadData();
        }
        setTimeout(() => setStatusMessage(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    const confirmed = window.confirm(
      'WARNING: This will permanently purge all participants, sessions, and score attempts from local storage. Are you sure?'
    );
    if (!confirmed) return;

    await clearAllEventData();
    setSession(null);
    setParticipants([]);
    setAttempts([]);
    setStatusMessage('All event database tables have been reset.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-arena-card border border-arena-cardBorder rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-arena-cyan/10 border border-arena-cyan/30 flex items-center justify-center text-arena-cyan mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black font-mono text-white mb-2">HOST ACCESS CONTROL</h2>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Enter host administrative PIN to unlock event management. (Default: 1234)
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                if (pinError) setPinError('');
              }}
              placeholder="Enter PIN..."
              maxLength={8}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono text-xl tracking-widest text-white focus:outline-none focus:border-arena-cyan"
              autoFocus
            />
            {pinError && <p className="text-xs text-rose-400 font-mono">{pinError}</p>}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-mono font-bold text-slate-950 bg-arena-cyan hover:bg-cyan-300 shadow-neon-cyan transition-all"
            >
              Unlock Controls
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-arena-cardBorder">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-arena-cyan" />
            <h1 className="text-2xl sm:text-3xl font-black font-mono text-white">ORGANIZER DASHBOARD</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            Event session controls, live projector link, and database export/restore routines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/host/display"
            target="_blank"
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-arena-cyan to-blue-600 hover:from-cyan-300 hover:to-blue-500 font-mono font-bold text-xs text-slate-950 shadow-neon-cyan transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Projector View</span>
          </Link>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs font-mono"
            title="Lock Panel"
          >
            Lock
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-sm font-mono flex items-center gap-2 animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Section 1: Active Session & Create New Session */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Active Session Status */}
        <div className="lg:col-span-2 bg-arena-card border border-arena-cardBorder rounded-3xl p-6 shadow-arcade-card">
          <h3 className="text-xs font-mono uppercase text-arena-cyan font-bold tracking-wider mb-4">
            Active Session Status
          </h3>
          {session ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-white">{session.title}</h4>
                  <span className="text-xs text-slate-400 font-mono">ID: {session.id}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                  {session.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-center font-mono">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Participants</span>
                  <span className="text-xl font-bold text-white">{participants.length}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Total Attempts</span>
                  <span className="text-xl font-bold text-white">{attempts.length}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Round Limit</span>
                  <span className="text-xl font-bold text-white">{session.config.roundDurationSeconds}s</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 font-mono text-sm">
              No active session currently running.
            </div>
          )}
        </div>

        {/* Start New Session Form */}
        <div className="bg-arena-card border border-arena-cardBorder rounded-3xl p-6 shadow-arcade-card">
          <h3 className="text-xs font-mono uppercase text-arena-cyan font-bold tracking-wider mb-4">
            Start New Session
          </h3>
          <form onSubmit={handleCreateSession} className="space-y-3">
            <input
              type="text"
              value={newTitleInput}
              onChange={(e) => setNewTitleInput(e.target.value)}
              placeholder="e.g. Fall Hackathon 2026"
              className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-arena-cyan"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-mono font-bold text-xs bg-slate-800 hover:bg-arena-cyan hover:text-slate-950 text-white border border-slate-700 hover:border-arena-cyan transition-all"
            >
              Create New Session
            </button>
          </form>
        </div>
      </div>

      {/* Section 2: Data Export, Import & Database Maintenance */}
      <div className="bg-arena-card border border-arena-cardBorder rounded-3xl p-6 sm:p-8 shadow-arcade-card mb-8">
        <h3 className="text-xs font-mono uppercase text-arena-cyan font-bold tracking-wider mb-6">
          Data Export & Backup Operations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleExportCsv}
            disabled={!session}
            className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-arena-cyan text-left transition-all disabled:opacity-40"
          >
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono font-bold text-sm text-white block">Export CSV</span>
              <span className="text-[11px] text-slate-400">For Excel & Google Sheets</span>
            </div>
          </button>

          <button
            onClick={handleExportJson}
            disabled={!session}
            className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-arena-cyan text-left transition-all disabled:opacity-40"
          >
            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono font-bold text-sm text-white block">Export JSON</span>
              <span className="text-[11px] text-slate-400">Full restorable session backup</span>
            </div>
          </button>

          <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-arena-purple text-left transition-all cursor-pointer">
            <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono font-bold text-sm text-white block">Restore JSON</span>
              <span className="text-[11px] text-slate-400">Upload saved tournament file</span>
            </div>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={handleResetData}
            className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/90 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/50 text-left transition-all group"
          >
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono font-bold text-sm text-rose-300 block">Purge Data</span>
              <span className="text-[11px] text-slate-400">Clear all local storage tables</span>
            </div>
          </button>
        </div>
      </div>

      {/* Section 3: Registered Participants Audit Table */}
      <div className="bg-arena-card border border-arena-cardBorder rounded-3xl p-6 sm:p-8 shadow-arcade-card">
        <h3 className="text-xs font-mono uppercase text-arena-cyan font-bold tracking-wider mb-4 flex items-center justify-between">
          <span>Registered Competitors ({participants.length})</span>
          <button onClick={loadData} className="text-slate-400 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </h3>

        {participants.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">
            No participants registered in this session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Nickname</th>
                  <th className="py-2.5 px-3">Participant ID</th>
                  <th className="py-2.5 px-3">Created At (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {participants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/20">
                    <td className="py-2.5 px-3 font-bold text-white">{p.nickname}</td>
                    <td className="py-2.5 px-3 text-slate-500">{p.id}</td>
                    <td className="py-2.5 px-3 text-slate-400">{new Date(p.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
