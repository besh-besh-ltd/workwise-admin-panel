# Workwise Admin Panel

## Project Overview
**Workwise Admin Panel** is the primary frontend application for managing the Workwise platform. It provides a comprehensive interface for administrators to oversee users, products, orders, content, and system settings. Built with Next.js, it offers a robust and responsive experience.

## Prerequisites
- **Node.js**: Make sure you have Node.js installed on your machine.

## Tech Stack
- **Framework**: Next.js (Pages Router)
- **State**: Redux Toolkit
- **Styling**: Bootstrap 5
- **Forms**: Formik & Yup

## Getting Started

Follow these minimal steps to get the project running locally.

### 1. Clone the repository
```bash
git clone <repository_url>
cd workwise-admin-panel
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file to create your local development configuration:
```bash
cp .env.example .env.development
```
> [!NOTE]
> The default port for this project is **8110**.

### 4. Run the development server
```bash
npm run dev
```

The application will be available at [http://localhost:8110](http://localhost:8110).

## Quick Links
- **[Getting Started](./docs/GETTING_STARTED.md)**
- **[Architecture](./docs/ARCHITECTURE.md)**
- **[Features](./docs/FEATURES.md)**
- **[Development Guide](./docs/DEVELOPMENT.md)**