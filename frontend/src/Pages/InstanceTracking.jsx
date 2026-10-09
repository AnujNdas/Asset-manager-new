// src/Pages/InstanceTracking.jsx

import React, { useEffect, useState, useRef } from "react";
import "../Page_styles/TestInstanceTrackingFile.css";
import "../Page_styles/Employee.css";
import InstanceCard from "../Components/InstanceCard";
import ReassignModal from "../Components/ReassignModal";
import HistoryModal from "../Components/HistoryModal";
import UpgradeModal from "../Components/UpgradeModal";
import QRScanner from "../Components/QRScanner";
import {
  getTrackedInstances,
  getInstanceHistory,
} from "../Services/ApiServices";
import Loader from "../Components/Loader";
import ThemeSwal from "../utils/swalTheme";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTour } from "../Context/TourContext";
const InstanceTracking = () => {
  const { registerTour } = useTour();
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
  const [searchTerm, setSearchTerm] = useState("");
  // const driverObj = driver({
  //   showProgress: true,
  //   animate: true,
  //   smoothScroll: true,
  //   allowClose: true,

  //   overlayColor: "rgba(0,0,0,0.75)",

  //   popoverClass: "custom-driver-popover",

  //   steps: [
  //     {
  //       element: ".tour-filter",
  //       popover: {
  //         title: "Filter Instances",
  //         description: "You can select the type of the instances you want to track.",
  //         side: "bottom",
  //         align: "start",
  //       },
  //     },

  //     {
  //       element: ".tour-scan",
  //       popover: {
  //         title: "Scan and view instances",
  //         description:
  //           "Click and scan the instance Qr from the inventory.",
  //         side: "bottom",
  //       },
  //     },
  //   ],
  // });

//   useEffect(() => {
//     const seen = localStorage.getItem("inventoryTourSeen");
  
//     if (!seen) {
//       setTimeout(() => {
//         driverObj.drive();
  
//         localStorage.setItem(
//           "inventoryTourSeen",
//           "true"
//         );
//       }, 1000);
//     }
//   }, []);
//   useEffect(() => {
//   registerTour(driverObj);
// }, []);
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
      console.log(
        "Checking match:",
        data.find((i) => i._id === highlightId),
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
if (!instance || !instance.assignment?._id) {
  return ThemeSwal.fire(
    "Error",
    "This asset is not currently assigned",
    "error"
  );
}

    setSelectedInstance(instance);
    setShowReassign(true);
  };
  const handleUpgrade = (instance) => {
    console.log("Upgrade clicked for instance:", instance);
    if (!instance) {
      return ThemeSwal.fire("Error", "Invalid instance selected", "error");
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
        lifecycle: res.data,
      });

      setShowHistory(true);
    } catch (err) {
      console.error(err);

      ThemeSwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load history",
      });
    }
  };
const filteredInstances = instances.filter((inst) => {
  const assetName = String(
    inst?.deviceName ||
    inst?.assetName ||
    inst?.hardware?.deviceName ||
    inst?.software?.softwareName ||
    ""
  );

  return assetName
    .toLowerCase()
    .includes(String(searchTerm || "").toLowerCase());
});
  if (loading) return <Loader />;

  return (
//     <div className="instance-page">
//       {/* 🔽 FILTER BAR */}
//       <div className="filter-bar tour-filter">
//         <div className="search-box">
//     <input
//       type="text"
//       placeholder="Search by asset name..."
//       value={searchTerm}
//       onChange={(e) => setSearchTerm(e.target.value)}
//     />
//   </div>

//         <div className="right-actions">
//         <select value={filterType} onChange={handleFilterChange}>
//           <option value="all">All Assets</option>
//           <option value="hardware">Hardware</option>
//           <option value="software">Software</option>
//         </select>
//           <button className="scan-btn tour-scan" onClick={() => setShowScanner(true)}>
//             Scan QR
//           </button>

//           <span className="count">{instances.length} items</span>
//         </div>
//       </div>

//       {/* 🔽 LIST */}
//       <div className="instance-list">
//         {filteredInstances.map((inst) => (
//           <div
//             key={inst._id}
//             ref={(el) => (instanceRefs.current[inst._id] = el)}
//             className={highlightedId === inst._id ? "highlight-card" : ""}
//           >
//             <InstanceCard
//               instance={inst}
//               onReassign={handleReassign}
//               onHistory={handleHistory}
//               onUpgrade={handleUpgrade}
//             />
//           </div>
//         ))}
//       </div>
        
//       {/* 🔽 MODALS */}
//       {showReassign && (
// <ReassignModal
//   assignment={selectedInstance?.assignment}
//   onClose={() => setShowReassign(false)}
//   refresh={() => fetchInstances(filterType)}
// />
//       )}

//       {showHistory && (
//         <HistoryModal
//           instance={selectedInstance}
//           onClose={() => setShowHistory(false)}
//         />
//       )}
//       {showUpgrade && (
//         <UpgradeModal
//           instance={selectedInstance}
//           onClose={() => setShowUpgrade(false)}
//           refresh={() => fetchInstances(filterType)}
//         />
//       )}
//       {showScanner && (
//         <QRScanner
//           onClose={() => setShowScanner(false)}
//           onScanSuccess={(instanceId) => {
//             console.log("Scanned instance:", instanceId);

//             // ✅ pass ID into fetch
//             fetchInstances("all", instanceId);
//           }}
//         />
//       )}
//     </div>

<div className="instance-page">

  {/* =====================================================
      PAGE HEADER
  ===================================================== */}
  <div className="tracking-page-header">

    <div className="tracking-heading">
      <span className="tracking-eyebrow">
        ASSET MANAGEMENT
      </span>

      <h1>Instance Tracking</h1>

      <p>
        Track asset instances, assignments, lifecycle history
        and upgrades.
      </p>
    </div>

    <div className="tracking-header-count">
      <span>{filteredInstances.length}</span>
      <small>
        {filteredInstances.length === 1 ? "Instance" : "Instances"}
      </small>
    </div>

  </div>


  {/* =====================================================
      FILTER / TOOLBAR
  ===================================================== */}
  <div className="tracking-toolbar tour-filter">

    {/* SEARCH */}
    <div className="tracking-search">

      <span className="tracking-search-icon">
        ⌕
      </span>

      <input
        type="text"
        placeholder="Search by asset name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {searchTerm && (
        <button
          type="button"
          className="tracking-search-clear"
          onClick={() => setSearchTerm("")}
          aria-label="Clear search"
        >
          ×
        </button>
      )}

    </div>


    {/* RIGHT ACTIONS */}
    <div className="tracking-toolbar-actions">

      <div className="tracking-filter-group">
        <span>TYPE</span>

        <select
          value={filterType}
          onChange={handleFilterChange}
        >
          <option value="all">All Assets</option>
          <option value="hardware">Hardware</option>
          <option value="software">Software</option>
        </select>
      </div>


      <button
        type="button"
        className="tracking-scan-btn tour-scan"
        onClick={() => setShowScanner(true)}
      >
        <span className="tracking-scan-icon">
          ⌗
        </span>

        <span>Scan QR</span>
      </button>

    </div>

  </div>


  {/* =====================================================
      RESULT INFO
  ===================================================== */}
  <div className="tracking-results-bar">

    <div>
      <span className="tracking-results-dot" />

      <span style={{ color : "#DFD0B8"}}>
        Showing
        <strong style={{ color : "#DFD0B8"}}> {filteredInstances.length} </strong>
        {filteredInstances.length === 1 ? "instance" : "instances"}
      </span>
    </div>

    {(filterType !== "all" || searchTerm) && (
      <button
        type="button"
        className="tracking-reset-btn"
        onClick={() => {
          setSearchTerm("");

          if (filterType !== "all") {
            setFilterType("all");
            fetchInstances("all");
          }
        }}
      >
        Reset filters
      </button>
    )}

  </div>


  {/* =====================================================
      INSTANCE LIST
  ===================================================== */}
  {filteredInstances.length > 0 ? (

    <div className="instance-list">

      {filteredInstances.map((inst) => (

        <div
          key={inst._id}
          ref={(el) =>
            (instanceRefs.current[inst._id] = el)
          }
          className={`tracking-instance-wrapper ${
            highlightedId === inst._id
              ? "highlight-card"
              : ""
          }`}
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

  ) : (

    /* =====================================================
        EMPTY STATE
    ===================================================== */
    <div className="tracking-empty-state">

      <div className="tracking-empty-icon">
        ⌕
      </div>

      <h3>No Instances Found</h3>

      <p>
        {searchTerm || filterType !== "all"
          ? "No asset instances match the current search or filter."
          : "No asset instances are currently available."}
      </p>

      {(searchTerm || filterType !== "all") && (
        <button
          type="button"
          onClick={() => {
            setSearchTerm("");

            if (filterType !== "all") {
              setFilterType("all");
              fetchInstances("all");
            }
          }}
        >
          Clear Filters
        </button>
      )}

    </div>

  )}


  {/* =====================================================
      MODALS
  ===================================================== */}

  {showReassign && (
    <ReassignModal
      assignment={selectedInstance?.assignment}
      onClose={() => setShowReassign(false)}
      refresh={() => fetchInstances(filterType)}
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
        console.log(
          "Scanned instance:",
          instanceId
        );

        fetchInstances("all", instanceId);
      }}
    />
  )}

</div>
  );
};

export default InstanceTracking;
