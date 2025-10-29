import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  Activity,
  AlertCircle
} from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  href?: string;
}

function KPICard({ title, value, change, icon, href }: KPICardProps) {
  const content = (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} vs last period
            </p>
          )}
        </div>
        <div className="text-primary-600">{icon}</div>
      </div>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}

export default function Dashboard() {
  const [kpis, setKpis] = useState<any>(null);

  useEffect(() => {
    // In production, fetch from API
    setKpis({
      providerUtilization: 85.2,
      patientEngagement: 4.3,
      revenue: '$425,000',
      appointments: 1,247,
    });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your healthcare operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Provider Utilization"
          value={`${kpis?.providerUtilization || 0}%`}
          change="+5.2%"
          icon={<Activity className="h-8 w-8" />}
          href="/intelligence"
        />
        <KPICard
          title="Patient Engagement"
          value={kpis?.patientEngagement || 0}
          change="+0.3"
          icon={<Users className="h-8 w-8" />}
          href="/patient360"
        />
        <KPICard
          title="Monthly Revenue"
          value={kpis?.revenue || '$0'}
          change="+12.5%"
          icon={<DollarSign className="h-8 w-8" />}
          href="/revenueops"
        />
        <KPICard
          title="Appointments"
          value={kpis?.appointments?.toLocaleString() || 0}
          change="+8.1%"
          icon={<Calendar className="h-8 w-8" />}
          href="/carenav"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/clinicalops"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Generate Clinical Note</h3>
            <p className="text-sm text-gray-600 mt-1">AI-powered documentation</p>
          </Link>
          <Link
            to="/marketops"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Score Lead</h3>
            <p className="text-sm text-gray-600 mt-1">AI-driven lead analysis</p>
          </Link>
          <Link
            to="/carenav"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Schedule Appointment</h3>
            <p className="text-sm text-gray-600 mt-1">Smart scheduling assistant</p>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-yellow-900">Revenue Anomaly Detected</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Unusual revenue drop detected. Review recent claims and denials.
            </p>
            <Link to="/revenueops" className="text-sm text-yellow-700 underline mt-2 inline-block">
              View details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
