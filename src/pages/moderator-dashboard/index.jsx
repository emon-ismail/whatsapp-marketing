import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { checkWhatsAppNumber } from '../../utils/whatsappChecker';

const ModeratorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [numbers, setNumbers] = useState([]);
  const [doneNumbers, setDoneNumbers] = useState([]);
  const [todayDoneNumbers, setTodayDoneNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [userRole, setUserRole] = useState('moderator');
  const [dailyStats, setDailyStats] = useState({ pending: 0, done: 0, hasWhatsApp: 0, noWhatsApp: 0, totalAssigned: 0, todayDone: 0 });
  const [noWhatsAppNumbers, setNoWhatsAppNumbers] = useState([]);
  const [allNumbers, setAllNumbers] = useState(0);
  const [clickedNumbers, setClickedNumbers] = useState(new Set());

  const dailyLimit = 20;
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchNumbers();
    fetchDoneNumbers();
    fetchTodayDoneNumbers();
  }, [user]);

  const fetchNumbers = async () => {
    try {
      if (!user) {
        setNumbers([]);
        setLoading(false);
        return;
      }

      // Check if moderator record exists
      let { data: moderatorData, error: moderatorError } = await supabase
        .from('moderators')
        .select('id, role')
        .eq('user_id', user.id)
        .single();

      if (moderatorError && moderatorError.code !== 'PGRST116') {
        console.error('Error fetching moderator:', moderatorError);
      }
      
      console.log('Moderator data:', moderatorData);

      // If no moderator record, create one
      if (!moderatorData) {
        const { data: newModerator, error: createError } = await supabase
          .from('moderators')
          .insert({
            user_id: user.id,
            name: user.email.split('@')[0],
            email: user.email,
            status: 'active',
            role: 'moderator'
          })
          .select('id, role')
          .single();

        if (createError) {
          console.error('Error creating moderator:', createError);
          setLoading(false);
          return;
        }

        moderatorData = newModerator;
        setUserRole(newModerator.role);

        // Auto-assign numbers to new moderator (only for regular moderators)
        if (newModerator.role === 'moderator') {
          await autoAssignNumbers(moderatorData.id);
        }
      }

      // Only fetch numbers for regular moderators
      if (moderatorData.role === 'moderator') {
        // Fetch ALL pending numbers assigned to this moderator (not just today's)
        const { data, error } = await supabase
          .from('phone_numbers')
          .select('*')
          .eq('status', 'pending')
          .eq('assigned_moderator', moderatorData.id)
          .order('created_at', { ascending: true })
          .limit(20); // Show 20 at a time for better performance

        if (error) throw error;
        
        setNumbers(data || []);
        
        // Get daily stats
        await fetchDailyStats(moderatorData.id);
        await fetchNoWhatsAppNumbers(moderatorData.id);
        await fetchAllNumbers(moderatorData.id);
      } else {
        // Admin/superadmin don't get assigned numbers
        setNumbers([]);
      }
      setUserRole(moderatorData.role);
      
      // Update progress (only for regular moderators)
      if (moderatorData.role === 'moderator') {
        await updateProgress(moderatorData.id);
      }
    } catch (error) {
      console.error('Error fetching numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoAssignNumbers = async (moderatorId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if moderator already has today's numbers
      const { count: todayCount } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_moderator', moderatorId)
        .gte('assigned_at', `${today}T00:00:00`)
        .lte('assigned_at', `${today}T23:59:59`);

      // Only assign if they have less than daily limit for today
      if (todayCount < dailyLimit) {
        const needed = dailyLimit - todayCount;
        const { data: unassignedNumbers } = await supabase
          .from('phone_numbers')
          .select('id')
          .is('assigned_moderator', null)
          .eq('status', 'pending')
          .limit(needed);

        if (unassignedNumbers && unassignedNumbers.length > 0) {
          for (const number of unassignedNumbers) {
            const { error } = await supabase.rpc('assign_number_to_moderator', {
              phone_id: number.id,
              moderator_id: moderatorId
            });
            
            if (error) {
              console.error('Error assigning number:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in auto-assign:', error);
    }
  };

  const fetchDailyStats = async (moderatorId) => {
    try {
      console.log('Fetching stats for moderator ID:', moderatorId);
      
      // Get ALL pending numbers (lifetime)
      const { count: pending, error: pendingError } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_moderator', moderatorId)
        .eq('status', 'pending');

      if (pendingError) console.error('Pending error:', pendingError);

      // Get ALL done numbers (lifetime)
      const { count: done, error: doneError } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_moderator', moderatorId)
        .eq('status', 'done');

      if (doneError) console.error('Done error:', doneError);

      // Get ALL has WhatsApp numbers (lifetime)
      const { count: hasWhatsApp, error: whatsappError } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_moderator', moderatorId)
        .eq('has_whatsapp', true);

      if (whatsappError) console.error('WhatsApp error:', whatsappError);

      // Get ALL no WhatsApp numbers (lifetime)
      const { count: noWhatsApp, error: noWhatsappError } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_moderator', moderatorId)
        .eq('has_whatsapp', false);

      if (noWhatsappError) console.error('No WhatsApp error:', noWhatsappError);

      // Get total assigned numbers
      const { count: totalAssigned, error: totalError } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_moderator', moderatorId);

      if (totalError) console.error('Total error:', totalError);

      // Get today's completed numbers
      const { count: todayDone, error: todayError } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_moderator', moderatorId)
        .eq('status', 'done')
        .gte('updated_at', `${today}T00:00:00`)
        .lte('updated_at', `${today}T23:59:59`);

      if (todayError) console.error('Today done error:', todayError);

      console.log('Stats results:', { pending, done, hasWhatsApp, noWhatsApp, totalAssigned, todayDone });

      setDailyStats({
        pending: pending || 0,
        done: done || 0,
        hasWhatsApp: hasWhatsApp || 0,
        noWhatsApp: noWhatsApp || 0,
        totalAssigned: totalAssigned || 0,
        todayDone: todayDone || 0
      });
    } catch (error) {
      console.error('Error fetching daily stats:', error);
    }
  };

  const fetchNoWhatsAppNumbers = async (moderatorId) => {
    try {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('assigned_moderator', moderatorId)
        .eq('has_whatsapp', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNoWhatsAppNumbers(data || []);
    } catch (error) {
      console.error('Error fetching no WhatsApp numbers:', error);
    }
  };

  const fetchAllNumbers = async (moderatorId) => {
    try {
      const { count } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_moderator', moderatorId);

      setAllNumbers(count || 0);
    } catch (error) {
      console.error('Error fetching all numbers count:', error);
    }
  };

  const updateProgress = async (moderatorId) => {
    try {
      const { count: totalAssigned } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_moderator', moderatorId);

      const { count: completed } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_moderator', moderatorId)
        .eq('status', 'done');

      const percentage = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;
      
      setProgress({ completed, total: totalAssigned, percentage });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const fetchDoneNumbers = async () => {
    try {
      if (!user) {
        setDoneNumbers([]);
        return;
      }

      // Get moderator record for current user
      const { data: moderatorData } = await supabase
        .from('moderators')
        .select('id, role')
        .eq('user_id', user.id)
        .single();

      if (!moderatorData) {
        setDoneNumbers([]);
        return;
      }

      // Only fetch done numbers for regular moderators
      if (moderatorData.role === 'moderator') {
        const { data, error } = await supabase
          .from('phone_numbers')
          .select('*')
          .eq('status', 'done')
          .eq('assigned_moderator', moderatorData.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setDoneNumbers(data || []);
      } else {
        setDoneNumbers([]);
      }
    } catch (error) {
      console.error('Error fetching done numbers:', error);
    }
  };

  const fetchTodayDoneNumbers = async () => {
    try {
      if (!user) {
        setTodayDoneNumbers([]);
        return;
      }

      // Get moderator record for current user
      const { data: moderatorData } = await supabase
        .from('moderators')
        .select('id, role')
        .eq('user_id', user.id)
        .single();

      if (!moderatorData) {
        setTodayDoneNumbers([]);
        return;
      }

      // Only fetch today's done numbers for regular moderators
      if (moderatorData.role === 'moderator') {
        const { data, error } = await supabase
          .from('phone_numbers')
          .select('*')
          .eq('status', 'done')
          .eq('assigned_moderator', moderatorData.id)
          .gte('updated_at', `${today}T00:00:00`)
          .lte('updated_at', `${today}T23:59:59`)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setTodayDoneNumbers(data || []);
      } else {
        setTodayDoneNumbers([]);
      }
    } catch (error) {
      console.error('Error fetching today done numbers:', error);
    }
  };

  const handleWhatsAppClick = (phoneNumber, numberId) => {
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}`;
    window.open(whatsappUrl, '_blank');
    
    // Mark this number as clicked
    setClickedNumbers(prev => new Set([...prev, numberId]));
  };

  const handleStatusUpdate = async (numberId, status, hasWhatsapp = null) => {
    try {
      const { error } = await supabase.rpc('update_phone_status', {
        phone_id: numberId,
        new_status: status,
        whatsapp_status: hasWhatsapp
      });

      if (error) throw error;

      // Check if we need to assign more numbers
      if (user) {
        const { data: moderatorData } = await supabase
          .from('moderators')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (moderatorData) {
          await autoAssignNumbers(moderatorData.id);
        }
      }
      
      fetchNumbers();
      fetchDoneNumbers();
      fetchTodayDoneNumbers();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCall = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    const telUrl = `tel:${cleanNumber}`;
    window.location.href = telUrl;
  };

  const handleCheckWhatsApp = (item) => {
    // Open WhatsApp directly
    handleWhatsAppClick(item.phone_number);
    
    // Show confirmation dialog after 3 seconds
    setTimeout(() => {
      const hasWhatsApp = confirm(
        `Did WhatsApp open successfully for ${item.phone_number}?\n\n` +
        'Click OK if WhatsApp opened and shows the chat.\n' +
        'Click Cancel if you got "Phone number not on WhatsApp" error.'
      );
      
      // Update database with user's confirmation
      handleStatusUpdate(item.id, 'done', hasWhatsApp);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-4" />
          <p>Loading numbers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Icon name="BarChart3" size={24} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm md:text-base text-muted-foreground">
              Today's WhatsApp messaging tasks
            </p>
            <div className="mt-2 sm:mt-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Campaign: Oasis Outfit
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 p-4 md:p-6 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
              <span className="text-sm font-semibold text-gray-800">Daily Progress</span>
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {progress.completed} / {progress.total} ({progress.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-3 font-medium">
              Total: {dailyStats.totalAssigned} assigned • {dailyStats.pending} pending • {dailyStats.done} completed
            </p>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Icon name="Users" size={16} className="text-white" />
              </div>
              <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{dailyStats.totalAssigned}</p>
              <p className="text-xs md:text-sm text-gray-600 font-medium">Total Assigned</p>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Icon name="Clock" size={16} className="text-white" />
              </div>
              <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{dailyStats.pending}</p>
              <p className="text-xs md:text-sm text-gray-600 font-medium">Pending</p>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Icon name="CheckCircle" size={16} className="text-white" />
              </div>
              <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{dailyStats.done}</p>
              <p className="text-xs md:text-sm text-gray-600 font-medium">Done</p>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Icon name="MessageCircle" size={16} className="text-white" />
              </div>
              <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{dailyStats.hasWhatsApp}</p>
              <p className="text-xs md:text-sm text-gray-600 font-medium">Has WhatsApp</p>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Icon name="XCircle" size={16} className="text-white" />
              </div>
              <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{dailyStats.noWhatsApp}</p>
              <p className="text-xs md:text-sm text-gray-600 font-medium">No WhatsApp</p>
            </div>
          </div>
        </div>

        {/* Mobile-friendly tabs */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 mb-6 bg-white/50 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-white/20">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
              activeTab === 'pending'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <span className="block sm:hidden">Work ({numbers.length}/20)</span>
            <span className="hidden sm:block">Today's Work ({numbers.length}/20)</span>
          </button>
          <button
            onClick={() => setActiveTab('todaydone')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
              activeTab === 'todaydone'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <span className="block sm:hidden">Today ({dailyStats.todayDone})</span>
            <span className="hidden sm:block">Completed Today ({dailyStats.todayDone})</span>
          </button>
          <button
            onClick={() => setActiveTab('done')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
              activeTab === 'done'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <span className="block sm:hidden">All Done ({dailyStats.done})</span>
            <span className="hidden sm:block">All Completed ({dailyStats.done})</span>
          </button>
          <button
            onClick={() => setActiveTab('nowhatsapp')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
              activeTab === 'nowhatsapp'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            No WhatsApp ({dailyStats.noWhatsApp})
          </button>
        </div>

        {activeTab === 'pending' ? (
          <div className="space-y-4">
            {numbers.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Phone" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">No pending numbers</h3>
                <p className="text-muted-foreground">All numbers have been processed</p>
              </div>
            ) : (
              numbers.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 border rounded-xl transition-all space-y-3 sm:space-y-0 shadow-lg hover:shadow-xl ${
                    clickedNumbers.has(item.id) 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 shadow-md' 
                      : 'bg-white/70 backdrop-blur-sm border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md ${
                      clickedNumbers.has(item.id)
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-br from-gray-400 to-gray-600'
                    }`}>
                      <Icon 
                        name={clickedNumbers.has(item.id) ? "MessageCircle" : "Phone"} 
                        size={16} 
                        className="text-white" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.phone_number}</p>
                        {clickedNumbers.has(item.id) && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-fit mt-1 sm:mt-0 shadow-sm">
                            WhatsApp Opened
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">
                        Added: {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Mobile-optimized buttons */}
                  <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCall(item.phone_number)}
                      className="flex items-center space-x-1 flex-1 sm:flex-none justify-center"
                    >
                      <Icon name="Phone" size={14} />
                      <span className="text-xs sm:text-sm">Call</span>
                    </Button>
                    <Button
                      variant={clickedNumbers.has(item.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleWhatsAppClick(item.phone_number, item.id)}
                      className={`flex items-center space-x-1 flex-1 sm:flex-none justify-center ${
                        clickedNumbers.has(item.id) 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : ''
                      }`}
                    >
                      <Icon name="MessageCircle" size={14} />
                      <span className="text-xs sm:text-sm">{clickedNumbers.has(item.id) ? 'Opened' : 'WhatsApp'}</span>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleStatusUpdate(item.id, 'done', true)}
                      className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none justify-center"
                    >
                      <Icon name="Check" size={14} />
                      <span className="text-xs sm:text-sm">Done</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStatusUpdate(item.id, 'done', false)}
                      className="flex items-center space-x-1 flex-1 sm:flex-none justify-center"
                    >
                      <Icon name="X" size={14} />
                      <span className="text-xs sm:text-sm">No WhatsApp</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'todaydone' ? (
          <div className="space-y-4">
            {todayDoneNumbers.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">No numbers completed today</h3>
                <p className="text-muted-foreground">Numbers you complete today will appear here</p>
              </div>
            ) : (
              todayDoneNumbers.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg opacity-75"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                      <Icon name="CheckCircle" size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.phone_number}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">
                          Completed: {new Date(item.updated_at).toLocaleDateString()}
                        </p>
                        {item.has_whatsapp !== null && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.has_whatsapp 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.has_whatsapp ? 'Has WhatsApp' : 'No WhatsApp'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWhatsAppClick(item.phone_number)}
                      className="flex items-center space-x-2"
                    >
                      <Icon name="MessageCircle" size={16} />
                      <span>WhatsApp</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'done' ? (
          <div className="space-y-4">
            {doneNumbers.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">No completed numbers</h3>
                <p className="text-muted-foreground">Numbers you mark as done will appear here</p>
              </div>
            ) : (
              doneNumbers.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg opacity-75"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                      <Icon name="CheckCircle" size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.phone_number}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">
                          Completed: {new Date(item.updated_at).toLocaleDateString()}
                        </p>
                        {item.has_whatsapp !== null && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.has_whatsapp 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.has_whatsapp ? 'Has WhatsApp' : 'No WhatsApp'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWhatsAppClick(item.phone_number)}
                      className="flex items-center space-x-2"
                    >
                      <Icon name="MessageCircle" size={16} />
                      <span>WhatsApp</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {noWhatsAppNumbers.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="XCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">No numbers without WhatsApp</h3>
                <p className="text-muted-foreground">Numbers marked as "No WhatsApp" will appear here</p>
              </div>
            ) : (
              noWhatsAppNumbers.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg opacity-75"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                      <Icon name="XCircle" size={20} className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.phone_number}</p>
                      <p className="text-sm text-muted-foreground">
                        Marked: {new Date(item.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                      No WhatsApp
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeratorDashboard;