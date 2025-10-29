import React from 'react';
import { Box, Typography } from '@mui/material';

const PatientProfile: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Patient Profile
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Patient360 unified profile coming soon...
      </Typography>
    </Box>
  );
};

export default PatientProfile;