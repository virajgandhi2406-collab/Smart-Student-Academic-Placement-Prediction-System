-- ==========================================================
-- EduPredict: Smart Student Academic & Placement Prediction System
-- Production MySQL Database Schema
-- MIT World Peace University - Group 13
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `edupredict` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `edupredict`;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL UNIQUE,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `department_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Batches Table
CREATE TABLE IF NOT EXISTS `batches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `academic_year` VARCHAR(20) NOT NULL,
  `year_number` INT NOT NULL DEFAULT 1,
  `semester_number` INT NOT NULL DEFAULT 1,
  `batch_name` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Users Table (Admin, Teacher, Student)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `prn` VARCHAR(50) UNIQUE NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(180) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'teacher', 'student') NOT NULL,
  `department_id` INT NULL,
  `course_id` INT NULL,
  `batch_id` INT NULL,
  `status` ENUM('active', 'pending_otp', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Teacher Allocations
CREATE TABLE IF NOT EXISTS `teacher_assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `teacher_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `batch_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Student Profiles
CREATE TABLE IF NOT EXISTS `student_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL UNIQUE,
  `tenth_percent` DECIMAL(5,2) DEFAULT 0.00,
  `twelfth_percent` DECIMAL(5,2) DEFAULT 0.00,
  `cgpa` DECIMAL(4,2) DEFAULT 0.00,
  `attendance_percent` DECIMAL(5,2) DEFAULT 0.00,
  `active_backlogs` INT DEFAULT 0,
  `history_backlogs` INT DEFAULT 0,
  `skills` JSON NULL,
  `projects` JSON NULL,
  `certifications` JSON NULL,
  `internships` JSON NULL,
  `resume_file` VARCHAR(255) NULL,
  `is_profile_verified` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Document Verification
CREATE TABLE IF NOT EXISTS `documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `doc_type` ENUM('10th_result', '12th_result', 'university_result', 'resume', 'certifications', 'internship_proof', 'project_evidence') NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `status` ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
  `verified_by` INT NULL,
  `rejection_reason` TEXT NULL,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `verified_at` TIMESTAMP NULL,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. Assessments (Coding & Aptitude)
CREATE TABLE IF NOT EXISTS `assessments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `type` ENUM('coding', 'aptitude') NOT NULL,
  `description` TEXT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 30,
  `total_marks` INT NOT NULL DEFAULT 100,
  `negative_marking_rate` DECIMAL(3,2) DEFAULT 0.00,
  `created_by` INT NOT NULL,
  `is_published` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Assessment Questions
CREATE TABLE IF NOT EXISTS `assessment_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assessment_id` INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `category` VARCHAR(50) DEFAULT 'General',
  `difficulty` ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  `options` JSON NULL,
  `correct_option` INT NULL,
  `marks` INT NOT NULL DEFAULT 10,
  `coding_starter_code` TEXT NULL,
  `test_cases` JSON NULL,
  FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Assessment Submissions
CREATE TABLE IF NOT EXISTS `assessment_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assessment_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `score` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `max_score` INT NOT NULL DEFAULT 100,
  `answers_payload` JSON NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Faculty Student Evaluations
CREATE TABLE IF NOT EXISTS `faculty_evaluations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `teacher_id` INT NOT NULL,
  `technical_rating` INT NOT NULL CHECK (`technical_rating` BETWEEN 1 AND 10),
  `aptitude_rating` INT NOT NULL CHECK (`aptitude_rating` BETWEEN 1 AND 10),
  `communication_rating` INT NOT NULL CHECK (`communication_rating` BETWEEN 1 AND 10),
  `placement_readiness_score` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `remarks` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Placement Predictions (Gated after verification)
CREATE TABLE IF NOT EXISTS `placement_predictions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `placement_probability` DECIMAL(5,2) NOT NULL,
  `placement_outcome` ENUM('Placed', 'Not Placed') NOT NULL,
  `model_name` VARCHAR(50) NOT NULL DEFAULT 'Random Forest',
  `strengths` JSON NULL,
  `weaknesses` JSON NULL,
  `recommendations` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. Audit Logs (Security Tracking)
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `role` VARCHAR(20) NULL,
  `action` VARCHAR(100) NOT NULL,
  `endpoint` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(60) NOT NULL,
  `status_code` INT NOT NULL,
  `details` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 14. Registration OTPs (Email Verification Simulation)
CREATE TABLE IF NOT EXISTS `registration_otps` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(180) NOT NULL,
  `otp_hash` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `used` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 15. System Notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('info', 'warning', 'success', 'urgent') DEFAULT 'info',
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
