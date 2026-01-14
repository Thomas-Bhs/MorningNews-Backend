# MorningNews – Backend

Backend API for the MorningNews web application.  
This project was developed as part of the **La Capsule** web development bootcamp.

The backend handles user authentication, data persistence, and communication with an external news API.

---

##  Features

- User authentication (signup / signin)
- Password hashing with bcrypt
- JWT-based authentication (access token)
- Refresh token mechanism for session renewal
- Secure logout (refresh token invalidation)
- Save and retrieve bookmarked articles
- Pagination for bookmarked articles
- Middleware-based route protection
- RESTful API architecture
- MongoDB data persistence
- Integration with an external news API

---

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- bcrypt
- JWT
- dotenv
- Jest & Supertest

---

##  Project Structure
backend/
├── bin/            # Server entry point
├── models/         # Mongoose models
├── routes/         # API routes
├── modules/        # Middlewares & utility functions
├── tests/          # Automated tests
├── app.js          # Express app configuration
└── package.json

---

## Installation & Setup

1. Clone the repository:
git clone https://github.com/Thomas-Bhs/MorningNews-Backend.git
cd MorningNews-Backend

2.	Install dependencies:
yarn install

3.	Create a .env file based on .env.example :
cp .env.example .env

Then update the .env file with your own values:

CONNECTION_STRING=mongodb+srv://<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
NEWS_API_KEY=<your-news-api-key>


4. Start the server :
yarn start

The backend runs by default on http://localhost:3000

## Authentication Flow
	•	Access token (JWT): short-lived token used to access protected routes
	•	Refresh token: stored in the database and used to generate a new access token

Flow:
	1.	User signs in → access token + refresh token
	2.	Access token expires → client calls /users/refresh-token
	3.	New access token + refresh token are generated
	4.	Logout invalidates the refresh token


## API Endpoints

### Authentication – Users

#### Sign up
Create a new user account.

POST /users/signup :
  **Body Json**
{
  "username": "john_doe",
  "password": "password123"
}
  **Response Json** 
{
  "result": true,
  "accessToken": "jwt_access_token",
  "refreshToken": "refresh_token"
} 

#### Sign in
Authenticate an existing user.

POST /users/signin
  **Body Json**
{
  "username": "john_doe",
  "password": "password123"
}
  **Response Json**
{
  "result": true,
  "accessToken": "jwt_access_token",
  "refreshToken": "refresh_token"
}

#### User Permissions
Check bookmark permission

GET /users/canBookmark
  **Headers**
Authorization: Bearer <access_token>
  **Response Json**
{
  "result": true,
  "canBookmark": true
}

#### Refresh access token
Generate a new access token using a refresh token

POST /users/refresh-token
  **Body Json**
{
  "refreshToken": "refresh_token"
}
  **Response Json**
{
  "result": true,
  "accessToken": "new_jwt_access_token",
  "refreshToken": "new_refresh_token"
}

#### Logout
Invalidate the refresh token

POST /users/logout
  **Headers**
Authorization: Bearer <access_token>
  **Response Json**
{
  "result": true
}



### Articles

#### Get news articles
Retrieve articles from the external News API

GET /articles
  **Query parameters**
Name      Type    Description                   Default
page      number  Page number                    1
category  string  business,sports,technology...  all
language  string  Article language               en
country   string  Source country                 all

  **Response Json**
{
  "result": true,
  "articles": [],
  "page": 1,
  "hasMore": true,
  "isAuthenticated": false
}
hasMore is used by the frontend to implement infinite scrolling.

Note: Authentication is required to load additional pages beyond the first one.


### Bookmarks

#### Add a bookmark

POST /bookmarks
  **Headers**
Authorization: Bearer <access_token>
  **Body Json**
{
  "title": "Article title",
  "url": "https://example.com",
  "source": "ABC News"
}
  **Response**
{
  "result": true,
  "bookmark": {
    "_id": "bookmark_id",
    "title": "Article title",
    "url": "https://example.com",
    "source": "ABC News"
  }
}

#### Get bookmarked articles (paginated)

GET /bookmarks
  **Headers**
Authorization: Bearer <access_token>
  **Query parameters**
Name    Type      Description                 Default
page    number    Page number                 1
  **Response Json**
{
  "result": true,
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3,
  "bookmarks": []
}

Note : limit is fixed to 10 on the backend.

#### Remove a bookmark

DELETE /bookmarks/:id
  **Headers**
Authorization: Bearer <access_token>
  **Response Json**
{
  "result": true
}


## Testing
	•	Manual API testing performed using Thunder Client
	•	Automated backend tests implemented with Jest and Supertest
Tests cover:
	•	User authentication
	•	Protected routes
	•	Bookmarks retrieval

Run tests with:

yarn test


## Author : 

Thomas Bourchis
Junior Fullstack Web Developer