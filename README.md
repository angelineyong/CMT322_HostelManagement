Fixify is a **workflow-based web application** designed to streamline campus facility maintenance and complaint management.  
It enables **students**, **maintenance staff**, and **administrators** to collaborate efficiently in reporting, assigning, and tracking facility issues.

---

## Getting Started

Follow the steps below to set up and run the project on your local machine.

### 1️. Clone the Repository

```bash
git clone https://github.com/angelineyong/CMT322_HostelManagement.git
```

---

### 2. Navigate to the Project Directory

```bash
cd frontend
```

---

### 3️. Install Dependencies

Depending on your preferred package manager:

```bash
npm install
```

or

```bash
yarn install
```

> This will install all required dependencies listed in `package.json`.

---

### 4. Start the Development Server

Run the following command to launch the local development environment:

```bash
npm run dev
```

or

```bash
yarn dev
```

By default, the app will be available at:

👉 **[http://localhost:5173](http://localhost:5173)**

---

## Project Structure

Below is the general folder structure of the CampusFix frontend:

```
Fixify/
├── frontend/
│   ├── src/
│   │   ├── assets/              # Images, icons, and static files
│   │   ├── components/          # Reusable UI components (e.g. Sidebar)
│   │   ├── pages/               # Page-level components (Student, Staff, Admin)
│   │   │   ├── student/         # Pages for student users
│   │   │   ├── staff/           # Pages for maintenance staff
│   │   │   ├── admin/           # Pages for administrators
│   │   ├── data/
│   │   │   ├── mockData.ts      # For storing dummy data
│   │   ├── router/
│   │   │   ├── AppRouter.tsx/   # Routing setup
│   │   ├── App.tsx              # Main app component
│   │   ├── main.tsx             # Application entry point
│   │   ├── index.css            # TailwindCSS setup
│   │   └── types/               # TypeScript type definitions
│   ├── public/                  # Static files served directly
│   ├── package.json             # Project dependencies and scripts
│   ├── tsconfig.json            # TypeScript configuration
│   └── vite.config.ts           # Vite configuration for dev environment
├── README.md                    # Project documentation
```

---

## Tech Stack

| Layer                  | Technology         |
| ---------------------- | ------------------ |
| **Frontend Framework** | React + TypeScript |
| **UI Library**         | Tailwind CSS       |
| **Icons**              | lucide-react       |
| **Build Tool**         | Vite               |
| **Routing**            | React Router v6    |
