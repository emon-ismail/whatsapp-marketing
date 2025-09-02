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
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor moderator performance and system statistics
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Campaigns</option>
                <option value="oasis_outfit">Oasis Outfit</option>
                <option value="zizii_island">Zizii Island (Birthday)</option>
              </select>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'daily'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Daily Reports ({new Date(selectedDate).toLocaleDateString()})
            </button>
          </div>
          
          {/* Campaign Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{campaignStats.oasis_outfit || 0}</p>
                <p className="text-xs text-muted-foreground">Oasis Outfit</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">{campaignStats.zizii_island || 0}</p>
                <p className="text-xs text-muted-foreground">Zizii Island</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{(campaignStats.oasis_outfit || 0) + (campaignStats.zizii_island || 0)}</p>
                <p className="text-xs text-muted-foreground">Total Numbers</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-center">
                <p className="text-lg font-bold text-orange-600">2</p>
                <p className="text-xs text-muted-foreground">Active Campaigns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Icon name="Phone" size={24} className="text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Numbers</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Icon name="Users" size={24} className="text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.assigned.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Assigned</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Icon name="CheckCircle" size={24} className="text-green-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.done.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Icon name="Clock" size={24} className="text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Overall Moderator Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Moderator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Assigned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Pending
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Has WhatsApp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      No WhatsApp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {moderators.map((moderator) => (
                    <tr key={moderator.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full mr-3">
                            <Icon name="User" size={16} className="text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">{moderator.name}</div>
                            <div className="text-sm text-muted-foreground">{moderator.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {moderator.totalAssigned.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {moderator.completed.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                        {moderator.pending.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {moderator.hasWhatsApp.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {moderator.noWhatsApp.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-muted rounded-full h-2 mr-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${moderator.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-foreground">{moderator.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          moderator.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
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
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                Daily Performance Report - {new Date(selectedDate).toLocaleDateString()}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Track individual moderator performance for the selected date
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Moderator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Assigned Today
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Completed Today
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      WhatsApp Success
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      No WhatsApp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Current Pending
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {dailyReports.map((moderator) => {
                    const isLowPerformance = moderator.todayCompleted < 10;
                    const isHighPerformance = moderator.todayCompleted >= 20;
                    
                    return (
                      <tr key={moderator.id} className={`hover:bg-muted/50 ${
                        isLowPerformance ? 'bg-red-50' : isHighPerformance ? 'bg-green-50' : ''
                      }`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                              isLowPerformance ? 'bg-red-100' : isHighPerformance ? 'bg-green-100' : 'bg-primary/10'
                            }`}>
                              <Icon name="User" size={16} className={`${
                                isLowPerformance ? 'text-red-600' : isHighPerformance ? 'text-green-600' : 'text-primary'
                              }`} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-foreground">{moderator.name}</div>
                              <div className="text-sm text-muted-foreground">{moderator.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {moderator.todayAssigned}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={`${
                            isLowPerformance ? 'text-red-600' : isHighPerformance ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {moderator.todayCompleted}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {moderator.todayWhatsApp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {moderator.todayNoWhatsApp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 bg-muted rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${
                                  moderator.todaySuccessRate >= 70 ? 'bg-green-500' : 
                                  moderator.todaySuccessRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${moderator.todaySuccessRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-foreground">{moderator.todaySuccessRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                          {moderator.currentPending}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isLowPerformance ? 'bg-red-100 text-red-800' :
                            isHighPerformance ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isLowPerformance ? 'Low' : isHighPerformance ? 'Excellent' : 'Good'}
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