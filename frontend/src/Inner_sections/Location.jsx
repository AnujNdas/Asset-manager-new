import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';
import { getLocations, createLocation } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Pagination from '../Components/Pagination'; // ✅ Imported the global pagination
import Loader from "../Components/Loader";
const Location = () => {
  const [locationName, setLocationName] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await getLocations();
      setLocations([...data].reverse()); // newest first
    } catch (err) {
      setError('Error fetching locations');
    } finally {
      setLoading(false);
    }
  };

  // Pagination Slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = locations.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(locations.length / itemsPerPage);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!locationName.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Location Name',
      text: 'Please enter a location name.',
    });
    return;
  }

  try {
    const res = await createLocation({ name: locationName.trim() });

    // FIX: extract actual location object
    const newLocation = res.location || res.data || res;

    setLocations((prev) => [newLocation, ...prev]);
    setLocationName('');
    setCurrentPage(1);

    Swal.fire({
      icon: 'success',
      title: 'Location Added',
      text: 'The location has been created successfully!',
      timer: 1800,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error Creating Location',
      text: err.response?.data?.message || 'Something went wrong.',
    });
  }
};