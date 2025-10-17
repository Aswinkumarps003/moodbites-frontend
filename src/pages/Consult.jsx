import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Video, MessageCircle, Search, Star, Calendar, Clock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = 'https://user-service-o0l2.onrender.com/api';

const Consult = () => {
  const [dieticians, setDieticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const [showPayForm, setShowPayForm] = useState(false);
  const [meUser, setMeUser] = useState(null);
  const [payForm, setPayForm] = useState({ name: "", email: "", amountDisplay: 299 });
  // COMMENTED OUT FOR TESTING - Appointment booking functionality
  // const [showBooking, setShowBooking] = useState(false);
  // const [consultationType, setConsultationType] = useState('');
  // const [selectedDate, setSelectedDate] = useState('');
  // const [selectedTime, setSelectedTime] = useState('');
  // const [bookingLoading, setBookingLoading] = useState(false);
  // const [bookingSuccess, setBookingSuccess] = useState(false);
  const navigate = useNavigate();

  const token = useMemo(() => localStorage.getItem('authToken'), []);
  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // Fetch premium status
    const fetchMe = async () => {
      try {
        const resp = await fetch(`${API_URL}/user/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (resp.ok) {
          const me = await resp.json();
          setIsPremium(!!me.isPremium);
          // Show paywall if not premium
          setShowPaywall(!me.isPremium);
          setMeUser(me);
          setPayForm(prev => ({
            ...prev,
            name: me.name || prev.name,
            email: me.email || prev.email
          }));
        } else {
          // fallback to local storage flag if available
          setIsPremium(!!(currentUser && currentUser.isPremium));
          setShowPaywall(!(currentUser && currentUser.isPremium));
        }
      } catch {
        setIsPremium(!!(currentUser && currentUser.isPremium));
        setShowPaywall(!(currentUser && currentUser.isPremium));
      }
    };
    if (token) fetchMe();

    const fetchDieticians = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await fetch(`${API_URL}/user/dieticians/active`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error('Failed to load dieticians');
        const data = await resp.json();
        setDieticians(data.users || []);
      } catch (e) {
        setError(e.message || 'Failed to load dieticians');
      } finally {
        setLoading(false);
      }
    };
    fetchDieticians();
  }, [token, currentUser]);

  const filtered = useMemo(() =>
    dieticians.filter(d =>
      (d.name || '').toLowerCase().includes(query.toLowerCase()) ||
      (d.specialization || '').toLowerCase().includes(query.toLowerCase())
    )
  , [dieticians, query]);

  // COMMENTED OUT FOR TESTING - Appointment booking functionality
  // const handleStartChat = (dietician) => {
  //   setConsultationType('chat');
  //   setSelected(dietician);
  //   setShowBooking(true);
  // };

  // const handleStartVideo = (dietician) => {
  //   setConsultationType('video');
  //   setSelected(dietician);
  //   setShowBooking(true);
  // };

  // SIMPLIFIED FOR TESTING - Direct navigation to chat
  const handleStartChat = (dietician) => {
    if (!isPremium) {
      setSelected(dietician);
      setShowPaywall(true);
      return;
    }
    navigate(`/chat?dieticianId=${dietician._id}`);
  };

  const handleStartVideo = (dietician) => {
    if (!isPremium) {
      setSelected(dietician);
      setShowPaywall(true);
      return;
    }
    navigate(`/chat?dieticianId=${dietician._id}`);
  };

  // COMMENTED OUT FOR TESTING - Appointment booking functionality
  // const handleBookAppointment = async () => {
  //   if (!selectedDate || !selectedTime) {
  //     setError('Please select both date and time');
  //     return;
  //   }

  //   setBookingLoading(true);
  //   try {
  //     const appointmentData = {
  //       dieticianId: selected._id,
  //       consultationType,
  //       appointmentDate: selectedDate,
  //       appointmentTime: selectedTime
  //     };

  //     // Send appointment to backend API
  //     const response = await fetch(`${API_URL}/appointments`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //       body: JSON.stringify(appointmentData)
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || 'Failed to book appointment');
  //     }

  //     const result = await response.json();
  //     console.log('✅ Appointment booked successfully:', result);

  //     // Dispatch custom event to notify other components
  //     window.dispatchEvent(new CustomEvent('appointment-booked', { 
  //       detail: { appointment: result.appointment } 
  //     }));

  //     setBookingSuccess(true);
  //     setTimeout(() => {
  //       setShowBooking(false);
  //       setSelected(null);
  //       setBookingSuccess(false);
  //       setSelectedDate('');
  //       setSelectedTime('');
  //       setConsultationType('');
  //     }, 2000);

  //   } catch (err) {
  //     console.error('❌ Appointment booking error:', err);
  //     setError(err.message || 'Failed to book appointment. Please try again.');
  //   } finally {
  //     setBookingLoading(false);
  //   }
  // };

  const getAvailableTimes = () => {
    return [
      '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
      '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
    ];
  };

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    return dates;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-professional p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Consult a Dietician</h1>
              <p className="text-gray-600">Connect with an active expert for guidance.</p>
            </div>
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search specialization or name"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl p-4 mb-6">{error}</div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-2xl shadow animate-pulse" />
            ))
          ) : filtered.length ? (
            filtered.map((d, idx) => (
              <motion.div
                key={d._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-2xl shadow-professional p-5 border border-gray-100 hover:shadow-professional-hover transition"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={d.profileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200"}
                      alt={d.name}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" title="Active" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{d.name}</h3>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {d.specialization || 'Certified Dietician'}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>{d.rating || '4.8'} • {d.consultations || 120} consults</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStartChat(d)}
                    className="col-span-2 px-4 py-2 bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    {isPremium ? 'Consult' : 'Unlock to Consult'}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-2xl shadow p-8 text-center text-gray-600">No active dieticians found.</div>
          )}
        </div>

            {/* COMMENTED OUT FOR TESTING - Consultation Type Modal */}
            {/* <AnimatePresence>
              {selected && !showBooking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
                  onClick={() => setSelected(null)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-3xl p-6 w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-xl font-bold text-gray-900">Choose Consultation Type</h3>
                    <p className="text-gray-600 mt-1">with {selected.name}</p>
                    <div className="mt-5 grid gap-3">
                      <button
                        onClick={() => handleStartChat(selected)}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition flex items-center justify-center gap-2 font-semibold text-gray-800"
                      >
                        <MessageCircle className="w-5 h-5 text-emerald-600" /> Live Chat
                      </button>
                      <button
                        onClick={() => handleStartVideo(selected)}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition flex items-center justify-center gap-2 font-semibold text-gray-800"
                      >
                        <Video className="w-5 h-5 text-[#F10100]" /> Live Video Call
                      </button>
                    </div>
                    <div className="mt-4 text-right">
                      <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700 text-sm">Cancel</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence> */}

        {/* COMMENTED OUT FOR TESTING - Appointment Booking Modal */}
      </div>

      {/* Premium Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Unlock MoodBites Premium</h3>
                  <p className="text-white/90 text-sm">Unlimited consults, plans and AI features</p>
                </div>
                <button onClick={() => setShowPaywall(false)} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
                    <Check className="w-4 h-4" /> Unlimited Diet Plans
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-2">
                    <Check className="w-4 h-4" /> Unlimited Consults
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-2">
                    <Check className="w-4 h-4" /> Blood Report Insights
                  </div>
                  <div className="p-3 rounded-xl bg-pink-50 text-pink-800 border border-pink-200 flex items-center gap-2">
                    <Check className="w-4 h-4" /> Save & Share Plans
                  </div>
                </div>
                {!!payError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-2">{payError}</div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-extrabold text-gray-900">₹199</div>
                    <div className="text-gray-500 text-sm">One-time unlock</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPaywall(false)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
                    >
                      Maybe Later
                    </button>
                    <button
                      disabled={payLoading}
                      onClick={() => {
                        setPayError("");
                        setShowPayForm(true);
                      }}
                      className={`px-5 py-2 rounded-xl font-semibold text-white ${payLoading ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'} shadow`}
                    >
                      {payLoading ? 'Processing...' : 'Unlock Now'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Details Form Modal */}
      <AnimatePresence>
        {showPayForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Payment Details</h3>
                  <p className="text-white/90 text-xs">Confirm your info to unlock Premium</p>
                </div>
                <button onClick={() => setShowPayForm(false)} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {!!payError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-2">{payError}</div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Name</label>
                  <input
                    type="text"
                    value={payForm.name}
                    onChange={(e) => setPayForm({ ...payForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={payForm.email}
                    onChange={(e) => setPayForm({ ...payForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Amount (INR)</label>
                  <input
                    type="number"
                    value={payForm.amountDisplay}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 text-gray-700"
                  />
                  <p className="text-xs text-gray-500">Amount is preset by server to ₹299.</p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowPayForm(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={payLoading}
                    onClick={async () => {
                      try {
                        setPayError("");
                        setPayLoading(true);
                        // 1) Create order (server enforces amount)
                        const createResp = await fetch(`${API_URL}/billing/create-order`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ currency: 'INR', notes: { feature: 'premium_unlock', name: payForm.name, email: payForm.email } })
                        });
                        if (!createResp.ok) {
                          const t = await createResp.json().catch(() => ({}));
                          throw new Error(t.message || 'Failed to create order');
                        }
                        const { order, key: serverKey } = await createResp.json();

                        // 2) Load Razorpay checkout script
                        const loadRzp = () => new Promise((resolve, reject) => {
                          if (window.Razorpay) return resolve();
                          const script = document.createElement('script');
                          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                          script.onload = resolve;
                          script.onerror = () => reject(new Error('Failed to load Razorpay'));
                          document.body.appendChild(script);
                        });
                        await loadRzp();

                        const key = serverKey || (import.meta && import.meta.env && import.meta.env.VITE_RAZORPAY_KEY_ID) || window.RAZORPAY_KEY_ID;
                        if (!key) throw new Error('Razorpay key not configured');

                        // 3) Open Razorpay Checkout SDK
                        const rzp = new window.Razorpay({
                          key,
                          amount: order.amount,
                          currency: order.currency,
                          name: 'MoodBites Premium',
                          description: 'Unlock all features',
                          order_id: order.id,
                          prefill: { name: payForm.name || meUser?.name, email: payForm.email || meUser?.email },
                          theme: { color: '#10B981' },
                          handler: async (resp) => {
                            try {
                              const verifyResp = await fetch(`${API_URL}/billing/verify-payment`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({
                                  razorpay_order_id: resp.razorpay_order_id,
                                  razorpay_payment_id: resp.razorpay_payment_id,
                                  razorpay_signature: resp.razorpay_signature
                                })
                              });
                              if (!verifyResp.ok) {
                                const t = await verifyResp.json().catch(() => ({}));
                                throw new Error(t.message || 'Payment verification failed');
                              }
                              // Success - mark premium and close modals
                              setIsPremium(true);
                              setShowPayForm(false);
                              setShowPaywall(false);
                            } catch (err) {
                              setPayError(err.message || 'Payment verification error');
                            }
                          }
                        });
                        rzp.open();
                      } catch (e) {
                        setPayError(e.message || 'Payment initialization failed');
                      } finally {
                        setPayLoading(false);
                      }
                    }}
                    className={`px-5 py-2 rounded-xl font-semibold text-white ${payLoading ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'} shadow`}
                  >
                    {payLoading ? 'Processing...' : 'Proceed to Pay'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Consult;


