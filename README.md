# Aircraft Tracker UI 

![Logo](foto.PNG)

#### This is a lightweight, full-stack application designed to retrieve live aircraft data from tx.ozrunways.com and display it on a map-based web interface.

# Installation and Local Run Instructions

The application consists of two decoupled components: the Backend and the Frontend.

### Prerequisites
Ensure you have the following installed:

• Node.js (LTS version recommended)

• npm or Yarn

## Steps to Run Locally

### 1. Backend Service

The backend is responsible for data extraction, processing, and serving updates.

1. Navigate to the `backend/` directory.

2. Install dependencies:

   ```bash
   npm install
   ```

3.Run the backend service:

   ```Bash
   npm start
   ```
This service typically runs on `http://localhost:8080` (based on common local/Cloud Run configurations).

### 2. Frontend UI

   The frontend is the React-based user interface displaying the map and aircraft data.
   Open a new terminal and navigate to the `frontend/` directory.

Install dependencies:

   ```Bash
   npm install
   ```

Run the frontend application in development mode:

   ```Bash
   npm run dev
   ```

The application will open in your browser, usually at `http://localhost:5173`. Ensure the backend service is running before accessing the frontend.


## Design Rationale Explained in Detail

The core goal of this project was to build a stable and maintainable application quickly. To achieve this, we made specific choices regarding the structure (Architecture), the tools (Technology Stack), and how we tackle the main problem (Data Extraction).

1. Architectural Choice: Decoupled Microservices
We chose a Decoupled Microservice Architecture. This simply means we built the application as two separate, independent parts:

   • The Brain (Backend): This part handles all the difficult, invisible work—like getting data from the external source.
   
   • The Face (Frontend): This part handles everything the user sees and interacts with—the map, the aircraft icons, and the popups.

Why this choice? Separating the two ensures that if there's a problem with the map display (Frontend), the data collection (Backend) keeps running, and vice versa. It makes the entire application more stable, easier to develop, and easier to scale because we can upgrade or troubleshoot each part independently.
