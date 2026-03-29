import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Phone, Clock, User, Search, FileText,
  Calendar, TrendingUp, PhoneCall, PhoneOff, BarChart3,
  ChevronDown, ChevronUp, X, Save, Trash2, Filter
} from 'lucide-react';
import { getCallLogs, getCallStats, addCallNote, deleteCallLog, formatDuration } from '../../utils/callLogger';

const VideoConsultations = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'video', 'audio'
  const [expandedLog, setExpandedLog] = useState(null);
  const [editingNote, setEditingNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Load logs
  const refreshData = () => {
    if (!user?._id) return;
    setLogs(getCallLogs(user._id));
    setStats(getCallStats(user._id));
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  // Filter & search
  const filtered = useMemo(() => {
    let result = logs;
    if (filterType !== 'all') {
      result = result.filter(l => l.callType === filterType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        (l.receiverName || '').toLowerCase().includes(q) ||
        (l.callerName || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [logs, filterType, search]);

  const handleSaveNote = (logId) => {
    addCallNote(logId, editingNote);
    refreshData();
    setExpandedLog(null);
    setEditingNote('');
  };

  const handleDelete = (logId) => {
    deleteCallLog(logId);
    refreshData();
    setShowDeleteConfirm(null);
    if (expandedLog === logId) setExpandedLog(null);
  };

  const getPartnerName = (log) => {
    if (log.callerId === user?._id) return log.receiverName || 'Unknown';
    return log.callerName || 'Unknown';
  };

  const getPartnerInitials = (name) => {
    return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const statCards = [
    { label: 'Total Calls', value: stats?.totalCalls || 0, icon: PhoneCall, color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50' },
    { label: 'This Week', value: stats?.callsThisWeek || 0, icon: Calendar, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
    { label: 'Total Duration', value: stats?.totalDurationFormatted || '00:00', icon: Clock, color: 'from-orange-500 to-amber-600', bg: 'bg-orange-50' },
    { label: 'Video / Audio', value: `${stats?.videoCalls || 0} / ${stats?.audioCalls || 0}`, icon: BarChart3, color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Video Consultations</h1>
          <p className="text-slate-500 font-medium mt-1">Review and manage your consultation history</p>
        </div>
        <button
          onClick={refreshData}
          className="px-5 py-2.5 bg-white/60 backdrop-blur-md border border-white text-slate-700 rounded-2xl font-semibold hover:bg-white hover:shadow-md transition-all duration-300 flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br opacity-10 rounded-full group-hover:opacity-20 transition-opacity" style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }} />
              <div className={`w-12 h-12 ${card.bg} rounded-2xl flex items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 bg-gradient-to-r ${card.color} bg-clip-text`} style={{ color: card.color.includes('indigo') ? '#6366f1' : card.color.includes('emerald') ? '#10b981' : card.color.includes('orange') ? '#f97316' : '#f43f5e' }} />
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white shadow-lg p-5"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full group/search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/60 border border-white/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white text-sm font-medium text-slate-700 placeholder:text-slate-400 transition-all shadow-inner"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {['all', 'video', 'audio'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  filterType === type
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white/60 text-slate-600 hover:bg-white hover:shadow-sm border border-white/80'
                }`}
              >
                {type === 'all' ? 'All' : type === 'video' ? '📹 Video' : '📞 Audio'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Call Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white shadow-lg overflow-hidden"
      >
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-white/60 bg-white/40">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Consultation Logs
              <span className="text-sm font-semibold text-slate-400 ml-2">({filtered.length})</span>
            </h2>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-white/60 border border-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No consultations yet</h3>
            <p className="text-sm text-slate-500">
              {search ? 'No results match your search.' : 'Start a video call from the Chat section to see consultation logs here.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/40">
            {filtered.map((log, idx) => {
              const partner = getPartnerName(log);
              const initials = getPartnerInitials(partner);
              const isExpanded = expandedLog === log.id;
              const isOutgoing = log.callerId === user?._id;

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  {/* Main Row */}
                  <div
                    className="px-6 py-4 flex items-center gap-4 hover:bg-white/40 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      if (isExpanded) {
                        setExpandedLog(null);
                        setEditingNote('');
                      } else {
                        setExpandedLog(log.id);
                        setEditingNote(log.notes || '');
                      }
                    }}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/60">
                        {initials}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                        log.callType === 'video' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}>
                        {log.callType === 'video' ? <Video className="w-2.5 h-2.5 text-white" /> : <Phone className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-[15px] truncate">{partner}</h4>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          isOutgoing ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isOutgoing ? 'Outgoing' : 'Incoming'}
                        </span>
                        {log.notes && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                            Notes
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {new Date(log.startedAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', hour12: true
                        })}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{formatDuration(log.duration)}</p>
                        <p className="text-[11px] text-slate-400 font-semibold">{log.callType === 'video' ? 'Video' : 'Audio'}</p>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details / Notes */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-1">
                          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 p-5">
                            {/* Call Details Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                              <div>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Started</p>
                                <p className="text-sm font-semibold text-slate-700">
                                  {new Date(log.startedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Ended</p>
                                <p className="text-sm font-semibold text-slate-700">
                                  {new Date(log.endedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Duration</p>
                                <p className="text-sm font-semibold text-slate-700">{formatDuration(log.duration)}</p>
                              </div>
                              <div>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Type</p>
                                <p className="text-sm font-semibold text-slate-700 capitalize">{log.callType} Call</p>
                              </div>
                            </div>

                            {/* Notes Section */}
                            <div>
                              <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-indigo-500" />
                                Consultation Notes
                              </label>
                              <textarea
                                value={editingNote}
                                onChange={e => setEditingNote(e.target.value)}
                                placeholder="Add notes about this consultation... (e.g., diet recommendations, follow-up items, patient concerns)"
                                className="w-full px-4 py-3 bg-white/60 border border-white/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white text-sm font-medium text-slate-700 placeholder:text-slate-400 transition-all shadow-inner resize-none"
                                rows={3}
                              />
                              <div className="flex items-center justify-between mt-3">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(log.id); }}
                                  className="px-4 py-2 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all flex items-center gap-1.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete Log
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSaveNote(log.id); }}
                                  className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center gap-1.5"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  Save Notes
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Delete Confirmation */}
                  <AnimatePresence>
                    {showDeleteConfirm === log.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowDeleteConfirm(null)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          onClick={e => e.stopPropagation()}
                          className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full border border-gray-100"
                        >
                          <h3 className="text-lg font-bold text-slate-800 mb-2">Delete this log?</h3>
                          <p className="text-sm text-slate-500 mb-5">This will permanently remove this consultation log and any attached notes.</p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="flex-1 px-4 py-2.5 bg-gray-100 text-slate-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default VideoConsultations;
