# AI-Powered Recruitment Platform

A full-stack web application designed to simplify and enhance the recruitment process using artificial intelligence. It enables students to build and submit applications, recruiters to publish job offers, and an AI engine to recommend jobs and predict potential salaries based on CV analysis.

## Technologies

* **Backend**: Spring Boot (Java 17), PostgreSQL
* **Frontend**: React.js (future implementation)
* **AI/ML**: Scikit-learn, Sentence-Transformers (future integration)
* **Database Hosting**: Railway
* **Authentication**: JWT-based

## Features

### Core Features
- **Authentication & Authorization**: JWT-based secure login and registration
- **Student Profile Management**: Create and manage student profiles with skills and resume data
- **Job Offer Management**: Post, view, and manage job offers
- **Application System**: Apply to jobs and track application status

### AI Features (Placeholder implementations)
- **Job Recommendations**: Recommend jobs based on student profile and skills
- **Salary Prediction**: Predict salary ranges based on skills and education
- **Skills Extraction**: Extract skills from resume text

## Project Structure

```
ai-recruitment-platform/
├── src/main/java/com/ayoub/recruitment/
│   ├── ai/                    # AI services and models
│   ├── config/                # Application configuration
│   ├── controller/            # REST controllers
│   ├── dto/                   # Data Transfer Objects
│   ├── model/                 # Entity models
│   ├── repository/            # Data repositories
│   ├── security/              # Security configuration and JWT utilities
│   ├── service/               # Business logic services
│   └── AiRecruitmentPlatformApplication.java  # Main application class
├── src/main/resources/
│   └── application.properties  # Application configuration properties
└── build.gradle               # Gradle build configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Student Profiles
- `GET /api/students/me` - Get current student profile
- `PUT /api/students/update` - Update student profile

### Job Offers
- `GET /api/joboffers` - Get all job offers
- `GET /api/joboffers/{id}` - Get job offer by ID
- `GET /api/joboffers/search?keyword=...` - Search job offers
- `POST /api/joboffers` - Create a new job offer (recruiters only)
- `PUT /api/joboffers/{id}` - Update a job offer (recruiters only)
- `DELETE /api/joboffers/{id}` - Delete a job offer (recruiters only)

### Applications
- `GET /api/applications/student/{studentId}` - Get applications by student ID
- `GET /api/applications/joboffer/{jobOfferId}` - Get applications by job offer ID
- `POST /api/applications?jobOfferId=...` - Create a new application
- `PUT /api/applications/{id}/status?status=...` - Update application status (recruiters only)
- `PUT /api/applications/{id}/withdraw` - Withdraw an application (students only)

### AI Features
- `GET /api/ai/recommend?limit=5` - Get job recommendations
- `GET /api/ai/salary` - Get salary prediction
- `GET /api/ai/skills?resumeText=...` - Extract skills from resume text

## Setup Instructions

### Prerequisites
- Java 17 or higher
- PostgreSQL database
- Gradle
- Docker and Docker Compose (for containerized setup)

### Standard Setup

#### Database Setup
1. Create a PostgreSQL database named `recruitment_platform`
2. Update the database connection details in `application.properties`

#### Build and Run
```bash
# Clone the repository
git clone https://github.com/yourusername/ai-recruitment-platform.git
cd ai-recruitment-platform

# Build the project
./gradlew build

# Run the application
./gradlew bootRun
```

The application will start on `http://localhost:8080/api`

### Docker Setup

The application can be run in Docker containers, which includes the Spring Boot backend, React frontend, and PostgreSQL database.

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-recruitment-platform.git
cd ai-recruitment-platform

# Build and start the containers
docker-compose up -d

# To view logs
docker-compose logs -f

# To stop the containers
docker-compose down

# To stop the containers and remove volumes (will delete database data)
docker-compose down -v
```

Once the containers are running:
- Frontend: http://localhost
- Backend API: http://localhost:8080/api
- Database: localhost:5432 (accessible from your host machine for direct database access)

#### Docker Environment Variables

You can customize the Docker environment by modifying the environment variables in the `docker-compose.yml` file:

- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRATION`: JWT token expiration time in milliseconds

## Future Enhancements
- React.js frontend implementation
- Advanced AI models for job matching and salary prediction
- Admin dashboard
- Chat system between students and recruiters
- CV parsing with OCR
- Analytics dashboard for recruiters

