# CollabDocs - Real-Time Collaborative Document Editor

A full-stack web application that allows multiple users to edit documents in real-time, built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO.

## Features

- **Real-time Collaboration:** Multiple users can edit a document simultaneously, with changes instantly reflected for everyone using Socket.IO.
- **User Authentication:** Secure signup and login with JWT and bcrypt for password hashing.
- **Document Management:** Create, view, and save documents securely to a MongoDB database.
- **Responsive UI:** Clean, intuitive interface built with React and Bootstrap.

## Screenshots

*(Add your screenshots to a `screenshots` folder in the root directory and they will appear here)*

### Dashboard / Document List
![Dashboard / Document List](./screenshots/dashboard.png)

### Real-time Editing Interface
![Document Editor](./screenshots/editor.png)

### Login / Signup
![Authentication](./screenshots/auth.png)

## Tech Stack

### Frontend (Client)
- **React.js (Vite)**
- **React Router DOM** for routing
- **Socket.IO Client** for real-time web sockets
- **Axios** for API requests
- **Bootstrap / React-Bootstrap** for styling

### Backend (Server)
- **Node.js & Express.js**
- **Socket.IO** for real-time communication
- **MongoDB & Mongoose** for database management
- **JWT (JSON Web Tokens)** for secure authentication
- **bcryptjs** for password encryption

## Installation and Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd CollabDocs_Source_Code
```

### 2. Set up the Server (Backend)

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Set up the Client (Frontend)

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Usage

1. Ensure both the server and client are running.
2. Open your browser and navigate to `http://localhost:5173` (or the URL provided by Vite).
3. Create a new account or log in.
4. Create a new document or join an existing one to start collaborating in real-time!

## License

This project is open-source and available under the [MIT License](LICENSE).
