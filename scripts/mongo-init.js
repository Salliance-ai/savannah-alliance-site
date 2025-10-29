// MongoDB initialization script
db = db.getSiblingDB('botlace');

// Create application user
db.createUser({
  user: 'botlace_app',
  pwd: 'botlace_app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'botlace'
    }
  ]
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ clinicId: 1 });
db.users.createIndex({ role: 1 });

db.patients.createIndex({ patientId: 1 }, { unique: true });
db.patients.createIndex({ clinicId: 1 });
db.patients.createIndex({ primaryProvider: 1 });
db.patients.createIndex({ emailHash: 1 });
db.patients.createIndex({ phoneHash: 1 });
db.patients.createIndex({ 'riskScore.overall': -1 });

db.clinics.createIndex({ status: 1 });
db.clinics.createIndex({ 'subscription.tier': 1 });
db.clinics.createIndex({ 'subscription.status': 1 });

print('Database initialized successfully');