import React from 'react';
import { Box, Typography } from '@mui/material';

const MarketingDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Marketing CRM
      </Typography>
      <Typography variant="body1" color="text.secondary">
        GoHighLevel integration and AI marketing automation coming soon...
      </Typography>
    </Box>
  );
};

export default MarketingDashboard;