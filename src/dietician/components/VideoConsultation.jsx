import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Users, 
  Settings, 
  Share,
  Calendar,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import WebRTCCall from '../../components/WebRTCCall';
import CallRequestModal from '../../components/CallRequestModal';
import { requestMediaPermissions } from '../../utils/mediaPermissions';
import { io } from 'socket.io-client';

const VideoConsultation = ({ fullWidth = false }) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isInCall, setIsInCall] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [showCallRequest, setShowCallRequest] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [socket, setSocket] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'requesting', 'connecting', 'connected', 'error'
  const [callMessage, setCallMessage] = useState('');
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedMealIndex, setSelectedMealIndex] = useState(null);
  const navigate = useNavigate();

  // Fetch active patients (users with role = 1)
  const fetchActivePatients = async () => {
    try {
      setLoadingPatients(true);
      console.log('🔍 Fetching users with role = 1 from user-service...');
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('❌ No authentication token found');
        setPatients([]);
        return;
      }

      // Fetch users with role = 1 from user-service
      const response = await fetch('http://localhost:5000/api/user/users/role/1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 API Response:', data);

      if (data.users && Array.isArray(data.users)) {
        // Transform the API response to match our component's expected format
        const transformedPatients = data.users.map((user, index) => ({
          id: user._id,
          name: user.name || 'Unknown User',
          email: user.email || 'No email',
          status: user.active ? 'active' : 'inactive',
          lastConsultation: user.lastConsultation || new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within last week
          nextAppointment: user.nextAppointment || new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within next week
          consultationType: user.consultationType || ['Follow-up', 'Initial Consultation', 'Progress Review', 'Weight Management', 'Diabetes Management'][index % 5],
          healthGoals: user.healthGoals || [
            ['Weight Management', 'Diabetes Control'],
            ['Heart Health', 'Cholesterol Management'],
            ['Nutrition Education', 'Meal Planning'],
            ['Weight Loss', 'Exercise Planning'],
            ['Blood Sugar Control', 'Diet Modification']
          ][index % 5],
          profileImage: user.profileImage || null,
          isVerified: user.isVerified || false,
          createdAt: user.createdAt,
          googleId: user.googleId,
          age: user.age,
          gender: user.gender,
          heightCm: user.heightCm,
          weightKg: user.weightKg
        }));

        setPatients(transformedPatients);
        console.log('✅ Active patients loaded:', transformedPatients.length);
      } else {
        console.warn('⚠️ No users found or invalid response format');
        setPatients([]);
      }
    } catch (error) {
      console.error('❌ Error fetching patients from user-service:', error);
      
      // Fallback to mock data if API fails
      console.log('🔄 Falling back to mock data...');
      const mockPatients = [
        {
          id: '68bd5ae01da5747f7cfe432d',
          name: 'Emma Thompson',
          email: 'emma.thompson@email.com',
          status: 'active',
          lastConsultation: '2025-09-25',
          nextAppointment: '2025-09-28',
          consultationType: 'Follow-up',
          healthGoals: ['Weight Management', 'Diabetes Control'],
          profileImage: null
        },
        {
          id: '68bd5ae01da5747f7cfe432e',
          name: 'Michael Chen',
          email: 'michael.chen@email.com',
          status: 'active',
          lastConsultation: '2025-09-24',
          nextAppointment: '2025-09-29',
          consultationType: 'Initial Consultation',
          healthGoals: ['Heart Health', 'Cholesterol Management'],
          profileImage: null
        }
      ];
      setPatients(mockPatients);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Fetch patients on component mount
  useEffect(() => {
    fetchActivePatients();
  }, []);

  // Initialize socket connection for call signaling
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user._id) return;

    const signalingSocket = io('http://localhost:3007', {
      query: {
        userId: user._id,
        userName: user.name
      }
    });

    signalingSocket.on('connect', () => {
      console.log('Dietician connected to signaling server');
      // Join the personal room so the server can find this user
      signalingSocket.emit('join-room', user._id);
    });

    // Listen for incoming call requests
    signalingSocket.on('webrtc-call-request', (data) => {
      console.log('Incoming call from patient:', data.callerName);
      setIncomingCall({
        callerId: data.callerId,
        callerName: data.callerName,
        callType: data.callType,
        roomId: data.roomId
      });
      setShowCallRequest(true);
    });

    // Listen for call responses
    signalingSocket.on('webrtc-call-response', (data) => {
      if (data.accepted) {
        console.log('Call accepted by patient:', data.responderName);
        setCallStatus('connected');
        setCallMessage('Call accepted! Starting video call...');
        setIsInCall(true);
      } else {
        console.log('Call rejected by patient:', data.responderName);
        setCallStatus('error');
        setCallMessage(`Call rejected: ${data.reason || 'Patient declined'}`);
        setShowCallRequest(false);
        setIncomingCall(null);
      }
    });

    // Listen for call errors
    signalingSocket.on('webrtc-call-error', (data) => {
      console.log('Call error:', data.error);
      setCallStatus('error');
      setCallMessage(`Call failed: ${data.error}`);
    });

    setSocket(signalingSocket);

    return () => {
      signalingSocket.disconnect();
    };
  }, []);

  const handleStartCall = async (consultation = null) => {
    try {
      setPermissionError(null);
      setCallStatus('requesting');
      setCallMessage('Requesting camera and microphone permissions...');
      
      // Request camera and microphone permissions
      const permissionResult = await requestMediaPermissions('video');
      
      if (!permissionResult.success) {
        setPermissionError(permissionResult.error);
        setCallStatus('error');
        setCallMessage('Permission denied. Please allow camera and microphone access.');
        return;
      }

      setCallMessage('Permissions granted. Starting consultation...');
      const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setCurrentRoom(roomId);
      setCurrentPatient(consultation?.patient || 'Patient');
      setCurrentPatientId(consultation?.id || null);
      setCallStatus('connected');
      setCallMessage('Consultation started successfully!');
      setIsInCall(true);
      console.log('Starting video consultation...', roomId);
    } catch (error) {
      console.error('Error starting call:', error);
      setPermissionError('Failed to start video call. Please try again.');
      setCallStatus('error');
      setCallMessage('Failed to start video call. Please try again.');
    }
  };

  const handleCallPatient = async (patientId, patientName) => {
    try {
      setPermissionError(null);
      setCallStatus('requesting');
      setCallMessage('Requesting camera and microphone permissions...');
      
      // Request camera and microphone permissions
      const permissionResult = await requestMediaPermissions('video');
      
      if (!permissionResult.success) {
        setPermissionError(permissionResult.error);
        setCallStatus('error');
        setCallMessage('Permission denied. Please allow camera and microphone access.');
        return;
      }

      setCallMessage('Permissions granted. Sending call request...');

      // Send call request to patient
      if (socket) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const roomId = `consultation-${Date.now()}`;
        console.log('Dietician calling patient:', patientName, 'ID:', patientId);
        // Send both responderId and targetUserId for compatibility
        socket.emit('webrtc-call-request', {
          callerId: user._id,
          callerName: user.name,
          responderId: patientId,
          targetUserId: patientId,
          callType: 'video',
          roomId
        });
        
        setCallStatus('connecting');
        setCallMessage('Call request sent. Waiting for patient response...');
        setCurrentRoom(roomId);
        setCurrentPatient(patientName);
        setCurrentPatientId(patientId);
      } else {
        setCallStatus('error');
        setCallMessage('Not connected to server. Please refresh and try again.');
      }
    } catch (error) {
      console.error('Error calling patient:', error);
      setPermissionError('Failed to call patient. Please try again.');
      setCallStatus('error');
      setCallMessage('Failed to call patient. Please try again.');
    }
  };

  // Open override modal for a specific plan + meal index
  const openOverrideModal = (planId, mealIndex) => {
    setSelectedPlanId(planId);
    setSelectedMealIndex(mealIndex);
    setShowOverrideModal(true);
  };

  const searchRecipes = async () => {
    try {
      if (!searchQuery.trim()) return;
      setSearchLoading(true);
      const resp = await fetch(`http://localhost:5004/api/spoonacular/search?q=${encodeURIComponent(searchQuery)}&number=8`);
      if (!resp.ok) throw new Error('Search failed');
      const data = await resp.json();
      setSearchResults(data.results || []);
    } catch (e) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const replaceMeal = async (spoonacularId) => {
    try {
      if (!selectedPlanId || selectedMealIndex == null) return;
      const resp = await fetch(`http://localhost:5004/api/diet-plans/${selectedPlanId}/meals/replace`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealIndex: selectedMealIndex, spoonacularId })
      });
      if (!resp.ok) throw new Error('Replace failed');
      setShowOverrideModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (e) {
      // surface minimal error
    }
  };

  const handleJoinCall = async (consultation) => {
    try {
      setPermissionError(null);
      
      // Request camera and microphone permissions
      const permissionResult = await requestMediaPermissions('video');
      
      if (!permissionResult.success) {
        setPermissionError(permissionResult.error);
        return;
      }

      const roomId = `consultation-${consultation.id}`;
      setCurrentRoom(roomId);
      setCurrentPatient(consultation.patient);
      setCurrentPatientId(consultation.id);
    setIsInCall(true);
      console.log('Joining consultation...', roomId);
    } catch (error) {
      console.error('Error joining call:', error);
      setPermissionError('Failed to join video call. Please try again.');
    }
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setCurrentRoom(null);
    setCurrentPatient(null);
    setIsVideoOn(true);
    setIsMicOn(true);
    setShowCallRequest(false);
    setIncomingCall(null);
    setPermissionError(null);
    setCallStatus('idle');
    setCallMessage('');
  };

  const handleAcceptCall = async () => {
    try {
      setPermissionError(null);
      
      // Request camera and microphone permissions
      const permissionResult = await requestMediaPermissions('video');
      
      if (!permissionResult.success) {
        setPermissionError(permissionResult.error);
        return;
      }

      // Accept the call
      if (socket && incomingCall) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        socket.emit('webrtc-call-response', {
          callerId: incomingCall.callerId,
          responderId: user._id,
          responderName: user.name,
          accepted: true,
          roomId: incomingCall.roomId
        });
      }

      setShowCallRequest(false);
      setIsInCall(true);
      setCurrentRoom(incomingCall?.roomId);
      setCurrentPatient(incomingCall?.callerName);
      setCurrentPatientId(incomingCall?.callerId);
    } catch (error) {
      console.error('Error accepting call:', error);
      setPermissionError('Failed to accept video call. Please try again.');
    }
  };

  const handleRejectCall = (reason) => {
    if (socket && incomingCall) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      socket.emit('webrtc-call-response', {
        callerId: incomingCall.callerId,
        responderId: user._id,
        responderName: user.name,
        accepted: false,
        reason: reason
      });
    }
    
    setShowCallRequest(false);
    setIncomingCall(null);
  };

  // Get patient status for display
  const getPatientStatus = (patient) => {
    const today = new Date();
    const nextAppointment = new Date(patient.nextAppointment);
    const daysUntilAppointment = Math.ceil((nextAppointment - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilAppointment < 0) {
      return { status: 'overdue', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (daysUntilAppointment === 0) {
      return { status: 'today', color: 'text-orange-600', bg: 'bg-orange-100' };
    } else if (daysUntilAppointment <= 3) {
      return { status: 'soon', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    } else {
      return { status: 'scheduled', color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  return (
    <>
      {/* Call Request Modal */}
      <CallRequestModal
        isOpen={showCallRequest}
        callerInfo={incomingCall}
        callType="video"
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 ${fullWidth ? 'w-full' : ''}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Video Consultations</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Video className="w-4 h-4" />
          <span>HD Quality Available</span>
        </div>
      </div>

      {!isInCall ? (
        <div className="space-y-6">
          {/* Permission Error Alert */}
          {permissionError && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">Permission Required</h4>
                  <p className="text-red-800 text-sm">{permissionError}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Call Status Alert */}
          {callStatus !== 'idle' && callMessage && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`rounded-xl p-4 mb-6 border ${
                callStatus === 'error' ? 'bg-red-50 border-red-200' :
                callStatus === 'connected' ? 'bg-green-50 border-green-200' :
                callStatus === 'connecting' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                {callStatus === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                ) : callStatus === 'connected' ? (
                  <div className="w-5 h-5 bg-green-500 rounded-full mt-0.5"></div>
                ) : callStatus === 'connecting' ? (
                  <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mt-0.5"></div>
                ) : (
                  <div className="w-5 h-5 bg-blue-500 rounded-full mt-0.5"></div>
                )}
                <div>
                  <h4 className={`font-semibold mb-1 ${
                    callStatus === 'error' ? 'text-red-900' :
                    callStatus === 'connected' ? 'text-green-900' :
                    callStatus === 'connecting' ? 'text-yellow-900' :
                    'text-blue-900'
                  }`}>
                    {callStatus === 'error' ? 'Call Failed' :
                     callStatus === 'connected' ? 'Call Connected' :
                     callStatus === 'connecting' ? 'Connecting...' :
                     'Call Status'}
                  </h4>
                  <p className={`text-sm ${
                    callStatus === 'error' ? 'text-red-800' :
                    callStatus === 'connected' ? 'text-green-800' :
                    callStatus === 'connecting' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {callMessage}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Start Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Consultation</h3>
                <p className="text-gray-600 mb-4">Ready to connect with your patients?</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>System Ready</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>Up to 4 participants</span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartCall}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center space-x-2"
              >
                <Video className="w-5 h-5" />
                <span>Start Video Call</span>
              </motion.button>
            </div>
          </div>

          {/* Active Patients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-500" />
                Active Patients ({patients.length})
            </h3>
              <button 
                onClick={fetchActivePatients}
                disabled={loadingPatients}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                {loadingPatients ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {loadingPatients ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-600">Loading patients...</span>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active patients found</p>
              </div>
            ) : (
            <div className="space-y-3">
                {patients.map((patient, index) => (
                <motion.div
                    key={patient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                          {patient.profileImage ? (
                            <img 
                              src={patient.profileImage} 
                              alt={patient.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-800 text-lg">{patient.name}</h4>
                              {patient.isVerified && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                            {(() => {
                              const status = getPatientStatus(patient);
                              return (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                  {status.status === 'overdue' ? 'Overdue' :
                                   status.status === 'today' ? 'Today' :
                                   status.status === 'soon' ? 'Soon' : 'Scheduled'}
                                </span>
                              );
                            })()}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{patient.email}</p>
                          
                          {/* Patient Details */}
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                            {patient.age && (
                              <span>Age: {patient.age}</span>
                            )}
                            {patient.gender && (
                              <span>Gender: {patient.gender}</span>
                            )}
                            {patient.heightCm && (
                              <span>Height: {patient.heightCm}cm</span>
                            )}
                            {patient.weightKg && (
                              <span>Weight: {patient.weightKg}kg</span>
                            )}
                      </div>
                          
                          {patient.createdAt && (
                            <p className="text-xs text-gray-500 mb-2">
                              Member since: {new Date(patient.createdAt).toLocaleDateString()}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                              <span>Last: {new Date(patient.lastConsultation).toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Next: {new Date(patient.nextAppointment).toLocaleDateString()}</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {patient.healthGoals.slice(0, 2).map((goal, idx) => (
                              <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                {goal}
                              </span>
                            ))}
                            {patient.healthGoals.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{patient.healthGoals.length - 2} more
                          </span>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleCallPatient(patient.id, patient.name)}
                          disabled={callStatus === 'connecting' || callStatus === 'requesting'}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                            callStatus === 'connecting' || callStatus === 'requesting'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          <Video className="w-4 h-4" />
                          <span>Call</span>
                        </button>
                        <button 
                          onClick={() => handleJoinCall({ id: patient.id, patient: patient.name })}
                          className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors flex items-center space-x-1"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Join</span>
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Settings className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            )}
          </div>

          {/* Integration Options */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Integration Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h5 className="font-medium text-gray-800 mb-1">WebRTC</h5>
                <p className="text-xs text-gray-600">Direct browser-based calls</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h5 className="font-medium text-gray-800 mb-1">Zoom SDK</h5>
                <p className="text-xs text-gray-600">Professional meeting platform</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h5 className="font-medium text-gray-800 mb-1">Google Meet</h5>
                <p className="text-xs text-gray-600">Seamless integration</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* WebRTC Video Call Interface */
        <div className="space-y-4">
          {currentRoom && currentPatient ? (
            <WebRTCCall
              isOpen={isInCall}
              onClose={handleEndCall}
              targetUser={{
                id: currentPatientId || (patients.find(p => p.name === currentPatient)?.id) || null,
                name: currentPatient,
                profileImage: null
              }}
              callType="video"
              autoStart={!!(currentPatientId || (patients.find(p => p.name === currentPatient)?.id))}
              onCallEnd={handleEndCall}
            />
          ) : (
          <div className="bg-gray-900 rounded-xl h-64 flex items-center justify-center">
            <div className="text-center text-white">
              <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">Video Call Active</p>
              <p className="text-sm opacity-75">Patient video feed will appear here</p>
            </div>
          </div>
          )}

          {/* Override Recipe Modal */}
          {showOverrideModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Replace Recipe</h3>
                  <button onClick={() => setShowOverrideModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="flex gap-2 mb-4">
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && searchRecipes()}
                    placeholder="Search Spoonacular recipes (e.g., Paneer, Salad)"
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button onClick={searchRecipes} className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50" disabled={searchLoading}>
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {searchResults.map(r => (
                    <div key={r.id} className="border rounded-lg p-3 flex gap-3">
                      <img src={r.image} alt={r.title} className="w-20 h-20 object-cover rounded" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 line-clamp-2">{r.title}</div>
                        <div className="text-xs text-gray-500">Ready in {r.readyInMinutes || 30} mins</div>
                        <button onClick={() => replaceMeal(r.id)} className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg">Replace with this</button>
                      </div>
                    </div>
                  ))}
                  {!searchResults.length && !searchLoading && (
                    <div className="text-sm text-gray-500">No results yet. Try searching above.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
    </>
  );
};

export default VideoConsultation;


