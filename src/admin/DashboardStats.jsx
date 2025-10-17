import React, { useState, useEffect } from 'react';
import { Users, Brain, Smile, Dumbbell, UserCheck, UserX } from 'lucide-react';
import StatCard from './StatCard';

const DashboardStats = () => {
  const [stats, setStats] = useState([
    { label: "Total Users", value: 0, icon: Users, bgGradient: "bg-gradient-to-r from-orange-100 to-amber-200", loading: true },
    { label: "Patients", value: 0, icon: UserCheck, bgGradient: "bg-gradient-to-r from-blue-100 to-cyan-200", loading: true },
    { label: "Dieticians", value: 0, icon: Dumbbell, bgGradient: "bg-gradient-to-r from-green-100 to-emerald-200", loading: true },
    { label: "Verified Dieticians", value: 0, icon: Smile, bgGradient: "bg-gradient-to-r from-purple-100 to-violet-200", loading: true },
  ]);

  const [chartData, setChartData] = useState({
    userRegistration: [
      { name: "Mon", value: 0 },
      { name: "Tue", value: 0 },
      { name: "Wed", value: 0 },
      { name: "Thu", value: 0 },
      { name: "Fri", value: 0 },
      { name: "Sat", value: 0 },
      { name: "Sun", value: 0 },
    ],
    userRoles: [
      { name: "Patients", value: 0 },
      { name: "Dieticians", value: 0 },
    ]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      // Fetch all users by role
      const [patientsResponse, dieticiansResponse] = await Promise.all([
        fetch('http://localhost:5000/api/user/users/role/1', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/user/users/role/2', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!patientsResponse.ok || !dieticiansResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const patientsData = await patientsResponse.json();
      const dieticiansData = await dieticiansResponse.json();

      console.log('Patients API response:', patientsData);
      console.log('Dieticians API response:', dieticiansData);

      // Extract users arrays from the API response
      const patients = patientsData.users || [];
      const dieticians = dieticiansData.users || [];

      console.log('Extracted patients:', patients);
      console.log('Extracted dieticians:', dieticians);

      // Calculate verified dieticians
      const verifiedDieticians = dieticians.filter(dietician => dietician.certValidated === true);
      
      console.log('Verified dieticians:', verifiedDieticians);
      console.log('Dietician certValidated values:', dieticians.map(d => ({ name: d.name, certValidated: d.certValidated })));

      // Update stats
      setStats(prevStats => [
        { 
          ...prevStats[0], 
          value: patients.length + dieticians.length, 
          loading: false 
        },
        { 
          ...prevStats[1], 
          value: patients.length, 
          loading: false 
        },
        { 
          ...prevStats[2], 
          value: dieticians.length, 
          loading: false 
        },
        { 
          ...prevStats[3], 
          value: verifiedDieticians.length, 
          loading: false 
        },
      ]);

      // Update chart data
      setChartData(prevData => ({
        userRegistration: generateWeeklyRegistrationData(patients, dieticians),
        userRoles: [
          { name: "Patients", value: patients.length },
          { name: "Dieticians", value: dieticians.length },
        ]
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set error state for stats
      setStats(prevStats => prevStats.map(stat => ({ ...stat, loading: false, error: true })));
    }
  };

  const generateWeeklyRegistrationData = (patients, dieticians) => {
    const allUsers = [...patients, ...dieticians];
    const weeklyData = [
      { name: "Mon", value: 0 },
      { name: "Tue", value: 0 },
      { name: "Wed", value: 0 },
      { name: "Thu", value: 0 },
      { name: "Fri", value: 0 },
      { name: "Sat", value: 0 },
      { name: "Sun", value: 0 },
    ];

    // Count registrations by day of week (simplified - using creation date)
    allUsers.forEach(user => {
      if (user.createdAt) {
        const dayOfWeek = new Date(user.createdAt).getDay();
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[dayOfWeek];
        
        const dayIndex = weeklyData.findIndex(day => day.name === dayName);
        if (dayIndex !== -1) {
          weeklyData[dayIndex].value += 1;
        }
      }
    });

    return weeklyData;
  };

  return {
    stats,
    chartData,
    refreshData: fetchDashboardData
  };
};

export default DashboardStats;
