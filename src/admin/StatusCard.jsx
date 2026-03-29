import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Server, Globe, Shield } from "lucide-react";

const services = [
  { name: "User Service", url: "https://user-service-latest-bae8.onrender.com/api", icon: Shield },
  { name: "Food Service", url: "https://food-service-new.onrender.com/api/food", icon: Server },
  { name: "Diet Service", url: "https://diet-service-latest.onrender.com/api", icon: Globe },
];

const StatusCard = () => {
  const [statuses, setStatuses] = useState(
    services.map((s) => ({ ...s, status: "checking", responseTime: null }))
  );

  useEffect(() => {
    const checkServices = async () => {
      const results = await Promise.all(
        services.map(async (service) => {
          const start = Date.now();
          try {
            const resp = await fetch(service.url, { method: "GET", signal: AbortSignal.timeout(10000) });
            const time = Date.now() - start;
            return { ...service, status: resp.ok || resp.status < 500 ? "online" : "offline", responseTime: time };
          } catch {
            return { ...service, status: "offline", responseTime: null };
          }
        })
      );
      setStatuses(results);
    };
    checkServices();
    const interval = setInterval(checkServices, 60000);
    return () => clearInterval(interval);
  }, []);

  const allOnline = statuses.every((s) => s.status === "online");
  const checking = statuses.some((s) => s.status === "checking");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 min-w-[220px]"
      style={{
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${allOnline ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"}`,
        boxShadow: `0 4px 20px ${allOnline ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)"}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: allOnline ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${allOnline ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          {checking ? (
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
          ) : allOnline ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
        </div>
        <div>
          <div className="font-bold text-white text-sm">
            {checking ? "Checking Services..." : allOnline ? "All Systems Operational" : "Service Issues Detected"}
          </div>
          <div className="text-xs text-slate-500">
            {statuses.filter((s) => s.status === "online").length}/{statuses.length} services online
          </div>
        </div>
      </div>

      {/* Service List */}
      <div className="space-y-2">
        {statuses.map((service, idx) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-300">{service.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {service.responseTime && (
                  <span className="text-[10px] text-slate-600">{service.responseTime}ms</span>
                )}
                <motion.div
                  animate={
                    service.status === "online"
                      ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }
                      : service.status === "checking"
                      ? { rotate: 360 }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background:
                      service.status === "online"
                        ? "#34d399"
                        : service.status === "checking"
                        ? "#fbbf24"
                        : "#f87171",
                    boxShadow: `0 0 8px ${
                      service.status === "online"
                        ? "rgba(52,211,153,0.5)"
                        : service.status === "checking"
                        ? "rgba(251,191,36,0.5)"
                        : "rgba(248,113,113,0.5)"
                    }`,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StatusCard;
