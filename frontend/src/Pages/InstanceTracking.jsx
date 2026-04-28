// src/Pages/InstanceTracking.jsx

import React, { useEffect, useState , useRef } from "react";
import "../Page_styles/InstanceTracking.css";
import InstanceCard from "../Components/InstanceCard";
import ReassignModal from "../Components/ReassignModal";
import HistoryModal from "../Components/HistoryModal";
import UpgradeModal from "../Components/UpgradeModal";
import QRScanner from "../Components/Qrscanner";
import {
  getTrackedInstances,
  getInstanceHistory
} from "../Services/ApiServices"; 
import Loader from "../Components/Loader";
import Swal from "sweetalert2";
const InstanceTracking = () => {
  const instanceRefs = useRef({});
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
    const [showUpgrade, setShowUpgrade] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [showScanner, setShowScanner] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [showReassign, setShowReassign] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
useEffect(() => {
  if (highlightedId) {
    const timer = setTimeout(() => {
      setHighlightedId(null);
    }, 4000);

    return () => clearTimeout(timer);
  }
}, [highlightedId]);
    const fetchInstances = async (type = filterType) => {
  try {
    setLoading(true);

    const res = await getTrackedInstances({ type });
    console.log("Fetched instances:", res.data);

    const data = res.data || [];

    setInstances(data);

    // 🟡 Optional: No data alert
    if (data.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "No instances found for selected filter",
        timer: 1500,
        showConfirmButton: false
      });
    }

  } catch (err) {
    console.error(err);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load instances"
    });

  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchInstances("all");
}, []);
    const handleFilterChange = (e) => {
  const value = e.target.value;
  setFilterType(value);
  fetchInstances(value);
};
const handleReassign = (instance) => {
  console.log("Reassign clicked for instance:", instance);
  if (!instance) {
    return Swal.fire("Error", "Invalid instance selected", "error");
  }

  setSelectedInstance(instance);
  setShowReassign(true);
};
const handleUpgrade = (instance) => {
  console.log("Upgrade clicked for instance:", instance);
  if (!instance) {
    return Swal.fire("Error", "Invalid instance selected", "error");
  }

  setSelectedInstance(instance);
  setShowUpgrade(true);
};
const handleHistory = async (instance) => {
  console.log("History clicked for instance:", instance);
  try {
    const res = await getInstanceHistory(instance._id);

    setSelectedInstance({
      ...instance,
      lifecycle: res.data
    });

    setShowHistory(true);

  } catch (err) {
    console.error(err);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load history"
    });
  }
};
  if (loading) return <Loader />;

  return (
    <div className="instance-page">

      {/* 🔽 FILTER BAR */}
<div className="filter-bar">
  <select value={filterType} onChange={handleFilterChange}>
    <option value="all">All Assets</option>
    <option value="hardware">Hardware</option>
    <option value="software">Software</option>
  </select>

  <div className="right-actions">
    <button
      className="btn btn-blue"
      onClick={() => setShowScanner(true)}
    >
      Scan QR
    </button>

    <span className="count">
      {instances.length} items
    </span>
  </div>
</div>

      {/* 🔽 LIST */}
<div className="instance-list">
  {instances.map((inst) => (
    <div
      key={inst._id}
      ref={(el) => (instanceRefs.current[inst._id] = el)}
      className={highlightedId === inst._id ? "highlight-card" : ""}
    >
      <InstanceCard
        instance={inst}
        onReassign={handleReassign}
        onHistory={handleHistory}
        onUpgrade={handleUpgrade}
      />
    </div>
  ))}
</div>

      {/* 🔽 MODALS */}
      {showReassign && (
        <ReassignModal
          instance={selectedInstance}
          onClose={() => setShowReassign(false)}
          refresh={fetchInstances}
        />
      )}

      {showHistory && (
        <HistoryModal
          instance={selectedInstance}
          onClose={() => setShowHistory(false)}
        />
      )}
      {showUpgrade && (
  <UpgradeModal
    instance={selectedInstance}
    onClose={() => setShowUpgrade(false)}
    refresh={() => fetchInstances(filterType)}
  />
)}
{showScanner && (
  <QRScanner
  onClose={() => setShowScanner(false)}
  onScanSuccess={(instanceId) => {
    console.log("Scanned instance:", instanceId);

    // ✅ ensure all instances are loaded
    fetchInstances("all");

    // ✅ small delay to wait for state update
    setTimeout(() => {
      setHighlightedId(instanceId);
    }, 300);
  }}
/>
)}
    </div>
  );
};

export default InstanceTracking;