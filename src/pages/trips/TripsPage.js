import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, Fade, Tooltip, Button } from '@mui/material';
import { List, ViewDay, ArrowBack } from '@mui/icons-material';
import TripList from '../../components/trips/TripList';
import TripDetails from '../../components/trips/TripDetails';

const TripsPage = () => {
  const [currentView, setCurrentView] = useState(0);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const handleViewChange = (event, newValue) => {
    if (newValue === 0 || (newValue === 1 && selectedTrip)) {
      setCurrentView(newValue);
    }
  };

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setCurrentView(1); // Switch to Trip Details view
  };

  const handleBackToList = () => {
    setCurrentView(0);
    setSelectedTrip(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', py: 4 }}>
      <Paper 
        sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
          {currentView === 1 && (
            <Tooltip title="Back to trip list">
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBackToList}
                sx={{ mr: 2 }}
              >
                Back
              </Button>
            </Tooltip>
          )}
          <Tabs
            value={currentView}
            onChange={handleViewChange}
            centered
            sx={{ flex: 1 }}
          >
            <Tab 
              icon={<List />} 
              label="My Trips"
              sx={{ 
                '&.Mui-selected': { 
                  color: 'primary.main',
                  fontWeight: 'bold',
                }
              }}
            />
            <Tab 
              icon={<ViewDay />} 
              label="Trip Details"
              disabled={!selectedTrip}
              sx={{ 
                '&.Mui-selected': { 
                  color: 'primary.main',
                  fontWeight: 'bold',
                }
              }}
            />
          </Tabs>
        </Box>
      </Paper>

      <Box sx={{ position: 'relative' }}>
        <Fade in={currentView === 0} unmountOnExit>
          <Box>
            <TripList onTripSelect={handleTripSelect} />
          </Box>
        </Fade>

        <Fade in={currentView === 1} unmountOnExit>
          <Box>
            <TripDetails trip={selectedTrip} onBack={handleBackToList} />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default TripsPage; 