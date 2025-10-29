import { User, FileText, TrendingDown, TrendingUp } from 'lucide-react';

export default function Patient360() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <User className="h-8 w-8 mr-3 text-primary-600" />
          Patient360 Hub
        </h1>
        <p className="text-gray-600 mt-2">
          Unified patient profiles with behavioral, clinical, and engagement metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Profile</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Clinical Summary</h4>
              <p className="text-sm text-gray-600 mt-1">
                Primary diagnosis: Type 2 diabetes mellitus<br />
                Last visit: 30 days ago<br />
                Medications: Metformin 500mg BID
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Engagement Score</h4>
              <div className="mt-2 flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="ml-4 text-sm font-medium text-gray-900">85%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Churn Risk</h4>
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">25%</p>
            <p className="text-xs text-gray-500 mt-1">Low risk</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Next Appointment Likelihood</h4>
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">78%</p>
            <p className="text-xs text-gray-500 mt-1">High likelihood</p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">AI Care Summary</h3>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          Generate Summary
        </button>
      </div>
    </div>
  );
}
