import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as LineTooltip, ResponsiveContainer as LineResponsiveContainer } from 'recharts';
// import LoadingSpinner from './LoadingSpinner'; // Import your loading spinner component
import { CircularProgress } from '@mui/material';

const AssetDashboard = () => {
  // State to manage loading state
  const [loading, setLoading] = useState(true);

  const LoadingSpinner = () => (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
    </Box>
  );

  // Sample data for the charts (initially empty or dummy data)
  const [assetCategoryData, setAssetCategoryData] = useState([]);
  const [assetStatusData, setAssetStatusData] = useState([]);
  const [assetPurchaseTrendData, setAssetPurchaseTrendData] = useState([]);

  useEffect(() => {
    // Simulate data loading with a timeout
    setTimeout(() => {
      // Mock data after 2 seconds (replace this with your actual API call)
      setAssetCategoryData([
        { name: 'Hardware', value: 400 },
        { name: 'Software', value: 300 },
        { name: 'Furniture', value: 200 },
        { name: 'Others', value: 100 },
      ]);
      setAssetStatusData([
        { name: 'Active', value: 800 },
        { name: 'Inactive', value: 150 },
        { name: 'Under Maintenance', value: 50 },
      ]);
      setAssetPurchaseTrendData([
        { month: 'Jan', assets: 50 },
        { month: 'Feb', assets: 70 },
        { month: 'Mar', assets: 80 },
        { month: 'Apr', assets: 120 },
        { month: 'May', assets: 90 },
        { month: 'Jun', assets: 110 },
      ]);
      setLoading(false); // Data has loaded, set loading to false
    }, 2000); // Simulated loading time (2 seconds)
  }, []);

  // Show loading spinner until data is loaded
  if (loading) {
    return <LoadingSpinner />; // Display loading spinner while data is being fetched
  }

  return (
    <Container sx={{ height : '100%', width: '100%'}}>
      <Typography variant="h4" gutterBottom sx={{
        height : "10%",
        width : '95%',
        fontSize : "20px",
        fontWeight : 600,
        color : "#565656",
        fontFamily : "Lato, san-serif",
        display : "flex",
        alignItems:"center",
        margin:0
      }}>
        Asset Management Dashboard
      </Typography>

      <Grid container spacing={3} sx={{
        height: "90%"
      }}>
        {/* Asset Category Pie Chart */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <Box padding={2}>
              <Typography variant="h6" gutterBottom>Asset Allocation by Category</Typography>
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={assetCategoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {assetCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Asset Status Pie Chart */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <Box padding={2}>
              <Typography variant="h6" gutterBottom>Asset Status Distribution</Typography>
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={assetStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {assetStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#00C49F', '#FFBB28', '#FF8042'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Asset Purchase Trend Line Chart */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <Box padding={2}>
              <Typography variant="h6" gutterBottom>Asset Purchase Trend</Typography>
              <LineResponsiveContainer width="100%" height={500}>
                <LineChart data={assetPurchaseTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Line type="monotone" dataKey="assets" stroke="#8884d8" />
                  <LineTooltip />
                </LineChart>
              </LineResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AssetDashboard;