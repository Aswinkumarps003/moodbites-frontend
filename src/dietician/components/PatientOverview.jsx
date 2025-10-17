import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Heart, TrendingUp } from 'lucide-react';

const PatientOverview = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPatients, setTotalPatients] = useState(0);
  const [activeConsultations, setActiveConsultations] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState(0);
  const [avgMoodScore, setAvgMoodScore] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        if (!token || !user?._id) {
          setLoading(false);
          return;
        }

        // Fetch patients (role 1)
        const [patientsRes, appointmentsRes] = await Promise.all([
          fetch('https://user-service-o0l2.onrender.com/api/user/users/role/1', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('https://user-service-o0l2.onrender.com/api/appointments/dietician', {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => null)
        ]);

        let patientsCount = 0;
        if (patientsRes && patientsRes.ok) {
          const patientsJson = await patientsRes.json();
          patientsCount = Array.isArray(patientsJson.users) ? patientsJson.users.length : (patientsJson.count || 0);
        }

        let activeConsults = 0;
        let upcoming = 0;
        if (appointmentsRes && appointmentsRes.ok) {
          const apptJson = await appointmentsRes.json();
          const appts = apptJson.appointments || [];
          const now = new Date();
          activeConsults = appts.filter(a => ['in-progress','confirmed'].includes(a.status)).length;
          upcoming = appts.filter(a => new Date(a.appointmentDate) >= now && ['scheduled','confirmed'].includes(a.status)).length;
        }

        setTotalPatients(patientsCount);
        setActiveConsultations(activeConsults);
        setUpcomingAppointments(upcoming);
        setAvgMoodScore(0);
      } catch (e) {
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?._id]);

  const stats = [
    { title: 'Total Patients', value: String(totalPatients), change: '', changeType: 'positive', icon: Users, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Active Consultations', value: String(activeConsultations), change: '', changeType: 'positive', icon: Calendar, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50' },
    { title: 'Upcoming Appointments', value: String(upcomingAppointments), change: '', changeType: 'positive', icon: Heart, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
    { title: 'Avg Mood Score', value: String(avgMoodScore), change: '', changeType: 'positive', icon: TrendingUp, color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {(loading ? Array.from({ length: 4 }).map((_, index) => ({ placeholder: true })) : stats).map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`${stat.placeholder ? 'bg-gray-100' : stat.bgColor} backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {stat.placeholder ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-3 w-24 bg-white/60 rounded" />
                    <div className="h-7 w-16 bg-white/80 rounded" />
                    <div className="h-3 w-28 bg-white/60 rounded" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</p>
                    <div className="flex items-center space-x-1">
                      <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500">vs last month</span>
                    </div>
                  </>
                )}
              </div>
              <div className={`w-12 h-12 ${stat.placeholder ? 'bg-gray-200' : `bg-gradient-to-r ${stat.color}`} rounded-xl flex items-center justify-center shadow-lg`}>
                {!stat.placeholder && Icon ? <Icon className="w-6 h-6 text-white" /> : null}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PatientOverview;


