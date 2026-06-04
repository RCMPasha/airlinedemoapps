import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Avatar, Grid,
  Stepper, Step, StepLabel, StepContent, Divider
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PolicyIcon from '@mui/icons-material/Policy';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const SCENARIOS = [
  {
    id: 1, label: 'Economy Flex — Auto Refund',
    pnr: 'PNR001', customer: 'John Doe', cabin: 'Economy Flex',
    amount: '$350', outcome: 'AUTO_APPROVED',
    outcomeLabel: 'Auto-Approved & Processed',
    steps: [
      { agent: 'Booking Agent', icon: <SmartToyIcon />, action: 'Retrieve Booking', detail: 'PNR001 — John Doe — AV1203 DXB→LHR', status: 'done' },
      { agent: 'Policy Agent', icon: <PolicyIcon />, action: 'Retrieve Policy', detail: 'Economy Flex: Refund allowed up to 4h before departure. Fee: $50.', status: 'done' },
      { agent: 'Eligibility Agent', icon: <AssignmentTurnedInIcon />, action: 'Evaluate Eligibility', detail: 'Eligible ✓ — Base: $400 − Fee: $50 = Refund: $350', status: 'done' },
      { agent: 'Risk Agent', icon: <WarningAmberIcon />, action: 'Risk Assessment', detail: 'Fraud Score: 12 (Low Risk) — No suspicious history detected.', status: 'done' },
      { agent: 'Approval Agent', icon: <HowToRegIcon />, action: 'Approval Decision', detail: 'Amount $350 < $1,000 threshold. No human approval required.', status: 'done' },
      { agent: 'Notification Agent', icon: <NotificationsIcon />, action: 'Customer Notified', detail: 'Email & SMS sent to customer. Refund processed in 3–5 business days.', status: 'done' },
    ],
  },
  {
    id: 2, label: 'Business Class — Human Approval',
    pnr: 'PNR002', customer: 'Alice Smith', cabin: 'Business Class',
    amount: '$3,200', outcome: 'HUMAN_REQUIRED',
    outcomeLabel: 'Escalated to Supervisor',
    steps: [
      { agent: 'Booking Agent', icon: <SmartToyIcon />, action: 'Retrieve Booking', detail: 'PNR002 — Alice Smith — AV2044 LHR→SIN', status: 'done' },
      { agent: 'Policy Agent', icon: <PolicyIcon />, action: 'Retrieve Policy', detail: 'Business Class: Fully refundable. Human approval if > $2,500.', status: 'done' },
      { agent: 'Eligibility Agent', icon: <AssignmentTurnedInIcon />, action: 'Evaluate Eligibility', detail: 'Eligible ✓ — Full refund: $3,200', status: 'done' },
      { agent: 'Risk Agent', icon: <WarningAmberIcon />, action: 'Risk Assessment', detail: 'Fraud Score: 18 (Low Risk)', status: 'done' },
      { agent: 'Approval Agent', icon: <HowToRegIcon />, action: 'Approval Decision', detail: 'Amount $3,200 exceeds $2,500 threshold → Escalating to Supervisor.', status: 'pending' },
    ],
  },
  {
    id: 3, label: 'Flight Cancelled — Auto Approved',
    pnr: 'PNR003', customer: 'Bob Johnson', cabin: 'Economy Saver',
    amount: '$250', outcome: 'AUTO_APPROVED',
    outcomeLabel: 'Immediately Auto-Approved',
    steps: [
      { agent: 'Booking Agent', icon: <SmartToyIcon />, action: 'Retrieve Booking', detail: 'PNR003 — Bob Johnson — AV3012 CDG→JFK', status: 'done' },
      { agent: 'Policy Agent', icon: <PolicyIcon />, action: 'Special Rule Check', detail: 'Flight Cancelled by Airline → Automatic full refund override applies.', status: 'done' },
      { agent: 'Eligibility Agent', icon: <AssignmentTurnedInIcon />, action: 'Exception Granted', detail: 'Airline-caused cancellation — 100% refund. No fees.', status: 'done' },
      { agent: 'Approval Agent', icon: <HowToRegIcon />, action: 'Auto-Approved', detail: 'Exception rule triggered. No human approval required.', status: 'done' },
      { agent: 'Notification Agent', icon: <NotificationsIcon />, action: 'Customer Notified', detail: 'Apology email + refund confirmation sent.', status: 'done' },
    ],
  },
  {
    id: 4, label: 'Fraud Risk — Manual Review',
    pnr: 'PNR004', customer: 'Eve Brown', cabin: 'Economy Flex',
    amount: '$550', outcome: 'FRAUD_REVIEW',
    outcomeLabel: 'Flagged for Fraud Review',
    steps: [
      { agent: 'Booking Agent', icon: <SmartToyIcon />, action: 'Retrieve Booking', detail: 'PNR004 — Eve Brown — AV4098 NRT→FRA', status: 'done' },
      { agent: 'Policy Agent', icon: <PolicyIcon />, action: 'Retrieve Policy', detail: 'Economy Flex: Refund eligible with $50 fee.', status: 'done' },
      { agent: 'Risk Agent', icon: <WarningAmberIcon />, action: 'Risk Assessment', detail: '⚠️ Fraud Score: 85 (HIGH) — 4 refund requests in 60 days.', status: 'pending' },
      { agent: 'Approval Agent', icon: <HowToRegIcon />, action: 'Escalated — Fraud Review', detail: 'Score exceeds 70 threshold. Mandatory manual review.', status: 'pending' },
    ],
  },
  {
    id: 5, label: 'Medical Emergency — Exception',
    pnr: 'PNR005', customer: 'Charlie Garcia', cabin: 'Economy Saver',
    amount: '$200', outcome: 'HUMAN_REQUIRED',
    outcomeLabel: 'AI Recommends Approval',
    steps: [
      { agent: 'Booking Agent', icon: <SmartToyIcon />, action: 'Retrieve Booking', detail: 'PNR005 — Charlie Garcia — AV5011 SIN→SYD', status: 'done' },
      { agent: 'Policy Agent', icon: <PolicyIcon />, action: 'Exception Policy Check', detail: 'Medical Emergency documentation detected.', status: 'done' },
      { agent: 'Eligibility Agent', icon: <AssignmentTurnedInIcon />, action: 'Exception Rule Applied', detail: 'Medical emergency override — full refund, no cancellation fee.', status: 'done' },
      { agent: 'Approval Agent', icon: <HowToRegIcon />, action: 'Human Approval Required', detail: 'AI recommends APPROVE. Requires supervisor sign-off per policy.', status: 'pending' },
    ],
  },
];

const outcomeStyle: Record<string, { bgcolor: string; color: string }> = {
  AUTO_APPROVED: { bgcolor: '#e8f5e9', color: '#2e7d32' },
  HUMAN_REQUIRED: { bgcolor: '#fff3e0', color: '#e65100' },
  FRAUD_REVIEW:   { bgcolor: '#ffebee', color: '#c62828' },
};

export default function AIAgentCenter() {
  const [active, setActive] = useState(0);
  const scenario = SCENARIOS[active];
  const oc = outcomeStyle[scenario.outcome];

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <SmartToyIcon color="secondary" sx={{ fontSize: 30 }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }} color="primary">AI Agent Control Center</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Live observation of multi-agent AI workflows resolving airline service requests
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left: Scenario selector */}
        <Grid size={{ xs: 12, md: 3.5 }}>
          <Card sx={{ mb: 2 }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem' }} color="primary">
                Demo Scenarios
              </Typography>
            </Box>
            {SCENARIOS.map((s, i) => (
              <Box
                key={s.id}
                onClick={() => setActive(i)}
                sx={{
                  px: 2.5, py: 1.8, cursor: 'pointer', borderBottom: '1px solid', borderColor: 'divider',
                  bgcolor: active === i ? '#f0f4ff' : 'transparent',
                  borderLeft: active === i ? '3px solid #c49a45' : '3px solid transparent',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: '#f5f7fa' },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: active === i ? 700 : 400 }} color={active === i ? 'primary' : 'text.primary'}>
                  {s.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">{s.pnr} · {s.cabin}</Typography>
              </Box>
            ))}
          </Card>

          {/* Agent Capabilities */}
          <Card>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem' }} color="primary">
                Agent Capabilities
              </Typography>
            </Box>
            <CardContent sx={{ pt: 2, pb: '16px !important' }}>
              {[
                { icon: <SmartToyIcon />, name: 'Booking Agent', desc: 'Retrieves booking, itinerary & profile' },
                { icon: <PolicyIcon />, name: 'Policy Agent', desc: 'Applies refund rules per fare class' },
                { icon: <AssignmentTurnedInIcon />, name: 'Eligibility Agent', desc: 'Calculates refund & fees' },
                { icon: <WarningAmberIcon />, name: 'Risk Agent', desc: 'Computes fraud score' },
                { icon: <HowToRegIcon />, name: 'Approval Agent', desc: 'Routes to human if needed' },
                { icon: <NotificationsIcon />, name: 'Notification Agent', desc: 'Sends email & SMS updates' },
              ].map(a => (
                <Box key={a.name} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: '#f0f4ff', width: 28, height: 28 }}>
                    {React.cloneElement(a.icon, { sx: { fontSize: 14, color: '#08122a' } })}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700 }} color="primary">{a.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{a.desc}</Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Workflow */}
        <Grid size={{ xs: 12, md: 8.5 }}>
          <Card>
            {/* Header */}
            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary">Active Workflow — {scenario.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Customer: {scenario.customer} · {scenario.cabin} · Refund: {scenario.amount}
                </Typography>
              </Box>
              <Chip icon={<PlayArrowIcon />} label="Simulated" size="small" sx={{ bgcolor: '#f0f4ff', fontWeight: 700 }} />
            </Box>

            <CardContent sx={{ px: 3, py: 3 }}>
              {/* Request bubble */}
              <Box sx={{ p: 2.5, mb: 3, bgcolor: '#f5f7fa', borderRadius: 2, borderLeft: '4px solid #c49a45' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Customer Request
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                  "I need a refund for booking {scenario.pnr}."
                </Typography>
              </Box>

              {/* Stepper */}
              <Stepper orientation="vertical" activeStep={scenario.steps.length}>
                {scenario.steps.map((step, i) => (
                  <Step key={i} completed={step.status === 'done'} active={step.status === 'pending'}>
                    <StepLabel
                      icon={
                        <Avatar sx={{
                          width: 32, height: 32,
                          bgcolor: step.status === 'done' ? '#08122a' : step.status === 'pending' ? '#e65100' : '#e0e0e0',
                        }}>
                          {React.cloneElement(step.icon, { sx: { fontSize: 16 } })}
                        </Avatar>
                      }
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} color="primary">{step.agent}</Typography>
                        <Typography variant="caption" color="text.secondary">— {step.action}</Typography>
                        {step.status === 'pending' && <Chip label="Awaiting" size="small" color="warning" sx={{ height: 18, fontSize: '0.65rem' }} />}
                        {step.status === 'done' && <CheckCircleIcon sx={{ fontSize: 14, color: '#2e7d32' }} />}
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mb: 1.5, mt: 0.5, p: 1.5, bgcolor: '#fafafa', borderRadius: 1.5, borderLeft: '2px solid #e0e0e0' }}>
                        <Typography variant="caption" color="text.secondary">{step.detail}</Typography>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {/* Outcome */}
              <Divider sx={{ my: 3 }} />
              <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: oc.bgcolor, display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ color: oc.color, fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: oc.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Final Outcome
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: oc.color }}>{scenario.outcomeLabel}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
