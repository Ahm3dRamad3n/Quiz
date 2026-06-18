<div align="center">

# 🎓 Interactive Quiz Platform

**A full-stack, serverless dynamic quiz engine designed for high performance, robust security, and a seamless user experience. Create, manage, share, and export quizzes effortlessly.**

[![Live Demo](https://img.shields.io/badge/🌍_Live_Demo-2EA043?style=for-the-badge&logo=github&logoColor=white)](https://ahm3dramad3n.github.io/Quiz/)
<br>
[![Follow on GitHub](https://img.shields.io/github/followers/Ahm3dRamad3n?label=Follow&style=social)](https://github.com/Ahm3dRamad3n)
[![Connect on LinkedIn](https://img.shields.io/badge/Connect-LinkedIn-0077B5?style=social&logo=linkedin)](https://www.linkedin.com/in/ahm3d-ramadan/)
<br>
[![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)]()
[![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)]()
[![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)]()

</div>

---

## 📌 Overview

**Interactive Quiz Platform** has evolved from a static webpage into a highly scalable, data-driven **Full-Stack Quiz Platform**. Built with Vanilla JavaScript and powered by **Firebase**, it empowers educators and creators to build, manage, and share complex interactive quizzes instantly. With a dedicated creator dashboard, real-time cloud syncing, and enterprise-grade security, users can deploy quizzes without touching a single line of code.

---

## ✨ Key Features

### 🛠️ Creator Dashboard & Cloud Sync
* **User Authentication:** Secure Google Sign-In powered by Firebase Auth.
* **Quiz Builder Studio:** A comprehensive dashboard to create, edit, and delete quizzes dynamically.
* **Privacy Controls:** Toggle quizzes between **Public** (visible to all visitors) and **Private** (accessible only via a direct, secure share link).

### 🖨️ Smart PDF Export (PrintJS)
* **Download on the Go:** Export any quiz to a beautifully formatted PDF directly from the homepage.
* **Answered vs. Unanswered:** Choose to download a blank test for students or a fully solved answer key with visual indicators.
* **Intelligent Language Selection:** For bilingual quizzes, the export modal dynamically allows users to print strictly in Arabic (RTL) or English (LTR).

### 🛡️ Enterprise-Grade Security & UX Validation
* **Real-Time Input Validation:** Dynamic character counters and strict length limits (e.g., 200 chars for titles, 1000 for questions) prevent database bloat and UI breaking.
* **Payload Safety:** Auto-calculates JSON payload size before saving to ensure it stays safely under Firestore's 1MB document limit.
* **XSS Protection:** Deep sanitization of all user-generated content and image URLs.
* **Strict Firestore Rules:** Backend security rules guarantee that private data remains absolutely private.

### 🧠 Engine Intelligence & Time Management
* **Multi-Format Support:** Handles True/False, Single Choice, and Multiple Choice questions.
* **Smart Auto-Skip & Freezing:** Unanswered questions are flagged for review, while answered ones are instantly locked to ensure test integrity.
* **Advanced Timer Controls (via Settings Modal):** Choose from Untimed, Count-Up (Stopwatch), or Count-Down (Challenge) modes.

### 🎨 Immersive User Experience (UX)
* **Decluttered UI:** All secondary controls (Theme toggle, Timer modes) are neatly housed inside an elegant **Settings Modal**.
* **Real-Time Translation:** Full bilingual support with instant English/Arabic toggling.
* **Fully Responsive:** Flawless rendering across Desktop, Tablet, and Mobile devices with perfectly stacked grids and optimized viewports.

---

## 🚀 How to Use

Gone are the days of manually editing JSON files! The platform is now fully GUI-driven:

1. Visit the [Live Demo](https://ahm3dramad3n.github.io/Quiz/).
2. Click **Sign in with Google**.
3. Navigate to your **Dashboard**.
4. Use the **Quiz Builder** to add your title, description, and questions.
5. Click **Save Quiz** to instantly deploy it to the cloud. 
6. Share your public profile or direct quiz links with your students!

---

## 💻 Local Development Setup

Want to run the project locally or contribute to the code? Follow these steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Ahm3dRamad3n/Quiz.git](https://github.com/Ahm3dRamad3n/Quiz.git)

   ```

2. **Open the project folder:**
   ```bash
   cd Quiz

   ```

3. **Run a Local Server:**
Since the project uses ES6 Modules and fetches external resources, it must be run via a local server (opening the HTML file directly in the browser using `file://` will cause CORS errors).
* If you use **VS Code**, install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension and click "Go Live".
* Alternatively, use Python: `python -m http.server 8000`


4. **Firebase Configuration (For Contributors):**
The live demo connects to the production Firebase project. If you wish to modify the code or test database writes without affecting the production data, please create your own free Firebase project, enable Firestore and Google Authentication, and replace the `firebaseConfig` object in the JS files with your own credentials.

---

## 🛠️ Technical Stack

Built with a philosophy of **Logic over Heavy Frameworks**:

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+).
* **Backend & Database:** Firebase Authentication, Cloud Firestore.
* **Analytics:** Firebase Site Analytics & Google Analytics integrated.
* **Utilities:** `printJS` for high-quality client-side PDF generation.

---

## 📄 License

This project is open-source and available under the **MIT License**.
