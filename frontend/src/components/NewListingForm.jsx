import React, { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';

const NewListingForm = ({ onListingAdded }) => {
  // Fields for the form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [electricityRate, setElectricityRate] = useState('');
  const [address, setAddress] = useState('');
  
  // Keep state for lat/lng even though they’re hidden from the user
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [powerSource, setPowerSource] = useState('Hydro');
  const [coolingType, setCoolingType] = useState('Immersion');

  // State to hold address suggestions
  const [suggestions, setSuggestions] = useState([]);

  // Debounced function to fetch address suggestions from Nominatim API
  const fetchSuggestions = useCallback(
    debounce((value) => {
      if (!value) {
        setSuggestions([]);
        return;
      }
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`)
        .then(response => response.json())
        .then(data => {
          setSuggestions(data);
        })
        .catch(err => {
          console.error("Error fetching address suggestions", err);
          setSuggestions([]);
        });
    }, 300),
    []
  );

  // Handle changes in the address input field
  const handleAddressChange = (e) => {
    const val = e.target.value;
    setAddress(val);
    fetchSuggestions(val);
  };

  // When a user selects one of the suggestions
  const handleSuggestionSelect = (suggestion) => {
    setAddress(suggestion.display_name);
    // Set latitude and longitude from the selected suggestion
    setLatitude(suggestion.lat);
    setLongitude(suggestion.lon);
    // Clear suggestions after selection
    setSuggestions([]);
  };

  // Handle form submission with a validation check
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate that geocoding was successful:
    if (!latitude || !longitude) {
      alert("Please select an address from the suggestions to determine coordinates before submitting.");
      return;
    }
    
    // Build the new listing object 
    const newListing = {
      title,
      description,
      electricityRate,
      powerSource,
      coolingType,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    };

    fetch('http://localhost:5000/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newListing)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add listing');
        return res.json();
      })
      .then((data) => {
        // Optionally, parse the returned location string to extract coordinates
        if (data.location && typeof data.location === 'string' && data.location.startsWith('POINT(')) {
          const coords = data.location
            .replace('POINT(', '')
            .replace(')', '')
            .split(' ');
          data.longitude = parseFloat(coords[0]);
          data.latitude = parseFloat(coords[1]);
        }
        
        // Reset form fields after successful submission
        setTitle('');
        setDescription('');
        setElectricityRate('');
        setAddress('');
        setLatitude('');
        setLongitude('');
        setPowerSource('Hydro');
        setCoolingType('Immersion');

        if (onListingAdded) onListingAdded(data);
        alert('Listing added successfully!');
      })
      .catch((err) => {
        console.error(err);
        alert('Error adding listing. Please try again.');
      });
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '16px', background: '#f8f8f8', borderRadius: '8px', margin: '16px 0' }}>
      <h3>Add New Mining Listing</h3>

      <div>
        <label>Title:</label><br/>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <label>Description:</label><br/>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>

      <div>
        <label>Electricity Rate (numeric, e.g. 0.05):</label><br/>
        <input value={electricityRate} onChange={(e) => setElectricityRate(e.target.value)} required />
      </div>

      <div style={{ position: 'relative' }}>
        <label>Address:</label><br/>
        <input 
          value={address} 
          onChange={handleAddressChange} 
          placeholder="Type an address..." 
          required 
        />
        {/* Display suggestions in a dropdown list */}
        {suggestions.length > 0 && (
          <ul style={{
            position: 'absolute',
            background: '#fff',
            border: '1px solid #ddd',
            width: '100%',
            listStyle: 'none',
            padding: '4px',
            margin: 0,
            maxHeight: '150px',
            overflowY: 'auto',
            zIndex: 1000,
          }}>
            {suggestions.map(suggestion => (
              <li 
                key={suggestion.place_id}
                onClick={() => handleSuggestionSelect(suggestion)}
                style={{ padding: '4px', cursor: 'pointer' }}
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Optionally display the coordinates for debugging */}
      {/* <div>
        <label>Latitude:</label> {latitude}
      </div>
      <div>
        <label>Longitude:</label> {longitude}
      </div> */}

      <div>
        <label>Power Source:</label><br/>
        <select value={powerSource} onChange={(e) => setPowerSource(e.target.value)}>
          <option value="Hydro">Hydro</option>
          <option value="Solar">Solar</option>
          <option value="Grid">Grid</option>
          <option value="Wind">Wind</option>
        </select>
      </div>

      <div>
        <label>Cooling Type:</label><br/>
        <select value={coolingType} onChange={(e) => setCoolingType(e.target.value)}>
          <option value="Immersion">Immersion</option>
          <option value="Air">Air</option>
          <option value="Water">Water</option>
        </select>
      </div>

      <button type="submit" style={{ marginTop: '8px' }}>Add Listing</button>
    </form>
  );
};

export default NewListingForm;
