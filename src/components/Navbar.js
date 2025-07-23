import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Dialog,
  DialogContent,
  useTheme,
  useMediaQuery,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications as NotificationsIcon,
  SmartToy as SmartToyIcon,
  Recommend as RecommendIcon,
  Home as HomeIcon,
  FlightTakeoff as TripIcon,
  Explore as ExploreIcon,
  CardMembership as SubscriptionIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { styled } from '@mui/material/styles';
import TravelAssistant from '../pages/TravelAssistant';
import NotificationsMenu from './NotificationsMenu';
import NotificationBell from './notifications/NotificationBell';
import RecommendationsMenu from './RecommendationsMenu';
import TravelMatcher from './travel/TravelMatcher';
import EMIConverter from './EMIConverter';
import authService from '../services/authService';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: '#2196f3',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: 'white',
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: '4px',
  padding: '6px 16px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: '#1976d2',
  color: 'white',
  fontWeight: 'bold',
  border: '2px solid rgba(255,255,255,0.2)',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  padding: '8px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [openAssistant, setOpenAssistant] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [travelMatcherOpen, setTravelMatcherOpen] = useState(false);
  const [emiOpen, setEmiOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const pages = ['Home', 'Trips', 'Explore', 'Tools', 'Subscription'];
  const settings = ['Profile', 'Settings', 'Logout'];

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/signin');
  };

  const handleNavigate = (page) => {
    handleCloseNavMenu();
    handleCloseUserMenu();
    switch (page) {
      case 'Home':
        navigate('/');
        break;
      case 'Trips':
        navigate('/trips');
        break;
      case 'Explore':
        navigate('/explore');
        break;
      case 'Tools':
        navigate('/travel-tools');
        break;
      case 'Subscription':
        navigate('/subscription');
        break;
      case 'Profile':
        navigate('/profile');
        break;
      case 'Settings':
        navigate('/settings');
        break;
      case 'Logout':
        logout();
        navigate('/signin');
        break;

      default:
        break;
    }
  };

  const getIcon = (page) => {
    switch (page) {
      case 'Home':
        return <HomeIcon />;
      case 'Trips':
        return <TripIcon />;
      case 'Explore':
        return <ExploreIcon />;
      case 'Tools':
        return <BuildIcon />;
      case 'Subscription':
        return <SubscriptionIcon />;
      default:
        return null;
    }
  };

  const handleAssistantOpen = () => {
    setOpenAssistant(true);
  };

  const handleAssistantClose = () => {
    setOpenAssistant(false);
  };

  const handleTravelMatcherOpen = () => {
    setTravelMatcherOpen(true);
  };

  const handleTravelMatcherClose = () => {
    setTravelMatcherOpen(false);
  };

  return (
    <StyledAppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => handleNavigate(page)}>
                  <ListItemIcon>{getIcon(page)}</ListItemIcon>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
              <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/weather-recommendations'); }}>
                <ListItemIcon>{/* Optionally add an icon here */}</ListItemIcon>
                <Typography textAlign="center">Weather Recommendations</Typography>
              </MenuItem>

              <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/travel-tools'); }}>
                <ListItemIcon><BuildIcon /></ListItemIcon>
                <Typography textAlign="center">Travel Tools</Typography>
              </MenuItem>
            </Menu>
          </Box>

          {/* Logo */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 600,
              color: 'white',
              textDecoration: 'none',
              letterSpacing: '0.5px',
            }}
          >
            TRAVEL APP
          </Typography>

          {/* Mobile Logo */}
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 600,
              color: 'white',
              textDecoration: 'none',
              letterSpacing: '0.5px',
            }}
          >
            TRAVEL
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <NavButton onClick={() => navigate('/')}>Home</NavButton>
            {user && (
              <>
                <NavButton onClick={() => navigate('/trips')}>My Trips</NavButton>
                <NavButton onClick={() => navigate('/explore')}>Explore</NavButton>
                <NavButton onClick={() => navigate('/travel-tools')}>Tools</NavButton>
                <NavButton onClick={() => navigate('/subscription')}>Subscription</NavButton>
                <NavButton onClick={() => navigate('/weather-recommendations')}>Weather Recommendations</NavButton>
              </>
            )}

            <NavButton onClick={() => navigate('/about')}>About</NavButton>
            <NavButton onClick={() => setEmiOpen(true)} sx={{ ml: 2 }}>
              EMI Calculator
            </NavButton>
          </Box>

          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user && (
              <>
                <RecommendationsMenu />
                {user.role === 'admin' ? (
                  <NotificationsMenu />
                ) : (
                  <NotificationBell />
                )}
                <Tooltip title="Travel Matcher">
                  <StyledIconButton
                    onClick={handleTravelMatcherOpen}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                      },
                    }}
                  >
                    <PeopleIcon />
                  </StyledIconButton>
                </Tooltip>
                <Tooltip title="AI Travel Assistant">
                  <StyledIconButton
                    onClick={handleAssistantOpen}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                      },
                    }}
                  >
                    <SmartToyIcon />
                  </StyledIconButton>
                </Tooltip>
              </>
            )}
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <StyledAvatar 
                      alt={user.name} 
                      src={authService.getAvatarUrl(user.avatar)}
                      onError={(e) => {
                        console.error('Avatar load error:', e);
                        console.log('User avatar field:', user.avatar);
                        console.log('Avatar URL:', authService.getAvatarUrl(user.avatar));
                      }}
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{
                    mt: '45px',
                    '& .MuiPaper-root': {
                      borderRadius: '16px',
                      boxShadow: '0 8px 32px rgba(60,60,120,0.15)',
                      minWidth: 240,
                      background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)',
                      p: 0,
                    },
                  }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {/* User Info Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2, background: 'linear-gradient(90deg, #2563eb 30%, #7c3aed 90%)', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                    <StyledAvatar 
                      alt={user.name} 
                      src={authService.getAvatarUrl(user.avatar)} 
                      sx={{ width: 48, height: 48, boxShadow: 2 }}
                      onError={(e) => {
                        console.error('User menu avatar load error:', e);
                        console.log('User avatar field:', user.avatar);
                        console.log('Avatar URL:', authService.getAvatarUrl(user.avatar));
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color="white">{user.name}</Typography>
                      <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>{user.email}</Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }} sx={{ py: 1.5, px: 2, '&:hover': { background: 'rgba(124,58,237,0.08)' } }}>
                    <ListItemIcon>
                      <AccountCircle fontSize="small" color="primary" />
                    </ListItemIcon>
                    <Typography textAlign="center" fontWeight={500}>Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/settings'); }} sx={{ py: 1.5, px: 2, '&:hover': { background: 'rgba(124,58,237,0.08)' } }}>
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <Typography textAlign="center" fontWeight={500}>Settings</Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2, '&:hover': { background: 'rgba(255,0,0,0.05)' } }}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <Typography textAlign="center" color="error" fontWeight={500}>Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate('/signin')}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    borderRadius: '4px',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/signup')}
                  sx={{
                    backgroundColor: 'white',
                    color: '#2196f3',
                    borderRadius: '4px',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    },
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Travel Assistant Dialog */}
      <Dialog
        open={openAssistant}
        onClose={handleAssistantClose}
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
          <TravelAssistant />
        </DialogContent>
      </Dialog>

      {/* Travel Matcher Dialog */}
      <Dialog
        open={travelMatcherOpen}
        onClose={handleTravelMatcherClose}
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
          <TravelMatcher />
        </DialogContent>
      </Dialog>

      <EMIConverter open={emiOpen} onClose={() => setEmiOpen(false)} />
    </StyledAppBar>
  );
};

export default Navbar; 