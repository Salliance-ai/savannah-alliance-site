import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalHospital as ClinicalIcon,
  Schedule as ScheduleIcon,
  AttachMoney as RevenueIcon,
  Campaign as MarketingIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useClinic } from '../../contexts/ClinicContext';

interface SidebarProps {
  onItemClick?: () => void;
}

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactElement;
  permission?: {
    module: string;
    action: string;
  };
  badge?: string;
  color?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { clinic } = useClinic();

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      title: 'Patients',
      path: '/patients',
      icon: <PeopleIcon />,
      permission: { module: 'clinical', action: 'read' },
    },
    {
      title: 'Clinical Ops',
      path: '/clinical',
      icon: <ClinicalIcon />,
      permission: { module: 'clinical', action: 'read' },
      badge: 'AI',
      color: 'primary',
    },
    {
      title: 'Scheduling',
      path: '/scheduling',
      icon: <ScheduleIcon />,
      permission: { module: 'scheduling', action: 'read' },
    },
    {
      title: 'Revenue Ops',
      path: '/revenue',
      icon: <RevenueIcon />,
      permission: { module: 'billing', action: 'read' },
    },
    {
      title: 'Marketing CRM',
      path: '/marketing',
      icon: <MarketingIcon />,
      permission: { module: 'marketing', action: 'read' },
      badge: clinic?.integrations.ghl.enabled ? 'GHL' : undefined,
      color: 'secondary',
    },
    {
      title: 'Analytics',
      path: '/analytics',
      icon: <AnalyticsIcon />,
      permission: { module: 'analytics', action: 'read' },
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #16325C 0%, #19A69A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.25rem',
            }}
          >
            B
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              BOTLACE
            </Typography>
            <Typography variant="caption" color="text.secondary">
              AI Healthcare OS
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ px: 2, py: 1 }}>
          {navItems.map((item) => {
            // Check permissions
            if (item.permission && !hasPermission(item.permission.module, item.permission.action)) {
              return null;
            }

            const active = isActive(item.path);

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    backgroundColor: active ? 'primary.main' : 'transparent',
                    color: active ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      backgroundColor: active ? 'primary.dark' : 'action.hover',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: active ? 'primary.contrastText' : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontWeight: active ? 600 : 500,
                      fontSize: '0.875rem',
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      color={item.color as any || 'default'}
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ mx: 2, my: 2 }} />

        {/* AI Assistant */}
        <List sx={{ px: 2 }}>
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                backgroundColor: 'secondary.light',
                color: 'secondary.contrastText',
                '&:hover': {
                  backgroundColor: 'secondary.main',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: 'secondary.contrastText',
                  minWidth: 40,
                }}
              >
                <AIIcon />
              </ListItemIcon>
              <ListItemText
                primary="AI Assistant"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              />
              <Chip
                label="ACRE"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'inherit',
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Settings */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <ListItemButton
          onClick={() => handleNavigation('/settings')}
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 2,
            backgroundColor: isActive('/settings') ? 'action.selected' : 'transparent',
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            primaryTypographyProps={{
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          />
        </ListItemButton>
      </Box>

      {/* Subscription Info */}
      {clinic && (
        <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              SUBSCRIPTION
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
              {clinic.subscription.tier.charAt(0).toUpperCase() + clinic.subscription.tier.slice(1)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {clinic.usage.currentProviders}/{clinic.subscription.maxProviders} providers
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;