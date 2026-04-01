import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

interface LogEntry {
  id: number;
  time: string;
  level: "log" | "info" | "warn" | "error";
  message: string;
  stack?: string;
}

let logId = 0;

const levelColor: Record<LogEntry["level"], string> = {
  log: "text-gray-300",
  info: "text-blue-400",
  warn: "text-amber-400",
  error: "text-red-400",
};

const levelBg: Record<LogEntry["level"], string> = {
  log: "bg-white/4",
  info: "bg-blue-500/8",
  warn: "bg-amber-500/10",
  error: "bg-red-500/12",
};

const levelBadge: Record<LogEntry["level"], string> = {
  log: "bg-gray-700 text-gray-300",
  info: "bg-blue-500/20 text-blue-300",
  warn: "bg-amber-500/20 text-amber-300",
  error: "bg-red-500/20 text-red-300",
};

function formatArgs(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === "string") return a;
      try {
        return JSON.stringify(a, null, 2);
      } catch {
        return String(a);
      }
    })
    .join(" ");
}

const globalLogs: LogEntry[] = [];
const listeners: Set<(logs: LogEntry[]) => void> = new Set();

function addLog(level: LogEntry["level"], args: unknown[], stack?: string) {
  const now = new Date();
  const time = now.toTimeString().slice(0, 8) + "." + String(now.getMilliseconds()).padStart(3, "0");
  const entry: LogEntry = {
    id: ++logId,
    time,
    level,
    message: formatArgs(args),
    stack,
  };
  globalLogs.push(entry);
  if (globalLogs.length > 500) globalLogs.splice(0, globalLogs.length - 500);
  listeners.forEach((fn) => fn([...globalLogs]));
}

// Patch console methods once
let patched = false;
function patchConsole() {
  if (patched || typeof window === "undefined") return;
  patched = true;

  const originalLog = console.log.bind(console);
  const originalInfo = console.info.bind(console);
  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);

  console.log = (...args: unknown[]) => {
    originalLog(...args);
    addLog("log", args);
  };
  console.info = (...args: unknown[]) => {
    originalInfo(...args);
    addLog("info", args);
  };
  console.warn = (...args: unknown[]) => {
    originalWarn(...args);
    addLog("warn", args);
  };
  console.error = (...args: unknown[]) => {
    originalError(...args);
    addLog("error", args);
  };

  // Capture unhandled errors
  window.addEventListener("error", (e) => {
    addLog("error", [`[Unhandled Error] ${e.message}`, `${e.filename}:${e.lineno}:${e.colno}`], e.error?.stack);
  });

  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    const msg = reason instanceof Error ? reason.message : String(reason);
    addLog("error", [`[Unhandled Promise Rejection] ${msg}`], reason instanceof Error ? reason.stack : undefined);
  });

  // Capture fetch errors by wrapping fetch
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
    const shortUrl = url.length > 80 ? url.slice(0, 80) + "…" : url;
    try {
      const res = await originalFetch(...args);
      if (!res.ok) {
        addLog("warn", [`[Fetch ${res.status}] ${shortUrl}`]);
      } else {
        addLog("info", [`[Fetch OK ${res.status}] ${shortUrl}`]);
      }
      return res;
    } catch (err: unknown) {
      addLog("error", [`[Fetch Error] ${shortUrl}`, err instanceof Error ? err.message : String(err)]);
      throw err;
    }
  };
}

export default function LiveLogs() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogEntry["level"] | "all">("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [warnCount, setWarnCount] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(false);

  // Patch console on mount
  useEffect(() => {
    patchConsole();
    // Subscribe to log updates
    const handler = (newLogs: LogEntry[]) => {
      setLogs([...newLogs]);
      setErrorCount(newLogs.filter((l) => l.level === "error").length);
      setWarnCount(newLogs.filter((l) => l.level === "warn").length);
    };
    listeners.add(handler);
    // Initialize with existing logs
    setLogs([...globalLogs]);
    setErrorCount(globalLogs.filter((l) => l.level === "error").length);
    setWarnCount(globalLogs.filter((l) => l.level === "warn").length);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  // Auto-scroll when new logs arrive
  useEffect(() => {
    if (!open || minimized || !autoScroll) return;
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs, open, minimized, autoScroll]);

  // Scroll to bottom when opening
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      }, 50);
    }
    prevOpenRef.current = open;
  }, [open]);

  const filtered = filter === "all" ? logs : logs.filter((l) => l.level === filter);

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 60);
  };

  const clearLogs = () => {
    globalLogs.length = 0;
    setLogs([]);
    setErrorCount(0);
    setWarnCount(0);
    listeners.forEach((fn) => fn([]));
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => { setOpen((v) => !v); setMinimized(false); }}
        className="fixed bottom-20 right-4 z-[9999] flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1a1d27] border border-white/10 shadow-lg text-xs font-mono hover:bg-[#22263a] transition-colors"
        title="Открыть Live Logs"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-gray-300">Logs</span>
        {errorCount > 0 && (
          <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-[10px] font-bold">{errorCount} ERR</span>
        )}
        {errorCount === 0 && warnCount > 0 && (
          <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-bold">{warnCount} WARN</span>
        )}
      </button>

      {/* Log panel */}
      {open && (
        <div
          className={`fixed right-4 z-[9998] bg-[#0d0f18] border border-white/10 rounded-2xl shadow-2xl flex flex-col font-mono text-xs transition-all ${
            minimized ? "bottom-32 w-72 h-10" : "bottom-32 w-[540px] max-w-[95vw] h-[420px]"
          }`}
          style={{ maxHeight: "calc(100vh - 160px)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/8 flex-shrink-0">
            <span className="text-gray-400 font-semibold tracking-wide text-[11px] flex-1">● LIVE LOGS</span>
            <span className="text-gray-600 text-[10px]">{logs.length} entries</span>

            {!minimized && (
              <>
                {/* Filter buttons */}
                {(["all", "error", "warn", "info", "log"] as const).map((lvl) => {
                  const count = lvl === "all" ? logs.length : logs.filter((l) => l.level === lvl).length;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setFilter(lvl)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        filter === lvl
                          ? "bg-violet-600 text-white"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {lvl === "all" ? "All" : lvl.toUpperCase()}
                      {count > 0 && <span className="ml-1 opacity-60">{count}</span>}
                    </button>
                  );
                })}

                {/* Clear */}
                <button
                  onClick={clearLogs}
                  className="p-1 rounded hover:bg-white/8 text-gray-500 hover:text-gray-300 transition-colors"
                  title="Очистить логи"
                >
                  <Icon name="Trash2" size={12} />
                </button>

                {/* Auto-scroll toggle */}
                <button
                  onClick={() => setAutoScroll((v) => !v)}
                  className={`p-1 rounded transition-colors ${autoScroll ? "text-emerald-400 hover:bg-emerald-500/10" : "text-gray-500 hover:bg-white/8"}`}
                  title={autoScroll ? "Автоскролл включён" : "Автоскролл выключен"}
                >
                  <Icon name="ArrowDownToLine" size={12} />
                </button>
              </>
            )}

            {/* Minimize */}
            <button
              onClick={() => setMinimized((v) => !v)}
              className="p-1 rounded hover:bg-white/8 text-gray-500 hover:text-gray-300 transition-colors"
              title={minimized ? "Развернуть" : "Свернуть"}
            >
              <Icon name={minimized ? "ChevronUp" : "ChevronDown"} size={12} />
            </button>

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded hover:bg-white/8 text-gray-500 hover:text-red-400 transition-colors"
              title="Закрыть"
            >
              <Icon name="X" size={12} />
            </button>
          </div>

          {/* Logs list */}
          {!minimized && (
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto overflow-x-hidden px-1 py-1 space-y-0.5"
            >
              {filtered.length === 0 && (
                <div className="text-center text-gray-600 py-10 text-[11px]">
                  Логи пока пустые
                </div>
              )}
              {filtered.map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded-lg px-2 py-1.5 cursor-pointer hover:brightness-110 transition-all ${levelBg[entry.level]}`}
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-gray-600 flex-shrink-0 mt-px text-[10px]">{entry.time}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${levelBadge[entry.level]}`}>
                      {entry.level.toUpperCase()}
                    </span>
                    <span className={`flex-1 break-all leading-relaxed ${levelColor[entry.level]} ${expandedId === entry.id ? "" : "line-clamp-2"}`}>
                      {entry.message}
                    </span>
                  </div>
                  {expandedId === entry.id && entry.stack && (
                    <pre className="mt-1.5 ml-10 text-[10px] text-gray-500 whitespace-pre-wrap break-all border-l border-white/10 pl-2">
                      {entry.stack}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer: auto-scroll indicator */}
          {!minimized && !autoScroll && (
            <button
              onClick={() => {
                setAutoScroll(true);
                if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
              }}
              className="flex-shrink-0 text-center py-1.5 text-[10px] text-violet-400 hover:text-violet-300 border-t border-white/8 transition-colors"
            >
              ↓ Прокрутить вниз
            </button>
          )}
        </div>
      )}
    </>
  );
}
