# Grade Calculator

A clean, modern Grade Calculator web application built with HTML, CSS, and vanilla JavaScript.

## Features

- Add multiple students and calculate grades for each
- Input validation (marks must be between 0 and max marks)
- Calculates:
  - Total marks and percentage
  - GPA on a 4.0 scale
  - Letter grade (A/B/C/D/F) per subject and overall
  - Pass/Fail status (fails if any subject < 40%)
- Color-coded grade badges and progress bars
- Export result sheet to a `.txt` file
- Responsive design (works on mobile and desktop)

## Grade Scale

| Percentage | Letter Grade | GPA |
|------------|-------------|-----|
| 90 – 100   | A           | 4.0 |
| 80 – 89    | B           | 3.0 |
| 70 – 79    | C           | 2.0 |
| 60 – 69    | D           | 1.0 |
| Below 60   | F           | 0.0 |

## Pass/Fail Rule

A student **FAILS** if any single subject has a score below **40%**, regardless of the overall average.

## How to Run

1. Unzip the folder.
2. Open `index.html` in any modern web browser.
3. No server, build tools, or internet connection required.

## File Structure

```
grade_calculator/
├── index.html   # App structure and layout
├── style.css    # All styles and theming
├── app.js       # Grade logic and interactivity
└── README.md    # This file
```
