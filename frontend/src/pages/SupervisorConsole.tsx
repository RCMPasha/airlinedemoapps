import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Avatar, LinearProgress, Alert, Snackbar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import axios from 'axios';

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { color: 'warning' | 'success' | 'error' | 'info'; label: string }> = {
    Pending: { color: 'warning', label: 'Pending Review' },
    'Manual Review': { color: 'warning', label: 'Manual Review' },
    Approved: { color: 'success', label: 'Approved' },
    Rejected: { color: 'error', label: 'Rejected' },
  };
  const cfg = map[status] ?? { color: 'info', label: status };
  return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 700 }} />;
};

export default function SupervisorConsole() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [comments, setComments] = useState('');
  const [snack, setSnack] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRefunds = () => {
    axios.get('/api/refunds').then(res => {
      setRefunds(res.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchRefunds(); }, []);

  const pending = refunds.filter(r => ['Pending', 'Manual Review'].includes(r.status));
  const resolved = refunds.filter(r => ['Approved', 'Rejected'].includes(r.status));

  const openDialog = (id: number, act: 'approve' | 'reject') => {
    setSelectedId(id);
    setAction(act);
    setComments('');
    setOpen(true);
  };

  const submit = () => {
    if (!selectedId) return;
    axios.post(`/api/refunds/${selectedId}/${action}`, null, { params: { comments } })
      .then(() => {
        setOpen(false);
        setSnack(`Refund #${selectedId} ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
        fetchRefunds();
      });
  };

  const RefundCard = ({ r }: { r: any }) => (
    <Card sx={{ mb: 2, borderLeft: '4px solid', borderColor: r.human_approval_required ? '#e65100' : '#1565c0' }}>
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          {/* Info */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} color="primary">
                Refund Request #{r.id}
              </Typography>
              <StatusBadge status={r.status} />
              {r.human_approval_required && (
                <Chip label="Human Required" size="small" color="error" variant="outlined" sx={{ fontWeight: 700 }} />
              )}
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">REFUND AMOUNT</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }} color="secondary.main">${r.refund_amount}</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">BOOKING</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.booking?.pnr ?? `#${r.booking_id}`}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">REASON</Typography>
                <Typography variant="body2">{r.reason}</Typography>
              </Grid>
            </Grid>

            {/* AI box */}
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f4ff', borderRadius: 2, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Avatar sx={{ bgcolor: '#08122a', width: 32, height: 32 }}>
                <SmartToyIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }} color="primary">
                  AI Recommendation
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.3 }}>{r.ai_recommendation}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">Confidence</Typography>
                  <LinearProgress
                    variant="determinate" value={r.confidence_score ?? 0}
                    sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#dde3f0',
                      '& .MuiLinearProgress-bar': { bgcolor: r.confidence_score > 70 ? '#2e7d32' : '#e65100' }
                    }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.confidence_score}%</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Actions */}
          {['Pending', 'Manual Review'].includes(r.status) && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 1.5, justifyContent: 'center' }}>
                <Button fullWidth variant="contained" color="success" startIcon={<CheckCircleIcon />}
                  onClick={() => openDialog(r.id, 'approve')} sx={{ fontWeight: 700 }}>
                  Approve Refund
                </Button>
                <Button fullWidth variant="outlined" color="error" startIcon={<CancelIcon />}
                  onClick={() => openDialog(r.id, 'reject')} sx={{ fontWeight: 700 }}>
                  Reject
                </Button>
              </Box>
            </Grid>
          )}
          {['Approved', 'Rejected'].includes(r.status) && r.supervisor_comments && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>SUPERVISOR NOTE</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>{r.supervisor_comments}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }} color="primary">Supervisor Console</Typography>
        <Typography variant="body2" color="text.secondary">Human-in-the-Loop refund approval workflow</Typography>
      </Box>

      {/* Stats bar */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Pending Approval', value: pending.length, color: '#e65100' },
          { label: 'Total Requests', value: refunds.length, color: '#08122a' },
          { label: 'Approved', value: refunds.filter(r => r.status === 'Approved').length, color: '#2e7d32' },
          { label: 'Rejected', value: refunds.filter(r => r.status === 'Rejected').length, color: '#c62828' },
        ].map(s => (
          <Grid size={{ xs: 6, sm: 3 }} key={s.label}>
            <Card>
              <CardContent sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {loading ? (
        <LinearProgress color="secondary" />
      ) : (
        <>
          {pending.length > 0 ? (
            <>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }} color="primary">
                <HourglassEmptyIcon color="warning" /> Awaiting Your Decision ({pending.length})
              </Typography>
              {pending.map(r => <RefundCard key={r.id} r={r} />)}
            </>
          ) : (
            <Alert severity="success" sx={{ mb: 4 }}>No pending approvals — all caught up!</Alert>
          )}

          {resolved.length > 0 && (
            <>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 4 }} color="text.secondary">
                Resolved ({resolved.length})
              </Typography>
              {resolved.map(r => <RefundCard key={r.id} r={r} />)}
            </>
          )}
        </>
      )}

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: action === 'approve' ? '#e8f5e9' : '#ffebee', fontWeight: 700 }}>
          {action === 'approve' ? '✅ Approve Refund' : '❌ Reject Refund'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
            {action === 'approve'
              ? 'Approving this refund will initiate processing immediately.'
              : 'Please provide a reason for rejection (required).'}
          </Typography>
          <TextField fullWidth multiline rows={3} label="Comments / Reason"
            value={comments} onChange={e => setComments(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" color={action === 'approve' ? 'success' : 'error'}
            disabled={action === 'reject' && !comments.trim()} onClick={submit} sx={{ fontWeight: 700 }}>
            Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
