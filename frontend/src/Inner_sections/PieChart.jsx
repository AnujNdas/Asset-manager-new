import React from 'react';
import { Pie } from 'react-chartjs-2';
import "../Page_styles/PieChart.css"
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

// Register necessary components from chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const CircularPieChart = ({ totalStorage, filledStorage }) => {
  // Calculate empty storage
  const emptyStorage = totalStorage - filledStorage;

  // Data for the pie chart
  const data = {
    labels: ['Filled Storage', 'Empty Storage'], // Labels
    datasets: [
      {
        data: [filledStorage, emptyStorage], // Data values for the filled and empty storage
        backgroundColor: ['#36A2EB', '#FF6384'], // Colors for each section
        hoverBackgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const percentage = ((tooltipItem.raw / totalStorage) * 100).toFixed(2);
            return `${tooltipItem.label}: ${tooltipItem.raw} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className='Piechart-container'>
      <h5>Storage Overview</h5>
      <div className="chart-container">
        <div className="pie-box">
            <Pie data={data} options={options} width={200} height={200}/>

        </div>
        <div className='chart-data'>
            <strong>Total Storage:</strong> {totalStorage} units
            <br />
            <strong>Filled Storage:</strong> {filledStorage} units
            <br />
            <strong>Empty Storage:</strong> {emptyStorage} units
        </div>
      </div>
      
    </div>
  );
};

export default CircularPieChart;
