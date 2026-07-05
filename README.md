# PawGPA - Academic Performance & GPA Management System

PawGPA is a high-performance web application engineered to calculate academic semester GPAs, predict future CGPA trajectories, and automatically map out granular grade-combination strategies. Built with React, TypeScript, and Tailwind CSS, the platform leverages asynchronous processing and browser local storage for localized configuration state persistence.

## 🛠️ Core Architecture & Features

- **Semester GPA Engine:** Computes course-weighted indices dynamically based on credit distribution and standard alphabetic grade mappings.
- **Predictive Trajectory Model:** Evaluates historical cumulative performance ($CGPA$) alongside finished/future credit vectors to isolate target threshold constraints.
- **Grade Combinatorics Planner:** Employs a deterministic search algorithm to solve the credit-grade weight equation, yielding actionable strategic roadmaps.
- **Persistent Storage (LocalStorage Engine):** Bypasses transactional cloud bottlenecks by implementing client-side persistence for immediate, cached state retrieval.

## 🚀 Technical Stack

- **Framework:** React 18 (Vite Bundler)
- **Language:** TypeScript (Strict Type Safety)
- **Styling UI:** Tailwind CSS & PostCSS
- **Iconography:** Lucide React Engine

## 💻 Installation & Environment Setup

Follow these steps to initialize the application locally:

1. **Clone the Source Repository:**
   ```bash
   git clone [https://github.com/dwivedisaumya/PawGPA.git](https://github.com/dwivedisaumya/PawGPA.git)
   cd paw-gpa
