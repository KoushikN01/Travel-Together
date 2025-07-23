import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  FlightTakeoff as FlightIcon,
} from '@mui/icons-material';
import { useItinerary } from '../contexts/ItineraryContext';
import { useNavigate } from 'react-router-dom';

const ItineraryDrawer = ({ open, onClose }) => {
  const { itinerary, removeFromItinerary, clearItinerary } = useItinerary();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const handleDeleteClick = (item, event) => {
    event.stopPropagation(); // Prevent drawer from closing
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      removeFromItinerary(itemToDelete.id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setSnackbar({
        open: true,
        message: 'Item removed from itinerary',
        severity: 'success'
      });
    }
  };

  const handleClearClick = (event) => {
    event.stopPropagation(); // Prevent drawer from closing
    clearItinerary();
    setClearDialogOpen(true);
  };

  const handleClearConfirm = () => {
    clearItinerary();
    setClearDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Itinerary cleared',
      severity: 'success'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleBookNow = (item, event) => {
    event.stopPropagation(); // Prevent drawer from closing
    // Navigate to travel booking with pre-filled data
    navigate('/trips', {
      state: {
        prefillBooking: {
          to: item.title,
          from: '', // You might want to get this from user's location or let them choose
          transportMode: 'flight', // Default to flight, user can change
          accommodation: 'hotel', // Default to hotel, user can change
        }
      }
    });
    onClose(); // Only close the drawer after navigation
  };

  const handleDrawerClose = (event, reason) => {
    // Only close if clicking outside or pressing escape
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      onClose();
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: { 
            width: { xs: '100%', sm: 400 },
            zIndex: 1300, // Ensure drawer appears above other content
            position: 'fixed',
            height: '100%',
            '& .MuiDrawer-paper': {
              position: 'relative',
              zIndex: 1300
            }
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            zIndex: 1299 // Backdrop should be below drawer but above other content
          },
          zIndex: 1300
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CartIcon />
            Itinerary
            <Badge badgeContent={itinerary.length} color="primary" sx={{ ml: 1 }} />
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {itinerary.length === 0 ? (
          <Typography color="text.secondary" align="center">
            Your itinerary is empty
          </Typography>
        ) : (
          <>
            <List>
              {itinerary.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItem>
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                          {item.category && (
                            <Typography component="span" variant="caption" display="block" color="text.secondary">
                              Category: {item.category}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => handleDeleteClick(item, e)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Box sx={{ px: 2, mb: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<FlightIcon />}
                      fullWidth
                      onClick={(e) => handleBookNow(item, e)}
                      sx={{
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                        }
                      }}
                    >
                      Book Now
                    </Button>
                  </Box>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={handleClearClick}
              >
                Clear All
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation(); // Prevent drawer from closing
                  // TODO: Implement save itinerary functionality
                  console.log('Save itinerary:', itinerary);
                }}
              >
                Save Itinerary
              </Button>
            </Box>
          </>
        )}
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Remove Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove "{itemToDelete?.title}" from your itinerary?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
      >
        <DialogTitle>Clear Itinerary</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove all items from your itinerary? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearConfirm} color="error" variant="contained">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ItineraryDrawer; 