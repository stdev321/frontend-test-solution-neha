import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { getTimeAgo } from '../../utils/conversationCache';

export default function CachedDataDialog({ 
  open, 
  onClose, 
  type,
  timestamp,
  onViewCached,
  onGenerateNew 
}) {
  const timeAgo = getTimeAgo(timestamp);
  
  const getTitle = () => {
    switch(type) {
      case 'summary':
        return 'Previous Summary Available';
      case 'differentialOpinion':
        return 'Previous Differential Opinion Available';
      case 'encyclopedia':
        return 'Previous Search Results Available';
      default:
        return 'Previous Data Available';
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {getTitle()}
      </DialogTitle>
      <DialogContent>
        <Typography>
          A {type === 'differentialOpinion' ? 'differential opinion' : type} was generated {timeAgo}. Would you like to view it or generate a new one?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onViewCached} variant="contained">
          View Previous
        </Button>
        <Button onClick={onGenerateNew} variant="outlined">
          Generate New
        </Button>
      </DialogActions>
    </Dialog>
  );
}