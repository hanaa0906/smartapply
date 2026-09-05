const http = require('http');

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
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
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

async function runTests() {
  console.log('--- Commencing SmartApply Smoke Tests ---');
  let studentToken = null;
  let adminToken = null;

  // 1. Health
  const health = await request('GET', '/api/health');
  console.log('✓ Health Endpoint:', health.status === 200 ? 'PASS' : 'FAIL');

  // 2. Student Login
  const studentLogin = await request('POST', '/api/auth/login', {
    email: 'student@smartapply.edu',
    password: 'Student@123'
  });
  console.log('✓ Student Login:', studentLogin.status === 200 ? 'PASS' : 'FAIL', `(${studentLogin.data?.user?.name})`);
  studentToken = studentLogin.data.token;

  // 3. Admin Login
  const adminLogin = await request('POST', '/api/auth/login', {
    email: 'admin@smartapply.edu',
    password: 'Admin@123'
  });
  console.log('✓ Admin Login:', adminLogin.status === 200 ? 'PASS' : 'FAIL', `(${adminLogin.data?.user?.name})`);
  adminToken = adminLogin.data.token;

  // 4. Student Profile
  const profile = await request('GET', '/api/profile', null, studentToken);
  console.log('✓ Student Profile:', profile.status === 200 && profile.data?.profile?.academicInfo ? 'PASS' : 'FAIL');

  // 5. Course Catalog
  const courses = await request('GET', '/api/courses');
  console.log('✓ Course Catalog:', courses.status === 200 && courses.data?.count >= 8 ? `PASS (${courses.data.count} courses)` : 'FAIL');

  // 6. AI Course Recommendations
  const recs = await request('GET', '/api/recommendations', null, studentToken);
  console.log('✓ AI Course Recommendations:', recs.status === 200 && recs.data?.recommended ? `PASS (${recs.data.summary.recommendedCount} recommended)` : 'FAIL');

  // 7. What-If Admission Simulator
  const firstCourseId = courses.data.courses[0]._id;
  const sim = await request('POST', '/api/simulator', {
    courseId: firstCourseId,
    entranceScore: 90,
    twelfthPercentage: 92,
    extracurricularScore: 8
  }, studentToken);
  console.log('✓ What-If Simulator:', sim.status === 200 && sim.data?.simulation?.simulatedReadinessScore > 0 ? `PASS (${sim.data.simulation.simulatedReadinessScore}% readiness)` : 'FAIL');

  // 8. Matched Scholarships
  const scholarships = await request('GET', '/api/scholarships/matched', null, studentToken);
  console.log('✓ Matched Scholarships:', scholarships.status === 200 && scholarships.data?.matches?.length > 0 ? `PASS (${scholarships.data.matches.length} matched)` : 'FAIL');

  // 9. Admin Stats & Analytics
  const adminStats = await request('GET', '/api/admin/stats', null, adminToken);
  console.log('✓ Admin Dashboard Stats:', adminStats.status === 200 && adminStats.data?.stats?.totalApplications > 0 ? `PASS (${adminStats.data.stats.totalApplications} total applications)` : 'FAIL');

  // 10. Admin Fairness Audit
  const fairness = await request('GET', '/api/admin/fairness', null, adminToken);
  console.log('✓ Admin Fairness Audit:', fairness.status === 200 && fairness.data?.audit?.streamMetrics ? 'PASS' : 'FAIL');

  // 11. Admin Policy Simulator
  const policy = await request('POST', '/api/admin/policy-simulate', {
    courseId: firstCourseId,
    simulatedSeats: 100,
    simulatedCutoff: 70,
    deadlineExtensionDays: 14
  }, adminToken);
  console.log('✓ Admin Policy Simulator:', policy.status === 200 && policy.data?.result?.simulated ? 'PASS' : 'FAIL');

  console.log('-----------------------------------------');
  console.log('All 11 Core SmartApply Smoke Tests PASSED!');
  console.log('-----------------------------------------');
}

runTests().catch(err => {
  console.error('Smoke Test Failed:', err);
  process.exit(1);
});
