# MorningNews – Backend

Backend API for the MorningNews web application.  
This project was developed as part of the **La Capsule** web development bootcamp.

The backend handles user authentication, data persistence, and communication with an external news API.

---

## 🚀 Features

- User authentication (signup / login)
- Password hashing with bcrypt
- Token-based authentication
- Save and retrieve bookmarked articles
- REST API architecture
- Connection to an external news API
- MongoDB data persistence

---

## 🛠 Tech Stack

- **Node.js**
- **Express**
- **MongoDB**
- **Mongoose**
- **bcrypt**
- **JWT-like token system**
- **dotenv**
- **Jest & Supertest** (testing)

---

## 📁 Project Structure
backend/
├── bin/            # Server entry point
├── models/         # Mongoose models
├── routes/         # API routes
├── modules/        # Utility functions
├── app.js          # Express app configuration
└── package.json

---

## ⚙️ Installation & Setup

1. Clone the repository:
git clone https://github.com/Thomas-Bhs/MorningNews-Backend.git

2.	Install dependencies:
yarn install

3.	Create a .env file based on .env.example :
cp .env.example .env

Then update the .env file with your own values:

CONNECTION_STRING=mongodb+srv://<your-mongodb-connection-string>
NEWS_API_KEY=<your-news-api-key>


4.	Start the server:
yarn start

The backend runs by default on http://localhost:3000

🔐 Environment Variables

This project uses environment variables for sensitive data.
Make sure to define them in a .env file (not committed).


👨‍💻 Author

Thomas Bourchis
Junior Fullstack Web Developer