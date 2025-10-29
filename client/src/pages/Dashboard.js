import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Heart,
  Shield,
  Brain,
  Zap,
  Target,
  Award
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  // Sample data for charts
  const trustTrendData = [
    { date: '2024-01', trust: 65, emotion: 72 },
    { date: '2024-02', trust: 68, emotion: 75 },
    { date: '2024-03', trust: 72, emotion: 78 },
    { date: '2024-04', trust: 75, emotion: 82 },
    { date: '2024-05', trust: 78, emotion: 85 },
    { date: '2024-06', trust: 82, emotion: 88 },
    { date: '2024-07', trust: 85, emotion: 91 },
    { date: '2024-08', trust: 87, emotion: 94 }
  ];

  const emotionDistributionData = [
    { name: 'Trust', value: 35, color: '#22c55e' },
    { name: 'Joy', value: 25, color: '#fbbf24' },
    { name: 'Anticipation', value: 20, color: '#3b82f6' },
    { name: 'Surprise', value: 10, color: '#a855f7' },
    { name: 'Fear', value: 6, color: '#ef4444' },
    { name: 'Other', value: 4, color: '#6b7280' }
  ];

  const trustParadoxData = [
    { stage: 'Awareness', users: 320, conversion: 78 },
    { stage: 'Engagement', users: 250, conversion: 85 },
    { stage: 'Empowerment', users: 180, conversion: 92 },
    { stage: 'Relationship', users: 120, conversion: 96 }
  ];

  const kpiCards = [
    {
      title: 'Total Users',
      value: '1,247',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'primary'
    },
    {
      title: 'Trust Score',
      value: '87%',
      change: '+5%',
      changeType: 'positive',
      icon: Shield,
      color: 'trust'
    },
    {
      title: 'Emotional Resonance',
      value: '94%',
      change: '+8%',
      changeType: 'positive',
      icon: Heart,
      color: 'empathy'
    },
    {
      title: 'AI Acceptance',
      value: '78%',
      change: '+15%',
      changeType: 'positive',
      icon: Brain,
      color: 'primary'
    }
  ];

  const therapeuticMetrics = [
    {
      title: 'Validation Success',
      value: '92%',
      description: 'Users feeling heard and understood',
      icon: Heart,
      trend: '+3%'
    },
    {
      title: 'Empathy Resonance',
      value: '89%',
      description: 'Emotional connection effectiveness',
      icon: Zap,
      trend: '+7%'
    },
    {
      title: 'Safety Building',
      value: '85%',
      description: 'Psychological safety improvement',
      icon: Shield,
      trend: '+4%'
    },
    {
      title: 'Collaboration Rate',
      value: '76%',
      description: 'Users engaging in co-creation',
      icon: Target,
      trend: '+12%'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            EIME™ Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Emotionally Intelligent Marketing Engine - Real-time insights and trust metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="btn-primary">
            Generate Report
          </button>
          <button className="btn-secondary">
            Export Data
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {kpiCards.map((kpi, index) => (
          <div key={kpi.title} className="metric-card hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">{kpi.title}</p>
                <p className="metric-value">{kpi.value}</p>
                <p className={`text-sm font-medium mt-1 ${
                  kpi.changeType === 'positive' ? 'metric-change-positive' : 'metric-change-negative'
                }`}>
                  {kpi.change} from last month
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-${kpi.color}-100`}>
                <kpi.icon className={`h-6 w-6 text-${kpi.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Trust Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="chart-container"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Trust & Emotional Trends</h2>
            <p className="text-gray-600">Trust score and emotional resonance over time</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-trust-500 rounded-full" />
              <span className="text-sm text-gray-600">Trust Score</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-empathy-500 rounded-full" />
              <span className="text-sm text-gray-600">Emotional Resonance</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trustTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="trust"
              stackId="1"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="emotion"
              stackId="2"
              stroke="#ec4899"
              fill="#ec4899"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emotion Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="chart-container"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Emotion Distribution</h2>
            <p className="text-gray-600">Current emotional state across all users</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={emotionDistributionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {emotionDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Trust Paradox Model */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="chart-container"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Trust Paradox Model</h2>
            <p className="text-gray-600">User journey through trust stages</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trustParadoxData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stage" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Therapeutic Framework Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-empathy-50 to-primary-50 rounded-xl p-6 border border-empathy-200"
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Award className="h-6 w-6 text-empathy-600 mr-2" />
            Therapeutic Framework Effectiveness
          </h2>
          <p className="text-gray-600">How well our empathetic AI is performing</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {therapeuticMetrics.map((metric, index) => (
            <div key={metric.title} className="bg-white rounded-lg p-4 border border-white/50">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="h-5 w-5 text-empathy-600" />
                <span className="text-sm font-medium text-trust-600">{metric.trend}</span>
              </div>
              <div className="mb-1">
                <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{metric.title}</p>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="chart-container"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-gray-600">Latest emotional intelligence insights</p>
          </div>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {[
            {
              type: 'trust_increase',
              user: 'Sarah M.',
              message: 'Trust score increased from 65% to 78% after empathetic response',
              time: '2 minutes ago',
              icon: TrendingUp,
              color: 'trust'
            },
            {
              type: 'emotion_shift',
              user: 'John D.',
              message: 'Emotional state shifted from anxious to trusting',
              time: '5 minutes ago',
              icon: Heart,
              color: 'empathy'
            },
            {
              type: 'ai_interaction',
              user: 'Lisa K.',
              message: 'Positive AI interaction - therapeutic response successful',
              time: '8 minutes ago',
              icon: Brain,
              color: 'primary'
            },
            {
              type: 'validation_success',
              user: 'Mike R.',
              message: 'Validation technique resulted in 95% satisfaction',
              time: '12 minutes ago',
              icon: Award,
              color: 'trust'
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-lg bg-${activity.color}-100`}>
                <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                <p className="text-sm text-gray-600">{activity.message}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;