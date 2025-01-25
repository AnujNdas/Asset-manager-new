import axios from 'axios';

const API_URL = 'https://asset-manager-new.onrender.com/api';  // Update if your backend URL is different

// ----- UNIT API CALLS -----
// Get all units
export const getUnits = async () => {
  try {
    const response = await axios.get(`${API_URL}/unit`);
    return response.data;  // Return the list of units
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;  // Throw error so we can catch it in the component
  }
};

// Create a new unit
export const createUnit = async (unitData) => {
  try {
    const response = await axios.post(`${API_URL}/unit`, unitData);
    return response.data;  // Return the newly created unit
  } catch (error) {
    console.error('Error creating unit:', error);
    throw error;  // Throw error so we can catch it in the component
  }
};

// ----- LOCATION API CALLS -----
// Get all locations
export const getLocations = async () => {
  try {
    const response = await axios.get(`${API_URL}/location`);
    return response.data;  // Return the list of locations
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;  // Throw error so we can catch it in the component
  }
};

// Create a new location
export const createLocation = async (locationData) => {
  try {
    const response = await axios.post(`${API_URL}/location`, locationData);
    return response.data;  // Return the newly created location
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;  // Throw error so we can catch it in the component
  }
};

// ----- CATEGORY API CALLS -----
// Get all categories
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/category`);
    return response.data;  // Return the list of categories
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;  // Throw error so we can catch it in the component
  }
};

// Create a new category
export const createCategory = async (categoryData) => {
  try {
    const response = await axios.post(`${API_URL}/category`, categoryData);
    return response.data;  // Return the newly created category
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;  // Throw error so we can catch it in the component
  }
};

// Services/ApiServices.js

export const getStatuses = async () => {
  try {
    const response = await axios.get(`${API_URL}/status`);  // Make sure your backend has the correct endpoint
    return response.data;  // Return the list of statuses
  } catch (error) {
    console.error('Error fetching statuses:', error);
    throw error;  // Throw error so we can catch it in the component
  }
};

// Create a new status
export const createStatus = async (statusData) => {
  try {
    const response = await axios.post(`${API_URL}/status`, statusData);  // Adjust endpoint for creating status
    return response.data;  // Return the newly created status
  } catch (error) {
    console.error('Error creating status:', error);
    throw error;  // Throw error so we can catch it in the component
  }
};
