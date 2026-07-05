# PawGPA

Smart GPA planning tool built with React — calculate your semester GPA, predict the score you need to hit a target CGPA, and explore optimal grade combinations to reach your goals.

**Live Demo:** [pawgpa.vercel.app](#) <!-- update this link after deploying to Vercel -->

## Features

- **Semester GPA Calculator** — Add subjects with credits and grades to instantly compute your semester GPA.
- **Target CGPA Predictor** — Enter your current CGPA, completed credits, and a target CGPA to calculate exactly what GPA you need next semester (reverse-GPA solving), with edge-case handling for impossible or already-achieved targets.
- **Grade Strategy Planner** — Set a target GPA and generate the top possible grade combinations across your subjects using a combinatorial search algorithm.
- **Study Corner** — Browse curated study tips and post/save your own advice, persisted locally via `localStorage`.

## Tech Stack

- React (with Hooks: `useState`, `useEffect`)
- TypeScript
- Tailwind CSS
- lucide-react (icons)

## How It Works

### Reverse-GPA Calculation
Given current CGPA, completed credits, and a target CGPA, the app solves for the required next-semester GPA:

```
requiredGPA = ((targetCGPA * totalFutureCredits) - (currentCGPA * completedCredits)) / nextSemCredits
```

The app also handles boundary cases — if the required GPA exceeds 10, it returns the maximum CGPA achievable instead; if it's negative, it confirms the user is already on track.

### Grade Strategy Engine
Using a recursive backtracking search, the planner explores grade combinations across all subjects to find the closest matches to a target GPA, ranked by minimum "distance" from the goal — helping students see multiple realistic paths to their target score.

### Local Persistence
Study Corner suggestions are saved to `localStorage`, so user-submitted tips persist across sessions without needing a backend.

## Getting Started

```bash
# Clone the repository
git clone https://github.com/dwivedisaumya/PawGPA.git

# Navigate into the project
cd PawGPA

# Install dependencies
npm install

# Run locally
npm run dev
```

## Screenshots
<img width="1555" height="901" alt="Screenshot 2026-07-06 032711" src="https://github.com/user-attachments/assets/5d716177-c007-46a3-9a80-7b1b929d9092" />
<img width="1610" height="882" alt="Screenshot 2026-07-06 032717" src="https://github.com/user-attachments/assets/7903734c-9004-48a7-9d7d-3a44fa74c5c7" />
<img width="1740" height="887" alt="Screenshot 2026-07-06 032726" src="https://github.com/user-attachments/assets/3cabcb67-3f17-4ab3-8d95-59c48a601ad5" />
<img width="1662" height="912" alt="Screenshot 2026-07-06 032733" src="https://github.com/user-attachments/assets/d916211e-39ac-46e5-b9a4-c13592bbc58d" />
<img width="1341" height="922" alt="Screenshot 2026-07-06 032741" src="https://github.com/user-attachments/assets/0e8b5cd7-5537-4ce0-a70d-26d2e7316ad1" />

## Author

**Saumya Dwivedi**
- [GitHub](https://github.com/dwivedisaumya)
- [LinkedIn](https://www.linkedin.com/in/saumya-dwivedi-029472324/)

## License

This project is open source and available under the [MIT License](LICENSE).
