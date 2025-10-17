import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  BarChart3, 
  TrendingUp,
  Users,
  Clock,
  Eye,
  Share2
} from 'lucide-react';

const Reports = () => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('weekly');
  const [selectedReportType, setSelectedReportType] = useState('all');

  const timeFrames = [
    { id: 'daily', label: 'Daily', icon: Calendar },
    { id: 'weekly', label: 'Weekly', icon: Calendar },
    { id: 'monthly', label: 'Monthly', icon: Calendar },
  ];

  const reportTypes = [
    { id: 'all', label: 'All Reports' },
    { id: 'patient', label: 'Patient Progress' },
    { id: 'mood', label: 'Mood Analytics' },
    { id: 'nutrition', label: 'Nutrition Reports' },
  ];

  const reports = [
    {
      id: 1,
      title: 'Weekly Patient Progress Report',
      type: 'patient',
      date: '2024-01-15',
      patients: 23,
      status: 'completed',
      size: '2.4 MB',
      description: 'Comprehensive overview of patient mood trends and dietary adherence',
    },
    {
      id: 2,
      title: 'Monthly Mood Analytics',
      type: 'mood',
      date: '2024-01-10',
      patients: 45,
      status: 'completed',
      size: '1.8 MB',
      description: 'Detailed analysis of mood patterns and correlation with nutrition',
    },
    {
      id: 3,
      title: 'Nutrition Compliance Report',
      type: 'nutrition',
      date: '2024-01-08',
      patients: 32,
      status: 'completed',
      size: '3.1 MB',
      description: 'Patient adherence to recommended meal plans and nutritional goals',
    },
    {
      id: 4,
      title: 'Q1 Performance Summary',
      type: 'all',
      date: '2024-01-05',
      patients: 67,
      status: 'generating',
      size: '4.2 MB',
      description: 'Quarterly summary of all patient outcomes and practice metrics',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'patient':
        return Users;
      case 'mood':
        return TrendingUp;
      case 'nutrition':
        return BarChart3;
      default:
        return FileText;
    }
  };

  const handleDownload = (reportId) => {
    console.log(`Downloading report ${reportId}`);
    // Here you would implement actual download functionality
  };

  const handleGenerateReport = () => {
    console.log('Generating new report...');
    // Here you would implement report generation
  };

  const filteredReports = reports.filter(report => 
    selectedReportType === 'all' || report.type === selectedReportType
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-emerald-500" />
          Reports & Analytics
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerateReport}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center space-x-2"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Generate Report</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        {/* Time Frame Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Time:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {timeFrames.map((frame) => (
              <button
                key={frame.id}
                onClick={() => setSelectedTimeFrame(frame.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  selectedTimeFrame === frame.id
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {frame.label}
              </button>
            ))}
          </div>
        </div>

        {/* Report Type Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Type:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedReportType(type.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  selectedReportType === type.id
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report, index) => {
          const TypeIcon = getTypeIcon(report.type);
          
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{report.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Date: {new Date(report.date).toLocaleDateString()}</span>
                      <span>Patients: {report.patients}</span>
                      <span>Size: {report.size}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDownload(report.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Preview">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Share">
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Patients Covered</p>
              <p className="text-2xl font-bold text-gray-800">67</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Last Generated</p>
              <p className="text-sm font-bold text-gray-800">2 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Reports;


