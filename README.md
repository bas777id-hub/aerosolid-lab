# AEROSOLID LAB — Research Lab Management Portal

A full-featured academic laboratory management web application built with **Next.js 16** (App Router) and **TypeScript**. Designed to streamline the daily operations of a research lab, from task tracking to calendar scheduling and user administration.

---

## ✨ Features

- **Role-based access control** — Admin, Supervisor, and Student roles with distinct dashboards
- **Project & task management** — Assign, track, and manage lab projects and individual tasks
- **Personal task & assignment management** — Each member can manage their own to-do list and deadlines
- **Academic board** — Manage lab staff, roster, and board members
- **Interactive calendar** — Full multi‑week calendar with appointments, activities, and Zoom meeting integration
- **Zoom meeting auto‑generation** — Automatically generate Zoom meeting links and passwords when booking meetings
- **Account management** — Create and manage user accounts with role assignment
- **Light / Dark theme** — Fully styled dual‑theme UI
- **Responsive design** — Works across desktop and tablet screens

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/aerosolid-lab.git
cd aerosolid-lab

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## 🗂️ Project Structure

```
src/
├── app/                 # Next.js App Router pages & layouts
├── components/          # Reusable UI components
│   ├── admin/           # Admin panel components
│   ├── calendar/        # Calendar and scheduling components
│   ├── tasks/           # Task management components
│   └── ...
└── styles/              # Global styles
```

---

## 🌐 Deployment

The easiest way to deploy is via **Vercel** (free tier available):

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **"Add New Project"** → import your repository.
4. Vercel will auto-detect Next.js settings — click **Deploy**.
5. Your app will be live at `https://<your-project>.vercel.app`.

Alternatively, you can deploy to **Netlify** or any Node.js‑capable host.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | CSS Modules / Global CSS |
| State | React useState / localStorage |
| Fonts | Google Fonts (Geist) |
| Deployment | Vercel (recommended) |

---

## 📄 License

This project is for internal lab use. Feel free to adapt it for your own research group.

---

> Built with ❤️ for the AEROSOLID LAB research team.