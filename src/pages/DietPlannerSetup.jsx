import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

const DIET_PLANNER_URL = import.meta.env.VITE_DIET_PLANNER_SERVICE_URL || 'http://localhost:5005';
const ML_SERVICE_URL = import.meta.env.VITE_BLOOD_REPORT_SERVICE_URL || 'http://localhost:8000';

const steps = ["Activity", "Goals", "Preferences", "Goal Details", "Conditions", "Review"];

const DietPlannerSetup = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    activity: "",
    goals: [],
    conditions: [],
    // global
    dietPreference: null,
    cuisine: [],
    // goal-specific buckets
    weightLoss: { currentWeightKg: null, targetWeightKg: null, idealWeightCategory: null },
    countCalories: { calorieTarget: null, approach: null },
    muscleGain: { proteinTargetGrams: null, supplements: [], workoutType: null },
    workoutYoga: { workoutFrequency: null, yogaType: null, dietSupport: null },
    healthyFoods: { healthFocus: null, restrictedFoods: [] },
  });
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [biomarkers, setBiomarkers] = useState(null);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState('');

  const toggleArray = (key, value) => {
    setForm((prev) => {
      // For 'goals', allow only single selection. Others remain multi if used elsewhere.
      if (key === 'goals') {
        const isSame = prev.goals.length === 1 && prev.goals[0] === value;
        return { ...prev, goals: isSame ? [] : [value] };
      }
      const exists = prev[key].includes(value);
      return { ...prev, [key]: exists ? prev[key].filter((v) => v !== value) : [...prev[key], value] };
    });
  };

  const canNext = () => {
    if (step === 0) return !!form.activity;
    if (step === 1) return form.goals.length === 1;
    if (step === 2) {
      if (form.goals[0] === 'Diet Plan') {
        return !!form.dietPreference && form.cuisine.length > 0;
      }
      return true;
    }
    if (step === 3) return true; // goal details optional per goal but allow proceed
    if (step === 4) return form.conditions.length >= 0; // optional
    return true;
  };

  const goNext = () => {
    if (!canNext()) return;
    if (step === 1) {
      if (form.goals[0] !== 'Diet Plan') {
        setStep(3);
        return;
      }
    }
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };

  const submit = async () => {
    try {
      const userRaw = localStorage.getItem('user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      if (!user?._id) {
        alert('Please log in again.');
        return;
      }
      setGenerating(true);
      setGeneratedPlan(null);

      const resp = await fetch(`${DIET_PLANNER_URL}/api/diet-planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, ...form })
      });
      if (!resp.ok) throw new Error('Failed to save diet plan');
      const data = await resp.json();
      console.log('Saved diet:', data);

      const genResp = await fetch(`${DIET_PLANNER_URL}/api/diet-planner/generate/${user._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!genResp.ok) throw new Error('Failed to generate diet plan');
      const genData = await genResp.json();
      setGeneratedPlan(genData.plan || null);
      
      // Store the diet plan ID for future reference
      if (genData.dietPlanId) {
        localStorage.setItem('currentDietPlanId', genData.dietPlanId);
      }
      
      alert(`Your personalized diet plan is ready! Plan ID: ${genData.dietPlanId || 'N/A'}`);
    } catch (e) {
      console.error(e);
      alert('Error creating or generating diet plan');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    // Fetch latest blood report biomarkers for the current user
    const fetchBiomarkers = async () => {
      try {
        const userRaw = localStorage.getItem('user');
        const user = userRaw ? JSON.parse(userRaw) : null;
        if (!user?._id) return;
        setBioLoading(true);
        setBioError('');
        const resp = await fetch(`${ML_SERVICE_URL}/api/blood-report/latest/${user._id}`);
        if (!resp.ok) throw new Error('No blood report found');
        const json = await resp.json();
        const report = json.report || {};
        const tests = (report.analysisResults && report.analysisResults.tests) || [];
        const norm = (s) => (s || '').toLowerCase().trim();
        // Extract key markers
        let out = { glucose: null, totalCholesterol: null, ldl: null, hdl: null, triglycerides: null };
        tests.forEach(t => {
          const name = norm(t.name);
          const valueNum = parseFloat(String(t.value || '').replace(/[^0-9.]/g, ''));
          if (!Number.isFinite(valueNum)) return;
          if (name.includes('glucose') || name.includes('sugar')) out.glucose = valueNum;
          else if (name.includes('total') && name.includes('cholesterol')) out.totalCholesterol = valueNum;
          else if (name.includes('ldl')) out.ldl = valueNum;
          else if (name.includes('hdl')) out.hdl = valueNum;
          else if (name.includes('triglycer')) out.triglycerides = valueNum;
        });
        setBiomarkers(out);
      } catch (e) {
        setBioError(e.message || 'Failed to load blood report');
      } finally {
        setBioLoading(false);
      }
    };
    fetchBiomarkers();
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Create Your Perfect Diet Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Answer a few questions and we'll create a personalized nutrition plan tailored just for you
          </p>
        </motion.div>

        {/* Enhanced Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
            {/* Biomarkers Panel */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold text-gray-800">Latest Blood Report Highlights</div>
                {bioLoading && <div className="text-sm text-gray-500">Loading...</div>}
              </div>
              {bioError ? (
                <div className="text-sm text-gray-500">{bioError}</div>
              ) : biomarkers ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { key: 'glucose', label: 'Glucose (mg/dL)', value: biomarkers.glucose, high: (v)=> v>=125, borderline:(v)=> v>=100 },
                    { key: 'totalCholesterol', label: 'Total Chol (mg/dL)', value: biomarkers.totalCholesterol, high:(v)=> v>=240, borderline:(v)=> v>=200 },
                    { key: 'ldl', label: 'LDL (mg/dL)', value: biomarkers.ldl, high:(v)=> v>=160, borderline:(v)=> v>=130 },
                    { key: 'triglycerides', label: 'Triglycerides (mg/dL)', value: biomarkers.triglycerides, high:(v)=> v>=200, borderline:(v)=> v>=150 },
                  ].map((m) => {
                    const v = m.value;
                    const status = v==null ? 'N/A' : m.high(v) ? 'High' : m.borderline(v) ? 'Borderline' : 'Normal';
                    const color = status==='High' ? 'text-red-700 bg-red-50 border-red-200' : status==='Borderline' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200';
                    return (
                      <div key={m.key} className={`p-4 rounded-2xl border ${color}`}>
                        <div className="text-xs text-gray-500 mb-1">{m.label}</div>
                        <div className="text-xl font-bold">{v==null ? '—' : Math.round(v)}</div>
                        <div className="text-xs mt-1">Status: {status}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No blood report found.</div>
              )}
              {/* Simple tailored guidance text */}
              {biomarkers && (
                <div className="mt-4 text-sm">
                  <div className="font-semibold text-gray-800 mb-1">Personalized guidance based on your report:</div>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {(() => {
                      const notes = [];
                      const g = biomarkers.glucose;
                      const chol = biomarkers.totalCholesterol;
                      const ldl = biomarkers.ldl;
                      const trig = biomarkers.triglycerides;
                      if (g != null && (g >= 125)) notes.push('Since your glucose is high, we will avoid sugary items and prioritize low-carb recipes.');
                      else if (g != null && g >= 100) notes.push('Your glucose is borderline; we will reduce sugar and simple carbs.');
                      const cholRisk = (chol != null && chol >= 200) || (ldl != null && ldl >= 130);
                      if (cholRisk) notes.push('Since your cholesterol is elevated, we will avoid oily/fried foods and high saturated fat.');
                      if (trig != null && trig >= 150) notes.push('Elevated triglycerides detected; we will limit refined carbs and added sugars.');
                      if (notes.length === 0) notes.push('All key markers are within normal range. We will recommend a balanced, nutrient-dense plan.');
                      return notes.map((n, i) => (<li key={i}>{n}</li>));
                    })()}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mb-4">
            {steps.map((label, idx) => (
              <div key={label} className="flex-1 flex items-center">
                  <motion.div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-500 ${
                      idx <= step 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-200' 
                        : 'bg-white text-gray-400 border-2 border-gray-200'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {idx < step ? <Check className="w-5 h-5" /> : idx + 1}
                  </motion.div>
                {idx < steps.length - 1 && (
                    <motion.div 
                      className={`flex-1 h-2 mx-3 rounded-full transition-all duration-500 ${
                        idx < step 
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-400' 
                          : 'bg-gray-200'
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: idx < step ? 1 : 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                )}
              </div>
            ))}
          </div>
            <div className="text-center">
              <motion.div 
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-semibold text-gray-800"
              >
                Step {step + 1} of {steps.length}: {steps[step]}
              </motion.div>
              <div className="mt-2 text-sm text-gray-500">
                {Math.round(((step + 1) / steps.length) * 100)}% Complete
              </div>
            </div>
        </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8"
        >
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div 
                key="activity" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏃‍♂️</span>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                    How active are you?
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Based on your lifestyle, we can assess your daily calorie requirements and create the perfect plan for you.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {["Mostly Sitting", "Often Standing", "Regularly Walking", "Physically Intense Work"].map((opt, index) => (
                    <motion.button
                      key={opt}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setForm((p) => ({ ...p, activity: opt }))}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                        form.activity === opt 
                          ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg shadow-emerald-100' 
                          : 'border-gray-200 hover:border-emerald-300 hover:shadow-md bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full transition-all ${
                          form.activity === opt ? 'bg-emerald-500' : 'bg-gray-300 group-hover:bg-emerald-400'
                        }`}></div>
                        <div className="font-bold text-gray-900 text-lg">{opt}</div>
                      </div>
                      <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                        {form.activity === opt ? '✓ Selected' : 'Click to select'}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div 
                key="goals" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                    What are you looking for?
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Select your primary goal to help us create a personalized experience just for you.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["Diet Plan","Weight Loss","Count Calories","Healthy Foods"].map((g, index) => (
                    <motion.button
                      key={g}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => toggleArray('goals', g)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group p-6 rounded-2xl border-2 text-center transition-all duration-300 ${
                        form.goals.includes(g) 
                          ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg shadow-emerald-100' 
                          : 'border-gray-200 hover:border-emerald-300 hover:shadow-md bg-white'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full mb-3 transition-all ${
                          form.goals.includes(g) ? 'bg-emerald-500' : 'bg-gray-300 group-hover:bg-emerald-400'
                        }`}></div>
                        <div className="font-bold text-gray-900 text-lg mb-1">{g}</div>
                        <div className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                          {form.goals.includes(g) ? '✓ Selected' : 'Click to select'}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && form.goals[0] === 'Diet Plan' && (
              <motion.div 
                key="preferences" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                    Diet Preferences
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    These preferences will be applied across your entire personalized diet plan.
                  </p>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Diet Type</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {["Veg","Non-Veg","Vegan","Eggetarian"].map((opt, index) => (
                      <motion.button 
                        key={opt} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setForm(p => ({...p, dietPreference: opt}))}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`group p-4 rounded-2xl border-2 text-center transition-all duration-300 ${
                          form.dietPreference===opt 
                            ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg shadow-emerald-100' 
                            : 'border-gray-200 hover:border-emerald-300 hover:shadow-md bg-white'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full mb-2 transition-all ${
                            form.dietPreference === opt ? 'bg-emerald-500' : 'bg-gray-300 group-hover:bg-emerald-400'
                          }`}></div>
                          <div className="font-bold text-gray-900">{opt}</div>
                        </div>
                      </motion.button>
                  ))}
                </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Preferred Cuisine</h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {["Indian","Mediterranean","Keto","Continental","Japanese","Thai","Mexican"].map((c, index) => {
                      const selected = form.cuisine.includes(c);
                      return (
                        <motion.button 
                          key={c} 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setForm(p => ({...p, cuisine: selected ? p.cuisine.filter(x=>x!==c) : [...p.cuisine, c]}))}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-6 py-3 rounded-full text-sm font-semibold border-2 transition-all duration-300 ${
                            selected 
                              ? 'border-emerald-500 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200' 
                              : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700'
                          }`}
                        >
                          {c}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="goal-details" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Goal Details</h2>
                <div className="space-y-6">
                  {form.goals[0] === "Diet Plan" && (
                    <div className="p-4 rounded-2xl border border-gray-200">
                      <div className="font-semibold mb-2">Diet Plan</div>
                      <p className="text-sm text-gray-600 mb-3">You selected a general Diet Plan. Based on your preferences, we'll personalize meal ideas.</p>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="p-3 rounded-xl bg-gray-50">
                          <div className="text-gray-500">Diet Preference</div>
                          <div className="font-medium text-gray-900">{form.dietPreference || '—'}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50">
                          <div className="text-gray-500">Preferred Cuisines</div>
                          <div className="font-medium text-gray-900">{form.cuisine.length ? form.cuisine.join(', ') : '—'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {form.goals[0] === "Weight Loss" && (
                    <div className="p-4 rounded-2xl border border-gray-200">
                      <div className="font-semibold mb-3">Weight Loss</div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <input type="number" placeholder="Current Weight (kg)" className="w-full border rounded-xl px-3 py-2"
                          value={form.weightLoss.currentWeightKg ?? ''}
                          onChange={e=>setForm(p=>({...p, weightLoss:{...p.weightLoss, currentWeightKg: Number(e.target.value)||null}}))} />
                        <input type="number" placeholder="Target Weight (kg)" className="w-full border rounded-xl px-3 py-2"
                          value={form.weightLoss.targetWeightKg ?? ''}
                          onChange={e=>setForm(p=>({...p, weightLoss:{...p.weightLoss, targetWeightKg: Number(e.target.value)||null}}))} />
                        <select className="w-full border rounded-xl px-3 py-2" value={form.weightLoss.idealWeightCategory||''}
                          onChange={e=>setForm(p=>({...p, weightLoss:{...p.weightLoss, idealWeightCategory: e.target.value || null}}))}>
                          <option value="">Ideal Weight Category</option>
                          {['Underweight','Normal','Overweight','Obese'].map(x=> <option key={x} value={x}>{x}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {form.goals[0] === "Count Calories" && (
                    <div className="p-4 rounded-2xl border border-gray-200">
                      <div className="font-semibold mb-3">Count Calories</div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input type="number" placeholder="Calorie Target (kcal/day)" className="w-full border rounded-xl px-3 py-2"
                          value={form.countCalories.calorieTarget ?? ''}
                          onChange={e=>setForm(p=>({...p, countCalories:{...p.countCalories, calorieTarget: Number(e.target.value)||null}}))} />
                        <select className="w-full border rounded-xl px-3 py-2" value={form.countCalories.approach||''}
                          onChange={e=>setForm(p=>({...p, countCalories:{...p.countCalories, approach: e.target.value || null}}))}>
                          <option value="">Approach</option>
                          {['Balanced Diet','Low Carb','Intermittent Fasting'].map(x=> <option key={x} value={x}>{x}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {form.goals[0] === "Muscle Gain" && (
                    <div className="p-4 rounded-2xl border border-gray-200">
                      <div className="font-semibold mb-3">Muscle Gain</div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <input type="number" placeholder="Protein Target (g/day)" className="w-full border rounded-xl px-3 py-2"
                          value={form.muscleGain.proteinTargetGrams ?? ''}
                          onChange={e=>setForm(p=>({...p, muscleGain:{...p.muscleGain, proteinTargetGrams: Number(e.target.value)||null}}))} />
                        <select className="w-full border rounded-xl px-3 py-2" value={form.muscleGain.workoutType||''}
                          onChange={e=>setForm(p=>({...p, muscleGain:{...p.muscleGain, workoutType: e.target.value || null}}))}>
                          <option value="">Workout Type</option>
                          {['Strength Training','Bodyweight','CrossFit'].map(x=> <option key={x} value={x}>{x}</option>)}
                        </select>
                        <input type="text" placeholder="Supplements (comma separated)" className="w-full border rounded-xl px-3 py-2"
                          value={(form.muscleGain.supplements||[]).join(', ')}
                          onChange={e=>setForm(p=>({...p, muscleGain:{...p.muscleGain, supplements: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}}))} />
                      </div>
                    </div>
                  )}

                  {form.goals[0] === "Workout and Yoga" && (
                    <div className="p-4 rounded-2xl border border-gray-200">
                      <div className="font-semibold mb-3">Workout & Yoga</div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <select className="w-full border rounded-xl px-3 py-2" value={form.workoutYoga.workoutFrequency||''}
                          onChange={e=>setForm(p=>({...p, workoutYoga:{...p.workoutYoga, workoutFrequency: e.target.value || null}}))}>
                          <option value="">Workout Frequency</option>
                          {['Daily','3x per week','Custom'].map(x=> <option key={x} value={x}>{x}</option>)}
                        </select>
                        <select className="w-full border rounded-xl px-3 py-2" value={form.workoutYoga.yogaType||''}
                          onChange={e=>setForm(p=>({...p, workoutYoga:{...p.workoutYoga, yogaType: e.target.value || null}}))}>
                          <option value="">Yoga Type</option>
                          {['Hatha','Vinyasa','Power Yoga'].map(x=> <option key={x} value={x}>{x}</option>)}
                        </select>
                        <input type="text" placeholder="Diet Support (e.g., High Protein)" className="w-full border rounded-xl px-3 py-2"
                          value={form.workoutYoga.dietSupport||''}
                          onChange={e=>setForm(p=>({...p, workoutYoga:{...p.workoutYoga, dietSupport: e.target.value || null}}))} />
                      </div>
                    </div>
                  )}

                  {form.goals[0] === "Healthy Foods" && (
                    <div className="p-4 rounded-2xl border border-gray-200">
                      <div className="font-semibold mb-3">Healthy Foods</div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <select className="w-full border rounded-xl px-3 py-2" value={form.healthyFoods.healthFocus||''}
                          onChange={e=>setForm(p=>({...p, healthyFoods:{...p.healthyFoods, healthFocus: e.target.value || null}}))}>
                          <option value="">Health Focus</option>
                          {['Diabetes-friendly','Heart-healthy','Low sodium','High fiber'].map(x=> <option key={x} value={x}>{x}</option>)}
                        </select>
                        <input type="text" placeholder="Restricted Foods (comma separated)" className="w-full border rounded-xl px-3 py-2"
                          value={(form.healthyFoods.restrictedFoods||[]).join(', ')}
                          onChange={e=>setForm(p=>({...p, healthyFoods:{...p.healthyFoods, restrictedFoods: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}}))} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="conditions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Any Medical Condition we should be aware of?</h2>
                <p className="text-gray-600 mb-6">This helps us guide you safely towards your goals.</p>
                <div className="flex flex-wrap gap-2">
                  {["None","Diabetes","Pre-Diabetes","Cholesterol","Hypertension","Thyroid","Physical Injury","Excessive Stress/Anxiety","Sleep Issues","Depression"].map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleArray('conditions', c)}
                      className={`px-4 py-2 rounded-full text-sm border transition ${
                        form.conditions.includes(c) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >{c}</button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="review" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
                <p className="text-gray-600 mb-6">Make sure everything looks good before we generate your plan.</p>
                <div className="space-y-4 text-sm text-gray-700">
                  <div><span className="font-semibold">Activity:</span> {form.activity || '—'}</div>
                  <div><span className="font-semibold">Goal:</span> {form.goals[0] || '—'}</div>
                  <div><span className="font-semibold">Diet Preference:</span> {form.dietPreference || '—'}</div>
                  <div><span className="font-semibold">Cuisine:</span> {form.cuisine.length ? form.cuisine.join(', ') : '—'}</div>
                  <div><span className="font-semibold">Conditions:</span> {form.conditions.length ? form.conditions.join(', ') : '—'}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Footer Nav */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex items-center justify-between"
          >
            <motion.button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              whileHover={{ scale: step === 0 ? 1 : 1.02 }}
              whileTap={{ scale: step === 0 ? 1 : 0.98 }}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold border-2 transition-all duration-300 ${
                step === 0 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400'
              }`}
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </motion.button>
            
            {step < steps.length - 1 ? (
              <motion.button
                whileHover={{ scale: canNext() ? 1.05 : 1 }}
                whileTap={{ scale: canNext() ? 0.95 : 1 }}
                onClick={goNext}
                className={`inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 ${
                  canNext() 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-xl hover:shadow-emerald-200' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next <ChevronRight className="w-5 h-5" />
              </motion.button>
            ) : (
                <motion.button
                whileHover={{ scale: generating ? 1 : 1.05 }}
                whileTap={{ scale: generating ? 1 : 0.95 }}
                  onClick={submit}
                  disabled={generating}
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 ${
                  generating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:shadow-2xl hover:shadow-emerald-300'
                }`}
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="text-xl">✨</span>
                    Generate My Diet Plan
                  </>
                )}
                </motion.button>
            )}
          </motion.div>

          {/* Enhanced Generated Plan Display */}
          {generatedPlan && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              className="mt-12 p-8 rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-2">
                  Your Personalized Diet Plan
                </h3>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full">
                  <span className="text-emerald-800 font-bold text-lg">{generatedPlan.TotalCalories || '—'}</span>
                  <span className="text-emerald-600 text-sm">Daily Calories</span>
                </div>
              </div>
              
              <div className="grid gap-6">
                {Object.entries(generatedPlan).filter(([key]) => key !== 'TotalCalories').map(([mealType, mealData], index) => (
                  <motion.div
                    key={mealType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-6 rounded-3xl bg-white/80 backdrop-blur-sm border-2 border-emerald-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {mealType === 'Breakfast' ? '🌅' : 
                               mealType === 'Lunch' ? '☀️' : 
                               mealType === 'Dinner' ? '🌙' : 
                               mealType === 'Snack1' ? '🍎' : 
                               mealType === 'Snack2' ? '🥜' : '🍽️'}
                            </span>
                          </div>
                          <div>
                            <span className="text-xl font-bold text-emerald-700 capitalize">
                            {mealType === 'Snack1' ? 'Morning Snack' : 
                             mealType === 'Snack2' ? 'Evening Snack' : 
                             mealType}
                          </span>
                            <div className="px-4 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-full text-sm font-semibold inline-block mt-1">
                            {typeof mealData.calories === 'number' ? `${Math.round(mealData.calories)} kcal` : mealData.calories}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-800 font-semibold text-lg mb-2">{mealData.recipe}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <span>📋</span>
                          {mealData.ingredients?.length || 0} ingredients
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          // Navigate to recipe view page
                          const recipeData = {
                            mealType,
                            recipe: mealData.recipe,
                            calories: mealData.calories,
                            ingredients: mealData.ingredients,
                            image: mealData.image || null,
                            readyInMinutes: mealData.readyInMinutes || 30,
                            servings: mealData.servings || 1
                          };
                          localStorage.setItem('currentRecipe', JSON.stringify(recipeData));
                          window.open('/diet-plan-view', '_blank');
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 flex items-center gap-2"
                      >
                        <span>👁️</span>
                        View Recipe
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-6 bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 rounded-3xl border-2 border-emerald-200"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-800">Daily Calorie Goal</div>
                    <div className="text-2xl font-bold text-emerald-700">{generatedPlan.TotalCalories}</div>
                </div>
              </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DietPlannerSetup;


