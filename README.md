# RiskVision.ai — Real-Time AI Surveillance & Threat Detection

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Flask: 3.1](https://img.shields.io/badge/Flask-3.1-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React: 19](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite: 6](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![YOLO: v11n](https://img.shields.io/badge/YOLO-v11n-00FFFF?logo=ultralytics&logoColor=black)](https://github.com/ultralytics/ultralytics)
[![TailwindCSS: 4](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

An AI-powered computer vision surveillance platform designed for real-time violence detection, automated incident recording, and multi-channel security alerting. Built with a fine-tuned YOLO model, a Flask REST API backend, and a high-performance React/Vite operator dashboard.

[Dashboard Preview](#dashboard-preview) • [About](#about-the-project) • [Features](#features) • [Architecture](#architecture) • [Tech Stack](#technology-stack) • [Installation](#installation-and-local-development) • [API Overview](#api-overview) • [Security & Limitations](#configuration-and-security) • [Troubleshooting](#troubleshooting) • [Contributing](#contributing-license-and-disclaimer)

---

## Dashboard Preview

![RiskVision.ai Dashboard](docs/images/riskvision-dashboard.png)

*Figure: RiskVision.ai Live Detection Dashboard demonstrating real-time camera inference with bounding-box violence classification, active metrics summary, and an incoming event alert queue.*

> **Note**: Displayed dashboard metrics (such as uptime, detection accuracy, and camera counts) represent operator UI widgets and live session counters; they are not certified laboratory benchmarks.

---

## About the Project

Physical security systems and CCTV networks often produce hundreds of continuous video streams that exceed the capacity of human operators to monitor reliably. Fatigue, delayed response times, and difficult manual video retrieval can compromise security responses during critical incidents.

**RiskVision.ai** addresses this challenge through automated visual threat monitoring:

1. **Continuous Visual Processing**: Evaluates live video feeds frame-by-frame using a fine-tuned YOLO object detection network.
2. **Instant Threat Identification**: Flags violent physical interactions with localized spatial bounding boxes and confidence scoring.
3. **Automated Evidence Capture**: Maintains a rolling frame buffer to automatically encode and store a 10-second video clip and thumbnail whenever a threshold alert is triggered.
4. **Synchronized Alerting**: Logs incident records locally, synchronizes events with Firebase Realtime Database, and optionally issues SMS notifications via Twilio.
5. **Unified Operator Interface**: Provides security operators with an intuitive dark-themed web dashboard for real-time video monitoring, user account control, activity analytics, and historical incident playback.

---

## Features

### Implemented Functionality

- **Live Video Inference**: Captures video from local webcams (`VIDEO_SOURCE=0`), RTSP IP camera streams, or video files, streaming live annotated video over MJPEG (`/video_feed`).
- **YOLO Violence Classification**: Identifies physical confrontations with real-time confidence scores (trigger threshold: > 0.40 confidence) and an automated 10-second alert cooldown period.
- **Incident Clip Recording & Thumbnails**: Buffers incoming video frames via an in-memory queue (`deque`). On detection, spawns an asynchronous worker thread utilizing FFmpeg to encode an H.264 MP4 clip and generate a JPEG thumbnail.
- **Alert History & Local Logging**: Appends timestamped incident records (timestamp, location via IP geolocation, confidence, and video link) to an internal alert log and provides historical review via `/alerts`.
- **Firebase Realtime Database Synchronization**: Pushes incident detections to `violence_detections` and recorded clip metadata to `history_clips` when Firebase credentials are configured.
- **JWT-Protected User Authentication**: User registration and login with secure token generation (`flask-jwt-extended`), configurable token expiration, and profile management (`/auth/profile`).
- **Cryptographic Password Migration**: Modern password storage via Werkzeug (`generate_password_hash` / `check_password_hash`). Automatically upgrades legacy raw SHA-256 password records to salted Werkzeug hashes upon successful login.
- **Operator Analytics**: User-specific and global login trends, active user counts, and session monitoring via `/auth/analytics` and interactive Chart.js visualizations.
- **Responsive Dark-Mode Interface**: Built with React 19, Tailwind CSS 4, React Router 7, and Lucide/React Icons.

### Planned Features (Roadmap)

- Multi-camera grid monitoring and RTSP stream switcher.
- PostgreSQL / Supabase storage replacing local JSON user files.
- Cloud object storage integration (AWS S3 / Cloudflare R2) for persistent video clips.
- Role-based access control (Administrator vs. Security Monitor).

---

## Architecture

The following diagram illustrates the verified system architecture and data flow between the client, backend services, AI engine, and external integrations:

```mermaid
graph TD
    subgraph Client["Frontend Client (React 19 + Vite)"]
        UI["Operator Dashboard (Tailwind CSS)"]
        AuthContext["Auth Context & JWT Storage"]
        Charts["Analytics & Trends (Chart.js)"]
        VideoPlayer["Live Video & Clip Player"]
    end

    subgraph Backend["Backend API (Flask + Gunicorn/WSGI)"]
        Router["REST Endpoints & Route Handlers"]
        AuthModule["Auth & Profile (/auth/*)"]
        JWT["JWT Security (Flask-JWT-Extended)"]
        VideoModule["Frame Streamer & Buffer (/video_feed)"]
        AlertModule["Alert Coordinator (/alerts, /history_clips)"]
        Encoder["Async FFmpeg Clip Encoder"]
    end

    subgraph VisionEngine["Computer Vision & Inference"]
        OpenCV["OpenCV Video Capture"]
        YOLO["YOLOv11n Violence Detection (best.pt)"]
        FrameBuffer["Thread-Safe Rolling Frame Buffer"]
    end

    subgraph StorageIntegrations["Data Persistence & External Services"]
        LocalFiles["Local Storage (users.json, alert_log.json, static/history_clips/)"]
        FirebaseRTDB["Firebase Realtime Database (Optional)"]
        TwilioSMS["Twilio SMS Gateway (Optional)"]
    end

    UI -->|HTTP / REST (Bearer Token)| Router
    UI -->|MJPEG Stream| VideoModule
    Router --> AuthModule
    AuthModule --> JWT
    AuthModule --> LocalFiles
    OpenCV --> FrameBuffer
    FrameBuffer --> YOLO
    YOLO -->|Confidence > 0.40| AlertModule
    AlertModule --> Encoder
    Encoder --> LocalFiles
    AlertModule --> LocalFiles
    AlertModule -.->|Push Detection| FirebaseRTDB
    AlertModule -.->|Send SMS| TwilioSMS
```

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 6, Tailwind CSS 4, React Router 7, Axios, Chart.js, react-chartjs-2, Framer Motion, React Hot Toast, React Icons |
| **Backend** | Python 3.10+, Flask 3.1, Flask-CORS, Flask-JWT-Extended, Werkzeug Security, python-dotenv, Gunicorn |
| **Computer Vision & AI** | Ultralytics YOLO (fine-tuned YOLOv11 nano), PyTorch (torch/torchvision), OpenCV (`opencv-python`) |
| **Media Processing** | FFmpeg (H.264 encoding and JPEG thumbnail extraction via subprocess) |
| **Cloud & Integrations** | Firebase Admin SDK (Realtime Database), Twilio REST Python SDK, IP Geolocation API |
| **Tooling & Standards** | ESLint 9 (Flat Config), PowerShell, Concurrently |

---

## Project Structure

```text
RiskVision/
├── docs/
│   └── images/
│       └── riskvision-dashboard.png   # Dashboard reference screenshot
├── Backend/
│   ├── best.pt                        # Trained YOLO violence detection model weights
│   ├── requirements.txt               # Backend Python dependencies
│   ├── riskvision.py                  # Main Flask application and detection server
│   ├── .env.example                   # Sanitized backend configuration template
│   ├── .gitignore                     # Backend-specific ignore rules
│   └── static/
│       └── history_clips/             # Directory for encoded incident clips and thumbnails
├── RiskVision-frontend/
│   ├── src/
│   │   ├── components/                # Reusable UI components (Navbar, Sidebar, Charts)
│   │   ├── config/
│   │   │   └── api.js                 # Centralized API endpoints and media URL resolver
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # JWT authentication state management
│   │   ├── pages/                     # Application pages (Dashboard, Alerts, History, Profile)
│   │   ├── App.jsx                    # Route configuration
│   │   └── main.jsx                   # React application entrypoint
│   ├── .env.example                   # Sanitized frontend configuration template
│   ├── package.json                   # Frontend dependencies and Vite build scripts
│   ├── vite.config.js                 # Vite bundling configuration
│   └── eslint.config.js               # ESLint code quality configuration
├── .gitignore                         # Repository-wide Git ignore rules
├── Contributing.md                    # Contribution guidelines
├── LICENSE                            # GNU General Public License v3.0
├── package.json                       # Root workspace orchestrator
└── run.bat                            # Windows development quick-start launcher
```

---

## Prerequisites

Before setting up RiskVision.ai locally, ensure your machine has the following software installed:

1. **Python**: Version `3.10` or higher (`python --version`)
2. **Node.js**: Version `18.0.0` or higher (`node --version`) and `npm`
3. **FFmpeg**: Installed and accessible in your system `PATH` (`ffmpeg -version`)
4. **Git**: Installed and configured (`git --version`)
5. **Video Device**: A standard USB webcam or a test video file for computer vision inference.

---

## Installation and Local Development

Follow these copy-ready PowerShell instructions to run RiskVision.ai on Windows:

### 1. Clone the Repository

```powershell
git clone https://github.com/vishalsahanipvppcoe/RiskVision.ai.git
cd RiskVision.ai
```

### 2. Configure Backend Environment Variables

Create your local backend environment configuration by copying the sanitized example template:

```powershell
Copy-Item "Backend\.env.example" "Backend\.env"
```

Open `Backend\.env` in your editor and configure the parameters:
- Generate a cryptographically strong 64-byte secret for `JWT_SECRET_KEY`:
  ```powershell
  python -c "import secrets; print(secrets.token_urlsafe(64))"
  ```
- If using Firebase, set `FIREBASE_DATABASE_URL` and `FIREBASE_CREDENTIALS_PATH` (refer to the [Firebase Credentials Guide](#firebase-credentials-setup) below).
- If testing without a physical webcam, specify a test video path in `VIDEO_SOURCE`.

### 3. Setup Python Virtual Environment and Install Backend Dependencies

```powershell
# Navigate to the backend directory
cd Backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\Activate.ps1

# Upgrade pip and install all backend dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# Return to root directory
cd ..
```

### 4. Install Frontend Dependencies & Configure Frontend

```powershell
# Copy the frontend environment template
Copy-Item "RiskVision-frontend\.env.example" "RiskVision-frontend\.env"

# Install frontend dependencies
npm --prefix RiskVision-frontend install
```

### 5. Launch the Application

You can start both servers together or run them in separate terminals:

#### Option A: Running with the Root Orchestrator (Single Terminal)

```powershell
npm run start:all
```

#### Option B: Running in Separate Terminals

**Terminal 1 — Backend Server:**
```powershell
cd Backend
.\venv\Scripts\Activate.ps1
python riskvision.py
```
*(Backend runs on `http://localhost:5000`)*

**Terminal 2 — Frontend Application:**
```powershell
npm --prefix RiskVision-frontend run dev
```
*(Frontend is accessible at `http://localhost:5173`)*

---

## Firebase Credentials Setup

The project supports two authentication patterns for the Firebase Admin SDK:

1. **Local Development (File Path)**:
   - Place your service-account JSON key (e.g., `riskvision-ai-firebase-adminsdk.json`) inside the `Backend/` folder.
   - Set `FIREBASE_CREDENTIALS_PATH=riskvision-ai-firebase-adminsdk.json` in `Backend/.env`.
   - The repository's `.gitignore` rules prevent service-account JSON files from being committed.
2. **Cloud Container Deployment (Environment Variable)**:
   - Export the complete JSON string into the environment variable:
     ```env
     FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
     ```
   - This eliminates the need to mount physical secret credential files onto ephemeral cloud containers.

---

## Environment Variables

### Backend (`Backend/.env`)

| Variable | Description | Required | Default / Example |
| :--- | :--- | :---: | :--- |
| `FLASK_ENV` | Application environment (`development` or `production`). | No | `development` |
| `FLASK_DEBUG` | Enables or disables the Flask interactive debugger. | No | `False` |
| `HOST` | IP address to bind the HTTP server to. | No | `0.0.0.0` |
| `PORT` | Listening port for the Flask backend. | No | `5000` |
| `JWT_SECRET_KEY` | Secret key used to sign and verify JWT tokens. | **Yes** | *None (Refuses prod startup if missing)* |
| `JWT_ACCESS_TOKEN_EXPIRES_HOURS` | Lifetime of user authentication access tokens in hours. | No | `24` |
| `CORS_ORIGINS` | Comma-separated list of permitted frontend origins. | No | `http://localhost:5173,http://localhost:3000` |
| `FIREBASE_CREDENTIALS_PATH` | Path to Firebase Admin SDK service account key file. | Optional | `riskvision-ai-firebase-adminsdk.json` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Stringified JSON of Firebase Admin SDK service key. | Optional | *None* |
| `FIREBASE_DATABASE_URL` | Full URL to the Firebase Realtime Database instance. | Optional | `https://<project>-default-rtdb.firebaseio.com/` |
| `VIDEO_SOURCE` | Video input index (`0` for webcam) or RTSP stream URL. | No | `0` |
| `FFMPEG_PATH` | Path to system `ffmpeg` binary. | No | `ffmpeg` |
| `MODEL_PATH` | Path to trained YOLO model weights. | No | `best.pt` |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID for SMS dispatch. | Optional | *None* |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token for SMS dispatch. | Optional | *None* |
| `TWILIO_PHONE_NUMBER` | Registered Twilio telephone number. | Optional | *None* |
| `ADMIN_PHONE_NUMBER` | Emergency recipient telephone number for alerts. | Optional | *None* |

### Frontend (`RiskVision-frontend/.env`)

| Variable | Description | Required | Default / Example |
| :--- | :--- | :---: | :--- |
| `VITE_API_URL` | Base URL of the RiskVision Flask backend API. | **Yes** | `http://localhost:5000` |

---

## API Overview

All API endpoints are hosted by the Flask server and consumed by the React operator interface:

| Method | Endpoint | Protection | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/auth/register` | Public | Registers a new user account with first name, last name, email, and password. |
| `POST` | `/auth/login` | Public | Authenticates credentials and returns a JWT `access_token` and user profile. |
| `GET` | `/auth/profile` | JWT Required | Returns current user profile details and activity counters. |
| `PUT` | `/auth/profile` | JWT Required | Updates user profile information (first and last name). |
| `GET` | `/auth/analytics` | JWT Required | Returns user-specific and system-wide login trends and active user counts. |
| `GET` | `/video_feed` | Public | Streams real-time MJPEG frames annotated with bounding boxes and detection labels. |
| `GET` | `/alerts` | Public | Retrieves recent alerts from the incident log in reverse-chronological order. |
| `GET` | `/history_clips` | Public | Lists all saved video clips with timestamps and thumbnail links. |
| `GET` | `/history_clips/<path>` | Public | Streams a specific H.264 MP4 video clip with HTTP range-request support. |
| `GET` | `/thumbnails/<path>` | Public | Serves an extracted JPEG thumbnail image for a recorded incident clip. |

---

## Configuration and Security

### Sensitive Data Protection
- **Never Commit Secrets**: Service account JSON files, `.env` files, recovery codes, and user databases are strictly ignored by `.gitignore`.
- **Sanitized Templates**: Only commit `.env.example` templates containing placeholders.
- **External Backups**: Keep user backups outside the Git tree (e.g., `D:\RiskVision-Local-Backup`).

### Known Architecture Limitations
1. **Local User Storage (`users.json`)**: Current user accounts and passwords are stored in a local JSON document. For production deployments with concurrency and persistence across cloud container restarts, migrate this storage to a managed database (PostgreSQL, Supabase, or Firebase Firestore).
2. **Ephemeral Video Storage**: Encoded incident clips reside in `Backend/static/history_clips/`. Ephemeral container platforms (Render, Railway, Heroku) clear local disks upon restarts. Production environments require offloading media to an object store (e.g., AWS S3 or Cloudflare R2).
3. **Cloud Webcam Access**: Cloud containers cannot access a local developer webcam via device index `0`. When deploying remotely, configure `VIDEO_SOURCE` with an RTSP stream URL or test video feed.
4. **Human Review Requirement**: Automated visual violence detection algorithms can produce false positives or false negatives depending on lighting, occlusion, and camera angle. Automated detections must be treated as auxiliary security cues, not definitive proof of an incident.

---

## Troubleshooting

### 1. Port 5000 or 5173 Already in Use
If another process is bound to port 5000, locate and terminate it in PowerShell:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

### 2. Frontend Cannot Connect to Backend (Network Error / CORS)
- Verify `VITE_API_URL` in `RiskVision-frontend/.env` matches your running backend URL (default: `http://localhost:5000`).
- Ensure the frontend URL (`http://localhost:5173`) is listed in the `CORS_ORIGINS` variable in `Backend/.env`.

### 3. Backend Refuses to Start (`CRITICAL SECURITY ERROR`)
- In production mode (`FLASK_ENV=production` or `FLASK_DEBUG=False`), the backend requires `JWT_SECRET_KEY` to be defined. Set a secure random string in `Backend/.env`.

### 4. Camera Feed Unavailable / OpenCV Warning
- If `VIDEO_SOURCE=0` warns that the camera cannot be opened, verify your webcam is connected and not locked by another application (e.g., Teams, Zoom).
- Alternatively, test with a recorded video file: `VIDEO_SOURCE="C:\path\to\sample.mp4"`.

### 5. Clip Encoding Fails (`ffmpeg: command not found`)
- Ensure FFmpeg is installed and added to your system `PATH`. Test by running `ffmpeg -version` in PowerShell.

---

## Roadmap

- [ ] **Multi-Camera Management**: Support for streaming and switching between multiple concurrent RTSP/ONVIF camera sources.
- [ ] **Database Migration**: Transition from `users.json` to PostgreSQL via SQLAlchemy with Alembic migrations.
- [ ] **Cloud Object Storage**: S3/R2 direct upload integration for video evidence and thumbnail persistence.
- [ ] **Two-Factor Authentication (2FA)**: Time-based one-time password (TOTP) verification for security operators.
- [ ] **Advanced Edge Deployment**: Containerized deployment templates for NVIDIA Jetson and edge gateway devices.

---

## Contributing, License, and Disclaimer

### Contributing
Contributions to RiskVision.ai are welcomed. Please review [Contributing.md](Contributing.md) for code style conventions, branch workflows, and PR requirements.

### License
This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for complete terms and copyleft details.

### Responsible Use & Ethics Disclaimer
RiskVision.ai is designed to assist security monitoring personnel in identifying potential emergency incidents. This software is not certified as an autonomous life-safety system and should not be used as the sole basis for dispatching physical force without human verification. Users are responsible for complying with all applicable privacy, surveillance, and data-protection laws in their jurisdiction.

---

## Contact & Support

For technical inquiries, bug reports, and enhancement requests, please open an issue in the repository issue tracker.
