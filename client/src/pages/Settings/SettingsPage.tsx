import React from 'react';
import { Box, Typography } from '@mui/material';

const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Clinic settings and configuration coming soon...
      </Typography>
    </Box>
  );
};

export default SettingsPage;