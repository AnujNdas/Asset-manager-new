// src/Pages/InstanceTracking.jsx

import React, { useEffect, useState } from "react";
import "../Page_styles/InstanceTracking.css";

import InstanceCard from "../Components/InstanceCard";
import ReassignModal from "../Components/ReassignModal";
import HistoryModal from "../Components/HistoryModal";
import UpgradeModal from "../Components/UpgradeModal";
import {
  getTrackedInstances,
  getInstanceHistory
} from "../Services/ApiServices";
import Loader from "../Components/Loader";
const InstanceTracking = () => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
    const [showUpgrade, setShowUpgrade] = useState(false);
  const [filterType, setFilterType] = useState("all");

  const [selectedInstance, setSelectedInstance] = useState(null);
  const [showReassign, setShowReassign] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
    const fetchInstances = async (type = filterType) => {
    try {
        setLoading(true);

        const res = await getTrackedInstances({
        type
        });

        setInstances(res.data);
        console.log(res)

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
    setSelectedInstance(instance);
    setShowReassign(true);
  };
  const handleUpgrade = (instance) => {
  setSelectedInstance(instance);
  setShowUpgrade(true);
};
const handleHistory = async (instance) => {
  try {
    const res = await getInstanceHistory(instance._id);

    setSelectedInstance({
      ...instance,
      lifecycle: res.data // 🔥 real backend history
    });

    setShowHistory(true);
  } catch (err) {
    console.error(err);
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

        <span className="count">
          {instances.length} items
        </span>
      </div>

      {/* 🔽 LIST */}
      <div className="instance-list">
{instances.map((inst) => (
<InstanceCard
  key={inst._id}
  instance={inst}
  onReassign={handleReassign}
  onHistory={handleHistory}
  onUpgrade={handleUpgrade}
/>
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
    </div>
  );
};

export default InstanceTracking;