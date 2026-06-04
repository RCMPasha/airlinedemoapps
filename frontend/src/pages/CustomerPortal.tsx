import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField,
  Button, Chip, Divider, MenuItem, CircularProgress, Alert,
  ToggleButtonGroup, ToggleButton, InputAdornment, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO, differenceInMinutes } from 'date-fns';

const statusColor: Record<string, any> = {
  Scheduled: 'success', Boarding: 'success', 'In Air': 'info',
  Delayed: 'warning', Cancelled: 'error', Landed: 'default',
};

function formatDuration(dep: string, arr: string) {
  const mins = differenceInMinutes(parseISO(arr), parseISO(dep));
  const h = Math.floor(Math.abs(mins) / 60);
  const m = Math.abs(mins) % 60;
  return `${h}h ${m}m`;
}

// Popular routes with confirmed earliest available dates from DB
const today = new Date();
const addD = (d: number) => new Date(today.getTime() + d * 86400000).toISOString().split('T')[0];

const POPULAR_ROUTES = [
  { from: 'DXB', to: 'LHR', label: 'Dubai → London',     price: 'from $420', img: '✈️', date: addD(2) },
  { from: 'DXB', to: 'JFK', label: 'Dubai → New York',   price: 'from $488', img: '🗽', date: addD(5) },
  { from: 'SIN', to: 'SYD', label: 'Singapore → Sydney', price: 'from $310', img: '🦘', date: addD(8) },
  { from: 'CDG', to: 'FRA', label: 'Paris → Frankfurt',  price: 'from $150', img: '🗼', date: addD(1) },
  { from: 'NRT', to: 'DXB', label: 'Tokyo → Dubai',      price: 'from $199', img: '🗾', date: addD(4) },
  { from: 'LHR', to: 'JFK', label: 'London → New York',  price: 'from $380', img: '🎡', date: addD(6) },
];

function FlightCard({ flight, onBook }: { flight: any; onBook: () => void }) {
  const dep = parseISO(flight.departure_time);
  const arr = parseISO(flight.arrival_time);
  return (
    <Card sx={{
      height: '100%', transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.13)' },
    }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1 }} color="secondary.main">
            {flight.flight_number}
          </Typography>
          <Chip label={flight.status} size="small" color={statusColor[flight.status] ?? 'default'} sx={{ height: 20, fontSize: '0.65rem' }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }} color="primary">{flight.origin}</Typography>
            <Typography variant="caption" color="text.secondary">{format(dep, 'HH:mm')}</Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center', px: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
              <AccessTimeIcon sx={{ fontSize: 10 }} />{formatDuration(flight.departure_time, flight.arrival_time)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', my: 0.3 }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
              <FlightTakeoffIcon sx={{ fontSize: 14, color: '#c49a45', mx: 0.5 }} />
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
            </Box>
            <Typography variant="caption" color="text.secondary">{flight.aircraft_type?.split(' ').pop()}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }} color="primary">{flight.destination}</Typography>
            <Typography variant="caption" color="text.secondary">{format(arr, 'HH:mm')}</Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {format(dep, 'EEE, dd MMM yyyy')}
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }} color="secondary.main">${Math.round(flight.base_price)}</Typography>
            <Typography variant="caption" color="text.secondary">per person</Typography>
          </Box>
          <Button size="small" variant="contained" color="secondary" onClick={onBook}
            startIcon={<AirplaneTicketIcon sx={{ fontSize: 14 }} />}
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
            Select
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function CustomerPortal() {
  const navigate = useNavigate();
  const [allFlights, setAllFlights] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [bookingFlight, setBookingFlight] = useState<any>(null);
  const [bookingStep, setBookingStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const todayDate = new Date().toISOString().split('T')[0];

  // Prefilled to earliest available DXB→LHR
  const [tripType, setTripType] = useState<'oneway' | 'return' | 'multicity'>('oneway');
  const [origin, setOrigin] = useState('DXB');
  const [destination, setDestination] = useState('LHR');
  const [depDate, setDepDate] = useState(addD(2));
  const [retDate, setRetDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('');
  const [dateRange, setDateRange] = useState(7);

  useEffect(() => {
    axios.get('/api/flights?limit=1000').then(res => {
      const nonCancelled = res.data.filter((f: any) => f.status !== 'Cancelled');
      setAllFlights(nonCancelled);
      setFiltered(nonCancelled.filter((f: any) => f.status === 'Scheduled').slice(0, 6));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const swap = () => { setOrigin(destination); setDestination(origin); };

  const matchesDateRange = (flightISO: string, searchDate: string, rangeDays: number) => {
    if (!searchDate) return true;
    const flightDay = flightISO.substring(0, 10);
    const fd = new Date(flightDay);
    const sd = new Date(searchDate);
    const diffDays = Math.abs((fd.getTime() - sd.getTime()) / 86400000);
    return diffDays <= rangeDays;
  };

  const doSearch = (fromVal: string, toVal: string, depVal: string, rangeDays: number): any[] => {
    let results = allFlights;
    if (fromVal.trim()) results = results.filter(f => f.origin.toUpperCase() === fromVal.trim().toUpperCase());
    if (toVal.trim()) results = results.filter(f => f.destination.toUpperCase() === toVal.trim().toUpperCase());
    if (depVal) results = results.filter(f => matchesDateRange(f.departure_time, depVal, rangeDays));
    return results.slice(0, 24);
  };

  const handleSearch = () => {
    setFiltered(doSearch(origin, destination, depDate, dateRange));
    setSearched(true);
  };

  const quickSearch = (from: string, to: string, date: string) => {
    setOrigin(from); setDestination(to); setDepDate(date); setDateRange(7);
    const results = doSearch(from, to, date, 7);
    setFiltered(results.length ? results : allFlights.slice(0, 6));
    setSearched(true);
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const handleBook = async () => {
    setIsProcessing(true);
    try {
      const res = await axios.post('/api/bookings', {
        customer_id: 1, // Mock user ID
        flight_id: bookingFlight.id,
        cabin_class: cabinClass || 'Economy Flex',
        passengers: passengers
      });
      setBookingResult(res.data);
      setBookingStep(2);
    } catch (e) {
      alert('Booking failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fieldSx = { '& .MuiInputLabel-root': { background: 'white', px: 0.5 } };

  return (
    <Box>
      {/* ── HERO ─────────────────────────────────────── */}
      <Box sx={{
        position: 'relative',
        minHeight: { xs: 560, md: 640 },
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover', backgroundPosition: 'center 40%',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
        alignItems: 'center', pt: { xs: 4, md: 6 }, pb: { xs: 2, md: 4 },
      }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,18,42,0.55) 0%, rgba(8,18,42,0.82) 100%)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', px: 3, mb: 3, maxWidth: 700 }}>
          <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, mb: 1.5, fontSize: { xs: '1.8rem', md: '3rem' } }}>
            Elevate Your Journey
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, opacity: 0.88, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            Premium flights worldwide. Powered by Meridian Airways.
          </Typography>
        </Box>

        {/* ── SEARCH WIDGET ────────────────────────── */}
        <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1100, px: { xs: 1.5, md: 3 } }}>
          <Box sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            {/* Trip type pills */}
            <Box sx={{ px: { xs: 2, md: 3 }, pt: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <ToggleButtonGroup value={tripType} exclusive onChange={(_, v) => v && setTripType(v)} size="small" sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                {[{ v: 'oneway', l: 'One Way' }, { v: 'return', l: 'Return' }, { v: 'multicity', l: 'Multi-City' }].map(t => (
                  <ToggleButton key={t.v} value={t.v} sx={{
                    fontSize: '0.78rem', fontWeight: 600, px: 2, py: 0.6, borderRadius: '20px !important',
                    border: '1px solid rgba(0,0,0,0.15) !important',
                    '&.Mui-selected': { bgcolor: '#08122a', color: 'white', '&:hover': { bgcolor: '#0d1e40' } }
                  }}>{t.l}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {/* Search fields */}
            <Box sx={{ px: { xs: 2, md: 3 }, py: 2.5 }}>
              <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <TextField fullWidth label="From" placeholder="City or IATA code" size="small"
                    value={origin} onChange={e => setOrigin(e.target.value)} sx={fieldSx}
                    slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><FlightTakeoffIcon sx={{ fontSize: 16, color: '#c49a45' }} /></InputAdornment> } }}
                  />
                </Grid>

                {/* Swap button */}
                <Grid size="auto" sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                  <Box onClick={swap} sx={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { borderColor: '#c49a45', color: '#c49a45' }, transition: '0.2s' }}>
                    <SwapHorizIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <TextField fullWidth label="To" placeholder="City or IATA code" size="small"
                    value={destination} onChange={e => setDestination(e.target.value)} sx={fieldSx}
                    slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><FlightLandIcon sx={{ fontSize: 16, color: '#c49a45' }} /></InputAdornment> } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: tripType === 'return' ? 1.6 : 2 }}>
                  <TextField fullWidth label="Departure" type="date" size="small"
                    value={depDate} onChange={e => setDepDate(e.target.value)} sx={fieldSx}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: todayDate } }}
                  />
                </Grid>

                {/* Return date — always mounted, hidden when not needed */}
                <Grid size={{ xs: 12, sm: 6, md: 1.6 }} sx={{ display: tripType === 'return' ? 'block' : 'none' }}>
                  <TextField fullWidth label="Return" type="date" size="small"
                    value={retDate} onChange={e => setRetDate(e.target.value)} sx={fieldSx}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: depDate || todayDate } }}
                  />
                </Grid>

                <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
                  <TextField fullWidth select label="Date range" size="small"
                    value={dateRange} onChange={e => setDateRange(Number(e.target.value))} sx={fieldSx}
                    slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><CalendarMonthIcon sx={{ fontSize: 14, color: '#c49a45' }} /></InputAdornment> } }}
                  >
                    <MenuItem value={0}>Exact date</MenuItem>
                    <MenuItem value={3}>±3 days</MenuItem>
                    <MenuItem value={7}>±7 days</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 6, sm: 4, md: 1.4 }}>
                  <TextField fullWidth select label="Passengers" size="small"
                    value={passengers} onChange={e => setPassengers(Number(e.target.value))} sx={fieldSx}
                    slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 14, color: '#c49a45' }} /></InputAdornment> } }}
                  >
                    {[1,2,3,4,5,6].map(n => <MenuItem key={n} value={n}>{n} Pax</MenuItem>)}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 4, md: 2.1 }}>
                  <TextField fullWidth select label="Cabin Class" size="small"
                    value={cabinClass} onChange={e => setCabinClass(e.target.value)} sx={fieldSx}
                    slotProps={{ inputLabel: { shrink: true } }}
                  >
                    <MenuItem value="">Any Class</MenuItem>
                    {['Economy Saver', 'Economy Flex', 'Business Class', 'First Class'].map(c => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 1.4 }}>
                  <Button fullWidth variant="contained" color="secondary"
                    onClick={handleSearch} startIcon={<SearchIcon />}
                    sx={{ height: 40, fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    Search
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── CONTENT AREA ─────────────────────────────── */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 5 }}>

        {/* Popular Routes */}
        {!searched && (
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }} color="primary">Popular Routes</Typography>
                <Typography variant="body2" color="text.secondary">Click any card to instantly search available flights</Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              {POPULAR_ROUTES.map(r => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.from + r.to}>
                  <Card onClick={() => quickSearch(r.from, r.to, r.date)} sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '16px !important' }}>
                      <Box sx={{ fontSize: { xs: 24, md: 32 } }}>{r.img}</Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700 }} color="primary" noWrap>{r.label}</Typography>
                        <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 600 }}>{r.price}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          From {format(parseISO(r.date), 'dd MMM yyyy')} · ±7 days
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end', flexShrink: 0 }}>
                        <Chip label={r.from} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                        <Chip label={r.to} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Results header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }} color="primary">
              {searched ? `${filtered.length} Flight${filtered.length !== 1 ? 's' : ''} Found` : '✨ Featured Flights'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searched
                ? `Results ${origin ? `from ${origin.toUpperCase()}` : ''} ${destination ? `to ${destination.toUpperCase()}` : ''}${depDate ? ` · ${depDate}${dateRange > 0 ? ` ±${dateRange}d` : ''}` : ''}`
                : 'Hand-picked flights for top destinations'}
            </Typography>
          </Box>
          {searched && (
            <Button size="small" onClick={() => { setSearched(false); setOrigin('DXB'); setDestination('LHR'); setDepDate('2026-05-30'); setRetDate(''); setDateRange(7); }}>
              ← Clear Search
            </Button>
          )}
        </Box>

        {searched && filtered.length === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            No flights found for <strong>{origin.toUpperCase()}→{destination.toUpperCase()}</strong>{depDate ? ` on ${depDate}` : ''}.
            Try selecting <strong>±7 days</strong> from the Date range filter, or pick a popular route above.
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress color="secondary" /></Box>
        ) : (
          <Grid container spacing={2.5}>
            {filtered.map(flight => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={flight.id}>
                <FlightCard flight={flight} onBook={() => {
                  setBookingFlight(flight);
                  setBookingStep(0);
                  setBookingResult(null);
                }} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Why fly section */}
        {!searched && (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }} color="primary">Why Fly Meridian Airways?</Typography>
            <Grid container spacing={3}>
              {[
                { icon: '🌍', title: 'Global Network', desc: '120+ destinations across 6 continents with seamless connections.' },
                { icon: '💺', title: 'Luxury Cabins', desc: 'Award-winning First Class and Business suites with lie-flat beds.' },
                { icon: '🤖', title: 'AI-Powered Service', desc: 'Our Agentic AI resolves refunds, rebooking and queries in seconds.' },
                { icon: '🎁', title: 'Meridian Miles', desc: 'Earn and redeem miles on every flight. Platinum status fast-tracked.' },
              ].map(t => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={t.title}>
                  <Card sx={{ height: '100%', textAlign: 'center' }}>
                    <CardContent sx={{ py: 4 }}>
                      <Typography sx={{ fontSize: 40, mb: 2 }}>{t.icon}</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }} color="primary">{t.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{t.desc}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Booking Dialog */}
      <Dialog open={!!bookingFlight} onClose={() => !isProcessing && setBookingFlight(null)} maxWidth="sm" fullWidth>
        {bookingFlight && (
          <>
            <DialogTitle sx={{ fontWeight: 800, bgcolor: '#08122a', color: 'white' }}>Complete Booking</DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              <Stepper activeStep={bookingStep} sx={{ mb: 4, mt: 1 }}>
                <Step><StepLabel>Review</StepLabel></Step>
                <Step><StepLabel>Payment</StepLabel></Step>
                <Step><StepLabel>Confirmation</StepLabel></Step>
              </Stepper>

              {bookingStep === 0 && (
                <Box>
                  <Typography variant="h6" color="primary">{bookingFlight.origin} ✈ {bookingFlight.destination}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{format(parseISO(bookingFlight.departure_time), 'EEE, dd MMM yyyy HH:mm')}</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TextField 
                    select 
                    label="Passengers" 
                    size="small" 
                    value={passengers} 
                    onChange={e => setPassengers(Number(e.target.value))} 
                    sx={{ width: 120, mb: 2 }}
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => <MenuItem key={n} value={n}>{n} Pax</MenuItem>)}
                  </TextField>
                  <Typography variant="subtitle2">Selected Cabin: {cabinClass || 'Economy Flex'}</Typography>
                  <Typography variant="h6" color="secondary.main" sx={{ mt: 1 }}>
                    Total: ${(bookingFlight.base_price * ((cabinClass || 'Economy Flex').includes('Business') || (cabinClass || 'Economy Flex').includes('First') ? 2 : 1) * passengers).toLocaleString()}
                  </Typography>
                </Box>
              )}

              {bookingStep === 1 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>Payment Details</Typography>
                  <TextField fullWidth size="small" label="Card Number" defaultValue="**** **** **** 4242" sx={{ mb: 2 }} disabled />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField fullWidth size="small" label="Expiry" defaultValue="12/28" disabled />
                    <TextField fullWidth size="small" label="CVV" defaultValue="***" type="password" disabled />
                  </Box>
                </Box>
              )}

              {bookingStep === 2 && bookingResult && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h5" color="success.main" sx={{ mb: 1, fontWeight: 700 }}>Booking Confirmed!</Typography>
                  <Typography variant="body1">Your PNR is: <strong>{bookingResult.pnr}</strong></Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>A confirmation email has been sent to your registered address.</Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              {bookingStep < 2 && <Button onClick={() => setBookingFlight(null)} disabled={isProcessing}>Cancel</Button>}
              {bookingStep === 0 && <Button variant="contained" color="primary" onClick={() => setBookingStep(1)}>Continue to Payment</Button>}
              {bookingStep === 1 && (
                <Button variant="contained" color="secondary" onClick={handleBook} disabled={isProcessing}>
                  {isProcessing ? <CircularProgress size={24} /> : 'Confirm & Pay'}
                </Button>
              )}
              {bookingStep === 2 && <Button variant="contained" onClick={() => navigate('/manage')}>Manage Booking</Button>}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
