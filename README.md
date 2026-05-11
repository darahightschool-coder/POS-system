# SuperPOS System

A full-stack Point of Sale (POS) application built with a vanilla HTML/JS frontend and a Node.js/Express backend, using a MySQL database.

## Prerequisites

Before you begin, ensure you have met the following requirements:
* **Node.js**: Installed on your machine.
* **MySQL**: Installed and running (e.g., via XAMPP, WAMP, or standalone MySQL Server).

## 1. Database Setup

1. Open your MySQL client (e.g., phpMyAdmin, MySQL Workbench, or CLI).
2. Create a new database named `superpos`.
3. Check the `backend/.env` file to ensure the database credentials match your local setup:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=dara11@dara!!  # Change this to your local MySQL password
   DB_NAME=superpos
   ```

*Note: The backend uses Sequelize. It will automatically create the necessary tables when it starts up successfully.*

## 2. Backend Setup

The backend handles the API and database communication.

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the required Node dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   node server.js
   ```
   *If successful, you will see a message saying "Server running on port 5000" and "Database synced successfully".*

## 3. Frontend Setup

The frontend is a vanilla web application located in the `frontend` folder.

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. You can serve the frontend using `npx serve`:
   ```bash
   npx serve . -p 3000
   ```
3. Open your web browser and go to `http://localhost:3000`.

*Alternatively, you can just open the `frontend/index.html` file using the **Live Server** extension in VS Code.*

## Folder Structure

- **`/frontend`**: Contains the HTML, CSS, and vanilla JS for the user interface.
- **`/backend`**: Contains the Node.js/Express API, Sequelize database models, and server logic.
