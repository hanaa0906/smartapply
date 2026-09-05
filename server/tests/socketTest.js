const http = require('http');
const { io } = require('../../client/node_modules/socket.io-client');

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'localhost',
      port: 5001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

async function testRealtimeFlow() {
  console.log('--- Testing End-to-End Real-Time Socket.IO Synchronization ---');

  // 1. Log in Student
  const studentAuth = await request('POST', '/api/auth/login', {
    email: 'student@smartapply.edu',
    password: 'Student@123'
  });
  const studentToken = studentAuth.data.token;
  const studentId = studentAuth.data.user.id;
  console.log(`✓ Student authenticated (${studentId})`);

  // 2. Log in Admin
  const adminAuth = await request('POST', '/api/auth/login', {
    email: 'admin@smartapply.edu',
    password: 'Admin@123'
  });
  const adminToken = adminAuth.data.token;
  console.log('✓ Admin authenticated');

  // 3. Fetch student's application
  const myApps = await request('GET', '/api/applications/my', null, studentToken);
  const activeApp = myApps.data.applications[0];
  console.log(`✓ Active Application: ${activeApp.applicationNumber} (Current Status: ${activeApp.status})`);

  // 4. Connect Student Socket client and join user and application room
  const socket = io('http://localhost:5001', {
    path: '/socket.io',
    transports: ['websocket']
  });

  let socketReceivedStatus = false;
  let socketReceivedNotif = false;

  await new Promise((resolve) => {
    socket.on('connect', () => {
      console.log(`✓ Student Socket connected (ID: ${socket.id})`);
      socket.emit('join_user', studentId);
      socket.emit('join_application', activeApp._id);
      resolve();
    });
  });

  socket.on('STATUS_CHANGED', (payload) => {
    console.log(`⚡ [Socket Event STATUS_CHANGED received]:`, payload.newStatus);
    socketReceivedStatus = true;
  });

  socket.on('NOTIFICATION_RECEIVED', (notif) => {
    console.log(`🔔 [Socket Event NOTIFICATION_RECEIVED received]: "${notif.title}" - ${notif.message}`);
    socketReceivedNotif = true;
  });

  // 5. Admin updates application status to ACADEMIC_REVIEW
  console.log('Admin updating application status to ACADEMIC_REVIEW...');
  const updateRes = await request('PUT', `/api/admin/applications/${activeApp._id}/status`, {
    status: 'ACADEMIC_REVIEW',
    remarks: 'Candidate passed document verification with distinction. Forwarded to Academic Review Board.'
  }, adminToken);

  console.log(`✓ Admin API Response status: ${updateRes.status} (New DB Status: ${updateRes.data?.application?.status})`);

  // Wait 1.5s for WebSocket events
  await new Promise(r => setTimeout(r, 1500));

  socket.disconnect();

  if (socketReceivedStatus && socketReceivedNotif) {
    console.log('------------------------------------------------------------');
    console.log('🎉 REAL-TIME WEBSOCKET SYNCHRONIZATION FULLY VERIFIED PASS!');
    console.log('------------------------------------------------------------');
  } else {
    console.error('Real-time test failed to receive expected events.');
    process.exit(1);
  }
}

testRealtimeFlow().catch(err => {
  console.error('Real-time test error:', err);
  process.exit(1);
});
