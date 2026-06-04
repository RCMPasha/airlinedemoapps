import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Chip, CircularProgress
} from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

const SAMPLE_COMMANDS = [
  'Refund booking PNR002',
  'Check eligibility for PNR005',
  'Show audit trail for booking #3',
  'Approve refund for PNR001',
  'What is the fraud risk for PNR004?',
];

const agentColor: Record<string, string> = {
  'Booking Agent': '#1565c0',
  'Policy Agent': '#6a1b9a',
  'Eligibility Agent': '#2e7d32',
  'Risk Agent': '#e65100',
  'Approval Agent': '#c49a45',
  'Supervisor': '#08122a',
};

export default function AIOpsConsole() {
  const [logs, setLogs] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchLogs = () => {
    axios.get('/api/audit-logs').then(res => {
      setLogs(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSend = () => {
    if (!query.trim()) return;
    setQuery('');
    // Simulate a response entry
    fetchLogs();
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <TerminalIcon color="secondary" sx={{ fontSize: 30 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }} color="primary">AIOps Agent Console</Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor agent reasoning, tool calls, policy evaluations, and decisions in real-time
          </Typography>
        </Box>
        <Chip label="● LIVE" size="small" sx={{ ml: 'auto', bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700, animation: 'pulse 2s infinite' }} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 340px' }, gap: 3 }}>
        {/* Audit Log Feed */}
        <Card sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} color="primary">Audit Trail</Typography>
            <Button size="small" onClick={fetchLogs} sx={{ fontWeight: 600, fontSize: '0.75rem' }}>↻ Refresh</Button>
          </Box>

          {/* Terminal-style log area */}
          <Box sx={{
            bgcolor: '#0d1117', flex: 1,
            minHeight: 500, maxHeight: 600, overflowY: 'auto',
            p: 2.5, fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} sx={{ color: '#c49a45' }} />
              </Box>
            ) : logs.length === 0 ? (
              <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>No audit records found.</Typography>
            ) : (
              logs.map((log) => {
                const color = agentColor[log.agent_name] ?? '#c49a45';
                return (
                  <Box key={log.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {/* Timestamp + agent */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography sx={{ color: '#666', fontSize: '0.72rem', fontFamily: 'inherit' }}>
                        [{format(parseISO(log.timestamp), 'HH:mm:ss')}]
                      </Typography>
                      <Box sx={{
                        px: 1, py: 0.2, borderRadius: 0.5, fontSize: '0.7rem', fontWeight: 700,
                        bgcolor: color + '22', color: color, fontFamily: 'inherit'
                      }}>
                        {log.agent_name}
                      </Box>
                      <Typography sx={{ color: '#58a6ff', fontSize: '0.78rem', fontFamily: 'inherit', fontWeight: 600 }}>
                        {log.action}
                      </Typography>
                    </Box>
                    {/* Decision */}
                    <Typography sx={{ color: '#3fb950', fontSize: '0.75rem', fontFamily: 'inherit', ml: 1, mb: 0.3 }}>
                      → Decision: {log.decision}
                    </Typography>
                    {/* Inputs */}
                    <Typography sx={{ color: '#8b949e', fontSize: '0.72rem', fontFamily: 'inherit', ml: 1, mb: 0.3 }}>
                      ↳ In: {log.inputs}
                    </Typography>
                    {/* Outputs */}
                    <Typography sx={{ color: '#c49a45', fontSize: '0.72rem', fontFamily: 'inherit', ml: 1 }}>
                      ↳ Out: {log.outputs}
                    </Typography>
                  </Box>
                );
              })
            )}
            <div ref={bottomRef} />
          </Box>

          {/* Command input */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, bgcolor: '#0d1117' }}>
            <TextField
              fullWidth
              size="small"
              placeholder='Enter natural language command e.g. "Refund booking PNR002"'
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#161b22', color: '#c9d1d9', borderColor: '#30363d',
                  fontFamily: '"JetBrains Mono","Fira Code",monospace', fontSize: '0.82rem',
                  '& fieldset': { borderColor: '#30363d' },
                  '&:hover fieldset': { borderColor: '#c49a45' },
                  '&.Mui-focused fieldset': { borderColor: '#c49a45' },
                },
              }}
            />
            <Button variant="contained" color="secondary" onClick={handleSend} sx={{ fontWeight: 700, px: 2 }}>
              <SendIcon sx={{ fontSize: 18 }} />
            </Button>
          </Box>
        </Card>

        {/* Right panel */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Quick commands */}
          <Card>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem' }} color="primary">
                Sample Commands
              </Typography>
            </Box>
            <CardContent sx={{ p: 2 }}>
              {SAMPLE_COMMANDS.map((cmd, i) => (
                <Box
                  key={i}
                  onClick={() => setQuery(cmd)}
                  sx={{
                    p: 1.5, mb: 1, bgcolor: '#f5f7fa', borderRadius: 1.5, cursor: 'pointer',
                    fontFamily: '"JetBrains Mono","Fira Code",monospace', fontSize: '0.75rem',
                    color: '#08122a', border: '1px solid transparent',
                    '&:hover': { borderColor: '#c49a45', bgcolor: '#fff8ec' },
                    transition: 'all 0.15s',
                  }}
                >
                  &gt; {cmd}
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem' }} color="primary">
                Activity Summary
              </Typography>
            </Box>
            <CardContent>
              {[
                { label: 'Total Log Entries', value: logs.length },
                { label: 'Unique Agents', value: [...new Set(logs.map(l => l.agent_name))].length },
                { label: 'Auto-Approved', value: logs.filter(l => l.decision.toLowerCase().includes('approved')).length },
                { label: 'Escalations', value: logs.filter(l => l.decision.toLowerCase().includes('manual') || l.decision.toLowerCase().includes('escalat')).length },
              ].map(s => (
                <Box key={s.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} color="primary">{s.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
