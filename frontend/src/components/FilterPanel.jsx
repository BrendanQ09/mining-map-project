// src/components/FilterPanel.jsx
import React from 'react';

const FilterPanel = ({
  selectedRegion,
  setSelectedRegion,
  rateRange,
  setRateRange,
  powerSource,       // add these
  setPowerSource,
  coolingType,
  setCoolingType
}) => {
  return (
    <div
      style={{
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 100,
        minWidth: '220px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px'
      }}
    >
      <h4>Filter Listings</h4>
      
      {/* Power Source Filter */}
      <label>Power Source:</label>
      <select
        value={powerSource}
        onChange={(e) => setPowerSource(e.target.value)}
      >
        <option value="all">All</option>
        <option value="Hydro">Hydro</option>
        <option value="Solar">Solar</option>
        <option value="Grid">Grid</option>
        <option value="Wind">Wind</option>
      </select>
      
      <br /><br />
      
      {/* Cooling Type Filter */}
      <label>Cooling Type:</label>
      <select
        value={coolingType}
        onChange={(e) => setCoolingType(e.target.value)}
      >
        <option value="all">All</option>
        <option value="Immersion">Immersion</option>
        <option value="Air">Air</option>
        <option value="Water">Water</option>
      </select>
      
      <br /><br />
      
      {/* Electricity Rate Filter */}
      <label>Max Electricity Rate ($/kWh): {rateRange}</label>
      <input
        type="range"
        min={0.01}
        max={0.15}
        step={0.01}
        value={rateRange}
        onChange={(e) => setRateRange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          marginTop: '4px'
        }}
      />
    </div>
  );
};

export default FilterPanel;
