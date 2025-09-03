import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, LineChart, Line } from 'recharts';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  const [moderators, setModerators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, assigned: 0, done: 0, pending: 0, totalOrders: 0, todayOrders: 0, hasWhatsApp: 0, noWhatsApp: 0 });
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [campaignStats, setCampaignStats] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateRangeStart, setDateRangeStart] = useState(new Date().toISOString().split('T')[0]);
  const [dateRangeEnd, setDateRangeEnd] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('daily'); // daily, weekly, monthly, custom
  const [activeTab, setActiveTab] = useState('overview');
  const [allNumbers, setAllNumbers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [numbersLoading, setNumbersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [allModerators, setAllModerators] = useState([]);
  const [moderatorSearchTerm, setModeratorSearchTerm] = useState('');
  const [moderatorStatusFilter, setModeratorStatusFilter] = useState('all');
  const itemsPerPage = 100;

  useEffect(() => {
    fetchModeratorsStats();
    fetchOverallStats();
    fetchCampaignStats();
    if (activeTab === 'all-moderators') {
      fetchAllModerators();
    }
  }, [selectedDate, reportType, dateRangeStart, dateRangeEnd, activeTab]);

  useEffect(() => {
    if (activeTab === 'numbers') {
      fetchAllNumbers(1, searchTerm);
    }
  }, [activeTab, selectedCampaign, statusFilter]);

  useEffect(() => {
    if (activeTab === 'numbers') {
      const timeoutId = setTimeout(() => {
        fetchAllNumbers(1, searchTerm);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

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

  const getDateRange = () => {
    const today = new Date();
    let startDate, endDate;
    
    switch(reportType) {
      case 'daily':
        startDate = endDate = selectedDate;
        break;
      case 'weekly':
        const weekStart = new Date(selectedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        startDate = weekStart.toISOString().split('T')[0];
        endDate = weekEnd.toISOString().split('T')[0];
        break;
      case 'monthly':
        const monthStart = new Date(selectedDate);
        monthStart.setDate(1);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthStart.getMonth() + 1);
        monthEnd.setDate(0);
        startDate = monthStart.toISOString().split('T')[0];
        endDate = monthEnd.toISOString().split('T')[0];
        break;
      case 'custom':
        startDate = dateRangeStart;
        endDate = dateRangeEnd;
        break;
      default:
        startDate = endDate = selectedDate;
    }
    
    return { startDate, endDate };
  };

  const fetchModeratorsStats = async () => {
    try {
      const { data: moderatorsList, error } = await supabase
        .from('moderators')
        .select('*')
        .eq('role', 'moderator')
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const { startDate, endDate } = getDateRange();

      const moderatorsWithStats = await Promise.all(
        moderatorsList.map(async (moderator) => {
          const { count: totalAssigned } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .gte('assigned_at', `${startDate}T00:00:00`)
            .lte('assigned_at', `${endDate}T23:59:59`);

          const { count: completed } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .eq('status', 'done')
            .gte('updated_at', `${startDate}T00:00:00`)
            .lte('updated_at', `${endDate}T23:59:59`);

          const { count: pending } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .eq('status', 'pending');

          const { count: hasWhatsApp } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .eq('has_whatsapp', true)
            .gte('updated_at', `${startDate}T00:00:00`)
            .lte('updated_at', `${endDate}T23:59:59`);

          const { count: noWhatsApp } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .eq('has_whatsapp', false)
            .gte('updated_at', `${startDate}T00:00:00`)
            .lte('updated_at', `${endDate}T23:59:59`);

          const { count: totalOrders } = await supabase
            .from('phone_numbers')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_moderator', moderator.id)
            .eq('has_ordered', true)
            .gte('order_date', `${startDate}T00:00:00`)
            .lte('order_date', `${endDate}T23:59:59`);

          return {
            ...moderator,
            totalAssigned: totalAssigned || 0,
            completed: completed || 0,
            pending: pending || 0,
            hasWhatsApp: hasWhatsApp || 0,
            noWhatsApp: noWhatsApp || 0,
            totalOrders: totalOrders || 0,
            completionRate: totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0,
            orderRate: completed > 0 ? Math.round((totalOrders / completed) * 100) : 0
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
      const { startDate, endDate } = getDateRange();

      const { count: total } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true });

      const { count: assigned } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .not('assigned_moderator', 'is', null)
        .gte('assigned_at', `${startDate}T00:00:00`)
        .lte('assigned_at', `${endDate}T23:59:59`);

      const { count: done } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'done')
        .gte('updated_at', `${startDate}T00:00:00`)
        .lte('updated_at', `${endDate}T23:59:59`);

      const { count: pending } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: totalOrders } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('has_ordered', true)
        .gte('order_date', `${startDate}T00:00:00`)
        .lte('order_date', `${endDate}T23:59:59`);

      const { count: todayOrders } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('has_ordered', true)
        .gte('order_date', `${startDate}T00:00:00`)
        .lte('order_date', `${endDate}T23:59:59`);

      const { count: hasWhatsApp } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('has_whatsapp', true)
        .gte('updated_at', `${startDate}T00:00:00`)
        .lte('updated_at', `${endDate}T23:59:59`);

      const { count: noWhatsApp } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('has_whatsapp', false)
        .gte('updated_at', `${startDate}T00:00:00`)
        .lte('updated_at', `${endDate}T23:59:59`);

      setStats({
        total: total || 0,
        assigned: assigned || 0,
        done: done || 0,
        pending: pending || 0,
        totalOrders: totalOrders || 0,
        todayOrders: todayOrders || 0,
        hasWhatsApp: hasWhatsApp || 0,
        noWhatsApp: noWhatsApp || 0
      });
    } catch (error) {
      console.error('Error fetching overall stats:', error);
    }
  };

  const fetchAllNumbers = async (page = 1, search = '') => {
    setNumbersLoading(true);
    try {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from('phone_numbers')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false });

      if (selectedCampaign !== 'all') {
        query = query.eq('campaign_type', selectedCampaign);
      }

      if (search.trim()) {
        const searchValue = search.trim();
        query = query.ilike('phone_number', `%${searchValue}%`);
      }

      // Apply status filters at database level
      if (statusFilter !== 'all') {
        switch (statusFilter) {
          case 'pending':
            query = query.eq('status', 'pending');
            break;
          case 'done':
            query = query.eq('status', 'done');
            break;
          case 'has_whatsapp':
            query = query.eq('has_whatsapp', true);
            break;
          case 'no_whatsapp':
            query = query.eq('has_whatsapp', false);
            break;
          case 'ordered':
            query = query.eq('has_ordered', true);
            break;
          case 'unassigned':
            query = query.is('assigned_moderator', null);
            break;
        }
      }

      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      const numbersWithModerators = await Promise.all(
        (data || []).map(async (number) => {
          if (number.assigned_moderator) {
            const { data: moderator } = await supabase
              .from('moderators')
              .select('name, email')
              .eq('id', number.assigned_moderator)
              .single();
            return { ...number, moderators: moderator };
          }
          return { ...number, moderators: null };
        })
      );

      setAllNumbers(numbersWithModerators);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching all numbers:', error);
    } finally {
      setNumbersLoading(false);
    }
  };

  const toggleModeratorStatus = async (moderatorId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('moderators')
        .update({ status: newStatus })
        .eq('id', moderatorId);

      if (error) throw error;

      alert(`Moderator ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      fetchModeratorsStats();
      fetchAllModerators();
      fetchOverallStats();
    } catch (error) {
      console.error('Error updating moderator status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const fetchAllModerators = async () => {
    try {
      const { data: moderatorsList, error } = await supabase
        .from('moderators')
        .select('*')
        .eq('role', 'moderator')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAllModerators(moderatorsList || []);
    } catch (error) {
      console.error('Error fetching all moderators:', error);
    }
  };

  const updateModeratorLimit = async (moderatorId, newLimit) => {
    try {
      const { error } = await supabase
        .from('moderators')
        .update({ daily_limit: newLimit })
        .eq('id', moderatorId);

      if (error) throw error;

      alert('Daily limit updated successfully!');
      fetchModeratorsStats();
    } catch (error) {
      console.error('Error updating moderator limit:', error);
      alert('Error updating limit. Please try again.');
    }
  };

  const updateModeratorRole = async (moderatorId, newRole) => {
    try {
      const { error } = await supabase
        .from('moderators')
        .update({ role: newRole })
        .eq('id', moderatorId);

      if (error) throw error;

      alert(`Role updated to ${newRole} successfully!`);
      fetchAllModerators();
    } catch (error) {
      console.error('Error updating moderator role:', error);
      alert('Error updating role. Please try again.');
    }
  };

  const downloadCustomReport = async () => {
    try {
      setNumbersLoading(true);
      
      // Determine date range based on report type
      let startDate, endDate;
      const today = new Date();
      
      switch(reportType) {
        case 'daily':
          startDate = endDate = selectedDate;
          break;
        case 'weekly':
          const weekStart = new Date(selectedDate);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          startDate = weekStart.toISOString().split('T')[0];
          endDate = weekEnd.toISOString().split('T')[0];
          break;
        case 'monthly':
          const monthStart = new Date(selectedDate);
          monthStart.setDate(1);
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthStart.getMonth() + 1);
          monthEnd.setDate(0);
          startDate = monthStart.toISOString().split('T')[0];
          endDate = monthEnd.toISOString().split('T')[0];
          break;
        case 'custom':
          startDate = dateRangeStart;
          endDate = dateRangeEnd;
          break;
        default:
          startDate = endDate = selectedDate;
      }

      // Fetch filtered data
      let allData = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        let query = supabase
          .from('phone_numbers')
          .select('*')
          .order('updated_at', { ascending: false })
          .gte('updated_at', `${startDate}T00:00:00`)
          .lte('updated_at', `${endDate}T23:59:59`)
          .range(from, from + batchSize - 1);

        if (selectedCampaign !== 'all') {
          query = query.eq('campaign_type', selectedCampaign);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          from += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      if (allData.length === 0) {
        alert('No data found for the selected date range.');
        return;
      }

      // Generate report
      const wb = XLSX.utils.book_new();
      
      // Summary for date range
      const rangeSummary = [
        [`${reportType.toUpperCase()} REPORT - ${startDate} to ${endDate}`],
        [''],
        ['SUMMARY'],
        ['Total Numbers:', allData.length],
        ['Has WhatsApp:', allData.filter(n => n.has_whatsapp === true).length],
        ['No WhatsApp:', allData.filter(n => n.has_whatsapp === false).length],
        ['Total Orders:', allData.filter(n => n.has_ordered === true).length],
        ['Completed:', allData.filter(n => n.status === 'done').length],
        ['Pending:', allData.filter(n => n.status === 'pending').length],
        ['Date Range:', `${startDate} to ${endDate}`],
        ['Report Type:', reportType],
        ['Campaign:', selectedCampaign === 'all' ? 'All Campaigns' : selectedCampaign],
        ['Generated:', new Date().toLocaleString()]
      ];

      const summaryWs = XLSX.utils.aoa_to_sheet(rangeSummary);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

      // Detailed data
      const detailedData = allData.map(number => ({
        'Phone Number': number.phone_number,
        'Name': number.name || 'No name',
        'Campaign': number.campaign_type === 'oasis_outfit' ? 'Oasis Outfit' : 'Zizii Island',
        'Status': number.status,
        'Has WhatsApp': number.has_whatsapp === null ? 'Not Checked' : (number.has_whatsapp ? 'Yes' : 'No'),
        'Has Ordered': number.has_ordered ? 'Yes' : 'No',
        'Order Date': number.order_date ? new Date(number.order_date).toLocaleDateString() : '',
        'Updated Date': number.updated_at ? new Date(number.updated_at).toLocaleDateString() : ''
      }));

      const detailWs = XLSX.utils.json_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(wb, detailWs, 'Detailed Data');

      // Generate filename
      const filename = `${reportType}_Report_${startDate}_to_${endDate}_${selectedCampaign}.xlsx`;
      XLSX.writeFile(wb, filename);
      
      alert(`Custom report downloaded! Records: ${allData.length}`);
    } catch (error) {
      console.error('Error generating custom report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setNumbersLoading(false);
    }
  };

  const downloadAllNumbers = async () => {
    try {
      setNumbersLoading(true);
      
      // Fetch ALL numbers without any limits
      let allData = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        let query = supabase
          .from('phone_numbers')
          .select('*')
          .order('id', { ascending: false })
          .range(from, from + batchSize - 1);

        if (selectedCampaign !== 'all') {
          query = query.eq('campaign_type', selectedCampaign);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          from += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      const data = allData;

      // Get moderator names for assigned numbers
      const numbersWithModerators = await Promise.all(
        (data || []).map(async (number) => {
          if (number.assigned_moderator) {
            const { data: moderator } = await supabase
              .from('moderators')
              .select('name, email')
              .eq('id', number.assigned_moderator)
              .single();
            return { ...number, moderator_name: moderator?.name || 'Unknown', moderator_email: moderator?.email || '' };
          }
          return { ...number, moderator_name: 'Unassigned', moderator_email: '' };
        })
      );

      // Prepare data for Excel
      const excelData = numbersWithModerators.map(number => ({
        'Phone Number': number.phone_number,
        'Name': number.name || 'No name',
        'Campaign': number.campaign_type === 'oasis_outfit' ? 'Oasis Outfit' : 'Zizii Island',
        'Status': number.status,
        'Has WhatsApp': number.has_whatsapp === null ? 'Not Checked' : (number.has_whatsapp ? 'Yes' : 'No'),
        'Has Ordered': number.has_ordered ? 'Yes' : 'No',
        'Order Date': number.order_date ? new Date(number.order_date).toLocaleDateString() : '',
        'Order Notes': number.order_notes || '',
        'Assigned Moderator': number.moderator_name,
        'Moderator Email': number.moderator_email,
        'Assigned Date': number.assigned_at ? new Date(number.assigned_at).toLocaleDateString() : '',
        'Updated Date': number.updated_at ? new Date(number.updated_at).toLocaleDateString() : ''
      }));

      // Generate date-wise summary
      const generateDateSummary = (data, type) => {
        const summary = {};
        data.forEach(number => {
          let dateKey;
          const date = new Date(number.updated_at || number.created_at);
          
          switch(type) {
            case 'daily':
              dateKey = date.toISOString().split('T')[0];
              break;
            case 'weekly':
              const weekStart = new Date(date);
              weekStart.setDate(date.getDate() - date.getDay());
              dateKey = `Week of ${weekStart.toISOString().split('T')[0]}`;
              break;
            case 'monthly':
              dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              break;
            default:
              dateKey = date.toISOString().split('T')[0];
          }
          
          if (!summary[dateKey]) {
            summary[dateKey] = {
              total: 0,
              hasWhatsApp: 0,
              noWhatsApp: 0,
              notChecked: 0,
              orders: 0,
              completed: 0,
              pending: 0
            };
          }
          
          summary[dateKey].total++;
          if (number.has_whatsapp === true) summary[dateKey].hasWhatsApp++;
          else if (number.has_whatsapp === false) summary[dateKey].noWhatsApp++;
          else summary[dateKey].notChecked++;
          
          if (number.has_ordered) summary[dateKey].orders++;
          if (number.status === 'done') summary[dateKey].completed++;
          else summary[dateKey].pending++;
        });
        
        return summary;
      };

      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new();
      
      // Main summary sheet
      const mainSummary = [
        ['WHATSAPP BULK MESSENGER - COMPREHENSIVE REPORT'],
        [''],
        ['OVERALL SUMMARY'],
        ['Total Numbers:', data.length],
        ['Has WhatsApp:', data.filter(n => n.has_whatsapp === true).length],
        ['No WhatsApp:', data.filter(n => n.has_whatsapp === false).length],
        ['Not Checked:', data.filter(n => n.has_whatsapp === null).length],
        ['Total Orders:', data.filter(n => n.has_ordered === true).length],
        ['Completed:', data.filter(n => n.status === 'done').length],
        ['Pending:', data.filter(n => n.status === 'pending').length],
        ['Campaign Filter:', selectedCampaign === 'all' ? 'All Campaigns' : selectedCampaign],
        ['Export Date:', new Date().toLocaleString()],
        [''],
        ['CAMPAIGN BREAKDOWN'],
        ['Oasis Outfit:', data.filter(n => n.campaign_type === 'oasis_outfit').length],
        ['Zizii Island:', data.filter(n => n.campaign_type === 'zizii_island').length],
        [''],
        ['CONVERSION RATES'],
        ['WhatsApp Success Rate:', `${((data.filter(n => n.has_whatsapp === true).length / data.filter(n => n.has_whatsapp !== null).length) * 100 || 0).toFixed(2)}%`],
        ['Order Conversion Rate:', `${((data.filter(n => n.has_ordered === true).length / data.filter(n => n.has_whatsapp === true).length) * 100 || 0).toFixed(2)}%`],
        ['Overall Completion Rate:', `${((data.filter(n => n.status === 'done').length / data.length) * 100 || 0).toFixed(2)}%`]
      ];

      // Create main summary worksheet
      const summaryWs = XLSX.utils.aoa_to_sheet(mainSummary);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

      // Daily Summary Sheet
      const dailySummary = generateDateSummary(data, 'daily');
      const dailyData = Object.entries(dailySummary).map(([date, stats]) => ({
        'Date': date,
        'Total': stats.total,
        'Has WhatsApp': stats.hasWhatsApp,
        'No WhatsApp': stats.noWhatsApp,
        'Not Checked': stats.notChecked,
        'Orders': stats.orders,
        'Completed': stats.completed,
        'Pending': stats.pending,
        'WhatsApp Rate': `${((stats.hasWhatsApp / (stats.hasWhatsApp + stats.noWhatsApp)) * 100 || 0).toFixed(1)}%`,
        'Order Rate': `${((stats.orders / stats.hasWhatsApp) * 100 || 0).toFixed(1)}%`
      }));
      const dailyWs = XLSX.utils.json_to_sheet(dailyData);
      XLSX.utils.book_append_sheet(wb, dailyWs, 'Daily Summary');

      // Weekly Summary Sheet
      const weeklySummary = generateDateSummary(data, 'weekly');
      const weeklyData = Object.entries(weeklySummary).map(([week, stats]) => ({
        'Week': week,
        'Total': stats.total,
        'Has WhatsApp': stats.hasWhatsApp,
        'No WhatsApp': stats.noWhatsApp,
        'Not Checked': stats.notChecked,
        'Orders': stats.orders,
        'Completed': stats.completed,
        'Pending': stats.pending,
        'WhatsApp Rate': `${((stats.hasWhatsApp / (stats.hasWhatsApp + stats.noWhatsApp)) * 100 || 0).toFixed(1)}%`,
        'Order Rate': `${((stats.orders / stats.hasWhatsApp) * 100 || 0).toFixed(1)}%`
      }));
      const weeklyWs = XLSX.utils.json_to_sheet(weeklyData);
      XLSX.utils.book_append_sheet(wb, weeklyWs, 'Weekly Summary');

      // Monthly Summary Sheet
      const monthlySummary = generateDateSummary(data, 'monthly');
      const monthlyData = Object.entries(monthlySummary).map(([month, stats]) => ({
        'Month': month,
        'Total': stats.total,
        'Has WhatsApp': stats.hasWhatsApp,
        'No WhatsApp': stats.noWhatsApp,
        'Not Checked': stats.notChecked,
        'Orders': stats.orders,
        'Completed': stats.completed,
        'Pending': stats.pending,
        'WhatsApp Rate': `${((stats.hasWhatsApp / (stats.hasWhatsApp + stats.noWhatsApp)) * 100 || 0).toFixed(1)}%`,
        'Order Rate': `${((stats.orders / stats.hasWhatsApp) * 100 || 0).toFixed(1)}%`
      }));
      const monthlyWs = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, monthlyWs, 'Monthly Summary');

      // Detailed data sheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns for detailed data
      const colWidths = [
        { wch: 15 }, // Phone Number
        { wch: 20 }, // Name
        { wch: 15 }, // Campaign
        { wch: 10 }, // Status
        { wch: 15 }, // Has WhatsApp
        { wch: 12 }, // Has Ordered
        { wch: 12 }, // Order Date
        { wch: 30 }, // Order Notes
        { wch: 20 }, // Assigned Moderator
        { wch: 25 }, // Moderator Email
        { wch: 15 }, // Assigned Date
        { wch: 15 }  // Updated Date
      ];
      ws['!cols'] = colWidths;

      // Add detailed data worksheet
      XLSX.utils.book_append_sheet(wb, ws, 'Detailed Data');

      // Generate filename
      const campaignName = selectedCampaign === 'all' ? 'All_Campaigns' : selectedCampaign;
      const filename = `WhatsApp_Numbers_Report_${campaignName}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
      
      alert(`Comprehensive report downloaded successfully! Total records: ${data.length}`);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report. Please try again.');
    } finally {
      setNumbersLoading(false);
    }
  };

  const handlePhoneAction = async (phoneId, action, value = null) => {
    try {
      let updateData = {};
      
      switch (action) {
        case 'whatsapp':
          updateData = { has_whatsapp: true, status: 'done', updated_at: new Date().toISOString() };
          break;
        case 'no_whatsapp':
          updateData = { has_whatsapp: false, status: 'done', updated_at: new Date().toISOString() };
          break;
        case 'order':
          updateData = { has_ordered: true, order_date: new Date().toISOString(), order_notes: value };
          break;
        case 'reset':
          updateData = { status: 'pending', has_whatsapp: null, has_ordered: false, order_date: null, order_notes: null, updated_at: new Date().toISOString() };
          break;
        case 'remove_order':
          updateData = { has_ordered: false, order_date: null, order_notes: null };
          break;
      }

      const { error } = await supabase
        .from('phone_numbers')
        .update(updateData)
        .eq('id', phoneId);

      if (error) throw error;

      fetchAllNumbers(currentPage, searchTerm);
      fetchOverallStats();
    } catch (error) {
      console.error('Error updating phone status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const filteredNumbers = allNumbers;

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

  const StatsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-6">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <Icon name="ShoppingCart" className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Orders</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
            <Icon name="TrendingUp" className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Today's Orders</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.todayOrders.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
            <Icon name="MessageCircle" className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Has WhatsApp</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.hasWhatsApp.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
            <Icon name="PhoneOff" className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">No WhatsApp</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.noWhatsApp.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );

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
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily View</option>
                <option value="weekly">Weekly View</option>
                <option value="monthly">Monthly View</option>
                <option value="custom">Custom Range</option>
              </select>
              {reportType === 'custom' ? (
                <>
                  <input
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="End Date"
                  />
                </>
              ) : (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
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
                onClick={() => setActiveTab('numbers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'numbers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Numbers
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'team'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Active Team
              </button>
              <button
                onClick={() => setActiveTab('all-moderators')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all-moderators'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Moderators
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <StatsCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Team Performance Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moderators}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalAssigned" fill="#8884d8" name="Assigned" />
                    <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                    <Bar dataKey="pending" fill="#ffc658" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: stats.done, fill: '#10b981' },
                        { name: 'Pending', value: stats.pending, fill: '#f59e0b' },
                        { name: 'Has WhatsApp', value: moderators.reduce((sum, m) => sum + m.hasWhatsApp, 0), fill: '#06b6d4' },
                        { name: 'No WhatsApp', value: moderators.reduce((sum, m) => sum + m.noWhatsApp, 0), fill: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            <StatsCards />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Team Management</h3>
                <p className="text-sm text-gray-500 mt-1">Monitor and manage moderator performance</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moderator</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Has WhatsApp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No WhatsApp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {moderators.map((moderator) => (
                      <tr key={moderator.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {moderator.name?.charAt(0)?.toUpperCase() || 'M'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{moderator.name}</div>
                              <div className="text-sm text-gray-500">{moderator.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold">{moderator.totalAssigned}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold text-green-600">{moderator.completed}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold text-yellow-600">{moderator.pending}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold text-emerald-600">{moderator.hasWhatsApp}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold text-red-600">{moderator.noWhatsApp}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold text-purple-600">{moderator.totalOrders}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" 
                                style={{ width: `${moderator.completionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{moderator.completionRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            moderator.orderRate >= 20 ? 'bg-green-100 text-green-800' :
                            moderator.orderRate >= 10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {moderator.orderRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            moderator.completionRate >= 80 ? 'bg-green-100 text-green-800' :
                            moderator.completionRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {moderator.completionRate >= 80 ? 'Excellent' :
                             moderator.completionRate >= 50 ? 'Good' : 'Needs Improvement'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {moderators.length === 0 && (
                  <div className="text-center py-12">
                    <Icon name="Users" size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No moderators found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'all-moderators' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={moderatorSearchTerm}
                      onChange={(e) => setModeratorSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <select
                    value={moderatorStatusFilter}
                    onChange={(e) => setModeratorStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Moderators Management</h3>
                <p className="text-sm text-gray-500 mt-1">Manage all moderators including inactive ones</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moderator</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allModerators
                      .filter(moderator => {
                        const matchesSearch = !moderatorSearchTerm || 
                                            (moderator.name && moderator.name.toLowerCase().includes(moderatorSearchTerm.toLowerCase())) ||
                                            (moderator.email && moderator.email.toLowerCase().includes(moderatorSearchTerm.toLowerCase()));
                        const currentStatus = moderator.status || 'active';
                        const matchesStatus = moderatorStatusFilter === 'all' ||
                                            (moderatorStatusFilter === 'active' && currentStatus === 'active') ||
                                            (moderatorStatusFilter === 'inactive' && currentStatus === 'inactive');
                        return matchesSearch && matchesStatus;
                      })
                      .map((moderator) => (
                      <tr key={moderator.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                moderator.status === 'active' 
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                                  : 'bg-gray-400'
                              }`}>
                                <span className="text-sm font-medium text-white">
                                  {moderator.name?.charAt(0)?.toUpperCase() || 'M'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{moderator.name}</div>
                              <div className="text-sm text-gray-500">{moderator.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            moderator.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {moderator.role || 'moderator'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            moderator.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {moderator.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            moderator.company === 'oasis_outfit' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {moderator.company === 'oasis_outfit' ? 'Oasis Outfit' : 'Zizii Island'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(moderator.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-1">
                            <button
                              onClick={() => toggleModeratorStatus(moderator.id, moderator.status || 'active')}
                              className={`px-2 py-1 rounded text-xs ${
                                (moderator.status || 'active') === 'active' 
                                  ? 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100'
                                  : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'
                              }`}
                            >
                              {(moderator.status || 'active') === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => {
                                const currentRole = moderator.role || 'moderator';
                                const newRole = currentRole === 'admin' ? 'moderator' : 'admin';
                                if (confirm(`Change role from ${currentRole} to ${newRole}?`)) {
                                  updateModeratorRole(moderator.id, newRole);
                                }
                              }}
                              className={`px-2 py-1 rounded text-xs ${
                                (moderator.role || 'moderator') === 'admin'
                                  ? 'text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100'
                                  : 'text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100'
                              }`}
                            >
                              {(moderator.role || 'moderator') === 'admin' ? 'Make Moderator' : 'Make Admin'}
                            </button>
                            <button
                              onClick={() => {
                                const newLimit = prompt(`Enter new daily limit for ${moderator.name} (current: ${moderator.daily_limit || 20}):`, moderator.daily_limit || 20);
                                if (newLimit && !isNaN(newLimit)) {
                                  updateModeratorLimit(moderator.id, parseInt(newLimit));
                                }
                              }}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                            >
                              Set Limit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allModerators
                  .filter(moderator => {
                    const matchesSearch = !moderatorSearchTerm || 
                                        (moderator.name && moderator.name.toLowerCase().includes(moderatorSearchTerm.toLowerCase())) ||
                                        (moderator.email && moderator.email.toLowerCase().includes(moderatorSearchTerm.toLowerCase()));
                    const currentStatus = moderator.status || 'active';
                    const matchesStatus = moderatorStatusFilter === 'all' ||
                                        (moderatorStatusFilter === 'active' && currentStatus === 'active') ||
                                        (moderatorStatusFilter === 'inactive' && currentStatus === 'inactive');
                    return matchesSearch && matchesStatus;
                  }).length === 0 && (
                  <div className="text-center py-12">
                    <Icon name="Users" size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No moderators found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'numbers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by phone number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="done">Completed</option>
                    <option value="has_whatsapp">Has WhatsApp</option>
                    <option value="no_whatsapp">No WhatsApp</option>
                    <option value="ordered">Ordered</option>
                    <option value="unassigned">Unassigned</option>
                  </select>
                  <button
                    onClick={() => fetchAllNumbers(currentPage, searchTerm)}
                    disabled={numbersLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Icon name={numbersLoading ? "Loader2" : "RefreshCw"} size={16} className={numbersLoading ? "animate-spin" : ""} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={downloadAllNumbers}
                    disabled={numbersLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Icon name={numbersLoading ? "Loader2" : "Download"} size={16} className={numbersLoading ? "animate-spin" : ""} />
                    <span>Download Report</span>
                  </button>
                  <button
                    onClick={downloadCustomReport}
                    disabled={numbersLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Icon name={numbersLoading ? "Loader2" : "BarChart3"} size={16} className={numbersLoading ? "animate-spin" : ""} />
                    <span>Custom Report</span>
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
                <div>
                  Showing {filteredNumbers.length} of {allNumbers.length} numbers (Page {currentPage} of {totalPages}) - 100 per page
                </div>
                <div className="mt-2 sm:mt-0 text-xs">
                  Total: {totalCount.toLocaleString()} numbers
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Numbers - Admin Control</h3>
                <p className="text-sm text-gray-500 mt-1">Full access to all numbers with moderator actions</p>
              </div>
              {numbersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="Loader2" size={32} className="animate-spin" />
                  <span className="ml-3">Loading numbers...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone & Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moderator</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredNumbers.map((number) => (
                        <tr key={number.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{number.phone_number}</div>
                              <div className="text-sm text-gray-500">{number.name || 'No name'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {number.moderators?.name || 'Unassigned'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {number.moderators?.email || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              number.status === 'done' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {number.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {number.has_whatsapp === null ? (
                              <span className="text-gray-400">Not checked</span>
                            ) : number.has_whatsapp ? (
                              <span className="text-green-600 font-medium">✓ Has WhatsApp</span>
                            ) : (
                              <span className="text-red-600 font-medium">✗ No WhatsApp</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {number.has_ordered ? (
                              <div>
                                <span className="text-emerald-600 font-medium">✓ Ordered</span>
                                <div className="text-xs text-gray-500">
                                  {new Date(number.order_date).toLocaleDateString()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">No order</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              number.campaign_type === 'oasis_outfit' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {number.campaign_type === 'oasis_outfit' ? 'Oasis' : 'Zizii'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              <button
                                onClick={() => {
                                  const cleanNumber = number.phone_number.replace(/[^0-9]/g, '');
                                  const formattedNumber = cleanNumber.startsWith('880') ? cleanNumber : `880${cleanNumber}`;
                                  const message = encodeURIComponent(`Hi ${number.name || 'there'}! 👋\\n\\nWe have exciting offers for you! Check out our latest collection.`);
                                  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${message}`;
                                  window.open(whatsappUrl, '_blank');
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1"
                              >
                                <Icon name="MessageCircle" size={12} />
                                <span>WA</span>
                              </button>
                              <button
                                onClick={() => {
                                  const cleanNumber = number.phone_number.replace(/[^0-9]/g, '');
                                  const formattedNumber = cleanNumber.startsWith('880') ? cleanNumber.substring(3) : cleanNumber;
                                  window.open(`tel:+880${formattedNumber}`, '_self');
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1"
                              >
                                <Icon name="Phone" size={12} />
                                <span>Call</span>
                              </button>
                              
                              {number.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handlePhoneAction(number.id, 'whatsapp')}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded text-xs"
                                  >
                                    ✓ Has WA
                                  </button>
                                  <button
                                    onClick={() => handlePhoneAction(number.id, 'no_whatsapp')}
                                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                                  >
                                    ✗ No WA
                                  </button>
                                </>
                              )}
                              
                              {number.has_whatsapp && !number.has_ordered && (
                                <button
                                  onClick={() => {
                                    const notes = prompt('Order notes (optional):');
                                    if (notes !== null) {
                                      handlePhoneAction(number.id, 'order', notes);
                                    }
                                  }}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                                >
                                  + Order
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  if (confirm('Reset this number to pending status?')) {
                                    handlePhoneAction(number.id, 'reset');
                                  }
                                }}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                              >
                                Reset
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredNumbers.length === 0 && (
                    <div className="text-center py-12">
                      <Icon name="Search" size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No numbers found matching your criteria</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages} ({totalCount.toLocaleString()} total numbers)
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchAllNumbers(1, searchTerm)}
                      disabled={currentPage === 1 || numbersLoading}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      First
                    </button>
                    <button
                      onClick={() => fetchAllNumbers(currentPage - 1, searchTerm)}
                      disabled={currentPage === 1 || numbersLoading}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <Icon name="ChevronLeft" size={16} />
                      <span>Previous</span>
                    </button>
                    <span className="px-3 py-1 text-sm bg-blue-50 border border-blue-200 rounded-md">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => fetchAllNumbers(currentPage + 1, searchTerm)}
                      disabled={currentPage === totalPages || numbersLoading}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <span>Next</span>
                      <Icon name="ChevronRight" size={16} />
                    </button>
                    <button
                      onClick={() => fetchAllNumbers(totalPages, searchTerm)}
                      disabled={currentPage === totalPages || numbersLoading}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;