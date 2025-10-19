import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, MessageCircle, Eye, Phone, Video, Clock, CheckCircle } from 'lucide-react';

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

  //       const response = await fetch('http://localhost:5000/api/appointments/dietician', {
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
          const a = await fetch('http://localhost:5000/api/appointments/dietician', { headers });
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
          const ur = await fetch('http://localhost:5000/api/users/batch', {
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

  //     const response = await fetch('http://localhost:5000/api/appointments/dietician', {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 ${fullWidth ? 'w-full' : ''}`}
    >
      <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Recent Patients</h2>
              <p className="text-sm text-gray-600 mt-1">
                {/* {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} scheduled */}
                Testing mode - appointments disabled
              </p>
            </div>
        <div className="flex items-center space-x-3">
          {/* COMMENTED OUT FOR TESTING - Refresh appointments button */}
          {/* <button 
            onClick={refreshAppointments}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
          >
            <Clock className="w-4 h-4" />
            Refresh
          </button> */}
          <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View All
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

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 bg-white/60 rounded-xl animate-pulse" />
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {patient.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{patient.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Last mood: {patient.lastMood}</span>
                      <span className={`font-medium ${getMoodColor(patient.moodScore)}`}>
                        Score: {patient.moodScore}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Last consultation: {new Date(patient.lastConsultation).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                    {patient.status.replace('_', ' ')}
                  </span>
                  <div className="flex space-x-1">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="View Profile">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Message">
                      <MessageCircle className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Call">
                      <Phone className="w-4 h-4 text-gray-600" />
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
                  <div className="mt-3 pt-3 border-t border-gray-200/50">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Testing mode - appointments disabled</span>
                      </div>
                      <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                        View Profile
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


