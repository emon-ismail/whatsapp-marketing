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
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            🎂 Birthday Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Zizii Island Birthday Campaign</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-card border border-border rounded-lg p-3 sm:p-6 text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.today}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Today</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-6 text-center">
            <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.thisWeek}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">This Week</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-6 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.thisMonth}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">This Month</p>
          </div>
        </div>

        {/* Birthday Reminders (7 days before) */}
        {reminderBirthdays.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">🔔 Birthday Reminders (7 Days Before) ({reminderBirthdays.length})</h2>
            <div className="space-y-3 sm:space-y-4">
              {reminderBirthdays.map((item) => {
                const birthday = new Date(item.birthday);
                const birthdayThisYear = new Date(new Date().getFullYear(), birthday.getMonth(), birthday.getDate());
                const daysUntil = Math.ceil((birthdayThisYear - new Date()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={item.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
                          🔔
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate">{item.phone_number}</p>
                          <p className="text-sm font-medium text-blue-600 truncate">{item.person_name || 'No name'}</p>
                          <p className="text-xs sm:text-sm text-yellow-700">
                            Birthday in {daysUntil} days - {new Date(item.birthday).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleCall(item.phone_number)}
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          <Icon name="Phone" size={14} className="mr-1" />
                          <span>Call</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const name = item.person_name || 'friend';
                            const message = `Hi ${name}! Just wanted to remind you that your birthday is coming up in ${daysUntil} days! 🎉 Hope you're planning something special! 🎂`;
                            handleWhatsAppClick(item.phone_number, null, message);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                        >
                          <Icon name="MessageCircle" size={14} className="mr-1" />
                          <span className="hidden sm:inline">Remind</span>
                          <span className="sm:hidden">Remind</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const name = item.person_name || 'friend';
                            const message = `Hi ${name}! Your birthday is in ${daysUntil} days! 🎉 Hope you have a wonderful celebration! 🎂`;
                            handleSMS(item.phone_number, null, message);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                        >
                          <Icon name="MessageSquare" size={14} className="mr-1" />
                          <span>SMS</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(item.id)}
                          className="text-xs sm:text-sm"
                        >
                          <Icon name="Check" size={14} className="sm:mr-1" />
                          <span className="hidden sm:inline">Done</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Today's Birthdays */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">🎉 Today's Birthdays ({todayBirthdays.length})</h2>
          {todayBirthdays.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-card border rounded-lg">
              <Icon name="Gift" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No birthdays today</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {todayBirthdays.map((item) => (
                <div key={item.id} className="bg-card border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon name="Gift" size={20} className="text-yellow-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{item.phone_number}</p>
                        <p className="text-sm font-medium text-blue-600 truncate">{item.person_name || 'No name'}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(item.birthday).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleCall(item.phone_number)}
                        className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                      >
                        <Icon name="Phone" size={14} className="mr-1" />
                        <span className="hidden sm:inline">Call</span>
                        <span className="sm:hidden">Call</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleWhatsAppClick(item.phone_number, item.person_name)}
                        className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                      >
                        <Icon name="MessageCircle" size={14} className="mr-1" />
                        <span className="hidden sm:inline">WhatsApp</span>
                        <span className="sm:hidden">WA</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSMS(item.phone_number, item.person_name)}
                        className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                      >
                        <Icon name="MessageSquare" size={14} className="mr-1" />
                        <span className="hidden sm:inline">SMS</span>
                        <span className="sm:hidden">SMS</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(item.id)}
                        className="text-xs sm:text-sm"
                      >
                        <Icon name="Check" size={14} className="sm:mr-1" />
                        <span className="hidden sm:inline">Done</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>



        {/* Recent Birthdays */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">🎂 Recent (Last 7 Days) ({recentBirthdays.length})</h2>
          {recentBirthdays.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-card border rounded-lg">
              <Icon name="Clock" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No recent birthdays</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentBirthdays.map((item) => (
                <div key={item.id} className="bg-card border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon name="Clock" size={20} className="text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{item.phone_number}</p>
                        <p className="text-sm font-medium text-blue-600 truncate">{item.person_name || 'No name'}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(item.birthday).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleCall(item.phone_number)}
                        className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                      >
                        <Icon name="Phone" size={14} className="mr-1" />
                        <span className="hidden sm:inline">Call</span>
                        <span className="sm:hidden">Call</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleWhatsAppClick(item.phone_number, item.person_name)}
                        className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                      >
                        <Icon name="MessageCircle" size={14} className="mr-1" />
                        <span className="hidden sm:inline">WhatsApp</span>
                        <span className="sm:hidden">WA</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSMS(item.phone_number, item.person_name)}
                        className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                      >
                        <Icon name="MessageSquare" size={14} className="mr-1" />
                        <span className="hidden sm:inline">SMS</span>
                        <span className="sm:hidden">SMS</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(item.id)}
                        className="text-xs sm:text-sm"
                      >
                        <Icon name="Check" size={14} className="sm:mr-1" />
                        <span className="hidden sm:inline">Done</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Birthdays */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">📅 Upcoming (Next 7 Days) ({upcomingBirthdays.length})</h2>
          {upcomingBirthdays.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-card border rounded-lg">
              <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No upcoming birthdays</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
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
                  <div key={item.id} className="bg-card border rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon name="Calendar" size={20} className="text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate">{item.phone_number}</p>
                          <p className="text-sm font-medium text-blue-600 truncate">{item.person_name || 'No name'}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Birthday in {daysUntil} days - {new Date(item.birthday).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleCall(item.phone_number)}
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          <Icon name="Phone" size={14} className="mr-1" />
                          <span>Call</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const name = item.person_name || 'friend';
                            const message = `Hi ${name}! Your birthday is coming up in ${daysUntil} days! 🎉 Just wanted to wish you an early happy birthday! 🎂`;
                            handleWhatsAppClick(item.phone_number, item.person_name, message);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                        >
                          <Icon name="MessageCircle" size={14} className="mr-1" />
                          <span className="hidden sm:inline">WhatsApp</span>
                          <span className="sm:hidden">WA</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const name = item.person_name || 'friend';
                            const message = `Hi ${name}! Your birthday is in ${daysUntil} days! 🎉 Early happy birthday wishes! 🎂`;
                            handleSMS(item.phone_number, item.person_name, message);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                        >
                          <Icon name="MessageSquare" size={14} className="mr-1" />
                          <span>SMS</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(item.id)}
                          className="text-xs sm:text-sm"
                        >
                          <Icon name="Check" size={14} className="sm:mr-1" />
                          <span className="hidden sm:inline">Done</span>
                        </Button>
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