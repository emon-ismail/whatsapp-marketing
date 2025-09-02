import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';

const AdminDashboard = () => {
  const [moderators, setModerators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, assigned: 0, done: 0, pending: 0 });
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [campaignStats, setCampaignStats] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyReports, setDailyReports] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchModeratorsStats();
    fetchOverallStats();
    fetchCampaignStats();
    fetchDailyReports();
  }, [selectedDate]);

  const fetchCampaignStats = async () => {
    try {
      const { count: oasisCount } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_type', 'oasis_outfit');

      const { count: ziziiCount } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_type', 'zizii_island');

      setCampaignStats({
        oasis_outfit: oasisCount || 0,
        zizii_island: ziziiCount || 0
      });
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
    }
  };

  const fetchModeratorsStats = async () => {
    try {
      // Get all moderators with their stats
      const { data: moderatorsList, error } = await supabase
        .from('moderators')
        .select('*')
        .eq('role', 'moderator')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get stats for each moderator
      const moderatorsWithStats = await Promise.all(
        moderatorsList.map(async (moderator) => {
          const { count: totalAssigned } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id);

          const { count: completed } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .eq('status', 'done');

          const { count: pending } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .eq('status', 'pending');

          const { count: hasWhatsApp } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .eq('has_whatsapp', true);

          const { count: noWhatsApp } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .eq('has_whatsapp', false);

          return {
            ...moderator,
            totalAssigned: totalAssigned || 0,
            completed: completed || 0,
            pending: pending || 0,
            hasWhatsApp: hasWhatsApp || 0,
            noWhatsApp: noWhatsApp || 0,
            completionRate: totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0
          };
        })
      );

      setModerators(moderatorsWithStats);
    } catch (error) {
      console.error('Error fetching moderators stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverallStats = async () => {
    try {
      const { count: total } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true });

      const { count: assigned } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .not('assigned_moderator', 'is', null);

      const { count: done } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'done');

      const { count: pending } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        total: total || 0,
        assigned: assigned || 0,
        done: done || 0,
        pending: pending || 0
      });
    } catch (error) {
      console.error('Error fetching overall stats:', error);
    }
  };

  const fetchDailyReports = async () => {
    try {
      const { data: moderatorsList, error } = await supabase
        .from('moderators')
        .select('*')
        .eq('role', 'moderator')
        .order('name', { ascending: true });

      if (error) throw error;

      const reportsWithStats = await Promise.all(
        moderatorsList.map(async (moderator) => {
          const { count: todayCompleted } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .eq('status', 'done')
            .gte('updated_at', `${selectedDate}T00:00:00`)
            .lte('updated_at', `${selectedDate}T23:59:59`);

          const { count: todayAssigned } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .gte('assigned_at', `${selectedDate}T00:00:00`)
            .lte('assigned_at', `${selectedDate}T23:59:59`);

          const { count: todayWhatsApp } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .eq('has_whatsapp', true)
            .gte('updated_at', `${selectedDate}T00:00:00`)
            .lte('updated_at', `${selectedDate}T23:59:59`);

          const { count: todayNoWhatsApp } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .eq('has_whatsapp', false)
            .gte('updated_at', `${selectedDate}T00:00:00`)
            .lte('updated_at', `${selectedDate}T23:59:59`);

          const { count: currentPending } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .eq('status', 'pending');

          return {
            ...moderator,
            todayCompleted: todayCompleted || 0,
            todayAssigned: todayAssigned || 0,
            todayWhatsApp: todayWhatsApp || 0,
            todayNoWhatsApp: todayNoWhatsApp || 0,
            currentPending: currentPending || 0,
            todaySuccessRate: todayCompleted > 0 ? Math.round((todayWhatsApp / todayCompleted) * 100) : 0
          };
        })
      );

      setDailyReports(reportsWithStats);
    } catch (error) {
      console.error('Error fetching daily reports:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-background flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg">
                  <Icon name="Shield" className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
              </div>
              <p className="text-sm text-gray-600">Monitor performance and system analytics</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Campaigns</option>
                <option value="oasis_outfit">Oasis Outfit</option>
                <option value="zizii_island">Zizii Island</option>
              </select>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('daily')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'daily'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Daily Report
              </button>
            </nav>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Icon name="Users" className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Numbers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Icon name="CheckCircle" className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.done.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
                <Icon name="Clock" className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg">
                <Icon name="Target" className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.assigned.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>



        {activeTab === 'overview' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Team Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Moderator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Has WhatsApp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No WhatsApp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {moderators.map((moderator) => (
                    <tr key={moderator.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Icon name="User" className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{moderator.name}</div>
                            <div className="text-sm text-gray-500">{moderator.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{moderator.totalAssigned.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{moderator.completed.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">{moderator.pending.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{moderator.hasWhatsApp.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{moderator.noWhatsApp.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full" style={{ width: `${moderator.completionRate}%` }}></div>
                          </div>
                          <span className="text-sm text-gray-900">{moderator.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          moderator.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {moderator.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Daily Report - {new Date(selectedDate).toLocaleDateString()}</h3>
              <p className="text-sm text-gray-500 mt-1">Individual performance metrics</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Moderator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Today</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Today</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp Success</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No WhatsApp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Success Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dailyReports.map((moderator) => {
                    const isLow = moderator.todayCompleted < 10;
                    const isHigh = moderator.todayCompleted >= 20;
                    return (
                      <tr key={moderator.id} className={`hover:bg-gray-50 ${
                        isLow ? 'bg-red-50' : isHigh ? 'bg-green-50' : ''
                      }`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              isLow ? 'bg-red-100' : isHigh ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              <Icon name="User" className={`h-5 w-5 ${
                                isLow ? 'text-red-600' : isHigh ? 'text-green-600' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{moderator.name}</div>
                              <div className="text-sm text-gray-500">{moderator.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{moderator.todayAssigned}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={`${
                            isLow ? 'text-red-600' : isHigh ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {moderator.todayCompleted}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{moderator.todayWhatsApp}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{moderator.todayNoWhatsApp}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                              <div className={`h-2 rounded-full ${
                                moderator.todaySuccessRate >= 70 ? 'bg-green-500' : 
                                moderator.todaySuccessRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} style={{ width: `${moderator.todaySuccessRate}%` }}></div>
                            </div>
                            <span className="text-sm text-gray-900">{moderator.todaySuccessRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">{moderator.currentPending}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isLow ? 'bg-red-100 text-red-800' : isHigh ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isLow ? 'Low' : isHigh ? 'Excellent' : 'Good'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;