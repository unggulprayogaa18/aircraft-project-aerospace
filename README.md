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

**1. Architectural Choice: Decoupled Microservices
We chose a Decoupled Microservice Architecture. This simply means we built the application as two separate, independent parts:

   • The Brain (Backend): This part handles all the difficult, invisible work—like getting data from the external source.
   
   • The Face (Frontend): This part handles everything the user sees and interacts with—the map, the aircraft icons, and the popups.

Why this choice? Separating the two ensures that if there's a problem with the map display (Frontend), the data collection (Backend) keeps running, and vice versa. It makes the entire application more stable, easier to develop, and easier to scale because we can upgrade or troubleshoot each part independently.

**2. Technology Stack Selection
We selected technologies that are modern, fast, and excellent for their specific jobs.

| Component          | Technology        | Rationale (Why We Chose It)                                                                                                                                                                                                 |
|--------------------|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Backend            | Node.js           | Node.js is incredibly efficient for tasks that involve waiting for data (like polling an external website). It uses an asynchronous (non-blocking) model, meaning it can handle many data requests simultaneously without slowing down the entire system. |
| Backend & Frontend | TypeScript (TS)   | TS is an enhanced version of JavaScript that adds strict data rules (typing). This is like adding safety checks to the code. By defining what type of data (number, string, object) each variable must hold, we catch errors during development instead of during runtime, resulting in a much more stable and bug-free product.|
| Frontend           | React (via Vite)  | React is the industry standard for building complex, interactive user interfaces. It uses a component-based structure, allowing us to build separate, reusable blocks of UI (like the AircraftMap component or the individual aircraft icon), making the code cleaner and easier to manage. |

