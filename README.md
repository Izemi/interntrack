# InternTrack 

A full-stack web application to track internship applications with visa sponsorship insights, built with React, Node.js, Express, and PostgreSQL.

![InternTrack Screenshot](./apptracker.png)

## Features

- **Application Management** - Add, edit, and delete internship applications
- **Visa Sponsorship Tracking** - Filter companies by F-1 visa sponsorship status
- **Status Updates** - Quick dropdown to update application status (Applied, Interview, Offer, Rejected)
- **Activity Timeline** - Log notes and track progress for each application
- **Research Links** - Quick access to Glassdoor, LinkedIn, and Levels.fyi for company research
- **Deadline Tracking** - Visual warnings for approaching deadlines
- **Search & Filter** - Search by company/role, filter by status and visa sponsorship
- **CSV Export** - Export all applications to CSV for analysis
- **Statistics Dashboard** - Track total applications, interviews, response rate, and visa sponsors

## Tech Stack

**Frontend:**
- React 
- Vite
- Tailwind CSS
- Axios

**Backend:**
- Node.js
- Express
- PostgreSQL (Supabase)

**Deployment:**
- Frontend: Vercel
- Backend: Render
- Database: Supabase

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL database (or Supabase account)

### Installation

1. Clone the repository

git clone https://github.com/YOUR_USERNAME/interntrack.git
cd interntrack

### Intall backend dependencies

cd backend
npm install

### Install frontend dependencies

cd ../frontend
npm install

### Create backend/.env

DATABASE_URL=your_postgresql_connection_string
PORT=8080

### Run this SQL in your PostgreSQL database to set up the database

CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  salary_range VARCHAR(100),
  sponsors_visa BOOLEAN DEFAULT false,
  application_url TEXT,
  job_description TEXT,
  status VARCHAR(50) DEFAULT 'Applied',
  notes TEXT,
  deadline DATE,
  applied_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

### Run the application:

### Backend
cd backend
npm run dev

## Frontend
cd frontend
npm run dev

Visit: http://localhost:5173

### Future Enhancements

Email notifications for upcoming deadlines
Bulk CSV import
Analytics dashboard with charts
Browser extension for quick job additions
Mobile app
Dark mode

### Contributing
Contributions are welcome! Please open an issue or submit a pull request.

### License
MIT License - feel free to use this project for your own internship search!

### Author
Emile Izere

### GitHub: 
@Izemi
### LinkedIn: 
https://www.linkedin.com/in/emile-izere-886432267/

Built with ❤️ to help students my fellow students land their dream internships!