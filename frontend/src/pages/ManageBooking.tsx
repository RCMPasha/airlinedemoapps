import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid,
  Alert, Divider, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress
} from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

export default function ManageBooking() {
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<any>(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState('');

  const handleSearch = () => {
    if (!pnr.trim()) { setError('Please enter a valid PNR.'); return; }
    setLoading(true); setError(''); setBooking(null); setCancelSuccess('');

    axios.get(`/api/bookings/${pnr}`, { params: { last_name: lastName } })
      .then(res => setBooking(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Booking not found. Please check your details.'))
      .finally(() => setLoading(false));
  };

  const handleCancel = () => {
    setCancelLoading(true);
    axios.post(`/api/bookings/${booking.pnr}/cancel`, null, { params: { reason: cancelReason } })
      .then(res => {
        setCancelSuccess(res.data.message);
        setCancelOpen(false);
        return axios.get(`/api/bookings/${pnr}`, { params: { last_name: lastName } });
      })
      .then(res => setBooking(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to cancel booking.'))
      .finally(() => setCancelLoading(false));
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 4 }, py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }} color="primary">Manage Booking</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View or cancel your upcoming Meridian Airways flights.
      </Typography>

      <Card sx={{ mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} sx={{ alignItems: 'flex-end' }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField fullWidth label="Booking Reference (PNR)" placeholder="e.g. PNR4829"
                value={pnr} onChange={e => setPnr(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField fullWidth label="Last Name or Email" placeholder="Passenger last name"
                value={lastName} onChange={e => setLastName(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button fullWidth variant="contained" color="secondary" size="large"
                sx={{ height: 56, fontWeight: 700 }} onClick={handleSearch} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Find'}
              </Button>
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
          {cancelSuccess && <Alert severity="success" sx={{ mt: 3 }}>{cancelSuccess}</Alert>}
        </CardContent>
      </Card>

      {booking && (
        <Card sx={{ borderTop: '4px solid #08122a' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ bgcolor: '#f5f7fa', px: 4, py: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }} color="primary">
                  Booking Ref: {booking.pnr}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Passenger: {booking.customer?.first_name} {booking.customer?.last_name}
                </Typography>
              </Box>
              <Chip label={booking.status} color={booking.status === 'Confirmed' ? 'success' : 'warning'} sx={{ fontWeight: 700 }} />
            </Box>

            <Divider />

            <Box sx={{ p: 4 }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 2 }}>Flight Itinerary</Typography>
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800 }} color="primary">{booking.flight?.origin}</Typography>
                      <Typography variant="body2">{booking.flight ? format(parseISO(booking.flight.departure_time), 'HH:mm') : ''}</Typography>
                      <Typography variant="caption" color="text.secondary">{booking.flight ? format(parseISO(booking.flight.departure_time), 'dd MMM yyyy') : ''}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, position: 'relative', minWidth: 80 }}>
                      <Divider sx={{ borderStyle: 'dashed', borderColor: '#c49a45' }} />
                      <Typography variant="caption" sx={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', bgcolor: 'white', px: 1, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        {booking.flight?.flight_number}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800 }} color="primary">{booking.flight?.destination}</Typography>
                      <Typography variant="body2">{booking.flight ? format(parseISO(booking.flight.arrival_time), 'HH:mm') : ''}</Typography>
                      <Typography variant="caption" color="text.secondary">{booking.flight ? format(parseISO(booking.flight.arrival_time), 'dd MMM yyyy') : ''}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 2 }}>Booking Details</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EventSeatIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{booking.cabin_class}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Total Paid: ${booking.total_amount}</Typography>

                  {booking.status === 'Confirmed' && (
                    <Button variant="outlined" color="error" startIcon={<CancelIcon />} fullWidth onClick={() => setCancelOpen(true)}>
                      Cancel Booking
                    </Button>
                  )}
                  {booking.status === 'Refund Requested' && (
                    <Alert severity="info" sx={{ p: 1, '& .MuiAlert-message': { fontSize: '0.8rem' } }}>
                      Cancellation processing. Our AI agents are calculating your refund.
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Are you sure you want to cancel booking <strong>{booking?.pnr}</strong>?
            Depending on your cabin class ({booking?.cabin_class}), cancellation fees may apply.
          </Typography>
          <TextField fullWidth multiline rows={2} label="Reason for cancellation (optional)"
            value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setCancelOpen(false)} color="inherit">Keep Booking</Button>
          <Button variant="contained" color="error" onClick={handleCancel} disabled={cancelLoading}>
            {cancelLoading ? 'Processing...' : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
