# 🤖 AI Resume Generator (n8n + Gemini API)

An automated AI-powered resume generator that creates ATS-optimized resumes tailored to specific job descriptions using Google's Gemini API and n8n workflow automation.

---

## 🚀 Features

* 🧠 AI-generated resumes using Gemini API
* 🎯 Tailored resumes based on job descriptions
* ⚡ Fully automated pipeline using n8n
* 📄 Converts HTML resumes into downloadable DOCX files
* 🌐 Clean frontend UI with dynamic form inputs
* 🔄 Real-time processing with webhook integration

---

## 🏗️ Architecture

Frontend (HTML/CSS/JS)
⬇
n8n Webhook
⬇
Build Prompt (Code Node)
⬇
Gemini API
⬇
Extract HTML
⬇
DOCX Converter (Node.js microservice)
⬇
Download Resume

---

## 🛠️ Tech Stack

* Frontend: HTML, CSS, JavaScript
* Automation: n8n
* AI: Google Gemini API
* Backend: Node.js (Express)
* Conversion: html-docx-js

---

## 📂 Project Structure

```
├── index.html        # Frontend UI
├── style.css         # Styling
├── script.js         # Frontend logic
├── n8n-workflow.json # Automation workflow
├── converter/        # DOCX conversion microservice
```

---

## ⚙️ Setup Instructions

### 1. Start DOCX Converter

```bash
cd converter
npm install
node server.js
```

### 2. Start n8n

```bash
n8n start
```

### 3. Run Frontend

```bash
npx live-server --port=8080
```

---



## 💡 Use Case

Helps students and job seekers generate professional resumes instantly based on job requirements.

---

## 📌 Future Improvements

* Deploy as SaaS web app
* Add resume templates
* Add PDF export
* User authentication

---

## 👨‍💻 Author

Nevin S
GitHub: https://github.com/nevins06
