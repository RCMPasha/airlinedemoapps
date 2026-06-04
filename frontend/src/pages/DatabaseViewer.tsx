import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, CircularProgress
} from '@mui/material';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

export default function DatabaseViewer() {
  const [tab, setTab] = useState(0);
  const [flights, setFlights] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [airports, setAirports] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/flights?limit=500').then(res => setFlights(res.data)),
      axios.get('/api/customers?limit=500').then(res => setCustomers(res.data)),
      axios.get('/api/airports').then(res => setAirports(res.data)),
      axios.get('/api/bookings').then(res => setBookings(res.data.reverse())), // Show newest first
      axios.get('/api/refunds').then(res => setRefunds(res.data)),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }} color="primary">Database Explorer</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View raw seeded data for Flights, Customers, and Airports. Use this to find active routes and dates for demos.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="secondary" indicatorColor="secondary">
          <Tab label={`Flights (${flights.length})`} />
          <Tab label={`Airports (${airports.length})`} />
          <Tab label={`Customers (${customers.length})`} />
          <Tab label={`Bookings (${bookings.length})`} />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Card>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {tab === 0 && ['Flight #', 'Origin', 'Dest', 'Departure', 'Arrival', 'Aircraft', 'Base Price', 'Status'].map(h => <TableCell key={h} sx={{ fontWeight: 700, bgcolor: '#f5f7fa' }}>{h}</TableCell>)}
                  {tab === 1 && ['Code', 'Name', 'City', 'Country', 'Timezone'].map(h => <TableCell key={h} sx={{ fontWeight: 700, bgcolor: '#f5f7fa' }}>{h}</TableCell>)}
                  {tab === 2 && ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Loyalty Tier'].map(h => <TableCell key={h} sx={{ fontWeight: 700, bgcolor: '#f5f7fa' }}>{h}</TableCell>)}
                  {tab === 3 && ['PNR', 'Customer ID', 'Flight ID', 'Cabin', 'Status', 'Total', 'Refund Reason'].map(h => <TableCell key={h} sx={{ fontWeight: 700, bgcolor: '#f5f7fa' }}>{h}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {tab === 0 && flights.map(f => (
                  <TableRow key={f.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{f.flight_number}</TableCell>
                    <TableCell>{f.origin}</TableCell>
                    <TableCell>{f.destination}</TableCell>
                    <TableCell>{format(parseISO(f.departure_time), 'dd MMM yyyy HH:mm')}</TableCell>
                    <TableCell>{format(parseISO(f.arrival_time), 'dd MMM yyyy HH:mm')}</TableCell>
                    <TableCell>{f.aircraft_type}</TableCell>
                    <TableCell>${f.base_price}</TableCell>
                    <TableCell>{f.status}</TableCell>
                  </TableRow>
                ))}
                {tab === 1 && airports.map(a => (
                  <TableRow key={a.code} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{a.code}</TableCell>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>{a.city}</TableCell>
                    <TableCell>{a.country}</TableCell>
                    <TableCell>{a.timezone}</TableCell>
                  </TableRow>
                ))}
                {tab === 2 && customers.map(c => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.id}</TableCell>
                    <TableCell>{c.first_name}</TableCell>
                    <TableCell>{c.last_name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>{c.loyalty_tier}</TableCell>
                  </TableRow>
                ))}
                {tab === 3 && bookings.map(b => {
                  const refund = refunds.find(r => r.booking_id === b.id);
                  return (
                    <TableRow key={b.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{b.pnr}</TableCell>
                      <TableCell>{b.customer_id}</TableCell>
                      <TableCell>{b.flight_id}</TableCell>
                      <TableCell>{b.cabin_class}</TableCell>
                      <TableCell>{b.status}</TableCell>
                      <TableCell>${b.total_amount}</TableCell>
                      <TableCell>{(b.status === 'Cancelled' || b.status === 'Refund Requested') && refund ? refund.reason : '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
