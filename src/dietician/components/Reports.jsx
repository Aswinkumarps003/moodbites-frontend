import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  BarChart3, 
  Users,
  Clock,
  MessageCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('all');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const timeFrames = [
    { id: 'all', label: 'All Time' },
    { id: 'daily', label: 'Today' },
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
  ];

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('user');
        if (!token || !userStr) return;
        
        const dietician = JSON.parse(userStr);
        const response = await fetch(`http://localhost:3006/api/conversations/${dietician._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const formatted = data.map(conv => {
            // Find the other participant
            const patient = conv.participants.find(p => p._id && p._id.toString() !== dietician._id) || {};
            const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
            const msgCount = conv.messages ? conv.messages.length : 0;
            const date = lastMessage ? new Date(lastMessage.createdAt) : new Date(conv.updatedAt);
            
            return {
              id: conv._id,
              patientName: patient.name || 'Unknown Patient',
              patientEmail: patient.email || 'N/A',
              date: date,
              messageCount: msgCount,
              status: msgCount > 0 ? 'active' : 'idle',
            };
          }).filter(c => c.messageCount > 0);
          
          formatted.sort((a, b) => b.date - a.date);
          setConversations(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch reports data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const getFilteredConversations = () => {
    if (selectedTimeFrame === 'all') return conversations;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return conversations.filter(conv => {
      const convDate = new Date(conv.date);
      if (selectedTimeFrame === 'daily') {
        return convDate >= today;
      } else if (selectedTimeFrame === 'weekly') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return convDate >= weekAgo;
      } else if (selectedTimeFrame === 'monthly') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return convDate >= monthAgo;
      }
      return true;
    });
  };

  const filteredConversations = getFilteredConversations();

  const handleGeneratePDF = () => {
    if (filteredConversations.length === 0) return;
    
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text('Dietician Chat Consultations Report', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Generated on: ${dateStr} | Filter: ${timeFrames.find(t => t.id === selectedTimeFrame)?.label || 'All Time'}`, 14, 30);
    
    doc.setFontSize(14);
    doc.setTextColor(60);
    doc.text(`Total Chat Sessions: ${filteredConversations.length}`, 14, 42);
    const totalMsgs = filteredConversations.reduce((sum, c) => sum + c.messageCount, 0);
    doc.text(`Total Messages Exchanged: ${totalMsgs}`, 14, 50);

    const tableColumn = ["Patient Name", "Email", "Last Active Date", "Messages Exchanged", "Status"];
    const tableRows = [];

    filteredConversations.forEach(conv => {
      const convData = [
        conv.patientName,
        conv.patientEmail,
        conv.date.toLocaleDateString() + ' ' + conv.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        conv.messageCount.toString(),
        conv.status.toUpperCase()
      ];
      tableRows.push(convData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] }
    });

    doc.save(`MoodBites_Chat_Report_${selectedTimeFrame}_${dateStr.replace(/\//g, '-')}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/80 relative overflow-hidden group"
    >
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-400/30 transition-colors duration-700"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Chat Consultation Reports</h2>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center">
              Comprehensive patient insights from chat histories
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGeneratePDF}
          disabled={filteredConversations.length === 0 || loading}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center space-x-2 w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <BarChart3 className="w-5 h-5" />
          <span>Generate PDF Report</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm mb-8 relative z-10 flex flex-wrap items-center gap-6">
        <div className="flex items-center space-x-2 text-slate-600 font-bold">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </div>
        
        <div className="hidden sm:block w-px h-8 bg-white/60"></div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-slate-500">Activity Period:</span>
          <div className="flex bg-white/50 rounded-xl p-1 border border-white">
            {timeFrames.map((frame) => (
              <button
                key={frame.id}
                onClick={() => setSelectedTimeFrame(frame.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  selectedTimeFrame === frame.id
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-500 hover:bg-white/60'
                }`}
              >
                {frame.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4 relative z-10">
        {loading ? (
          <div className="text-center py-10 text-slate-500 font-medium">Fetching chat consultations...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-medium bg-white/50 rounded-xl border border-white">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-500" />
            No chat consultations found for this period.
          </div>
        ) : (
          filteredConversations.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: Math.min(index * 0.1, 1), duration: 0.4, type: "spring", bounce: 0.3 }}
              whileHover={{ scale: 1.01, y: -2 }}
              className="bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/60 hover:shadow-xl hover:shadow-emerald-500/10 hover:bg-white/60 transition-all duration-300 group/report"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start md:items-center space-x-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-md border-2 border-white/80 transform group-hover/report:rotate-3 transition-transform flex-shrink-0">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-lg text-slate-800 tracking-tight">{report.patientName}</h3>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white bg-green-100 text-green-800">
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-3">{report.patientEmail}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600 bg-white/50 inline-flex px-3 py-1.5 rounded-xl border border-white/60">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Last Active: {report.date.toLocaleDateString()}</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                      <div className="flex items-center space-x-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
                        <span><span className="text-slate-800">{report.messageCount}</span> Messages</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-all overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-0.5">Active Chats</p>
              <p className="text-3xl font-black text-slate-800">{loading ? '-' : filteredConversations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-all overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-colors"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
               <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Messages</p>
              <p className="text-3xl font-black text-slate-800">
                {loading ? '-' : filteredConversations.reduce((sum, c) => sum + c.messageCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Reports;


