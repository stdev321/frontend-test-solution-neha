import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Fade,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { searchPersonas } from '../../../services/api';

// Simple debounce implementation
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function PersonaSearchBar({ 
  onPersonaSelect, 
  selectedPersonaIds = {},
  sx = {} 
}) {
  const { t } = useTranslation('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      console.log('Search triggered with query:', query);
      if (!query.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        console.log('Calling searchPersonas API with:', query);
        const results = await searchPersonas(query, 10);
        console.log('Search results:', results);
        setSearchResults(results || []);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching personas:', error);
        console.error('Error details:', error.response || error.message);
        setSearchResults([]);
        setShowResults(true); // Show "no results" message
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handlePersonaClick = (persona) => {
    if (onPersonaSelect) {
      onPersonaSelect(persona);
    }
    // Clear search after selection
    handleClear();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      console.log('Enter pressed, forcing search for:', searchQuery);
      // Force immediate search on Enter
      debouncedSearch.cancel && debouncedSearch.cancel();
      debouncedSearch(searchQuery);
    }
  };

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <TextField
        fullWidth
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={t('personaSearch.placeholder')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isSearching ? (
                <CircularProgress size={20} />
              ) : searchQuery ? (
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : null}
            </InputAdornment>
          ),
        }}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 1,
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />

      {/* Search Results Dropdown */}
      <Fade in={showResults && searchResults.length > 0}>
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            maxHeight: 300,
            overflow: 'auto',
            zIndex: 1300,
          }}
        >
          <List dense>
            {searchResults.map((persona, index) => {
              const isSelected = !!selectedPersonaIds[persona.id];
              return (
                <React.Fragment key={persona.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    button
                    onClick={() => !isSelected && handlePersonaClick(persona)}
                    disabled={isSelected}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      opacity: isSelected ? 0.6 : 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={persona.avatar_url}
                        alt={persona.name}
                        sx={{ width: 40, height: 40 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {persona.name}
                          </Typography>
                          {isSelected && (
                            <Chip 
                              label={t('personaSearch.selected')} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {persona.specialty || persona.short_description}
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      </Fade>

      {/* No Results Message */}
      <Fade in={showResults && searchResults.length === 0 && searchQuery.trim() && !isSearching}>
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            p: 2,
            zIndex: 1300,
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            {t('personaSearch.noResults', { query: searchQuery })}
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
            {t('personaSearch.searchSuggestions')}
          </Typography>
        </Paper>
      </Fade>
    </Box>
  );
}