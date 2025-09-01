import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const BirthdayDashboard = () => {
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
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

      setData(data);
      setTodayBirthdays(todayBirthdays);
      setUpcomingBirthdays(upcoming);
      
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

  const handleWhatsAppClick = (phoneNumber, personName) => {
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
    const message = encodeURIComponent(`🎉 Happy Birthday ${name}! 🎂 Wishing you a wonderful day filled with joy and happiness! 🎈`);
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

  const handleSMS = (phoneNumber, personName) => {
    let cleanNumber = phoneNumber.replace(/[^\\d]/g, '');
    
    // Add country code if missing
    if (cleanNumber.length === 10 && cleanNumber.startsWith('1')) {
      cleanNumber = '+880' + cleanNumber;
    }
    
    const name = personName ? personName : 'friend';
    const message = encodeURIComponent(`Happy Birthday ${name}! 🎂 Wishing you a wonderful day!`);
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🎂 Birthday Dashboard
          </h1>
          <p className="text-muted-foreground">Zizii Island Birthday Campaign</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
            <p className="text-sm text-muted-foreground">Today</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.thisWeek}</p>
            <p className="text-sm text-muted-foreground">This Week</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.thisMonth}</p>
            <p className="text-sm text-muted-foreground">This Month</p>
          </div>
        </div>

        {/* Today's Birthdays */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🎉 Today's Birthdays ({todayBirthdays.length})</h2>
          {todayBirthdays.length === 0 ? (
            <div className="text-center py-12 bg-card border rounded-lg">
              <p className="text-muted-foreground">No birthdays today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayBirthdays.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-card border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Icon name="Gift" size={20} className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">{item.phone_number}</p>
                      <p className="text-sm font-medium text-blue-600">{item.person_name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.birthday).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCall(item.phone_number)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Icon name="Phone" size={14} className="mr-1" />
                      Call
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleWhatsAppClick(item.phone_number, item.person_name)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Icon name="MessageCircle" size={14} className="mr-1" />
                      WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSMS(item.phone_number, item.person_name)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Icon name="MessageSquare" size={14} className="mr-1" />
                      SMS
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(item.id)}
                    >
                      <Icon name="Check" size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>



        {/* Upcoming Birthdays */}
        <div>
          <h2 className="text-xl font-semibold mb-4">📅 Upcoming (Next 7 Days)</h2>
          {upcomingBirthdays.length === 0 ? (
            <div className="text-center py-8 bg-card border rounded-lg">
              <p className="text-muted-foreground">No upcoming birthdays</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBirthdays.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-card border rounded-lg opacity-75">
                  <div className="flex items-center space-x-3">
                    <Icon name="Calendar" size={16} className="text-blue-600" />
                    <div>
                      <p className="font-medium">{item.phone_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.birthday).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    Upcoming
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BirthdayDashboard;