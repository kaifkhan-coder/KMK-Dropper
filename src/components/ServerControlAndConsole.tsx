import React, { useState } from 'react';
import { Terminal, Server, Play, Square, RefreshCw, Trash2, Filter, Wifi, Activity, Cpu, ArrowUpRight } from 'lucide-react';
import { TransferLog, ServerState, NetworkInterfaceInfo, LogLevel } from '../types';

interface ServerControlAndConsoleProps {
  serverState: ServerState;
  interfaces: NetworkInterfaceInfo[];
  logs: TransferLog[];
  progressPercent: number;
  progressMessage: string;
  onToggleServer: () => void;
  onPortChange: (port: number) => void;
  onInterfaceChange: (ifaceName: string) => void;
  onClearLogs: () => void;
  onSimulateMobileConnection: () => void;
}

export const ServerControlAndConsole: React.FC<ServerControlAndConsoleProps> = ({
  serverState,
  interfaces,
  logs,
  progressPercent,
  progressMessage,
  onToggleServer,
  onPortChange,
  onInterfaceChange,
  onClearLogs,
  onSimulateMobileConnection
}) => {
  const [selectedLogLevel, setSelectedLogLevel] = useState<LogLevel | 'ALL'>('ALL');
  const [tempPort, setTempPort] = useState(serverState.port.toString());

  const filteredLogs = selectedLogLevel === 'ALL'
    ? logs
    : logs.filter((l) => l.level === selectedLogLevel);

  const handlePortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(tempPort, 10);
    if (!isNaN(p) && p >= 1024 && p <= 65535) {
      onPortChange(p);
    } else {
      setTempPort(serverState.port.toString());
    }
  };

  const getLogBadgeColor = (level: LogLevel) => {
    switch (level) {
      case 'SECURE':
        return 'text-amber-400 bg-amber-950/70 border-amber-800/60';
      case 'HTTP':
        return 'text-cyan-400 bg-cyan-950/70 border-cyan-800/60';
      case 'ZIP':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-800/60';
      case 'DIRECT':
        return 'text-teal-400 bg-teal-950/70 border-teal-800/60';
      case 'ERROR':
        return 'text-rose-400 bg-rose-950/70 border-rose-800/60';
      case 'WARN':
        return 'text-yellow-400 bg-yellow-950/70 border-yellow-800/60';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col space-y-4">
      {/* Micro-Server Controls & Network Resolver Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center pb-3 border-b border-slate-800 text-xs font-mono">
        {/* Network Resolver Interface Selector */}
        <div className="lg:col-span-4 flex items-center gap-2">
          <div className="text-slate-400 flex items-center gap-1.5 shrink-0">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span>Network Adapter:</span>
          </div>
          <select
            id="network-interface-selector"
            value={serverState.activeInterface}
            onChange={(e) => onInterfaceChange(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {interfaces.map((iface) => (
              <option key={iface.name} value={iface.name}>
                {iface.name} ({iface.ipv4}) - {iface.type}
              </option>
            ))}
          </select>
        </div>

        {/* Port Configuration */}
        <div className="lg:col-span-3 flex items-center gap-2">
          <div className="text-slate-400 shrink-0">Server Port:</div>
          <form onSubmit={handlePortSubmit} className="flex items-center gap-1 flex-1">
            <input
              id="server-port-input"
              type="number"
              min={1024}
              max={65535}
              value={tempPort}
              onChange={(e) => setTempPort(e.target.value)}
              onBlur={() => {
                const p = parseInt(tempPort, 10);
                if (!isNaN(p) && p >= 1024 && p <= 65535) onPortChange(p);
              }}
              className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-amber-500 text-center"
            />
            <button
              type="submit"
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px]"
              title="Apply Port"
            >
              Set
            </button>
          </form>
        </div>

        {/* Micro-Server Toggle & Status */}
        <div className="lg:col-span-5 flex items-center justify-end gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Activity className={`w-3.5 h-3.5 ${serverState.isRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-slate-400">
              Clients: <span className="text-emerald-400 font-bold">{serverState.activeConnections}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Transfers: <span className="text-amber-400 font-bold">{serverState.totalTransfersCompleted}</span>
            </span>
          </div>

          <button
            id="btn-simulate-mobile-request"
            onClick={onSimulateMobileConnection}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs rounded border border-slate-700 transition"
            title="Simulate a mobile phone scanning the QR code and requesting the download stream"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Simulate Mobile Scan</span>
          </button>

          <button
            id="btn-toggle-server"
            onClick={onToggleServer}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
              serverState.isRunning
                ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
            }`}
          >
            {serverState.isRunning ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>Stop Server</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Start Server</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar Display */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            Status: <span className="text-slate-200">{progressMessage || (serverState.isRunning ? 'Micro-Server listening on socket' : 'Server halted')}</span>
          </span>
          <span className="text-amber-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-200 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive Log Console Pane */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold uppercase tracking-wider text-slate-300">
              Real-Time Transfer Logs & Event Console
            </span>
            <span className="text-slate-500 text-[11px]">({filteredLogs.length} events)</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[10px]">
              <Filter className="w-3 h-3 text-slate-500 ml-1" />
              {(['ALL', 'SECURE', 'HTTP', 'ZIP', 'WARN', 'ERROR'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLogLevel(lvl)}
                  className={`px-1.5 py-0.5 rounded transition ${
                    selectedLogLevel === lvl
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={onClearLogs}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition"
              title="Clear Console Logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Terminal Output */}
        <div
          id="java-console-output"
          className="h-48 overflow-y-auto bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1 select-text scrollbar-thin scrollbar-thumb-slate-800"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 italic py-4 text-center">
              No log messages matching filter criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed hover:bg-slate-900/50 px-1 rounded">
                <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold shrink-0 ${getLogBadgeColor(log.level)}`}>
                  {log.level}
                </span>
                <span className="text-slate-500 shrink-0 font-medium">[{log.tag}]</span>
                <span className="text-slate-200 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
