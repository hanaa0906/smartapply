const College = require('../models/College');
const Course = require('../models/Course');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
const Document = require('../models/Document');
const Scholarship = require('../models/Scholarship');
const Notification = require('../models/Notification');

const seedInitialDataIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`Database already populated (${userCount} users found). Skipping auto-seed.`);
      return;
    }

    console.log('Database empty: auto-populating SmartApply seed data...');

    // 1. Create Colleges
    const colleges = await College.create([
      {
        name: 'Apex Institute of Technology',
        code: 'AIT',
        description: 'A world-class engineering and artificial intelligence research institution accredited with NAAC A++.',
        address: 'Knowledge Park IV, Tech Corridor',
        city: 'Bengaluru',
        state: 'Karnataka',
        accreditation: 'NAAC A++',
        establishedYear: 1994,
        website: 'https://ait.smartapply.edu',
        contactEmail: 'admissions@ait.smartapply.edu',
        contactPhone: '+91 80 2841 9000',
        logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80'
      },
      {
        name: 'Metropolitan University of Sciences & Commerce',
        code: 'MUSC',
        description: 'Comprehensive state-of-the-art university offering premier degrees in commerce, analytics, and sciences.',
        address: 'University Boulevard, Civil Lines',
        city: 'Pune',
        state: 'Maharashtra',
        accreditation: 'NAAC A+',
        establishedYear: 1982,
        website: 'https://musc.smartapply.edu',
        contactEmail: 'admissions@musc.smartapply.edu',
        contactPhone: '+91 20 2569 4110',
        logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80'
      },
      {
        name: 'Zenith Global School of Management',
        code: 'ZGSM',
        description: 'Pioneering modern management, leadership, and fintech education with global corporate tie-ups.',
        address: 'Financial District, Cyber City',
        city: 'Hyderabad',
        state: 'Telangana',
        accreditation: 'AACSB & NAAC A+',
        establishedYear: 2005,
        website: 'https://zgsm.smartapply.edu',
        contactEmail: 'admissions@zgsm.smartapply.edu',
        contactPhone: '+91 40 6688 2000',
        logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&auto=format&fit=crop&q=80'
      }
    ]);

    // 2. Create Courses
    const courses = await Course.create([
      {
        collegeId: colleges[0]._id,
        name: 'B.Tech in Artificial Intelligence & Data Science',
        code: 'AIT-AIDS-101',
        department: 'School of Computing & AI',
        degreeLevel: 'Undergraduate',
        durationYears: 4,
        totalSeats: 60,
        availableSeats: 18,
        feesPerYear: 195000,
        eligibilityCriteria: {
          minTwelfthPercentage: 75,
          requiredSubjects: ['Mathematics', 'Physics'],
          minEntranceScore: 70,
          streamAllowed: ['Science (PCM)']
        },
        careerProspects: ['AI Engineer', 'Data Scientist', 'Machine Learning Architect', 'NLP Researcher'],
        description: 'Specialized 4-year undergraduate degree focusing on deep learning, neural networks, computer vision, and big data architecture.',
        syllabusHighlights: ['Machine Learning Foundations', 'Deep Neural Networks', 'Computer Vision & NLP', 'Big Data Engineering with Spark'],
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      },
      {
        collegeId: colleges[0]._id,
        name: 'B.Tech in Computer Science & Engineering',
        code: 'AIT-CSE-102',
        department: 'Computer Science',
        degreeLevel: 'Undergraduate',
        durationYears: 4,
        totalSeats: 120,
        availableSeats: 32,
        feesPerYear: 185000,
        eligibilityCriteria: {
          minTwelfthPercentage: 75,
          requiredSubjects: ['Mathematics', 'Physics', 'Chemistry'],
          minEntranceScore: 68,
          streamAllowed: ['Science (PCM)']
        },
        careerProspects: ['Software Development Engineer', 'Cloud Architect', 'Systems Engineer', 'Cybersecurity Specialist'],
        description: 'Rigorous engineering program covering core algorithmic computer science, distributed systems, operating systems, and full-stack development.',
        syllabusHighlights: ['Data Structures & Algorithms', 'Operating Systems', 'Distributed Database Systems', 'Full-Stack Web Engineering'],
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      },
      {
        collegeId: colleges[0]._id,
        name: 'B.Tech in Robotics & Autonomous Systems',
        code: 'AIT-ROB-103',
        department: 'Mechatronics & Robotics',
        degreeLevel: 'Undergraduate',
        durationYears: 4,
        totalSeats: 60,
        availableSeats: 25,
        feesPerYear: 180000,
        eligibilityCriteria: {
          minTwelfthPercentage: 70,
          requiredSubjects: ['Mathematics', 'Physics'],
          minEntranceScore: 65,
          streamAllowed: ['Science (PCM)']
        },
        careerProspects: ['Robotics Engineer', 'Automation Architect', 'Embedded Systems Developer', 'Drone Systems Engineer'],
        description: 'Interdisciplinary program bridging mechanical kinematics, embedded electronics, sensors, and autonomous algorithm design.',
        syllabusHighlights: ['Robot Kinematics', 'Embedded Microcontrollers', 'ROS 2.0 and SLAM', 'Autonomous Sensor Fusion'],
        applicationDeadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000)
      },
      {
        collegeId: colleges[1]._id,
        name: 'B.Sc in Data Analytics & Applied Mathematics',
        code: 'MUSC-DA-201',
        department: 'Mathematical Sciences',
        degreeLevel: 'Undergraduate',
        durationYears: 3,
        totalSeats: 60,
        availableSeats: 22,
        feesPerYear: 85000,
        eligibilityCriteria: {
          minTwelfthPercentage: 65,
          requiredSubjects: ['Mathematics'],
          minEntranceScore: 50,
          streamAllowed: ['Science (PCM)', 'Commerce']
        },
        careerProspects: ['Business Analyst', 'Quantitative Analyst', 'Statistical Modeler', 'Market Risk Analyst'],
        description: '3-year rigorous mathematical sciences degree combining linear algebra, probability theory, stochastic models, and business analytics.',
        syllabusHighlights: ['Statistical Inference', 'Applied Linear Algebra', 'Econometrics & Forecasting', 'R and Python for Analytics'],
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      },
      {
        collegeId: colleges[1]._id,
        name: 'B.Com (Honors) in Financial Technology & Accounting',
        code: 'MUSC-FIN-202',
        department: 'Faculty of Commerce',
        degreeLevel: 'Undergraduate',
        durationYears: 3,
        totalSeats: 90,
        availableSeats: 35,
        feesPerYear: 95000,
        eligibilityCriteria: {
          minTwelfthPercentage: 65,
          requiredSubjects: ['Accountancy', 'Mathematics'],
          minEntranceScore: 0,
          streamAllowed: ['Commerce', 'Science (PCM)', 'Arts']
        },
        careerProspects: ['Fintech Consultant', 'Investment Banking Analyst', 'Certified Auditor', 'Corporate Treasurer'],
        description: 'Modern commerce degree infused with blockchain ledger principles, corporate finance, forensic accounting, and regulatory compliance.',
        syllabusHighlights: ['Corporate Accounting & IFRS', 'Fintech & Digital Payments', 'Taxation Law', 'Algorithmic Trading Basics'],
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      },
      {
        collegeId: colleges[1]._id,
        name: 'B.Tech in Electronics & Communication Engineering',
        code: 'MUSC-ECE-203',
        department: 'Electrical Engineering',
        degreeLevel: 'Undergraduate',
        durationYears: 4,
        totalSeats: 60,
        availableSeats: 20,
        feesPerYear: 140000,
        eligibilityCriteria: {
          minTwelfthPercentage: 68,
          requiredSubjects: ['Physics', 'Mathematics'],
          minEntranceScore: 60,
          streamAllowed: ['Science (PCM)']
        },
        careerProspects: ['VLSI Design Engineer', 'Telecom Systems Engineer', 'IoT Specialist', 'Hardware Architect'],
        description: 'Comprehensive study of semiconductor devices, digital signal processing, 5G communications, and VLSI circuit design.',
        syllabusHighlights: ['Digital Electronics', 'VLSI Design & Verilog', 'Signal Processing', 'Wireless Communications & IoT'],
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      },
      {
        collegeId: colleges[2]._id,
        name: 'Master of Business Administration (MBA - Technology Management)',
        code: 'ZGSM-MBA-301',
        department: 'Graduate School of Business',
        degreeLevel: 'Postgraduate',
        durationYears: 2,
        totalSeats: 60,
        availableSeats: 15,
        feesPerYear: 320000,
        eligibilityCriteria: {
          minTwelfthPercentage: 60,
          requiredSubjects: [],
          minEntranceScore: 75,
          streamAllowed: ['Science (PCM)', 'Commerce', 'Arts']
        },
        careerProspects: ['Product Manager', 'Management Consultant', 'Strategy Director', 'Venture Capital Associate'],
        description: 'Prestigious 2-year leadership program designed for ambitious managers driving digital transformation, SaaS ventures, and business strategy.',
        syllabusHighlights: ['Strategic Product Management', 'Venture Capital & Private Equity', 'Tech Leadership & Operations', 'Data-Driven Marketing'],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        collegeId: colleges[2]._id,
        name: 'BBA in International Business & Global Strategy',
        code: 'ZGSM-BBA-302',
        department: 'Undergraduate School of Management',
        degreeLevel: 'Undergraduate',
        durationYears: 3,
        totalSeats: 60,
        availableSeats: 28,
        feesPerYear: 160000,
        eligibilityCriteria: {
          minTwelfthPercentage: 60,
          requiredSubjects: ['English'],
          minEntranceScore: 0,
          streamAllowed: ['Commerce', 'Science (PCM)', 'Arts']
        },
        careerProspects: ['Global Trade Specialist', 'Business Operations Executive', 'Brand Strategist', 'Entrepreneur'],
        description: 'Immersive curriculum exploring cross-border supply chains, international trade policy, consumer psychology, and entrepreneurship.',
        syllabusHighlights: ['International Trade Economics', 'Supply Chain Dynamics', 'Cross-Cultural Negotiations', 'Corporate Strategy'],
        applicationDeadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000)
      }
    ]);

    // 3. Create Scholarships
    const scholarships = await Scholarship.create([
      {
        title: 'Apex Merit Academic Excellence Scholarship',
        provider: 'Apex Foundation for Education',
        collegeId: colleges[0]._id,
        description: 'Prestigious merit scholarship providing up to 50% tuition waiver for exceptional students with >= 85% in Class 12.',
        amountPerYear: 90000,
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        eligibilityRules: {
          minPercentage: 85,
          maxAnnualIncome: 1200000,
          eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
          requiredStream: ['Science (PCM)'],
          genderRestriction: 'All'
        },
        requiredDocuments: ['12th_marksheet', 'id_proof'],
        totalSlots: 30
      },
      {
        title: 'Women in STEM Leadership Grant',
        provider: 'Global Technology Diversity Initiative',
        collegeId: colleges[0]._id,
        description: 'Full sponsorship and mentorship initiative for female candidates pursuing undergraduate engineering and artificial intelligence.',
        amountPerYear: 120000,
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        eligibilityRules: {
          minPercentage: 75,
          maxAnnualIncome: 900000,
          eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
          requiredStream: ['Science (PCM)'],
          genderRestriction: 'Female'
        },
        requiredDocuments: ['12th_marksheet', 'id_proof', 'income_certificate'],
        totalSlots: 20
      },
      {
        title: 'Dr. APJ Abdul Kalam Need-Based Financial Assistance',
        provider: 'National Education Council',
        description: 'Need-based tuition support for meritorious candidates from families with annual income under ₹5,00,000.',
        amountPerYear: 60000,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        eligibilityRules: {
          minPercentage: 70,
          maxAnnualIncome: 500000,
          eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
          genderRestriction: 'All'
        },
        requiredDocuments: ['12th_marksheet', 'income_certificate', 'id_proof'],
        totalSlots: 50
      },
      {
        title: 'First-Generation Scholar Empowerment Award',
        provider: 'Metropolitan Higher Education Trust',
        collegeId: colleges[1]._id,
        description: 'Dedicated financial grant and academic coaching for first-generation college students entering degree programs.',
        amountPerYear: 50000,
        deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        eligibilityRules: {
          minPercentage: 65,
          maxAnnualIncome: 650000,
          eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
          genderRestriction: 'All'
        },
        requiredDocuments: ['12th_marksheet', 'id_proof'],
        totalSlots: 25
      }
    ]);

    // 4. Create Demo Admin and Student
    const adminUser = await User.create({
      name: 'Admissions Dean Dr. Rajesh Sharma',
      email: 'admin@smartapply.edu',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 98110 23456',
      collegeId: colleges[0]._id
    });

    const studentUser = await User.create({
      name: 'Aarav Patel',
      email: 'student@smartapply.edu',
      password: 'Student@123',
      role: 'student',
      phone: '+91 98765 43210'
    });

    const studentProfile = await StudentProfile.create({
      userId: studentUser._id,
      personalInfo: {
        dateOfBirth: new Date('2006-05-14'),
        gender: 'Male',
        address: '42 Orchid Residency, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        guardianName: 'Ramesh Patel',
        guardianPhone: '+91 98450 11223',
        guardianOccupation: 'Senior Project Manager',
        annualFamilyIncome: 550000,
        category: 'General',
        bloodGroup: 'B+'
      },
      academicInfo: {
        tenth: {
          board: 'CBSE',
          schoolName: 'Delhi Public School, East Bengaluru',
          passingYear: 2022,
          percentage: 91.2,
          rollNumber: 'CBSE-2022-81920'
        },
        twelfth: {
          board: 'CBSE',
          schoolName: 'Delhi Public School, East Bengaluru',
          passingYear: 2024,
          percentage: 89.4,
          rollNumber: 'CBSE-2024-99124',
          stream: 'Science (PCM)',
          subjects: [
            { name: 'Mathematics', marks: 92, maxMarks: 100 },
            { name: 'Physics', marks: 88, maxMarks: 100 },
            { name: 'Chemistry', marks: 87, maxMarks: 100 },
            { name: 'Computer Science', marks: 95, maxMarks: 100 },
            { name: 'English Core', marks: 85, maxMarks: 100 }
          ]
        },
        entranceExams: [
          {
            examName: 'JEE Main',
            rollNumber: 'JEE-2024-44182',
            score: 88.5,
            percentile: 94.2,
            rank: 18450,
            year: 2024
          }
        ]
      },
      skills: ['Python', 'Data Structures', 'Machine Learning Basics', 'JavaScript', 'Problem Solving'],
      interests: ['Artificial Intelligence', 'Competitive Programming', 'Robotics', 'Space Technology'],
      careerGoals: ['AI Research Engineer at a Leading Tech Firm', 'Autonomous Systems Architect'],
      coursePreferences: [courses[0]._id, courses[1]._id],
      achievements: [
        'National Cyber Olympiad Gold Medalist (2023)',
        '1st Place in Inter-School Hackathon for AI Waste Sorter'
      ],
      completionPercentage: 95
    });

    const aaravDocs = await Document.create([
      {
        studentId: studentUser._id,
        documentType: '12th_marksheet',
        originalName: 'Class_XII_Marksheet_CBSE.pdf',
        fileName: 'marksheet-12th-aarav.pdf',
        filePath: 'uploads/marksheet-12th-aarav.pdf',
        fileUrl: '/uploads/marksheet-12th-aarav.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024 * 720,
        status: 'VERIFIED',
        extractedData: {
          percentage: 89.4,
          name: 'Aarav Patel',
          rollNumber: 'CBSE-2024-99124',
          board: 'CBSE',
          year: 2024,
          confidenceScore: 0.96
        }
      },
      {
        studentId: studentUser._id,
        documentType: '10th_marksheet',
        originalName: 'Class_X_Marksheet_CBSE.pdf',
        fileName: 'marksheet-10th-aarav.pdf',
        filePath: 'uploads/marksheet-10th-aarav.pdf',
        fileUrl: '/uploads/marksheet-10th-aarav.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024 * 650,
        status: 'VERIFIED',
        extractedData: {
          percentage: 91.2,
          name: 'Aarav Patel',
          rollNumber: 'CBSE-2022-81920',
          board: 'CBSE',
          year: 2022,
          confidenceScore: 0.98
        }
      },
      {
        studentId: studentUser._id,
        documentType: 'id_proof',
        originalName: 'Aadhaar_Card_Verified.pdf',
        fileName: 'aadhaar-aarav.pdf',
        filePath: 'uploads/aadhaar-aarav.pdf',
        fileUrl: '/uploads/aadhaar-aarav.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024 * 430,
        status: 'VERIFIED',
        extractedData: {
          name: 'Aarav Patel',
          dob: '2006-05-14',
          confidenceScore: 0.94
        }
      }
    ]);

    const aaravApp = await Application.create({
      applicationNumber: 'SA-2026-88102',
      studentId: studentUser._id,
      collegeId: colleges[0]._id,
      courseId: courses[0]._id,
      status: 'DOCUMENT_VERIFICATION',
      academicSnapshot: {
        twelfthPercentage: 89.4,
        tenthPercentage: 91.2,
        entranceScore: 88.5,
        entranceExam: 'JEE Main',
        stream: 'Science (PCM)',
        subjects: studentProfile.academicInfo.twelfth.subjects
      },
      documents: aaravDocs.map(d => ({
        documentId: d._id,
        documentType: d.documentType,
        status: d.status,
        fileUrl: d.fileUrl
      })),
      smartAssistantAudit: {
        mismatches: [],
        missingFields: [],
        flags: ['Candidate exceeds general course cutoff by 14.4%.'],
        scoreConsistency: true,
        overallCheckStatus: 'CLEAN'
      },
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    await Document.updateMany({ _id: { $in: aaravDocs.map(d => d._id) } }, { applicationId: aaravApp._id });

    await ApplicationStatusHistory.create([
      {
        applicationId: aaravApp._id,
        previousStatus: 'DRAFT',
        newStatus: 'SUBMITTED',
        updatedBy: studentUser._id,
        remarks: 'Candidate finalized profile and submitted application for B.Tech AI & DS.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        applicationId: aaravApp._id,
        previousStatus: 'SUBMITTED',
        newStatus: 'DOCUMENT_VERIFICATION',
        updatedBy: adminUser._id,
        remarks: 'Admissions office initiated automated OCR & manual document checks.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]);

    await Notification.create([
      {
        userId: studentUser._id,
        applicationId: aaravApp._id,
        title: 'Application Received: SA-2026-88102',
        message: 'Your application for B.Tech in Artificial Intelligence & Data Science has been received successfully.',
        type: 'STATUS_CHANGE',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: studentUser._id,
        applicationId: aaravApp._id,
        title: 'Moved to Document Verification',
        message: 'Your application has moved to Document Verification. The verification team is reviewing marksheets.',
        type: 'STATUS_CHANGE',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]);

    // 5. Additional 6 sample student applications across stages
    const sampleStudents = [
      { name: 'Priya Sharma', email: 'priya@student.edu', cIdx: 1, status: 'APPROVED', stream: 'Science (PCM)', twelfth: 94.2, tenth: 93, ent: 92.5, rem: 'Direct merit seat offered.' },
      { name: 'Rahul Verma', email: 'rahul@student.edu', cIdx: 2, status: 'ACADEMIC_REVIEW', stream: 'Science (PCM)', twelfth: 81.5, tenth: 84, ent: 72, rem: 'Under review by Mechatronics Board.' },
      { name: 'Ananya Roy', email: 'ananya@student.edu', cIdx: 3, status: 'WAITLISTED', stream: 'Commerce', twelfth: 76.0, tenth: 79.5, ent: 61, rem: 'Waitlist position #4.' },
      { name: 'Vikram Singh', email: 'vikram@student.edu', cIdx: 4, status: 'CORRECTION_REQUIRED', stream: 'Commerce', twelfth: 79.0, tenth: 82, ent: 55, rem: 'Transfer certificate blurred. Re-upload requested.' },
      { name: 'Sneha Gupta', email: 'sneha@student.edu', cIdx: 6, status: 'ENROLLED', stream: 'Science (PCM)', twelfth: 86.0, tenth: 89, ent: 84, rem: 'Admission confirmed and tuition deposited.' },
      { name: 'Devendra Kumar', email: 'devendra@student.edu', cIdx: 5, status: 'REJECTED', stream: 'Science (PCM)', twelfth: 62.0, tenth: 68, ent: 48, rem: 'Did not satisfy minimum cutoff.' }
    ];

    for (let i = 0; i < sampleStudents.length; i++) {
      const s = sampleStudents[i];
      const stud = await User.create({
        name: s.name,
        email: s.email,
        password: 'Student@123',
        role: 'student',
        phone: `+91 98000 ${10000 + i}`
      });

      await StudentProfile.create({
        userId: stud._id,
        personalInfo: { gender: i % 2 === 0 ? 'Female' : 'Male', city: 'Pune', state: 'Maharashtra', annualFamilyIncome: 450000 + i * 50000, category: i % 3 === 0 ? 'OBC' : 'General' },
        academicInfo: { tenth: { board: 'CBSE', percentage: s.tenth }, twelfth: { board: 'CBSE', percentage: s.twelfth, stream: s.stream, subjects: [] }, entranceExams: [{ examName: 'General', score: s.ent }] },
        skills: ['Analytics', 'Communication'],
        completionPercentage: 80
      });

      const crs = courses[s.cIdx];
      const sApp = await Application.create({
        applicationNumber: `SA-2026-${90010 + i}`,
        studentId: stud._id,
        collegeId: crs.collegeId,
        courseId: crs._id,
        status: s.status,
        academicSnapshot: { twelfthPercentage: s.twelfth, tenthPercentage: s.tenth, entranceScore: s.ent, stream: s.stream },
        adminRemarks: s.rem,
        submittedAt: new Date(Date.now() - (6 + i) * 24 * 60 * 60 * 1000),
        decidedAt: ['APPROVED', 'REJECTED', 'ENROLLED'].includes(s.status) ? new Date() : undefined
      });

      await ApplicationStatusHistory.create({
        applicationId: sApp._id,
        previousStatus: 'SUBMITTED',
        newStatus: s.status,
        updatedBy: adminUser._id,
        remarks: s.rem,
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      });
    }

    console.log('✅ Auto-seeding completed successfully!');
  } catch (err) {
    console.error('Auto-seed error:', err);
  }
};

module.exports = { seedInitialDataIfEmpty };
