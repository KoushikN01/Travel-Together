import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  Paper,
  Tooltip,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Badge,
  Snackbar
} from '@mui/material';
import {
  ExpandMore,
  Add,
  Delete,
  Edit,
  Check,
  Close,
  Save,
  Download,
  Upload,
  Share,
  Print,
  LocalOffer,
  HealthAndSafety,
  Language,
  Wifi,
  DirectionsCar,
  Hotel,
  AttachMoney,
  Flight,
  Luggage,
  Security,
  Emergency,
  Translate,
  CurrencyExchange,
  Timeline,
  Checklist,
  CloudDownload,
  PhoneAndroid,
  Power,
  Map,
  DirectionsBus,
  LocalTaxi,
  DirectionsWalk,
  Park,
  LocalGasStation,
  Star,
  Bed,
  Room,
  Loyalty,
  HomeWork,
  Lock,
  Upgrade,
  Search
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TravelTools = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [packingDialogOpen, setPackingDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [healthDialogOpen, setHealthDialogOpen] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [planningDialogOpen, setPlanningDialogOpen] = useState(false);
  const [connectivityDialogOpen, setConnectivityDialogOpen] = useState(false);
  const [transportDialogOpen, setTransportDialogOpen] = useState(false);
  const [accommodationDialogOpen, setAccommodationDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Packing List State
  const [packingLists, setPackingLists] = useState([]);
  const [newPackingList, setNewPackingList] = useState({
    name: '',
    destination: '',
    duration: '',
    items: []
  });
  const [newItem, setNewItem] = useState({ name: '', category: '', packed: false });
  const [packingListError, setPackingListError] = useState('');
  const [itemError, setItemError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Health & Safety Form States
  const [newVaccination, setNewVaccination] = useState({ name: '', date: '', expiry: '', status: 'pending' });
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '', notes: '' });
  const [newEmergencyContact, setNewEmergencyContact] = useState({ name: '', relationship: '', phone: '', email: '' });
  const [newAllergy, setNewAllergy] = useState({ allergen: '', severity: 'mild', notes: '' });
  const [newMedicalCondition, setNewMedicalCondition] = useState({ condition: '', notes: '', medications: '' });
  const [healthFormErrors, setHealthFormErrors] = useState({});

  // Language Form States
  const [newPhrase, setNewPhrase] = useState({ english: '', translation: '', category: 'basic', notes: '' });
  const [newCustomPhrase, setNewCustomPhrase] = useState({ english: '', translation: '', notes: '' });
  const [newCulturalNote, setNewCulturalNote] = useState({ topic: '', note: '', importance: 'medium' });
  const [newPronunciation, setNewPronunciation] = useState({ word: '', pronunciation: '', notes: '' });
  const [newDictionaryEntry, setNewDictionaryEntry] = useState({ word: '', translation: '', partOfSpeech: '', example: '' });
  const [languageFormErrors, setLanguageFormErrors] = useState({});

  // Connectivity Form States
  const [newWifiSpot, setNewWifiSpot] = useState({ name: '', location: '', password: '', notes: '', strength: 'good' });
  const [newSimCard, setNewSimCard] = useState({ provider: '', plan: '', cost: '', data: '', validity: '', notes: '' });
  const [newPowerAdapter, setNewPowerAdapter] = useState({ country: '', type: '', voltage: '', notes: '' });
  const [newOfflineMap, setNewOfflineMap] = useState({ location: '', size: '', downloadDate: '', notes: '' });
  const [newTechItem, setNewTechItem] = useState({ item: '', status: 'pending', priority: 'medium', notes: '' });
  const [newPassword, setNewPassword] = useState({ service: '', username: '', password: '', notes: '' });
  const [newDevice, setNewDevice] = useState({ name: '', type: '', model: '', notes: '' });
  const [connectivityFormErrors, setConnectivityFormErrors] = useState({});

  // Transportation State
  const [transportData, setTransportData] = useState({
    destination: '',
    publicTransit: [],
    rideSharing: [],
    parkingSpots: [],
    transportPasses: [],
    savedRoutes: [],
    transportPreferences: {
      preferredMode: 'public',
      budget: '',
      accessibility: false,
      ecoFriendly: false
    }
  });

  // Transportation Form States
  const [newTransitRoute, setNewTransitRoute] = useState({ 
    from: '', 
    to: '', 
    mode: 'bus', 
    duration: '', 
    cost: '', 
    frequency: '', 
    notes: '' 
  });
  const [newRideShare, setNewRideShare] = useState({ 
    service: '', 
    from: '', 
    to: '', 
    cost: '', 
    duration: '', 
    notes: '' 
  });
  const [newParkingSpot, setNewParkingSpot] = useState({ 
    location: '', 
    type: 'street', 
    cost: '', 
    hours: '', 
    availability: 'available', 
    notes: '' 
  });
  const [newTransportPass, setNewTransportPass] = useState({ 
    name: '', 
    type: 'daily', 
    cost: '', 
    validity: '', 
    coverage: '', 
    notes: '' 
  });
  const [newSavedRoute, setNewSavedRoute] = useState({ 
    name: '', 
    from: '', 
    to: '', 
    mode: 'public', 
    duration: '', 
    cost: '', 
    notes: '' 
  });
  const [transportFormErrors, setTransportFormErrors] = useState({});

  // Accommodation State
  const [accommodationData, setAccommodationData] = useState({
    destination: '',
    hotels: [],
    loyaltyPrograms: [],
    alternativeStays: [],
    savedBookings: [],
    checkInPreferences: {
      preferredTime: '14:00',
      earlyCheckIn: false,
      lateCheckIn: false,
      specialRequests: ''
    },
    accommodationPreferences: {
      budget: '',
      type: 'hotel',
      amenities: [],
      location: '',
      rating: 3
    }
  });

  // Accommodation Form States
  const [newHotel, setNewHotel] = useState({ 
    name: '', 
    location: '', 
    price: '', 
    rating: 3, 
    amenities: [], 
    bookingRef: '', 
    checkIn: '', 
    checkOut: '', 
    notes: '' 
  });
  const [newLoyaltyProgram, setNewLoyaltyProgram] = useState({ 
    program: '', 
    memberId: '', 
    points: '', 
    tier: 'basic', 
    expiryDate: '', 
    notes: '' 
  });
  const [newAlternativeStay, setNewAlternativeStay] = useState({ 
    name: '', 
    type: 'hostel', 
    location: '', 
    price: '', 
    amenities: [], 
    bookingRef: '', 
    checkIn: '', 
    checkOut: '', 
    notes: '' 
  });
  const [newSavedBooking, setNewSavedBooking] = useState({ 
    name: '', 
    type: 'hotel', 
    location: '', 
    price: '', 
    bookingRef: '', 
    checkIn: '', 
    checkOut: '', 
    notes: '' 
  });
  const [accommodationFormErrors, setAccommodationFormErrors] = useState({});
  const [translationText, setTranslationText] = useState({ from: 'English', to: 'Spanish', text: '', result: '' });

  // Connectivity State
  const [connectivityData, setConnectivityData] = useState({
    destination: '',
    wifiSpots: [],
    simCards: [],
    powerAdapters: [],
    offlineMaps: [],
    techChecklist: [],
    savedPasswords: [],
    deviceInfo: {
      phone: '',
      laptop: '',
      camera: '',
      otherDevices: []
    }
  });

  // Budget State
  const [budget, setBudget] = useState({
    total: 0,
    spent: 0,
    categories: {
      accommodation: 0,
      transportation: 0,
      food: 0,
      activities: 0,
      shopping: 0,
      other: 0
    }
  });

  // Health State
  const [healthData, setHealthData] = useState({
    vaccinations: [],
    medications: [],
    emergencyContacts: [],
    insurance: {
      provider: '',
      policyNumber: '',
      coverage: '',
      expiryDate: '',
      phoneNumber: ''
    },
    allergies: [],
    bloodType: '',
    medicalConditions: [],
    destinationHealthInfo: {
      country: '',
      requiredVaccines: [],
      recommendedVaccines: [],
      healthAdvisories: [],
      waterSafety: '',
      foodSafety: ''
    }
  });

  // Language State
  const [languageData, setLanguageData] = useState({
    destination: '',
    selectedLanguage: '',
    phrases: [],
    emergencyPhrases: [],
    customPhrases: [],
    culturalNotes: [],
    pronunciationGuide: [],
    offlineDictionary: [],
    savedTranslations: []
  });

  // Currency Converter State
  const [currencyData, setCurrencyData] = useState({
    amount: '',
    fromCurrency: 'INR',
    toCurrency: 'USD',
    convertedAmount: null,
    exchangeRate: null
  });
  const [conversionHistory, setConversionHistory] = useState([]);

  // Visa Requirements State
  const [visaData, setVisaData] = useState({
    nationality: '',
    destination: '',
    visaRequired: null,
    visaType: '',
    processingTime: '',
    cost: '',
    requirements: []
  });

  // Document Storage State
  const [documents, setDocuments] = useState({
    passport: null,
    visa: null,
    insurance: null,
    tickets: null
  });

  // Checklist State
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, task: 'Book flights and accommodation', completed: false, description: 'Confirm all bookings and save confirmation emails' },
    { id: 2, task: 'Check visa requirements', completed: false, description: 'Apply for visas well in advance if needed' },
    { id: 3, task: 'Get travel insurance', completed: false, description: 'Cover medical, trip cancellation, and baggage' },
    { id: 4, task: 'Download offline maps', completed: false, description: 'Google Maps, local transit apps, translation apps' },
    { id: 5, task: 'Notify bank of travel plans', completed: false, description: 'Prevent card blocks while traveling' },
    { id: 6, task: 'Check vaccination requirements', completed: false, description: 'Some countries require specific vaccinations' },
    { id: 7, task: 'Pack essential items', completed: false, description: 'Medications, chargers, adapters, first aid kit' },
    { id: 8, task: 'Set up mobile data', completed: false, description: 'International roaming or local SIM card' }
  ]);

  // Check if user has pro subscription
  const isProUser = user?.subscription?.planName === 'Premium' || 
                   user?.subscription?.planName === 'Enterprise' || 
                   user?.subscription?.plan === 'Premium' || 
                   user?.subscription?.plan === 'Enterprise' ||
                   user?.subscription?.status === 'active';
  const isAuthenticated = !!user;

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedPackingLists = localStorage.getItem('travelPackingLists');
    const savedBudget = localStorage.getItem('travelBudget');
    const savedLanguageData = localStorage.getItem('travelLanguageData');
    const savedConversionHistory = localStorage.getItem('currencyConversionHistory');
    const savedChecklist = localStorage.getItem('travelChecklist');
    const savedDocuments = localStorage.getItem('travelDocuments');

    if (savedPackingLists) {
      setPackingLists(JSON.parse(savedPackingLists));
    }
    if (savedBudget) {
      setBudget(JSON.parse(savedBudget));
    }
    if (savedLanguageData) {
      setLanguageData(JSON.parse(savedLanguageData));
    }
    if (savedConversionHistory) {
      setConversionHistory(JSON.parse(savedConversionHistory));
    }
    if (savedChecklist) {
      setChecklistItems(JSON.parse(savedChecklist));
    }
    if (savedDocuments) {
      setDocuments(JSON.parse(savedDocuments));
    }
  }, []);

  // Load health data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadHealthData();
    }
  }, [isAuthenticated, user?.id]);

  // Load language data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadLanguageData();
    }
  }, [isAuthenticated, user?.id]);

  // Load connectivity data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadConnectivityData();
    }
  }, [isAuthenticated, user?.id]);

  // Load transport data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTransportData();
    }
  }, [isAuthenticated, user?.id]);

  // Load accommodation data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAccommodationData();
    }
  }, [isAuthenticated, user?.id]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('travelPackingLists', JSON.stringify(packingLists));
  }, [packingLists]);

  useEffect(() => {
    localStorage.setItem('travelBudget', JSON.stringify(budget));
  }, [budget]);



  useEffect(() => {
    localStorage.setItem('travelLanguageData', JSON.stringify(languageData));
  }, [languageData]);

  useEffect(() => {
    localStorage.setItem('currencyConversionHistory', JSON.stringify(conversionHistory));
  }, [conversionHistory]);

  useEffect(() => {
    localStorage.setItem('travelChecklist', JSON.stringify(checklistItems));
  }, [checklistItems]);

  useEffect(() => {
    localStorage.setItem('travelDocuments', JSON.stringify(documents));
  }, [documents]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleToolClick = (tool) => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please sign in to access travel tools',
        severity: 'info'
      });
      navigate('/signin');
      return;
    }

    // Check if tool requires pro subscription
    const proTools = ['Language Tools'];
    if (proTools.includes(tool.title) && !isProUser) {
      setUpgradeDialogOpen(true);
      return;
    }

    tool.setDialog(true);
  };

  const handleUpgrade = () => {
    setUpgradeDialogOpen(false);
    navigate('/subscription');
  };

  // Packing List Functions
  const handleCreatePackingList = () => {
    setPackingListError('');
    
    if (!newPackingList.name.trim()) {
      setPackingListError('Please enter a list name');
      return;
    }
    
    if (!newPackingList.destination.trim()) {
      setPackingListError('Please enter a destination');
      return;
    }

    const newList = {
      ...newPackingList,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      name: newPackingList.name.trim(),
      destination: newPackingList.destination.trim(),
      duration: newPackingList.duration || 'Not specified'
    };

    setPackingLists([...packingLists, newList]);
    setNewPackingList({ name: '', destination: '', duration: '', items: [] });
    setPackingDialogOpen(false);
    setSuccessMessage(`Packing list "${newList.name}" created successfully!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const deletePackingList = (listId) => {
    if (window.confirm('Are you sure you want to delete this packing list?')) {
      setPackingLists(packingLists.filter(list => list.id !== listId));
    }
  };

  const addItemToPackingList = (listId) => {
    setItemError('');
    
    if (!newItem.name.trim()) {
      setItemError('Please enter an item name');
      return;
    }

    const newItemToAdd = {
      ...newItem,
      id: Date.now(),
      name: newItem.name.trim(),
      category: newItem.category.trim() || 'General',
      packed: false,
      addedAt: new Date().toISOString()
    };

    setPackingLists(packingLists.map(list => 
      list.id === listId 
        ? { ...list, items: [...list.items, newItemToAdd] }
        : list
    ));
    setNewItem({ name: '', category: '', packed: false });
  };

  const toggleItemPacked = (listId, itemId) => {
    setPackingLists(packingLists.map(list =>
      list.id === listId
        ? {
            ...list,
            items: list.items.map(item =>
              item.id === itemId ? { ...item, packed: !item.packed } : item
            )
          }
        : list
    ));
  };

  const deletePackingItem = (listId, itemId) => {
    setPackingLists(packingLists.map(list =>
      list.id === listId
        ? {
            ...list,
            items: list.items.filter(item => item.id !== itemId)
          }
        : list
    ));
  };

  // Budget Functions
  const updateBudgetCategory = (category, value) => {
    setBudget({
      ...budget,
      categories: {
        ...budget.categories,
        [category]: parseFloat(value) || 0
      }
    });
  };

  const calculateTotalBudget = () => {
    return Object.values(budget.categories).reduce((sum, value) => sum + value, 0);
  };

  const calculateRemainingBudget = () => {
    return budget.total - budget.spent;
  };

  // Currency Converter Functions
  const handleCurrencyChange = (field, value) => {
    setCurrencyData(prev => ({
      ...prev,
      [field]: value,
      convertedAmount: null,
      exchangeRate: null
    }));
  };

  const convertCurrency = async () => {
    if (!currencyData.amount || parseFloat(currencyData.amount) <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid amount',
        severity: 'error'
      });
      return;
    }

    try {
      // Simulate API call with mock exchange rates
      const mockRates = {
        'INR-USD': 0.012,
        'INR-EUR': 0.011,
        'INR-GBP': 0.0095,
        'INR-THB': 0.43,
        'INR-JPY': 1.78,
        'USD-INR': 83.5,
        'USD-EUR': 0.92,
        'USD-GBP': 0.79,
        'USD-THB': 35.8,
        'USD-JPY': 148.5,
        'EUR-INR': 90.8,
        'EUR-USD': 1.09,
        'EUR-GBP': 0.86,
        'EUR-THB': 39.0,
        'EUR-JPY': 161.4,
        'GBP-INR': 105.6,
        'GBP-USD': 1.27,
        'GBP-EUR': 1.16,
        'GBP-THB': 45.3,
        'GBP-JPY': 187.9,
        'THB-INR': 2.33,
        'THB-USD': 0.028,
        'THB-EUR': 0.026,
        'THB-GBP': 0.022,
        'THB-JPY': 4.15,
        'JPY-INR': 0.56,
        'JPY-USD': 0.0067,
        'JPY-EUR': 0.0062,
        'JPY-GBP': 0.0053,
        'JPY-THB': 0.24
      };

      const rateKey = `${currencyData.fromCurrency}-${currencyData.toCurrency}`;
      const rate = mockRates[rateKey] || 1;

      const converted = parseFloat(currencyData.amount) * rate;
      
      setCurrencyData(prev => ({
        ...prev,
        convertedAmount: converted,
        exchangeRate: rate
      }));

      // Save to conversion history
      const newConversion = {
        id: Date.now(),
        fromAmount: parseFloat(currencyData.amount),
        fromCurrency: currencyData.fromCurrency,
        toAmount: converted,
        toCurrency: currencyData.toCurrency,
        exchangeRate: rate,
        timestamp: new Date().toISOString()
      };

      setConversionHistory(prev => [newConversion, ...prev.slice(0, 9)]); // Keep last 10 conversions

      setSnackbar({
        open: true,
        message: `Currency converted successfully!`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to convert currency. Please try again.',
        severity: 'error'
      });
    }
  };

  // Visa Requirements Functions
  const checkVisaRequirements = () => {
    if (!visaData.nationality.trim() || !visaData.destination.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter both nationality and destination',
        severity: 'error'
      });
      return;
    }

    // Mock visa database
    const visaDatabase = {
      'Indian-Thailand': {
        visaRequired: false,
        visaType: 'Visa on Arrival',
        processingTime: 'Immediate',
        cost: '₹2000',
        requirements: ['Valid passport (6 months validity)', 'Return ticket', 'Proof of accommodation', 'Sufficient funds']
      },
      'Indian-USA': {
        visaRequired: true,
        visaType: 'Tourist Visa (B1/B2)',
        processingTime: '3-5 weeks',
        cost: '₹12,000',
        requirements: ['DS-160 form', 'Interview appointment', 'Financial documents', 'Employment letter', 'Travel itinerary']
      },
      'Indian-UK': {
        visaRequired: true,
        visaType: 'Standard Visitor Visa',
        processingTime: '3 weeks',
        cost: '₹8,500',
        requirements: ['Online application', 'Biometric appointment', 'Financial evidence', 'Accommodation details', 'Travel plans']
      },
      'Indian-Japan': {
        visaRequired: true,
        visaType: 'Tourist Visa',
        processingTime: '5-7 days',
        cost: '₹1,500',
        requirements: ['Visa application form', 'Passport photos', 'Bank statements', 'Employment certificate', 'Travel itinerary']
      },
      'Indian-Singapore': {
        visaRequired: false,
        visaType: 'Visa-free entry',
        processingTime: 'Not applicable',
        cost: 'Free',
        requirements: ['Valid passport (6 months validity)', 'Return ticket', 'Proof of accommodation']
      },
      'Indian-Dubai': {
        visaRequired: true,
        visaType: 'Tourist Visa',
        processingTime: '3-5 days',
        cost: '₹5,000',
        requirements: ['Visa application', 'Passport copy', 'Photograph', 'Travel insurance', 'Hotel booking']
      }
    };

    const key = `${visaData.nationality}-${visaData.destination}`;
    const result = visaDatabase[key] || {
      visaRequired: 'Check required',
      visaType: 'Contact embassy',
      processingTime: 'Varies',
      cost: 'Contact embassy',
      requirements: ['Valid passport', 'Contact destination embassy for specific requirements']
    };

    setVisaData(prev => ({
      ...prev,
      ...result
    }));

    setSnackbar({
      open: true,
      message: 'Visa requirements checked successfully!',
      severity: 'success'
    });
  };

  // Document Upload Functions
  const handleDocumentUpload = (documentType, file) => {
    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
      setSnackbar({
        open: true,
        message: 'File size should be less than 5MB',
        severity: 'error'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setDocuments(prev => ({
        ...prev,
        [documentType]: {
          name: file.name,
          size: file.size,
          type: file.type,
          data: e.target.result,
          uploadedAt: new Date().toISOString()
        }
      }));

      setSnackbar({
        open: true,
        message: `${documentType} uploaded successfully!`,
        severity: 'success'
      });
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (documentType) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: null
    }));
  };

  // Checklist Functions
  const toggleChecklistItem = (itemId) => {
    setChecklistItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  };

  const resetChecklist = () => {
    setChecklistItems(prev => 
      prev.map(item => ({ ...item, completed: false }))
    );
  };

  const getChecklistProgress = () => {
    const completed = checklistItems.filter(item => item.completed).length;
    return Math.round((completed / checklistItems.length) * 100);
  };

  // Health & Safety Functions
  const loadHealthData = () => {
    if (isAuthenticated) {
      const saved = localStorage.getItem(`healthData_${user?.id}`);
      if (saved) {
        setHealthData(JSON.parse(saved));
      }
    }
  };

  const saveHealthData = (data) => {
    if (isAuthenticated) {
      localStorage.setItem(`healthData_${user?.id}`, JSON.stringify(data));
    }
  };

  const addVaccination = () => {
    if (!newVaccination.name.trim()) {
      setHealthFormErrors(prev => ({ ...prev, vaccination: 'Vaccination name is required' }));
      return;
    }
    
    const vaccination = {
      id: Date.now(),
      ...newVaccination,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...healthData,
      vaccinations: [...healthData.vaccinations, vaccination]
    };
    
    setHealthData(updatedData);
    saveHealthData(updatedData);
    setNewVaccination({ name: '', date: '', expiry: '', status: 'pending' });
    setHealthFormErrors(prev => ({ ...prev, vaccination: '' }));
    setSnackbar({ open: true, message: 'Vaccination added successfully!', severity: 'success' });
  };

  const removeVaccination = (id) => {
    const updatedData = {
      ...healthData,
      vaccinations: healthData.vaccinations.filter(v => v.id !== id)
    };
    setHealthData(updatedData);
    saveHealthData(updatedData);
    setSnackbar({ open: true, message: 'Vaccination removed!', severity: 'info' });
  };

  const addMedication = () => {
    if (!newMedication.name.trim()) {
      setHealthFormErrors(prev => ({ ...prev, medication: 'Medication name is required' }));
      return;
    }
    
    const medication = {
      id: Date.now(),
      ...newMedication,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...healthData,
      medications: [...healthData.medications, medication]
    };
    
    setHealthData(updatedData);
    saveHealthData(updatedData);
    setNewMedication({ name: '', dosage: '', frequency: '', notes: '' });
    setHealthFormErrors(prev => ({ ...prev, medication: '' }));
    setSnackbar({ open: true, message: 'Medication added successfully!', severity: 'success' });
  };

  const removeMedication = (id) => {
    const updatedData = {
      ...healthData,
      medications: healthData.medications.filter(m => m.id !== id)
    };
    setHealthData(updatedData);
    saveHealthData(updatedData);
    setSnackbar({ open: true, message: 'Medication removed!', severity: 'info' });
  };

  const addEmergencyContact = () => {
    if (!newEmergencyContact.name.trim() || !newEmergencyContact.phone.trim()) {
      setHealthFormErrors(prev => ({ ...prev, emergencyContact: 'Name and phone are required' }));
      return;
    }
    
    const contact = {
      id: Date.now(),
      ...newEmergencyContact,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...healthData,
      emergencyContacts: [...healthData.emergencyContacts, contact]
    };
    
    setHealthData(updatedData);
    saveHealthData(updatedData);
    setNewEmergencyContact({ name: '', relationship: '', phone: '', email: '' });
    setHealthFormErrors(prev => ({ ...prev, emergencyContact: '' }));
    setSnackbar({ open: true, message: 'Emergency contact added successfully!', severity: 'success' });
  };

  const removeEmergencyContact = (id) => {
    const updatedData = {
      ...healthData,
      emergencyContacts: healthData.emergencyContacts.filter(c => c.id !== id)
    };
    setHealthData(updatedData);
    saveHealthData(updatedData);
    setSnackbar({ open: true, message: 'Emergency contact removed!', severity: 'info' });
  };

  const addAllergy = () => {
    if (!newAllergy.allergen.trim()) {
      setHealthFormErrors(prev => ({ ...prev, allergy: 'Allergen name is required' }));
      return;
    }
    
    const allergy = {
      id: Date.now(),
      ...newAllergy,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...healthData,
      allergies: [...healthData.allergies, allergy]
    };
    
    setHealthData(updatedData);
    saveHealthData(updatedData);
    setNewAllergy({ allergen: '', severity: 'mild', notes: '' });
    setHealthFormErrors(prev => ({ ...prev, allergy: '' }));
    setSnackbar({ open: true, message: 'Allergy added successfully!', severity: 'success' });
  };

  const removeAllergy = (id) => {
    const updatedData = {
      ...healthData,
      allergies: healthData.allergies.filter(a => a.id !== id)
    };
    setHealthData(updatedData);
    saveHealthData(updatedData);
    setSnackbar({ open: true, message: 'Allergy removed!', severity: 'info' });
  };

  const addMedicalCondition = () => {
    if (!newMedicalCondition.condition.trim()) {
      setHealthFormErrors(prev => ({ ...prev, medicalCondition: 'Condition name is required' }));
      return;
    }
    
    const condition = {
      id: Date.now(),
      ...newMedicalCondition,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...healthData,
      medicalConditions: [...healthData.medicalConditions, condition]
    };
    
    setHealthData(updatedData);
    saveHealthData(updatedData);
    setNewMedicalCondition({ condition: '', notes: '', medications: '' });
    setHealthFormErrors(prev => ({ ...prev, medicalCondition: '' }));
    setSnackbar({ open: true, message: 'Medical condition added successfully!', severity: 'success' });
  };

  const removeMedicalCondition = (id) => {
    const updatedData = {
      ...healthData,
      medicalConditions: healthData.medicalConditions.filter(c => c.id !== id)
    };
    setHealthData(updatedData);
    saveHealthData(updatedData);
    setSnackbar({ open: true, message: 'Medical condition removed!', severity: 'info' });
  };

  const updateInsurance = (field, value) => {
    const updatedData = {
      ...healthData,
      insurance: { ...healthData.insurance, [field]: value }
    };
    setHealthData(updatedData);
    saveHealthData(updatedData);
  };

  const updateBloodType = (bloodType) => {
    const updatedData = { ...healthData, bloodType };
    setHealthData(updatedData);
    saveHealthData(updatedData);
    setSnackbar({ open: true, message: 'Blood type updated!', severity: 'success' });
  };

  const checkDestinationHealth = (country) => {
    // Mock health data for different countries
    const healthDatabase = {
      'thailand': {
        requiredVaccines: ['Yellow Fever (if coming from endemic area)'],
        recommendedVaccines: ['Hepatitis A', 'Hepatitis B', 'Typhoid', 'Japanese Encephalitis'],
        healthAdvisories: ['Dengue fever is common', 'Avoid raw seafood', 'Use mosquito protection'],
        waterSafety: 'Tap water is not safe to drink. Use bottled water.',
        foodSafety: 'Avoid street food if you have sensitive stomach. Cooked food is generally safe.'
      },
      'japan': {
        requiredVaccines: [],
        recommendedVaccines: ['Hepatitis A', 'Hepatitis B', 'Japanese Encephalitis'],
        healthAdvisories: ['High hygiene standards', 'Medical care is excellent', 'Language barrier may exist'],
        waterSafety: 'Tap water is safe to drink throughout Japan.',
        foodSafety: 'Food safety standards are very high. Sushi and raw fish are safe.'
      },
      'usa': {
        requiredVaccines: [],
        recommendedVaccines: ['COVID-19', 'Flu shot', 'Tetanus'],
        healthAdvisories: ['Medical care is expensive', 'Insurance is recommended', '911 for emergencies'],
        waterSafety: 'Tap water is safe to drink in most areas.',
        foodSafety: 'Food safety standards are high. Follow normal food safety practices.'
      },
      'india': {
        requiredVaccines: ['Yellow Fever (if coming from endemic area)'],
        recommendedVaccines: ['Hepatitis A', 'Hepatitis B', 'Typhoid', 'Polio'],
        healthAdvisories: ['Avoid street food initially', 'Use bottled water', 'Carry anti-diarrheal medication'],
        waterSafety: 'Tap water is not safe to drink. Use bottled or boiled water.',
        foodSafety: 'Be cautious with street food. Stick to well-cooked, hot food.'
      }
    };

    const countryKey = country.toLowerCase();
    if (healthDatabase[countryKey]) {
      const updatedData = {
        ...healthData,
        destinationHealthInfo: {
          country,
          ...healthDatabase[countryKey]
        }
      };
      setHealthData(updatedData);
      saveHealthData(updatedData);
      setSnackbar({ open: true, message: `Health information loaded for ${country}!`, severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Country not found in database. Please consult official sources.', severity: 'warning' });
    }
  };

  const downloadHealthReport = () => {
    const report = {
      personalInfo: {
        bloodType: healthData.bloodType,
        allergies: healthData.allergies,
        medicalConditions: healthData.medicalConditions
      },
      vaccinations: healthData.vaccinations,
      medications: healthData.medications,
      emergencyContacts: healthData.emergencyContacts,
      insurance: healthData.insurance,
      destinationHealth: healthData.destinationHealthInfo,
      generatedDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Health report downloaded!', severity: 'success' });
  };

  // Language & Communication Functions
  const loadLanguageData = () => {
    if (isAuthenticated) {
      const saved = localStorage.getItem(`languageData_${user?.id}`);
      if (saved) {
        setLanguageData(JSON.parse(saved));
      }
    }
  };

  const saveLanguageData = (data) => {
    if (isAuthenticated) {
      localStorage.setItem(`languageData_${user?.id}`, JSON.stringify(data));
    }
  };

  const addPhrase = () => {
    if (!newPhrase.english.trim() || !newPhrase.translation.trim()) {
      setLanguageFormErrors(prev => ({ ...prev, phrase: 'English and translation are required' }));
      return;
    }
    
    const phrase = {
      id: Date.now(),
      ...newPhrase,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...languageData,
      phrases: [...languageData.phrases, phrase]
    };
    
    setLanguageData(updatedData);
    saveLanguageData(updatedData);
    setNewPhrase({ english: '', translation: '', category: 'basic', notes: '' });
    setLanguageFormErrors(prev => ({ ...prev, phrase: '' }));
    setSnackbar({ open: true, message: 'Phrase added successfully!', severity: 'success' });
  };

  const removePhrase = (id) => {
    const updatedData = {
      ...languageData,
      phrases: languageData.phrases.filter(p => p.id !== id)
    };
    setLanguageData(updatedData);
    saveLanguageData(updatedData);
    setSnackbar({ open: true, message: 'Phrase removed!', severity: 'info' });
  };

  const addCustomPhrase = () => {
    if (!newCustomPhrase.english.trim() || !newCustomPhrase.translation.trim()) {
      setLanguageFormErrors(prev => ({ ...prev, customPhrase: 'English and translation are required' }));
      return;
    }
    
    const phrase = {
      id: Date.now(),
      ...newCustomPhrase,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...languageData,
      customPhrases: [...languageData.customPhrases, phrase]
    };
    
    setLanguageData(updatedData);
    saveLanguageData(updatedData);
    setNewCustomPhrase({ english: '', translation: '', notes: '' });
    setLanguageFormErrors(prev => ({ ...prev, customPhrase: '' }));
    setSnackbar({ open: true, message: 'Custom phrase added successfully!', severity: 'success' });
  };

  const removeCustomPhrase = (id) => {
    const updatedData = {
      ...languageData,
      customPhrases: languageData.customPhrases.filter(p => p.id !== id)
    };
    setLanguageData(updatedData);
    saveLanguageData(updatedData);
    setSnackbar({ open: true, message: 'Custom phrase removed!', severity: 'info' });
  };

  const addCulturalNote = () => {
    if (!newCulturalNote.topic.trim() || !newCulturalNote.note.trim()) {
      setLanguageFormErrors(prev => ({ ...prev, culturalNote: 'Topic and note are required' }));
      return;
    }
    
    const note = {
      id: Date.now(),
      ...newCulturalNote,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...languageData,
      culturalNotes: [...languageData.culturalNotes, note]
    };
    
    setLanguageData(updatedData);
    saveLanguageData(updatedData);
    setNewCulturalNote({ topic: '', note: '', importance: 'medium' });
    setLanguageFormErrors(prev => ({ ...prev, culturalNote: '' }));
    setSnackbar({ open: true, message: 'Cultural note added successfully!', severity: 'success' });
  };

  const removeCulturalNote = (id) => {
    const updatedData = {
      ...languageData,
      culturalNotes: languageData.culturalNotes.filter(n => n.id !== id)
    };
    setLanguageData(updatedData);
    saveLanguageData(updatedData);
    setSnackbar({ open: true, message: 'Cultural note removed!', severity: 'info' });
  };

  const addPronunciation = () => {
    if (!newPronunciation.word.trim() || !newPronunciation.pronunciation.trim()) {
      setLanguageFormErrors(prev => ({ ...prev, pronunciation: 'Word and pronunciation are required' }));
      return;
    }
    
    const pronunciation = {
      id: Date.now(),
      ...newPronunciation,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...languageData,
      pronunciationGuide: [...languageData.pronunciationGuide, pronunciation]
    };
    
    setLanguageData(updatedData);
    saveLanguageData(updatedData);
    setNewPronunciation({ word: '', pronunciation: '', notes: '' });
    setLanguageFormErrors(prev => ({ ...prev, pronunciation: '' }));
    setSnackbar({ open: true, message: 'Pronunciation added successfully!', severity: 'success' });
  };

  const removePronunciation = (id) => {
    const updatedData = {
      ...languageData,
      pronunciationGuide: languageData.pronunciationGuide.filter(p => p.id !== id)
    };
    setLanguageData(updatedData);
    saveLanguageData(updatedData);
    setSnackbar({ open: true, message: 'Pronunciation removed!', severity: 'info' });
  };

  const addDictionaryEntry = () => {
    if (!newDictionaryEntry.word.trim() || !newDictionaryEntry.translation.trim()) {
      setLanguageFormErrors(prev => ({ ...prev, dictionary: 'Word and translation are required' }));
      return;
    }
    
    const entry = {
      id: Date.now(),
      ...newDictionaryEntry,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...languageData,
      offlineDictionary: [...languageData.offlineDictionary, entry]
    };
    
    setLanguageData(updatedData);
    saveLanguageData(updatedData);
    setNewDictionaryEntry({ word: '', translation: '', partOfSpeech: '', example: '' });
    setLanguageFormErrors(prev => ({ ...prev, dictionary: '' }));
    setSnackbar({ open: true, message: 'Dictionary entry added successfully!', severity: 'success' });
  };

  const removeDictionaryEntry = (id) => {
    const updatedData = {
      ...languageData,
      offlineDictionary: languageData.offlineDictionary.filter(d => d.id !== id)
    };
    setLanguageData(updatedData);
    saveLanguageData(updatedData);
    setSnackbar({ open: true, message: 'Dictionary entry removed!', severity: 'info' });
  };

  const translateText = async () => {
    if (!translationText.text.trim()) {
      setLanguageFormErrors(prev => ({ ...prev, translation: 'Text to translate is required' }));
      return;
    }

    // Mock translation - in a real app, this would call a translation API
    const mockTranslations = {
      'Spanish': {
        'Hello': 'Hola',
        'Thank you': 'Gracias',
        'Goodbye': 'Adiós',
        'Please': 'Por favor',
        'Excuse me': 'Disculpe',
        'Where is the bathroom?': '¿Dónde está el baño?',
        'I need help': 'Necesito ayuda',
        'How much does this cost?': '¿Cuánto cuesta esto?'
      },
      'French': {
        'Hello': 'Bonjour',
        'Thank you': 'Merci',
        'Goodbye': 'Au revoir',
        'Please': 'S\'il vous plaît',
        'Excuse me': 'Excusez-moi',
        'Where is the bathroom?': 'Où sont les toilettes?',
        'I need help': 'J\'ai besoin d\'aide',
        'How much does this cost?': 'Combien ça coûte?'
      },
      'Japanese': {
        'Hello': 'こんにちは',
        'Thank you': 'ありがとう',
        'Goodbye': 'さようなら',
        'Please': 'お願いします',
        'Excuse me': 'すみません',
        'Where is the bathroom?': 'トイレはどこですか？',
        'I need help': '助けてください',
        'How much does this cost?': 'これはいくらですか？'
      },
      'German': {
        'Hello': 'Hallo',
        'Thank you': 'Danke',
        'Goodbye': 'Auf Wiedersehen',
        'Please': 'Bitte',
        'Excuse me': 'Entschuldigung',
        'Where is the bathroom?': 'Wo ist die Toilette?',
        'I need help': 'Ich brauche Hilfe',
        'How much does this cost?': 'Wie viel kostet das?'
      },
      'Hindi': {
        'Hello': 'नमस्ते',
        'Thank you': 'धन्यवाद',
        'Goodbye': 'अलविदा',
        'Please': 'कृपया',
        'Excuse me': 'माफ़ कीजिए',
        'Where is the bathroom?': 'बाथरूम कहाँ है?',
        'I need help': 'मुझे मदद चाहिए',
        'How much does this cost?': 'यह कितने का है?',
        'Yes': 'हाँ',
        'No': 'नहीं',
        'Good morning': 'सुप्रभात',
        'Good night': 'शुभ रात्रि',
        'Water': 'पानी',
        'Food': 'खाना',
        'Where is the station?': 'स्टेशन कहाँ है?'
      },
      'Kannada': {
        'Hello': 'ನಮಸ್ಕಾರ',
        'Thank you': 'ಧನ್ಯವಾದ',
        'Goodbye': 'ವಿದಾಯ',
        'Please': 'ದಯವಿಟ್ಟು',
        'Excuse me': 'ಕ್ಷಮಿಸಿ',
        'Where is the bathroom?': 'ಸ್ನಾನಗೃಹ ಎಲ್ಲಿ?',
        'I need help': 'ನನಗೆ ಸಹಾಯ ಬೇಕು',
        'How much does this cost?': 'ಇದು ಎಷ್ಟು ಬೆಲೆ?',
        'Yes': 'ಹೌದು',
        'No': 'ಇಲ್ಲ',
        'Good morning': 'ಶುಭೋದಯ',
        'Good night': 'ಶುಭ ರಾತ್ರಿ',
        'Water': 'ನೀರು',
        'Food': 'ಊಟ',
        'Where is the station?': 'ನಿಲ್ದಾಣ ಎಲ್ಲಿ?'
      },
      'Telugu': {
        'Hello': 'నమస్కారం',
        'Thank you': 'ధన్యవాదాలు',
        'Goodbye': 'వీడ్కోలు',
        'Please': 'దయచేసి',
        'Excuse me': 'క్షమించండి',
        'Where is the bathroom?': 'స్నానగది ఎక్కడ ఉంది?',
        'I need help': 'నాకు సహాయం కావాలి',
        'How much does this cost?': 'ఇది ఎంత ఖర్చు?',
        'Yes': 'అవును',
        'No': 'లేదు',
        'Good morning': 'శుభోదయం',
        'Good night': 'శుభ రాత్రి',
        'Water': 'నీరు',
        'Food': 'ఆహారం',
        'Where is the station?': 'స్టేషన్ ఎక్కడ ఉంది?'
      },
      'Tamil': {
        'Hello': 'வணக்கம்',
        'Thank you': 'நன்றி',
        'Goodbye': 'பிரியாவிடை',
        'Please': 'தயவுசெய்து',
        'Excuse me': 'மன்னிக்கவும்',
        'Where is the bathroom?': 'குளியலறை எங்கே?',
        'I need help': 'எனக்கு உதவி தேவை',
        'How much does this cost?': 'இது எவ்வளவு?',
        'Yes': 'ஆம்',
        'No': 'இல்லை',
        'Good morning': 'காலை வணக்கம்',
        'Good night': 'இரவு வணக்கம்',
        'Water': 'தண்ணீர்',
        'Food': 'உணவு',
        'Where is the station?': 'நிலையம் எங்கே?'
      },
      'Bengali': {
        'Hello': 'হ্যালো',
        'Thank you': 'ধন্যবাদ',
        'Goodbye': 'বিদায়',
        'Please': 'অনুগ্রহ করে',
        'Excuse me': 'মাফ করবেন',
        'Where is the bathroom?': 'বাথরুম কোথায়?',
        'I need help': 'আমার সাহায্য লাগছে',
        'How much does this cost?': 'এটা কত টাকা?',
        'Yes': 'হ্যাঁ',
        'No': 'না',
        'Good morning': 'সুপ্রভাত',
        'Good night': 'শুভ রাত্রি',
        'Water': 'জল',
        'Food': 'খাবার',
        'Where is the station?': 'স্টেশন কোথায়?'
      },
      'Marathi': {
        'Hello': 'नमस्कार',
        'Thank you': 'आभार',
        'Goodbye': 'धन्यवाद',
        'Please': 'कृपया',
        'Excuse me': 'माफ करा',
        'Where is the bathroom?': 'स्नानगृह कुठे आहे?',
        'I need help': 'मला मदत हवी आहे',
        'How much does this cost?': 'हे किती आहे?',
        'Yes': 'होय',
        'No': 'नाही',
        'Good morning': 'सुप्रभात',
        'Good night': 'शुभ रात्री',
        'Water': 'पाणी',
        'Food': 'जेवण',
        'Where is the station?': 'स्टेशन कुठे आहे?'
      }
    };

    const targetLang = translationText.to;
    const inputText = translationText.text;
    
    if (mockTranslations[targetLang] && mockTranslations[targetLang][inputText]) {
      const result = mockTranslations[targetLang][inputText];
      setTranslationText(prev => ({ ...prev, result }));
      
      // Save to translation history
      const translation = {
        id: Date.now(),
        from: translationText.from,
        to: translationText.to,
        original: inputText,
        translated: result,
        date: new Date().toISOString()
      };
      
      const updatedData = {
        ...languageData,
        savedTranslations: [...languageData.savedTranslations, translation]
      };
      setLanguageData(updatedData);
      saveLanguageData(updatedData);
      
      setSnackbar({ open: true, message: 'Translation completed!', severity: 'success' });
    } else {
      setTranslationText(prev => ({ ...prev, result: 'Translation not available in demo mode' }));
      setSnackbar({ open: true, message: 'Translation not available for this text in demo mode', severity: 'warning' });
    }
    
    setLanguageFormErrors(prev => ({ ...prev, translation: '' }));
  };

  const removeSavedTranslation = (id) => {
    const updatedData = {
      ...languageData,
      savedTranslations: languageData.savedTranslations.filter(t => t.id !== id)
    };
    setLanguageData(updatedData);
    saveLanguageData(updatedData);
    setSnackbar({ open: true, message: 'Translation removed from history!', severity: 'info' });
  };

  const loadCommonPhrases = (language) => {
    const commonPhrases = {
      'Spanish': [
        { english: 'Hello', translation: 'Hola', category: 'basic' },
        { english: 'Goodbye', translation: 'Adiós', category: 'basic' },
        { english: 'Thank you', translation: 'Gracias', category: 'basic' },
        { english: 'Please', translation: 'Por favor', category: 'basic' },
        { english: 'Excuse me', translation: 'Disculpe', category: 'basic' },
        { english: 'Where is the bathroom?', translation: '¿Dónde está el baño?', category: 'emergency' },
        { english: 'I need help', translation: 'Necesito ayuda', category: 'emergency' },
        { english: 'How much does this cost?', translation: '¿Cuánto cuesta esto?', category: 'shopping' },
        { english: 'I don\'t understand', translation: 'No entiendo', category: 'basic' },
        { english: 'Do you speak English?', translation: '¿Habla inglés?', category: 'basic' }
      ],
      'French': [
        { english: 'Hello', translation: 'Bonjour', category: 'basic' },
        { english: 'Goodbye', translation: 'Au revoir', category: 'basic' },
        { english: 'Thank you', translation: 'Merci', category: 'basic' },
        { english: 'Please', translation: 'S\'il vous plaît', category: 'basic' },
        { english: 'Excuse me', translation: 'Excusez-moi', category: 'basic' },
        { english: 'Where is the bathroom?', translation: 'Où sont les toilettes?', category: 'emergency' },
        { english: 'I need help', translation: 'J\'ai besoin d\'aide', category: 'emergency' },
        { english: 'How much does this cost?', translation: 'Combien ça coûte?', category: 'shopping' },
        { english: 'I don\'t understand', translation: 'Je ne comprends pas', category: 'basic' },
        { english: 'Do you speak English?', translation: 'Parlez-vous anglais?', category: 'basic' }
      ],
      'Japanese': [
        { english: 'Hello', translation: 'こんにちは', category: 'basic' },
        { english: 'Goodbye', translation: 'さようなら', category: 'basic' },
        { english: 'Thank you', translation: 'ありがとう', category: 'basic' },
        { english: 'Please', translation: 'お願いします', category: 'basic' },
        { english: 'Excuse me', translation: 'すみません', category: 'basic' },
        { english: 'Where is the bathroom?', translation: 'トイレはどこですか？', category: 'emergency' },
        { english: 'I need help', translation: '助けてください', category: 'emergency' },
        { english: 'How much does this cost?', translation: 'これはいくらですか？', category: 'shopping' },
        { english: 'I don\'t understand', translation: 'わかりません', category: 'basic' },
        { english: 'Do you speak English?', translation: '英語を話しますか？', category: 'basic' }
      ],
      'German': [
        { english: 'Hello', translation: 'Hallo', category: 'basic' },
        { english: 'Goodbye', translation: 'Auf Wiedersehen', category: 'basic' },
        { english: 'Thank you', translation: 'Danke', category: 'basic' },
        { english: 'Please', translation: 'Bitte', category: 'basic' },
        { english: 'Excuse me', translation: 'Entschuldigung', category: 'basic' },
        { english: 'Where is the bathroom?', translation: 'Wo ist die Toilette?', category: 'emergency' },
        { english: 'I need help', translation: 'Ich brauche Hilfe', category: 'emergency' },
        { english: 'How much does this cost?', translation: 'Wie viel kostet das?', category: 'shopping' },
        { english: 'I don\'t understand', translation: 'Ich verstehe nicht', category: 'basic' },
        { english: 'Do you speak English?', translation: 'Sprechen Sie Englisch?', category: 'basic' }
      ],
      'Hindi': [
        { english: 'Hello', translation: 'नमस्ते', category: 'basic' },
        { english: 'Goodbye', translation: 'अलविदा', category: 'basic' },
        { english: 'Thank you', translation: 'धन्यवाद', category: 'basic' },
        { english: 'Please', translation: 'कृपया', category: 'basic' },
        { english: 'Excuse me', translation: 'माफ़ कीजिए', category: 'basic' },
        { english: 'Where is the bathroom?', translation: 'बाथरूम कहाँ है?', category: 'emergency' },
        { english: 'I need help', translation: 'मुझे मदद चाहिए', category: 'emergency' },
        { english: 'How much does this cost?', translation: 'यह कितने का है?', category: 'shopping' },
        { english: 'I don\'t understand', translation: 'मैं समझ नहीं पा रहा हूँ', category: 'basic' },
        { english: 'Do you speak English?', translation: 'क्या आप अंग्रेज़ी बोलते हैं?', category: 'basic' },
        { english: 'Yes', translation: 'हाँ', category: 'basic' },
        { english: 'No', translation: 'नहीं', category: 'basic' },
        { english: 'Good morning', translation: 'सुप्रभात', category: 'basic' },
        { english: 'Good night', translation: 'शुभ रात्रि', category: 'basic' },
        { english: 'Water', translation: 'पानी', category: 'food' },
        { english: 'Food', translation: 'खाना', category: 'food' },
        { english: 'Where is the station?', translation: 'स्टेशन कहाँ है?', category: 'transport' }
      ],
      'Kannada': [
        { english: 'Hello', translation: 'ನಮಸ್ಕಾರ', category: 'basic' },
        { english: 'Goodbye', translation: 'ವಿದಾಯ', category: 'basic' },
        { english: 'Thank you', translation: 'ಧನ್ಯವಾದ', category: 'basic' },
        { english: 'Please', translation: 'ದಯವಿಟ್ಟು', category: 'basic' },
        { english: 'Excuse me', translation: 'ಕ್ಷಮಿಸಿ', category: 'basic' },
        { english: 'Where is the bathroom?', translation: 'ಸ್ನಾನಗೃಹ ಎಲ್ಲಿ?', category: 'emergency' },
        { english: 'I need help', translation: 'ನನಗೆ ಸಹಾಯ ಬೇಕು', category: 'emergency' },
        { english: 'How much does this cost?', translation: 'ಇದು ಎಷ್ಟು ಬೆಲೆ?', category: 'shopping' },
        { english: 'I don\'t understand', translation: 'ನನಗೆ ಅರ್ಥವಾಗುತ್ತಿಲ್ಲ', category: 'basic' },
        { english: 'Do you speak English?', translation: 'ನೀವು ಇಂಗ್ಲಿಷ್ ಮಾತನಾಡುತ್ತೀರಾ?', category: 'basic' },
        { english: 'Yes', translation: 'ಹೌದು', category: 'basic' },
        { english: 'No', translation: 'ಇಲ್ಲ', category: 'basic' },
        { english: 'Good morning', translation: 'ಶುಭೋದಯ', category: 'basic' },
        { english: 'Good night', translation: 'ಶುಭ ರಾತ್ರಿ', category: 'basic' },
        { english: 'Water', translation: 'ನೀರು', category: 'food' },
        { english: 'Food', translation: 'ಊಟ', category: 'food' },
        { english: 'Where is the station?', translation: 'ನಿಲ್ದಾಣ ಎಲ್ಲಿ?', category: 'transport' }
      ],
      'Telugu': [
        { english: 'Hello', translation: 'నమస్కారం', category: 'basic' },
        { english: 'Goodbye', translation: 'వీడ్కోలు', category: 'basic' },
        { english: 'Thank you', translation: 'ధన్యవాదాలు', category: 'basic' },
        { english: 'Please', translation: 'దయచేసి', category: 'basic' },
        { english: 'Excuse me', translation: 'క్షమించండి', category: 'basic' },
        { english: 'Where is the bathroom?', translation: 'స్నానగది ఎక్కడ ఉంది?', category: 'emergency' },
        { english: 'I need help', translation: 'నాకు సహాయం కావాలి', category: 'emergency' },
        { english: 'How much does this cost?', translation: 'ఇది ఎంత ఖర్చు?', category: 'shopping' },
        { english: 'I don\'t understand', translation: 'నాకు అర్థం కాలేదు', category: 'basic' },
        { english: 'Do you speak English?', translation: 'మీరు ఇంగ్లీష్ మాట్లాడతారా?', category: 'basic' },
        { english: 'Yes', translation: 'అవును', category: 'basic' },
        { english: 'No', translation: 'లేదు', category: 'basic' },
        { english: 'Good morning', translation: 'శుభోదయం', category: 'basic' },
        { english: 'Good night', translation: 'శుభ రాత్రి', category: 'basic' },
        { english: 'Water', translation: 'నీరు', category: 'food' },
        { english: 'Food', translation: 'ఆహారం', category: 'food' },
        { english: 'Where is the station?', translation: 'స్టేషన్ ఎక్కడ ఉంది?', category: 'transport' }
      ],
      'Tamil': [
        { english: 'Hello', translation: 'வணக்கம்', category: 'basic' },
        { english: 'Goodbye', translation: 'பிரியாவிடை', category: 'basic' },
        { english: 'Thank you', translation: 'நன்றி', category: 'basic' },
        { english: 'Please', translation: 'தயவுசெய்து', category: 'basic' },
        { english: 'Excuse me', translation: 'மன்னிக்கவும்', category: 'basic' },
        { english: 'Where is the bathroom?', translation: 'குளியலறை எங்கே?', category: 'emergency' },
        { english: 'I need help', translation: 'எனக்கு உதவி தேவை', category: 'emergency' },
        { english: 'How much does this cost?', translation: 'இது எவ்வளவு?', category: 'shopping' },
        { english: 'I don\'t understand', translation: 'எனக்கு புரியவில்லை', category: 'basic' },
        { english: 'Do you speak English?', translation: 'நீங்கள் ஆங்கிலம் பேசுகிறீர்களா?', category: 'basic' },
        { english: 'Yes', translation: 'ஆம்', category: 'basic' },
        { english: 'No', translation: 'இல்லை', category: 'basic' },
        { english: 'Good morning', translation: 'காலை வணக்கம்', category: 'basic' },
        { english: 'Good night', translation: 'இரவு வணக்கம்', category: 'basic' },
        { english: 'Water', translation: 'தண்ணீர்', category: 'food' },
        { english: 'Food', translation: 'உணவு', category: 'food' },
        { english: 'Where is the station?', translation: 'நிலையம் எங்கே?', category: 'transport' }
      ],
      'Bengali': [
        { english: 'Hello', translation: 'হ্যালো', category: 'basic' },
        { english: 'Goodbye', translation: 'বিদায়', category: 'basic' },
        { english: 'Thank you', translation: 'ধন্যবাদ', category: 'basic' },
        { english: 'Please', translation: 'অনুগ্রহ করে', category: 'basic' },
        { english: 'Excuse me', translation: 'মাফ করবেন', category: 'basic' },
        { english: 'Where is the bathroom?', translation: 'বাথরুম কোথায়?', category: 'emergency' },
        { english: 'I need help', translation: 'আমার সাহায্য লাগছে', category: 'emergency' },
        { english: 'How much does this cost?', translation: 'এটা কত টাকা?', category: 'shopping' },
        { english: 'I don\'t understand', translation: 'আমি বুঝতে পারছি না', category: 'basic' },
        { english: 'Do you speak English?', translation: 'আপনি কি ইংরেজি বলতে পারেন?', category: 'basic' },
        { english: 'Yes', translation: 'হ্যাঁ', category: 'basic' },
        { english: 'No', translation: 'না', category: 'basic' },
        { english: 'Good morning', translation: 'সুপ্রভাত', category: 'basic' },
        { english: 'Good night', translation: 'শুভ রাত্রি', category: 'basic' },
        { english: 'Water', translation: 'জল', category: 'food' },
        { english: 'Food', translation: 'খাবার', category: 'food' },
        { english: 'Where is the station?', translation: 'স্টেশন কোথায়?', category: 'transport' }
      ],
      'Marathi': [
        { english: 'Hello', translation: 'नमस्कार', category: 'basic' },
        { english: 'Goodbye', translation: 'धन्यवाद', category: 'basic' },
        { english: 'Thank you', translation: 'आभार', category: 'basic' },
        { english: 'Please', translation: 'कृपया', category: 'basic' },
        { english: 'Excuse me', translation: 'माफ करा', category: 'basic' },
        { english: 'Where is the bathroom?', translation: 'स्नानगृह कुठे आहे?', category: 'emergency' },
        { english: 'I need help', translation: 'मला मदत हवी आहे', category: 'emergency' },
        { english: 'How much does this cost?', translation: 'हे किती आहे?', category: 'shopping' },
        { english: 'I don\'t understand', translation: 'मला समजत नाही', category: 'basic' },
        { english: 'Do you speak English?', translation: 'तुम्ही इंग्रजी बोलता का?', category: 'basic' },
        { english: 'Yes', translation: 'होय', category: 'basic' },
        { english: 'No', translation: 'नाही', category: 'basic' },
        { english: 'Good morning', translation: 'सुप्रभात', category: 'basic' },
        { english: 'Good night', translation: 'शुभ रात्री', category: 'basic' },
        { english: 'Water', translation: 'पाणी', category: 'food' },
        { english: 'Food', translation: 'जेवण', category: 'food' },
        { english: 'Where is the station?', translation: 'स्टेशन कुठे आहे?', category: 'transport' }
      ]
    };

    if (commonPhrases[language]) {
      const phrasesWithIds = commonPhrases[language].map(phrase => ({
        ...phrase,
        id: Date.now() + Math.random(),
        addedDate: new Date().toISOString()
      }));
      
      const updatedData = {
        ...languageData,
        selectedLanguage: language,
        phrases: [...languageData.phrases, ...phrasesWithIds]
      };
      
      setLanguageData(updatedData);
      saveLanguageData(updatedData);
      setSnackbar({ open: true, message: `Common phrases for ${language} loaded!`, severity: 'success' });
      
      // Load cultural notes for Indian languages
      if (['Hindi', 'Kannada', 'Telugu', 'Tamil', 'Bengali', 'Marathi'].includes(language)) {
        loadIndianCulturalNotes(language);
      }
    }
  };

  const loadIndianCulturalNotes = (language) => {
    const culturalNotes = {
      'Hindi': [
        { topic: 'Greetings', note: 'Use "नमस्ते" (Namaste) with folded hands for formal greetings. "जय श्री कृष्णा" is common in some regions.', importance: 'high' },
        { topic: 'Dining', note: 'Eating with right hand is traditional. Remove shoes before entering homes. Say "जय श्री कृष्णा" before meals.', importance: 'medium' },
        { topic: 'Respect', note: 'Use "आप" (aap) for formal address, "तुम" (tum) for informal. Touch elders\' feet as a sign of respect.', importance: 'high' },
        { topic: 'Festivals', note: 'Diwali, Holi, and Raksha Bandhan are major festivals. Greet with "दीपावली की शुभकामनाएं" during Diwali.', importance: 'medium' }
      ],
      'Kannada': [
        { topic: 'Greetings', note: 'Use "ನಮಸ್ಕಾರ" (Namaskara) for formal greetings. "ಜಯ ಶ್ರೀ ಕೃಷ್ಣ" is common in Karnataka.', importance: 'high' },
        { topic: 'Dining', note: 'Eating on banana leaf is traditional. Remove footwear before entering homes. Say "ಜಯ ಶ್ರೀ ಕೃಷ್ಣ" before meals.', importance: 'medium' },
        { topic: 'Respect', note: 'Use "ನೀವು" (neevu) for formal address, "ನೀನು" (neenu) for informal. Touch elders\' feet as respect.', importance: 'high' },
        { topic: 'Festivals', note: 'Ugadi, Dasara, and Sankranti are major festivals. Greet with "ಉಗಾದಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು" during Ugadi.', importance: 'medium' }
      ],
      'Telugu': [
        { topic: 'Greetings', note: 'Use "నమస్కారం" (Namaskaram) for formal greetings. "జయ శ్రీ కృష్ణ" is common in Andhra Pradesh and Telangana.', importance: 'high' },
        { topic: 'Dining', note: 'Eating on banana leaf is traditional. Remove footwear before entering homes. Say "జయ శ్రీ కృష్ణ" before meals.', importance: 'medium' },
        { topic: 'Respect', note: 'Use "మీరు" (meeru) for formal address, "నువ్వు" (nuvvu) for informal. Touch elders\' feet as respect.', importance: 'high' },
        { topic: 'Festivals', note: 'Ugadi, Sankranti, and Vinayaka Chavithi are major festivals. Greet with "ఉగాది శుభాకాంక్షలు" during Ugadi.', importance: 'medium' }
      ],
      'Tamil': [
        { topic: 'Greetings', note: 'Use "வணக்கம்" (Vanakkam) for formal greetings. "ஜெய் ஸ்ரீ கிருஷ்ணா" is common in Tamil Nadu.', importance: 'high' },
        { topic: 'Dining', note: 'Eating on banana leaf is traditional. Remove footwear before entering homes. Say "ஜெய் ஸ்ரீ கிருஷ்ணா" before meals.', importance: 'medium' },
        { topic: 'Respect', note: 'Use "நீங்கள்" (neengal) for formal address, "நீ" (nee) for informal. Touch elders\' feet as respect.', importance: 'high' },
        { topic: 'Festivals', note: 'Pongal, Tamil New Year, and Karthigai are major festivals. Greet with "பொங்கல் வாழ்த்துக்கள்" during Pongal.', importance: 'medium' }
      ],
      'Bengali': [
        { topic: 'Greetings', note: 'Use "নমস্কার" (Nomoshkar) for formal greetings. "জয় শ্রী কৃষ্ণ" is common in West Bengal.', importance: 'high' },
        { topic: 'Dining', note: 'Eating with right hand is traditional. Remove footwear before entering homes. Say "জয় শ্রী কৃষ্ণ" before meals.', importance: 'medium' },
        { topic: 'Respect', note: 'Use "আপনি" (apni) for formal address, "তুমি" (tumi) for informal. Touch elders\' feet as respect.', importance: 'high' },
        { topic: 'Festivals', note: 'Durga Puja, Kali Puja, and Poila Boishakh are major festivals. Greet with "শুভ দুর্গা পূজা" during Durga Puja.', importance: 'medium' }
      ],
      'Marathi': [
        { topic: 'Greetings', note: 'Use "नमस्कार" (Namaskar) for formal greetings. "जय श्री कृष्ण" is common in Maharashtra.', importance: 'high' },
        { topic: 'Dining', note: 'Eating with right hand is traditional. Remove footwear before entering homes. Say "जय श्री कृष्ण" before meals.', importance: 'medium' },
        { topic: 'Respect', note: 'Use "तुम्ही" (tumhi) for formal address, "तू" (tu) for informal. Touch elders\' feet as respect.', importance: 'high' },
        { topic: 'Festivals', note: 'Ganesh Chaturthi, Gudi Padwa, and Diwali are major festivals. Greet with "गणेश चतुर्थीच्या हार्दिक शुभेच्छा" during Ganesh Chaturthi.', importance: 'medium' }
      ]
    };

    if (culturalNotes[language]) {
      const notesWithIds = culturalNotes[language].map(note => ({
        ...note,
        id: Date.now() + Math.random(),
        addedDate: new Date().toISOString()
      }));
      
      const updatedData = {
        ...languageData,
        culturalNotes: [...languageData.culturalNotes, ...notesWithIds]
      };
      
      setLanguageData(updatedData);
      saveLanguageData(updatedData);
      setSnackbar({ open: true, message: `Cultural notes for ${language} loaded!`, severity: 'success' });
    }
  };

  const downloadLanguageGuide = () => {
    const guide = {
      destination: languageData.destination,
      selectedLanguage: languageData.selectedLanguage,
      phrases: languageData.phrases,
      customPhrases: languageData.customPhrases,
      culturalNotes: languageData.culturalNotes,
      pronunciationGuide: languageData.pronunciationGuide,
      offlineDictionary: languageData.offlineDictionary,
      savedTranslations: languageData.savedTranslations,
      generatedDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(guide, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `language-guide-${languageData.selectedLanguage || 'travel'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Language guide downloaded!', severity: 'success' });
  };

  // Connectivity & Tech Functions
  const loadConnectivityData = () => {
    if (isAuthenticated) {
      const saved = localStorage.getItem(`connectivityData_${user?.id}`);
      if (saved) {
        setConnectivityData(JSON.parse(saved));
      }
    }
  };

  const saveConnectivityData = (data) => {
    if (isAuthenticated) {
      localStorage.setItem(`connectivityData_${user?.id}`, JSON.stringify(data));
    }
  };

  const addWifiSpot = () => {
    if (!newWifiSpot.name.trim() || !newWifiSpot.location.trim()) {
      setConnectivityFormErrors(prev => ({ ...prev, wifiSpot: 'Name and location are required' }));
      return;
    }
    
    const wifiSpot = {
      id: Date.now(),
      ...newWifiSpot,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...connectivityData,
      wifiSpots: [...connectivityData.wifiSpots, wifiSpot]
    };
    
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
    setNewWifiSpot({ name: '', location: '', password: '', notes: '', strength: 'good' });
    setConnectivityFormErrors(prev => ({ ...prev, wifiSpot: '' }));
    setSnackbar({ open: true, message: 'WiFi spot added successfully!', severity: 'success' });
  };

  const removeWifiSpot = (id) => {
    const updatedData = {
      ...connectivityData,
      wifiSpots: connectivityData.wifiSpots.filter(w => w.id !== id)
    };
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
    setSnackbar({ open: true, message: 'WiFi spot removed!', severity: 'info' });
  };

  const addSimCard = () => {
    if (!newSimCard.provider.trim() || !newSimCard.plan.trim()) {
      setConnectivityFormErrors(prev => ({ ...prev, simCard: 'Provider and plan are required' }));
      return;
    }
    
    const simCard = {
      id: Date.now(),
      ...newSimCard,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...connectivityData,
      simCards: [...connectivityData.simCards, simCard]
    };
    
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
    setNewSimCard({ provider: '', plan: '', cost: '', data: '', validity: '', notes: '' });
    setConnectivityFormErrors(prev => ({ ...prev, simCard: '' }));
    setSnackbar({ open: true, message: 'SIM card option added successfully!', severity: 'success' });
  };

  const removeSimCard = (id) => {
    const updatedData = {
      ...connectivityData,
      simCards: connectivityData.simCards.filter(s => s.id !== id)
    };
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
    setSnackbar({ open: true, message: 'SIM card option removed!', severity: 'info' });
  };

  const addPowerAdapter = () => {
    if (!newPowerAdapter.country.trim() || !newPowerAdapter.type.trim()) {
      setConnectivityFormErrors(prev => ({ ...prev, powerAdapter: 'Country and type are required' }));
      return;
    }
    
    const powerAdapter = {
      id: Date.now(),
      ...newPowerAdapter,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...connectivityData,
      powerAdapters: [...connectivityData.powerAdapters, powerAdapter]
    };
    
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
    setNewPowerAdapter({ country: '', type: '', voltage: '', notes: '' });
    setConnectivityFormErrors(prev => ({ ...prev, powerAdapter: '' }));
    setSnackbar({ open: true, message: 'Power adapter info added successfully!', severity: 'success' });
  };

  const removePowerAdapter = (id) => {
    const updatedData = {
      ...connectivityData,
      powerAdapters: connectivityData.powerAdapters.filter(p => p.id !== id)
    };
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
    setSnackbar({ open: true, message: 'Power adapter info removed!', severity: 'info' });
  };

  const addOfflineMap = () => {
    if (!newOfflineMap.location.trim()) {
      setConnectivityFormErrors(prev => ({ ...prev, offlineMap: 'Location is required' }));
      return;
    }
    
    const offlineMap = {
      id: Date.now(),
      ...newOfflineMap,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...connectivityData,
      offlineMaps: [...connectivityData.offlineMaps, offlineMap]
    };
    
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
    setNewOfflineMap({ location: '', size: '', downloadDate: '', notes: '' });
    setConnectivityFormErrors(prev => ({ ...prev, offlineMap: '' }));
    setSnackbar({ open: true, message: 'Offline map added successfully!', severity: 'success' });
  };

  const removeOfflineMap = (id) => {
    const updatedData = {
      ...connectivityData,
      offlineMaps: connectivityData.offlineMaps.filter(m => m.id !== id)
    };
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
    setSnackbar({ open: true, message: 'Offline map removed!', severity: 'info' });
  };

  const addTechItem = () => {
    if (!newTechItem.item.trim()) {
      setConnectivityFormErrors(prev => ({ ...prev, techItem: 'Item is required' }));
      return;
    }
    
    const techItem = {
      id: Date.now(),
      ...newTechItem,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...connectivityData,
      techChecklist: [...connectivityData.techChecklist, techItem]
    };
    
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
    setNewTechItem({ item: '', status: 'pending', priority: 'medium', notes: '' });
    setConnectivityFormErrors(prev => ({ ...prev, techItem: '' }));
    setSnackbar({ open: true, message: 'Tech item added successfully!', severity: 'success' });
  };

  const removeTechItem = (id) => {
    const updatedData = {
      ...connectivityData,
      techChecklist: connectivityData.techChecklist.filter(t => t.id !== id)
    };
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
    setSnackbar({ open: true, message: 'Tech item removed!', severity: 'info' });
  };

  const toggleTechItemStatus = (id) => {
    const updatedData = {
      ...connectivityData,
      techChecklist: connectivityData.techChecklist.map(item =>
        item.id === id ? { ...item, status: item.status === 'completed' ? 'pending' : 'completed' } : item
      )
    };
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
  };

  const addPassword = () => {
    if (!newPassword.service.trim() || !newPassword.username.trim() || !newPassword.password.trim()) {
      setConnectivityFormErrors(prev => ({ ...prev, password: 'Service, username, and password are required' }));
      return;
    }
    
    const password = {
      id: Date.now(),
      ...newPassword,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...connectivityData,
      savedPasswords: [...connectivityData.savedPasswords, password]
    };
    
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
    setNewPassword({ service: '', username: '', password: '', notes: '' });
    setConnectivityFormErrors(prev => ({ ...prev, password: '' }));
    setSnackbar({ open: true, message: 'Password saved successfully!', severity: 'success' });
  };

  const removePassword = (id) => {
    const updatedData = {
      ...connectivityData,
      savedPasswords: connectivityData.savedPasswords.filter(p => p.id !== id)
    };
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
    setSnackbar({ open: true, message: 'Password removed!', severity: 'info' });
  };

  const addDevice = () => {
    if (!newDevice.name.trim() || !newDevice.type.trim()) {
      setConnectivityFormErrors(prev => ({ ...prev, device: 'Name and type are required' }));
      return;
    }
    
    const device = {
      id: Date.now(),
      ...newDevice,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...connectivityData,
      deviceInfo: {
        ...connectivityData.deviceInfo,
        otherDevices: [...connectivityData.deviceInfo.otherDevices, device]
      }
    };
    
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
    setNewDevice({ name: '', type: '', model: '', notes: '' });
    setConnectivityFormErrors(prev => ({ ...prev, device: '' }));
    setSnackbar({ open: true, message: 'Device added successfully!', severity: 'success' });
  };

  const removeDevice = (id) => {
    const updatedData = {
      ...connectivityData,
      deviceInfo: {
        ...connectivityData.deviceInfo,
        otherDevices: connectivityData.deviceInfo.otherDevices.filter(d => d.id !== id)
      }
    };
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
    setSnackbar({ open: true, message: 'Device removed!', severity: 'info' });
  };

  const updateDeviceInfo = (field, value) => {
    const updatedData = {
      ...connectivityData,
      deviceInfo: { ...connectivityData.deviceInfo, [field]: value }
    };
    setConnectivityData(updatedData);
    saveConnectivityData(updatedData);
  };

  const checkPowerRequirements = (country) => {
    // Mock power adapter database
    const powerDatabase = {
      'usa': {
        type: 'Type A/B',
        voltage: '120V',
        frequency: '60Hz',
        notes: 'Standard US plug, works in Canada and Mexico'
      },
      'uk': {
        type: 'Type G',
        voltage: '230V',
        frequency: '50Hz',
        notes: 'Three-pin plug, different from most European countries'
      },
      'europe': {
        type: 'Type C/F',
        voltage: '230V',
        frequency: '50Hz',
        notes: 'Two-pin plug, works in most European countries'
      },
      'japan': {
        type: 'Type A/B',
        voltage: '100V',
        frequency: '50/60Hz',
        notes: 'Similar to US but lower voltage, check device compatibility'
      },
      'australia': {
        type: 'Type I',
        voltage: '230V',
        frequency: '50Hz',
        notes: 'Three-pin plug, different orientation from UK'
      },
      'india': {
        type: 'Type C/D/M',
        voltage: '230V',
        frequency: '50Hz',
        notes: 'Three-pin plug, similar to UK but different pin configuration'
      }
    };

    const countryKey = country.toLowerCase();
    if (powerDatabase[countryKey]) {
      const powerInfo = {
        id: Date.now(),
        country,
        ...powerDatabase[countryKey],
        addedDate: new Date().toISOString()
      };
      
      const updatedData = {
        ...connectivityData,
        powerAdapters: [...connectivityData.powerAdapters, powerInfo]
      };
      setConnectivityData(updatedData);
      saveConnectivityData(updatedData);
      setSnackbar({ open: true, message: `Power requirements for ${country} loaded!`, severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Country not found in database. Please check official sources.', severity: 'warning' });
    }
  };

  const downloadConnectivityReport = () => {
    const report = {
      destination: connectivityData.destination,
      wifiSpots: connectivityData.wifiSpots,
      simCards: connectivityData.simCards,
      powerAdapters: connectivityData.powerAdapters,
      offlineMaps: connectivityData.offlineMaps,
      techChecklist: connectivityData.techChecklist,
      deviceInfo: connectivityData.deviceInfo,
      generatedDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connectivity-report-${connectivityData.destination || 'travel'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Connectivity report downloaded!', severity: 'success' });
  };

  // Transportation Functions
  const loadTransportData = () => {
    if (isAuthenticated) {
      const saved = localStorage.getItem(`transportData_${user?.id}`);
      if (saved) {
        setTransportData(JSON.parse(saved));
      }
    }
  };

  const saveTransportData = (data) => {
    if (isAuthenticated) {
      localStorage.setItem(`transportData_${user?.id}`, JSON.stringify(data));
    }
  };

  const addTransitRoute = () => {
    if (!newTransitRoute.from.trim() || !newTransitRoute.to.trim()) {
      setTransportFormErrors(prev => ({ ...prev, transitRoute: 'From and To locations are required' }));
      return;
    }
    
    const route = {
      id: Date.now(),
      ...newTransitRoute,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...transportData,
      publicTransit: [...transportData.publicTransit, route]
    };
    
    setTransportData(updatedData);
    saveTransportData(updatedData);
    setNewTransitRoute({ from: '', to: '', mode: 'bus', duration: '', cost: '', frequency: '', notes: '' });
    setTransportFormErrors(prev => ({ ...prev, transitRoute: '' }));
    setSnackbar({ open: true, message: 'Transit route added successfully!', severity: 'success' });
  };

  const removeTransitRoute = (id) => {
    const updatedData = {
      ...transportData,
      publicTransit: transportData.publicTransit.filter(r => r.id !== id)
    };
    setTransportData(updatedData);
    saveTransportData(updatedData);
    setSnackbar({ open: true, message: 'Transit route removed!', severity: 'info' });
  };

  const addRideShare = () => {
    if (!newRideShare.service.trim() || !newRideShare.from.trim() || !newRideShare.to.trim()) {
      setTransportFormErrors(prev => ({ ...prev, rideShare: 'Service, From, and To are required' }));
      return;
    }
    
    const rideShare = {
      id: Date.now(),
      ...newRideShare,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...transportData,
      rideSharing: [...transportData.rideSharing, rideShare]
    };
    
    setTransportData(updatedData);
    saveTransportData(updatedData);
    setNewRideShare({ service: '', from: '', to: '', cost: '', duration: '', notes: '' });
    setTransportFormErrors(prev => ({ ...prev, rideShare: '' }));
    setSnackbar({ open: true, message: 'Ride-share option added successfully!', severity: 'success' });
  };

  const removeRideShare = (id) => {
    const updatedData = {
      ...transportData,
      rideSharing: transportData.rideSharing.filter(r => r.id !== id)
    };
    setTransportData(updatedData);
    saveTransportData(updatedData);
    setSnackbar({ open: true, message: 'Ride-share option removed!', severity: 'info' });
  };

  const addParkingSpot = () => {
    if (!newParkingSpot.location.trim()) {
      setTransportFormErrors(prev => ({ ...prev, parkingSpot: 'Location is required' }));
      return;
    }
    
    const parkingSpot = {
      id: Date.now(),
      ...newParkingSpot,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...transportData,
      parkingSpots: [...transportData.parkingSpots, parkingSpot]
    };
    
    setTransportData(updatedData);
    saveTransportData(updatedData);
    setNewParkingSpot({ location: '', type: 'street', cost: '', hours: '', availability: 'available', notes: '' });
    setTransportFormErrors(prev => ({ ...prev, parkingSpot: '' }));
    setSnackbar({ open: true, message: 'Parking spot added successfully!', severity: 'success' });
  };

  const removeParkingSpot = (id) => {
    const updatedData = {
      ...transportData,
      parkingSpots: transportData.parkingSpots.filter(p => p.id !== id)
    };
    setTransportData(updatedData);
    saveTransportData(updatedData);
    setSnackbar({ open: true, message: 'Parking spot removed!', severity: 'info' });
  };

  const addTransportPass = () => {
    if (!newTransportPass.name.trim() || !newTransportPass.cost.trim()) {
      setTransportFormErrors(prev => ({ ...prev, transportPass: 'Name and cost are required' }));
      return;
    }
    
    const transportPass = {
      id: Date.now(),
      ...newTransportPass,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...transportData,
      transportPasses: [...transportData.transportPasses, transportPass]
    };
    
    setTransportData(updatedData);
    saveTransportData(updatedData);
    setNewTransportPass({ name: '', type: 'daily', cost: '', validity: '', coverage: '', notes: '' });
    setTransportFormErrors(prev => ({ ...prev, transportPass: '' }));
    setSnackbar({ open: true, message: 'Transport pass added successfully!', severity: 'success' });
  };

  const removeTransportPass = (id) => {
    const updatedData = {
      ...transportData,
      transportPasses: transportData.transportPasses.filter(p => p.id !== id)
    };
    setTransportData(updatedData);
    saveTransportData(updatedData);
    setSnackbar({ open: true, message: 'Transport pass removed!', severity: 'info' });
  };

  const addSavedRoute = () => {
    if (!newSavedRoute.name.trim() || !newSavedRoute.from.trim() || !newSavedRoute.to.trim()) {
      setTransportFormErrors(prev => ({ ...prev, savedRoute: 'Name, From, and To are required' }));
      return;
    }
    
    const savedRoute = {
      id: Date.now(),
      ...newSavedRoute,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...transportData,
      savedRoutes: [...transportData.savedRoutes, savedRoute]
    };
    
    setTransportData(updatedData);
    saveTransportData(updatedData);
    setNewSavedRoute({ name: '', from: '', to: '', mode: 'public', duration: '', cost: '', notes: '' });
    setTransportFormErrors(prev => ({ ...prev, savedRoute: '' }));
    setSnackbar({ open: true, message: 'Route saved successfully!', severity: 'success' });
  };

  const removeSavedRoute = (id) => {
    const updatedData = {
      ...transportData,
      savedRoutes: transportData.savedRoutes.filter(r => r.id !== id)
    };
    setTransportData(updatedData);
    saveTransportData(updatedData);
    setSnackbar({ open: true, message: 'Route removed!', severity: 'info' });
  };

  const updateTransportPreferences = (field, value) => {
    const updatedData = {
      ...transportData,
      transportPreferences: { ...transportData.transportPreferences, [field]: value }
    };
    setTransportData(updatedData);
    saveTransportData(updatedData);
  };

  const calculateTransportCosts = () => {
    const totalTransitCost = transportData.publicTransit.reduce((sum, route) => {
      const cost = parseFloat(route.cost) || 0;
      return sum + cost;
    }, 0);

    const totalRideShareCost = transportData.rideSharing.reduce((sum, ride) => {
      const cost = parseFloat(ride.cost) || 0;
      return sum + cost;
    }, 0);

    const totalParkingCost = transportData.parkingSpots.reduce((sum, spot) => {
      const cost = parseFloat(spot.cost) || 0;
      return sum + cost;
    }, 0);

    const totalPassCost = transportData.transportPasses.reduce((sum, pass) => {
      const cost = parseFloat(pass.cost) || 0;
      return sum + cost;
    }, 0);

    return {
      transit: totalTransitCost,
      rideShare: totalRideShareCost,
      parking: totalParkingCost,
      passes: totalPassCost,
      total: totalTransitCost + totalRideShareCost + totalParkingCost + totalPassCost
    };
  };

  const findOptimalRoute = (from, to, preferences) => {
    // Mock route optimization algorithm
    const routes = transportData.publicTransit.filter(route => 
      route.from.toLowerCase().includes(from.toLowerCase()) && 
      route.to.toLowerCase().includes(to.toLowerCase())
    );

    if (routes.length === 0) {
      return null;
    }

    // Sort by duration (fastest first)
    const sortedRoutes = routes.sort((a, b) => {
      const durationA = parseInt(a.duration) || 0;
      const durationB = parseInt(b.duration) || 0;
      return durationA - durationB;
    });

    return sortedRoutes[0];
  };

  const downloadTransportReport = () => {
    const costs = calculateTransportCosts();
    const report = {
      destination: transportData.destination,
      publicTransit: transportData.publicTransit,
      rideSharing: transportData.rideSharing,
      parkingSpots: transportData.parkingSpots,
      transportPasses: transportData.transportPasses,
      savedRoutes: transportData.savedRoutes,
      transportPreferences: transportData.transportPreferences,
      costBreakdown: costs,
      generatedDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transport-report-${transportData.destination || 'travel'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Transport report downloaded!', severity: 'success' });
  };

  // Accommodation Functions
  const loadAccommodationData = () => {
    if (isAuthenticated) {
      const saved = localStorage.getItem(`accommodationData_${user?.id}`);
      if (saved) {
        setAccommodationData(JSON.parse(saved));
      }
    }
  };

  const saveAccommodationData = (data) => {
    if (isAuthenticated) {
      localStorage.setItem(`accommodationData_${user?.id}`, JSON.stringify(data));
    }
  };

  const addHotel = () => {
    if (!newHotel.name.trim() || !newHotel.location.trim()) {
      setAccommodationFormErrors(prev => ({ ...prev, hotel: 'Name and location are required' }));
      return;
    }
    
    const hotel = {
      id: Date.now(),
      ...newHotel,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...accommodationData,
      hotels: [...accommodationData.hotels, hotel]
    };
    
    setAccommodationData(updatedData);
    saveAccommodationData(updatedData);
    setNewHotel({ name: '', location: '', price: '', rating: 3, amenities: [], bookingRef: '', checkIn: '', checkOut: '', notes: '' });
    setAccommodationFormErrors(prev => ({ ...prev, hotel: '' }));
    setSnackbar({ open: true, message: 'Hotel added successfully!', severity: 'success' });
  };

  const removeHotel = (id) => {
    const updatedData = {
      ...accommodationData,
      hotels: accommodationData.hotels.filter(h => h.id !== id)
    };
    setAccommodationData(updatedData);
    saveAccommodationData(updatedData);
    setSnackbar({ open: true, message: 'Hotel removed!', severity: 'info' });
  };

  const addLoyaltyProgram = () => {
    if (!newLoyaltyProgram.program.trim() || !newLoyaltyProgram.memberId.trim()) {
      setAccommodationFormErrors(prev => ({ ...prev, loyaltyProgram: 'Program name and member ID are required' }));
      return;
    }
    
    const loyaltyProgram = {
      id: Date.now(),
      ...newLoyaltyProgram,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...accommodationData,
      loyaltyPrograms: [...accommodationData.loyaltyPrograms, loyaltyProgram]
    };
    
    setAccommodationData(updatedData);
    saveAccommodationData(updatedData);
    setNewLoyaltyProgram({ program: '', memberId: '', points: '', tier: 'basic', expiryDate: '', notes: '' });
    setAccommodationFormErrors(prev => ({ ...prev, loyaltyProgram: '' }));
    setSnackbar({ open: true, message: 'Loyalty program added successfully!', severity: 'success' });
  };

  const removeLoyaltyProgram = (id) => {
    const updatedData = {
      ...accommodationData,
      loyaltyPrograms: accommodationData.loyaltyPrograms.filter(l => l.id !== id)
    };
    setAccommodationData(updatedData);
    saveAccommodationData(updatedData);
    setSnackbar({ open: true, message: 'Loyalty program removed!', severity: 'info' });
  };

  const addAlternativeStay = () => {
    if (!newAlternativeStay.name.trim() || !newAlternativeStay.location.trim()) {
      setAccommodationFormErrors(prev => ({ ...prev, alternativeStay: 'Name and location are required' }));
      return;
    }
    
    const alternativeStay = {
      id: Date.now(),
      ...newAlternativeStay,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...accommodationData,
      alternativeStays: [...accommodationData.alternativeStays, alternativeStay]
    };
    
    setAccommodationData(updatedData);
    saveAccommodationData(updatedData);
    setNewAlternativeStay({ name: '', type: 'hostel', location: '', price: '', amenities: [], bookingRef: '', checkIn: '', checkOut: '', notes: '' });
    setAccommodationFormErrors(prev => ({ ...prev, alternativeStay: '' }));
    setSnackbar({ open: true, message: 'Alternative stay added successfully!', severity: 'success' });
  };

  const removeAlternativeStay = (id) => {
    const updatedData = {
      ...accommodationData,
      alternativeStays: accommodationData.alternativeStays.filter(a => a.id !== id)
    };
    setAccommodationData(updatedData);
    saveAccommodationData(updatedData);
    setSnackbar({ open: true, message: 'Alternative stay removed!', severity: 'info' });
  };

  const addSavedBooking = () => {
    if (!newSavedBooking.name.trim() || !newSavedBooking.location.trim()) {
      setAccommodationFormErrors(prev => ({ ...prev, savedBooking: 'Name and location are required' }));
      return;
    }
    
    const savedBooking = {
      id: Date.now(),
      ...newSavedBooking,
      addedDate: new Date().toISOString()
    };
    
    const updatedData = {
      ...accommodationData,
      savedBookings: [...accommodationData.savedBookings, savedBooking]
    };
    
    setAccommodationData(updatedData);
    saveAccommodationData(updatedData);
    setNewSavedBooking({ name: '', type: 'hotel', location: '', price: '', bookingRef: '', checkIn: '', checkOut: '', notes: '' });
    setAccommodationFormErrors(prev => ({ ...prev, savedBooking: '' }));
    setSnackbar({ open: true, message: 'Booking saved successfully!', severity: 'success' });
  };

  const removeSavedBooking = (id) => {
    const updatedData = {
      ...accommodationData,
      savedBookings: accommodationData.savedBookings.filter(b => b.id !== id)
    };
    setAccommodationData(updatedData);
    saveAccommodationData(updatedData);
    setSnackbar({ open: true, message: 'Booking removed!', severity: 'info' });
  };

  const updateCheckInPreferences = (field, value) => {
    const updatedData = {
      ...accommodationData,
      checkInPreferences: { ...accommodationData.checkInPreferences, [field]: value }
    };
    setAccommodationData(updatedData);
    saveAccommodationData(updatedData);
  };

  const updateAccommodationPreferences = (field, value) => {
    const updatedData = {
      ...accommodationData,
      accommodationPreferences: { ...accommodationData.accommodationPreferences, [field]: value }
    };
    setAccommodationData(updatedData);
    saveAccommodationData(updatedData);
  };

  const toggleAmenity = (amenity) => {
    const currentAmenities = accommodationData.accommodationPreferences.amenities;
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    updateAccommodationPreferences('amenities', updatedAmenities);
  };

  const calculateAccommodationCosts = () => {
    const totalHotelCost = accommodationData.hotels.reduce((sum, hotel) => {
      const cost = parseFloat(hotel.price) || 0;
      return sum + cost;
    }, 0);

    const totalAlternativeCost = accommodationData.alternativeStays.reduce((sum, stay) => {
      const cost = parseFloat(stay.price) || 0;
      return sum + cost;
    }, 0);

    const totalSavedCost = accommodationData.savedBookings.reduce((sum, booking) => {
      const cost = parseFloat(booking.price) || 0;
      return sum + cost;
    }, 0);

    return {
      hotels: totalHotelCost,
      alternativeStays: totalAlternativeCost,
      savedBookings: totalSavedCost,
      total: totalHotelCost + totalAlternativeCost + totalSavedCost
    };
  };

  const getOptimalCheckInTime = () => {
    // Mock algorithm for optimal check-in time
    const times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
    const optimalTimes = {
      'business': '14:00',
      'leisure': '15:00',
      'family': '13:00',
      'backpacker': '12:00'
    };
    
    return optimalTimes[accommodationData.accommodationPreferences.type] || '14:00';
  };

  const downloadAccommodationReport = () => {
    const costs = calculateAccommodationCosts();
    const report = {
      destination: accommodationData.destination,
      hotels: accommodationData.hotels,
      loyaltyPrograms: accommodationData.loyaltyPrograms,
      alternativeStays: accommodationData.alternativeStays,
      savedBookings: accommodationData.savedBookings,
      checkInPreferences: accommodationData.checkInPreferences,
      accommodationPreferences: accommodationData.accommodationPreferences,
      costBreakdown: costs,
      optimalCheckInTime: getOptimalCheckInTime(),
      generatedDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accommodation-report-${accommodationData.destination || 'travel'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Accommodation report downloaded!', severity: 'success' });
  };

  // Tool Categories with pro indicators
  const toolCategories = [
    {
      title: "Packing Assistant",
      icon: <Luggage />,
      description: "Create and manage packing lists manually",
      color: "#2196F3",
      dialog: packingDialogOpen,
      setDialog: setPackingDialogOpen,
      pro: false
    },
    {
      title: "Budget Calculator",
      icon: <AttachMoney />,
      description: "Track expenses and manage travel budget",
      color: "#4CAF50",
      dialog: budgetDialogOpen,
      setDialog: setBudgetDialogOpen,
      pro: false
    },
    {
      title: "Health & Safety",
      icon: <HealthAndSafety />,
      description: "Vaccinations, medical info, and emergency contacts",
      color: "#F44336",
      dialog: healthDialogOpen,
      setDialog: setHealthDialogOpen,
      pro: false
    },
    {
      title: "Language Tools",
      icon: <Language />,
      description: "Translations, phrases, and cultural guides",
      color: "#FF9800",
      dialog: languageDialogOpen,
      setDialog: setLanguageDialogOpen,
      pro: true
    },
    {
      title: "Planning Utilities",
      icon: <Timeline />,
      description: "Visa checker, document scanner, and checklists",
      color: "#9C27B0",
      dialog: planningDialogOpen,
      setDialog: setPlanningDialogOpen,
      pro: false
    },
    {
      title: "Connectivity Tools",
      icon: <Wifi />,
      description: "WiFi finder, SIM cards, and tech utilities",
      color: "#00BCD4",
      dialog: connectivityDialogOpen,
      setDialog: setConnectivityDialogOpen,
      pro: true
    },
    {
      title: "Transportation",
      icon: <DirectionsCar />,
      description: "Public transit, ride-sharing, and parking",
      color: "#795548",
      dialog: transportDialogOpen,
      setDialog: setTransportDialogOpen,
      pro: false
    },
    {
      title: "Accommodation",
      icon: <Hotel />,
      description: "Hotel comparison and loyalty programs",
      color: "#607D8B",
      dialog: accommodationDialogOpen,
      setDialog: setAccommodationDialogOpen,
      pro: false
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        🧳 Travel Tools
      </Typography>
      
      <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Essential tools for smart, safe, and organized travel - Planning utilities now available to all users!
      </Typography>

      {isAuthenticated && (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Chip
            label={isProUser ? `Pro User - ${user?.subscription?.planName || 'Premium'}` : 'Free User'}
            color={isProUser ? 'success' : 'default'}
            icon={isProUser ? <Star /> : null}
            sx={{ fontSize: '1rem', py: 1 }}
          />
        </Box>
      )}

      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            Sign in to access all travel tools and save your data across devices.
          </Typography>
        </Alert>
      )}

      {isAuthenticated && !isProUser && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="body1">
            Upgrade to Pro to unlock advanced features like Language assistance and Connectivity tools.
          </Typography>
        </Alert>
      )}

      {isAuthenticated && isProUser && (
        <Alert severity="success" sx={{ mb: 4 }}>
          <Typography variant="body1">
            🎉 You have access to all premium features! Enjoy your enhanced travel planning experience.
          </Typography>
        </Alert>
      )}

      {/* Main Tools Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {toolCategories.map((tool, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
              onClick={() => handleToolClick(tool)}
            >
              {tool.pro && !isProUser && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    bgcolor: 'warning.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Lock sx={{ fontSize: 16 }} />
                </Box>
              )}
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 2,
                  color: tool.pro && !isProUser ? 'grey.400' : tool.color
                }}>
                  {React.cloneElement(tool.icon, { sx: { fontSize: 48 } })}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {tool.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tool.description}
                </Typography>
                {tool.pro && !isProUser && (
                  <Chip
                    label="PRO"
                    size="small"
                    color="warning"
                    sx={{ mt: 1 }}
                    icon={<Star />}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Packing Lists Section - Available for all authenticated users */}
      {isAuthenticated && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            📋 My Packing Lists
          </Typography>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          {packingLists.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No packing lists yet. Create your first one!
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {packingLists.map((list) => (
                <Grid item xs={12} md={6} key={list.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="h6">{list.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {list.destination} • {list.duration} days
                          </Typography>
                        </Box>
                        <IconButton
                          onClick={() => deletePackingList(list.id)}
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                      <List dense>
                        {list.items.map((item) => (
                          <ListItem key={item.id}>
                            <ListItemText
                              primary={item.name}
                              secondary={item.category}
                              sx={{
                                textDecoration: item.packed ? 'line-through' : 'none'
                              }}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                onClick={() => toggleItemPacked(list.id, item.id)}
                                color={item.packed ? 'success' : 'default'}
                              >
                                {item.packed ? <Check /> : <Add />}
                              </IconButton>
                              <IconButton
                                onClick={() => deletePackingItem(list.id, item.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                      <Box sx={{ mt: 2 }}>
                        {itemError && (
                          <Alert severity="error" sx={{ mb: 1 }}>
                            {itemError}
                          </Alert>
                        )}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <TextField
                            size="small"
                            placeholder="Add item *"
                            value={newItem.name}
                            onChange={(e) => {
                              setNewItem({ ...newItem, name: e.target.value });
                              setItemError('');
                            }}
                            error={!!itemError && !newItem.name.trim()}
                            sx={{ flexGrow: 1 }}
                          />
                          <TextField
                            size="small"
                            placeholder="Category"
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            sx={{ width: '120px' }}
                          />
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => addItemToPackingList(list.id)}
                            startIcon={<Add />}
                          >
                            Add
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {/* Budget Section - Available for all authenticated users */}
      {isAuthenticated && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            💰 Budget Tracker
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Budget Categories</Typography>
              <Grid container spacing={2}>
                {Object.entries(budget.categories).map(([category, amount]) => (
                  <Grid item xs={12} sm={6} key={category}>
                    <TextField
                      fullWidth
                      label={category.charAt(0).toUpperCase() + category.slice(1)}
                      type="number"
                      value={amount}
                      onChange={(e) => updateBudgetCategory(category, e.target.value)}
                      InputProps={{
                        startAdornment: <AttachMoney sx={{ color: 'text.secondary', mr: 1 }} />
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Budget Summary</Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body1">
                  Total Budget: ₹{calculateTotalBudget().toLocaleString()}
                </Typography>
                <Typography variant="body1">
                  Remaining: ₹{calculateRemainingBudget().toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Dialogs */}
      
      {/* Packing List Dialog */}
      <Dialog open={packingDialogOpen} onClose={() => setPackingDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Packing List</DialogTitle>
        <DialogContent>
          {packingListError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {packingListError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="List Name *"
                value={newPackingList.name}
                onChange={(e) => {
                  setNewPackingList({ ...newPackingList, name: e.target.value });
                  setPackingListError('');
                }}
                error={!!packingListError && !newPackingList.name.trim()}
                helperText="Give your packing list a name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Destination *"
                value={newPackingList.destination}
                onChange={(e) => {
                  setNewPackingList({ ...newPackingList, destination: e.target.value });
                  setPackingListError('');
                }}
                error={!!packingListError && !newPackingList.destination.trim()}
                helperText="Where are you traveling to?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Duration (days)"
                type="number"
                value={newPackingList.duration}
                onChange={(e) => setNewPackingList({ ...newPackingList, duration: e.target.value })}
                helperText="How many days will you be traveling?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setPackingDialogOpen(false);
            setPackingListError('');
            setNewPackingList({ name: '', destination: '', duration: '', items: [] });
          }}>
            Cancel
          </Button>
          <Button onClick={handleCreatePackingList} variant="contained" color="primary">
            Create List
          </Button>
        </DialogActions>
      </Dialog>

      {/* Budget Dialog */}
      <Dialog open={budgetDialogOpen} onClose={() => setBudgetDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Budget Calculator</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Total Budget (₹)"
                type="number"
                value={budget.total}
                onChange={(e) => setBudget({ ...budget, total: parseFloat(e.target.value) || 0 })}
                helperText="Enter your total budget in Indian Rupees"
              />
            </Grid>
            {Object.entries(budget.categories).map(([category, value]) => (
              <Grid item xs={12} sm={6} key={category}>
                <TextField
                  fullWidth
                  label={`${category.charAt(0).toUpperCase() + category.slice(1)} (₹)`}
                  type="number"
                  value={value}
                  onChange={(e) => updateBudgetCategory(category, e.target.value)}
                  helperText={`Budget for ${category}`}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBudgetDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Health Dialog */}
      <Dialog open={healthDialogOpen} onClose={() => setHealthDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HealthAndSafety />
            Health & Safety Tools
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Personal Info" />
            <Tab label="Vaccinations" />
            <Tab label="Medications" />
            <Tab label="Emergency Contacts" />
            <Tab label="Insurance" />
            <Tab label="Destination Health" />
          </Tabs>
          
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Personal Health Information</Typography>
              
              {/* Blood Type */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Blood Type</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                    <Chip
                      key={type}
                      label={type}
                      color={healthData.bloodType === type ? 'primary' : 'default'}
                      onClick={() => updateBloodType(type)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Allergies */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Allergies</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Allergen (e.g., Peanuts, Shellfish)"
                    value={newAllergy.allergen}
                    onChange={(e) => setNewAllergy({ ...newAllergy, allergen: e.target.value })}
                    sx={{ flexGrow: 1 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Severity</InputLabel>
                    <Select
                      value={newAllergy.severity}
                      onChange={(e) => setNewAllergy({ ...newAllergy, severity: e.target.value })}
                      label="Severity"
                    >
                      <MenuItem value="mild">Mild</MenuItem>
                      <MenuItem value="moderate">Moderate</MenuItem>
                      <MenuItem value="severe">Severe</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={addAllergy}
                    startIcon={<Add />}
                  >
                    Add
                  </Button>
                </Box>
                {healthFormErrors.allergy && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {healthFormErrors.allergy}
                  </Alert>
                )}
                <List>
                  {healthData.allergies.map((allergy) => (
                    <ListItem key={allergy.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                      <ListItemText
                        primary={allergy.allergen}
                        secondary={`Severity: ${allergy.severity}${allergy.notes ? ` • ${allergy.notes}` : ''}`}
                      />
                      <Chip
                        label={allergy.severity}
                        color={allergy.severity === 'severe' ? 'error' : allergy.severity === 'moderate' ? 'warning' : 'default'}
                        size="small"
                      />
                      <IconButton onClick={() => removeAllergy(allergy.id)} color="error" size="small">
                        <Delete />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Medical Conditions */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Medical Conditions</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Condition (e.g., Diabetes, Asthma)"
                    value={newMedicalCondition.condition}
                    onChange={(e) => setNewMedicalCondition({ ...newMedicalCondition, condition: e.target.value })}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={addMedicalCondition}
                    startIcon={<Add />}
                  >
                    Add
                  </Button>
                </Box>
                {healthFormErrors.medicalCondition && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {healthFormErrors.medicalCondition}
                  </Alert>
                )}
                <List>
                  {healthData.medicalConditions.map((condition) => (
                    <ListItem key={condition.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                      <ListItemText
                        primary={condition.condition}
                        secondary={`${condition.notes ? `${condition.notes} • ` : ''}${condition.medications ? `Medications: ${condition.medications}` : ''}`}
                      />
                      <IconButton onClick={() => removeMedicalCondition(condition.id)} color="error" size="small">
                        <Delete />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Vaccinations</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Keep track of your vaccinations and their expiry dates. Check with your healthcare provider for destination-specific requirements.
              </Alert>
              
              {/* Add New Vaccination */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Vaccination Name (e.g., COVID-19, Yellow Fever)"
                  value={newVaccination.name}
                  onChange={(e) => setNewVaccination({ ...newVaccination, name: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 200 }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Date Received"
                  value={newVaccination.date}
                  onChange={(e) => setNewVaccination({ ...newVaccination, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Expiry Date"
                  value={newVaccination.expiry}
                  onChange={(e) => setNewVaccination({ ...newVaccination, expiry: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newVaccination.status}
                    onChange={(e) => setNewVaccination({ ...newVaccination, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  size="small"
                  onClick={addVaccination}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {healthFormErrors.vaccination && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {healthFormErrors.vaccination}
                </Alert>
              )}

              {/* Vaccinations List */}
              <List>
                {healthData.vaccinations.map((vaccination) => (
                  <ListItem key={vaccination.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={vaccination.name}
                      secondary={`Received: ${vaccination.date}${vaccination.expiry ? ` • Expires: ${vaccination.expiry}` : ''}`}
                    />
                    <Chip
                      label={vaccination.status}
                      color={vaccination.status === 'completed' ? 'success' : vaccination.status === 'expired' ? 'error' : 'warning'}
                      size="small"
                    />
                    <IconButton onClick={() => removeVaccination(vaccination.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Medications</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Track your medications, dosages, and schedules. Remember to bring extra supply when traveling.
              </Alert>
              
              {/* Add New Medication */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Medication Name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Dosage (e.g., 500mg)"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <TextField
                  size="small"
                  placeholder="Frequency (e.g., Twice daily)"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addMedication}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {healthFormErrors.medication && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {healthFormErrors.medication}
                </Alert>
              )}

              {/* Medications List */}
              <List>
                {healthData.medications.map((medication) => (
                  <ListItem key={medication.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={medication.name}
                      secondary={`${medication.dosage} • ${medication.frequency}${medication.notes ? ` • ${medication.notes}` : ''}`}
                    />
                    <IconButton onClick={() => removeMedication(medication.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Emergency Contacts</Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Keep important emergency contacts easily accessible. Include local emergency numbers for your destination.
              </Alert>
              
              {/* Add New Emergency Contact */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Contact Name"
                  value={newEmergencyContact.name}
                  onChange={(e) => setNewEmergencyContact({ ...newEmergencyContact, name: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Relationship"
                  value={newEmergencyContact.relationship}
                  onChange={(e) => setNewEmergencyContact({ ...newEmergencyContact, relationship: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <TextField
                  size="small"
                  placeholder="Phone Number"
                  value={newEmergencyContact.phone}
                  onChange={(e) => setNewEmergencyContact({ ...newEmergencyContact, phone: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addEmergencyContact}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {healthFormErrors.emergencyContact && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {healthFormErrors.emergencyContact}
                </Alert>
              )}

              {/* Emergency Contacts List */}
              <List>
                {healthData.emergencyContacts.map((contact) => (
                  <ListItem key={contact.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={contact.name}
                      secondary={`${contact.relationship} • ${contact.phone}${contact.email ? ` • ${contact.email}` : ''}`}
                    />
                    <IconButton onClick={() => removeEmergencyContact(contact.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>Travel Insurance</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Store your travel insurance information for easy access during emergencies.
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Insurance Provider"
                    value={healthData.insurance.provider}
                    onChange={(e) => updateInsurance('provider', e.target.value)}
                    placeholder="e.g., World Nomads, Allianz"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Policy Number"
                    value={healthData.insurance.policyNumber}
                    onChange={(e) => updateInsurance('policyNumber', e.target.value)}
                    placeholder="Your policy number"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={healthData.insurance.phoneNumber}
                    onChange={(e) => updateInsurance('phoneNumber', e.target.value)}
                    placeholder="Emergency contact number"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    type="date"
                    value={healthData.insurance.expiryDate}
                    onChange={(e) => updateInsurance('expiryDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Coverage Details"
                    multiline
                    rows={3}
                    value={healthData.insurance.coverage}
                    onChange={(e) => updateInsurance('coverage', e.target.value)}
                    placeholder="Describe your coverage (medical, trip cancellation, baggage, etc.)"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>Destination Health Information</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Get health information for your destination. Enter a country name to see health advisories and requirements.
              </Alert>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Enter country name (e.g., Thailand, Japan, USA, India)"
                  value={healthData.destinationHealthInfo.country}
                  onChange={(e) => setHealthData(prev => ({
                    ...prev,
                    destinationHealthInfo: { ...prev.destinationHealthInfo, country: e.target.value }
                  }))}
                />
                <Button
                  variant="contained"
                  onClick={() => checkDestinationHealth(healthData.destinationHealthInfo.country)}
                  startIcon={<Search />}
                >
                  Check
                </Button>
              </Box>

              {healthData.destinationHealthInfo.country && (
                <Box>
                  {healthData.destinationHealthInfo.requiredVaccines && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom color="error.main">
                        Required Vaccinations
                      </Typography>
                      <List>
                        {healthData.destinationHealthInfo.requiredVaccines.map((vaccine, index) => (
                          <ListItem key={index} sx={{ border: 1, borderColor: 'error.light', borderRadius: 1, mb: 1 }}>
                            <ListItemText primary={vaccine} />
                            <Chip label="Required" color="error" size="small" />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {healthData.destinationHealthInfo.recommendedVaccines && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom color="warning.main">
                        Recommended Vaccinations
                      </Typography>
                      <List>
                        {healthData.destinationHealthInfo.recommendedVaccines.map((vaccine, index) => (
                          <ListItem key={index} sx={{ border: 1, borderColor: 'warning.light', borderRadius: 1, mb: 1 }}>
                            <ListItemText primary={vaccine} />
                            <Chip label="Recommended" color="warning" size="small" />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {healthData.destinationHealthInfo.healthAdvisories && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom color="info.main">
                        Health Advisories
                      </Typography>
                      <List>
                        {healthData.destinationHealthInfo.healthAdvisories.map((advisory, index) => (
                          <ListItem key={index} sx={{ border: 1, borderColor: 'info.light', borderRadius: 1, mb: 1 }}>
                            <ListItemText primary={advisory} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {healthData.destinationHealthInfo.waterSafety && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom color="primary.main">
                        Water Safety
                      </Typography>
                      <Alert severity="info">
                        {healthData.destinationHealthInfo.waterSafety}
                      </Alert>
                    </Box>
                  )}

                  {healthData.destinationHealthInfo.foodSafety && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom color="primary.main">
                        Food Safety
                      </Typography>
                      <Alert severity="info">
                        {healthData.destinationHealthInfo.foodSafety}
                      </Alert>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadHealthReport} startIcon={<Download />}>
            Download Report
          </Button>
          <Button onClick={() => setHealthDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Language Dialog */}
      <Dialog open={languageDialogOpen} onClose={() => setLanguageDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: 'warning.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Language />
            Language & Communication Tools
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Translation" />
            <Tab label="Phrases" />
            <Tab label="Custom Phrases" />
            <Tab label="Cultural Notes" />
            <Tab label="Pronunciation" />
            <Tab label="Dictionary" />
            <Tab label="History" />
          </Tabs>
          
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Text Translation</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Translate text between languages. Demo mode includes common phrases for Spanish, French, Japanese, and German.
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>From Language</InputLabel>
                    <Select
                      value={translationText.from}
                      onChange={(e) => setTranslationText(prev => ({ ...prev, from: e.target.value }))}
                      label="From Language"
                    >
                      <MenuItem value="English">English</MenuItem>
                      <MenuItem value="Spanish">Spanish</MenuItem>
                      <MenuItem value="French">French</MenuItem>
                      <MenuItem value="Japanese">Japanese</MenuItem>
                      <MenuItem value="German">German</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>To Language</InputLabel>
                    <Select
                      value={translationText.to}
                      onChange={(e) => setTranslationText(prev => ({ ...prev, to: e.target.value }))}
                      label="To Language"
                    >
                      <MenuItem value="Spanish">Spanish</MenuItem>
                      <MenuItem value="French">French</MenuItem>
                      <MenuItem value="Japanese">Japanese</MenuItem>
                      <MenuItem value="German">German</MenuItem>
                      <MenuItem value="English">English</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={translateText}
                    disabled={!translationText.text.trim()}
                    startIcon={<Translate />}
                  >
                    Translate
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Text to Translate"
                    multiline
                    rows={3}
                    value={translationText.text}
                    onChange={(e) => setTranslationText(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Enter text to translate..."
                  />
                </Grid>
                {languageFormErrors.translation && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      {languageFormErrors.translation}
                    </Alert>
                  </Grid>
                )}
                {translationText.result && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Translation"
                      multiline
                      rows={3}
                      value={translationText.result}
                      InputProps={{ readOnly: true }}
                      sx={{ bgcolor: 'grey.50' }}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Essential Phrases</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Load common phrases for your destination language or add your own custom phrases.
              </Alert>
              
              {/* Language Selection */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Load Common Phrases</InputLabel>
                  <Select
                    value=""
                    onChange={(e) => loadCommonPhrases(e.target.value)}
                    label="Load Common Phrases"
                  >
                    <MenuItem value="Spanish">Spanish</MenuItem>
                    <MenuItem value="French">French</MenuItem>
                    <MenuItem value="Japanese">Japanese</MenuItem>
                    <MenuItem value="German">German</MenuItem>
                    <MenuItem value="Hindi">Hindi</MenuItem>
                    <MenuItem value="Kannada">Kannada</MenuItem>
                    <MenuItem value="Telugu">Telugu</MenuItem>
                    <MenuItem value="Tamil">Tamil</MenuItem>
                    <MenuItem value="Bengali">Bengali</MenuItem>
                    <MenuItem value="Marathi">Marathi</MenuItem>
                  </Select>
                </FormControl>
                <Chip
                  label={languageData.selectedLanguage ? `Current: ${languageData.selectedLanguage}` : 'No language selected'}
                  color={languageData.selectedLanguage ? 'primary' : 'default'}
                  variant="outlined"
                />
              </Box>

              {/* Add New Phrase */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="English phrase"
                  value={newPhrase.english}
                  onChange={(e) => setNewPhrase({ ...newPhrase, english: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Translation"
                  value={newPhrase.translation}
                  onChange={(e) => setNewPhrase({ ...newPhrase, translation: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newPhrase.category}
                    onChange={(e) => setNewPhrase({ ...newPhrase, category: e.target.value })}
                    label="Category"
                  >
                    <MenuItem value="basic">Basic</MenuItem>
                    <MenuItem value="emergency">Emergency</MenuItem>
                    <MenuItem value="shopping">Shopping</MenuItem>
                    <MenuItem value="food">Food</MenuItem>
                    <MenuItem value="transport">Transport</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  size="small"
                  onClick={addPhrase}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {languageFormErrors.phrase && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {languageFormErrors.phrase}
                </Alert>
              )}

              {/* Phrases List */}
              <List>
                {languageData.phrases.map((phrase) => (
                  <ListItem key={phrase.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={phrase.english}
                      secondary={`${phrase.translation} • Category: ${phrase.category}${phrase.notes ? ` • ${phrase.notes}` : ''}`}
                    />
                    <Chip
                      label={phrase.category}
                      color={phrase.category === 'emergency' ? 'error' : phrase.category === 'basic' ? 'primary' : 'default'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => removePhrase(phrase.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Custom Phrases</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Add your own custom phrases that are specific to your travel needs.
              </Alert>
              
              {/* Add Custom Phrase */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="English phrase"
                  value={newCustomPhrase.english}
                  onChange={(e) => setNewCustomPhrase({ ...newCustomPhrase, english: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Translation"
                  value={newCustomPhrase.translation}
                  onChange={(e) => setNewCustomPhrase({ ...newCustomPhrase, translation: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Notes (optional)"
                  value={newCustomPhrase.notes}
                  onChange={(e) => setNewCustomPhrase({ ...newCustomPhrase, notes: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addCustomPhrase}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {languageFormErrors.customPhrase && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {languageFormErrors.customPhrase}
                </Alert>
              )}

              {/* Custom Phrases List */}
              <List>
                {languageData.customPhrases.map((phrase) => (
                  <ListItem key={phrase.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={phrase.english}
                      secondary={`${phrase.translation}${phrase.notes ? ` • ${phrase.notes}` : ''}`}
                    />
                    <IconButton onClick={() => removeCustomPhrase(phrase.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Cultural Notes</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Keep track of important cultural information and customs for your destination.
              </Alert>
              
              {/* Add Cultural Note */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Topic (e.g., Greetings, Dining)"
                  value={newCulturalNote.topic}
                  onChange={(e) => setNewCulturalNote({ ...newCulturalNote, topic: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Cultural note"
                  value={newCulturalNote.note}
                  onChange={(e) => setNewCulturalNote({ ...newCulturalNote, note: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Importance</InputLabel>
                  <Select
                    value={newCulturalNote.importance}
                    onChange={(e) => setNewCulturalNote({ ...newCulturalNote, importance: e.target.value })}
                    label="Importance"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  size="small"
                  onClick={addCulturalNote}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {languageFormErrors.culturalNote && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {languageFormErrors.culturalNote}
                </Alert>
              )}

              {/* Cultural Notes List */}
              <List>
                {languageData.culturalNotes.map((note) => (
                  <ListItem key={note.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={note.topic}
                      secondary={note.note}
                    />
                    <Chip
                      label={note.importance}
                      color={note.importance === 'high' ? 'error' : note.importance === 'medium' ? 'warning' : 'default'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => removeCulturalNote(note.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>Pronunciation Guide</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Keep track of how to pronounce difficult words and phrases.
              </Alert>
              
              {/* Add Pronunciation */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Word/Phrase"
                  value={newPronunciation.word}
                  onChange={(e) => setNewPronunciation({ ...newPronunciation, word: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Pronunciation (e.g., Hola = OH-lah)"
                  value={newPronunciation.pronunciation}
                  onChange={(e) => setNewPronunciation({ ...newPronunciation, pronunciation: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Notes (optional)"
                  value={newPronunciation.notes}
                  onChange={(e) => setNewPronunciation({ ...newPronunciation, notes: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addPronunciation}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {languageFormErrors.pronunciation && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {languageFormErrors.pronunciation}
                </Alert>
              )}

              {/* Pronunciation List */}
              <List>
                {languageData.pronunciationGuide.map((pronunciation) => (
                  <ListItem key={pronunciation.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={pronunciation.word}
                      secondary={`${pronunciation.pronunciation}${pronunciation.notes ? ` • ${pronunciation.notes}` : ''}`}
                    />
                    <IconButton onClick={() => removePronunciation(pronunciation.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>Offline Dictionary</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Build your own offline dictionary with words you learn during your travels.
              </Alert>
              
              {/* Add Dictionary Entry */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Word"
                  value={newDictionaryEntry.word}
                  onChange={(e) => setNewDictionaryEntry({ ...newDictionaryEntry, word: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 120 }}
                />
                <TextField
                  size="small"
                  placeholder="Translation"
                  value={newDictionaryEntry.translation}
                  onChange={(e) => setNewDictionaryEntry({ ...newDictionaryEntry, translation: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 120 }}
                />
                <TextField
                  size="small"
                  placeholder="Part of Speech (e.g., noun, verb)"
                  value={newDictionaryEntry.partOfSpeech}
                  onChange={(e) => setNewDictionaryEntry({ ...newDictionaryEntry, partOfSpeech: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <TextField
                  size="small"
                  placeholder="Example (optional)"
                  value={newDictionaryEntry.example}
                  onChange={(e) => setNewDictionaryEntry({ ...newDictionaryEntry, example: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addDictionaryEntry}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {languageFormErrors.dictionary && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {languageFormErrors.dictionary}
                </Alert>
              )}

              {/* Dictionary List */}
              <List>
                {languageData.offlineDictionary.map((entry) => (
                  <ListItem key={entry.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={`${entry.word} (${entry.partOfSpeech})`}
                      secondary={`${entry.translation}${entry.example ? ` • Example: ${entry.example}` : ''}`}
                    />
                    <IconButton onClick={() => removeDictionaryEntry(entry.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 6 && (
            <Box>
              <Typography variant="h6" gutterBottom>Translation History</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                View your recent translations and save important ones for future reference.
              </Alert>
              
              <List>
                {languageData.savedTranslations.map((translation) => (
                  <ListItem key={translation.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={`${translation.from} → ${translation.to}`}
                      secondary={`${translation.original} → ${translation.translated} • ${new Date(translation.date).toLocaleDateString()}`}
                    />
                    <IconButton onClick={() => removeSavedTranslation(translation.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadLanguageGuide} startIcon={<Download />}>
            Download Guide
          </Button>
          <Button onClick={() => setLanguageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Planning Dialog */}
      <Dialog open={planningDialogOpen} onClose={() => setPlanningDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timeline />
            Travel Planning Utilities
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Visa Requirements Checker</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body1" paragraph>
                  Check visa requirements for your destination. Some countries offer visa-free entry for certain nationalities.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Nationality"
                      placeholder="e.g., Indian, US, UK"
                      size="small"
                      value={visaData.nationality}
                      onChange={(e) => setVisaData(prev => ({ ...prev, nationality: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Destination Country"
                      placeholder="e.g., Thailand, Japan, USA"
                      size="small"
                      value={visaData.destination}
                      onChange={(e) => setVisaData(prev => ({ ...prev, destination: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small"
                      onClick={checkVisaRequirements}
                      disabled={!visaData.nationality.trim() || !visaData.destination.trim()}
                    >
                      Check Visa Requirements
                    </Button>
                  </Grid>
                  
                  {/* Visa Results */}
                  {visaData.visaRequired !== null && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: visaData.visaRequired === false ? 'success.light' : 'warning.light', 
                        borderRadius: 1, 
                        mt: 2
                      }}>
                        <Typography variant="h6" color={visaData.visaRequired === false ? 'success.contrastText' : 'warning.contrastText'} gutterBottom>
                          Visa Requirements for {visaData.nationality} → {visaData.destination}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color={visaData.visaRequired === false ? 'success.contrastText' : 'warning.contrastText'}>
                              <strong>Visa Required:</strong> {visaData.visaRequired === false ? 'No' : 'Yes'}
                            </Typography>
                            <Typography variant="body2" color={visaData.visaRequired === false ? 'success.contrastText' : 'warning.contrastText'}>
                              <strong>Visa Type:</strong> {visaData.visaType}
                            </Typography>
                            <Typography variant="body2" color={visaData.visaRequired === false ? 'success.contrastText' : 'warning.contrastText'}>
                              <strong>Processing Time:</strong> {visaData.processingTime}
                            </Typography>
                            <Typography variant="body2" color={visaData.visaRequired === false ? 'success.contrastText' : 'warning.contrastText'}>
                              <strong>Cost:</strong> ₹{visaData.cost}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color={visaData.visaRequired === false ? 'success.contrastText' : 'warning.contrastText'} gutterBottom>
                              <strong>Requirements:</strong>
                            </Typography>
                            <List dense>
                              {visaData.requirements.map((req, index) => (
                                <ListItem key={index} sx={{ py: 0 }}>
                                  <ListItemText
                                    primary={req}
                                    sx={{ 
                                      color: visaData.visaRequired === false ? 'success.contrastText' : 'warning.contrastText',
                                      '& .MuiListItemText-primary': { fontSize: '0.875rem' }
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Document Scanner & Storage</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body1" paragraph>
                  Store digital copies of important documents for easy access during your trip.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <input
                      accept="image/*,.pdf"
                      style={{ display: 'none' }}
                      id="passport-upload"
                      type="file"
                      onChange={(e) => handleDocumentUpload('passport', e.target.files[0])}
                    />
                    <label htmlFor="passport-upload">
                      <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        fullWidth
                        sx={{ mb: 1 }}
                        component="span"
                      >
                        {documents.passport ? 'Update Passport' : 'Upload Passport'}
                      </Button>
                    </label>
                    
                    <input
                      accept="image/*,.pdf"
                      style={{ display: 'none' }}
                      id="visa-upload"
                      type="file"
                      onChange={(e) => handleDocumentUpload('visa', e.target.files[0])}
                    />
                    <label htmlFor="visa-upload">
                      <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        fullWidth
                        sx={{ mb: 1 }}
                        component="span"
                      >
                        {documents.visa ? 'Update Visa' : 'Upload Visa'}
                      </Button>
                    </label>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <input
                      accept="image/*,.pdf"
                      style={{ display: 'none' }}
                      id="insurance-upload"
                      type="file"
                      onChange={(e) => handleDocumentUpload('insurance', e.target.files[0])}
                    />
                    <label htmlFor="insurance-upload">
                      <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        fullWidth
                        sx={{ mb: 1 }}
                        component="span"
                      >
                        {documents.insurance ? 'Update Insurance' : 'Upload Insurance'}
                      </Button>
                    </label>
                    
                    <input
                      accept="image/*,.pdf"
                      style={{ display: 'none' }}
                      id="tickets-upload"
                      type="file"
                      onChange={(e) => handleDocumentUpload('tickets', e.target.files[0])}
                    />
                    <label htmlFor="tickets-upload">
                      <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        fullWidth
                        sx={{ mb: 1 }}
                        component="span"
                      >
                        {documents.tickets ? 'Update Tickets' : 'Upload Tickets'}
                      </Button>
                    </label>
                  </Grid>
                </Grid>

                {/* Document Status */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Document Status:
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(documents).map(([docType, doc]) => (
                      <Grid item xs={12} sm={6} key={docType}>
                        <Box sx={{ 
                          p: 1, 
                          bgcolor: doc ? 'success.light' : 'grey.100', 
                          borderRadius: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                              {docType}
                            </Typography>
                            {doc && (
                              <Typography variant="caption" color="text.secondary">
                                {doc.name} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                            )}
                          </Box>
                          {doc && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeDocument(docType)}
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Documents are stored locally on your device for privacy and security. Maximum file size: 5MB.
                  </Typography>
                </Alert>
              </Box>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Pre-Trip Checklist</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body1" paragraph>
                  Essential tasks to complete before your trip:
                </Typography>
                
                {/* Progress Bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progress: {getChecklistProgress()}%
                    </Typography>
                    <Button size="small" onClick={resetChecklist} color="secondary">
                      Reset All
                    </Button>
                  </Box>
                  <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                    <Box 
                      sx={{ 
                        width: `${getChecklistProgress()}%`, 
                        bgcolor: 'success.main', 
                        height: 8,
                        transition: 'width 0.3s ease'
                      }} 
                    />
                  </Box>
                </Box>

                <List>
                  {checklistItems.map((item) => (
                    <ListItem 
                      key={item.id}
                      sx={{ 
                        bgcolor: item.completed ? 'success.light' : 'transparent',
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: item.completed ? 'success.light' : 'grey.50' }
                      }}
                      onClick={() => toggleChecklistItem(item.id)}
                    >
                      <IconButton
                        color={item.completed ? 'success' : 'default'}
                        sx={{ mr: 1 }}
                      >
                        {item.completed ? <Check /> : <Add />}
                      </IconButton>
                      <ListItemText 
                        primary={item.task}
                        secondary={item.description}
                        sx={{
                          textDecoration: item.completed ? 'line-through' : 'none',
                          color: item.completed ? 'success.contrastText' : 'inherit'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<Download />}
                    onClick={() => {
                      const completedTasks = checklistItems.filter(item => item.completed);
                      const pendingTasks = checklistItems.filter(item => !item.completed);
                      
                      const checklistText = `Pre-Trip Checklist\n\nCompleted Tasks (${completedTasks.length}):\n${completedTasks.map(item => `✅ ${item.task}`).join('\n')}\n\nPending Tasks (${pendingTasks.length}):\n${pendingTasks.map(item => `⏳ ${item.task}`).join('\n')}\n\nProgress: ${getChecklistProgress()}%`;
                      
                      const blob = new Blob([checklistText], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'pre-trip-checklist.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download Checklist
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => {
                      const completedCount = checklistItems.filter(item => item.completed).length;
                      setSnackbar({
                        open: true,
                        message: `You've completed ${completedCount} out of ${checklistItems.length} tasks!`,
                        severity: 'info'
                      });
                    }}
                  >
                    View Summary
                  </Button>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Currency Converter</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body1" paragraph>
                  Quick currency conversion for your destination.
                </Typography>
                
                {/* Quick Conversion Buttons */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Quick Convert:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[100, 500, 1000, 5000, 10000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outlined"
                        size="small"
                        onClick={() => handleCurrencyChange('amount', amount.toString())}
                        sx={{ minWidth: '60px' }}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      size="small"
                      value={currencyData.amount}
                      onChange={(e) => handleCurrencyChange('amount', e.target.value)}
                      InputProps={{
                        startAdornment: <Typography variant="body2" color="text.secondary">₹</Typography>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>From</InputLabel>
                      <Select 
                        label="From"
                        value={currencyData.fromCurrency}
                        onChange={(e) => handleCurrencyChange('fromCurrency', e.target.value)}
                      >
                        <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
                        <MenuItem value="USD">US Dollar ($)</MenuItem>
                        <MenuItem value="EUR">Euro (€)</MenuItem>
                        <MenuItem value="GBP">British Pound (£)</MenuItem>
                        <MenuItem value="THB">Thai Baht (฿)</MenuItem>
                        <MenuItem value="JPY">Japanese Yen (¥)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>To</InputLabel>
                      <Select 
                        label="To"
                        value={currencyData.toCurrency}
                        onChange={(e) => handleCurrencyChange('toCurrency', e.target.value)}
                      >
                        <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
                        <MenuItem value="USD">US Dollar ($)</MenuItem>
                        <MenuItem value="EUR">Euro (€)</MenuItem>
                        <MenuItem value="GBP">British Pound (£)</MenuItem>
                        <MenuItem value="THB">Thai Baht (฿)</MenuItem>
                        <MenuItem value="JPY">Japanese Yen (¥)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small"
                      onClick={convertCurrency}
                      disabled={!currencyData.amount || parseFloat(currencyData.amount) <= 0}
                    >
                      Convert Currency
                    </Button>
                  </Grid>
                  
                  {/* Conversion Result */}
                  {currencyData.convertedAmount !== null && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'success.light', 
                        borderRadius: 1, 
                        mt: 2,
                        textAlign: 'center'
                      }}>
                        <Typography variant="h6" color="success.contrastText" gutterBottom>
                          Conversion Result
                        </Typography>
                        <Typography variant="h4" color="success.contrastText" fontWeight="bold">
                          {currencyData.amount} {currencyData.fromCurrency} = {currencyData.convertedAmount.toFixed(2)} {currencyData.toCurrency}
                        </Typography>
                        <Typography variant="body2" color="success.contrastText" sx={{ mt: 1 }}>
                          Exchange Rate: 1 {currencyData.fromCurrency} = {currencyData.exchangeRate.toFixed(4)} {currencyData.toCurrency}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* Conversion History */}
                  {conversionHistory.length > 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Recent Conversions
                        </Typography>
                        <List dense>
                          {conversionHistory.slice(0, 5).map((conversion) => (
                            <ListItem key={conversion.id} sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                              <ListItemText
                                primary={`${conversion.fromAmount} ${conversion.fromCurrency} = ${conversion.toAmount.toFixed(2)} ${conversion.toCurrency}`}
                                secondary={new Date(conversion.timestamp).toLocaleString()}
                              />
                              <Chip 
                                label={`Rate: ${conversion.exchangeRate.toFixed(4)}`}
                                size="small"
                                color="primary"
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanningDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Connectivity Dialog */}
      <Dialog open={connectivityDialogOpen} onClose={() => setConnectivityDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: 'info.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Wifi />
            Connectivity & Tech Tools
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="WiFi Finder" />
            <Tab label="SIM Cards" />
            <Tab label="Power Adapters" />
            <Tab label="Offline Maps" />
            <Tab label="Tech Checklist" />
            <Tab label="Passwords" />
            <Tab label="Devices" />
          </Tabs>
          
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>WiFi Spots</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Track WiFi spots you find during your travels. Save passwords and locations for easy access.
              </Alert>
              
              {/* Add New WiFi Spot */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="WiFi Name (e.g., Hotel WiFi)"
                  value={newWifiSpot.name}
                  onChange={(e) => setNewWifiSpot({ ...newWifiSpot, name: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Location (e.g., Hotel Lobby)"
                  value={newWifiSpot.location}
                  onChange={(e) => setNewWifiSpot({ ...newWifiSpot, location: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Password (optional)"
                  value={newWifiSpot.password}
                  onChange={(e) => setNewWifiSpot({ ...newWifiSpot, password: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Strength</InputLabel>
                  <Select
                    value={newWifiSpot.strength}
                    onChange={(e) => setNewWifiSpot({ ...newWifiSpot, strength: e.target.value })}
                    label="Strength"
                  >
                    <MenuItem value="excellent">Excellent</MenuItem>
                    <MenuItem value="good">Good</MenuItem>
                    <MenuItem value="fair">Fair</MenuItem>
                    <MenuItem value="poor">Poor</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  size="small"
                  onClick={addWifiSpot}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {connectivityFormErrors.wifiSpot && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {connectivityFormErrors.wifiSpot}
                </Alert>
              )}

              {/* WiFi Spots List */}
              <List>
                {connectivityData.wifiSpots.map((spot) => (
                  <ListItem key={spot.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={spot.name}
                      secondary={`${spot.location}${spot.password ? ` • Password: ${spot.password}` : ''}${spot.notes ? ` • ${spot.notes}` : ''}`}
                    />
                    <Chip
                      label={spot.strength}
                      color={spot.strength === 'excellent' ? 'success' : spot.strength === 'good' ? 'primary' : spot.strength === 'fair' ? 'warning' : 'error'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => removeWifiSpot(spot.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>SIM Card Options</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Compare local SIM card options and costs for your destination. Track data plans and validity periods.
              </Alert>
              
              {/* Add New SIM Card */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Provider (e.g., Vodafone)"
                  value={newSimCard.provider}
                  onChange={(e) => setNewSimCard({ ...newSimCard, provider: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Plan (e.g., 10GB Monthly)"
                  value={newSimCard.plan}
                  onChange={(e) => setNewSimCard({ ...newSimCard, plan: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Cost (e.g., ₹1500)"
                  value={newSimCard.cost}
                  onChange={(e) => setNewSimCard({ ...newSimCard, cost: e.target.value })}
                  sx={{ minWidth: 100 }}
                />
                <TextField
                  size="small"
                  placeholder="Data (e.g., 10GB)"
                  value={newSimCard.data}
                  onChange={(e) => setNewSimCard({ ...newSimCard, data: e.target.value })}
                  sx={{ minWidth: 100 }}
                />
                <TextField
                  size="small"
                  placeholder="Validity (e.g., 30 days)"
                  value={newSimCard.validity}
                  onChange={(e) => setNewSimCard({ ...newSimCard, validity: e.target.value })}
                  sx={{ minWidth: 100 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addSimCard}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {connectivityFormErrors.simCard && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {connectivityFormErrors.simCard}
                </Alert>
              )}

              {/* SIM Cards List */}
              <List>
                {connectivityData.simCards.map((sim) => (
                  <ListItem key={sim.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={`${sim.provider} - ${sim.plan}`}
                      secondary={`Cost: ₹${sim.cost} • Data: ${sim.data} • Validity: ${sim.validity}${sim.notes ? ` • ${sim.notes}` : ''}`}
                    />
                    <IconButton onClick={() => removeSimCard(sim.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Power Adapters</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Check power requirements for your destination and track adapter information.
              </Alert>
              
              {/* Power Requirements Checker */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Enter country name (e.g., USA, UK, Japan, Australia, India)"
                  value={connectivityData.destination}
                  onChange={(e) => setConnectivityData(prev => ({ ...prev, destination: e.target.value }))}
                />
                <Button
                  variant="contained"
                  onClick={() => checkPowerRequirements(connectivityData.destination)}
                  startIcon={<Search />}
                >
                  Check
                </Button>
              </Box>

              {/* Add Custom Power Adapter */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Country"
                  value={newPowerAdapter.country}
                  onChange={(e) => setNewPowerAdapter({ ...newPowerAdapter, country: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 120 }}
                />
                <TextField
                  size="small"
                  placeholder="Adapter Type (e.g., Type A/B)"
                  value={newPowerAdapter.type}
                  onChange={(e) => setNewPowerAdapter({ ...newPowerAdapter, type: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 120 }}
                />
                <TextField
                  size="small"
                  placeholder="Voltage (e.g., 120V)"
                  value={newPowerAdapter.voltage}
                  onChange={(e) => setNewPowerAdapter({ ...newPowerAdapter, voltage: e.target.value })}
                  sx={{ minWidth: 100 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addPowerAdapter}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {connectivityFormErrors.powerAdapter && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {connectivityFormErrors.powerAdapter}
                </Alert>
              )}

              {/* Power Adapters List */}
              <List>
                {connectivityData.powerAdapters.map((adapter) => (
                  <ListItem key={adapter.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={`${adapter.country} - ${adapter.type}`}
                      secondary={`Voltage: ${adapter.voltage}${adapter.frequency ? ` • Frequency: ${adapter.frequency}` : ''}${adapter.notes ? ` • ${adapter.notes}` : ''}`}
                    />
                    <IconButton onClick={() => removePowerAdapter(adapter.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Offline Maps</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Track offline maps you've downloaded for navigation without internet connection.
              </Alert>
              
              {/* Add Offline Map */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Location (e.g., Tokyo, Japan)"
                  value={newOfflineMap.location}
                  onChange={(e) => setNewOfflineMap({ ...newOfflineMap, location: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Size (e.g., 50MB)"
                  value={newOfflineMap.size}
                  onChange={(e) => setNewOfflineMap({ ...newOfflineMap, size: e.target.value })}
                  sx={{ minWidth: 100 }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Download Date"
                  value={newOfflineMap.downloadDate}
                  onChange={(e) => setNewOfflineMap({ ...newOfflineMap, downloadDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addOfflineMap}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {connectivityFormErrors.offlineMap && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {connectivityFormErrors.offlineMap}
                </Alert>
              )}

              {/* Offline Maps List */}
              <List>
                {connectivityData.offlineMaps.map((map) => (
                  <ListItem key={map.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={map.location}
                      secondary={`Size: ${map.size} • Downloaded: ${map.downloadDate}${map.notes ? ` • ${map.notes}` : ''}`}
                    />
                    <IconButton onClick={() => removeOfflineMap(map.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>Tech Checklist</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Track tech items you need to pack and prepare for your trip.
              </Alert>
              
              {/* Add Tech Item */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Tech Item (e.g., Power Bank)"
                  value={newTechItem.item}
                  onChange={(e) => setNewTechItem({ ...newTechItem, item: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newTechItem.priority}
                    onChange={(e) => setNewTechItem({ ...newTechItem, priority: e.target.value })}
                    label="Priority"
                  >
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  size="small"
                  onClick={addTechItem}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {connectivityFormErrors.techItem && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {connectivityFormErrors.techItem}
                </Alert>
              )}

              {/* Tech Checklist */}
              <List>
                {connectivityData.techChecklist.map((item) => (
                  <ListItem key={item.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={item.item}
                      secondary={`Priority: ${item.priority}${item.notes ? ` • ${item.notes}` : ''}`}
                    />
                    <Chip
                      label={item.status}
                      color={item.status === 'completed' ? 'success' : 'warning'}
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => toggleTechItemStatus(item.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label={item.priority}
                      color={item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'default'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => removeTechItem(item.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>Saved Passwords</Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Store important passwords for WiFi, apps, and services. Keep this information secure.
              </Alert>
              
              {/* Add Password */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Service (e.g., Hotel WiFi)"
                  value={newPassword.service}
                  onChange={(e) => setNewPassword({ ...newPassword, service: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Username"
                  value={newPassword.username}
                  onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Password"
                  type="password"
                  value={newPassword.password}
                  onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addPassword}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {connectivityFormErrors.password && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {connectivityFormErrors.password}
                </Alert>
              )}

              {/* Passwords List */}
              <List>
                {connectivityData.savedPasswords.map((password) => (
                  <ListItem key={password.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={password.service}
                      secondary={`Username: ${password.username} • Password: ${'*'.repeat(password.password.length)}${password.notes ? ` • ${password.notes}` : ''}`}
                    />
                    <IconButton onClick={() => removePassword(password.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 6 && (
            <Box>
              <Typography variant="h6" gutterBottom>Device Information</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Track your devices and their specifications for travel planning.
              </Alert>
              
              {/* Main Devices */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Main Devices</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={connectivityData.deviceInfo.phone}
                      onChange={(e) => updateDeviceInfo('phone', e.target.value)}
                      placeholder="e.g., iPhone 14 Pro"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Laptop"
                      value={connectivityData.deviceInfo.laptop}
                      onChange={(e) => updateDeviceInfo('laptop', e.target.value)}
                      placeholder="e.g., MacBook Air M2"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Camera"
                      value={connectivityData.deviceInfo.camera}
                      onChange={(e) => updateDeviceInfo('camera', e.target.value)}
                      placeholder="e.g., Sony A7III"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Add Other Device */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Device Name (e.g., iPad)"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Type (e.g., Tablet)"
                  value={newDevice.type}
                  onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Model (e.g., iPad Pro 12.9 inch)"
                  value={newDevice.model}
                  onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addDevice}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {connectivityFormErrors.device && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {connectivityFormErrors.device}
                </Alert>
              )}

              {/* Other Devices List */}
              <List>
                {connectivityData.deviceInfo.otherDevices.map((device) => (
                  <ListItem key={device.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={`${device.name} (${device.type})`}
                      secondary={`Model: ${device.model}${device.notes ? ` • ${device.notes}` : ''}`}
                    />
                    <IconButton onClick={() => removeDevice(device.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadConnectivityReport} startIcon={<Download />}>
            Download Report
          </Button>
          <Button onClick={() => setConnectivityDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Transportation Dialog */}
      <Dialog open={transportDialogOpen} onClose={() => setTransportDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DirectionsBus />
            Transportation Tools
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Public Transit" />
            <Tab label="Ride-Sharing" />
            <Tab label="Parking" />
            <Tab label="Transport Passes" />
            <Tab label="Saved Routes" />
            <Tab label="Preferences" />
            <Tab label="Cost Analysis" />
          </Tabs>
          
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Public Transit Routes</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Plan and track public transportation routes for your destination.
              </Alert>
              
              {/* Add New Transit Route */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="From (e.g., Airport)"
                  value={newTransitRoute.from}
                  onChange={(e) => setNewTransitRoute({ ...newTransitRoute, from: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="To (e.g., City Center)"
                  value={newTransitRoute.to}
                  onChange={(e) => setNewTransitRoute({ ...newTransitRoute, to: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Mode</InputLabel>
                  <Select
                    value={newTransitRoute.mode}
                    onChange={(e) => setNewTransitRoute({ ...newTransitRoute, mode: e.target.value })}
                    label="Mode"
                  >
                    <MenuItem value="bus">Bus</MenuItem>
                    <MenuItem value="train">Train</MenuItem>
                    <MenuItem value="subway">Subway</MenuItem>
                    <MenuItem value="tram">Tram</MenuItem>
                    <MenuItem value="ferry">Ferry</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Duration (min)"
                  value={newTransitRoute.duration}
                  onChange={(e) => setNewTransitRoute({ ...newTransitRoute, duration: e.target.value })}
                  sx={{ minWidth: 100 }}
                />
                <TextField
                  size="small"
                  placeholder="Cost (₹)"
                  value={newTransitRoute.cost}
                  onChange={(e) => setNewTransitRoute({ ...newTransitRoute, cost: e.target.value })}
                  sx={{ minWidth: 80 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addTransitRoute}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {transportFormErrors.transitRoute && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {transportFormErrors.transitRoute}
                </Alert>
              )}

              {/* Transit Routes List */}
              <List>
                {transportData.publicTransit.map((route) => (
                  <ListItem key={route.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={`${route.from} → ${route.to}`}
                      secondary={`Mode: ${route.mode} • Duration: ${route.duration}min • Cost: ₹${route.cost}${route.frequency ? ` • Frequency: ${route.frequency}` : ''}${route.notes ? ` • ${route.notes}` : ''}`}
                    />
                    <Chip
                      label={route.mode}
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => removeTransitRoute(route.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Ride-Sharing Options</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Compare different ride-sharing services and their costs.
              </Alert>
              
              {/* Add New Ride-Share */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Service (e.g., Uber)"
                  value={newRideShare.service}
                  onChange={(e) => setNewRideShare({ ...newRideShare, service: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 120 }}
                />
                <TextField
                  size="small"
                  placeholder="From"
                  value={newRideShare.from}
                  onChange={(e) => setNewRideShare({ ...newRideShare, from: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 120 }}
                />
                <TextField
                  size="small"
                  placeholder="To"
                  value={newRideShare.to}
                  onChange={(e) => setNewRideShare({ ...newRideShare, to: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 120 }}
                />
                <TextField
                  size="small"
                  placeholder="Cost (₹)"
                  value={newRideShare.cost}
                  onChange={(e) => setNewRideShare({ ...newRideShare, cost: e.target.value })}
                  sx={{ minWidth: 80 }}
                />
                <TextField
                  size="small"
                  placeholder="Duration (min)"
                  value={newRideShare.duration}
                  onChange={(e) => setNewRideShare({ ...newRideShare, duration: e.target.value })}
                  sx={{ minWidth: 100 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addRideShare}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {transportFormErrors.rideShare && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {transportFormErrors.rideShare}
                </Alert>
              )}

              {/* Ride-Sharing List */}
              <List>
                {transportData.rideSharing.map((ride) => (
                  <ListItem key={ride.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={`${ride.service}: ${ride.from} → ${ride.to}`}
                      secondary={`Cost: ₹${ride.cost} • Duration: ${ride.duration}min${ride.notes ? ` • ${ride.notes}` : ''}`}
                    />
                    <IconButton onClick={() => removeRideShare(ride.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Parking Spots</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Track parking locations, costs, and availability for your destination.
              </Alert>
              
              {/* Add New Parking Spot */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Location (e.g., Downtown Garage)"
                  value={newParkingSpot.location}
                  onChange={(e) => setNewParkingSpot({ ...newParkingSpot, location: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newParkingSpot.type}
                    onChange={(e) => setNewParkingSpot({ ...newParkingSpot, type: e.target.value })}
                    label="Type"
                  >
                    <MenuItem value="street">Street</MenuItem>
                    <MenuItem value="garage">Garage</MenuItem>
                    <MenuItem value="lot">Parking Lot</MenuItem>
                    <MenuItem value="hotel">Hotel</MenuItem>
                    <MenuItem value="airport">Airport</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Cost (₹/hour)"
                  value={newParkingSpot.cost}
                  onChange={(e) => setNewParkingSpot({ ...newParkingSpot, cost: e.target.value })}
                  sx={{ minWidth: 100 }}
                />
                <TextField
                  size="small"
                  placeholder="Hours (e.g., 24h)"
                  value={newParkingSpot.hours}
                  onChange={(e) => setNewParkingSpot({ ...newParkingSpot, hours: e.target.value })}
                  sx={{ minWidth: 100 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Availability</InputLabel>
                  <Select
                    value={newParkingSpot.availability}
                    onChange={(e) => setNewParkingSpot({ ...newParkingSpot, availability: e.target.value })}
                    label="Availability"
                  >
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="limited">Limited</MenuItem>
                    <MenuItem value="full">Full</MenuItem>
                    <MenuItem value="reserved">Reserved</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  size="small"
                  onClick={addParkingSpot}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {transportFormErrors.parkingSpot && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {transportFormErrors.parkingSpot}
                </Alert>
              )}

              {/* Parking Spots List */}
              <List>
                {transportData.parkingSpots.map((spot) => (
                  <ListItem key={spot.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={spot.location}
                      secondary={`Type: ${spot.type} • Cost: ₹${spot.cost}/hour • Hours: ${spot.hours}${spot.notes ? ` • ${spot.notes}` : ''}`}
                    />
                    <Chip
                      label={spot.availability}
                      color={spot.availability === 'available' ? 'success' : spot.availability === 'limited' ? 'warning' : 'error'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => removeParkingSpot(spot.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Transport Passes</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Evaluate transport passes and their value for your trip.
              </Alert>
              
              {/* Add New Transport Pass */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Pass Name (e.g., City Pass)"
                  value={newTransportPass.name}
                  onChange={(e) => setNewTransportPass({ ...newTransportPass, name: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newTransportPass.type}
                    onChange={(e) => setNewTransportPass({ ...newTransportPass, type: e.target.value })}
                    label="Type"
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="tourist">Tourist</MenuItem>
                    <MenuItem value="student">Student</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Cost (₹)"
                  value={newTransportPass.cost}
                  onChange={(e) => setNewTransportPass({ ...newTransportPass, cost: e.target.value })}
                  sx={{ minWidth: 80 }}
                />
                <TextField
                  size="small"
                  placeholder="Validity (e.g., 7 days)"
                  value={newTransportPass.validity}
                  onChange={(e) => setNewTransportPass({ ...newTransportPass, validity: e.target.value })}
                  sx={{ minWidth: 100 }}
                />
                <TextField
                  size="small"
                  placeholder="Coverage (e.g., All zones)"
                  value={newTransportPass.coverage}
                  onChange={(e) => setNewTransportPass({ ...newTransportPass, coverage: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addTransportPass}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {transportFormErrors.transportPass && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {transportFormErrors.transportPass}
                </Alert>
              )}

              {/* Transport Passes List */}
              <List>
                {transportData.transportPasses.map((pass) => (
                  <ListItem key={pass.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={pass.name}
                      secondary={`Type: ${pass.type} • Cost: ₹${pass.cost} • Validity: ${pass.validity} • Coverage: ${pass.coverage}${pass.notes ? ` • ${pass.notes}` : ''}`}
                    />
                    <Chip
                      label={pass.type}
                      color="secondary"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => removeTransportPass(pass.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>Saved Routes</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Save your favorite routes for quick access during your trip.
              </Alert>
              
              {/* Add New Saved Route */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Route Name (e.g., Airport to Hotel)"
                  value={newSavedRoute.name}
                  onChange={(e) => setNewSavedRoute({ ...newSavedRoute, name: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="From"
                  value={newSavedRoute.from}
                  onChange={(e) => setNewSavedRoute({ ...newSavedRoute, from: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 120 }}
                />
                <TextField
                  size="small"
                  placeholder="To"
                  value={newSavedRoute.to}
                  onChange={(e) => setNewSavedRoute({ ...newSavedRoute, to: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 120 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Mode</InputLabel>
                  <Select
                    value={newSavedRoute.mode}
                    onChange={(e) => setNewSavedRoute({ ...newSavedRoute, mode: e.target.value })}
                    label="Mode"
                  >
                    <MenuItem value="public">Public Transit</MenuItem>
                    <MenuItem value="rideShare">Ride-Share</MenuItem>
                    <MenuItem value="walking">Walking</MenuItem>
                    <MenuItem value="bike">Bike</MenuItem>
                    <MenuItem value="car">Car</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Duration (min)"
                  value={newSavedRoute.duration}
                  onChange={(e) => setNewSavedRoute({ ...newSavedRoute, duration: e.target.value })}
                  sx={{ minWidth: 100 }}
                />
                <TextField
                  size="small"
                  placeholder="Cost (₹)"
                  value={newSavedRoute.cost}
                  onChange={(e) => setNewSavedRoute({ ...newSavedRoute, cost: e.target.value })}
                  sx={{ minWidth: 80 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addSavedRoute}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {transportFormErrors.savedRoute && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {transportFormErrors.savedRoute}
                </Alert>
              )}

              {/* Saved Routes List */}
              <List>
                {transportData.savedRoutes.map((route) => (
                  <ListItem key={route.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={route.name}
                      secondary={`${route.from} → ${route.to} • Mode: ${route.mode} • Duration: ${route.duration}min • Cost: ₹${route.cost}${route.notes ? ` • ${route.notes}` : ''}`}
                    />
                    <Chip
                      label={route.mode}
                      color="info"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => removeSavedRoute(route.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>Transport Preferences</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Set your transportation preferences to help optimize route planning.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Preferred Mode</InputLabel>
                    <Select
                      value={transportData.transportPreferences.preferredMode}
                      onChange={(e) => updateTransportPreferences('preferredMode', e.target.value)}
                      label="Preferred Mode"
                    >
                      <MenuItem value="public">Public Transit</MenuItem>
                      <MenuItem value="rideShare">Ride-Share</MenuItem>
                      <MenuItem value="walking">Walking</MenuItem>
                      <MenuItem value="bike">Bike</MenuItem>
                      <MenuItem value="car">Car</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Budget (per day)"
                    value={transportData.transportPreferences.budget}
                    onChange={(e) => updateTransportPreferences('budget', e.target.value)}
                    placeholder="e.g., ₹1500"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={transportData.transportPreferences.accessibility}
                        onChange={(e) => updateTransportPreferences('accessibility', e.target.checked)}
                      />
                    }
                    label="Accessibility Required"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={transportData.transportPreferences.ecoFriendly}
                        onChange={(e) => updateTransportPreferences('ecoFriendly', e.target.checked)}
                      />
                    }
                    label="Eco-Friendly Options"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          
          {activeTab === 6 && (
            <Box>
              <Typography variant="h6" gutterBottom>Cost Analysis</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                View a breakdown of your transportation costs and get insights.
              </Alert>
              
              {(() => {
                const costs = calculateTransportCosts();
                return (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Public Transit
                          </Typography>
                          <Typography variant="h4">
                            ₹{costs.transit.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Ride-Share
                          </Typography>
                          <Typography variant="h4">
                            ₹{costs.rideShare.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Parking
                          </Typography>
                          <Typography variant="h4">
                            ₹{costs.parking.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Passes
                          </Typography>
                          <Typography variant="h4">
                            ₹{costs.passes.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                        <CardContent>
                          <Typography variant="h5" gutterBottom>
                            Total Transportation Cost
                          </Typography>
                          <Typography variant="h3">
                            ₹{costs.total.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadTransportReport} startIcon={<Download />}>
            Download Report
          </Button>
          <Button onClick={() => setTransportDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Accommodation Dialog */}
      <Dialog open={accommodationDialogOpen} onClose={() => setAccommodationDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Bed />
            Accommodation Tools
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Hotels" />
            <Tab label="Loyalty Programs" />
            <Tab label="Alternative Stays" />
            <Tab label="Saved Bookings" />
            <Tab label="Check-in Preferences" />
            <Tab label="Preferences" />
            <Tab label="Cost Analysis" />
          </Tabs>
          
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Hotel Comparison</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Compare hotels, track amenities, prices, and locations for your destination.
              </Alert>
              
              {/* Add New Hotel */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Hotel Name"
                  value={newHotel.name}
                  onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Location"
                  value={newHotel.location}
                  onChange={(e) => setNewHotel({ ...newHotel, location: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Price (₹/night)"
                  value={newHotel.price}
                  onChange={(e) => setNewHotel({ ...newHotel, price: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Rating</InputLabel>
                  <Select
                    value={newHotel.rating}
                    onChange={(e) => setNewHotel({ ...newHotel, rating: e.target.value })}
                    label="Rating"
                  >
                    <MenuItem value={1}>1★</MenuItem>
                    <MenuItem value={2}>2★</MenuItem>
                    <MenuItem value={3}>3★</MenuItem>
                    <MenuItem value={4}>4★</MenuItem>
                    <MenuItem value={5}>5★</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  size="small"
                  onClick={addHotel}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {accommodationFormErrors.hotel && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {accommodationFormErrors.hotel}
                </Alert>
              )}

              {/* Hotels List */}
              <List>
                {accommodationData.hotels.map((hotel) => (
                  <ListItem key={hotel.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={hotel.name}
                      secondary={`${hotel.location} • Rating: ${'★'.repeat(hotel.rating)} • Price: ₹${hotel.price}/night${hotel.bookingRef ? ` • Booking: ${hotel.bookingRef}` : ''}${hotel.notes ? ` • ${hotel.notes}` : ''}`}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`${hotel.rating}★`}
                        color="primary"
                        size="small"
                      />
                      <IconButton onClick={() => removeHotel(hotel.id)} color="error" size="small">
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Loyalty Programs</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Track your hotel loyalty programs and maximize points and benefits.
              </Alert>
              
              {/* Add New Loyalty Program */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Program Name (e.g., Marriott Bonvoy)"
                  value={newLoyaltyProgram.program}
                  onChange={(e) => setNewLoyaltyProgram({ ...newLoyaltyProgram, program: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Member ID"
                  value={newLoyaltyProgram.memberId}
                  onChange={(e) => setNewLoyaltyProgram({ ...newLoyaltyProgram, memberId: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Points"
                  value={newLoyaltyProgram.points}
                  onChange={(e) => setNewLoyaltyProgram({ ...newLoyaltyProgram, points: e.target.value })}
                  sx={{ minWidth: 100 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Tier</InputLabel>
                  <Select
                    value={newLoyaltyProgram.tier}
                    onChange={(e) => setNewLoyaltyProgram({ ...newLoyaltyProgram, tier: e.target.value })}
                    label="Tier"
                  >
                    <MenuItem value="basic">Basic</MenuItem>
                    <MenuItem value="silver">Silver</MenuItem>
                    <MenuItem value="gold">Gold</MenuItem>
                    <MenuItem value="platinum">Platinum</MenuItem>
                    <MenuItem value="diamond">Diamond</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  size="small"
                  onClick={addLoyaltyProgram}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {accommodationFormErrors.loyaltyProgram && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {accommodationFormErrors.loyaltyProgram}
                </Alert>
              )}

              {/* Loyalty Programs List */}
              <List>
                {accommodationData.loyaltyPrograms.map((program) => (
                  <ListItem key={program.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={program.program}
                      secondary={`Member ID: ${program.memberId} • Points: ${program.points} • Tier: ${program.tier}${program.expiryDate ? ` • Expires: ${program.expiryDate}` : ''}${program.notes ? ` • ${program.notes}` : ''}`}
                    />
                    <Chip
                      label={program.tier}
                      color={program.tier === 'diamond' ? 'error' : program.tier === 'platinum' ? 'warning' : program.tier === 'gold' ? 'primary' : 'default'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => removeLoyaltyProgram(program.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Alternative Stays</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Find and track hostels, vacation rentals, and unique accommodation options.
              </Alert>
              
              {/* Add New Alternative Stay */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Property Name"
                  value={newAlternativeStay.name}
                  onChange={(e) => setNewAlternativeStay({ ...newAlternativeStay, name: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Location"
                  value={newAlternativeStay.location}
                  onChange={(e) => setNewAlternativeStay({ ...newAlternativeStay, location: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newAlternativeStay.type}
                    onChange={(e) => setNewAlternativeStay({ ...newAlternativeStay, type: e.target.value })}
                    label="Type"
                  >
                    <MenuItem value="hostel">Hostel</MenuItem>
                    <MenuItem value="guesthouse">Guesthouse</MenuItem>
                    <MenuItem value="bnb">B&B</MenuItem>
                    <MenuItem value="apartment">Apartment</MenuItem>
                    <MenuItem value="villa">Villa</MenuItem>
                    <MenuItem value="cabin">Cabin</MenuItem>
                    <MenuItem value="camping">Camping</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Price (₹/night)"
                  value={newAlternativeStay.price}
                  onChange={(e) => setNewAlternativeStay({ ...newAlternativeStay, price: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addAlternativeStay}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {accommodationFormErrors.alternativeStay && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {accommodationFormErrors.alternativeStay}
                </Alert>
              )}

              {/* Alternative Stays List */}
              <List>
                {accommodationData.alternativeStays.map((stay) => (
                  <ListItem key={stay.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={stay.name}
                      secondary={`${stay.location} • Type: ${stay.type} • Price: ₹${stay.price}/night${stay.bookingRef ? ` • Booking: ${stay.bookingRef}` : ''}${stay.notes ? ` • ${stay.notes}` : ''}`}
                    />
                    <Chip
                      label={stay.type}
                      color="secondary"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => removeAlternativeStay(stay.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Saved Bookings</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Save and track your accommodation bookings for easy access.
              </Alert>
              
              {/* Add New Saved Booking */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Property Name"
                  value={newSavedBooking.name}
                  onChange={(e) => setNewSavedBooking({ ...newSavedBooking, name: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <TextField
                  size="small"
                  placeholder="Location"
                  value={newSavedBooking.location}
                  onChange={(e) => setNewSavedBooking({ ...newSavedBooking, location: e.target.value })}
                  sx={{ flexGrow: 1, minWidth: 150 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newSavedBooking.type}
                    onChange={(e) => setNewSavedBooking({ ...newSavedBooking, type: e.target.value })}
                    label="Type"
                  >
                    <MenuItem value="hotel">Hotel</MenuItem>
                    <MenuItem value="hostel">Hostel</MenuItem>
                    <MenuItem value="apartment">Apartment</MenuItem>
                    <MenuItem value="bnb">B&B</MenuItem>
                    <MenuItem value="villa">Villa</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Price (₹/night)"
                  value={newSavedBooking.price}
                  onChange={(e) => setNewSavedBooking({ ...newSavedBooking, price: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <TextField
                  size="small"
                  placeholder="Booking Ref"
                  value={newSavedBooking.bookingRef}
                  onChange={(e) => setNewSavedBooking({ ...newSavedBooking, bookingRef: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addSavedBooking}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {accommodationFormErrors.savedBooking && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {accommodationFormErrors.savedBooking}
                </Alert>
              )}

              {/* Saved Bookings List */}
              <List>
                {accommodationData.savedBookings.map((booking) => (
                  <ListItem key={booking.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={booking.name}
                      secondary={`${booking.location} • Type: ${booking.type} • Price: ₹${booking.price}/night • Booking: ${booking.bookingRef}${booking.checkIn ? ` • Check-in: ${booking.checkIn}` : ''}${booking.checkOut ? ` • Check-out: ${booking.checkOut}` : ''}${booking.notes ? ` • ${booking.notes}` : ''}`}
                    />
                    <Chip
                      label={booking.type}
                      color="info"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => removeSavedBooking(booking.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>Check-in Preferences</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Set your check-in preferences to optimize your arrival experience.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Preferred Check-in Time"
                    type="time"
                    value={accommodationData.checkInPreferences.preferredTime}
                    onChange={(e) => updateCheckInPreferences('preferredTime', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={accommodationData.checkInPreferences.earlyCheckIn}
                        onChange={(e) => updateCheckInPreferences('earlyCheckIn', e.target.checked)}
                      />
                    }
                    label="Request Early Check-in"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={accommodationData.checkInPreferences.lateCheckIn}
                        onChange={(e) => updateCheckInPreferences('lateCheckIn', e.target.checked)}
                      />
                    }
                    label="Request Late Check-in"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Special Requests"
                    multiline
                    rows={3}
                    value={accommodationData.checkInPreferences.specialRequests}
                    onChange={(e) => updateCheckInPreferences('specialRequests', e.target.value)}
                    placeholder="e.g., High floor, quiet room, connecting rooms, etc."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="success">
                    <Typography variant="subtitle2" gutterBottom>
                      Optimal Check-in Time: {getOptimalCheckInTime()}
                    </Typography>
                    <Typography variant="body2">
                      Based on your accommodation preferences, this is the recommended check-in time to avoid crowds and ensure room availability.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>Accommodation Preferences</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Set your accommodation preferences to help find the perfect stay.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Budget (₹/night)"
                    value={accommodationData.accommodationPreferences.budget}
                    onChange={(e) => updateAccommodationPreferences('budget', e.target.value)}
                    placeholder="e.g., 5000"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Accommodation Type</InputLabel>
                    <Select
                      value={accommodationData.accommodationPreferences.type}
                      onChange={(e) => updateAccommodationPreferences('type', e.target.value)}
                      label="Accommodation Type"
                    >
                      <MenuItem value="hotel">Hotel</MenuItem>
                      <MenuItem value="hostel">Hostel</MenuItem>
                      <MenuItem value="apartment">Apartment</MenuItem>
                      <MenuItem value="bnb">B&B</MenuItem>
                      <MenuItem value="villa">Villa</MenuItem>
                      <MenuItem value="business">Business Hotel</MenuItem>
                      <MenuItem value="leisure">Leisure Resort</MenuItem>
                      <MenuItem value="family">Family Hotel</MenuItem>
                      <MenuItem value="backpacker">Backpacker</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Preferred Location"
                    value={accommodationData.accommodationPreferences.location}
                    onChange={(e) => updateAccommodationPreferences('location', e.target.value)}
                    placeholder="e.g., City center, near airport, beachfront"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Minimum Rating</InputLabel>
                    <Select
                      value={accommodationData.accommodationPreferences.rating}
                      onChange={(e) => updateAccommodationPreferences('rating', e.target.value)}
                      label="Minimum Rating"
                    >
                      <MenuItem value={1}>1★</MenuItem>
                      <MenuItem value={2}>2★</MenuItem>
                      <MenuItem value={3}>3★</MenuItem>
                      <MenuItem value={4}>4★</MenuItem>
                      <MenuItem value={5}>5★</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Preferred Amenities
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Parking', 'Air Conditioning', 'Kitchen', 'Balcony', 'Ocean View', 'Mountain View'].map((amenity) => (
                      <Chip
                        key={amenity}
                        label={amenity}
                        color={accommodationData.accommodationPreferences.amenities.includes(amenity) ? 'primary' : 'default'}
                        onClick={() => toggleAmenity(amenity)}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {activeTab === 6 && (
            <Box>
              <Typography variant="h6" gutterBottom>Accommodation Cost Analysis</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                View a breakdown of your accommodation costs and get insights.
              </Alert>
              
              {(() => {
                const costs = calculateAccommodationCosts();
                return (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Hotels
                          </Typography>
                          <Typography variant="h4">
                            ₹{costs.hotels.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Alternative Stays
                          </Typography>
                          <Typography variant="h4">
                            ₹{costs.alternativeStays.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Saved Bookings
                          </Typography>
                          <Typography variant="h4">
                            ₹{costs.savedBookings.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Total Nights
                          </Typography>
                          <Typography variant="h4">
                            {accommodationData.hotels.length + accommodationData.alternativeStays.length + accommodationData.savedBookings.length}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
                        <CardContent>
                          <Typography variant="h5" gutterBottom>
                            Total Accommodation Cost
                          </Typography>
                          <Typography variant="h3">
                            ₹{costs.total.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadAccommodationReport} startIcon={<Download />}>
            Download Report
          </Button>
          <Button onClick={() => setAccommodationDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'warning.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star />
            Upgrade to Pro
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Unlock Advanced Travel Tools
          </Typography>
          <Typography variant="body1" paragraph>
            Get access to premium features including:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Health & Safety Tools" 
                secondary="Vaccination tracking, medical info, emergency contacts"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Language Assistance" 
                secondary="Translations, phrases, and cultural guides"
              />
            </ListItem>


          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>
            Maybe Later
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleUpgrade}
            startIcon={<Upgrade />}
          >
            Upgrade Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setPackingDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TravelTools; 