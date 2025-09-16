import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent,
  TextField, 
  Button, 
  Box, 
  IconButton,
  Fab,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Rating,
  Chip,
  Alert
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Screenshot as ScreenshotIcon,
  Edit as EditIcon,
  Rectangle as RectangleIcon,
  ArrowRightAlt as ArrowIcon,
  Undo as UndoIcon,
  ChatBubbleOutline as FeedbackIcon,
  Lightbulb as FeatureIcon,
  BugReport as BugIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Brush as BrushIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import html2canvas from 'html2canvas';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../services/api';

const SimpleFeedbackWidget = () => {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [screenshot, setScreenshot] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [drawMode, setDrawMode] = useState('pencil');
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const canvasRef = useRef(null);
  const [startPos, setStartPos] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [editingScreenshot, setEditingScreenshot] = useState(false);

  useEffect(() => {
    console.log('SimpleFeedbackWidget mounted! Button should be visible on right side.');
    // Reset submitting state on mount in case it got stuck
    setSubmitting(false);
    return () => console.log('SimpleFeedbackWidget unmounted');
  }, []);

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleAnnotateClick = async () => {
    // Close dialog immediately and capture
    setOpen(false);
    setIsCapturing(true);
    
    // Wait for dialog to close
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(document.body, {
          ignoreElements: (element) => {
            // Ignore feedback widget tab
            return element.id === 'feedback-widget-tab' ||
                   element.id === 'annotation-toolbar';
          },
          scale: window.devicePixelRatio || 1,
          useCORS: true,
          logging: false,
          width: window.innerWidth,
          height: window.innerHeight,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight
        });
        
        // Convert to data URL
        const screenshotData = canvas.toDataURL('image/png');
        setScreenshot(screenshotData);
        setAnnotations([]);
        setEditingScreenshot(true);
      } catch (error) {
        console.error('Screenshot failed:', error);
        alert('Failed to capture screenshot. Please try again.');
        setOpen(true);
      }
      setIsCapturing(false);
    }, 300);
  };

  const startDrawing = (e) => {
    if (!screenshot) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    if (drawMode === 'pencil') {
      setCurrentPath([pos]);
    } else {
      setStartPos(pos);
    }
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (drawMode === 'pencil') {
      // For pencil mode, just draw the line segment
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (currentPath.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentPath[currentPath.length - 1].x, currentPath[currentPath.length - 1].y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
      }
      
      setCurrentPath([...currentPath, currentPos]);
    } else {
      // For shapes, redraw everything
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Redraw all saved annotations
        redrawAnnotations(ctx);
        
        // Draw current shape
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        if (drawMode === 'arrow' && startPos) {
          drawArrow(ctx, startPos, currentPos);
        } else if (drawMode === 'rect' && startPos) {
          ctx.strokeRect(
            startPos.x, 
            startPos.y, 
            currentPos.x - startPos.x, 
            currentPos.y - startPos.y
          );
        }
      };
      img.src = screenshot;
    }
  };

  const redrawAnnotations = (ctx) => {
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    annotations.forEach(ann => {
      if (ann.type === 'pencil') {
        ctx.beginPath();
        ann.path.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      } else if (ann.type === 'arrow') {
        drawArrow(ctx, ann.start, ann.end);
      } else if (ann.type === 'rect') {
        ctx.strokeRect(
          ann.start.x, 
          ann.start.y, 
          ann.end.x - ann.start.x, 
          ann.end.y - ann.start.y
        );
      }
    });
  };

  const drawArrow = (ctx, from, to) => {
    const headlen = 15;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.lineTo(
      to.x - headlen * Math.cos(angle - Math.PI / 6),
      to.y - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headlen * Math.cos(angle + Math.PI / 6),
      to.y - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    
    if (drawMode === 'pencil' && currentPath.length > 0) {
      setAnnotations([...annotations, {
        type: 'pencil',
        path: currentPath
      }]);
      setCurrentPath([]);
    } else if (startPos) {
      const rect = canvasRef.current.getBoundingClientRect();
      const endPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      setAnnotations([...annotations, {
        type: drawMode,
        start: startPos,
        end: endPos
      }]);
      setStartPos(null);
    }

    setIsDrawing(false);
  };

  const undoLastAnnotation = () => {
    const newAnnotations = [...annotations];
    newAnnotations.pop();
    setAnnotations(newAnnotations);
    
    // Redraw canvas
    if (screenshot && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        redrawAnnotations(ctx);
      };
      img.src = screenshot;
    }
  };

  const clearAllAnnotations = () => {
    setAnnotations([]);
    
    // Redraw canvas with just the screenshot
    if (screenshot && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = screenshot;
    }
  };

  const [showThankYou, setShowThankYou] = useState(false);

  const handleSubmit = async () => {
    // Validate based on feedback type
    if (feedbackType === 'rating' && rating === 0) {
      alert('Please select a rating');
      return;
    }
    if ((feedbackType === 'bug' || feedbackType === 'feature') && !title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    setSubmitting(true);
    try {
      // Use the saved screenshot
      let annotatedScreenshot = screenshot;
      
      console.log('Screenshot state:', screenshot ? `Present (length: ${screenshot.length})` : 'Not present');

      // Prepare feedback data
      const feedbackData = {
        type: feedbackType,
        title: title.trim() || (feedbackType === 'rating' ? `Rating: ${rating} stars` : ''),
        description: description.trim() || '',
        rating: feedbackType === 'rating' ? rating : null,
        email: currentUser?.email || email.trim() || 'anonymous',
        userId: currentUser?.uid || 'guest', 
        userName: currentUser?.displayName || 'Guest User',
        pageUrl: window.location.href,
        userAgent: navigator.userAgent.substring(0, 500),
        createdAt: new Date().toISOString()
      };

      // Add screenshot if it's not too large (under 1MB base64)
      if (annotatedScreenshot && annotatedScreenshot.length < 1000000) {
        feedbackData.screenshot = annotatedScreenshot;
        console.log('Screenshot added to feedback data');
      } else if (annotatedScreenshot) {
        console.warn('Screenshot too large, saving without screenshot');
      } else {
        console.log('No screenshot to add');
      }

      // Send feedback to backend API
      const response = await fetch(`${API_BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error('Failed to submit feedback');
      }

      const result = await response.json();
      console.log('✅ Feedback saved successfully:', result);

      // Show thank you message
      setShowThankYou(true);
      
      // Close after 2 seconds
      setTimeout(() => {
        // Reset form
        setTitle('');
        setDescription('');
        setRating(0);
        setFeedbackType('');
        setScreenshot(null);
        setAnnotations([]);
        setShowThankYou(false);
        setOpen(false);
        setSubmitting(false); // Make sure to reset submitting
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Generic error message for users - no technical details
      alert('Feedback not saved. Try again later. Thank you for your patience.');
      setSubmitting(false); // Reset on error
    }
  };

  useEffect(() => {
    if (screenshot && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        // Use full window dimensions
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Redraw existing annotations
        if (annotations.length > 0) {
          redrawAnnotations(ctx);
        }
      };
      img.src = screenshot;
    }
  }, [screenshot]);

  return (
    <>
      {/* Single Feedback Button - Clean and Simple - Hide when dialog is open */}
      {!open && (
        <Button
          id="feedback-widget-tab"
          onClick={() => setOpen(true)}
          disableRipple
          sx={{
          position: 'fixed',
          right: 0, // Flush with right edge
          top: '45%', // 5% higher
          writingMode: 'vertical-rl',
          transform: 'translateY(-50%) translateX(20%)', // Stick out more
          backgroundColor: '#5E5EE6', // Bright purple normally
          color: 'white',
          padding: '14px 6px', // Slightly wider for visibility
          borderRadius: '6px 0 0 6px',
          fontSize: '13px', // Slightly larger text
          fontWeight: 500,
          minWidth: 'auto',
          border: 'none',
          zIndex: 2147483647,
          '&:hover': {
            backgroundColor: 'rgba(94, 94, 230, 0.7)', // Dimmer purple on hover
            transform: 'translateY(-50%) translateX(15%)', // Slight movement on hover
            boxShadow: '-2px 0 8px rgba(0,0,0,0.25)',
          },
          '&::before': {
            display: 'none', // Remove any Material-UI overlays
          },
          boxShadow: '-1px 0 4px rgba(0,0,0,0.15)',
          transition: 'all 0.2s ease',
          textTransform: 'none',
          letterSpacing: '0.5px',
        }}
      >
          <FeedbackIcon sx={{ fontSize: '14px', marginBottom: '6px' }} />
          Feedback
        </Button>
      )}

      {/* Feedback Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: 400,
            zIndex: 1300, // High enough for dialog, but not blocking header
            '& .MuiDialogContent-root': {
              pb: 2  // Reduce bottom padding
            }
          }
        }}
        sx={{
          zIndex: 1300 // Also set z-index on Dialog wrapper
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
          fontWeight: 600
        }}>
          We'd Love Your Feedback!
          <IconButton onClick={() => {
            setOpen(false);
            setFeedbackType('');
            setTitle('');
            setDescription('');
            setRating(0);
            setScreenshot(null);
            setAnnotations([]);
            setSubmitting(false); // Reset submitting state
          }} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2.5, minHeight: feedbackType ? 'auto' : '300px', display: 'flex', flexDirection: 'column' }}>
          {!feedbackType ? (
            // Feedback Type Selection
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, justifyContent: 'center' }}>
              <Typography variant="body1" sx={{ mb: 0.5, textAlign: 'center' }}>
                What would you like to do?
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Card 
                  sx={{ 
                    flex: 1, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => setFeedbackType('feature')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                    <FeatureIcon sx={{ fontSize: 36, color: '#5E5EE6', mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>Suggest a Feature</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      Have an idea to improve VirtualMD?
                    </Typography>
                  </CardContent>
                </Card>

                <Card 
                  sx={{ 
                    flex: 1, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => setFeedbackType('bug')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                    <BugIcon sx={{ fontSize: 36, color: '#9C27B0', mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>Report an Issue</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      Something not working right?
                    </Typography>
                  </CardContent>
                </Card>

                <Card 
                  sx={{ 
                    flex: 1, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => setFeedbackType('rating')}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <StarIcon sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                    <Typography variant="h6">Rate Us!</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Share your experience
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          ) : (
            // Feedback Form
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={
                    feedbackType === 'feature' ? 'Feature Request' :
                    feedbackType === 'bug' ? 'Bug Report' : 'Rating'
                  }
                  sx={{
                    backgroundColor: 
                      feedbackType === 'feature' ? '#5E5EE6' :
                      feedbackType === 'bug' ? '#9C27B0' : '#2196F3',
                    color: 'white'
                  }}
                  icon={
                    feedbackType === 'feature' ? <FeatureIcon sx={{ color: 'white !important' }} /> :
                    feedbackType === 'bug' ? <BugIcon sx={{ color: 'white !important' }} /> : 
                    <StarIcon sx={{ color: 'white !important' }} />
                  }
                />
                <Button 
                  size="small" 
                  onClick={() => setFeedbackType('')}
                  sx={{ ml: 'auto' }}
                >
                  Change Type
                </Button>
              </Box>

              {feedbackType === 'rating' && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    How would you rate your experience?
                  </Typography>
                  <Rating
                    value={rating}
                    onChange={(e, newValue) => setRating(newValue)}
                    size="large"
                    sx={{ fontSize: '3rem' }}
                  />
                </Box>
              )}

              {feedbackType !== 'rating' && (
                <TextField
                  label={feedbackType === 'feature' ? 'Feature Title' : 'Issue Title'}
                  variant="outlined"
                  fullWidth
                  value={title}
                  onChange={(e) => {
                    console.log('Title changing from:', title, 'to:', e.target.value);
                    setTitle(e.target.value);
                  }}
                  placeholder={
                    feedbackType === 'feature' 
                      ? "What feature would you like to see?"
                      : "What issue are you experiencing?"
                  }
                  required
                />
              )}

              <TextField
                label={
                  feedbackType === 'feature' ? 'Feature Description' :
                  feedbackType === 'bug' ? 'Issue Description' : 'Comments (Optional)'
                }
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  feedbackType === 'feature' 
                    ? "Describe how this feature would help you..."
                    : feedbackType === 'bug'
                    ? "Please describe what happened..."
                    : "Any additional comments?"
                }
                required={false}
              />

              {!currentUser && (
                <TextField
                  label="Email (Optional)"
                  variant="outlined"
                  fullWidth
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  helperText="We'll only use this to follow up on your feedback"
                />
              )}

              {/* Screenshot Section - For bug reports and feature requests */}
              {(feedbackType === 'bug' || feedbackType === 'feature') && (
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                  {!screenshot ? (
                    <Button
                      variant="outlined"
                      startIcon={<ScreenshotIcon />}
                      onClick={handleAnnotateClick}
                      disabled={isCapturing}
                      sx={{ flex: '0 0 auto' }}
                    >
                      Annotate a Screenshot
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <CheckCircleIcon sx={{ color: '#5E5EE6' }} />
                      <Typography variant="body2">
                        Screenshot attached
                      </Typography>
                      <Button 
                        size="small"
                        onClick={() => setEditingScreenshot(true)}
                        startIcon={<EditIcon />}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small"
                        onClick={() => {
                          setScreenshot(null);
                          setAnnotations([]);
                        }}
                        color="error"
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Thank You Message */}
          {showThankYou && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: '#5E5EE6', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                Thank You!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                We appreciate your feedback and will review it shortly.
              </Typography>
            </Box>
          )}

          {/* Submit Buttons */}
          {feedbackType && !showThankYou && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                disabled={(() => {
                  const isDisabled = submitting || 
                    (feedbackType === 'rating' && rating === 0) ||
                    (feedbackType === 'bug' && !title) ||
                    (feedbackType === 'feature' && !title);
                  console.log('Button disabled?', isDisabled, {
                    submitting, feedbackType, title, description, rating
                  });
                  return isDisabled;
                })()}
                sx={{
                  backgroundColor: '#5E5EE6',
                  '&:hover': {
                    backgroundColor: '#4848C4'
                  }
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Screenshot Annotation Mode with Floating Toolbar */}
      {editingScreenshot && screenshot && (
        <>
          {/* Full screen canvas overlay */}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              startDrawing({
                clientX: touch.clientX,
                clientY: touch.clientY
              });
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              draw({
                clientX: touch.clientX,
                clientY: touch.clientY
              });
            }}
            onTouchEnd={stopDrawing}
            style={{
              position: 'fixed',
              top: '70px', // Start below header (APP_BAR_HEIGHT + margin)
              left: 0,
              width: '100vw',
              height: 'calc(100vh - 70px)', // Adjust height to exclude header area
              zIndex: 1200, // Lower than header's z-index but still high
              cursor: drawMode === 'eraser' ? 'grab' : 'crosshair',
              display: 'block'
            }}
          />
          
          {/* Movable Annotation Toolbar */}
          <Box
            id="annotation-toolbar"
            sx={{
              position: 'fixed',
              top: '80px', // Position below header
              right: '20px',
              zIndex: 1250, // Higher than canvas but lower than header
              backgroundColor: 'white',
              borderRadius: 2,
              boxShadow: 3,
              p: 1,
              display: 'flex',
              gap: 1,
              cursor: 'move'
            }}
            draggable
            onDragEnd={(e) => {
              e.currentTarget.style.position = 'fixed';
              e.currentTarget.style.left = `${e.clientX - 100}px`;
              e.currentTarget.style.top = `${e.clientY - 20}px`;
              e.currentTarget.style.right = 'auto';
            }}
          >
            <IconButton
              onClick={() => setDrawMode('pencil')}
              color={drawMode === 'pencil' ? 'primary' : 'default'}
              title="Pencil"
            >
              <BrushIcon />
            </IconButton>
            <IconButton
              onClick={clearAllAnnotations}
              title="Eraser (Clear All)"
            >
              <ClearIcon />
            </IconButton>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                // Save the canvas data before closing
                if (canvasRef.current) {
                  const savedScreenshot = canvasRef.current.toDataURL('image/jpeg', 0.8);
                  setScreenshot(savedScreenshot);
                }
                setEditingScreenshot(false);
                setOpen(true);
              }}
              sx={{
                backgroundColor: '#5E5EE6',
                '&:hover': {
                  backgroundColor: '#4848C4'
                }
              }}
            >
              Save
            </Button>
          </Box>
        </>
      )}
    </>
  );
};

export default SimpleFeedbackWidget;