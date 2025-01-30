import React, { useState, useEffect } from 'react';
import "../Page_styles/MisReport.css";

const MisReport = () => {
    const [startDate, setStartDate] = useState('');
    const [statuses, setStatuses] = useState([]);
    const [units, setUnits] = useState([]);
    const [assets, setAssets] = useState([]);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);  // New state for categories
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Fetch assets and categories, and populate filters (status, location, units)
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
                const categoriesResponse = await fetch('https://asset-manager-new.onrender.com/api/category');  // Fetch categories

                if (!statusesResponse.ok || !locationsResponse.ok || !unitsResponse.ok || !categoriesResponse.ok) {
                    throw new Error('Failed to fetch required data');
                }

                const statusesData = await statusesResponse.json();
                const locationsData = await locationsResponse.json();
                const unitsData = await unitsResponse.json();
                const categoriesData = await categoriesResponse.json();  // Parse categories data

                setStatuses(statusesData);
                setLocations(locationsData);
                setUnits(unitsData);
                setCategories(categoriesData);  // Set categories data
            } catch (err) {
                setError(err.message);
            }
        };

        fetchAssets();
        fetchCategoriesAndStatuses();
    }, []);

    const handleLocationChange = (e) => {
        setSelectedLocation(e.target.value);
    };

    const handleUnitChange = (e) => {
        setSelectedUnit(e.target.value);
    };

    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };

    const handleDateChange = (e) => {
        setStartDate(e.target.value); // Update the start date state
    };

    // Function to format date to yyyy-mm-dd (strip off time)
    const formatDate = (date) => {
        const d = new Date(date);
        // Check if it's a valid date
        if (isNaN(d.getTime())) {
            console.error('Invalid date:', date); // Debugging log
            return ''; // Return empty string if the date is invalid
        }
        // Strip off time by setting the time to midnight (00:00:00)
        d.setHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0]; // Only returns the date part (yyyy-mm-dd)
    };

    // Filter assets based on the selected filters
    const filteredAssets = () => {
        return assets.filter(asset => {
            const matchesLocation = selectedLocation ? asset.locationName === selectedLocation : true;
            const matchesUnit = selectedUnit ? asset.associateUnit === selectedUnit : true;
            const matchesStatus = selectedStatus ? asset.assetStatus === selectedStatus : true;

            // Format the asset purchaseDate to only match the date part (yyyy-mm-dd)
            const purchaseDateFormatted = formatDate(asset.DOP);
            const startDateFormatted = startDate ? formatDate(startDate) : '';

            // If startDate is provided, check if the asset's purchaseDate is greater than or equal to startDate
            const matchesStartDate = startDateFormatted ? purchaseDateFormatted >= startDateFormatted : true;

            return matchesLocation && matchesUnit && matchesStatus && matchesStartDate;
        });
    };

    return (
        <div className="App">
            <div className="mis-content">
                <header className="header">
                    <h1>Asset Management Report</h1>
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

                            {/* Location Dropdown for Filtering */}
                            <label>Location:</label>
                            <select name="location" onChange={handleLocationChange}>
                                <option value="">All Locations</option>
                                {locations.map((location) => (
                                    <option key={location._id} value={location._id}>
                                        {location.name}
                                    </option>
                                ))}
                            </select>

                            {/* Unit Dropdown for Filtering */}
                            <label>Unit:</label>
                            <select name="unit" onChange={handleUnitChange}>
                                <option value="">All Units</option>
                                {units.map((unit) => (
                                    <option key={unit._id} value={unit._id}>
                                        {unit.name}
                                    </option>
                                ))}
                            </select>

                            {/* Status Dropdown for Filtering */}
                            <label>Status:</label>
                            <select name="status" onChange={handleStatusChange}>
                                <option value="">All Statuses</option>
                                {statuses.map((status) => (
                                    <option key={status._id} value={status._id}>
                                        {status.name}
                                    </option>
                                ))}
                            </select>

                            {/* Date of Purchase Filter */}
                            <label>Start Date:</label>
                            <input type="date" name="start-date" value={startDate} onChange={handleDateChange} />
                        </form>
                    </div>

                    <section className="asset-list">
                        <div className="heading">Asset List</div>
                        <table className="mis-table">
                            <thead>
                                <tr>
                                    <th>Asset Name</th>
                                    <th>Asset Specification</th>
                                    <th>Lifetime</th>
                                    <th>Units</th>
                                    <th>Status</th>
                                    <th>Location</th>
                                    <th>Category</th> {/* Added Category Column */}
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
                                            <td colSpan="6">No assets found for the selected date or filters</td>
                                        </tr>
                                    ) : (
                                        filteredAssets().map((asset) => (
                                            <tr key={asset._id}>
                                                <td>{asset.assetName}</td>
                                                <td>{asset.assetSpecification}</td>
                                                <td>{asset.assetLifetime}</td>
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
                                                <td>
                                                    {categories && asset.assetCategory ? (
                                                        categories.find(category => category._id === asset.assetCategory)
                                                        ? categories.find(category => category._id === asset.assetCategory).name
                                                        : 'No category'
                                                    ) : (
                                                        'Loading...'
                                                    )}
                                                </td>
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
