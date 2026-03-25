# Crypt_Arithematic

LINK: https://jaiakasht.github.io/Crypt_Arithematic/

🧩 Cryptarithm Solver

A modern, interactive Cryptarithmetic (Alphametic) Solver Web Application that solves word-based mathematical puzzles like:

SEND + MORE = MONEY

Built using HTML, CSS, and JavaScript, this project demonstrates the power of backtracking algorithms and constraint satisfaction techniques in an intuitive and visually appealing way.

🚀 Features
⚡ Lightning-fast solver using optimized DFS backtracking
🧠 Smart constraint handling (unique digits, no leading zeros)
🎯 Instant solutions with execution time & attempt count
📊 Step-by-step solving mode (optional)
🎲 Random puzzle generator with 40+ puzzles
📋 Copy solution feature
🕘 Recent puzzles (localStorage support)
🌗 Dark & Light theme toggle
🎨 Modern UI (Glassmorphism + 3D animations)
📚 Built-in learning section explaining concepts and algorithms
🖥️ Live Functionality

The application includes multiple sections:

Home – Introduction and features
Solver – Enter and solve puzzles instantly
Learn – Understand rules, examples, and algorithms
About – Project details and technologies
⚙️ How It Works

The solver uses a Depth-First Search (DFS) Backtracking Algorithm:

Extracts all unique characters from the puzzle
Assigns digits (0–9) ensuring:
No duplicate digit mapping
No leading zeros
Converts words into base-10 positional weights
Recursively searches for valid assignments where:
Weighted Sum = 0

This approach avoids recomputation and improves efficiency significantly.

📂 Project Structure
📁 Cryptarithm-Solver
 ├── index.html   → Structure & UI layout
 ├── style.css    → Styling, animations, themes
 ├── script.js    → Solver logic & interactions
UI and layout are defined in index.html
Styling includes glassmorphism, animations, and themes
Core solving logic is implemented using backtracking in JavaScript

🛠️ Technologies Used
HTML5
CSS3
JavaScript
Backtracking Algorithm


📚 What is Cryptarithmetic?

Cryptarithmetic is a type of puzzle where:

Letters represent digits (0–9)
Each letter has a unique value
The arithmetic equation must be valid

Example:

  SEND
+ MORE
-------
 MONEY
-------
🎯 Purpose of the Project

This project was developed as a college project to:

Demonstrate Artificial Intelligence concepts
Apply Constraint Satisfaction Problems (CSP)
Build a real-world interactive web application
Improve problem-solving and algorithmic thinking


✅ No backend required — runs entirely in the browser.

🌟 Future Improvements
Step-by-step visualization of backtracking
Support for multiplication/division puzzles
Performance optimization for large puzzles


📌 Conclusion

This project combines logic, mathematics, and web development to create an engaging tool that makes learning algorithms fun and interactive.
