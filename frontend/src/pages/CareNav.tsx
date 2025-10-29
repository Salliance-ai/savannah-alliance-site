import { Calendar, Clock, User, AlertTriangle } from 'lucide-react';

export default function CareNav() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Calendar className="h-8 w-8 mr-3 text-primary-600" />
          CareNav & Smart Scheduling
        </h1>
        <p className="text-gray-600 mt-2">
          Predictive appointment balancing and intelligent patient routing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Clock className="h-10 w-10 text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
          <p className="text-sm text-gray-600 mb-4">
            AI-suggested appointment times based on provider availability and patient preferences
          </p>
          <button className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
            Suggest Appointments
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <AlertTriangle className="h-10 w-10 text-yellow-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No-Show Prediction</h3>
          <p className="text-sm text-gray-600 mb-4">
            Predict appointment no-shows with AI and reduce missed appointments
          </p>
          <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Predict Risk
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <User className="h-10 w-10 text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Routing</h3>
          <p className="text-sm text-gray-600 mb-4">
            Intelligently route patients to the best-matched provider
          </p>
          <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Route Patient
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Calendar className="h-10 w-10 text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Load Balancing</h3>
          <p className="text-sm text-gray-600 mb-4">
            Optimize provider workload distribution across schedules
          </p>
          <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Balance Load
          </button>
        </div>
      </div>
    </div>
  );
}
