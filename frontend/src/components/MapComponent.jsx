import React, { useState, useEffect, useCallback } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FaBolt } from 'react-icons/fa';
import FilterPanel from './FilterPanel';
import debounce from 'lodash.debounce';
import NewListingForm from './NewListingForm';

const MapComponent = () => {
  const [viewState, setViewState] = useState({
    latitude: 43.71418,      // Toronto latitude from your query result
    longitude: -79.370489,   // Toronto longitude from your query result
    zoom: 12
  });

  // States for listings and filters
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [rateRange, setRateRange] = useState(0.15);
  const [powerSource, setPowerSource] = useState('all');
  const [coolingType, setCoolingType] = useState('all');
  
  // New state to toggle the display of the form
  const [showNewListingForm, setShowNewListingForm] = useState(false);

  // Debounced function to fetch listings from the backend API
  const fetchListings = useCallback(
    debounce(() => {
      // Build the parameters based on the region filter.
      const paramsObj = {
        region: selectedRegion,
        rateRange: rateRange.toString(),
        powerSource,
        coolingType,
      };
  
      // Only add location filtering if the region isn't "all"
      if (selectedRegion !== 'all') {
        paramsObj.lat = '40.73';
        paramsObj.lng = '-73.93';
        paramsObj.radius = '5000';
      }
  
      const params = new URLSearchParams(paramsObj);
      fetch(`http://localhost:5000/api/listings?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
          console.log('Listings returned:', data);
          const parsedData = data.map(listing => {
            if (listing.location && typeof listing.location === 'string' && listing.location.startsWith('POINT(')) {
              const coords = listing.location.replace('POINT(', '').replace(')', '').split(' ');
              return {
                ...listing,
                longitude: parseFloat(coords[0]),
                latitude: parseFloat(coords[1])
              };
            }
            return listing;
          });
          setListings(parsedData);
        })
        .catch(err => console.error('Error fetching listings:', err));
    }, 500),
    [selectedRegion, rateRange, powerSource, coolingType]
  );
  
  

  // useEffect to trigger the debounced fetch when filters change
  useEffect(() => {
    fetchListings();
    return () => {
      fetchListings.cancel();
    };
  }, [selectedRegion, rateRange, powerSource, coolingType, fetchListings]);

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <FilterPanel
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        rateRange={rateRange}
        setRateRange={setRateRange}
        powerSource={powerSource}
        setPowerSource={setPowerSource}
        coolingType={coolingType}
        setCoolingType={setCoolingType}
      />

      {/* Toggle Button for New Listing Form */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 300 }}>
        <button onClick={() => setShowNewListingForm(!showNewListingForm)}>
          {showNewListingForm ? 'Close Form' : 'Add New Listing'}
        </button>
      </div>

      {/* Conditionally render the NewListingForm */}
      {showNewListingForm && (
        <div style={{ position: 'absolute', top: 60, right: 20, zIndex: 200, background: '#fff', padding: '10px', borderRadius: '8px' }}>
          <NewListingForm onListingAdded={(newListing) => {
            setListings(prev => [...prev, newListing]);
            // Optionally close the form after submission
            setShowNewListingForm(false);
          }}/>
        </div>
      )}

      <Map
        {...viewState}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
      >
        {listings.map(listing => (
          <Marker
            key={listing.id}
            latitude={listing.latitude}
            longitude={listing.longitude}
          >
            <button
              onClick={e => {
                e.preventDefault();
                setSelectedListing(listing);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              title={listing.title}
            >
              <FaBolt color="gold" size={24} />
            </button>
          </Marker>
        ))}

        {selectedListing && (
          <Popup
            latitude={selectedListing.latitude}
            longitude={selectedListing.longitude}
            onClose={() => setSelectedListing(null)}
            closeOnClick={false}
            anchor="top"
          >
            <div>
              <h3>{selectedListing.title}</h3>
              <p>{selectedListing.description}</p>
              <p>Electricity Rate: {selectedListing.electricity_rate}</p>
              <p>Power Source: {selectedListing.power_source}</p>
              <p>Cooling Type: {selectedListing.cooling_type}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapComponent;
