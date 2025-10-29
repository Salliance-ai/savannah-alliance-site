import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react';

export default function MarketOps() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="h-8 w-8 mr-3 text-primary-600" />
          GHL-Powered MarketOps CRM
        </h1>
        <p className="text-gray-600 mt-2">
          AI-driven lead scoring, outreach automation, and campaign analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Target className="h-10 w-10 text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Lead Scoring</h3>
          <p className="text-sm text-gray-600 mb-4">
            AI-powered lead scoring with conversion prediction
          </p>
          <button className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
            Score Lead
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <BarChart3 className="h-10 w-10 text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaign Analytics</h3>
          <p className="text-sm text-gray-600 mb-4">
            Map marketing campaigns to care outcomes
          </p>
          <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            View Analytics
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <TrendingUp className="h-10 w-10 text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">LTV Prediction</h3>
          <p className="text-sm text-gray-600 mb-4">
            Predict patient lifetime value
          </p>
          <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Predict LTV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Users className="h-10 w-10 text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Workflow Sync</h3>
          <p className="text-sm text-gray-600 mb-4">
            GHL → Scheduling → EHR integration
          </p>
          <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Sync Workflows
          </button>
        </div>
      </div>
    </div>
  );
}
