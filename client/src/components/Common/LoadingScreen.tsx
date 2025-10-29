import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          mb: 3,
          width: 60,
          height: 60,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #16325C 0%, #19A69A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.5rem',
        }}
      >
        B
      </Box>
      <CircularProgress size={40} sx={{ mb: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        Loading Botlace
      </Typography>
      <Typography variant="body2" color="text.secondary">
        AI Healthcare Operating System
      </Typography>
    </Box>
  );
};

export default LoadingScreen;