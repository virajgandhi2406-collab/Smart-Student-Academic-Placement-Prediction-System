/**
 * EduPredict Initial Seed Data
 * Automatically sets up Department, Course, Batches, Teacher, Admin, and
 * the 4 project team students (Viraj Gandhi, Ansari FaizAlam, Vraj Modi, Priyanka Jana)
 * with verified academic profiles and sample coding/aptitude assessments.
 */

const bcrypt = require('bcryptjs');
const { db } = require('./db');

async function seedDatabase() {
  console.log('[SEED] Checking database state...');
  const store = db._getMemoryStore();

  // If already seeded with users, skip
  if (store.users && store.users.length > 0) {
    console.log('[SEED] Database already contains records. Skipping seed.');
    return;
  }

  console.log('[SEED] Generating fresh database records...');

  // 1. Departments
  store.departments = [
    { id: 1, name: 'Department of Computer Science and Applications', code: 'CSA', created_at: new Date().toISOString() },
    { id: 2, name: 'Department of Artificial Intelligence & Data Science', code: 'AIDS', created_at: new Date().toISOString() }
  ];

  // 2. Courses
  store.courses = [
    { id: 1, department_id: 1, name: 'Masters of Science in Computer Science', code: 'MSC40040', created_at: new Date().toISOString() },
    { id: 2, department_id: 1, name: 'Bachelor of Technology in Computer Science', code: 'BTECH-CS', created_at: new Date().toISOString() }
  ];

  // 3. Batches
  store.batches = [
    { id: 1, course_id: 1, academic_year: '2026-27', year_number: 1, semester_number: 1, batch_name: 'M.Sc CS 2026 Group 13', created_at: new Date().toISOString() }
  ];

  // Default secure password hash for all seed accounts (12 rounds of bcrypt)
  const salt = bcrypt.genSaltSync(12);
  const passwordHash = bcrypt.hashSync('EduPredict@2026', salt);

  // 4. Users
  store.users = [
    {
      id: 1,
      prn: 'ADMIN001',
      name: 'Academic Dean / Head Admin',
      email: 'admin@mitwpu.edu.in',
      password_hash: passwordHash,
      role: 'admin',
      department_id: 1,
      course_id: null,
      batch_id: null,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      prn: 'FAC7001',
      name: 'Prof. Pradeep Tiwari Sir',
      email: 'pradeep.tiwari@mitwpu.edu.in',
      password_hash: passwordHash,
      role: 'teacher',
      department_id: 1,
      course_id: 1,
      batch_id: 1,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      prn: '1272260230',
      name: 'Viraj Gandhi P.',
      email: 'viraj.gandhi@mitwpu.edu.in',
      password_hash: passwordHash,
      role: 'student',
      department_id: 1,
      course_id: 1,
      batch_id: 1,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      prn: '1272260053',
      name: 'Ansari FaizAlam M.',
      email: 'ansari.faizalam@mitwpu.edu.in',
      password_hash: passwordHash,
      role: 'student',
      department_id: 1,
      course_id: 1,
      batch_id: 1,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      prn: '1272260212',
      name: 'Vraj Modi J.',
      email: 'vraj.modi@mitwpu.edu.in',
      password_hash: passwordHash,
      role: 'student',
      department_id: 1,
      course_id: 1,
      batch_id: 1,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      prn: '1272262225',
      name: 'Priyanka Jana T.',
      email: 'priyanka.jana@mitwpu.edu.in',
      password_hash: passwordHash,
      role: 'student',
      department_id: 1,
      course_id: 1,
      batch_id: 1,
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];

  // 5. Teacher Assignment
  store.teacher_assignments = [
    { id: 1, teacher_id: 2, course_id: 1, batch_id: 1, created_at: new Date().toISOString() }
  ];

  // 6. Student Profiles
  store.student_profiles = [
    {
      id: 1,
      student_id: 3, // Viraj Gandhi
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
          github_url: 'https://github.com/virajgandhi/edupredict',
          live_url: 'https://edupredict.mitwpu.edu'
        },
        {
          title: 'Autonomous AI Diagnostic Platform',
          description: 'High-throughput anomaly detection system using deep learning pipelines and REST APIs.',
          github_url: 'https://github.com/virajgandhi/ai-diagnostics',
          live_url: 'https://demo-diagnostics.internal'
        }
      ],
      certifications: [
        { title: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2025' },
        { title: 'Deep Learning Specialization', issuer: 'DeepLearning.AI / Coursera', year: '2025' }
      ],
      internships: [
        { company: 'TechNova Solutions', role: 'Full Stack AI Intern', duration: '6 Months', description: 'Developed secure microservices and ML models.' }
      ],
      resume_file: 'resume_viraj_gandhi.pdf',
      is_profile_verified: true, // Verified by mentor
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      student_id: 4, // Ansari FaizAlam
      tenth_percent: 84.0,
      twelfth_percent: 82.5,
      cgpa: 8.4,
      attendance_percent: 91.0,
      active_backlogs: 0,
      history_backlogs: 0,
      skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Scikit-Learn', 'Pandas'],
      projects: [
        {
          title: 'ML Pipeline Benchmarking Engine',
          description: 'Evaluated latency and precision for ensemble models on distributed data.',
          github_url: 'https://github.com/faizalam/ml-pipeline',
          live_url: ''
        }
      ],
      certifications: [
        { title: 'Python for Data Science', issuer: 'IBM', year: '2025' }
      ],
      internships: [
        { company: 'DataSphere Labs', role: 'Data Science Intern', duration: '3 Months', description: 'Engineered features and model deployment.' }
      ],
      resume_file: 'resume_ansari_faizalam.pdf',
      is_profile_verified: true,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      student_id: 5, // Vraj Modi
      tenth_percent: 79.0,
      twelfth_percent: 78.0,
      cgpa: 7.8,
      attendance_percent: 87.0,
      active_backlogs: 0,
      history_backlogs: 0,
      skills: ['React.js', 'HTML5', 'CSS3', 'Tailwind', 'JavaScript', 'REST APIs'],
      projects: [
        {
          title: 'Student Resource Portal',
          description: 'Interactive dashboard for academic lecture notes and course schedule sharing.',
          github_url: 'https://github.com/vrajmodi/student-portal',
          live_url: ''
        }
      ],
      certifications: [
        { title: 'Meta Front-End Developer Certificate', issuer: 'Meta', year: '2025' }
      ],
      internships: [],
      resume_file: 'resume_vraj_modi.pdf',
      is_profile_verified: true,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      student_id: 6, // Priyanka Jana
      tenth_percent: 85.0,
      twelfth_percent: 83.0,
      cgpa: 8.2,
      attendance_percent: 92.0,
      active_backlogs: 0,
      history_backlogs: 0,
      skills: ['Python', 'Java', 'SQL', 'Data Analytics', 'PowerBI', 'Tableau'],
      projects: [
        {
          title: 'Campus Analytics & Sentiment Tracker',
          description: 'Analyzed student feedback trends and placement conversion rates.',
          github_url: 'https://github.com/priyankajana/campus-analytics',
          live_url: ''
        }
      ],
      certifications: [
        { title: 'Google Data Analytics Professional', issuer: 'Google', year: '2025' }
      ],
      internships: [
        { company: 'Cognitive Infotech', role: 'Business Intelligence Trainee', duration: '4 Months', description: 'Built automated executive reports.' }
      ],
      resume_file: 'resume_priyanka_jana.pdf',
      is_profile_verified: true,
      created_at: new Date().toISOString()
    }
  ];

  // 7. Verified Documents
  store.documents = [
    {
      id: 1,
      student_id: 3,
      doc_type: 'resume',
      original_name: 'Viraj_Gandhi_Resume.pdf',
      file_path: 'uploads/Viraj_Gandhi_Resume.pdf',
      status: 'verified',
      verified_by: 2,
      rejection_reason: null,
      uploaded_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      verified_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 2,
      student_id: 3,
      doc_type: '10th_result',
      original_name: '10th_Marksheet_Viraj.pdf',
      file_path: 'uploads/10th_Marksheet_Viraj.pdf',
      status: 'verified',
      verified_by: 2,
      rejection_reason: null,
      uploaded_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      verified_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 3,
      student_id: 3,
      doc_type: '12th_result',
      original_name: '12th_Marksheet_Viraj.pdf',
      file_path: 'uploads/12th_Marksheet_Viraj.pdf',
      status: 'verified',
      verified_by: 2,
      rejection_reason: null,
      uploaded_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      verified_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 4,
      student_id: 5,
      doc_type: 'internship_proof',
      original_name: 'Pending_Verification_Internship.pdf',
      file_path: 'uploads/Pending_Verification_Internship.pdf',
      status: 'pending',
      verified_by: null,
      rejection_reason: null,
      uploaded_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  // 8. Assessments (2 Coding Assessments + 1 Aptitude Assessment as in Synopsis page 13)
  store.assessments = [
    {
      id: 1,
      title: 'Coding Assessment 1: Data Structures & Algorithms',
      type: 'coding',
      description: 'Online coding evaluation on core arrays, hashing, and string manipulation. Includes automated test cases and hidden edge-case tests.',
      duration_minutes: 45,
      total_marks: 100,
      negative_marking_rate: 0.0,
      created_by: 2,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Coding Assessment 2: Dynamic Programming & Graph Traversal',
      type: 'coding',
      description: 'Advanced problem solving, recursion, memoization, and shortest path graph algorithms.',
      duration_minutes: 60,
      total_marks: 100,
      negative_marking_rate: 0.0,
      created_by: 2,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Online Aptitude & Reasoning Assessment',
      type: 'aptitude',
      description: 'Comprehensive quantitative ability, logical reasoning, data interpretation, and verbal comprehension test with timer and negative marking.',
      duration_minutes: 30,
      total_marks: 100,
      negative_marking_rate: 0.25,
      created_by: 2,
      is_published: true,
      created_at: new Date().toISOString()
    }
  ];

  // 9. Assessment Questions
  store.assessment_questions = [
    // Coding Assessment 1
    {
      id: 1,
      assessment_id: 1,
      question_text: 'Two Sum Problem: Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution.',
      category: 'Data Structures',
      difficulty: 'easy',
      marks: 50,
      coding_starter_code: `function twoSum(nums, target) {
  // Your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      test_cases: [
        { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]', is_hidden: false },
        { input: 'nums = [3,2,4], target = 6', expected: '[1,2]', is_hidden: false },
        { input: 'nums = [3,3], target = 6', expected: '[0,1]', is_hidden: true }
      ]
    },
    {
      id: 2,
      assessment_id: 1,
      question_text: 'Valid Palindrome: A phrase is a palindrome if, after converting all uppercase letters into lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.',
      category: 'Strings',
      difficulty: 'easy',
      marks: 50,
      coding_starter_code: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}`,
      test_cases: [
        { input: '"A man, a plan, a canal: Panama"', expected: 'true', is_hidden: false },
        { input: '"race a car"', expected: 'false', is_hidden: false },
        { input: '" "', expected: 'true', is_hidden: true }
      ]
    },

    // Coding Assessment 2
    {
      id: 3,
      assessment_id: 2,
      question_text: 'Maximum Subarray (Kadane Algorithm): Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
      category: 'Dynamic Programming',
      difficulty: 'medium',
      marks: 50,
      coding_starter_code: `function maxSubArray(nums) {
  let maxSum = nums[0];
  let curSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    curSum = Math.max(nums[i], curSum + nums[i]);
    maxSum = Math.max(maxSum, curSum);
  }
  return maxSum;
}`,
      test_cases: [
        { input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6', is_hidden: false },
        { input: '[1]', expected: '1', is_hidden: false },
        { input: '[5,4,-1,7,8]', expected: '23', is_hidden: true }
      ]
    },
    {
      id: 4,
      assessment_id: 2,
      question_text: 'Climbing Stairs: You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
      category: 'Dynamic Programming',
      difficulty: 'medium',
      marks: 50,
      coding_starter_code: `function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    let c = a + b;
    a = b;
    b = c;
  }
  return b;
}`,
      test_cases: [
        { input: 'n = 2', expected: '2', is_hidden: false },
        { input: 'n = 3', expected: '3', is_hidden: false },
        { input: 'n = 5', expected: '8', is_hidden: true }
      ]
    },

    // Aptitude Assessment Questions (10 MCQs with categories)
    {
      id: 5,
      assessment_id: 3,
      question_text: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
      category: 'Quantitative Aptitude',
      difficulty: 'medium',
      marks: 10,
      options: ['65 seconds', '89 seconds', '100 seconds', '150 seconds'],
      correct_option: 1 // 89 seconds: speed = 240/24 = 10 m/s; total dist = 240+650=890m; time = 890/10 = 89s
    },
    {
      id: 6,
      assessment_id: 3,
      question_text: 'If A is the brother of B; B is the sister of C; and C is the father of D, how D is related to A?',
      category: 'Logical Reasoning',
      difficulty: 'easy',
      marks: 10,
      options: ['Brother', 'Sister', 'Nephew or Niece', 'Cannot be determined'],
      correct_option: 2
    },
    {
      id: 7,
      assessment_id: 3,
      question_text: 'Find the missing number in the sequence: 4, 9, 25, 49, 121, ?',
      category: 'Logical Reasoning',
      difficulty: 'medium',
      marks: 10,
      options: ['144', '169', '196', '225'],
      correct_option: 1 // Squares of prime numbers: 2^2, 3^2, 5^2, 7^2, 11^2, 13^2 = 169
    },
    {
      id: 8,
      assessment_id: 3,
      question_text: 'Select the synonym of the word: "PRAGMATIC"',
      category: 'Verbal Ability',
      difficulty: 'easy',
      marks: 10,
      options: ['Theoretical', 'Practical', 'Idealistic', 'Impulsive'],
      correct_option: 1
    },
    {
      id: 9,
      assessment_id: 3,
      question_text: 'A sum of money at simple interest doubles itself in 8 years. In how many years will it become 4 times of itself?',
      category: 'Quantitative Aptitude',
      difficulty: 'medium',
      marks: 10,
      options: ['16 years', '24 years', '32 years', '20 years'],
      correct_option: 1 // doubles in 8 yrs -> interest=P in 8 yrs -> needs 3P interest -> 3*8 = 24 years
    },
    {
      id: 10,
      assessment_id: 3,
      question_text: 'Complete the analogy: Clock : Time :: Thermometer : ?',
      category: 'Logical Reasoning',
      difficulty: 'easy',
      marks: 10,
      options: ['Heat', 'Radiation', 'Temperature', 'Energy'],
      correct_option: 2
    },
    {
      id: 11,
      assessment_id: 3,
      question_text: 'Choose the correct antonym of: "METICULOUS"',
      category: 'Verbal Ability',
      difficulty: 'easy',
      marks: 10,
      options: ['Careless', 'Painstaking', 'Detailed', 'Rigid'],
      correct_option: 0
    },
    {
      id: 12,
      assessment_id: 3,
      question_text: 'A shopkeeper sells an article at 20% discount on marked price and still gains 25%. If marked price is Rs. 500, what is the cost price?',
      category: 'Quantitative Aptitude',
      difficulty: 'hard',
      marks: 10,
      options: ['Rs. 320', 'Rs. 300', 'Rs. 350', 'Rs. 400'],
      correct_option: 0 // SP = 500*0.8 = 400; CP = 400/1.25 = 320
    },
    {
      id: 13,
      assessment_id: 3,
      question_text: 'Statement: "All laptops are computers. Some computers are calculators." Conclusion: (I) Some laptops are calculators. (II) No laptop is calculator.',
      category: 'Logical Reasoning',
      difficulty: 'medium',
      marks: 10,
      options: ['Only I follows', 'Only II follows', 'Either I or II follows', 'Neither follows'],
      correct_option: 2 // Complementary pair
    },
    {
      id: 14,
      assessment_id: 3,
      question_text: 'Select the correctly punctuated and grammatically sound sentence:',
      category: 'Verbal Ability',
      difficulty: 'medium',
      marks: 10,
      options: [
        'Each student must submit their project before Friday.',
        'Each of the students has submitted their assignment on time.',
        'Neither of the solutions are correct.',
        'Between you and I, this prediction is accurate.'
      ],
      correct_option: 1
    }
  ];

  // 10. Sample Assessment Submissions
  store.assessment_submissions = [
    {
      id: 1,
      assessment_id: 1,
      student_id: 3,
      score: 95,
      max_score: 100,
      percentage: 95.0,
      answers_payload: { status: 'passed_all_testcases' },
      submitted_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 2,
      assessment_id: 3,
      student_id: 3,
      score: 88,
      max_score: 100,
      percentage: 88.0,
      answers_payload: { correct: 9, incorrect: 1 },
      submitted_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  // 11. Faculty Evaluation
  store.faculty_evaluations = [
    {
      id: 1,
      student_id: 3, // Viraj Gandhi
      teacher_id: 2, // Prof. Pradeep Tiwari Sir
      technical_rating: 9,
      aptitude_rating: 9,
      communication_rating: 8,
      placement_readiness_score: 92.0,
      remarks: 'Consistently exceptional technical acumen, robust project portfolio, and strong problem-solving skills.',
      created_at: new Date().toISOString()
    }
  ];

  // 12. Pre-calculated Initial Prediction for Viraj Gandhi (Verification-Gated)
  store.placement_predictions = [
    {
      id: 1,
      student_id: 3,
      placement_probability: 88.4,
      placement_outcome: 'Placed',
      model_name: 'Random Forest (Ensemble)',
      strengths: [
        'Outstanding Coding Assessment Score (95%)',
        'Strong Academic Track Record (CGPA: 8.75 / 10)',
        'Demonstrated Industry Internship & Hands-On Projects',
        'High Quantitative & Logical Aptitude (88%)'
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
        'Technical Skills Breadth': 0.14
      },
      created_at: new Date().toISOString()
    }
  ];

  // 13. Audit logs
  store.audit_logs = [
    {
      id: 1,
      user_id: 1,
      role: 'admin',
      action: 'SYSTEM_INITIALIZATION',
      endpoint: '/system/seed',
      ip_address: '127.0.0.1',
      status_code: 200,
      details: 'System database successfully seeded with institutional structure.',
      created_at: new Date().toISOString()
    }
  ];

  db._save();
  console.log('[SEED] Database successfully seeded with full university and student data!');
}

module.exports = { seedDatabase };

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('[SEED] Completed direct run.');
    process.exit(0);
  });
}
