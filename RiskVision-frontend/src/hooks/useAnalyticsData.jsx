import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

export const useAnalyticsData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setLoading(false);
        setError(new Error("Authentication token not found."));
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.analytics, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const rawUser = result.userSpecific || result.user_analytics || {};
        const rawGlobal = result.global || result.global_analytics || {};

        const userSpecific = {
          loginCount: rawUser.loginCount ?? rawUser.login_count ?? 0,
          lastLogin: rawUser.lastLogin ?? rawUser.last_login ?? null,
          recentLogins: (rawUser.recentLogins ?? rawUser.login_history ?? []).map(l => ({
            timestamp: l.timestamp,
            ipAddress: l.ipAddress || l.ip || 'Unknown'
          }))
        };

        const loginTrendsRaw = rawGlobal.loginTrend ?? rawGlobal.login_trends ?? {};
        const loginTrendArray = Array.isArray(loginTrendsRaw)
          ? loginTrendsRaw
          : Object.entries(loginTrendsRaw).map(([date, logins]) => ({ date, logins }));

        const globalData = {
          totalUsers: rawGlobal.totalUsers ?? rawGlobal.total_users ?? 0,
          activeUsers: rawGlobal.activeUsers ?? rawGlobal.active_users ?? 0,
          loginTrend: loginTrendArray
        };

        setData({
          ...result,
          userSpecific,
          global: globalData
        });
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
