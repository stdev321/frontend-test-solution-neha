import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  Alert
} from '@mui/material';
import Layout from './components/Layout';
import PersonaSelection from './components/PersonaSelection';
import { useAuth } from './utils/AuthContext';
import { getApiBaseUrl } from './utils/api';
import { getAuthToken } from './firebase/auth';
import './styles.css';

function NewConversationPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [title, setTitle] = useState("New Conversation");
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handlePersonaSelectionChange = (newSelection) => {
    setSelectedPersonas(newSelection);
  };
  
  const handleCreateConversation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication error. Please log in again.");
      }
      
      // Make the API call to create a conversation
      const response = await fetch(`${getApiBaseUrl()}/api/conversation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          persona_ids: selectedPersonas,
          use_universal_prompt: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Set conversation ID in localStorage
      localStorage.setItem('usePreviousChat', 'true');
      localStorage.setItem('prevChatId', data.id);
      
      // Navigate to chat page
      navigate('/chat');
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  return (
    <Layout showHeader={true} showFooter={true} isLoggedIn={!!currentUser}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            Create New Conversation
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Conversation Title"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Box>
          
          <PersonaSelection
            selectedPersonas={selectedPersonas}
            onSelectionChange={handlePersonaSelectionChange}
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleCreateConversation}
              disabled={loading || selectedPersonas.length === 0}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Start Conversation'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
}

export default NewConversationPage; 