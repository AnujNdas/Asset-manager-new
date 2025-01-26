import React, { useState, useEffect } from 'react';
import "../Page_styles/MisReport.css";

const MisReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statuses, setStatuses] = useState([]);
    const [units, setUnits] = useState([]);
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch assets and populate categories, statuses, locations, and units
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/assets');
                if (!response.ok) {
                    throw new Error('Failed to fetch assets');
                }
                const data = await response.json();
                console.log('Assets:', data);
                setAssets(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
    
        const fetchCategoriesAndStatuses = async () => {
            try {
                const categoriesResponse = await fetch('http://localhost:5001/api/category');
                const statusesResponse = await fetch('http://localhost:5001/api/status');
                const locationsResponse = await fetch('http://localhost:5001/api/location');
                const unitsResponse = await fetch('http://localhost:5001/api/unit');
    
                if (
                    !categoriesResponse.ok ||
                    !statusesResponse.ok ||
                    !locationsResponse.ok ||
                    !unitsResponse.ok
                ) {
                    throw new Error('Failed to fetch required data');
                }
    
                const categoriesData = await categoriesResponse.json();
                const statusesData = await statusesResponse.json();
                const locationsData = await locationsResponse.json();
                const unitsData = await unitsResponse.json();
                
                console.log('Units:', unitsData);  // Add this log to check if units are fetched
    
                setCategories(categoriesData);
                setStatuses(statusesData);
                setLocations(locationsData);
                setUnits(unitsData);
            } catch (err) {
                setError(err.message);
            }
        };
    
        fetchAssets();
        fetchCategoriesAndStatuses();
        {console.log('Asset Unit ID:', assets.associateUnit)}

    }, []);
    

    const handleDateChange = (e) => {
        if (e.target.name === 'start-date') {
            setStartDate(e.target.value);
        } else {
            setEndDate(e.target.value);
        }
    };

    return (
        <div className="App">
            <div className="mis-content">
                <header className="header">
                    <h1>Asset Management Report</h1>
                    <div className="date-range">
                        <label>Date Range:</label>
                    </div>
                    <div className="mis-button">
                        <button className="download-csv">CSV</button>
                        <button className="download-excel">EXCEL</button>
                        <button className="download-pdf">PDF</button>
                    </div>
                </header>

                {/* Filters Section */}
                <aside className="filters">
                    <div className="mis-form">
                        <h3>Filters</h3>
                        <form className="mis-form-menu">
                            <label>Asset Category:</label>
                            <select name="assetCategory">
                                <option value="">All</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <label>Location:</label>
                            <select name="performance">
                                <option value="">All</option>
                                {locations.map((location) => (
                                    <option key={location._id} value={location.name}>
                                        {location.name}
                                    </option>
                                ))}
                            </select>

                            <label>Date of Purchase:</label>
                            <input type="date" name="start-date" value={startDate} onChange={handleDateChange} />
                            <label>Date of Expiry:</label>
                            <input type="date" name="end-date" value={endDate} onChange={handleDateChange} />
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
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4">Loading...</td>
                                    </tr>
                                ) : (
                                    assets.map((asset) => (
                                        <tr key={asset._id}>
                                            <td>{asset.assetName}</td>
                                            <td>{asset.assetSpecification}</td>
                                            <td>
                                            {units && asset.associateUnit ? (
                                                units.find(unit => unit._id === asset.associateUnit)
                                                ? units.find(unit => unit._id === asset.associateUnit).name
                                                : 'No unit'
                                            ) : (
                                                'Loading...'
                                            )}
                                            </td>
                                            <td>
                                                {statuses && asset.assetStatus ? (
                                                    statuses.find(status => status._id === asset.assetStatus)
                                                    ? statuses.find(status => status._id === asset.assetStatus).name
                                                    : 'No status'
                                                ) : (
                                                    'Loading...'
                                                )}
                                                </td>
                                                <td>
                                                {locations && asset.locationName ? (
                                                    locations.find(location => location._id === asset.locationName)
                                                    ? locations.find(location => location._id === asset.locationName).name
                                                    : 'No location'
                                                ) : (
                                                    'Loading...'
                                                )}
                                                </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </section>
                </aside>

                {/* Main Content Section */}
                <footer className="footer">
                    <p>&copy; 2025 AssetManager. All Rights Reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default MisReport;
