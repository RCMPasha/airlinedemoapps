import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid
} from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Scheduled: { color: '#2e7d32', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  Boarding:  { color: '#1565c0', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  'In Air':  { color: '#0288d1', icon: <FlightIcon sx={{ fontSize: 14 }} /> },
  Delayed:   { color: '#e65100', icon: <WarningAmberIcon sx={{ fontSize: 14 }} /> },
  Cancelled: { color: '#c62828', icon: <CancelIcon sx={{ fontSize: 14 }} /> },
  Landed:    { color: '#546e7a', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
};

function StatCard({ title, value, color, icon }: any) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <Box sx={{
          width: 52, height: 52, borderRadius: 2,
          bgcolor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{title}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function OpsDashboard() {
  const [flights, setFlights] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/flights?limit=100').then(res => setFlights(res.data));
  }, []);

  const stats = {
    total: flights.length,
    scheduled: flights.filter(f => f.status === 'Scheduled').length,
    delayed: flights.filter(f => f.status === 'Delayed').length,
    cancelled: flights.filter(f => f.status === 'Cancelled').length,
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }} color="primary">Operations Center</Typography>
        <Typography variant="body2" color="text.secondary">Live flight monitoring and status overview</Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Total Flights" value={stats.total} color="#08122a" icon={<FlightIcon />} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="On Schedule" value={stats.scheduled} color="#2e7d32" icon={<CheckCircleIcon />} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Delayed" value={stats.delayed} color="#e65100" icon={<WarningAmberIcon />} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Cancelled" value={stats.cancelled} color="#c62828" icon={<CancelIcon />} />
        </Grid>
      </Grid>

      {/* Table */}
      <Card>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary">Live Flight Board</Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                {['Flight', 'Route', 'Departure', 'Arrival', 'Aircraft', 'Status'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#546e7a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {flights.slice(0, 20).map(f => {
                const cfg = statusConfig[f.status] ?? { color: '#546e7a', icon: null };
                return (
                  <TableRow key={f.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} color="secondary.main">{f.flight_number}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{f.origin} → {f.destination}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{format(parseISO(f.departure_time), 'dd MMM HH:mm')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{format(parseISO(f.arrival_time), 'dd MMM HH:mm')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{f.aircraft_type}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: cfg.color }}>
                        {cfg.icon}
                        <Typography variant="caption" sx={{ fontWeight: 700, color: cfg.color }}>{f.status}</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
