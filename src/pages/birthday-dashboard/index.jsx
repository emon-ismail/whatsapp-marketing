import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const BirthdayDashboard = () => {
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [recentBirthdays, setRecentBirthdays] = useState([]);
  const [reminderBirthdays, setReminderBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, thisWeek: 0, thisMonth: 0 });
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchBirthdayData();
  }, []);

  const fetchBirthdayData = async () => {
    try {
      const { data } = await supabase
        .from('birthday_numbers')
        .select('*')
        .eq('status', 'pending');

      const today = new Date();
      const todayBirthdays = data?.filter(item => {
        if (!item.birthday) return false;
        const birthday = new Date(item.birthday);
        return birthday.getMonth() === today.getMonth() && 
               birthday.getDate() === today.getDate();
      }) || [];

      const upcoming = data?.filter(item => {
        if (!item.birthday) return false;
        const birthday = new Date(item.birthday);
        
        // Skip if it's today's birthday
        if (birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate()) {
          return false;
        }
        
        // Check if birthday is in next 7 days
        const birthdayThisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        const birthdayNextYear = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
        
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysUntilThisYear = Math.ceil((birthdayThisYear - today) / msPerDay);
        const daysUntilNextYear = Math.ceil((birthdayNextYear - today) / msPerDay);
        
        return (daysUntilThisYear >= 1 && daysUntilThisYear <= 7) || 
               (daysUntilNextYear >= 1 && daysUntilNextYear <= 7);
      }) || [];

      // Birthday reminders (7 days before birthday)
      const reminders = data?.filter(item => {
        if (!item.birthday) return false;
        const birthday = new Date(item.birthday);
        
        // Calculate 7 days before birthday
        const birthdayThisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        const birthdayNextYear = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
        
        const reminderDateThisYear = new Date(birthdayThisYear);
        reminderDateThisYear.setDate(reminderDateThisYear.getDate() - 7);
        
        const reminderDateNextYear = new Date(birthdayNextYear);
        reminderDateNextYear.setDate(reminderDateNextYear.getDate() - 7);
        
        const todayStr = today.toDateString();
        
        return reminderDateThisYear.toDateString() === todayStr || 
               reminderDateNextYear.toDateString() === todayStr;
      }) || [];

      const recent = data?.filter(item => {
        if (!item.birthday) return false;
        const birthday = new Date(item.birthday);
        
        // Skip if it's today's birthday
        if (birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate()) {
          return false;
        }
        
        // Check if birthday was in last 7 days
        const birthdayThisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        const birthdayLastYear = new Date(today.getFullYear() - 1, birthday.getMonth(), birthday.getDate());
        
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysSinceThisYear = Math.ceil((today - birthdayThisYear) / msPerDay);
        const daysSinceLastYear = Math.ceil((today - birthdayLastYear) / msPerDay);
        
        return (daysSinceThisYear >= 1 && daysSinceThisYear <= 7) || 
               (daysSinceLastYear >= 1 && daysSinceLastYear <= 7);
      }) || [];

      setData(data);
      setTodayBirthdays(todayBirthdays);
      setUpcomingBirthdays(upcoming);
      setRecentBirthdays(recent);
      setReminderBirthdays(reminders);
      
      setStats({
        today: todayBirthdays.length,
        thisWeek: todayBirthdays.length + upcoming.length,
        thisMonth: data?.filter(item => {
          const birthday = new Date(item.birthday);
          return birthday.getMonth() === today.getMonth();
        }).length || 0
      });

    } catch (error) {
      console.error('Error fetching birthday data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = (phoneNumber, personName, customMessage = null) => {
    let cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    
    // Handle different number formats
    if (cleanNumber.length === 11 && cleanNumber.startsWith('01')) {
      // Bangladesh mobile format: 01XXXXXXXXX -> 8801XXXXXXXXX
      cleanNumber = '880' + cleanNumber;
    } else if (cleanNumber.length === 10 && cleanNumber.startsWith('1')) {
      // 10 digit starting with 1: 1XXXXXXXXX -> 8801XXXXXXXXX
      cleanNumber = '880' + cleanNumber;
    }
    // If already has country code (13 digits), use as is
    
    console.log('Original:', phoneNumber, 'Clean:', cleanNumber);
    const name = personName ? personName : 'friend';
    const defaultMessage = `🎉 Happy Birthday ${name}! 🎂 Wishing you a wonderful day filled with joy and happiness! 🎈`;
    const message = encodeURIComponent(customMessage || defaultMessage);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCall = (phoneNumber) => {
    let cleanNumber = phoneNumber.replace(/[^\\d]/g, '');
    
    // Add country code if missing
    if (cleanNumber.length === 10 && cleanNumber.startsWith('1')) {
      cleanNumber = '+880' + cleanNumber;
    }
    
    window.location.href = `tel:${cleanNumber}`;
  };

  const handleSMS = (phoneNumber, personName, customMessage = null) => {
    let cleanNumber = phoneNumber.replace(/[^\\d]/g, '');
    
    // Add country code if missing
    if (cleanNumber.length === 10 && cleanNumber.startsWith('1')) {
      cleanNumber = '+880' + cleanNumber;
    }
    
    const name = personName ? personName : 'friend';
    const defaultMessage = `Happy Birthday ${name}! 🎂 Wishing you a wonderful day!`;
    const message = encodeURIComponent(customMessage || defaultMessage);
    window.location.href = `sms:${cleanNumber}?body=${message}`;
  };

  const handleStatusUpdate = async (numberId) => {
    try {
      await supabase
        .from('birthday_numbers')
        .update({ status: 'done', updated_at: new Date().toISOString() })
        .eq('id', numberId);
      fetchBirthdayData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={32} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
              <Icon name="Gift" className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Birthday Dashboard
            </h1>
          </div>
          <p className="text-sm text-gray-600">Zizii Island Birthday Campaign Management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
                <Icon name="Gift" className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Birthdays</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.today}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
                <Icon name="Calendar" className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.thisWeek}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Icon name="CalendarDays" className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.thisMonth}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Birthday Reminders */}
        {reminderBirthdays.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Icon name="Bell" className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-medium text-gray-900">Birthday Reminders</h2>
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">{reminderBirthdays.length}</span>
            </div>
            <div className="grid gap-4">
              {reminderBirthdays.map((item) => {
                const birthday = new Date(item.birthday);
                const birthdayThisYear = new Date(new Date().getFullYear(), birthday.getMonth(), birthday.getDate());
                const daysUntil = Math.ceil((birthdayThisYear - new Date()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={item.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                          <Icon name="Bell" className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.phone_number}</p>
                          <p className="text-sm font-medium text-blue-600">{item.person_name || 'No name'}</p>
                          <p className="text-sm text-amber-700">Birthday in {daysUntil} days • {new Date(item.birthday).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleCall(item.phone_number)} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm">
                          <Icon name="Phone" className="h-4 w-4" />
                          <span>Call</span>
                        </button>
                        <button onClick={() => {
                          const name = item.person_name || 'friend';
                          const message = `Hi ${name}! Your birthday is in ${daysUntil} days! 🎉 Hope you have a wonderful celebration! 🎂`;
                          handleWhatsAppClick(item.phone_number, null, message);
                        }} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm">
                          <Icon name="MessageCircle" className="h-4 w-4" />
                          <span>WhatsApp</span>
                        </button>
                        <button onClick={() => handleStatusUpdate(item.id)} className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-1 text-sm">
                          <Icon name="Check" className="h-4 w-4" />
                          <span>Done</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Today's Birthdays */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Gift" className="h-5 w-5 text-pink-600" />
            <h2 className="text-lg font-medium text-gray-900">Today's Birthdays</h2>
            <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2 py-1 rounded-full">{todayBirthdays.length}</span>
          </div>
          {todayBirthdays.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Icon name="Gift" className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No birthdays today</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {todayBirthdays.map((item) => (
                <div key={item.id} className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                        <Icon name="Gift" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.phone_number}</p>
                        <p className="text-sm font-medium text-blue-600">{item.person_name || 'No name'}</p>
                        <p className="text-sm text-gray-500">{new Date(item.birthday).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleCall(item.phone_number)} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm">
                        <Icon name="Phone" className="h-4 w-4" />
                        <span>Call</span>
                      </button>
                      <button onClick={() => handleWhatsAppClick(item.phone_number, item.person_name)} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm">
                        <Icon name="MessageCircle" className="h-4 w-4" />
                        <span>WhatsApp</span>
                      </button>
                      <button onClick={() => handleSMS(item.phone_number, item.person_name)} className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1 text-sm">
                        <Icon name="MessageSquare" className="h-4 w-4" />
                        <span>SMS</span>
                      </button>
                      <button onClick={() => handleStatusUpdate(item.id)} className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-1 text-sm">
                        <Icon name="Check" className="h-4 w-4" />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>



        {/* Recent Birthdays */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Clock" className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-medium text-gray-900">Recent Birthdays</h2>
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">{recentBirthdays.length}</span>
          </div>
          {recentBirthdays.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Icon name="Clock" className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No recent birthdays</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {recentBirthdays.map((item) => (
                <div key={item.id} className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                        <Icon name="Clock" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.phone_number}</p>
                        <p className="text-sm font-medium text-blue-600">{item.person_name || 'No name'}</p>
                        <p className="text-sm text-gray-500">{new Date(item.birthday).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleCall(item.phone_number)} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm">
                        <Icon name="Phone" className="h-4 w-4" />
                        <span>Call</span>
                      </button>
                      <button onClick={() => handleWhatsAppClick(item.phone_number, item.person_name)} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm">
                        <Icon name="MessageCircle" className="h-4 w-4" />
                        <span>WhatsApp</span>
                      </button>
                      <button onClick={() => handleStatusUpdate(item.id)} className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-1 text-sm">
                        <Icon name="Check" className="h-4 w-4" />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Birthdays */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Calendar" className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Upcoming Birthdays</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">{upcomingBirthdays.length}</span>
          </div>
          {upcomingBirthdays.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Icon name="Calendar" className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No upcoming birthdays</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingBirthdays.map((item) => {
                const birthday = new Date(item.birthday);
                const today = new Date();
                const birthdayThisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
                const birthdayNextYear = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
                
                let daysUntil;
                if (birthdayThisYear >= today) {
                  daysUntil = Math.ceil((birthdayThisYear - today) / (1000 * 60 * 60 * 24));
                } else {
                  daysUntil = Math.ceil((birthdayNextYear - today) / (1000 * 60 * 60 * 24));
                }
                
                return (
                  <div key={item.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <Icon name="Calendar" className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.phone_number}</p>
                          <p className="text-sm font-medium text-blue-600">{item.person_name || 'No name'}</p>
                          <p className="text-sm text-blue-700">Birthday in {daysUntil} days • {new Date(item.birthday).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleCall(item.phone_number)} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm">
                          <Icon name="Phone" className="h-4 w-4" />
                          <span>Call</span>
                        </button>
                        <button onClick={() => {
                          const name = item.person_name || 'friend';
                          const message = `Hi ${name}! Your birthday is coming up in ${daysUntil} days! 🎉 Just wanted to wish you an early happy birthday! 🎂`;
                          handleWhatsAppClick(item.phone_number, item.person_name, message);
                        }} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm">
                          <Icon name="MessageCircle" className="h-4 w-4" />
                          <span>WhatsApp</span>
                        </button>
                        <button onClick={() => handleStatusUpdate(item.id)} className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-1 text-sm">
                          <Icon name="Check" className="h-4 w-4" />
                          <span>Done</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BirthdayDashboard;