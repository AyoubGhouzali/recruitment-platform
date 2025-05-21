-- This script will be automatically executed when the application starts if spring.jpa.hibernate.ddl-auto is set to create or create-drop

-- Clear existing data
DELETE FROM applications;
DELETE FROM job_offers;
DELETE FROM student_profiles;
DELETE FROM users;

-- Insert admin user
INSERT INTO users (id, email, password, role, created_at)
VALUES (1, 'admin@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'ADMIN', CURRENT_TIMESTAMP);
-- Password is 'password'

-- Insert recruiter users
INSERT INTO users (id, email, password, role, created_at)
VALUES (2, 'recruiter1@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'RECRUITER', CURRENT_TIMESTAMP);

INSERT INTO users (id, email, password, role, created_at)
VALUES (3, 'recruiter2@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'RECRUITER', CURRENT_TIMESTAMP);

-- Insert student users
INSERT INTO users (id, email, password, role, created_at)
VALUES (4, 'student1@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'STUDENT', CURRENT_TIMESTAMP);

INSERT INTO users (id, email, password, role, created_at)
VALUES (5, 'student2@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'STUDENT', CURRENT_TIMESTAMP);

-- Insert student profiles
INSERT INTO student_profiles (id, user_id, full_name, education, experience, skills, phone, resume_url, created_at, updated_at)
VALUES (1, 4, 'John Doe', 'Bachelor of Computer Science, University of Technology', 
        '2 years as Junior Developer at Tech Solutions', 
        'Java, Spring Boot, React, SQL', 
        '+1234567890', 
        'resumes/john_doe_resume.pdf', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO student_profiles (id, user_id, full_name, education, experience, skills, phone, resume_url, created_at, updated_at)
VALUES (2, 5, 'Jane Smith', 'Master of Data Science, State University', 
        '1 year internship at Data Analytics Inc.', 
        'Python, TensorFlow, SQL, Data Visualization', 
        '+0987654321', 
        'resumes/jane_smith_resume.pdf', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert job offers
INSERT INTO job_offers (id, recruiter_id, title, description, company_name, salary_min, salary_max, skills, created_at, updated_at)
VALUES (1, 2, 'Software Engineer', 
        'We are looking for a Software Engineer to join our team and help us develop high-quality software solutions. The ideal candidate will have experience with Java and Spring Boot.', 
        'Tech Innovations Inc.', 
        70000.00, 
        100000.00, 
        'Java, Spring Boot, SQL, Git', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO job_offers (id, recruiter_id, title, description, company_name, salary_min, salary_max, skills, created_at, updated_at)
VALUES (2, 2, 'Frontend Developer', 
        'Join our team as a Frontend Developer to create responsive and user-friendly web applications. You will work closely with designers and backend developers.', 
        'Tech Innovations Inc.', 
        65000.00, 
        90000.00, 
        'React, JavaScript, HTML, CSS, Redux', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO job_offers (id, recruiter_id, title, description, company_name, salary_min, salary_max, skills, created_at, updated_at)
VALUES (3, 3, 'Data Scientist', 
        'We are seeking a Data Scientist to analyze complex data sets and build predictive models. The ideal candidate will have strong statistical and programming skills.', 
        'Data Analytics Corp.', 
        80000.00, 
        120000.00, 
        'Python, R, Machine Learning, SQL, Data Visualization', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO job_offers (id, recruiter_id, title, description, company_name, salary_min, salary_max, skills, created_at, updated_at)
VALUES (4, 3, 'DevOps Engineer', 
        'Looking for a DevOps Engineer to automate our deployment processes and manage our cloud infrastructure. Experience with AWS and CI/CD pipelines is required.', 
        'Cloud Solutions Ltd.', 
        75000.00, 
        110000.00, 
        'AWS, Docker, Kubernetes, Jenkins, Terraform', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert applications
INSERT INTO applications (id, student_id, job_offer_id, status, cover_letter, applied_at, updated_at)
VALUES (1, 4, 1, 'PENDING', 
        'I am excited to apply for the Software Engineer position at Tech Innovations Inc. With my experience in Java and Spring Boot, I believe I would be a great fit for your team.', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO applications (id, student_id, job_offer_id, status, cover_letter, applied_at, updated_at)
VALUES (2, 4, 3, 'REVIEWING', 
        'I am applying for the Data Scientist position at Data Analytics Corp. Although my primary experience is in software development, I have been studying data science and machine learning in my spare time.', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO applications (id, student_id, job_offer_id, status, cover_letter, applied_at, updated_at)
VALUES (3, 5, 3, 'ACCEPTED', 
        'I am excited to apply for the Data Scientist position. With my Master''s degree in Data Science and internship experience, I believe I have the skills you are looking for.', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO applications (id, student_id, job_offer_id, status, cover_letter, feedback, applied_at, updated_at)
VALUES (4, 5, 4, 'REJECTED', 
        'I am interested in the DevOps Engineer position. While my background is primarily in data science, I have been learning about cloud technologies and DevOps practices.', 
        'Thank you for your application. While we appreciate your interest, we are looking for candidates with more hands-on experience with AWS and CI/CD pipelines.',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Reset sequence values
ALTER SEQUENCE users_id_seq RESTART WITH 6;
ALTER SEQUENCE student_profiles_id_seq RESTART WITH 3;
ALTER SEQUENCE job_offers_id_seq RESTART WITH 5;
ALTER SEQUENCE applications_id_seq RESTART WITH 5;
