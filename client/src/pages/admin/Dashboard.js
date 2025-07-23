import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    trendData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getTripStatistics();
        setStats(data);
      } catch (error) {
        toast.error('Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Trips */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">✈️</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Trips
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalTrips}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Active Trips */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">🚀</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Trips
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeTrips}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Completed Trips */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">✅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed Trips
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.completedTrips}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Trip Trend</h2>
          <div className="h-64">
            <div className="flex items-end space-x-2 h-48">
              {stats.trendData.map((item, index) => (
                <div key={index} className="flex-1">
                  <div
                    className="bg-indigo-600 rounded-t"
                    style={{
                      height: `${(item.trips / Math.max(...stats.trendData.map(d => d.trips))) * 100}%`
                    }}
                  ></div>
                  <div className="text-xs text-center mt-2 text-gray-500">
                    {item.month}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard; 