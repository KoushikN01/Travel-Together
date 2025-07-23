import React, { createContext, useContext, useState, useEffect } from 'react';

const ItineraryContext = createContext();

export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
};

export const ItineraryProvider = ({ children }) => {
  const [itinerary, setItinerary] = useState(() => {
    const savedItinerary = localStorage.getItem('itinerary');
    return savedItinerary ? JSON.parse(savedItinerary) : [];
  });

  useEffect(() => {
    localStorage.setItem('itinerary', JSON.stringify(itinerary));
  }, [itinerary]);

  const addToItinerary = (item) => {
    setItinerary(prev => {
      // Check if item already exists
      const exists = prev.some(i => i.id === item.id);
      if (exists) {
        return prev;
      }
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  };

  const removeFromItinerary = (itemId) => {
    setItinerary(prev => prev.filter(item => item.id !== itemId));
  };

  const clearItinerary = () => {
    setItinerary([]);
  };

  const value = {
    itinerary,
    addToItinerary,
    removeFromItinerary,
    clearItinerary
  };

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
}; 