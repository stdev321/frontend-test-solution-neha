import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Sync as SyncIcon,
  Storage as StorageIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { get, post, put, del } from '../../src/services/api';

// Create a dynamic admin API helper that reads the password from session storage at call time
const withAdminHeader = () => ({
  headers: {
    'X-Admin-Password': sessionStorage.getItem('adminPassword') || ''
  }
});

const adminApi = {
  get: (url) => get(url, withAdminHeader()),
  post: (url, data) => post(url, data, withAdminHeader()),
  put: (url, data) => put(url, data, withAdminHeader()),
  delete: (url) => del(url, withAdminHeader()),
};

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isProduction = import.meta.env.PROD || import.meta.env.VITE_ENVIRONMENT === 'production';
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  
  // Persona form state
  const [personaDialog, setPersonaDialog] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [personaForm, setPersonaForm] = useState({
    id: '',
    name: '',
    specialty: '',
    system_prompt_id: '',
    hidden: false,
    public_bio: '',
    image: '',
    voice: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, persona: null });

  // Prompt form state
  const [promptDialog, setPromptDialog] = useState(false);
  const [promptForm, setPromptForm] = useState({
    persona_id: '',
    content: '',
    language: 'en'
  });

  useEffect(() => {
    // Check if already authenticated
    const authenticated = sessionStorage.getItem('adminAuthenticated');
    const authTime = sessionStorage.getItem('adminAuthTime');
    const savedPassword = sessionStorage.getItem('adminPassword');
    
    if (authenticated === 'true' && authTime) {
      // Check if session is still valid (30 minutes timeout)
      const now = new Date().getTime();
      const authTimestamp = parseInt(authTime);
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (now - authTimestamp < thirtyMinutes && savedPassword) {
        setIsAuthenticated(true);
      } else {
        // Session expired
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminAuthTime');
        sessionStorage.removeItem('adminPassword');
      }
    }
    
    // Clear auth on page unload
    const handleUnload = () => {
      sessionStorage.removeItem('adminAuthenticated');
      sessionStorage.removeItem('adminAuthTime');
      sessionStorage.removeItem('adminPassword');
    };
    
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, activeTab]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Store the entered password only in session storage; the backend will validate it on the next request
    if (!password) {
      setPasswordError('Password required');
      return;
    }
    sessionStorage.setItem('adminPassword', password);
    sessionStorage.setItem('adminAuthenticated', 'true');
    sessionStorage.setItem('adminAuthTime', new Date().getTime().toString());
    setPasswordError('');
    setIsAuthenticated(true);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 0) {
        // Load personas
        const response = await adminApi.get('/api/personas');
        setPersonas(response);
      } else if (activeTab === 1) {
        // Load personas with prompts
        const personasResponse = await adminApi.get('/api/personas');
        setPersonas(personasResponse);
      }
    } catch (error) {
      if (error?.response?.status === 403) {
        // Invalid or expired password
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminAuthTime');
        sessionStorage.removeItem('adminPassword');
        setIsAuthenticated(false);
        setPassword('');
        setPasswordError('Access denied. Please re-enter admin password.');
      } else {
        showAlert('Error loading data: ' + (error.message || 'Unknown error'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, severity = 'info') => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Persona Management
  const handlePersonaEdit = (persona) => {
    setEditingPersona(persona);
    setPersonaForm({
      id: persona.id || '',
      name: persona.name || '',
      specialty: persona.specialty || '',
      system_prompt_id: persona.system_prompt_id || '',
      hidden: persona.hidden || false,
      public_bio: persona.public_bio || '',
      image: persona.image || '',
      voice: persona.voice || ''
    });
    setPersonaDialog(true);
  };

  const handleImageUpload = async () => {
    if (!imageFile || !personaForm.name) {
      showAlert('Please provide persona name and select an image', 'error');
      return null;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('persona_name', personaForm.name);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/personas/upload-image?persona_name=${encodeURIComponent(personaForm.name)}`, {
        method: 'POST',
        headers: {
          'X-Admin-Password': ADMIN_PASSWORD
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const result = await response.json();
      showAlert('Image uploaded and processed successfully', 'success');
      return result.filename;
    } catch (error) {
      showAlert('Error uploading image: ' + error.message, 'error');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePersonaSave = async () => {
    setLoading(true);
    try {
      // Upload image first if provided
      let imageName = personaForm.image;
      if (imageFile && !editingPersona) {
        const uploadedImageName = await handleImageUpload();
        if (uploadedImageName) {
          imageName = uploadedImageName;
        }
      }

      const personaData = {
        ...personaForm,
        image: imageName
      };

      if (editingPersona) {
        // Update existing persona
        await adminApi.put(`/admin/personas/${editingPersona.id}`, personaData);
        showAlert('Persona updated successfully', 'success');
      } else {
        // Create new persona with complete workflow
        await adminApi.post('/admin/personas/create-complete', personaData);
        showAlert('Persona created, synced, and translated successfully', 'success');
      }

      setPersonaDialog(false);
      setEditingPersona(null);
      setPersonaForm({
        id: '',
        name: '',
        specialty: '',
        system_prompt_id: '',
        hidden: false,
        public_bio: '',
        image: '',
        voice: ''
      });
      setImageFile(null);
      loadData();
    } catch (error) {
      showAlert('Error saving persona: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaDelete = async () => {
    const persona = deleteConfirmDialog.persona;
    if (!persona) return;
    
    setLoading(true);
    try {
      await adminApi.delete(`/admin/personas/${persona.id}`);
      showAlert('Persona deleted successfully', 'success');
      setDeleteConfirmDialog({ open: false, persona: null });
      loadData();
    } catch (error) {
      showAlert('Error deleting persona: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Database Operations
  const handleDatabaseUpdate = async () => {
    setLoading(true);
    try {
      await adminApi.post('/admin/database/consistency');
      showAlert('Database consistency updated successfully', 'success');
    } catch (error) {
      showAlert('Error updating database: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleRunScript = async (scriptName) => {
    setLoading(true);
    try {
      await adminApi.post('/admin/scripts/run', { script_name: scriptName });
      showAlert(`Script ${scriptName} executed successfully`, 'success');
    } catch (error) {
      showAlert('Error running script: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Block access in production
  if (isProduction) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" align="center">
            The admin panel is not available in production.
            Please use a local development environment.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Admin Access
          </Typography>
          <form onSubmit={handlePasswordSubmit}>
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={!password}
            >
              Enter
            </Button>
          </form>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <WarningIcon sx={{ mr: 1 }} />
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Local Development Environment - Database: ai_chat_dev
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          ⚠️ NEVER attempt to access /admin on the production server - it's blocked for safety.
        </Typography>
        <Typography variant="body2">
          Changes made here update your local database only. To deploy to production:
        </Typography>
        <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>Complete all persona changes locally</li>
          <li>Test thoroughly in local environment</li>
          <li>Commit and push JSON files to GitHub</li>
          <li>Run database sync script to copy ai_chat_dev → ai_chat</li>
        </ol>
      </Alert>
      
      <Typography variant="h3" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {/* Admin Navigation Menu */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Admin Management Areas
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Database Management
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Manage database connections, migrations, and data sync
                </Typography>
                <Button variant="outlined" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Personas Management
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Create, edit, and manage AI personas and their configurations
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => window.location.href = '/admin/personas'}
                >
                  Go to Personas
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Language Management
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Manage translations and language settings
                </Typography>
                <Button variant="outlined" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Guest Chat Management
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  View and manage guest chat sessions and data
                </Typography>
                <Button variant="outlined" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Prompt Management
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Edit and manage system prompts for all personas
                </Typography>
                <Button variant="outlined" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Management
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Manage user accounts and permissions
                </Typography>
                <Button variant="outlined" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Feedback Management
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  View and manage user feedback submissions
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => window.location.href = '/admin/feedback'}
                >
                  View Feedback
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      <Divider sx={{ mb: 4 }} />
      
      <Typography variant="h4" gutterBottom>
        Quick Admin Tools
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Persona Management" />
          <Tab label="Prompt Editor" />
          <Tab label="Database Operations" />
          <Tab label="System Scripts" />
        </Tabs>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Persona Management Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingPersona(null);
              setPersonaForm({
                id: '',
                name: '',
                specialty: '',
                system_prompt_id: '',
                hidden: false,
                public_bio: '',
                image: '',
                voice: ''
              });
              setPersonaDialog(true);
            }}
          >
            Create New Persona
          </Button>
        </Box>

        <Grid container spacing={2}>
          {personas.map((persona) => (
            <Grid item xs={12} md={6} key={persona.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{persona.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {persona.specialty}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Hidden: {persona.hidden ? 'Yes' : 'No'}
                  </Typography>
                  {persona.voice && (
                    <Typography variant="body2">
                      Voice: {persona.voice}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <IconButton onClick={() => handlePersonaEdit(persona)}>
                      <EditIcon />
                    </IconButton>
                    <Tooltip title="Delete persona (cannot be undone)">
                      <IconButton 
                        color="error"
                        onClick={() => setDeleteConfirmDialog({ open: true, persona })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Prompt Editor Tab */}
      <TabPanel value={activeTab} index={1}>
        <Typography variant="h5" gutterBottom>
          Prompt Management
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Select a persona to view and edit their prompts
        </Alert>
        <Grid container spacing={2}>
          {personas.map((persona) => (
            <Grid item xs={12} key={persona.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{persona.name}</Typography>
                  <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {persona.system_prompt?.content || 'No prompt defined'}
                  </Typography>
                  <Button
                    sx={{ mt: 2 }}
                    variant="outlined"
                    onClick={() => {
                      setPromptForm({
                        persona_id: persona.id,
                        content: persona.system_prompt?.content || '',
                        language: 'en'
                      });
                      setPromptDialog(true);
                    }}
                  >
                    Edit Prompt
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Database Operations Tab */}
      <TabPanel value={activeTab} index={2}>
        <Typography variant="h5" gutterBottom>
          Database Operations
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Database Consistency
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Check and fix database consistency issues
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SyncIcon />}
                  onClick={handleDatabaseUpdate}
                  disabled={loading}
                >
                  Update Database Consistency
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>


      {/* System Scripts Tab */}
      <TabPanel value={activeTab} index={3}>
        <Typography variant="h5" gutterBottom>
          System Scripts
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            ⚠️ DANGER ZONE - Scripts directly modify the database!
          </Typography>
          <Typography variant="body2">
            Only run these scripts if you understand what they do. Always backup first.
          </Typography>
        </Alert>
        
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Database Sync Scripts</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 2 }}>
              These scripts should be run from the command line, not from this interface.
            </Alert>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
              # Deploy local changes to production:
            </Typography>
            <Paper sx={{ p: 1, bgcolor: 'grey.100', mb: 2 }}>
              <code>python scripts/sync_dev_to_production_db.py</code>
            </Paper>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
              # Pull production data to local (emergency):
            </Typography>
            <Paper sx={{ p: 1, bgcolor: 'grey.100' }}>
              <code>python scripts/sync_production_to_dev_db.py</code>
            </Paper>
          </AccordionDetails>
        </Accordion>
        
        <Typography variant="h6" sx={{ mb: 2 }}>Safe Utility Scripts</Typography>
        <Grid container spacing={2}>
          {[
            { 
              name: 'update_persona_voices.py', 
              description: 'Update persona voice assignments',
              risk: 'low',
              warning: 'Updates voice settings for all personas'
            },
            { 
              name: 'analyze_db_sessions.py', 
              description: 'Analyze database sessions',
              risk: 'none',
              warning: 'Read-only analysis script'
            },
            { 
              name: 'export_guest_tables.sh', 
              description: 'Export guest table data',
              risk: 'none',
              warning: 'Creates backup of guest data'
            }
          ].map((script) => (
            <Grid item xs={12} md={6} key={script.name}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{script.name}</Typography>
                    <Chip 
                      label={script.risk === 'none' ? 'Safe' : script.risk === 'low' ? 'Low Risk' : 'High Risk'}
                      color={script.risk === 'none' ? 'success' : script.risk === 'low' ? 'warning' : 'error'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {script.description}
                  </Typography>
                  <Alert severity={script.risk === 'none' ? 'info' : 'warning'} sx={{ mb: 2 }}>
                    <Typography variant="caption">
                      {script.warning}
                    </Typography>
                  </Alert>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (script.risk !== 'none' && !window.confirm(`Are you sure you want to run ${script.name}?`)) {
                        return;
                      }
                      handleRunScript(script.name);
                    }}
                    disabled={loading}
                  >
                    Run Script
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Persona Dialog */}
      <Dialog
        open={personaDialog}
        onClose={() => setPersonaDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPersona ? 'Edit Persona' : 'Create New Persona'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {!editingPersona && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Persona ID (unique identifier)"
                  value={personaForm.id}
                  onChange={(e) => setPersonaForm({ ...personaForm, id: e.target.value })}
                  required
                  helperText="e.g., 'aileencarol', 'drsmith'"
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={personaForm.name}
                onChange={(e) => setPersonaForm({ ...personaForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Specialty"
                value={personaForm.specialty}
                onChange={(e) => setPersonaForm({ ...personaForm, specialty: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="System Prompt ID"
                value={personaForm.system_prompt_id}
                onChange={(e) => setPersonaForm({ ...personaForm, system_prompt_id: e.target.value })}
                required
                helperText="ID of the prompt in the prompts table"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Hidden</InputLabel>
                <Select
                  value={personaForm.hidden}
                  label="Hidden"
                  onChange={(e) => setPersonaForm({ ...personaForm, hidden: e.target.value })}
                >
                  <MenuItem value={false}>No</MenuItem>
                  <MenuItem value={true}>Yes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Voice</InputLabel>
                <Select
                  value={personaForm.voice}
                  label="Voice"
                  onChange={(e) => setPersonaForm({ ...personaForm, voice: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="alloy">Alloy (Neutral)</MenuItem>
                  <MenuItem value="echo">Echo (Male)</MenuItem>
                  <MenuItem value="fable">Fable (British)</MenuItem>
                  <MenuItem value="onyx">Onyx (Deep Male)</MenuItem>
                  <MenuItem value="nova">Nova (Female)</MenuItem>
                  <MenuItem value="shimmer">Shimmer (Soft Female)</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" sx={{ mt: 1 }}>
                Select a voice for text-to-speech functionality
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {!editingPersona ? (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Image Requirements:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Professional headshot preferred" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Background will be automatically removed" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="System creates 3 versions: original, optimized, thumbnail" />
                      </ListItem>
                    </List>
                  </Alert>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    style={{ marginBottom: 8 }}
                  />
                  {imageFile && (
                    <Chip 
                      label={`Selected: ${imageFile.name}`}
                      color="primary"
                      onDelete={() => setImageFile(null)}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              ) : (
                <TextField
                  fullWidth
                  label="Image Filename"
                  value={personaForm.image}
                  onChange={(e) => setPersonaForm({ ...personaForm, image: e.target.value })}
                  helperText="Filename in persona_images directory"
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Public Bio"
                value={personaForm.public_bio}
                onChange={(e) => setPersonaForm({ ...personaForm, public_bio: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setPersonaDialog(false);
            setImageFile(null);
          }}>Cancel</Button>
          <Button onClick={handlePersonaSave} variant="contained" disabled={loading || uploadingImage}>
            {uploadingImage ? 'Uploading...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Prompt Dialog */}
      <Dialog
        open={promptDialog}
        onClose={() => setPromptDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Prompt</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            label="Prompt Content"
            value={promptForm.content}
            onChange={(e) => setPromptForm({ ...promptForm, content: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromptDialog(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              try {
                await adminApi.put(`/admin/personas/${promptForm.persona_id}/prompt`, {
                  prompt: promptForm.content
                });
                showAlert('Prompt updated successfully', 'success');
                setPromptDialog(false);
                loadData();
              } catch (error) {
                showAlert('Error updating prompt: ' + error.message, 'error');
              }
            }}
            variant="contained"
            disabled={loading}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog.open}
        onClose={() => setDeleteConfirmDialog({ open: false, persona: null })}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="error" sx={{ mr: 1 }} />
            Confirm Persona Deletion
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          {deleteConfirmDialog.persona && (
            <Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Are you sure you want to delete the following persona?
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body2"><strong>Name:</strong> {deleteConfirmDialog.persona.name}</Typography>
                <Typography variant="body2"><strong>ID:</strong> {deleteConfirmDialog.persona.id}</Typography>
                <Typography variant="body2"><strong>Specialty:</strong> {deleteConfirmDialog.persona.specialty}</Typography>
              </Paper>
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  This will also delete:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="• All translations in 30+ languages" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Associated prompts (if not used by other personas)" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Tag associations" />
                  </ListItem>
                </List>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog({ open: false, persona: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handlePersonaDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}