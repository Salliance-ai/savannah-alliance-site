import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  // Mock patient data
  const patients = [
    {
      id: 'P001234',
      firstName: 'John',
      lastName: 'Doe',
      age: 45,
      gender: 'Male',
      phone: '(555) 123-4567',
      email: 'john.doe@email.com',
      lastVisit: '2024-01-15',
      nextAppointment: '2024-02-10',
      riskScore: 75,
      conditions: ['Diabetes', 'Hypertension'],
      provider: 'Dr. Smith',
      status: 'Active',
    },
    {
      id: 'P001235',
      firstName: 'Jane',
      lastName: 'Smith',
      age: 32,
      gender: 'Female',
      phone: '(555) 234-5678',
      email: 'jane.smith@email.com',
      lastVisit: '2024-01-20',
      nextAppointment: null,
      riskScore: 25,
      conditions: ['Annual Physical'],
      provider: 'Dr. Johnson',
      status: 'Active',
    },
    {
      id: 'P001236',
      firstName: 'Robert',
      lastName: 'Johnson',
      age: 68,
      gender: 'Male',
      phone: '(555) 345-6789',
      email: 'robert.johnson@email.com',
      lastVisit: '2024-01-18',
      nextAppointment: '2024-01-25',
      riskScore: 85,
      conditions: ['Heart Disease', 'Diabetes', 'High Cholesterol'],
      provider: 'Dr. Williams',
      status: 'Active',
    },
  ];

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, patientId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patientId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPatient(null);
  };

  const handleViewProfile = () => {
    if (selectedPatient) {
      navigate(`/patients/${selectedPatient}`);
    }
    handleMenuClose();
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'error';
    if (score >= 40) return 'warning';
    return 'success';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  const columns: GridColDef[] = [
    {
      field: 'patient',
      headerName: 'Patient',
      width: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {params.row.firstName} {params.row.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {params.row.id}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'demographics',
      headerName: 'Demographics',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">
            {params.row.age} years, {params.row.gender}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.phone}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'riskScore',
      headerName: 'Risk Score',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={getRiskLabel(params.row.riskScore)}
          color={getRiskColor(params.row.riskScore)}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'conditions',
      headerName: 'Conditions',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          {params.row.conditions.slice(0, 2).map((condition: string, index: number) => (
            <Chip
              key={index}
              label={condition}
              size="small"
              variant="outlined"
              sx={{ mr: 0.5, mb: 0.5, fontSize: '0.75rem' }}
            />
          ))}
          {params.row.conditions.length > 2 && (
            <Typography variant="caption" color="text.secondary">
              +{params.row.conditions.length - 2} more
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'provider',
      headerName: 'Provider',
      width: 150,
    },
    {
      field: 'lastVisit',
      headerName: 'Last Visit',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {new Date(params.row.lastVisit).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'nextAppointment',
      headerName: 'Next Appointment',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color={params.row.nextAppointment ? 'text.primary' : 'text.secondary'}>
          {params.row.nextAppointment 
            ? new Date(params.row.nextAppointment).toLocaleDateString()
            : 'Not scheduled'
          }
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuClick(e, params.row.id)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Patients
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your patient records and care plans
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/patients/new')}
        >
          Add Patient
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                1,247
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Patients
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'error.main' }}>
                23
              </Typography>
              <Typography variant="body2" color="text.secondary">
                High Risk
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                45
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Appointments Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'success.main' }}>
                92%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Engagement Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
            >
              Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Patient Table */}
      <Card>
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={patients}
            columns={columns}
            pageSize={25}
            rowsPerPageOptions={[25, 50, 100]}
            disableSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
          />
        </Box>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewProfile}>View Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Schedule Appointment</MenuItem>
        <MenuItem onClick={handleMenuClose}>Send Message</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit Patient</MenuItem>
      </Menu>
    </Box>
  );
};

export default PatientList;