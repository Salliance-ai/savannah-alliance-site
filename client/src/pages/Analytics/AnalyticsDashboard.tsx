import React from 'react';
import { Box, Typography } from '@mui/material';

const AnalyticsDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Enterprise Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary">
        C-suite dashboard and organizational intelligence coming soon...
      </Typography>
    </Box>
  );
};

export default AnalyticsDashboard;