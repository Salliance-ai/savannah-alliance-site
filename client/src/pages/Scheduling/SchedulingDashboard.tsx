import React from 'react';
import { Box, Typography } from '@mui/material';

const SchedulingDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Smart Scheduling
      </Typography>
      <Typography variant="body1" color="text.secondary">
        CareNav intelligent scheduling system coming soon...
      </Typography>
    </Box>
  );
};

export default SchedulingDashboard;