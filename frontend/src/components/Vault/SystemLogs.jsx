import { useState, useEffect, useRef } from 'react';

const LOG_TEMPLATES = [
  { prefix: '[SYS]', text: 'Initializing Nocturne Mainframe kernel modules...', type: 'info' },
  { prefix: '[SEC]', text: 'Scanning local socket interfaces: PORT 4000 active.', type: 'info' },
  { prefix: '[DB]', text: 'Reading database vault_store.json... 16 index records verified.', type: 'success' },
  { prefix: '[NET]', text: 'Socket handshake operator verification: authenticated.', type: 'success' },
  { prefix: '[NET]', text: 'Injected CORS policy: local domain allowances loaded.', type: 'info' },
  { prefix: '[SYS]', text: 'System load diagnostics: CPU 1.8%, Memory 24.8 MB, Temp 34°C.', type: 'info' },
  { prefix: '[SEC]', text: 'Intrusion prevention pipeline: 0 anomalies detected in packet log.', type: 'success' },
  { prefix: '[DB]', text: 'Automatic file sync completed. Backup write buffers flushed.', type: 'success' },
  { prefix: '[SYS]', text: 'Cache pipeline index flushed and re-allocated.', type: 'warn' },
  { prefix: '[DB]', text: 'Watcher thread spawned. Listening for real-time asset changes...', type: 'info' },
  { prefix: '[SYS]', text: 'Performing automated memory garbage collection loop...', type: 'info' },
  { prefix: '[SEC]', text: 'Operator authentication credential verified successfully.', type: 'success' },
  { prefix: '[NET]', text: 'Active sockets established: 2 sessions current.', type: 'info' },
  { prefix: '[SYS]', text: 'Background crawler check: no dead external references found.', type: 'success' }
];

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);


  // Initial seed logs
  useEffect(() => {
    const initialLogs = [
      { id: 1, prefix: '[SYS]', text: 'Booting Nocturne Kernel v2.0...', timestamp: new Date(Date.now() - 5000), type: 'info' },
      { id: 2, prefix: '[SEC]', text: 'Operator session authorization initiated.', timestamp: new Date(Date.now() - 4000), type: 'warn' },
      { id: 3, prefix: '[DB]', text: 'Connected to local JSON file repository storage.', timestamp: new Date(Date.now() - 3000), type: 'success' },
      { id: 4, prefix: '[SYS]', text: 'All sub-components online. Console ready.', timestamp: new Date(Date.now() - 1000), type: 'success' }
    ];
    setLogs(initialLogs);
  }, []);

  // Periodic log adding loop
  useEffect(() => {
    const interval = setInterval(() => {
      const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      setLogs((prev) => [
        ...prev.slice(-25), // Keep last 25 logs to prevent memory overflow
        {
          id: Date.now(),
          prefix: template.prefix,
          text: template.text,
          timestamp: new Date(),
          type: template.type
        }
      ]);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const containerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // If user scrolls up and leaves the bottom threshold (15px), disable auto-scroll
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 15;
    setShouldAutoScroll(isAtBottom);
  };

  // Auto scroll to bottom locally (prevents main page from scrolling down)
  useEffect(() => {
    if (shouldAutoScroll && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [logs, shouldAutoScroll]);

  return (
    <div className="h-full flex flex-col font-mono text-xs select-none">
      {/* Logger Window Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-nocturne-border bg-nocturne-darker">
        <span className="text-[10px] text-neon-green tracking-wider uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          SYSTEM_DIAGNOSTICS_STREAM
        </span>
        <span className="text-[9px] text-nocturne-muted">SYS.LOG</span>
      </div>

      {/* Scrolling Stream Content */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-1 bg-black/60 custom-scrollbar h-[230px]"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 leading-relaxed animate-fade-in text-[11px]">
            {/* Timestamp */}
            <span className="text-nocturne-muted flex-shrink-0">
              [{log.timestamp.toLocaleTimeString('en-US', { hour12: false })}]
            </span>
            
            {/* Prefix indicator */}
            <span className={
              log.type === 'success' ? 'text-neon-green' :
              log.type === 'warn' ? 'text-neon-amber' : 'text-neon-cyan'
            }>
              {log.prefix}
            </span>

            {/* Log text content */}
            <span className="text-white/90 truncate">
              {log.text}
            </span>
          </div>
        ))}

      </div>
    </div>
  );
}
