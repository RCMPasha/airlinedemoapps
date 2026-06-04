import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Button, Box, Divider, Stack } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import theme from './theme';

import CustomerPortal from './pages/CustomerPortal';
import OpsDashboard from './pages/OpsDashboard';
import SupervisorConsole from './pages/SupervisorConsole';
import AIAgentCenter from './pages/AIAgentCenter';
import AIOpsConsole from './pages/AIOpsConsole';
import ManageBooking from './pages/ManageBooking';
import DatabaseViewer from './pages/DatabaseViewer';

const NAV_LINKS = [
  { label: 'Book', to: '/' },
  { label: 'Manage Booking', to: '/manage' },
  { label: 'Check-in', to: '/checkin' },
  { label: 'Operations', to: '/ops' },
  { label: 'Supervisor', to: '/supervisor' },
  { label: 'AI Agents', to: '/ai-agents' },
  { label: 'AIOps', to: '/ai-ops' },
  { label: 'Database', to: '/db' },
];

function NavBar() {
  const location = useLocation();
  return (
    <AppBar position="sticky" elevation={0} sx={{
      bgcolor: '#08122a',
      borderBottom: '1px solid rgba(196,154,69,0.25)',
      zIndex: 1200,
    }}>
      <Toolbar sx={{ minHeight: '68px !important', px: { xs: 2, md: 5 }, gap: 1 }}>
        <FlightTakeoffIcon sx={{ color: '#c49a45', fontSize: 26, mr: 1 }} />
        <Typography
          component={Link} to="/"
          variant="h6"
          sx={{
            color: 'white', textDecoration: 'none', fontWeight: 800,
            letterSpacing: 2, textTransform: 'uppercase', fontSize: '1rem',
            flexGrow: 1,
          }}
        >
          Meridian Airways
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {NAV_LINKS.map(link => {
            const active = location.pathname === link.to;
            return (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                sx={{
                  color: active ? '#c49a45' : 'rgba(255,255,255,0.8)',
                  fontWeight: active ? 700 : 400,
                  fontSize: '0.875rem',
                  borderBottom: active ? '2px solid #c49a45' : '2px solid transparent',
                  borderRadius: 0,
                  px: 2,
                  py: 1,
                  '&:hover': { color: '#c49a45', bgcolor: 'transparent' },
                  transition: 'all 0.2s',
                }}
              >
                {link.label}
              </Button>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#08122a', color: 'rgba(255,255,255,0.55)', py: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          {/* Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlightTakeoffIcon sx={{ color: '#c49a45', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontSize: '0.8rem' }}>
              Meridian Airways
            </Typography>
          </Box>

          {/* Links */}
          <Stack direction="row" spacing={3} sx={{ fontSize: '0.8rem' }}>
            {['Privacy Policy', 'Terms', 'Baggage', 'Contact'].map(l => (
              <Typography key={l} component="a" href="#" variant="body2"
                sx={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', '&:hover': { color: '#c49a45' }, transition: '0.2s' }}>
                {l}
              </Typography>
            ))}
          </Stack>

          {/* Social */}
          <Stack direction="row" spacing={1}>
            {[FacebookIcon, TwitterIcon, InstagramIcon, LinkedInIcon].map((Icon, i) => (
              <Icon key={i} sx={{ fontSize: 18, cursor: 'pointer', '&:hover': { color: '#c49a45' }, transition: '0.2s' }} />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2 }} />
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
          © {new Date().getFullYear()} Meridian Airways — Demo Platform. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <NavBar />
          <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f0f2f5' }}>
            <Routes>
              <Route path="/" element={<CustomerPortal />} />
              <Route path="/manage" element={<ManageBooking />} />
              <Route path="/checkin" element={<Box sx={{p:10, textAlign:'center'}}><Typography variant="h4">Web Check-in</Typography><Typography>Check-in opens 48 hours before departure.</Typography></Box>} />
              <Route path="/ops" element={<OpsDashboard />} />
              <Route path="/supervisor" element={<SupervisorConsole />} />
              <Route path="/ai-agents" element={<AIAgentCenter />} />
              <Route path="/ai-ops" element={<AIOpsConsole />} />
              <Route path="/db" element={<DatabaseViewer />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
