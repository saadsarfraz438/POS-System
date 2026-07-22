# LumenSoft Point of Sale (POS) System

This project is a full-stack Point of Sale (POS) web application developed as part of the Lumensoft Technologies Internship Evaluation Program.

The application is built using modern web technologies including React.js for the frontend, ASP.NET Core Web API for the backend, and SQL Server for database management.

## Features

- Dashboard with business overview
- Product Management (CRUD)
- Salesperson Management (CRUD)
- Point of Sale (POS)
- Sales Records
- Product Search & AutoComplete
- Print receipt 
- REST API Integration
- SQL Server Database
- Responsive Bootstrap UI
- Form Validation
- SweetAlert Notifications
- Login & Logout feature

## Tech Stack

### Frontend
- React.js
- HTML&CSS
- TypeScript
- Bootstrap 5
- React Router
- Axios
- React Hook Form
- SweetAlert2

### Backend
- ASP.NET Core Web API
- C #
- Entity Framework Core
- Repository Pattern
- REST API

### Database
- Microsoft SQL Server

```
## Project Structure

 src/
├── assets/                  # Static files (images, icons, logos)
├── components/              # Reusable global UI (Button, Modal, Card, Table)
├── features/                # Feature-based modules
│   └── sales/
│       ├── components/      # Sales/POS-specific UI
│       ├── hooks/           # Custom hooks
│       ├── services/        # API calls for sales
│       └── utils/           # Sales helpers
├── hooks/                   # Global custom hooks
├── layouts/                 # App shell and navigation
├── pages/                   # Main views (Dashboard, Products, POS, Settings)
├── routes/                  # Route configuration
├── services/                # Global API setup
├── styles/                  # Global CSS
├── utils/                   # Shared helper functions
├── App.jsx                  # Root component
└── main.jsx                 # Entry point
```

## Purpose

The purpose of this project is to demonstrate full-stack development skills by implementing CRUD operations, REST API communication, responsive UI design, and SQL database integration in a real-world POS system.

---
Developed as part of the Lumensoft Technologies Internship Evaluation.
# React + TypeScript + Vite

---
## React Compiler

The React Compiler is not enabled on this because of its impact on dev & build performances.

## Expanding the Oxlint configuration

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```
---

## Contributing
Contributions, suggestions, and feature requests are welcome. Feel free to fork the repository, create a new branch, and submit a pull request.

---

## License

This project is licensed under the ![MIT License](https://img.shields.io/badge/MIT-License-blue?style=for-the-badge&logo=MIT-License)

---

### support
- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - Questions and community chat
- Reach out via:
  
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:saadsarfraz.se@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/saad-sarfraz-389450350/)
[![Twitter / X](https://img.shields.io/badge/X-black?style=for-the-badge&logo=x)](https://x.com/Saadsarfraz438)


