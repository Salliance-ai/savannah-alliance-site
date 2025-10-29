import { DollarSign, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';

export default function RevenueOps() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <DollarSign className="h-8 w-8 mr-3 text-primary-600" />
          RevenueOps Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Billing analytics, anomaly detection, and revenue forecasting
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
            <DollarSign className="h-6 w-6 text-primary-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">$425,000</p>
          <p className="text-sm text-green-600 mt-2">+12.5% vs last period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Collections</h3>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">$385,000</p>
          <p className="text-sm text-gray-600 mt-2">91% collection rate</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Days in AR</h3>
            <BarChart3 className="h-6 w-6 text-primary-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">24</p>
          <p className="text-sm text-gray-600 mt-2">Industry avg: 35 days</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 mr-3" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">Revenue Anomaly Detected</h3>
            <p className="text-sm text-yellow-700 mb-2">
              Unusual revenue drop detected compared to previous period.
            </p>
            <p className="text-sm text-yellow-700">
              <strong>Recommendation:</strong> Review recent claim submissions and denials.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Forecast</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Next Month</span>
              <span className="text-lg font-semibold text-gray-900">$440,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">2 Months</span>
              <span className="text-lg font-semibold text-gray-900">$455,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">3 Months</span>
              <span className="text-lg font-semibold text-gray-900">$470,000</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Denial Reasons</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700">Prior auth required</span>
                <span className="text-sm font-medium text-gray-900">15</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '53%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700">Incorrect patient info</span>
                <span className="text-sm font-medium text-gray-900">8</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '29%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700">Missing documentation</span>
                <span className="text-sm font-medium text-gray-900">5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
