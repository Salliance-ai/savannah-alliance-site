import { useState } from 'react';
import { Stethoscope, FileText, Code, ClipboardList } from 'lucide-react';
import axios from 'axios';

const API_BASE = '/api/v1';

export default function ClinicalOps() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerateDoc = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/clinicalops/documentation/generate`, {
        patientId: 'pat_123',
        encounterData: {
          chiefComplaint: 'Patient presents with...',
          history: 'No significant past medical history',
          examination: 'Vital signs stable',
        },
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Stethoscope className="h-8 w-8 mr-3 text-primary-600" />
          ClinicalOps AI
        </h1>
        <p className="text-gray-600 mt-2">
          AI-powered clinical documentation, coding, and treatment planning
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <FileText className="h-10 w-10 text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Documentation</h3>
          <p className="text-sm text-gray-600 mb-4">
            AI-assisted clinical note generation with evidence-based recommendations
          </p>
          <button
            onClick={handleGenerateDoc}
            disabled={loading}
            className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Note'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Code className="h-10 w-10 text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto-Code</h3>
          <p className="text-sm text-gray-600 mb-4">
            Automatic ICD-10 code suggestions based on clinical documentation
          </p>
          <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Auto-Code
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <ClipboardList className="h-10 w-10 text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Treatment Plans</h3>
          <p className="text-sm text-gray-600 mb-4">
            Evidence-based treatment plan recommendations
          </p>
          <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Generate Plan
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Document</h3>
          <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
