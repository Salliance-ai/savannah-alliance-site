import React from 'react';
import { Box, Typography } from '@mui/material';

const ClinicalDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Clinical Operations
      </Typography>
      <Typography variant="body1" color="text.secondary">
        AI-powered clinical documentation and decision support coming soon...
      </Typography>
    </Box>
  );
};

export default ClinicalDashboard;