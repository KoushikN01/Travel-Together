import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import EMIConverter from '../EMIConverter';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'fixed',
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.primary.main,
  },
  toolbar: {
    minHeight: 64, // Adjust based on your Navbar height
  },
  content: {
    paddingTop: 64, // Match the toolbar height
  },
  spacer: {
    height: 64, // Match the toolbar height
  },
  mainContent: {
    marginTop: 200, // Push content further down below the Navbar
  },
  // ... existing styles ...
}));

const Navbar = () => {
  const classes = useStyles();
  const [emiOpen, setEmiOpen] = useState(false);

  return (
    <>
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6">Your App Name</Typography>
          {/* Add other Navbar items here */}
          <button style={{marginLeft: 'auto', padding: '8px 16px', borderRadius: 4, border: 'none', background: '#fff', color: '#1976d2', fontWeight: 600, cursor: 'pointer'}} onClick={() => setEmiOpen(true)}>
            EMI Calculator
          </button>
        </Toolbar>
      </AppBar>
      <div className={classes.spacer} /> {/* Spacer to push content down */}
      <div className={classes.mainContent}>
        {/* Main content goes here */}
      </div>
      <EMIConverter open={emiOpen} onClose={() => setEmiOpen(false)} />
    </>
  );
};

export default Navbar; 