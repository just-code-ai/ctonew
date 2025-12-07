import { useEffect, useState } from 'react';
import { useStore } from '../store';

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
            Welcome to Full-Stack Monorepo
          </h1>
          <p className="text-xl text-gray-600 mb-12 text-center">
            React + Vite + TypeScript + Express + Tailwind CSS
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Server Health Status</h2>
            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}
            {health && !loading && (
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className="text-green-600 font-semibold uppercase">{health.status}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-600">Environment:</span>
                  <span className="text-gray-900">{health.environment}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-600">Uptime:</span>
                  <span className="text-gray-900">{health.uptime.toFixed(2)}s</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="font-medium text-gray-600">Timestamp:</span>
                  <span className="text-gray-900 text-sm">
                    {new Date(health.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={fetchHealth}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Refresh Status
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Global State Demo</h2>
            <p className="text-gray-600 mb-4">Using Zustand for state management</p>
            <div className="flex items-center justify-between">
              <span className="text-lg">Counter: {count}</span>
              <button
                onClick={increment}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded transition-colors"
              >
                Increment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
