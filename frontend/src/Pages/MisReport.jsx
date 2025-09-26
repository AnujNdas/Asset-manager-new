import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import "../Page_styles/MisReport.css";
import {
  getStatuses,
  getUnits,
  getLocations,
  getCategories,
  getSoftwareAssets,
  getCoreLicenses,
} from "../Services/ApiServices";

const MisReport = () => {
  const [activeTab, setActiveTab] = useState("hardware");

  // Shared filters
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");

  // Data
  const [hardware, setHardware] = useState([]);
  const [software, setSoftware] = useState([]);
  const [licenses, setLicenses] = useState([]);

  // Lookup Data
  const [statuses, setStatuses] = useState([]);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    (async () => {
      try {
        const [s, u, l, c, sw, lic] = await Promise.all([
          getStatuses(),
          getUnits(),
          getLocations(),
          getCategories(),
          getSoftwareAssets(),
          getCoreLicenses()
        ]);

        setStatuses(s);
        setUnits(u);
        setLocations(l);
        setCategories(c);
        setSoftware(sw?.data || sw);   // depending on your API response
        setLicenses(lic?.data || lic);
      } catch (err) {
        console.error("Error fetching filters/data:", err);
      }
    })();
    const fetchAssets = async () => {
        try {
          const res = await fetch("https://asset-manager-new.onrender.com/api/assets");
          console.log(res)
          if (!res.ok) throw new Error("Failed to fetch hardware assets");
          const data = await res.json();
          setHardware(data);
        } catch (err) {
          Swal.fire("Error", err.message, "error");
        }
    }
    fetchAssets();
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  // Filter logic for each tab
  const filteredHardware = hardware.filter(a =>
    (selectedLocation ? a.locationName === selectedLocation : true) &&
    (selectedUnit ? a.associateUnit === selectedUnit : true) &&
    (selectedStatus ? a.assetStatus === selectedStatus : true) &&
    (startDate ? formatDate(a.DOP) >= startDate : true)
  );

  const filteredSoftware = software.filter(a =>
    (selectedLocation ? a.locationName === selectedLocation : true) &&
    (selectedCategory ? a.category === selectedCategory : true) &&
    (selectedStatus ? a.complianceStatus === selectedStatus : true) &&
    (startDate ? formatDate(a.purchaseDate) >= startDate : true)
  );

  const filteredLicenses = licenses.filter(a =>
    (selectedStatus ? a.status === selectedStatus : true) &&
    (startDate ? formatDate(a.issueDate) >= startDate : true)
  );

  // Pagination slice
  const paginate = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const currentData =
    activeTab === "hardware"
      ? filteredHardware
      : activeTab === "software"
      ? filteredSoftware
      : filteredLicenses;

  const totalPages = Math.ceil(currentData.length / itemsPerPage);

  // Export CSV/Excel
  const exportData = () => {
    const ws = XLSX.utils.json_to_sheet(currentData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab);
    XLSX.writeFile(wb, `${activeTab}.xlsx`);
  };

  return (
    <div className="mis-content">
        <h1 className="classify_heading">Asset Management Report</h1>
      <header>
        <div className="navs">
          <button onClick={() => setActiveTab("hardware")}>Hardware</button>
          <button onClick={() => setActiveTab("software")}>Software</button>
          <button onClick={() => setActiveTab("licenses")}>Core Licenses</button>
        </div>
      </header>

      {/* Filters */}
      <div className="filters">
        {activeTab === "hardware" && (
          <>
            <select onChange={e => setSelectedLocation(e.target.value)}>
              <option value="">All Locations</option>
              {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
            <select onChange={e => setSelectedUnit(e.target.value)}>
              <option value="">All Units</option>
              {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <select onChange={e => setSelectedStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <input type="date" onChange={e => setStartDate(e.target.value)} />
          </>
        )}

        {activeTab === "software" && (
          <>
            <select onChange={e => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select onChange={e => setSelectedLocation(e.target.value)}>
              <option value="">All Locations</option>
              {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
            <select onChange={e => setSelectedStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <input type="date" onChange={e => setStartDate(e.target.value)} />
          </>
        )}

        {activeTab === "licenses" && (
          <>
            <select onChange={e => setSelectedStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <input type="date" onChange={e => setStartDate(e.target.value)} />
          </>
        )}
      </div>

      {/* Table */}
      <table className="mis-table">
        <thead>
          <tr>
            {activeTab === "hardware" && (
              <>
                <th>Name</th><th>Spec</th><th>Unit</th><th>Status</th><th>Location</th>
              </>
            )}
            {activeTab === "software" && (
              <>
                <th>Name</th><th>Version</th><th>Publisher</th><th>Status</th><th>Category</th>
              </>
            )}
            {activeTab === "licenses" && (
              <>
                <th>Document</th><th>License No</th><th>Holder</th><th>Status</th><th>Expiry</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {paginate(currentData).map((row, i) => (
            <tr key={i}>
              {activeTab === "hardware" && (
                <>
                  <td>{row.assetName}</td>
                  <td>{row.assetSpecification}</td>
                  <td>{units.find(u => u._id === row.associateUnit)?.name}</td>
                  <td>{statuses.find(s => s._id === row.assetStatus)?.name}</td>
                  <td>{locations.find(l => l._id === row.locationName)?.name}</td>
                </>
              )}
              {activeTab === "software" && (
                <>
                  <td>{row.name}</td>
                  <td>{row.version}</td>
                  <td>{row.publisher}</td>
                  <td>{statuses.find(s => s._id === row.complianceStatus)?.name}</td>
                  <td>{categories.find(c => c._id === row.category)?.name}</td>
                </>
              )}
              {activeTab === "licenses" && (
                <>
                  <td>{row.documentType}</td>
                  <td>{row.licenseNumber}</td>
                  <td>{row.licenseHolder}</td>
                  <td>{statuses.find(s => s._id === row.status)?.name}</td>
                  <td>{formatDate(row.expiryDate)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>Prev</button>
        {[...Array(totalPages).keys()].map(n => (
          <button
            key={n}
            className={currentPage === n + 1 ? "active" : ""}
            onClick={() => setCurrentPage(n + 1)}
          >
            {n + 1}
          </button>
        ))}
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>Next</button>
      </div>

      <button onClick={exportData}>Export {activeTab} Excel</button>
    </div>
  );
};

export default MisReport;
