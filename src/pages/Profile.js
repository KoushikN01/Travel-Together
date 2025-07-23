import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import ChromaGrid from '../components/effects/ChromaGrid';

const Profile = () => {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    // Fetch user's trips
    const fetchTrips = async () => {
      try {
        const response = await fetch('/api/trips');
        const data = await response.json();
        setTrips(data);
      } catch (error) {
        console.error('Error fetching trips:', error);
      }
    };

    fetchTrips();
  }, []);

  const tripItems = trips.map(trip => ({
    image: trip.image || 'https://source.unsplash.com/random/800x600/?travel',
    title: trip.title,
    subtitle: trip.description,
    handle: `@${trip.title.toLowerCase().replace(/\s+/g, '')}`,
    borderColor: "#4F46E5",
    gradient: "linear-gradient(145deg, #4F46E5, #000)",
    url: `/trip/${trip.id}`
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>

      {/* Add ChromaGrid for trips */}
      <Box sx={{ height: '600px', position: 'relative', mb: 4 }}>
        <ChromaGrid 
          items={tripItems}
          radius={300}
          damping={0.45}
          fadeOut={0.6}
          ease="power3.out"
        />
      </Box>

      {/* Existing profile content */}
      <Grid container spacing={3}>
        {/* ... existing profile content ... */}
      </Grid>
    </Container>
  );
};

export default Profile; 