import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ open, onClose }) => {
  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'High-Risk Patient Alert',
      message: 'Patient John Doe (ID: P001234) requires immediate follow-up for diabetes management.',
      time: '2 minutes ago',
      unread: true,
    },
    {
      id: 2,
      type: 'info',
      title: 'AI Insight Available',
      message: 'New revenue optimization recommendations are ready for review.',
      time: '15 minutes ago',
      unread: true,
    },
    {
      id: 3,
      type: 'schedule',
      title: 'Appointment Reminder',
      message: 'Dr. Smith has 3 appointments starting in 30 minutes.',
      time: '30 minutes ago',
      unread: false,
    },
    {
      id: 4,
      type: 'success',
      title: 'Integration Complete',
      message: 'GoHighLevel sync completed successfully. 25 contacts updated.',
      time: '1 hour ago',
      unread: false,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'schedule':
        return <ScheduleIcon color="primary" />;
      default:
        return <InfoIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      case 'schedule':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Notifications List */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 3,
                    backgroundColor: notification.unread ? 'action.hover' : 'transparent',
                    borderLeft: notification.unread ? '4px solid' : '4px solid transparent',
                    borderLeftColor: notification.unread ? `${getTypeColor(notification.type)}.main` : 'transparent',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {notification.title}
                        </Typography>
                        {notification.unread && (
                          <Chip
                            label="New"
                            size="small"
                            color={getTypeColor(notification.type) as any}
                            sx={{ height: 20, fontSize: '0.75rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.time}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }}>
            View All Notifications
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default NotificationPanel;