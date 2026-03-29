import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, MessageCircle, Eye, Phone, Video, Clock, CheckCircle, Users, TrendingUp, ChevronRight } from 'lucide-react';

const PatientsList = ({ fullWidth = false, user }) => {
  const [patients, setPatients] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]); // from chat-service
  // COMMENTED OUT FOR TESTING - Appointment functionality
  // const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // COMMENTED OUT FOR TESTING - Appointment loading functionality
  // useEffect(() => {
  //   // Load appointments from backend API
  //   const loadAppointments = async () => {
  //     try {
  //       const token = localStorage.getItem('authToken');
  //       if (!token) {
  //         console.log('❌ No auth token found');
  //         setLoading(false);
  //         return;
  //       }

  //       const response = await fetch('https://user-service-latest-bae8.onrender.com/api/appointments/dietician', {
  //         headers: {
  //           'Authorization': `Bearer ${token}`
  //         }
  //       });

  //       if (!response.ok) {
  //         throw new Error('Failed to fetch appointments');
  //       }

  //       const data = await response.json();
  //       console.log('📅 Loaded appointments from API:', data.appointments);
  //       setAppointments(data.appointments || []);
  //     } catch (error) {
  //       console.error('❌ Error loading appointments:', error);
  //       setAppointments([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadAppointments();

  //   // Listen for new appointments
  //   const handleAppointmentUpdate = () => {
  //     console.log('🔄 Appointment update event received, reloading...');
  //     loadAppointments();
  //   };

  //   window.addEventListener('appointment-booked', handleAppointmentUpdate);
    
  //   return () => {
  //     window.removeEventListener('appointment-booked', handleAppointmentUpdate);
  //   };
  // }, []);

  // Load recent patients: from chat-service conversations + upcoming appointments
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const dieticianId = user?._id;
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // 1) Conversations where dietician is a participant
        let conversations = [];
        try {
          const resp = await fetch(`http://localhost:3006/api/conversations/${dieticianId}`);
          if (resp.ok) conversations = await resp.json();
        } catch (_) {}

        // Extract patient IDs (the other participant)
        const contactIds = new Set();
        conversations.forEach(conv => {
          (conv.participants || []).forEach(pid => {
            if (pid !== dieticianId) contactIds.add(pid);
          });
        });

        // 2) Upcoming appointments for dietician
        let appts = [];
        try {
          const a = await fetch('https://user-service-latest-bae8.onrender.com/api/appointments/dietician', { headers });
          if (a.ok) {
            const aj = await a.json();
            appts = aj.appointments || [];
            appts.forEach(apt => {
              if (apt.patientId?._id) contactIds.add(apt.patientId._id);
            });
          }
        } catch (_) {}

        const uniqueIds = Array.from(contactIds);
        // 3) Fetch user details for contacts
        let userMap = {};
        if (uniqueIds.length > 0) {
          const ur = await fetch('https://user-service-latest-bae8.onrender.com/api/users/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({ userIds: uniqueIds })
          });
          if (ur.ok) {
            const users = await ur.json();
            userMap = users.reduce((acc, u) => { acc[u._id] = u; return acc; }, {});
          }
        }

        // Build recent contacts list combining chat lastUpdated and appt times
        const recent = [];
        conversations.forEach(conv => {
          const otherId = (conv.participants || []).find(pid => pid !== dieticianId);
          const u = userMap[otherId];
          if (!u) return;
          recent.push({
            id: otherId,
            name: u.name || 'Patient',
            avatar: (u.name || 'P').slice(0,2).toUpperCase(),
            lastConsultation: conv.lastUpdated || conv.updatedAt || new Date().toISOString(),
            status: 'active',
            moodScore: 0,
            lastMood: '—'
          });
        });
        // Add upcoming appointment patients not in conversations
        appts.forEach(apt => {
          const pid = apt.patientId?._id;
          if (!pid || recent.find(r => r.id === pid)) return;
          recent.push({
            id: pid,
            name: apt.patientId?.name || 'Patient',
            avatar: (apt.patientId?.name || 'P').slice(0,2).toUpperCase(),
            lastConsultation: apt.appointmentDate,
            status: apt.status || 'scheduled',
            moodScore: 0,
            lastMood: '—'
          });
        });

        // Sort by lastConsultation desc
        recent.sort((a,b) => new Date(b.lastConsultation) - new Date(a.lastConsultation));

        setRecentContacts(recent);
        setPatients(recent);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id]);

  // If no data yet, fallback to empty
  const mockPatients = [];

  // COMMENTED OUT FOR TESTING - Appointment integration
  // const patients = mockPatients.map(patient => {
  //   const patientAppointments = appointments.filter(apt => 
  //     apt.patientId?._id === patient.id || 
  //     apt.patientName === patient.name ||
  //     apt.patientId?.name === patient.name
  //   );
    
  //   console.log(`👤 Patient ${patient.name} has ${patientAppointments.length} appointments:`, patientAppointments);
    
  //   return {
  //     ...patient,
  //     appointments: patientAppointments,
  //     nextAppointment: patientAppointments.length > 0 
  //       ? patientAppointments[0].appointmentDate 
  //       : patient.nextAppointment
  //   };
  // });

  // Use loaded patients or fallback
  const patientsData = (patients && patients.length > 0 ? patients : mockPatients).map(patient => ({
    ...patient,
    appointments: [],
    nextAppointment: patient.nextAppointment
  }));

  console.log('📊 All patients (simplified for testing):', patients);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'needs_attention':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMoodColor = (score) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConsultationTypeIcon = (type) => {
    return type === 'video' ? <Video className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />;
  };

  const getConsultationTypeColor = (type) => {
    return type === 'video' ? 'text-[#F10100]' : 'text-emerald-600';
  };

  const formatAppointmentDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getUpcomingAppointments = (patient) => {
    if (!patient.appointments || patient.appointments.length === 0) return [];
    
    const today = new Date();
    return patient.appointments
      .filter(apt => new Date(apt.appointmentDate) >= today)
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
  };

  // COMMENTED OUT FOR TESTING - Appointment refresh functionality
  // const refreshAppointments = async () => {
  //   console.log('🔄 Manually refreshing appointments...');
  //   setLoading(true);
    
  //   try {
  //     const token = localStorage.getItem('authToken');
  //     if (!token) {
  //       console.log('❌ No auth token found');
  //       setLoading(false);
  //       return;
  //     }

  //     const response = await fetch('https://user-service-latest-bae8.onrender.com/api/appointments/dietician', {
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch appointments');
  //     }

  //     const data = await response.json();
  //     console.log('📅 Refreshed appointments from API:', data.appointments);
  //     setAppointments(data.appointments || []);
  //   } catch (error) {
  //     console.error('❌ Error refreshing appointments:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/80 relative overflow-hidden group ${fullWidth ? 'w-full' : ''}`}
    >
      {/* Decorative background blob */}
      <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-400/30 transition-colors duration-700"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Patients</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Testing mode - appointments disabled
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 transition-all">
            View All Patients
          </button>
        </div>
      </div>

      {/* COMMENTED OUT FOR TESTING - Dedicated Appointments Section */}
      {/* {appointments.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              All Scheduled Appointments
            </h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {appointments.length} Total
            </span>
          </div>
          <div className="space-y-3">
            {appointments.map((appointment, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-blue-200/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getConsultationTypeColor(appointment.consultationType)} bg-gray-50`}>
                      {getConsultationTypeIcon(appointment.consultationType)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{appointment.patientName}</div>
                      <div className="text-sm text-gray-600">
                        {formatAppointmentDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {appointment.consultationType} consultation with {appointment.dieticianName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {appointment.status}
                    </span>
                    {appointment.consultationType === 'video' ? (
                      <button className="px-3 py-1 bg-[#F10100] text-white rounded-lg hover:bg-[#E00000] transition-colors text-xs font-medium">
                        Start Video Call
                      </button>
                    ) : (
                      <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-medium">
                        Start Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      <div className="space-y-4 relative z-10">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 bg-white/40 border border-white/60 rounded-2xl animate-pulse shadow-sm" />
          ))
        ) : patientsData.map((patient, index) => {
          // COMMENTED OUT FOR TESTING - Appointment functionality
          // const upcomingAppointments = getUpcomingAppointments(patient);
          // const nextAppointment = upcomingAppointments[0];
          const upcomingAppointments = []; // Empty for testing
          const nextAppointment = null;
          
          return (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4, type: "spring", bounce: 0.3 }}
              whileHover={{ scale: 1.01, y: -2 }}
              className="bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/60 hover:shadow-xl hover:shadow-indigo-500/10 hover:bg-white/60 transition-all duration-300 group/patient"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-inner border border-white/20 transform group-hover/patient:rotate-6 transition-transform">
                    {patient.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 tracking-tight">{patient.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                      <span className="flex items-center bg-white/50 px-2 py-0.5 rounded-lg border border-white">
                        <span className="font-semibold text-slate-600 mr-1">Last mood:</span> {patient.lastMood}
                      </span>
                      <span className={`flex items-center font-bold px-2 py-0.5 rounded-lg bg-white/50 border border-white ${getMoodColor(patient.moodScore)}`}>
                        <TrendingUp className="w-3.5 h-3.5 mr-1" />
                        Score: {patient.moodScore}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 border-t md:border-t-0 border-white/50 pt-3 md:pt-0">
                  <span className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-inner ${getStatusColor(patient.status)}`}>
                    {patient.status.replace('_', ' ')}
                  </span>
                  <div className="flex space-x-2">
                    <button className="p-2.5 bg-white/50 border border-white rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 text-slate-400 transition-all shadow-sm" title="View Profile">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 bg-white/50 border border-white rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-slate-400 transition-all shadow-sm" title="Message">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 bg-white/50 border border-white rounded-xl hover:bg-fuchsia-50 hover:border-fuchsia-200 hover:text-fuchsia-600 text-slate-400 transition-all shadow-sm" title="Call">
                      <Phone className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
                  {/* COMMENTED OUT FOR TESTING - Appointments Section */}
                  {/* {upcomingAppointments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200/50">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Upcoming Appointments ({upcomingAppointments.length})
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {upcomingAppointments.map((appointment, aptIndex) => (
                            <div key={aptIndex} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className={`p-3 rounded-xl ${getConsultationTypeColor(appointment.consultationType)} bg-white shadow-sm`}>
                                    {getConsultationTypeIcon(appointment.consultationType)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="text-sm font-semibold text-gray-800">
                                        {formatAppointmentDate(appointment.appointmentDate)}
                                      </div>
                                      <div className="text-sm font-medium text-gray-600">
                                        at {appointment.appointmentTime}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-gray-600 capitalize">
                                        {appointment.consultationType} consultation
                                      </span>
                                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                      <span className="text-xs text-gray-500">
                                        Patient: {appointment.patientName}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                    {appointment.status}
                                  </span>
                                  {appointment.consultationType === 'video' ? (
                                    <button 
                                      className="px-3 py-2 bg-[#F10100] text-white rounded-lg hover:bg-[#E00000] transition-colors flex items-center gap-1 text-xs font-medium"
                                      title="Start Video Call"
                                    >
                                      <Video className="w-3 h-3" />
                                      Start Call
                                    </button>
                                  ) : (
                                    <button 
                                      className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1 text-xs font-medium"
                                      title="Start Chat"
                                    >
                                      <MessageCircle className="w-3 h-3" />
                                      Start Chat
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )} */}
                  
                  {/* SIMPLIFIED FOR TESTING - Fallback for patients without appointments */}
                  <div className="mt-4 pt-3 border-t border-white/50">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center space-x-2 text-slate-500 bg-white/40 px-3 py-1.5 rounded-lg border border-white">
                        <Calendar className="w-4 h-4" />
                        <span>Testing mode - appointments disabled</span>
                      </div>
                      <button className="flex items-center text-emerald-600 hover:text-emerald-700 font-bold group">
                        View Full Details
                        <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PatientsList;


