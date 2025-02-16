import React, { useState, useEffect } from 'react';
import '../Page_styles/Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faList, faChartSimple, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { Pie } from 'react-chartjs-2';
import { ProgressBar } from 'react-bootstrap'; // Using Bootstrap for ProgressBar
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [assets, setAssets] = useState([]);
  const [category, setCategory] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [locations, setLocations] = useState([]);

  const adjustHue = (hue, adjustment) => (hue + adjustment + 360) % 360;

  const hslToRgb = (h, s, l) => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }
  
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  };
  
  const getAnalogousColor = () => {
    const hue = Math.floor(Math.random() * 360); // random hue
    const saturation = 0.6 + Math.random() * 0.4; // random saturation
    const lightness = 0.4 + Math.random() * 0.2; // random lightness
    
    const color1 = hslToRgb(hue, saturation, lightness);
    const color2 = hslToRgb(adjustHue(hue, 30), saturation, lightness); // Adjust hue for analogous colors
    const color3 = hslToRgb(adjustHue(hue, -30), saturation, lightness); // Adjust hue for analogous colors
    
    const rgbToHex = (r, g, b) => `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
    
    return [rgbToHex(...color1), rgbToHex(...color2), rgbToHex(...color3)];
  };
  
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/assets');
        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }
        const data = await response.json();
        setAssets(data);
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: err.message,
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    };

    const fetchCategoriesAndStatuses = async () => {
      try {
        const categoriesResponse = await fetch('http://localhost:5001/api/category');
        const statusesResponse = await fetch('http://localhost:5001/api/status');
        const locationsResponse = await fetch('http://localhost:5001/api/location');

        if (!categoriesResponse.ok || !statusesResponse.ok || !locationsResponse.ok) {
          throw new Error('Failed to fetch required data');
        }

        const categoriesData = await categoriesResponse.json();
        const statusesData = await statusesResponse.json();
        const locationsData = await locationsResponse.json();

        setCategory(categoriesData);
        setStatuses(statusesData);
        setLocations(locationsData);
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchAssets();
    fetchCategoriesAndStatuses();
  }, []);

  // Calculate total number of assets
  const totalAssets = assets.length;

  // Calculate assets per location
  const locationCounts = locations.map(loc => ({
    locationName: loc.name,
    count: assets.filter(asset => asset.locationName === loc._id).length,
  }));

  // Calculate assets per category
  const categoryCounts = category.map(cat => ({
    categoryName: cat.name,
    count: assets.filter(asset => asset.assetCategory === cat._id).length,
  }));

  // Map the status IDs to the status names
  const statusNames = statuses.reduce((acc, status) => {
    acc[status._id] = status.name;
    return acc;
  }, {});

  // Count assets by status
  const checkedInAssets = assets.filter(asset => statusNames[asset.assetStatus] === 'Check In').length;
  const checkedOutAssets = assets.filter(asset => statusNames[asset.assetStatus] === 'Check Out').length;
  
  // Chart data for Status
  const statuscolor = getAnalogousColor();
  const statusData = {
    labels: ['Check In', 'Check Out'],
    datasets: [
      {
        label : "Assets Entry",
        data: [checkedInAssets, checkedOutAssets],
        backgroundColor: statuscolor,
      },
    ],
  };

  // Bar Chart options
  const barChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Assets Summary',
        font: {
          family: 'Roboto',
          size: 18,
          weight: 'bold',
        },
        color: "#565656",
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#565656',
          font: {
            family: 'Roboto',
            size: 10,
            weight: 'bold',
          },
        },
        grid: {
          color: '#cccccc',
          borderColor: '#aaaaaa',
        },
      },
      y: {
        ticks: {
          color: '#565656',
          font: {
            family: 'Roboto',
            size: 14,
            weight: 'normal',
          },
        },
      },
    },
  };

  // Bar Chart for Location
  const locationcolor = getAnalogousColor();
  const locationData = {
    labels: locationCounts.map(loc => loc.locationName),
    datasets: [
      {
        label: 'Assets per Location',
        data: locationCounts.map(loc => loc.count),
        backgroundColor: locationcolor,
      },
    ],
  };

  // Bar Chart for Category
  const categorycolor = getAnalogousColor();
  const categoryData = {
    labels: categoryCounts.map(cat => cat.categoryName),
    datasets: [
      {
        label: 'Assets per Category',
        data: categoryCounts.map(cat => cat.count),
        backgroundColor: categorycolor,
      },
    ],
  };

  return (
    <div className='dashboard-section'>
      <div className="classify_heading">
        Assets Overview
      </div>

      {/* Card Section */}
      <div className='card-section'>
        {/* Total Assets Card with Progress Bar */}
        <div className="card">
          <div className="card-info" style={{ backgroundColor: "#3f4045" }}>
            <FontAwesomeIcon
              icon={faChartSimple}
              style={{
                color: "white",
                fontSize: "20px",
                border: "none",
                textAlign: "center",
                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.6)"
              }}
            />
          </div>
          <div className="asset-info">
            <p>Total Assets</p>
            <ProgressBar now={(totalAssets / 100) * 100} label={`${totalAssets}`} />
          </div>
        </div>

        {/* Total Locations Card with Pie Chart */}
        <div className="card">
          <div className="card-info" style={{ backgroundColor: "#3d97ef" }}>
            <FontAwesomeIcon
              icon={faLocationDot}
              style={{
                color: "white",
                fontSize: "20px",
                border: "none",
                textAlign: "center",
                textShadow: "0px 0px 5px 15px rgba(0,0,0,0.5)"
              }}
            />
          </div>
          <div className="asset-info">
            <p>Total Locations</p>
              <Pie data={locationData} options={{
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true },
                },
              }} />
          </div>
        </div>

        {/* Total Categories Card with Pie Chart */}
        <div className="card">
          <div className="card-info" style={{ backgroundColor: "#5cb762" }}>
            <FontAwesomeIcon
              icon={faList}
              style={{
                color: "white",
                fontSize: "20px",
                border: "none",
                textAlign: "center",
                textShadow: "0px 0px 5px 15px rgba(0,0,0,0.5)"
              }}
            />
          </div>
          <div className="asset-info">
            <p>Total Categories</p>
            <Pie data={categoryData} options={{
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
            }} />
          </div>
        </div>

        {/* Asset Status Card with Pie Chart */}
        <div className="card">
          <div className="card-info" style={{ backgroundColor: "#FF9800" }}>
            <FontAwesomeIcon
              icon={faCircleCheck}
              style={{
                color: "white",
                fontSize: "20px",
                border: "none",
                textAlign: "center",
                textShadow: "0px 0px 5px 15px rgba(0,0,0,0.5)"
              }}
            />
          </div>
          <div className="asset-info">
            <p>Checked In & Checked Out</p>
            <Pie data={statusData} options={{
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
            }} />
          </div>
        </div>
      </div>

      {/* Graph Section */}
      <div className="graph-section">
        {/* Bar Graph for Locations */}
        <div className="graph">
          <div className="graph-info" style={{ backgroundColor: "#ffffff" }}>
            <Bar data={locationData} options={barChartOptions} />
          </div>
        </div>

        {/* Bar Graph for Categories */}
        <div className="graph">
          <div className="graph-info" style={{ backgroundColor: "#ffffff" }}>
            <Bar data={categoryData} options={barChartOptions} />
          </div>
        </div>

        {/* Bar Chart for Status */}
        <div className="graph">
          <div className="graph-info" style={{ backgroundColor: "#ffffff" }}>
            <Bar data={statusData} options={barChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
