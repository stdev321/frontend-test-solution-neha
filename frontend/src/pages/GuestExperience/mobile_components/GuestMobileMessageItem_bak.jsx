import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { constructFullImageUrl } from '../../../components/features/chat/sidebar/helpers';

// Default persona image if none provided
// Use medium size for mobile displays\nconst DEFAULT_PERSONA_IMAGE = '/persona_images/aileen-carol_medium.png';

function GuestMobileMessageItemComponent({ message, personas = [] }) {
  if (!message) return null;
  
  const role = message.role || message.sender || 'assistant';
  const isUser = role === 'user';
  const content = message.content || '';
  
  // Find the persona for this message
  const messagePersona = personas.find(p => p.id === message.persona_id);
  
  // Check if this is a handoff message
  const isHandoff = content.includes('I think that you should now speak to');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: 1,
        my: isHandoff ? 2 : 0.5,
      }}
    >
      {/* Avatar */}
      {isUser ? (
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          <PersonIcon fontSize="small" />
        </Avatar>
      ) : (
        <Avatar 
          sx={{ width: 32, height: 32 }} 
          src={constructFullImageUrl(messagePersona?.image_url || messagePersona?.image || DEFAULT_PERSONA_IMAGE)}
        >
          <MedicalServicesIcon fontSize="small" />
        </Avatar>
      )}
      
      {/* Message bubble */}
      {isHandoff ? (
        // Special styling for handoff messages
        <Box
          sx={{
            bgcolor: 'warning.light',
            color: 'warning.contrastText',
            px: 2,
            py: 1.5,
            borderRadius: 3,
            maxWidth: '85%',
            fontSize: '0.85rem',
            fontStyle: 'italic',
            textAlign: 'center',
            mx: 'auto',
            border: '1px solid',
            borderColor: 'warning.main',
            boxShadow: 1
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            🔄 {content}
          </Typography>
        </Box>
      ) : (
        // Regular message bubble
        <Box
          sx={{
            bgcolor: isUser ? 'primary.main' : 'grey.800',
            color: 'white',
            px: 1.5,
            py: 1,
            borderRadius: 2,
            maxWidth: '70%',
            fontSize: '0.85rem',
          }}
        >
          {!isUser && messagePersona && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                fontWeight: 'bold',
                mb: 0.5,
                opacity: 0.9
              }}
            >
              {messagePersona.name}
            </Typography>
          )}
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {content}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export const GuestMobileMessageItem = GuestMobileMessageItemComponent;
export default GuestMobileMessageItemComponent;