# Smart Student Academic & Placement Prediction System (EduPredict)

> **Dr. Vishwanath Karad MIT World Peace University, Pune**  
> School of Computer Science & Engineering | Department of Computer Science and Applications  
> **Course Code:** MSC40040: First Year M.Sc Computer Science (2026-27)  
> **Group ID:** 13 | **Project Title:** Smart Student Academic & Placement Prediction System  
> **Team Leader:** Ansari FaizAlam M. (PRN: 1272260053)  
> **Team Members:** Viraj Gandhi P. (PRN: 1272260230), Vraj Modi J. (PRN: 1272260212), Priyanka Jana T. (PRN: 1272262225)  
> **Faculty Mentor:** Prof. Pradeep Tiwari Sir  

[![Live Demo](https://img.shields.io/badge/Live_Demo-EduPredict_Web_App-2563eb?style=for-the-badge&logo=google-chrome&logoColor=white)](https://virajgandhi2406-collab.github.io/Smart-Student-Academic-Placement-Prediction-System/)
[![Security Audit](https://img.shields.io/badge/Security_Audit-100%25_Passed-059669?style=for-the-badge&logo=shield&logoColor=white)](https://github.com/virajgandhi2406-collab/Smart-Student-Academic-Placement-Prediction-System)
[![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub_Pages-16a34a?style=for-the-badge&logo=github&logoColor=white)](https://virajgandhi2406-collab.github.io/Smart-Student-Academic-Placement-Prediction-System/)

---

## Live Application Link

Access the live, interactive cloud deployment directly in your web browser:  
Direct Link: **[https://virajgandhi2406-collab.github.io/Smart-Student-Academic-Placement-Prediction-System/](https://virajgandhi2406-collab.github.io/Smart-Student-Academic-Placement-Prediction-System/)**

> **Quick Demo Access**: Click the **"Switch Role Demo"** button in the navbar of the live app to test instantly as:
> - **Student:** Viraj Gandhi P. (PRN: 1272260230)
> - **Student (Leader):** Ansari FaizAlam M. (PRN: 1272260053)
> - **Faculty Mentor:** Prof. Pradeep Tiwari Sir
> - **Administrator:** Academic Dean / Head Admin  
> *(Default Demo Password: `EduPredict@2026`)*

---

## 1. System Architecture Overview

EduPredict is an enterprise-grade EdTech and Machine Learning platform engineered to solve student placement readiness tracking, document verification bottlenecks, and career guidance through explainable artificial intelligence.

```
+------------------------------------------------------------------------+
|                          EduPredict Frontend                           |
|                      (React 18 + Vite + Modern CSS)                    |
+------------------------------------------------------------------------+
          |                                            |
 (REST API / JWT Auth)                        (Static Uploads)
          v                                            v
+------------------------------------------------------------------------+
|                      Hardened Express.js Server                        |
|  Helmet Headers | Rate Limiting | XSS Sanitization | Strict RBAC Guard |
+------------------------------------------------------------------------+
          |                                            |
 (Queries & Audit Log)                      (Feature Payloads)
          v                                            v
+-----------------------------+              +---------------------------+
|    Database Layer (Dual)    |              | Python FastAPI ML Engine  |
| - Atomic Local JSON Store   |              | - Logistic Regression     |
| - MySQL (phpMyAdmin Schema) |              | - Decision Tree           |
+-----------------------------+              | - Random Forest           |
                                             | - XGBoost Ensemble        |
                                             +---------------------------+
```

---

## 2. Comprehensive Security & Hardening Audit Report

This codebase has undergone a full security audit across 12 critical controls. **All 12 controls PASSED (100% Score)**.

| Security Control | Implementation Mechanism | Protection Status |
| :--- | :--- | :--- |
| **API Keys & Secrets Isolation** | Strictly contained in `.env` and loaded via `process.env`. Ignored by `.gitignore`. Zero secrets in client bundles. | **SECURE** |
| **Admin Route Protection** | Strict RBAC middleware (`requireRole(['admin'])`). Non-admins receive `403 Forbidden` and attempts are logged. | **PROTECTED** |
| **Proper Authentication** | Stateless JWT tokens with 24h expiration, PRN/email claims, and signature verification. | **ENFORCED** |
| **Password Hashing** | Industry-standard `bcryptjs` with **12 salt rounds** (Prefix: `$2a$12$`). No plaintext passwords stored. | **HARDENED** |
| **Form Sanitization & XSS** | Deep recursive input sanitizer stripping `<script>`, `<iframe>`, inline handlers (`onload`, `onerror`), and `javascript:` URLs. | **SANITIZED** |
| **Rate Limiting** | DDoS protection via `express-rate-limit`: 300 req/15m globally, 20 req/15m on `/api/auth/` to block brute-forcing. | **ACTIVE** |
| **Security Headers** | `helmet` configured with Content Security Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and HSTS. | **ACTIVE** |
| **Debugging Mode** | Centralized production error handler suppresses file paths and debug stack traces from API responses. | **OFF (SECURE)** |
| **Exposed Files Check** | `.gitignore` hides `.env`, `node_modules`, `uploads/`, `temp/`, `*.pem`, `*.log`, and database storage files. | **SAFE** |
| **Database Injection Defense** | Parameterized queries with prepared statements preventing SQL Injection attacks. | **IMMUNE** |
| **Secure File Uploads** | Multer restricted strictly to verified document MIME types (`application/pdf`, `image/jpeg`, `image/png`) with 5MB limits and randomized filenames. | **PROTECTED** |
| **Real-Time Audit Trail** | Live audit stream tracking logins, document reviews, evaluations, and unauthorized access attempts with IP and timestamp. | **MONITORED** |

To run the automated audit suite at any time:
```bash
npm run security-audit
```

---

## 3. Pre-Seeded Demo Accounts (Group 13 & Faculty)

All seed accounts are initialized with password: `EduPredict@2026`

| Role | Name | Email | PRN / ID | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Viraj Gandhi P. | `viraj.gandhi@mitwpu.edu.in` | `1272260230` | Verified (88.4% Placement Prob) |
| **Student (Leader)** | Ansari FaizAlam M. | `ansari.faizalam@mitwpu.edu.in` | `1272260053` | Verified |
| **Student** | Vraj Modi J. | `vraj.modi@mitwpu.edu.in` | `1272260212` | Active |
| **Student** | Priyanka Jana T. | `priyanka.jana@mitwpu.edu.in` | `1272262225` | Active |
| **Faculty Mentor** | Prof. Pradeep Tiwari Sir | `pradeep.tiwari@mitwpu.edu.in` | `FAC7001` | Mentor / Approver |
| **Administrator** | Academic Dean / Head Admin | `admin@mitwpu.edu.in` | `ADMIN001` | Institutional Admin |

---

## 4. Key Modules & Functional Workflows

### 4.1. Student Portal
- **Verification-Gated Placement Prediction**: Machine Learning predictions remain securely locked until assigned faculty verifies the student's marksheets and resume (Synopsis 1.5.1 #6).
- **Official Institutional Record**: Displays official university attributes (PRN, Name, Course, Batch, Mentor). As specified in synopsis Chapter 1.6 Phase 3: *"Students can view official information but cannot directly modify it. If there is a correction: Contact Teacher/Admin."*
- **Placement Portfolio**: Permitted editing for 10th, 12th %, CGPA, attendance, backlogs, technical skills tag cloud, project links (GitHub & live demo), certifications, and internships.
- **Document Verification Tracker**: Upload PDF/JPG marksheets and resumes. Live badges display verification state (`VERIFIED`, `PENDING`, or `REJECTED` with specific faculty rejection feedback).
- **Online Coding Assessments**: In-browser code editor with sample test cases, hidden edge-case test suite, timer, and automated scoring.
- **Online Aptitude Assessment**: 10 MCQs across Quantitative, Logical Reasoning, and Verbal Ability with countdown timer and negative marking deduction.
- **Explainable AI Breakdown**: Gauge showing placement probability % (e.g. 88.4%), outcome ("Placed"), SHAP feature importance breakdown, strong areas, improvement areas, and personalized career recommendations.

### 4.2. Faculty / Teacher Portal
- **Assigned Students List**: Filter and inspect students assigned to the faculty's batch (M.Sc. CS Group 13).
- **Verification Queue**: Review uploaded student documents with 1-click "Approve & Verify" or "Reject with Reason".
- **Faculty Evaluation**: Grade students on Technical Rating (1-10), Aptitude Rating (1-10), Communication (1-10), and Placement Readiness Score (1-100) with written mentorship feedback.
- **At-Risk Watchlist**: Early intervention filter flagging students with active backlogs, CGPA < 6.5, or attendance < 75%.
- **Assessment Studio**: Author and publish new coding challenges and aptitude tests.

### 4.3. Admin Portal
- **Institutional Structure**: Manage Departments, Degree Courses (MSC40040), Batches, and faculty assignments.
- **User Onboarding**: Single user creation & Excel/CSV bulk import simulation.
- **Multi-Model Benchmark Dashboard**: Visual comparison of the 4 ML models (Logistic Regression, Decision Tree, Random Forest, XGBoost) on historical dataset.
- **Security Audit Explorer**: Live stream of system actions and blocked unauthorized access attempts.

---

## 5. Machine Learning Benchmark Results

Evaluated on 1,200 historical student placement profiles:

| Model Architecture | Accuracy | Precision | Recall | F1-Score | Role in EduPredict |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Logistic Regression** | **99.17%** | 100.0% | 98.95% | 99.47% | High-Accuracy Linear Baseline |
| **Decision Tree** | **65.00%** | 96.49% | 57.89% | 72.37% | Interpretable Tree Model |
| **Random Forest** | **56.25%** | 97.75% | 45.79% | 62.37% | Multi-Tree Ensemble |
| **XGBoost (Calibrated)** | **85.83%** | 87.50% | 95.79% | 91.46% | **Production Champion** |

---

## 6. How to Run Locally

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

```bash
# Terminal 1: Backend Express Server (Port 5000)
cd server
npm.cmd start

# Terminal 2: Python ML Microservice (Port 8000)
python ml-service/main.py

# Terminal 3: React Frontend (Port 5173)
cd client
npm.cmd run dev
```

Open your browser to: **`http://localhost:5173`**
