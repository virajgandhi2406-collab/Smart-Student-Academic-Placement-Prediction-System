/**
 * EduPredict Client-Side Live Cloud Simulation Engine
 * Automatically activates on GitHub Pages or static web environments
 * where a dedicated Node/Python VPS backend is not running.
 * Emulates the complete hardened backend, RBAC, document verification,
 * assessments, and explainable ML placement prediction in-browser.
 */

const STORAGE_KEY = 'edupredict_live_state';

const initialLiveState = {
  users: [
    { id: 1, prn: 'ADMIN001', name: 'Academic Dean / Head Admin', email: 'admin@mitwpu.edu.in', role: 'admin', status: 'active' },
    { id: 2, prn: 'FAC7001', name: 'Prof. Pradeep Tiwari Sir', email: 'pradeep.tiwari@mitwpu.edu.in', role: 'teacher', status: 'active' },
    { id: 3, prn: '1272260230', name: 'Viraj Gandhi P.', email: 'viraj.gandhi@mitwpu.edu.in', role: 'student', status: 'active' },
    { id: 4, prn: '1272260053', name: 'Ansari FaizAlam M.', email: 'ansari.faizalam@mitwpu.edu.in', role: 'student', status: 'active' },
    { id: 5, prn: '1272260212', name: 'Vraj Modi J.', email: 'vraj.modi@mitwpu.edu.in', role: 'student', status: 'active' },
    { id: 6, prn: '1272262225', name: 'Priyanka Jana T.', email: 'priyanka.jana@mitwpu.edu.in', role: 'student', status: 'active' }
  ],
  profiles: {
    3: {
      tenth_percent: 88.5,
      twelfth_percent: 86.0,
      cgpa: 8.75,
      attendance_percent: 94.0,
      active_backlogs: 0,
      history_backlogs: 0,
      skills: ['Python', 'JavaScript', 'React.js', 'Node.js', 'Express', 'Machine Learning', 'FastAPI', 'SQL', 'Git', 'Docker'],
      projects: [
        {
          title: 'EduPredict - Smart Placement Prediction System',
          description: 'A full-stack EdTech platform utilizing Machine Learning, XGBoost, and RBAC to evaluate academic & assessment metrics.',
          github_url: 'https://github.com/virajgandhi2406-collab/Smart-Student-Academic-Placement-Prediction-System',
          live_url: 'https://virajgandhi2406-collab.github.io/Smart-Student-Academic-Placement-Prediction-System/'
        }
      ],
      certifications: [
        { title: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2025' }
      ],
      internships: [
        { company: 'TechNova Solutions', role: 'Full Stack AI Intern', duration: '6 Months', description: 'Developed secure microservices and ML models.' }
      ],
      is_profile_verified: true
    },
    4: {
      tenth_percent: 84.0,
      twelfth_percent: 82.5,
      cgpa: 8.4,
      attendance_percent: 91.0,
      active_backlogs: 0,
      history_backlogs: 0,
      skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Scikit-Learn', 'Pandas'],
      projects: [{ title: 'ML Pipeline Benchmarking', description: 'Evaluated latency and precision for ensemble models.', github_url: '', live_url: '' }],
      certifications: [{ title: 'Python for Data Science', issuer: 'IBM', year: '2025' }],
      internships: [],
      is_profile_verified: true
    },
    5: {
      tenth_percent: 79.0,
      twelfth_percent: 78.0,
      cgpa: 7.8,
      attendance_percent: 87.0,
      active_backlogs: 0,
      history_backlogs: 0,
      skills: ['React.js', 'HTML5', 'CSS3', 'JavaScript'],
      projects: [{ title: 'Student Resource Portal', description: 'Academic lecture notes and schedule sharing.', github_url: '', live_url: '' }],
      certifications: [],
      internships: [],
      is_profile_verified: false
    },
    6: {
      tenth_percent: 85.0,
      twelfth_percent: 83.0,
      cgpa: 8.2,
      attendance_percent: 92.0,
      active_backlogs: 0,
      history_backlogs: 0,
      skills: ['Python', 'SQL', 'Data Analytics', 'PowerBI'],
      projects: [],
      certifications: [],
      internships: [],
      is_profile_verified: true
    }
  },
  documents: [
    { id: 1, student_id: 3, student_name: 'Viraj Gandhi P.', student_prn: '1272260230', doc_type: 'resume', original_name: 'Viraj_Gandhi_Resume.pdf', status: 'verified', uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 2, student_id: 3, student_name: 'Viraj Gandhi P.', student_prn: '1272260230', doc_type: '10th_result', original_name: '10th_Marksheet_Viraj.pdf', status: 'verified', uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 3, student_id: 3, student_name: 'Viraj Gandhi P.', student_prn: '1272260230', doc_type: '12th_result', original_name: '12th_Marksheet_Viraj.pdf', status: 'verified', uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 4, student_id: 5, student_name: 'Vraj Modi J.', student_prn: '1272260212', doc_type: 'internship_proof', original_name: 'Internship_Completion.pdf', status: 'pending', uploaded_at: new Date(Date.now() - 86400000).toISOString() }
  ],
  assessments: [
    {
      id: 1,
      title: 'Coding Assessment 1: Data Structures & Algorithms',
      type: 'coding',
      description: 'Online coding evaluation on core arrays, hashing, and string manipulation. Includes automated test cases and hidden edge-case tests.',
      duration_minutes: 45,
      total_marks: 100,
      negative_marking_rate: 0.0
    },
    {
      id: 2,
      title: 'Coding Assessment 2: Dynamic Programming & Graph Traversal',
      type: 'coding',
      description: 'Advanced problem solving, recursion, memoization, and shortest path graph algorithms.',
      duration_minutes: 60,
      total_marks: 100,
      negative_marking_rate: 0.0
    },
    {
      id: 3,
      title: 'Online Aptitude & Reasoning Assessment',
      type: 'aptitude',
      description: 'Comprehensive quantitative ability, logical reasoning, data interpretation, and verbal comprehension test with timer and negative marking.',
      duration_minutes: 30,
      total_marks: 100,
      negative_marking_rate: 0.25
    }
  ],
  submissions: [
    { id: 1, assessment_id: 1, student_id: 3, score: 95, max_score: 100, percentage: 95.0, submitted_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 2, assessment_id: 3, student_id: 3, score: 88, max_score: 100, percentage: 88.0, submitted_at: new Date(Date.now() - 86400000).toISOString() }
  ],
  evaluations: [
    { id: 1, student_id: 3, teacher_id: 2, technical_rating: 9, aptitude_rating: 9, communication_rating: 8, placement_readiness_score: 92.0, remarks: 'Consistently exceptional technical acumen and strong problem solving.' }
  ],
  audit_logs: [
    { id: 1, action: 'SYSTEM_BOOT', role: 'admin', endpoint: '/system/init', ip_address: '127.0.0.1', status_code: 200, details: 'Production deployment initialized with RBAC controls.', created_at: new Date().toISOString() },
    { id: 2, action: 'DOCUMENT_VERIFIED', role: 'teacher', endpoint: '/api/teacher/verify-document', ip_address: '127.0.0.1', status_code: 200, details: 'Prof. Pradeep Tiwari Sir verified Resume for Viraj Gandhi', created_at: new Date(Date.now() - 86400000).toISOString() }
  ],
  notifications: [
    { id: 1, user_id: 3, title: 'Document Verified', message: 'Your uploaded document (Resume) was verified by Prof. Pradeep Tiwari Sir.', type: 'success', is_read: false },
    { id: 2, user_id: 3, title: 'Placement Prediction Available', message: 'Your ML Placement readiness score is 88.4% (Placed).', type: 'success', is_read: false }
  ]
};

function getLiveState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLiveState));
  return initialLiveState;
}

function saveLiveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Intercepts client fetch calls when running in static/GitHub Pages environment
export function setupLiveMockInterceptor() {
  const isGitHubPages = window.location.hostname.includes('github.io') || window.location.hostname.includes('localhost') === false;

  const originalFetch = window.fetch;
  window.fetch = async (url, options = {}) => {
    const urlStr = typeof url === 'string' ? url : url.url || '';

    // If local dev server with active backend, attempt original fetch first
    if (!isGitHubPages && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      try {
        const response = await originalFetch(url, options);
        if (response.status !== 404 && response.status !== 502 && response.status !== 503) {
          return response;
        }
      } catch (err) {
        // Backend offline: proceed to local in-browser simulation
      }
    }

    // Only intercept /api/ routes
    if (!urlStr.includes('/api/')) {
      return originalFetch(url, options);
    }

    const state = getLiveState();
    const token = localStorage.getItem('edupredict_token');
    let currentUser = null;
    if (token) {
      try {
        currentUser = JSON.parse(atob(token.split('.')[1]));
      } catch (e) {}
    }

    const method = (options.method || 'GET').toUpperCase();
    let body = {};
    if (options.body && typeof options.body === 'string') {
      try { body = JSON.parse(options.body); } catch (e) {}
    }

    const respond = (data, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    // 1. /api/auth/login
    if (urlStr.includes('/api/auth/login') && method === 'POST') {
      const email = (body.email || '').toLowerCase().trim();
      const user = state.users.find(u => u.email.toLowerCase() === email);
      if (!user) {
        return respond({ success: false, message: 'Invalid credentials. User not found.' }, 401);
      }
      // Create mock JWT token
      const fakeToken = `simulated.${btoa(JSON.stringify(user))}.signature`;
      return respond({ success: true, message: 'Login successful', token: fakeToken, user });
    }

    // 2. /api/auth/me
    if (urlStr.includes('/api/auth/me')) {
      if (!currentUser) return respond({ success: false, message: 'Unauthorized' }, 401);
      return respond({ success: true, user: currentUser });
    }

    // 3. /api/auth/register-request-otp
    if (urlStr.includes('/api/auth/register-request-otp')) {
      return respond({ success: true, message: 'OTP sent to university email.', demo_otp: '202613' });
    }

    // 4. /api/auth/register-verify-and-complete
    if (urlStr.includes('/api/auth/register-verify-and-complete')) {
      const newUser = {
        id: state.users.length + 1,
        prn: body.prn || '1272260999',
        name: body.name,
        email: body.email,
        role: 'student',
        status: 'active'
      };
      state.users.push(newUser);
      state.profiles[newUser.id] = {
        tenth_percent: 80,
        twelfth_percent: 80,
        cgpa: 8.0,
        attendance_percent: 90,
        active_backlogs: 0,
        history_backlogs: 0,
        skills: ['Python', 'SQL'],
        projects: [],
        certifications: [],
        internships: [],
        is_profile_verified: false
      };
      saveLiveState(state);
      return respond({ success: true, message: 'Registration verified and account created!' }, 201);
    }

    // 5. /api/student/profile
    if (urlStr.includes('/api/student/profile')) {
      const sId = currentUser?.id || 3;
      if (method === 'GET') {
        return respond({
          success: true,
          data: {
            official_info: {
              prn: currentUser?.prn || '1272260230',
              name: currentUser?.name || 'Viraj Gandhi P.',
              email: currentUser?.email || 'viraj.gandhi@mitwpu.edu.in',
              department: 'Department of Computer Science and Applications',
              course: 'Masters of Science in Computer Science',
              academic_year: '2026-27',
              semester: 'Semester 1',
              batch: 'Group 13',
              read_only_notice: 'Official institutional records cannot be directly edited by students. For corrections, please contact your Assigned Faculty or Academic Admin.'
            },
            profile: state.profiles[sId] || state.profiles[3]
          }
        });
      } else if (method === 'PUT') {
        state.profiles[sId] = { ...(state.profiles[sId] || {}), ...body };
        saveLiveState(state);
        return respond({ success: true, message: 'Profile updated.', profile: state.profiles[sId] });
      }
    }

    // 6. /api/student/documents
    if (urlStr.includes('/api/student/documents') && method === 'GET') {
      const sId = currentUser?.id || 3;
      return respond({ success: true, documents: state.documents.filter(d => d.student_id === sId) });
    }

    // 7. /api/student/upload-document
    if (urlStr.includes('/api/student/upload-document') && method === 'POST') {
      const sId = currentUser?.id || 3;
      const newDoc = {
        id: state.documents.length + 1,
        student_id: sId,
        student_name: currentUser?.name || 'Viraj Gandhi P.',
        student_prn: currentUser?.prn || '1272260230',
        doc_type: 'resume',
        original_name: 'Uploaded_Document.pdf',
        status: 'pending',
        uploaded_at: new Date().toISOString()
      };
      state.documents.push(newDoc);
      saveLiveState(state);
      return respond({ success: true, message: 'Document uploaded.', document: newDoc });
    }

    // 8. /api/student/assessments
    if (urlStr.includes('/api/student/assessments')) {
      const sId = currentUser?.id || 3;
      if (urlStr.includes('/submit')) {
        return respond({
          success: true,
          message: 'Assessment submitted successfully! Score: 95/100 (95.0%).',
          submission: { score: 95, max_score: 100, percentage: 95.0 }
        });
      }

      if (urlStr.endsWith('/1') || urlStr.endsWith('/2')) {
        return respond({
          success: true,
          assessment: state.assessments[0],
          questions: [
            {
              id: 1,
              assessment_id: 1,
              question_text: 'Two Sum Problem: Given an array of integers nums and target, return indices of two numbers that add up to target.',
              category: 'Data Structures',
              marks: 50,
              coding_starter_code: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
              visible_test_cases: [{ input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]' }],
              hidden_test_cases_count: 2
            }
          ]
        });
      }

      if (urlStr.endsWith('/3')) {
        return respond({
          success: true,
          assessment: state.assessments[2],
          questions: [
            {
              id: 5,
              assessment_id: 3,
              question_text: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
              category: 'Quantitative Aptitude',
              options: ['65 seconds', '89 seconds', '100 seconds', '150 seconds'],
              correct_option: 1,
              marks: 10
            },
            {
              id: 6,
              assessment_id: 3,
              question_text: 'Find the missing number in sequence: 4, 9, 25, 49, 121, ?',
              category: 'Logical Reasoning',
              options: ['144', '169', '196', '225'],
              correct_option: 1,
              marks: 10
            }
          ]
        });
      }

      const subs = state.submissions.filter(s => s.student_id === sId);
      const list = state.assessments.map(a => {
        const sub = subs.find(s => s.assessment_id === a.id);
        return { ...a, has_submitted: !!sub, submission: sub || null };
      });
      return respond({ success: true, assessments: list });
    }

    // 9. /api/student/placement-prediction
    if (urlStr.includes('/api/student/placement-prediction')) {
      const sId = currentUser?.id || 3;
      const prof = state.profiles[sId] || state.profiles[3];
      if (!prof.is_profile_verified) {
        return respond({
          success: true,
          is_locked: true,
          message: 'Placement Prediction Locked: Your profile and documents must be verified by assigned faculty before ML predictions can be generated.'
        });
      }
      return respond({
        success: true,
        is_locked: false,
        prediction: {
          placement_probability: 88.4,
          placement_outcome: 'Placed',
          model_name: 'Random Forest & XGBoost Ensemble (Calibrated)',
          strengths: [
            'Outstanding Coding Assessment Score (95%) - Solid problem solving & logic',
            'Strong Academic Consistency (CGPA: 8.75 / 10)',
            'Practical Experience: 2 project(s) and 1 internship(s) documented',
            'Robust Quantitative & Logical Aptitude (88%)'
          ],
          weaknesses: [
            'Can further refine competitive programming time complexity on DP graphs',
            'Mock behavioral interview practice for top-tier MNC rounds'
          ],
          recommendations: [
            'Practice LeetCode / HackerRank hard level graph algorithms',
            'Participate in mock technical interview panels with mentor',
            'Target Tier-1 Product Engineering and Cloud Infrastructure roles'
          ],
          feature_importance: {
            'Coding Assessment Score': 0.28,
            'CGPA & Academics': 0.24,
            'Aptitude Score': 0.18,
            'Internships & Projects': 0.16,
            'Technical Skills Breadth': 0.08,
            'Faculty Evaluation': 0.06
          }
        }
      });
    }

    // 10. /api/teacher/students
    if (urlStr.includes('/api/teacher/students')) {
      const stuUsers = state.users.filter(u => u.role === 'student');
      const list = stuUsers.map(s => {
        const p = state.profiles[s.id] || {};
        const docs = state.documents.filter(d => d.student_id === s.id);
        return {
          id: s.id,
          prn: s.prn,
          name: s.name,
          email: s.email,
          profile: p,
          is_verified: p.is_profile_verified,
          pending_documents_count: docs.filter(d => d.status === 'pending').length,
          verified_documents_count: docs.filter(d => d.status === 'verified').length,
          latest_prediction: p.is_profile_verified ? { placement_probability: 88.4, placement_outcome: 'Placed' } : null,
          latest_evaluation: state.evaluations.find(e => e.student_id === s.id) || null
        };
      });
      return respond({ success: true, students: list });
    }

    // 11. /api/teacher/pending-documents
    if (urlStr.includes('/api/teacher/pending-documents')) {
      return respond({ success: true, pending_documents: state.documents.filter(d => d.status === 'pending') });
    }

    // 12. /api/teacher/verify-document
    if (urlStr.includes('/api/teacher/verify-document') && method === 'POST') {
      const { document_id, action, rejection_reason } = body;
      const doc = state.documents.find(d => d.id === document_id);
      if (doc) {
        doc.status = action === 'approve' ? 'verified' : 'rejected';
        doc.rejection_reason = action === 'reject' ? rejection_reason : null;
        if (state.profiles[doc.student_id]) {
          state.profiles[doc.student_id].is_profile_verified = (action === 'approve');
        }
        state.audit_logs.unshift({
          id: state.audit_logs.length + 1,
          action: `DOCUMENT_${action.toUpperCase()}D`,
          role: 'teacher',
          endpoint: '/api/teacher/verify-document',
          ip_address: '127.0.0.1',
          status_code: 200,
          details: `Prof. Pradeep Tiwari Sir ${action}d doc #${document_id} for student #${doc.student_id}`,
          created_at: new Date().toISOString()
        });
        saveLiveState(state);
      }
      return respond({ success: true, message: `Document ${action}d successfully.`, document: doc });
    }

    // 13. /api/teacher/evaluate-student
    if (urlStr.includes('/api/teacher/evaluate-student') && method === 'POST') {
      state.evaluations.push({ id: state.evaluations.length + 1, ...body });
      saveLiveState(state);
      return respond({ success: true, message: 'Evaluation submitted successfully.' });
    }

    // 14. /api/teacher/create-assessment
    if (urlStr.includes('/api/teacher/create-assessment') && method === 'POST') {
      const a = { id: state.assessments.length + 1, ...body };
      state.assessments.push(a);
      saveLiveState(state);
      return respond({ success: true, message: 'Assessment published.', assessment: a }, 201);
    }

    // 15. /api/admin/overview
    if (urlStr.includes('/api/admin/overview')) {
      return respond({
        success: true,
        stats: {
          total_students: state.users.filter(u => u.role === 'student').length,
          total_teachers: state.users.filter(u => u.role === 'teacher').length,
          total_departments: 2,
          total_courses: 2,
          total_batches: 1,
          total_assessments: state.assessments.length,
          documents_summary: {
            total: state.documents.length,
            pending: state.documents.filter(d => d.status === 'pending').length,
            verified: state.documents.filter(d => d.status === 'verified').length,
            verification_rate_percent: 75
          },
          placement_summary: {
            predicted_students: 4,
            predicted_placed: 3,
            average_placement_probability: 84.5
          }
        }
      });
    }

    // 16. /api/admin/users
    if (urlStr.includes('/api/admin/users')) {
      if (method === 'GET') {
        return respond({ success: true, users: state.users });
      } else if (method === 'POST') {
        const u = { id: state.users.length + 1, ...body, status: 'active' };
        state.users.push(u);
        saveLiveState(state);
        return respond({ success: true, message: 'User created.', user: u }, 201);
      }
    }

    // 17. /api/admin/bulk-onboard
    if (urlStr.includes('/api/admin/bulk-onboard') && method === 'POST') {
      const rows = body.users || [];
      rows.forEach(r => {
        state.users.push({ id: state.users.length + 1, name: r.name, email: r.email, prn: r.prn, role: r.role || 'student', status: 'active' });
      });
      saveLiveState(state);
      return respond({ success: true, message: `Bulk onboarding completed. ${rows.length} users created.`, created_count: rows.length });
    }

    // 18. /api/admin/structure
    if (urlStr.includes('/api/admin/structure')) {
      return respond({
        success: true,
        data: {
          departments: [
            { id: 1, name: 'Department of Computer Science and Applications', code: 'CSA' },
            { id: 2, name: 'Department of Artificial Intelligence & Data Science', code: 'AIDS' }
          ],
          courses: [
            { id: 1, name: 'Masters of Science in Computer Science', code: 'MSC40040' },
            { id: 2, name: 'Bachelor of Technology in Computer Science', code: 'BTECH-CS' }
          ],
          batches: [
            { id: 1, batch_name: 'M.Sc CS 2026 Group 13', academic_year: '2026-27' }
          ]
        }
      });
    }

    // 19. /api/admin/audit-logs
    if (urlStr.includes('/api/admin/audit-logs')) {
      return respond({ success: true, logs: state.audit_logs });
    }

    // 20. /api/common/notifications
    if (urlStr.includes('/api/common/notifications')) {
      return respond({ success: true, notifications: state.notifications });
    }

    return respond({ success: true, message: 'Simulated endpoint success.' });
  };
}
