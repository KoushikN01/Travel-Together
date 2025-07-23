import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogContent,
  Tooltip,
} from '@mui/material';
import {
  Recommend as RecommendIcon,
  FlightTakeoff as TripIcon,
} from '@mui/icons-material';
import TripRecommendations from '../pages/TripRecommendations';

const RecommendationsMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openRecommendations, setOpenRecommendations] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRecommendationsClick = () => {
    setOpenRecommendations(true);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Travel Recommendations">
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)',
            },
          }}
        >
          <RecommendIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 280,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Travel Recommendations</Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          <ListItem button onClick={handleRecommendationsClick}>
            <ListItemIcon>
              <TripIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="View Recommendations"
              secondary="Get personalized trip suggestions"
            />
          </ListItem>
        </List>
      </Menu>

      {/* Travel Recommendations Dialog */}
      <Dialog
        open={openRecommendations}
        onClose={() => setOpenRecommendations(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            height: '80vh',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <TripRecommendations />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecommendationsMenu; 