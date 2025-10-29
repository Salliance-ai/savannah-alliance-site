import React from 'react';
import { Box, Typography } from '@mui/material';

const RevenueDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Revenue Operations
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Smart billing and revenue cycle management coming soon...
      </Typography>
    </Box>
  );
};

export default RevenueDashboard;