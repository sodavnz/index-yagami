import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function VisitorCounter() {
  const [totalVisits, setTotalVisits] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);

  useEffect(() => {
    initializeSession();
    const interval = setInterval(updateHeartbeat, 30000);
    const subscription = subscribeToStats();

    return () => {
      clearInterval(interval);
      subscription?.unsubscribe();
      endSession();
    };
  }, []);

  const initializeSession = async () => {
    try {
      const hasVisited = localStorage.getItem('has_visited');
      
      if (!hasVisited) {
        try {
          const { error: statsError } = await supabase.rpc('increment_total_visits');
          if (statsError) {
            console.error('Error incrementing visits:', statsError);
          } else {
            localStorage.setItem('has_visited', 'true');
          }
        } catch (error) {
          console.error('Error calling increment function:', error);
        }
      }

      const { error: sessionError } = await supabase
        .from('visitor_sessions')
        .insert({
          session_id: sessionId,
          last_heartbeat: new Date().toISOString()
        });

      if (sessionError) console.error('Error creating session:', sessionError);
      
      await loadStats();
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const updateHeartbeat = async () => {
    try {
      await supabase
        .from('visitor_sessions')
        .update({ last_heartbeat: new Date().toISOString() })
        .eq('session_id', sessionId);
    } catch (error) {
      console.error('Error updating heartbeat:', error);
    }
  };

  const endSession = async () => {
    try {
      await supabase
        .from('visitor_sessions')
        .delete()
        .eq('session_id', sessionId);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsResponse = await supabase
        .from('site_statistics')
        .select('total_visits')
        .single();

      if (statsResponse?.data && !statsResponse.error) {
        setTotalVisits(statsResponse.data.total_visits || 0);
      }

      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const sessionsResponse = await supabase
        .from('visitor_sessions')
        .select('session_id', { count: 'exact' })
        .gte('last_heartbeat', twoMinutesAgo);

      if (sessionsResponse?.data && !sessionsResponse.error) {
        setOnlineUsers(sessionsResponse.data.length || 0);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const subscribeToStats = () => {
    const channel = supabase
      .channel('stats_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_statistics' },
        () => {
          loadStats();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'visitor_sessions' },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return channel;
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
      {/* Tổng lượt truy cập */}
      <div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3 shadow-lg hover:bg-white/20 transition-all duration-300 cursor-default group"
        title={`Tổng lượt truy cập: ${totalVisits.toLocaleString()}`}
      >
        <div className="relative">
          <i className="ri-eye-line text-xl text-white w-6 h-6 flex items-center justify-center"></i>
          {/* Tooltip hiển thị khi hover */}
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {totalVisits.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Số người online */}
      <div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3 shadow-lg hover:bg-white/20 transition-all duration-300 cursor-default group"
        title={`Đang online: ${onlineUsers}`}
      >
        <div className="relative">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <i className="ri-user-line text-xl text-white"></i>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse border border-white"></span>
          </div>
          {/* Tooltip hiển thị khi hover */}
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {onlineUsers}
          </div>
        </div>
      </div>
    </div>
  );
}