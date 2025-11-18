# Aircraft Tracker UI 

![Logo](foto.PNG)

## This is a lightweight, full-stack application designed to retrieve live aircraft data from tx.ozrunways.com and display it on a map-based web interface.

# ** #### Installation and Local Run Instructions **

The application consists of two decoupled components: the Backend and the Frontend.

### Prerequisites
Ensure you have the following installed:

Node.js (LTS version recommended)
npm or Yarn

### Steps to Run Locally

1. Backend Service
The backend is responsible for data extraction, processing, and serving updates.

2. Navigate to the `backend/` directory.

Install dependencies:

bash
   npm install
   
3.Run the backend service:

Bash
npm start

This service typically runs on `http://localhost:8080` (based on common local/Cloud Run configurations).

2. Frontend UI

   The frontend is the React-based user interface displaying the map and aircraft data.
   Open a new terminal and navigate to the `frontend/` directory.

Install dependencies:

Bash
npm install

Run the frontend application in development mode:

Bash
npm run dev

The application will open in your browser, usually at `http://localhost:5173`. Ensure the backend service is running before accessing the frontend.
