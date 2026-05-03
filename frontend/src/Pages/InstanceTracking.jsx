// src/Pages/InstanceTracking.jsx

import React, { useEffect, useState , useRef } from "react";
import "../Page_styles/InstanceTracking.css";
import "../Page_styles/Employee.css"
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
  if (!highlightedId) return;

  const el = instanceRefs.current[highlightedId];

  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}, [highlightedId, instances]); // 👈 important
const fetchInstances = async (type = filterType, highlightId = null) => {
  try {
    setLoading(true);

    const res = await getTrackedInstances({ type });
    const data = res.data || [];

    setInstances(data);
    console.log("Checking match:",
      data.find(i => i._id === highlightId)
    );
    // ✅ highlight AFTER state update
    if (highlightId) {
      setTimeout(() => {
        setHighlightedId(highlightId);
      }, 100); // small delay just for DOM render
    }

  } catch (err) {
    console.error(err);
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

  // ✅ pass ID into fetch
  fetchInstances("all", instanceId);
}}
/>
)}
    </div>
  );
};

export default InstanceTracking;