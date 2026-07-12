# 🚚 TransitOps - Smart Transport Operations Platform

> A comprehensive fleet management and logistics operations platform built to enforce fleet regulations, optimize vehicle utilization, and provide real-time operational insights.

![TransitOps](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Platform](https://img.shields.io/badge/Platform-Web-orange)

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [How to Run](#how-to-run)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Architecture](#architecture)
- [Components Overview](#components-overview)
- [Contributing](#contributing)
- [License](#license)

---

## 📱 About the Project

**TransitOps** is an intelligent fleet management system designed for logistics companies, transportation operators, and fleet managers. It enforces regulatory compliance, automates operational workflows, and provides data-driven insights for fleet optimization.

The platform ensures that:
- ✅ Only licensed drivers operate vehicles
- ✅ Cargo weight never exceeds vehicle capacity
- ✅ Maintenance schedules are tracked automatically
- ✅ Fuel consumption and costs are monitored in real-time
- ✅ Fleet profitability is calculated with ROI metrics

Built during the **Odoo Hackathon 2026**, TransitOps combines a modern React frontend with a Node.js backend to create a seamless user experience.

---

## ⚡ Key Features

### 🔐 **Authentication & Role-Based Access**
- Multi-user login system with OTP verification
- 4 predefined roles: Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
- Session management with persistent login

### 🚗 **Vehicle Registry**
- Add, edit, and delete vehicles with detailed specifications
- Track registration numbers, make/model, capacity, and odometer readings
- Real-time status tracking (Available, On Trip, In Shop, Retired)
- Region-based vehicle organization

### 👨‍✈️ **Driver Management**
- Driver profile creation with license tracking
- Automatic license expiration alerts (30 days configurable)
- Safety score monitoring
- Suspension flags for policy violations
- Driver status updates (Available, On Trip, Suspended)

### 📍 **Trip Management & Dispatching**
- Create and dispatch trips with automatic validation
- Prevent overloaded cargo (automatic weight verification)
- Prevent unlicensed/suspended drivers from operating
- Track trip status: Pending → Dispatched → Completed → Archived
- Automatic fuel logging when trips complete

### 🔧 **Maintenance Workflow**
- Log maintenance work orders with cost tracking
- Auto-transition vehicle to "In Shop" status
- Mark maintenance as complete with final cost
- History of all maintenance records

### ⛽ **Fuel & Expenses Management**
- Record fuel consumption per vehicle
- Track fuel costs and efficiency metrics
- Log operational expenses by category
- Calculate fleet-wide fuel efficiency (km/L)

### 📊 **Analytics & Reporting**
- Fleet ROI calculation
- Vehicle-level profitability analysis
- Fuel efficiency metrics
- Fleet utilization dashboard
- CSV export for spreadsheet analysis
- Print/PDF export for professional reports

### 🎨 **User Interface**
- Light/Dark mode toggle
- Responsive design (works on desktop, tablet, mobile)
- Real-time search across all sections
- Navigation history with back/forward buttons
- Clean, modern dashboard with KPI cards
- Alert & notification system

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Purpose | Version |
|-----------|---------|---------|
| React | UI library and component framework | 19.2.7 |
| Vite | Fast build tool and dev server | 8.1.1 |
| CSS3 | Styling with CSS variables for theming | - |
| JavaScript ES6+ | Modern JavaScript features | - |
| EmailJS | Email-based OTP verification | 4.4.1 |
| Context API | State management | Built-in |

**Browser Support:** Chrome, Firefox, Safari, Edge (modern versions)

### **Backend**
| Technology | Purpose | Version |
|-----------|---------|---------|
| Node.js | JavaScript runtime | 16+ |
| Express.js | Web framework | Latest |
| CORS | Cross-origin resource sharing | Latest |

**Architecture:** RESTful API with synchronous operations

### **Database**
| Technology | Purpose |
|-----------|---------|
| JSON File Storage | Persistent data storage (app.db.json) |
| File System | Simple, file-based persistence |

---

## 📁 Project Structure

```
Odoo-Hackathon-2026/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── Dashboard.jsx       # Main dashboard view
│   │   ├── VehicleRegistry.jsx # Vehicle CRUD interface
│   │   ├── DriverManagement.jsx # Driver profiles
│   │   ├── TripManagement.jsx   # Trip dispatcher
│   │   ├── Maintenance.jsx      # Maintenance tracking
│   │   ├── FuelExpenses.jsx     # Fuel & expense logs
│   │   ├── Reports.jsx          # Analytics & reporting
│   │   ├── Settings.jsx         # System configuration
│   │   ├── Login.jsx            # Authentication
│   │   ├── Navbar.jsx           # Top navigation
│   │   ├── Sidebar.jsx          # Side menu
│   │   └── ...
│   ├── context/
│   │   └── AppContext.jsx       # Global state management
│   ├── data/
│   │   ├── mockDb.js            # Business logic & validation
│   │   └── api.js               # Backend API client
│   ├── assets/                  # Images and static files
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # React entry point
│   ├── index.css                # Global styles
│   └── App.css                  # Layout styles
├── server/                       # Backend source code
│   ├── index.js                 # Express server setup
│   ├── db.js                    # Database layer
│   └── package.json
├── data/
│   └── app.db.json              # Database file (persistent)
├── tests/
│   └── db.test.js               # Backend tests
├── dist/                        # Production build output
├── public/                      # Static assets
├── package.json                 # Dependencies
├── vite.config.js               # Vite configuration
├── index.html                   # HTML entry point
└── README.md                    # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** 16+ (includes npm)
- **Git** for version control
- Modern web browser

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/Odoo-Hackathon-2026.git
cd Odoo-Hackathon-2026
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- **Frontend dependencies:** React, Vite, React DOM, EmailJS
- **Backend dependencies:** Express, CORS

### Step 3: Verify Installation
```bash
npm test
```

Expected output:
```
✔ creates a default store and supports CRUD for vehicles
ℹ tests 1
ℹ pass 1
ℹ fail 0
```

---

## 🎮 How to Run

### Option 1: Run Both Frontend & Backend (Recommended)

**Terminal 1 - Start the Backend:**
```bash
npm run backend
```

Expected output:
```
TransitOps backend listening on port 5000
```

**Terminal 2 - Start the Frontend:**
```bash
npm run dev
```

Expected output:
```
  VITE v8.1.1  ready in 345 ms

  ➜  Local:   http://localhost:5173/
```

Open your browser and go to `http://localhost:5173/`

### Option 2: Production Build

```bash
# Build the app
npm run build

# Preview production build (optional)
npm run preview
```

The optimized files will be in the `dist/` directory.

### Available npm Scripts

```bash
npm run dev        # Start dev server with live reload
npm run backend    # Start Express backend server
npm run build      # Build for production
npm run preview    # Preview production build
npm test           # Run backend tests
npm run lint       # Lint code with oxlint
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "ok": true,
  "message": "TransitOps backend is running"
}
```

### Authentication
```http
POST /api/login
Content-Type: application/json

{
  "email": "admin@transitops.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-admin",
    "name": "Fleet Manager",
    "email": "admin@transitops.com",
    "role": "Fleet Manager"
  }
}
```

### CRUD Operations

#### Get All Records
```http
GET /api/:collection
```

Example: `GET /api/vehicles`

#### Create Record
```http
POST /api/:collection
Content-Type: application/json

{
  "regNum": "ABC-123",
  "name": "Toyota Hiace",
  "type": "Van",
  "maxCapacity": 1000,
  "status": "Available"
}
```

#### Update Record
```http
PUT /api/:collection/:id
Content-Type: application/json

{
  "status": "In Shop"
}
```

#### Delete Record
```http
DELETE /api/:collection/:id
```

### Supported Collections
- `users` - User accounts
- `vehicles` - Fleet vehicles
- `drivers` - Driver profiles
- `trips` - Trip records
- `maintenance` - Maintenance logs
- `fuelLogs` - Fuel consumption
- `expenses` - Operational expenses
- `settings` - System settings

---

## 💾 Database

### Storage Location
```
data/app.db.json
```

### Default Data Structure
```json
{
  "users": [
    {
      "id": "user-admin",
      "name": "Fleet Manager",
      "email": "admin@transitops.com",
      "password": "password123",
      "role": "Fleet Manager"
    }
  ],
  "vehicles": [],
  "drivers": [],
  "trips": [],
  "maintenance": [],
  "fuelLogs": [],
  "expenses": [],
  "settings": {
    "currency": "USD",
    "revenuePerKm": 3,
    "licenseWarningDays": 30
  }
}
```

### Default Login Credentials
| Email | Password | Role |
|-------|----------|------|
| admin@transitops.com | password123 | Fleet Manager |
| dispatcher@transitops.com | password123 | Dispatcher |
| safety@transitops.com | password123 | Safety Officer |
| finance@transitops.com | password123 | Financial Analyst |

---

## 🏗️ Architecture

### Frontend Architecture

```
┌─────────────────────────────────────┐
│     React Components (JSX)          │
│  (Dashboard, Registry, etc.)        │
└────────────────┬────────────────────┘
                 │
┌─────────────────┴────────────────────┐
│      AppContext (State Manager)      │
│  (Global state, API calls)           │
└────────────────┬────────────────────┘
                 │
┌─────────────────┴────────────────────┐
│     API Client (api.js)              │
│  (Synchronous XMLHttpRequest)        │
└────────────────┬────────────────────┘
                 │
            HTTP/CORS
                 │
┌─────────────────┴────────────────────┐
│    Express Backend (Node.js)         │
│  (REST endpoints, business logic)    │
└────────────────┬────────────────────┘
                 │
┌─────────────────┴────────────────────┐
│    Database Layer (db.js)            │
│  (JSON file persistence)             │
└─────────────────────────────────────┘
```

---

## 🔧 Components Overview

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **Dashboard** | Main overview screen | KPI cards, alert system, quick actions |
| **VehicleRegistry** | Vehicle management | CRUD operations, filtering, status tracking |
| **DriverManagement** | Driver profiles | License tracking, safety scores, alerts |
| **TripManagement** | Trip dispatching | Validation, auto-status transitions |
| **Maintenance** | Work order tracking | Cost tracking, status management |
| **FuelExpenses** | Fuel & cost logs | Consumption tracking, reporting |
| **Reports** | Analytics dashboard | ROI calculation, charts, PDF export |
| **Settings** | System configuration | Global parameters, user management |
| **Navbar** | Top navigation | Search, alerts, dark mode, history |
| **Sidebar** | Side menu | Route navigation, user info |
| **Login** | Authentication | Email/password, signup, OTP |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🚀 Quick Start Summary

1. **Install:** `npm install`
2. **Backend:** `npm run backend` (Terminal 1)
3. **Frontend:** `npm run dev` (Terminal 2)
4. **Open:** `http://localhost:5173/`
5. **Login:** Use credentials from Database section above
6. **Start managing:** Add vehicles, drivers, and create trips!

---

**Built with ❤️ for the Odoo Hackathon 2026**

*Last Updated: July 2026*