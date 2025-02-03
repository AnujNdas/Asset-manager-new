import React, { useState, useEffect } from 'react';
import "../Page_styles/MisReport.css";
import * as XLSX from 'xlsx';  // Import XLSX for Excel export

const MisReport = () => {
    const [startDate, setStartDate] = useState('');
    const [statuses, setStatuses] = useState([]);
    const [units, setUnits] = useState([]);
    const [assets, setAssets] = useState([]);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Fetch data (assets, categories, statuses, etc.)
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const response = await fetch('https://asset-manager-new.onrender.com/api/assets');
                if (!response.ok) {
                    throw new Error('Failed to fetch assets');
                }
                const data = await response.json();
                setAssets(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchCategoriesAndStatuses = async () => {
            try {
                const statusesResponse = await fetch('https://asset-manager-new.onrender.com/api/status');
                const locationsResponse = await fetch('https://asset-manager-new.onrender.com/api/location');
                const unitsResponse = await fetch('https://asset-manager-new.onrender.com/api/unit');
                const categoriesResponse = await fetch('https://asset-manager-new.onrender.com/api/category');

                if (!statusesResponse.ok || !locationsResponse.ok || !unitsResponse.ok || !categoriesResponse.ok) {
                    throw new Error('Failed to fetch required data');
                }

                const statusesData = await statusesResponse.json();
                const locationsData = await locationsResponse.json();
                const unitsData = await unitsResponse.json();
                const categoriesData = await categoriesResponse.json();

                setStatuses(statusesData);
                setLocations(locationsData);
                setUnits(unitsData);
                setCategories(categoriesData);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchAssets();
        fetchCategoriesAndStatuses();
    }, []);

    // Filter assets based on the selected filters
    const filteredAssets = () => {
        return assets.filter(asset => {
            const matchesLocation = selectedLocation ? asset.locationName === selectedLocation : true;
            const matchesUnit = selectedUnit ? asset.associateUnit === selectedUnit : true;
            const matchesStatus = selectedStatus ? asset.assetStatus === selectedStatus : true;

            const purchaseDateFormatted = formatDate(asset.DOP);
            const startDateFormatted = startDate ? formatDate(startDate) : '';

            const matchesStartDate = startDateFormatted ? purchaseDateFormatted >= startDateFormatted : true;

            return matchesLocation && matchesUnit && matchesStatus && matchesStartDate;
        });
    };

    const formatDate = (date) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return ''; // Return empty string for invalid date
        d.setHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0]; // yyyy-mm-dd
    };

    // CSV Download Function
    const downloadCSV = () => {
        const filteredData = filteredAssets();

        const csvRows = [];
        const headers = ['Asset Name', 'Asset Specification', 'Unit', 'Status', 'Location', 'Category'];
        csvRows.push(headers.join(',')); // Add header row

        filteredData.forEach(asset => {
            const unit = units.find(u => u._id === asset.associateUnit)?.name || 'No unit';
            const status = statuses.find(s => s._id === asset.assetStatus)?.name || 'No status';
            const location = locations.find(l => l._id === asset.locationName)?.name || 'No location';
            const category = categories.find(c => c._id === asset.assetCategory)?.name || 'No category';

            const row = [
                asset.assetName,
                asset.assetSpecification,
                unit,
                status,
                location,
                category
            ];

            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'assets.csv';
        link.click();
    };

    // Excel Download Function
    const downloadExcel = () => {
        const filteredData = filteredAssets().map(asset => {
            return {
                'Asset Name': asset.assetName,
                'Asset-Code': asset.assetCode,
                'Asset Specification': asset.assetSpecification,
                'Unit': units.find(u => u._id === asset.associateUnit)?.name || 'No unit',
                'Status': statuses.find(s => s._id === asset.assetStatus)?.name || 'No status',
                'Location': locations.find(l => l._id === asset.locationName)?.name || 'No location',
                'Category': categories.find(c => c._id === asset.assetCategory)?.name || 'No category' , // Ensure category is included here
                'Lifetime': asset.assetLifetime,
                'D_O_P': formatDate(asset.DOP),
                'D_O_E': formatDate(asset.DOE),
                'Purchased From': asset.purchaseFrom,
                'P-M-D': asset.PMD,
                'Barcode-number': asset.barcodeNumber,
            };
        });

        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Assets');
        XLSX.writeFile(wb, 'assets.xlsx');
    };

    return (
        <div className="App">
            <div className="mis-content">
                <header className="header">
                    <h1>Asset Management Report</h1>
                    <div className="mis-button">
                        <button className="download-csv" onClick={downloadCSV}>Download CSV</button>
                        <button className="download-excel" onClick={downloadExcel}>Download Excel</button>
                    </div>
                </header>

                {/* Filters Section */}
                <aside className="filters">
                    <div className="mis-form">
                        <h3>Filters</h3>
                        <form className="mis-form-menu">
                            {/* Location Dropdown for Filtering */}
                            <label>Location:</label>
                            <select name="location" onChange={e => setSelectedLocation(e.target.value)}>
                                <option value="">All Locations</option>
                                {locations.map(location => (
                                    <option key={location._id} value={location._id}>{location.name}</option>
                                ))}
                            </select>

                            {/* Unit Dropdown for Filtering */}
                            <label>Unit:</label>
                            <select name="unit" onChange={e => setSelectedUnit(e.target.value)}>
                                <option value="">All Units</option>
                                {units.map(unit => (
                                    <option key={unit._id} value={unit._id}>{unit.name}</option>
                                ))}
                            </select>

                            {/* Status Dropdown for Filtering */}
                            <label>Status:</label>
                            <select name="status" onChange={e => setSelectedStatus(e.target.value)}>
                                <option value="">All Statuses</option>
                                {statuses.map(status => (
                                    <option key={status._id} value={status._id}>{status.name}</option>
                                ))}
                            </select>

                            {/* Date of Purchase Filter */}
                            <label>Start Date:</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </form>
                    </div>

                    <section className="asset-list">
                        <div className="heading">Asset List</div>
                        <table className="mis-table">
                            <thead>
                                <tr>
                                    <th>Asset Name</th>
                                    <th>Asset Specification</th>
                                    <th>Units</th>
                                    <th>Status</th>
                                    <th>Location</th>
                                    <th>Category</th>
                                    <th>D_O_P</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6">Loading...</td>
                                    </tr>
                                ) : (
                                    filteredAssets().length === 0 ? (
                                        <tr>
                                            <td colSpan="6">No assets found for the selected filters</td>
                                        </tr>
                                    ) : (
                                        filteredAssets().map(asset => (
                                            <tr key={asset._id}>
                                                <td>{asset.assetName}</td>
                                                <td>{asset.assetSpecification}</td>
                                                <td>{units.find(u => u._id === asset.associateUnit)?.name || 'No unit'}</td>
                                                <td>{statuses.find(s => s._id === asset.assetStatus)?.name || 'No status'}</td>
                                                <td>{locations.find(l => l._id === asset.locationName)?.name || 'No location'}</td>
                                                <td>{categories.find(c => c._id === asset.assetCategory)?.name || 'No category'}</td>
                                                <td>{formatDate(asset.DOP)}</td>
                                            </tr>
                                        ))
                                    )
                                )}
                            </tbody>
                        </table>
                    </section>
                </aside>

                <footer className="footer">
                    <p>&copy; 2025 AssetManager. All Rights Reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default MisReport;
