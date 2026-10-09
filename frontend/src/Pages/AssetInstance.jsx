  // src/pages/InstanceAssets.jsx

  import React, { useEffect, useState , useRef } from "react";
  import axios from "axios";
  import "../Page_styles/TestAssetInstanceFile.css";
  import { getPendingInstances } from "../Services/ApiServices";
  import { useNavigate } from "react-router-dom";
  import Loader from "../Components/Loader";
  import { useLocation } from "react-router-dom";
import Pagination from "../Components/Pagination";
    import { driver } from "driver.js";
import "driver.js/dist/driver.css"; 
import { useTour } from "../Context/TourContext";
  const InstanceAssets = () => {
    const { registerTour } = useTour();
    const [assets, setAssets] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const getAssetsPerPage = () => {
  const width = window.innerWidth;

  if (width >= 1800) return 15;
  if (width >= 1440) return 12;
  if (width >= 1200) return 9;
  if (width >= 992) return 8;
  if (width >= 768) return 6;
  if (width >= 576) return 4;

  return 2;
};

const [assetsPerPage, setAssetsPerPage] = useState(
  getAssetsPerPage()
);
    const location = useLocation();
  const selectedAssetId = location.state?.selectedAssetId;
    useEffect(() => {
      fetchAssets();
    }, [filter]);
    useEffect(() => {
  setCurrentPage(1);
}, [filter]);
useEffect(() => {
  const maxPage = Math.ceil(assets.length / assetsPerPage);
  if (currentPage > maxPage) {
    setCurrentPage(maxPage || 1);
  }
}, [assets]);

useEffect(() => {
  const handleResize = () => {
    setAssetsPerPage(getAssetsPerPage());
  };

  window.addEventListener("resize", handleResize);

  return () =>
    window.removeEventListener("resize", handleResize);
}, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await getPendingInstances(filter);
      setAssets(res);

      // 🎯 Set selected asset if passed
      if (selectedAssetId) {
        setSelectedId(selectedAssetId);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const indexOfLast = currentPage * assetsPerPage;
const sortedAssets = [...assets].sort(
  (a, b) =>
    new Date(b.createdAt || b.created_at || 0) -
    new Date(a.createdAt || a.created_at || 0)
);

const currentAssets = sortedAssets.slice(
  indexOfLast - assetsPerPage,
  indexOfLast
);


    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
  
      overlayColor: "rgba(0,0,0,0.75)",
  
      popoverClass: "custom-driver-popover",
  
      steps: [
                {
          element: ".tour-filter",
          popover: {
            title: "Filter",
            description:
              "Select which type of Asset you want to create.",
            side: "bottom",
          },
        },
        {
          element: ".tour-card",
          popover: {
            title: "Asset Information",
            description: "Contains Main asset Information.",
            side: "bottom",
            align: "start",
          },
        },
  
        {
          element: ".tour-progress",
          popover: {
            title: "Progress",
            description:
              "You can check how many instances can be created and already created.",
            side: "bottom",
          },
        },
        {
          element: ".tour-create",
          popover: {
            title: "Create Button",
            description:
              "Click this to Go to Create Instance Page.",
            side: "bottom",
          },
        },
      ],
    });
  
    useEffect(() => {
      const seen = localStorage.getItem("inventoryTourSeen");
    
      if (!seen) {
        setTimeout(() => {
          driverObj.drive();
    
          localStorage.setItem(
            "inventoryTourSeen",
            "true"
          );
        }, 1000);
      }
    }, []);
    useEffect(() => {
    registerTour(driverObj);
  }, []);

const totalPages = Math.ceil(
  sortedAssets.length / assetsPerPage
);
    if (loading) return <Loader / >;
    return (
      <div className="instance-page">
        {/* HEADER */}
<div className="instances-dashboard-header">

    <div className="instances-header-content">
      <span className="instances-page-eyebrow">
        INSTANCE MANAGEMENT
      </span>

      <h1>Instances Dashboard</h1>

      <p>
        Create and configure individual instances for
        your hardware and software assets.
      </p>
    </div>


    <div className="instances-header-actions">
      <select
        className="instances-filter"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="all">All Assets</option>
        <option value="hardware">Hardware</option>
        <option value="software">Software</option>
      </select>
    </div>

  </div>

        {/* CONTENT */}
        {loading ? (
          <p className="empty">Loading...</p>
        ) : assets.length === 0 ? (
          <p className="empty">No assets pending instance creation</p>
        ) : (
          <>
          <div className="instance-assets-grid">
{currentAssets.map((asset) => (
    <AssetCard
      key={asset._id}
      asset={asset}
      isSelected={asset._id === selectedId}
    />
  ))}
          </div>
                      <Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
</>
        )}

      </div>
    );
  };
const AssetCard = ({ asset, isSelected }) => {
      const { registerTour } = useTour();
  const navigate = useNavigate();
  const cardRef = useRef();
      const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
  
      overlayColor: "rgba(0,0,0,0.75)",
  
      popoverClass: "custom-driver-popover",
  
      steps: [
        {
          element: ".tour-card",
          popover: {
            title: "Asset Information",
            description: "Contains Main asset Information.",
            side: "bottom",
            align: "start",
          },
        },
  
        {
          element: ".tour-progress",
          popover: {
            title: "Progress",
            description:
              "You can check how many instances can be created and already created.",
            side: "bottom",
          },
        },
        {
          element: ".tour-create",
          popover: {
            title: "Create Button",
            description:
              "Click this to Go to Create Instance Page.",
            side: "bottom",
          },
        },
      ],
    });
  
    useEffect(() => {
      const seen = localStorage.getItem("inventoryTourSeen");
    
      if (!seen) {
        setTimeout(() => {
          driverObj.drive();
    
          localStorage.setItem(
            "inventoryTourSeen",
            "true"
          );
        }, 1000);
      }
    }, []);
    useEffect(() => {
    registerTour(driverObj);
  }, []);
  const progress =
    asset.assetQuantity > 0
      ? (asset.instanceCount / asset.assetQuantity) * 100
      : 0;

  const pendingInstances =
    asset.assetQuantity - asset.instanceCount;

  const isComplete = pendingInstances === 0;

  // ✅ Scroll when selected
  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isSelected]);

  return (
    // <div
    //   ref={cardRef}
    //   className={`asset-card ${isSelected ? "highlight" : ""} tour-card`}
    // >
    //   <div className="asset-card-header">
    //     <h3>{asset.assetName}</h3>
    //     <span className="asset-code">{asset.assetCode}</span>
    //   </div>

    //   <div className="asset-meta">
    //     <p>Category: {asset.assetCategory?.name || "-"}</p>
    //     <p>Quantity: {asset.assetQuantity}</p>
    //   </div>

    //   <div className="progress-section">
    //     <div className="progress-top">
    //       <span>Instances</span>
    //       <span>
    //         {asset.instanceCount}/{asset.assetQuantity}
    //       </span>
    //     </div>

    //     <div className="progress-bar tour-progress">
    //       <div
    //         className="progress-fill"
    //         style={{ width: `${progress}%` }}
    //       />
    //     </div>
    //   </div>

    //   <p className="pending">
    //     Pending: <strong>{pendingInstances}</strong>
    //   </p>

    //   <button
    //     className={`create-btn ${isComplete ? "disabled" : ""} tour-create`}
    //     disabled={isComplete}
    //     onClick={() => navigate(`/create-instances/${asset._id}`)}
    //   >
    //     {isComplete ? "Completed" : "Create Instances"}
    //   </button>
    // </div>

    <div
  ref={cardRef}
  className={`instance-setup-card ${
    isSelected ? "highlight" : ""
  } ${isComplete ? "completed" : ""} tour-card`}
>
  {/* =====================================================
      HEADER
  ===================================================== */}
  <div className="instance-setup-header">
    <div className="instance-setup-identity">
      <div className="instance-setup-icon">
        {isComplete ? "✓" : "A"}
      </div>

      <div className="instance-setup-title">
        <span className="instance-setup-eyebrow">
          ASSET INSTANCE SETUP
        </span>

        <h3 title={asset.assetName}>
          {asset.assetName}
        </h3>

        <span className="instance-setup-code">
          {asset.assetCode}
        </span>
      </div>
    </div>

    <span
      className={`instance-setup-status ${
        isComplete ? "complete" : "pending"
      }`}
    >
      <span className="instance-setup-status-dot"></span>

      {isComplete ? "Completed" : "Setup Required"}
    </span>
  </div>


  {/* =====================================================
      ASSET INFORMATION
  ===================================================== */}
  <div className="instance-setup-meta">
    <div className="instance-setup-meta-item">
      <span>Category</span>

      <strong title={asset.assetCategory?.name}>
        {asset.assetCategory?.name || "Not set"}
      </strong>
    </div>

    <div className="instance-setup-meta-divider"></div>

    <div className="instance-setup-meta-item">
      <span>Total Quantity</span>

      <strong>
        {asset.assetQuantity || 0}
      </strong>
    </div>
  </div>


  {/* =====================================================
      INSTANCE PROGRESS
  ===================================================== */}
  <div className="instance-setup-progress-section">

    <div className="instance-setup-progress-header">
      <div>
        <span className="instance-setup-progress-label">
          Instance Creation
        </span>

        <p>
          {isComplete
            ? "All required instances have been created."
            : `${pendingInstances} ${
                pendingInstances === 1
                  ? "instance"
                  : "instances"
              } remaining to create.`}
        </p>
      </div>

      <strong className="instance-setup-percentage">
        {Math.round(progress)}%
      </strong>
    </div>


    <div className="instance-setup-progress-bar tour-progress">
      <div
        className="instance-setup-progress-fill"
        style={{
          width: `${Math.min(Math.max(progress, 0), 100)}%`,
        }}
      />
    </div>


    <div className="instance-setup-progress-footer">
      <span>
        <strong>{asset.instanceCount || 0}</strong>
        {" "}created
      </span>

      <span>
        {asset.instanceCount || 0} / {asset.assetQuantity || 0}
      </span>
    </div>

  </div>


  {/* =====================================================
      INSTANCE SUMMARY
  ===================================================== */}
  <div className="instance-setup-summary">

    <div className="instance-summary-item">
      <span className="summary-label">
        Created
      </span>

      <strong>
        {asset.instanceCount || 0}
      </strong>
    </div>


    <div className="instance-summary-item">
      <span className="summary-label">
        Pending
      </span>

      <strong
        className={
          pendingInstances > 0
            ? "pending-value"
            : ""
        }
      >
        {pendingInstances}
      </strong>
    </div>


    <div className="instance-summary-item">
      <span className="summary-label">
        Required
      </span>

      <strong>
        {asset.assetQuantity || 0}
      </strong>
    </div>

  </div>


  {/* =====================================================
      ACTION
  ===================================================== */}
  <div className="instance-setup-footer">

    <div className="instance-setup-footer-info">
      <span
        className={`footer-state-dot ${
          isComplete ? "complete" : ""
        }`}
      ></span>

      <span>
        {isComplete
          ? "Instance setup is complete"
          : "Instances still need configuration"}
      </span>
    </div>


    <button
      type="button"
      className={`instance-create-btn ${
        isComplete ? "disabled" : ""
      } tour-create`}
      disabled={isComplete}
      onClick={() =>
        navigate(`/create-instances/${asset._id}`)
      }
    >
      {isComplete ? (
        <>
          <span className="instance-btn-icon">✓</span>
          Completed
        </>
      ) : (
        <>
          Create Instances
          <span className="instance-btn-arrow">→</span>
        </>
      )}
    </button>

  </div>
</div>
  );
};
  export default InstanceAssets;