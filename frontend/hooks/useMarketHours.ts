import { useState, useEffect, useCallback } from 'react';

export const useMarketHours = () => {
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  const checkMarketHours = useCallback(() => {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    
    const dayOfWeek = istTime.getDay();
    const currentHour = istTime.getHours();
    const currentMinute = istTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // Monday to Friday
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    
    // Market hours: 9:15 AM to 3:30 PM IST
    const marketStartMinutes = 9 * 60 + 15;  // 9:15 AM
    const marketEndMinutes = 15 * 60 + 30;   // 3:30 PM
    
    const isDuringMarketHours = currentTimeInMinutes >= marketStartMinutes && 
                               currentTimeInMinutes < marketEndMinutes;
    
    return isWeekday && isDuringMarketHours;
  }, []);

  useEffect(() => {
    const updateMarketStatus = () => {
      setIsMarketOpen(checkMarketHours());
    };

    // Initial check
    updateMarketStatus();

    // Check market status every minute
    const statusInterval = setInterval(updateMarketStatus, 60000);

    return () => clearInterval(statusInterval);
  }, [checkMarketHours]);

  return {
    isMarketOpen,
    checkMarketHours
  };
};
