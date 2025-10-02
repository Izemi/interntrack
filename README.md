# InternTrack 

A comprehensive full-stack web application to track internship applications with authentication, analytics, email notifications, and visa sponsorship insights. Built with React, Node.js, Express, and PostgreSQL.

![InternTrack Screenshot](./apptracker.png)

## Features

### Core Functionality
- **User Authentication** - Secure JWT-based login/registration with password reset via email
- **Application Management** - Add, edit, delete, and track internship applications with detailed information
- **Planning to Apply Status** - Track opportunities before applying with deadline reminders
- **Visa Sponsorship Tracking** - Filter and track companies by F-1 visa sponsorship status
- **Status Updates** - Quick dropdown to update application status through the interview pipeline
- **Activity Timeline** - Log notes and track detailed progress for each application

### Advanced Features
- **Email Notifications**  
  - Welcome emails for new users  
  - Deadline reminders (3 days, 1 day, day-of)  
  - Visa sponsor alerts when adding companies that sponsor visas  
- **Analytics Dashboard** - Visual charts showing:  
  - Applications over time (30-day trend)  
  - Status breakdown (bar chart)  
  - Visa sponsorship distribution (pie chart)  
  - Key metrics: response rate, interview rate, offer rate  
- **Research Integration** - One-click access to Glassdoor, LinkedIn, and Levels.fyi for company research  
- **Deadline Tracking** - Color-coded visual warnings for approaching deadlines  
- **Search & Filter** - Advanced filtering by company/role, status, and visa sponsorship  
- **CSV Import/Export** - Bulk import applications and export data for external analysis  
- **Mobile Responsive** - Card-based layout for mobile, table view for desktop  

## Tech Stack

**Frontend:**
- React 18 with Hooks  
- Vite  
- Tailwind CSS  
- React Router for navigation  
- Recharts for analytics visualizations  
- Axios for API calls  
- PapaParse for CSV handling  

**Backend:**
- Node.js  
- Express  
- PostgreSQL (Supabase)  
- JWT authentication  
- Bcrypt for password hashing  
- Resend for email notifications  
- Node-cron for scheduled tasks  

**Deployment:**
- Frontend: Vercel  
- Backend: Render  
- Database: Supabase (PostgreSQL)  

## Getting Started

### Prerequisites
- Node.js 16+  
- PostgreSQL database (or Supabase account)  
- Resend account (for email notifications)  

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Izemi/interntrack.git
   cd interntrack
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```
   
3. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```
   
4. Configure environment variables

Create **backend/.env**:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
RESEND_API_KEY=your_resend_api_key
PORT=8080
```

Create **frontend/.env**:
```env
VITE_API_URL=http://localhost:8080/api
```

5. Set up the database – run this SQL in PostgreSQL:
```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  salary_range VARCHAR(100),
  sponsors_visa BOOLEAN DEFAULT false,
  application_url TEXT,
  status VARCHAR(50) DEFAULT 'Planning to Apply',
  notes TEXT,
  deadline DATE,
  applied_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT jobs_status_check CHECK (status IN ('Planning to Apply', 'Applied', 'Online Assessment', 'Phone Screen', 'Final Round', 'Offer', 'Rejected'))
);

-- Activity log table
CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_activity_log_job_id ON activity_log(job_id);
```

6. Run the Application

    Backend
     ```bash
     cd backend
     npm run dev
     ```

     Frontend
     ```bash
     cd frontend
     npm run dev
     ```
  
    Visit: http://localhost:5173
7. Deployment

  Backend (Render)

  1. Connect your GitHub repository to Render
  2. Set environment variables in Render dashboard
  3. Deploy from main branch

  Frontend (Vercel)
  ```bash
  cd frontend
  npx vercel --prod
  ```

8. Usage
   1. Sign up with your email and create an account
   2. Add applications you're planning to apply to with deadlines
   3. Update status as you progress through the interview pipeline
   4. Track progress with the activity timeline
   5. View analytics to understand your application trends
   6. Export data to CSV for external analysis
   7. Receive email reminders for upcoming deadlines

9. Contributing
Contributions are welcome! Please:
  1. Fork the repository
  2. Create a feature branch (git checkout -b feature/AmazingFeature)
  3. Commit your changes (git commit -m 'Add some AmazingFeature')
  4. Push to the branch (git push origin feature/AmazingFeature)
  5. Open a Pull Request

10. License
MIT License - feel free to use this project for your own internship search!

## Author

**Emile Izere**

- [Github](https://github.com/Izemi) 
- [LinkedIn](https://www.linkedin.com/in/emile-izere-886432267/)


Built with ❤️ to help fellow students land their dream internships!

