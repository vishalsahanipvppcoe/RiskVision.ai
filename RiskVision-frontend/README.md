
# RiskVision.ai â€“ Real-time Violence Detection System

RiskVision is an AI-powered real-time violence detection and alert system designed to enhance public safety.
It leverages a YOLO deep learning model integrated with Flask (backend) and a React (frontend) dashboard to analyze live video streams, detect violent activity, and respond instantly.


## Features

When suspicious activity is detected:

* The system records and stores a short clip in Firebase for evidence.

* Instant alerts (SMS/Calls) are sent via Twilio to authorities or admins.

* A web dashboard allows users to monitor live feeds, review incident history, and manage alerts in real time.

RiskVision is optimized for lag-free high-resolution detection, supports mobile camera feeds, and is designed for smart surveillance, smart cities, and public safety solutions.

## Folder Structure


```bash
 â”‚â”€â”€ Backend/ # Flask backend (YOLO + Twilio + Firebase)
â”‚ â”œâ”€â”€ riskvision.py
â”‚ â”œâ”€â”€ requirements.txt
â”‚ â””â”€â”€ ...
â”‚
â”‚â”€â”€ RiskVision-frontend/ # React frontend (Vite + Tailwind)
â”‚ â”œâ”€â”€ public/
â”‚ â”œâ”€â”€ src/
â”‚ â”œâ”€â”€ .env
â”‚ â”œâ”€â”€ package.json
â”‚ â”œâ”€â”€ vite.config.js
â”‚ â”œâ”€â”€ tailwind.config.js
â”‚ â””â”€â”€ ...
â”‚
â””â”€â”€ README.md # Root documentation (this file)
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

### Backend (Backend/.env)
#### Twilio (for SMS/Call alerts)
`TWILIO_ACCOUNT_SID=your_twilio_account_sid`

`TWILIO_AUTH_TOKEN=your_twilio_auth_token`

`TWILIO_PHONE_NUMBER=+1234567890`       # Twilio registered number

`ADMIN_PHONE_NUMBER=+919876543210`      # Phone number to receive alerts

### Frontend (RiskVision-frontend/.env)
#### Firebase Web Config
`REACT_APP_FIREBASE_API_KEY=your_firebase_api_key`

`REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com`

`REACT_APP_FIREBASE_PROJECT_ID=your_project_id`

`REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id`


## Run Locally

Clone the project

```bash
  git clone https://github.com/vishalsahanipvppcoe/RiskVision.ai.git
  cd RiskVision.ai
```

* For backend server set up

```bash
  cd Backend
```

* Install dependencies

```bash
# Create the venv
python -m venv venv

```
* Activation on Windows/macOS/Linux
```bash
# Activate on Windows PowerShell
.\venv\Scripts\activate

# Activate on macOS/Linux
# source venv/bin/activate
```
* Start the backend server

```bash
  python riskvision.py
```
* For frontend server set up

```bash
cd RiskVision-frontend
npm install
npm run dev

```
