import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Brain,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Info,
  Calendar,
  User,
  Microscope,
  BarChart3,
  RefreshCw,
  Share2,
  Utensils
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Optimal targets and scoring helpers
const toNumber = (value) => {
  if (value == null) return NaN;
  const num = parseFloat(String(value).replace(/[^\d.\-]/g, ''));
  return isNaN(num) ? NaN : num;
};

const getGender = (g) => (g || '').toLowerCase().startsWith('f') ? 'female' : 'male';

// Returns { optimalRange, targetNote, statusOverride? }
const getOptimalForTest = (name, value, age, gender) => {
  const ageNum = toNumber(age);
  const val = toNumber(value);
  const sex = getGender(gender);

  const result = { optimalRange: 'N/A', targetNote: '' };
  const young = ageNum && ageNum < 30;

  const inRange = (min, max) => !isNaN(val) && val >= min && val <= max;

  switch ((name || '').toUpperCase()) {
    case 'SERUM CHOLESTEROL':
    case 'TOTAL CHOLESTEROL':
    case 'CHOLESTEROL': {
      const targetMax = young ? 170 : 180;
      result.optimalRange = `< ${targetMax} mg/dL`;
      result.targetNote = 'Lower is better. Focus on fiber and exercise.';
      if (!isNaN(val)) {
        if (val < 200) result.statusOverride = 'Normal';
        else if (val < 240) result.statusOverride = 'Borderline High';
        else result.statusOverride = 'High';
      }
      break;
    }
    case 'SERUM TRIGLYCERIDES':
    case 'TRIGLYCERIDES': {
      result.optimalRange = '< 100 mg/dL';
      result.targetNote = 'Reduce refined carbs; increase omega-3 intake.';
      if (!isNaN(val)) {
        if (val < 150) result.statusOverride = 'Normal';
        else if (val < 200) result.statusOverride = 'Borderline High';
        else result.statusOverride = 'High';
      }
      break;
    }
    case 'SERUM HDL':
    case 'HDL': {
      const min = sex === 'female' ? 50 : 40;
      result.optimalRange = `> 60 mg/dL (Min ${min})`;
      result.targetNote = 'Increase activity; prefer healthy fats.';
      if (!isNaN(val)) {
        if (val < min) result.statusOverride = 'Low';
        else result.statusOverride = 'Normal';
      }
      break;
    }
    case 'SERUM LDL':
    case 'LDL': {
      const target = young ? 90 : 100;
      result.optimalRange = `< ${target} mg/dL`;
      result.targetNote = 'Limit saturated fats; add soluble fiber.';
      if (!isNaN(val)) {
        if (val < 100) result.statusOverride = 'Normal';
        else if (val < 130) result.statusOverride = 'Borderline High';
        else result.statusOverride = 'High';
      }
      break;
    }
    case 'VLDL': {
      result.optimalRange = '5 - 20 mg/dL';
      result.targetNote = 'Optimize triglycerides via diet/exercise.';
      if (!isNaN(val)) {
        if (inRange(5, 20)) result.statusOverride = 'Normal';
        else if (val < 5) result.statusOverride = 'Low';
        else result.statusOverride = 'High';
      }
      break;
    }
    case 'CHO/HDL RATIO':
    case 'TC/HDL RATIO': {
      result.optimalRange = '< 3.5';
      result.targetNote = 'Improve HDL and lower total cholesterol.';
      if (!isNaN(val)) {
        if (val < 3.5) result.statusOverride = 'Normal';
        else if (val < 4.5) result.statusOverride = 'Borderline High';
        else result.statusOverride = 'High';
      }
      break;
    }
    case 'LDL/HDL RATIO': {
      result.optimalRange = '< 2.5';
      result.targetNote = 'Lower LDL or raise HDL for better ratio.';
      if (!isNaN(val)) {
        if (val < 2.5) result.statusOverride = 'Normal';
        else if (val < 3) result.statusOverride = 'Borderline High';
        else result.statusOverride = 'High';
      }
      break;
    }
    default:
      break;
  }
  return result;
};

const computeHealthScore = (tests = []) => {
  if (!Array.isArray(tests) || tests.length === 0) return 0;
  let score = 0;
  tests.forEach((t) => {
    const status = (t.status || '').toLowerCase();
    if (status === 'normal') score += 3;
    else if (status === 'borderline high') score += 2;
    else if (status === 'low') score += 2;
    else if (status === 'high') score += 0;
    else score += 1;
  });
  const max = tests.length * 3;
  return Math.round((score / max) * 100);
};

// New Component: Validation Error Modal (minimal, no diagnostic details)
const ValidationErrorModal = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95, y: 10 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-200 text-center"
    >
      <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Invalid File</h2>
      <p className="text-gray-700">This file is not an actual blood report. Please upload a valid blood report (PDF/JPG/PNG).</p>
      <button
        onClick={onClose}
        className="w-full mt-6 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
      >
        Okay
      </button>
    </motion.div>
  </motion.div>
);


const BloodReport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [showRawText, setShowRawText] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrorDetails, setValidationErrorDetails] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('authToken');

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG) or PDF file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setSelectedFile(file);
    setError(null);
    setValidationErrorDetails(null);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setValidationErrorDetails(null);

    try {
      const formData = new FormData();
      formData.append('bloodReport', selectedFile);
      formData.append('userId', user._id);

      const response = await fetch('http://localhost:8000/api/blood-report/analyze', {
        method: 'POST',
        headers: {
          // Do not set Content-Type, browser does it automatically for FormData
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        // If it's a validation error, show the detailed modal
        if (response.status === 400 && errorData.error === 'File validation failed') {
          setValidationErrorDetails(errorData.validation);
        } else {
          setError(errorData.error || 'An unexpected error occurred during analysis.');
        }
        return; // Stop processing on error
      }

      const result = await response.json();
      const payload = result.data || {};
      setExtractedData(payload.analysisResults || null);
      setExtractedText(payload.extractedText || '');
      setInsights(payload.insights || []);
      setRecommendations(payload.recommendations || []);
      setActiveTab('results');

    } catch (err) {
      setError(err.message || 'Failed to connect to the analysis service.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Normal': return 'text-green-600 bg-green-50 border-green-200';
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Borderline High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Normal': return <CheckCircle className="w-4 h-4" />;
      case 'High': return <TrendingUp className="w-4 h-4" />;
      case 'Borderline High': return <AlertTriangle className="w-4 h-4" />;
      case 'Low': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  // Floating emoji data for decoration
  const floatingIcons = [
    { emoji: "🩸", top: "12%", left: "6%", delay: 0 },
    { emoji: "🔬", top: "28%", left: "80%", delay: 0.5 },
    { emoji: "💊", top: "55%", left: "10%", delay: 1 },
    { emoji: "🧬", top: "70%", left: "85%", delay: 1.5 },
    { emoji: "🏥", top: "40%", left: "92%", delay: 2 },
    { emoji: "❤️", top: "88%", left: "12%", delay: 0.8 },
  ];

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
      <AnimatePresence>
        {validationErrorDetails && (
          <ValidationErrorModal onClose={() => setValidationErrorDetails(null)} />
        )}
      </AnimatePresence>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-900 via-red-800 to-pink-900" style={{ minHeight: '340px' }}>
        <img
          src="https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/60 via-red-800/70 to-pink-900/90" />

        {/* Floating Emojis */}
        {floatingIcons.map((icon, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl select-none pointer-events-none"
            style={{ top: icon.top, left: icon.left }}
            animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: icon.delay, ease: "easeInOut" }}
          >
            {icon.emoji}
          </motion.div>
        ))}

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/90 font-semibold text-sm mb-6 tracking-wide uppercase border border-white/20">
              AI-Powered Health Analysis
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 font-display leading-tight">
              Blood Report <span className="bg-gradient-to-r from-rose-300 to-pink-200 bg-clip-text text-transparent">Analysis</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Upload your blood test report and get instant AI-powered analysis with personalized health insights and dietary recommendations
            </p>
          </motion.div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Brain, title: "AI-Powered", desc: "Smart OCR + analysis engine", color: "from-rose-500 to-pink-600" },
            { icon: Activity, title: "Instant Results", desc: "Get insights in seconds", color: "from-blue-500 to-indigo-600" },
            { icon: Utensils, title: "Diet Tips", desc: "Personalized food advice", color: "from-emerald-500 to-teal-600" },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-white/30 flex items-center space-x-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/20">
            <div className="flex space-x-2">
              {[
                { id: 'upload', label: 'Upload Report', icon: Upload },
                { id: 'results', label: 'Analysis Results', icon: BarChart3, disabled: !extractedData }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    disabled={tab.disabled}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/25'
                        : tab.disabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-white/50 hover:text-red-600'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 relative overflow-hidden">
                {/* Decorative top accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500" />

                <div
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-500 ${dragActive
                      ? 'border-red-400 bg-gradient-to-br from-red-50 to-pink-50 shadow-inner scale-[1.02]'
                      : selectedFile
                        ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50'
                        : 'border-gray-300 hover:border-red-400 hover:bg-red-50/30 hover:shadow-lg'
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  {!selectedFile ? (
                    <>
                      <div className="relative mx-auto mb-6 w-24 h-24">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse opacity-20" />
                        <div className="relative w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                          <Upload className="w-12 h-12 text-red-500" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Blood Report</h3>
                      <p className="text-gray-600 mb-2">Drag and drop your report here, or click to browse</p>
                      <p className="text-sm text-gray-400 mb-6">Supports JPEG, PNG, and PDF files up to 10MB</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        Choose File
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">File Selected</h3>
                      <p className="text-gray-600 mb-4">{selectedFile.name}</p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Remove
                        </button>
                        <button
                          onClick={handleAnalysis}
                          disabled={isAnalyzing}
                          className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 disabled:opacity-50"
                        >
                          {isAnalyzing ? (
                            <div className="flex items-center space-x-2"><RefreshCw className="w-5 h-5 animate-spin" /><span>Analyzing...</span></div>
                          ) : (
                            'Analyze Report'
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700">{error}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'results' && extractedData && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-red-50 rounded-3xl shadow-2xl border border-rose-100 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500" />
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Analysis Summary</h2>
                    <div className="flex items-center space-x-6 text-gray-700">
                      <div className="flex items-center space-x-2"><User className="w-5 h-5" /><span>{extractedData.patientName}</span></div>
                      <div className="flex items-center space-x-2"><Calendar className="w-5 h-5" /><span>{extractedData.reportOn}</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const score = computeHealthScore(extractedData.tests);
                      return (
                        <div>
                          <div className="text-sm text-gray-600">Lipid Health Score</div>
                          <div className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">{score}<span className="text-base font-semibold text-gray-500">/100</span></div>
                          <div className="mt-2 w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-3 rounded-full ${score >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : score >= 60 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Patient Details */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Patient Details</h2>
                    <div className="flex items-center space-x-6 text-gray-600">
                      <div className="flex items-center space-x-2"><User className="w-5 h-5" /><span>{extractedData.patientName}</span></div>
                      <div className="flex items-center space-x-2"><Calendar className="w-5 h-5" /><span>{extractedData.reportOn}</span></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Age", value: extractedData.patientAge, color: "from-rose-500 to-pink-500" },
                    { label: "Gender", value: extractedData.patientGender, color: "from-blue-500 to-indigo-500" },
                    { label: "Bill No", value: extractedData.billNo, color: "from-purple-500 to-violet-500" },
                    { label: "Bill Date", value: extractedData.billDate, color: "from-amber-500 to-orange-500" },
                    { label: "Collected On", value: extractedData.collectedOn, color: "from-emerald-500 to-teal-500" },
                    { label: "Report On", value: extractedData.reportOn, color: "from-cyan-500 to-blue-500" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200 relative overflow-hidden"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.color}`} />
                      <p className="text-xs uppercase tracking-wide text-gray-500 pl-3">{item.label}</p>
                      <p className="text-gray-900 font-semibold pl-3">{item.value || 'N/A'}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Test Results */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Test Results</h3>
                <div className="grid gap-4">
                  {extractedData.tests.map((test, index) => {
                    const age = extractedData.patientAge;
                    const gender = extractedData.patientGender;
                    const optimal = getOptimalForTest(test.name, test.value, age, gender);
                    const status = optimal.statusOverride || test.status;
                    const unit = test.unit ? ` ${test.unit}` : '';
                    const borderColor = status === 'Normal' ? 'border-l-green-500' : status === 'High' ? 'border-l-red-500' : status === 'Borderline High' ? 'border-l-orange-500' : status === 'Low' ? 'border-l-yellow-500' : 'border-l-gray-300';
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColor} p-4 hover:shadow-lg transition-all duration-200`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{test.name}</h4>
                            <p className="text-sm text-gray-600">Normal Range: {test.normalRange}</p>
                            {optimal.optimalRange !== 'N/A' && (
                              <div className="mt-1 text-xs text-gray-500">
                                Optimal for {getGender(gender)} {age ? `${age}y` : ''}: <span className="font-medium text-gray-700">{optimal.optimalRange}</span>
                                {optimal.targetNote && <span className="ml-2 italic">• {optimal.targetNote}</span>}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">
                                {test.value} <span className="text-sm font-normal text-gray-600">{unit}</span>
                              </div>
                            </div>
                            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(status)}`}>
                              {getStatusIcon(status)}
                              <span className="text-sm font-medium capitalize">{status}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Full Extracted Text (Collapsible) */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Full Extracted Text</h3>
                  <button
                    onClick={() => setShowRawText(!showRawText)}
                    className="text-sm font-semibold text-red-600 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    {showRawText ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showRawText && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-80 overflow-auto whitespace-pre-wrap text-sm text-gray-800">
                    {extractedText || 'No extracted text available.'}
                  </div>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BloodReport;

