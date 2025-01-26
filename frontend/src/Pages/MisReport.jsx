import React from 'react'
import { useState, useEffect } from 'react';
import "../Page_styles/MisReport.css"
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MisReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [assetType, setAssetType] = useState('all');
    const [performance, setPerformance] = useState('all');
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const data = {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [
            {
                label: 'Asset Value Over Time',
                data: [400000, 450000, 470000, 480000, 510000],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            },
        ],
    };

    const kpis = [
        { label: 'Total Asset Value', value: '$10,000,000' },
        { label: 'Growth/Decline', value: '+5.2%' },
        { label: 'Total Revenue', value: '$500,000' },
    ];

    useEffect(() => {
        const fetchAssets = async () => {
            try {
              const response = await fetch('http://localhost:5001/api/assets');
              if (!response.ok) {
                throw new Error('Failed to fetch assets');
              }
              const data = await response.json();
              setAssets(data);
              console.log(data)
            } catch (err) {
              setError(err.message);
            } finally {
              setLoading(false);
            }
          };
          fetchAssets();
    }, [])
    

    const handleDateChange = (e) => {
        if (e.target.name === 'start-date') {
            setStartDate(e.target.value);
        } else {
            setEndDate(e.target.value);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'asset-type') {
            setAssetType(value);
        } else if (name === 'performance') {
            setPerformance(value);
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
                    <button className="download-csv">Download CSV</button>
                    <button className="download-excel">Download EXCEL</button>
                    <button className="download-pdf">Download PDF</button>
                </div>
            </header>

            {/* Filters Section */}
            <aside className="filters">
                <div className="mis-form">
                <h3>Filters</h3>
                    <form className='mis-form-menu'>
                        <label>Asset Category:</label>
                        <select name="asset-type" value={assetType} onChange={handleFilterChange}>
                            <option value="all">All</option>
                            <option value="real-estate">Real Estate</option>
                            <option value="stocks">Stocks</option>
                            <option value="bonds">Bonds</option>
                        </select>
                        <label>Location:</label>
                        <select name="performance" value={performance} onChange={handleFilterChange}>
                            <option value="all">All</option>
                            <option value="top">Top Performing</option>
                            <option value="underperforming">Underperforming</option>
                        </select>
                        <label>Date of Purchase:</label>
                        <input type="date" name="start-date" value={startDate} onChange={handleDateChange} />
                        <label>Date of Expiry:</label>
                        <input type="date" name="end-date" value={endDate} onChange={handleDateChange} />
                    </form>
                </div>
                <section className="asset-list">
                    <div className='heading'>Asset List</div>
                    <table className='mis-table'>
                        <thead>
                            <tr>
                                <th>Asset Name</th>
                                <th>Asset Type</th>
                                <th>Value</th>
                                <th>Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map((asset) => (
                                <tr key={asset.name}>
                                    <td>{asset.name}</td>
                                    <td>{asset.type}</td>
                                    <td>{asset.value}</td>
                                    <td>{asset.performance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                
            </aside>
            

            {/* Main Content Section */}
            {/* <main className="main-content">
                {/* Key Performance Indicators */}
                {/* <section className="kpis">
                    <h2>Key Performance Indicators (KPIs)</h2>
                    {kpis.map((kpi) => (
                        <div className="kpi-item" key={kpi.label}>
                            <span>{kpi.label}:</span>
                            <span>{kpi.value}</span>
                        </div>
                    ))}
                </section>

                {/* Charts Section */}
                {/* <section className="charts">
                    <h2>Asset Performance</h2>
                    <Line data={data} options={{ responsive: true }} />
                </section>

                {/* Asset List Section */}
                
            {/* </main> */} 

            {/* Footer Section */}
            <footer className="footer">
                <p>&copy; 2025 AssetManager. All Rights Reserved.</p>
            </footer>    
            </div>
        </div>
    );
}

export default MisReport

