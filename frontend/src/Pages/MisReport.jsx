import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import "../Page_styles/MisReport.css";
import Pagination from "../Components/Pagination";
import Loader from "../Components/Loader";
import CurrencyFilter from "../Components/CurrencyFilter";
import { useCurrency } from "../Context/CurrencyContext";
import { convertFromBase , CURRENCY_SYMBOLS } from "../utils/currency";
import {
  getStatuses,
  getUnits,
  getLocations,
  getCategories,
  getSoftwareAssets,
  getCoreLicenses,
  getHardwareAssets,
} from "../Services/ApiServices";

const MisReport = () => {
  const { currency } = useCurrency();
  const [activeTab, setActiveTab] = useState("hardware");

  // Shared filters
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);
  
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
      const [s, u, l, c, sw, ha, lic] = await Promise.all([
        getStatuses(),
        getUnits(),
        getLocations(),
        getCategories(),
        getSoftwareAssets(),
        getHardwareAssets(),
        getCoreLicenses(),
      ]);

      setStatuses(s);
      setUnits(u);
      setLocations(Array.isArray(l?.data) ? l.data : []);
      setCategories(c);

      setSoftware(sw?.data || sw);
      setHardware(ha?.data || ha);
      setLicenses(lic?.data || lic);

      setApiDone(true);
      setTimeout(() => setLoading(false), 400);
    } catch (err) {
      console.error("Error fetching filters/data:", err);
      setLoading(false);
    }
  })();
}, []);


  // Reset Page When Filter or Tab Changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedLocation, selectedUnit, selectedStatus, selectedCategory, startDate]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  // -------- Hardware Filter Logic -------- //
  const filteredHardware = hardware.filter((a) =>
    (selectedLocation ? a.locationName === selectedLocation : true) &&
    (selectedUnit ? a.associateUnit === selectedUnit : true) &&
    (selectedStatus ? a.assetStatus === selectedStatus : true) &&
    (startDate ? formatDate(a.DOP) >= startDate : true)
  );

  // -------- Software Filter Logic -------- //
  const filteredSoftware = software.filter((a) =>
    (selectedLocation ? a.locationName === selectedLocation : true) &&
    (selectedCategory ? a.category === selectedCategory : true) &&
    (selectedStatus ? a.complianceStatus === selectedStatus : true) &&
    (startDate ? formatDate(a.purchaseDate) >= startDate : true)
  );

  const currentData = activeTab === "hardware" ? filteredHardware : filteredSoftware;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);

  const paginate = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const exportData = () => {
    const ws = XLSX.utils.json_to_sheet(currentData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab);
    XLSX.writeFile(wb, `${activeTab}_report.xlsx`);
  };
  if (loading) {
  return (
      <Loader type="mis" apiDone={apiDone} />
  );
}
const getInStock = (asset) =>
  Number(asset.assetQuantity || 0) - Number(asset.inUse || 0);

  return (
    <div className="mis-content">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 className="classify_heading">Asset Management Report</h2>
        <button onClick={exportData} className="misbutton">
  Export {activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : ''} Excel
</button>

      </div>

      {/* Tabs */}
      <header>
        <div className="navs">
          <button
            className={activeTab === "hardware" ? "active-tab" : ""}
            onClick={() => setActiveTab("hardware")}
          >
            Hardware
          </button>

          <button
            className={activeTab === "software" ? "active-tab" : ""}
            onClick={() => setActiveTab("software")}
          >
            Software
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="filters">
        {activeTab === "hardware" && (
          <>
            <select onChange={(e) => setSelectedLocation(e.target.value)}>
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l._id} value={l._id}>{l.name}</option>
              ))}
            </select>

            <select onChange={(e) => setSelectedUnit(e.target.value)}>
              <option value="">All Units</option>
              {units.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>

            <select onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {statuses.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            <input type="date" onChange={(e) => setStartDate(e.target.value)} />
          </>
        )}

        {activeTab === "software" && (
          <>
            <select onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            <select onChange={(e) => setSelectedLocation(e.target.value)}>
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l._id} value={l._id}>{l.name}</option>
              ))}
            </select>

            <select onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {statuses.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            <input type="date" onChange={(e) => setStartDate(e.target.value)} />
          </>
        )}
      </div>

      {/* TABLE */}
      <table className="mis-table">
        <thead>
          <tr>
            {activeTab === "hardware" && (
              <>
                <th>Name</th>
                <th>Spec</th>
                <th>Unit</th>
                {/* <th>Status</th> */}
<th>In Use</th>
<th>In Stock</th>
                <th>Location</th>
                <th>Maintainence</th>
                <th>Total Cost</th>
              </>
            )}

            {activeTab === "software" && (
              <>
                <th>Name</th>
                <th>Version</th>
                <th>Publisher</th>
                <th>In Use</th>
                <th>In Stock</th>
                {/* <th>Status</th> */}
                <th>Category</th>
                <th>Expiry</th>
                <th>Total Cost</th>
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
                  <td>{units.find((u) => u._id === row.associateUnit)?.name}</td>
                  {/* <td>{statuses.find((s) => s._id === row.assetStatus)?.name}</td> */}
                  <td>{row.inUse}</td>
                  <td>{getInStock(row)}</td>
                  <td>{locations.find((l) => l._id === row.locationName)?.name}</td>
                  <td>{row.DOE}</td>
                  <td>{CURRENCY_SYMBOLS[currency]}{" "}
                  {convertFromBase(
                    row.assetCost?.baseTotalAmount ?? 0,
                    currency
                  ).toLocaleString()}</td>
                </>
              )}

              {activeTab === "software" && (
                <>
                  <td>{row.assetName}</td>
                  <td>{row.assetSpecification}</td>
                  <td>{row.purchaseFrom}</td>
                <td>{row.inUse}</td>
                <td>{getInStock(row)}</td>
                  {/* <td>{statuses.find((s) => s._id === row.assetStatus)?.name}</td> */}
                  <td>{categories.find((c) => c._id === row.assetCategory)?.name}</td>
                <td>{row.DOE}</td>
                <td>{CURRENCY_SYMBOLS[currency]}{" "}
                  {convertFromBase(
                    (row.assetCost?.baseAmount ?? 0) * (row.assetQuantity ?? 0),
                    currency
                  ).toLocaleString()}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default MisReport;
