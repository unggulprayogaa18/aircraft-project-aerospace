# Aircraft Tracker UI 

![Logo](foto.PNG)

#### This is a lightweight, full-stack application designed to retrieve live aircraft data from tx.ozrunways.com and display it on a map-based web interface.

# Installation and Local Run Instructions

The application consists of two decoupled components: the Backend and the Frontend.

### Prerequisites
Ensure you have the following installed:

- Node.js (LTS version recommended)

- npm or Yarn

## Steps to Run Locally

### 1. Backend Service

The backend is responsible for data extraction, processing, and serving updates.

1. Navigate to the `backend/` directory.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the backend service:

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

### 1. Architectural Choice: Decoupled Microservices

#### We chose a Decoupled Microservice Architecture. This simply means we built the application as two separate, independent parts:

   - The Brain (Backend): This part handles all the difficult, invisible work—like getting data from the external source.
   
   - The Face (Frontend): This part handles everything the user sees and interacts with—the map, the aircraft icons, and the popups.

Why this choice? Separating the two ensures that if there's a problem with the map display (Frontend), the data collection (Backend) keeps running, and vice versa. It makes the entire application more stable, easier to develop, and easier to scale because we can upgrade or troubleshoot each part independently.

### 2. Technology Stack Selection

#### We selected technologies that are modern, fast, and excellent for their specific jobs.

| Component          | Technology        | Rationale (Why I Chose It)                                                                                                                                                                                                 |
|--------------------|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Backend            | Node.js           | Node.js is incredibly efficient for tasks that involve waiting for data (like polling an external website). It uses an asynchronous (non-blocking) model, meaning it can handle many data requests simultaneously without slowing down the entire system. |
| Backend & Frontend | TypeScript (TS)   | TS is an enhanced version of JavaScript that adds strict data rules (typing). This is like adding safety checks to the code. By defining what type of data (number, string, object) each variable must hold, we catch errors during development instead of during runtime, resulting in a much more stable and bug-free product.|
| Frontend           | React (via Vite)  | React is the industry standard for building complex, interactive user interfaces. It uses a component-based structure, allowing us to build separate, reusable blocks of UI (like the AircraftMap component or the individual aircraft icon), making the code cleaner and easier to manage. |

### 3. Architecture and Hosting Strategy

 We chose specialized hosting providers for each part to get the best performance and maintainability.

   #### Backend Hosting (Google Cloud Run):
   
  - Since the backend is containerized (packaged with Docker), Google Cloud Run is the perfect fit.
 
  - It is a fully managed, serverless platform. This means we don't have to worry about maintaining virtual machines or servers; Google handles the infrastructure.
 
  - It can scale from zero (costing nothing when not in use) to a massive capacity instantly as needed, ensuring the service is always available but only costs money when actively fetching data.

   #### Frontend Hosting (Vercel):
   
 - Vercel is optimized for modern frontend frameworks like React.
 
 - It provides seamless Continuous Deployment (CD), automatically updating the website whenever changes are pushed to GitHub. This speeds up the development and testing process.

### 4. Data Extraction Method

#### Since the live aircraft data source (`tx.ozrunways.com`) does not provide a public API , the core technical challenge was discovery (Phase 1).

 - Network Traffic Analysis: We acted like a detective, using the browser's Developer Tools to observe all the hidden requests the website makes as it loads data.
      
 - Endpoint Identification: We successfully identified the specific, internal JSON endpoint that the website uses to get the raw aircraft position data in real-time.
      
 - Polling Mechanism: The backend service then implemented a polling system, where it sends a request to that discovered endpoint periodically (every few seconds) to fetch the latest data.
      
 - Processing: The raw data received is often large or complex. The backend performs a crucial processing and transformation step, stripping away unnecessary information and formatting it into a minimal, lightweight structure that the frontend can efficiently consume and display.
   
## Deployment Architecture Overview

#### The backend deployment pipeline leverages Google Cloud services for automated Continuous Delivery (CD):

| Component / Service   | Role in the Project                                                                                                                                                                  |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GitHub                 | Stores the source code and acts as the trigger source for the automation pipeline.                                                                                                   |
| Google Cloud Build     | Automatically builds and containerizes (Dockerizes) the Node.js backend whenever changes are pushed to the repository.                                                               |
| Artifact Registry      | Stores the finalized Docker images from Cloud Build and serves as the secure container image repository.                                                                              |
| Google Cloud IAM       | Manages permissions, including the dedicated Service Account (cloud-build-deployer) that ensures Cloud Build has the necessary rights to deploy and manage resources.               |
| Google Cloud Run       | The primary hosting environment for the backend. It pulls the latest Docker image from Artifact Registry and deploys it as a scalable, serverless service.                           |
| Google Cloud Logging   | Used to monitor and debug both the Cloud Build process and the runtime execution of the Cloud Run service.                                                                            |
| Vercel                 | Provides automated hosting and Continuous Deployment (CD) for the decoupled React frontend application.                                                                               |

## Live Application URL

#### The publicly accessible, deployed frontend application is available at:

[Aircraft Tracker Frontend](document-foto/https://aircraft-frontend.vercel.app/)

> **Note:** Please wait a few moments when opening the application — the map and real-time aircraft data may take some time to load.

#Explanation For Fiture

## Custom Filtering: Min Altitude and Min Speed

![MinAltitude and MinSpeed](MinAltitudeandMinSpeed.jpg.jpg)

> **Note:** These two custom filters are designed to provide the user with advanced visual control over the displayed air traffic data. The Min Altitude filter enables the user to set a minimum height threshold, effectively filtering out low-flying or ground-based aircraft to help focus the map exclusively on traffic operating at cruising altitudes. Similarly, the Min Speed filter allows the user to set a minimum velocity, which efficiently filters out stationary or taxiing aircraft on the ground, thereby ensuring the visualization focuses only on flights that are actively moving at a significant speed.
