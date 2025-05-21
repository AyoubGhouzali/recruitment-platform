import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

/**
 * A standalone demo application that simulates the core functionality of the AI Recruitment Platform
 * without requiring external dependencies or network connectivity.
 */
public class DemoApplication {
    private static final Map<String, String> users = new HashMap<>();
    private static final List<JobOffer> jobOffers = new ArrayList<>();
    private static final List<Application> applications = new ArrayList<>();
    
    private static String currentUser = null;
    private static UserRole currentRole = null;
    
    public static void main(String[] args) {
        // Initialize with sample data
        initializeSampleData();
        
        Scanner scanner = new Scanner(System.in);
        boolean running = true;
        
        System.out.println("=== AI Recruitment Platform Demo ===");
        System.out.println("This is a simple demo of the platform's core functionality.");
        
        while (running) {
            if (currentUser == null) {
                showLoginMenu();
                int choice = getIntInput(scanner, 1, 3);
                
                switch (choice) {
                    case 1:
                        login(scanner);
                        break;
                    case 2:
                        register(scanner);
                        break;
                    case 3:
                        running = false;
                        break;
                }
            } else {
                if (currentRole == UserRole.STUDENT) {
                    showStudentMenu();
                    int choice = getIntInput(scanner, 1, 5);
                    
                    switch (choice) {
                        case 1:
                            viewAllJobOffers();
                            break;
                        case 2:
                            applyForJob(scanner);
                            break;
                        case 3:
                            viewMyApplications();
                            break;
                        case 4:
                            getJobRecommendations();
                            break;
                        case 5:
                            logout();
                            break;
                    }
                } else if (currentRole == UserRole.RECRUITER) {
                    showRecruiterMenu();
                    int choice = getIntInput(scanner, 1, 4);
                    
                    switch (choice) {
                        case 1:
                            createJobOffer(scanner);
                            break;
                        case 2:
                            viewMyJobOffers();
                            break;
                        case 3:
                            viewApplicationsForMyJobs();
                            break;
                        case 4:
                            logout();
                            break;
                    }
                }
            }
            
            System.out.println("\nPress Enter to continue...");
            scanner.nextLine();
        }
        
        System.out.println("Thank you for using the AI Recruitment Platform Demo!");
        scanner.close();
    }
    
    private static void initializeSampleData() {
        // Add sample users
        users.put("student@example.com", "STUDENT");
        users.put("recruiter@example.com", "RECRUITER");
        
        // Add sample job offers
        jobOffers.add(new JobOffer(1, "Software Developer", "Java developer with Spring Boot experience", 
                "Tech Company Inc.", "recruiter@example.com", "New York", "Full-time"));
        jobOffers.add(new JobOffer(2, "Data Scientist", "ML expert with Python and TensorFlow", 
                "AI Solutions Ltd.", "recruiter@example.com", "Remote", "Contract"));
        jobOffers.add(new JobOffer(3, "DevOps Engineer", "Experience with Docker, Kubernetes, and CI/CD", 
                "Cloud Services Co.", "recruiter@example.com", "San Francisco", "Full-time"));
        
        // Add sample applications
        applications.add(new Application(1, 1, "student@example.com", "Interested in this position", "PENDING"));
    }
    
    private static void showLoginMenu() {
        System.out.println("\n=== Login Menu ===");
        System.out.println("1. Login");
        System.out.println("2. Register");
        System.out.println("3. Exit");
        System.out.print("Enter your choice: ");
    }
    
    private static void showStudentMenu() {
        System.out.println("\n=== Student Menu ===");
        System.out.println("Logged in as: " + currentUser);
        System.out.println("1. View All Job Offers");
        System.out.println("2. Apply for a Job");
        System.out.println("3. View My Applications");
        System.out.println("4. Get Job Recommendations");
        System.out.println("5. Logout");
        System.out.print("Enter your choice: ");
    }
    
    private static void showRecruiterMenu() {
        System.out.println("\n=== Recruiter Menu ===");
        System.out.println("Logged in as: " + currentUser);
        System.out.println("1. Create Job Offer");
        System.out.println("2. View My Job Offers");
        System.out.println("3. View Applications for My Jobs");
        System.out.println("4. Logout");
        System.out.print("Enter your choice: ");
    }
    
    private static void login(Scanner scanner) {
        System.out.print("Enter email: ");
        String email = scanner.nextLine();
        System.out.print("Enter password (any value for demo): ");
        scanner.nextLine(); // Password is not checked in the demo
        
        if (users.containsKey(email)) {
            currentUser = email;
            currentRole = UserRole.valueOf(users.get(email));
            System.out.println("Login successful! Welcome, " + currentUser);
        } else {
            System.out.println("User not found. Please register first.");
        }
    }
    
    private static void register(Scanner scanner) {
        System.out.print("Enter email: ");
        String email = scanner.nextLine();
        System.out.print("Enter password (any value for demo): ");
        scanner.nextLine(); // Password is not stored in the demo
        System.out.println("Select role: ");
        System.out.println("1. Student");
        System.out.println("2. Recruiter");
        System.out.print("Enter your choice: ");
        int roleChoice = getIntInput(scanner, 1, 2);
        
        String role = roleChoice == 1 ? "STUDENT" : "RECRUITER";
        users.put(email, role);
        
        System.out.println("Registration successful! Please login.");
    }
    
    private static void logout() {
        currentUser = null;
        currentRole = null;
        System.out.println("Logged out successfully.");
    }
    
    private static void viewAllJobOffers() {
        System.out.println("\n=== All Job Offers ===");
        if (jobOffers.isEmpty()) {
            System.out.println("No job offers available.");
            return;
        }
        
        for (JobOffer job : jobOffers) {
            System.out.println(job);
        }
    }
    
    private static void applyForJob(Scanner scanner) {
        viewAllJobOffers();
        System.out.print("Enter job ID to apply: ");
        int jobId = getIntInput(scanner, 1, Integer.MAX_VALUE);
        
        JobOffer job = findJobOfferById(jobId);
        if (job == null) {
            System.out.println("Job offer not found.");
            return;
        }
        
        System.out.print("Enter cover letter: ");
        String coverLetter = scanner.nextLine();
        
        int applicationId = applications.size() + 1;
        applications.add(new Application(applicationId, jobId, currentUser, coverLetter, "PENDING"));
        
        System.out.println("Application submitted successfully!");
    }
    
    private static void viewMyApplications() {
        System.out.println("\n=== My Applications ===");
        boolean found = false;
        
        for (Application app : applications) {
            if (app.getStudentEmail().equals(currentUser)) {
                JobOffer job = findJobOfferById(app.getJobOfferId());
                if (job != null) {
                    System.out.println("Application ID: " + app.getId());
                    System.out.println("Job: " + job.getTitle() + " at " + job.getCompany());
                    System.out.println("Status: " + app.getStatus());
                    System.out.println("Cover Letter: " + app.getCoverLetter());
                    System.out.println("------------------------");
                    found = true;
                }
            }
        }
        
        if (!found) {
            System.out.println("You haven't applied to any jobs yet.");
        }
    }
    
    private static void getJobRecommendations() {
        System.out.println("\n=== Job Recommendations ===");
        System.out.println("Based on your profile, we recommend these jobs:");
        
        // Simple recommendation logic for demo purposes
        int count = 0;
        for (JobOffer job : jobOffers) {
            boolean alreadyApplied = applications.stream()
                .anyMatch(app -> app.getJobOfferId() == job.getId() && app.getStudentEmail().equals(currentUser));
            
            if (!alreadyApplied) {
                System.out.println(job);
                count++;
            }
        }
        
        if (count == 0) {
            System.out.println("No recommendations available. You've applied to all available jobs.");
        }
    }
    
    private static void createJobOffer(Scanner scanner) {
        System.out.println("\n=== Create Job Offer ===");
        System.out.print("Enter job title: ");
        String title = scanner.nextLine();
        System.out.print("Enter job description: ");
        String description = scanner.nextLine();
        System.out.print("Enter company name: ");
        String company = scanner.nextLine();
        System.out.print("Enter location: ");
        String location = scanner.nextLine();
        System.out.print("Enter employment type (Full-time, Part-time, Contract): ");
        String employmentType = scanner.nextLine();
        
        int jobId = jobOffers.size() + 1;
        jobOffers.add(new JobOffer(jobId, title, description, company, currentUser, location, employmentType));
        
        System.out.println("Job offer created successfully!");
    }
    
    private static void viewMyJobOffers() {
        System.out.println("\n=== My Job Offers ===");
        boolean found = false;
        
        for (JobOffer job : jobOffers) {
            if (job.getRecruiterEmail().equals(currentUser)) {
                System.out.println(job);
                found = true;
            }
        }
        
        if (!found) {
            System.out.println("You haven't created any job offers yet.");
        }
    }
    
    private static void viewApplicationsForMyJobs() {
        System.out.println("\n=== Applications for My Jobs ===");
        boolean found = false;
        
        for (JobOffer job : jobOffers) {
            if (job.getRecruiterEmail().equals(currentUser)) {
                System.out.println("Job: " + job.getTitle());
                
                boolean hasApplications = false;
                for (Application app : applications) {
                    if (app.getJobOfferId() == job.getId()) {
                        System.out.println("  Application ID: " + app.getId());
                        System.out.println("  Student: " + app.getStudentEmail());
                        System.out.println("  Status: " + app.getStatus());
                        System.out.println("  Cover Letter: " + app.getCoverLetter());
                        System.out.println("  ------------------------");
                        hasApplications = true;
                        found = true;
                    }
                }
                
                if (!hasApplications) {
                    System.out.println("  No applications for this job yet.");
                }
                
                System.out.println("------------------------");
            }
        }
        
        if (!found) {
            System.out.println("You haven't created any job offers yet.");
        }
    }
    
    private static JobOffer findJobOfferById(int id) {
        for (JobOffer job : jobOffers) {
            if (job.getId() == id) {
                return job;
            }
        }
        return null;
    }
    
    private static int getIntInput(Scanner scanner, int min, int max) {
        int input = -1;
        while (input < min || input > max) {
            try {
                input = Integer.parseInt(scanner.nextLine());
                if (input < min || input > max) {
                    System.out.print("Please enter a number between " + min + " and " + max + ": ");
                }
            } catch (NumberFormatException e) {
                System.out.print("Please enter a valid number: ");
            }
        }
        return input;
    }
    
    // Model classes
    enum UserRole {
        STUDENT, RECRUITER
    }
    
    static class JobOffer {
        private int id;
        private String title;
        private String description;
        private String company;
        private String recruiterEmail;
        private String location;
        private String employmentType;
        
        public JobOffer(int id, String title, String description, String company, 
                       String recruiterEmail, String location, String employmentType) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.company = company;
            this.recruiterEmail = recruiterEmail;
            this.location = location;
            this.employmentType = employmentType;
        }
        
        public int getId() { return id; }
        public String getTitle() { return title; }
        public String getCompany() { return company; }
        public String getRecruiterEmail() { return recruiterEmail; }
        
        @Override
        public String toString() {
            return "ID: " + id + "\n" +
                   "Title: " + title + "\n" +
                   "Company: " + company + "\n" +
                   "Description: " + description + "\n" +
                   "Location: " + location + "\n" +
                   "Employment Type: " + employmentType + "\n" +
                   "------------------------";
        }
    }
    
    static class Application {
        private int id;
        private int jobOfferId;
        private String studentEmail;
        private String coverLetter;
        private String status;
        
        public Application(int id, int jobOfferId, String studentEmail, String coverLetter, String status) {
            this.id = id;
            this.jobOfferId = jobOfferId;
            this.studentEmail = studentEmail;
            this.coverLetter = coverLetter;
            this.status = status;
        }
        
        public int getId() { return id; }
        public int getJobOfferId() { return jobOfferId; }
        public String getStudentEmail() { return studentEmail; }
        public String getCoverLetter() { return coverLetter; }
        public String getStatus() { return status; }
    }
}
