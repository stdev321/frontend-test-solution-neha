import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Checkbox, 
  FormGroup, 
  FormControlLabel, 
  CircularProgress, 
  Avatar, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid,
  Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { listPersonas } from '../services/personaI18nService';

const PersonaSelection = ({ selectedPersonas, onSelectionChange }) => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    fetchPersonas();
  }, [i18n.language]);
  
  const fetchPersonas = async () => {
    try {
      setLoading(true);
      
      // Fetch personas from i18n files
      const data = await listPersonas(i18n.language);
      
      // Filter to only show non-hidden personas (you might want to add a hidden field in the future)
      // For now, assuming all exported personas are available
      setPersonas(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching personas:", err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  const handlePersonaChange = (personaId) => {
    const newSelection = [...selectedPersonas];
    
    if (newSelection.includes(personaId)) {
      // Remove persona if already selected
      const index = newSelection.indexOf(personaId);
      newSelection.splice(index, 1);
    } else {
      // Add persona if not already selected
      newSelection.push(personaId);
    }
    
    onSelectionChange(newSelection);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>Error loading personas: {error}</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Select AI Personas for Your Conversation
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Choose one or more AI personas to include in this conversation.
      </Typography>
      
      <Grid container spacing={2}>
        {personas.map((persona) => (
          <Grid item xs={12} sm={6} md={4} key={persona.id}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderColor: selectedPersonas.includes(persona.id) ? 'primary.main' : 'divider',
                boxShadow: selectedPersonas.includes(persona.id) ? 2 : 0
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Checkbox 
                  checked={selectedPersonas.includes(persona.id)} 
                  onChange={() => handlePersonaChange(persona.id)}
                />
                {persona.image ? (
                  <Avatar 
                    src={persona.image} 
                    alt={persona.name}
                    sx={{ width: 56, height: 56, ml: 1 }}
                  />
                ) : (
                  <Avatar sx={{ width: 56, height: 56, ml: 1 }}>
                    {persona.name.charAt(0)}
                  </Avatar>
                )}
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6" component="div">
                    {persona.name}
                  </Typography>
                  {persona.specialty && (
                    <Chip 
                      label={persona.specialty} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
              {persona.public_bio && (
                <CardContent sx={{ pt: 0, flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {persona.public_bio}
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PersonaSelection; 