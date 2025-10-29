import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Schedule,
  AttachMoney,
  Warning,
  CheckCircle,
  MoreVert,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useClinic } from '../../contexts/ClinicContext';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { clinic } = useClinic();

  // Mock data - in production, this would come from API calls
  const kpiData = [
    {
      title: 'Total Patients',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: <People />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Monthly Revenue',
      value: '$125,000',
      change: '+8%',
      trend: 'up',
      icon: <AttachMoney />,
      color: theme.palette.success.main,
    },
    {
      title: 'Appointments Today',
      value: '24',
      change: '-3%',
      trend: 'down',
      icon: <Schedule />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Provider Utilization',
      value: '82%',
      change: '+5%',
      trend: 'up',
      icon: <TrendingUp />,
      color: theme.palette.info.main,
    },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 115000, patients: 1150 },
    { month: 'Feb', revenue: 118000, patients: 1180 },
    { month: 'Mar', revenue: 122000, patients: 1220 },
    { month: 'Apr', revenue: 119000, patients: 1190 },
    { month: 'May', revenue: 125000, patients: 1250 },
    { month: 'Jun', revenue: 128000, patients: 1280 },
  ];

  const appointmentData = [
    { day: 'Mon', scheduled: 28, completed: 25, noShow: 3 },
    { day: 'Tue', scheduled: 32, completed: 30, noShow: 2 },
    { day: 'Wed', scheduled: 25, completed: 23, noShow: 2 },
    { day: 'Thu', scheduled: 30, completed: 28, noShow: 2 },
    { day: 'Fri', scheduled: 35, completed: 32, noShow: 3 },
  ];

  const patientSegmentData = [
    { name: 'High Risk', value: 15, color: '#ef4444' },
    { name: 'Medium Risk', value: 35, color: '#f59e0b' },
    { name: 'Low Risk', value: 50, color: '#10b981' },
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'High-Risk Patient Alert',
      message: '3 patients require immediate follow-up',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'info',
      title: 'AI Insight Available',
      message: 'New revenue optimization recommendations',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'success',
      title: 'Integration Complete',
      message: 'GHL sync completed successfully',
      time: '1 day ago',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Good morning, {user?.profile.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening at {clinic?.name} today
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* KPI Cards */}
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: `${kpi.color}15`,
                      color: kpi.color,
                    }}
                  >
                    {kpi.icon}
                  </Box>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {kpi.value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {kpi.title}
                  </Typography>
                  <Chip
                    label={kpi.change}
                    size="small"
                    color={kpi.trend === 'up' ? 'success' : 'error'}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Revenue Trend */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Revenue & Patient Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="right" dataKey="patients" fill={theme.palette.primary.light} opacity={0.3} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Patient Risk Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Patient Risk Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={patientSegmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {patientSegmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {patientSegmentData.map((segment, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: segment.color,
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {segment.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {segment.value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Appointments */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                This Week's Appointments
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={appointmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill={theme.palette.success.main} />
                  <Bar dataKey="noShow" fill={theme.palette.error.main} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts & Notifications */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Recent Alerts
              </Typography>
              <Box>
                {alerts.map((alert) => (
                  <Box
                    key={alert.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      backgroundColor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ mr: 2, mt: 0.5 }}>
                      {alert.type === 'warning' && <Warning color="warning" />}
                      {alert.type === 'info' && <TrendingUp color="info" />}
                      {alert.type === 'success' && <CheckCircle color="success" />}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {alert.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {alert.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Insights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                AI-Powered Insights
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Revenue Opportunity
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                      AI identifies $45K potential revenue increase through preventive care optimization
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={75}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white',
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      75% confidence
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Efficiency Gain
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                      Scheduling optimization could reduce wait times by 25%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={82}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white',
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      82% confidence
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Patient Engagement
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                      Personalized outreach campaigns could improve adherence by 15%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={68}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white',
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      68% confidence
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;