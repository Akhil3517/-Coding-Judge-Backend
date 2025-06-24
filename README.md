# Code Judge Backend

A robust backend service using Node.js to support a multi-language coding judge system. It features secure code execution, automated test case evaluation, JWT-based authentication, and admin analytics.

## Core Features
- **User Authentication:** Secure signup/login with JWT.
- **Problem Management:** Full CRUD APIs for coding problems (admin-only).
- **Multi-Language Code Submission:** Supports Python, C++, and Java.
- **Automated Judging:** Runs code against test cases and reports pass/fail status.
- **Submission History:** APIs to retrieve past submissions.
- **Rate Limiting:** Prevents API abuse.

## Bonus Features
- **Real-time Status:** WebSocket (Socket.IO) integration for live submission status updates.
- **Admin Dashboard:** Analytics APIs for platform statistics and top-solved problems.
- **Plagiarism Detection:** Automatically flags submissions with high similarity to previous correct solutions.

---

## Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Akhil3517/
    Coding-Judge-Backend.git
    cd code-judge-backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file** in the root directory and add the following variables (see `.env.example` for a template):
    ```env
    MONGO_URI=your_mongodb_atlas_connection_string
    JWT_SECRET=a_strong_and_long_random_secret_key
    PORT=5000
    ```
4.  **Seed the database** with sample problems (optional but recommended):
    ```bash
    node seed.js
    ```
5.  **Start the server** in development mode (with Nodemon):
    ```bash
    npm run dev
    ```
The server will be running at `http://localhost:5000`.

---

## Testing

This project uses Jest for automated testing. Tests are configured to run against an in-memory MongoDB server to ensure a clean and isolated environment.

To run the entire test suite, execute:
```bash
npm test
```

---

## API Endpoints

A brief overview of the available endpoints. For full details, see the Swagger documentation.

-   **Auth**
    -   `POST /api/auth/register`: Register a new user.
    -   `POST /api/auth/login`: Log in a user and receive a JWT.
-   **Problems**
    -   `GET /api/problems`: Get a list of all problems.
    -   `GET /api/problems/:id`: Get details for a specific problem.
    -   `POST /api/problems`: (Admin) Add a new problem.
    -   `PUT /api/problems/:id`: (Admin) Update an existing problem.
-   **Submissions**
    -   `POST /api/submit`: Submit code for a problem.
    -   `GET /api/submissions/user/:id`: Get all submissions for a specific user.
    -   `GET /api/submissions/problem/:id`: Get all submissions for a specific problem.
-   **Admin Dashboard**
    -   `GET /api/admin/stats`: (Admin) Get platform statistics (total users, submissions, pass rate).
    -   `GET /api/admin/top-problems`: (Admin) Get the most successfully solved problems.

---

## API Documentation

Interactive API documentation is available via Swagger UI once the server is running:
**[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

You can use Swagger UI to test all endpoints interactively. Authorize with your JWT token for protected routes.

---

## Technology Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Real-time:** Socket.IO
- **Code Execution:** `child_process`
- **API Documentation:** Swagger (OpenAPI)

## Sample Data

Add problems via the admin route or seed the database with sample problems (see `models/Problem.js` for structure). Run `node seed.js` to load them into your database.

## Author

- **Name:** Akhil Kumar Reddy Ambati
- **Email:** akhil35177@gmail.com
