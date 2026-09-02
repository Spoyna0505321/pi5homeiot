# Pi5HomeIoT

A Raspberry Pi 5-based IoT home monitoring system with a web dashboard, environmental sensors, MQTT communication, and live camera streaming.

## Overview

Pi5HomeIoT is an IoT monitoring system built around a Raspberry Pi 5. The system collects sensor data, publishes it through MQTT, provides a live camera feed, and displays the collected information through a modern React dashboard.

The project combines hardware, networking, real-time communication, and web technologies into a single IoT platform.

## Features

* Raspberry Pi 5 based IoT system
* Temperature and humidity monitoring with DHT11
* Motion detection
* MQTT communication with HiveMQ Cloud
* Real-time sensor data on the web dashboard
* Live Raspberry Pi camera feed
* WebRTC-based camera streaming
* Cloudflare Tunnel for remote camera access
* React + TypeScript dashboard
* Responsive web interface
* Automatic startup of Raspberry Pi services using systemd

## System Architecture

```text
                        ┌──────────────────────┐
                        │    React Dashboard   │
                        │  TypeScript + Vite   │
                        └──────────┬───────────┘
                                   │
                            Web / MQTT
                                   │
                  ┌────────────────┴────────────────┐
                  │                                 │
                  ▼                                 ▼
          ┌───────────────┐                 ┌────────────────┐
          │ HiveMQ Cloud  │                 │ Cloudflare     │
          │ MQTT Broker   │                 │ Tunnel         │
          └───────┬───────┘                 └───────┬────────┘
                  │                                 │
                  │ MQTT                            │ WebRTC
                  │                                 │
                  ▼                                 ▼
          ┌─────────────────────────────────────────────────┐
          │                  Raspberry Pi 5                  │
          │                                                 │
          │  ┌──────────┐       ┌──────────────┐            │
          │  │ DHT11    │       │ Motion Sensor│            │
          │  └──────────┘       └──────────────┘            │
          │                                                 │
          │       ┌──────────────────────────────┐          │
          │       │ Raspberry Pi Camera          │          │
          │       └──────────────────────────────┘          │
          │                                                 │
          └─────────────────────────────────────────────────┘
```

## Technologies

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* MQTT.js
* Axios

### Raspberry Pi

* Raspberry Pi 5
* Python
* Picamera2
* Adafruit CircuitPython DHT
* GPIO / gpiozero
* Paho MQTT

### Communication

* MQTT
* HiveMQ Cloud
* WebRTC
* Cloudflare Tunnel

## Project Structure

```text
pi5homeiot/

│
├── README.md
├── .gitignore
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   └── ...
│
└── firmware/
    ├── main.py
    ├── mqtt.py
    ├── camera.py
    ├── dht11.py
    └── motion_sensor.py
```

## Raspberry Pi Software

The Raspberry Pi runs the hardware-side Python applications.

### `main.py`

The main application responsible for running the IoT system and coordinating sensor data and MQTT communication.

### `mqtt.py`

Handles MQTT communication with the HiveMQ Cloud broker.

### `dht11.py`

Reads temperature and humidity data from the DHT11 sensor.

### `motion_sensor.py`

Handles motion detection and provides the latest motion detection information.

### `camera.py`

Runs the Raspberry Pi camera WebRTC signaling server and provides the live camera stream to the frontend.

## MQTT Communication

The Raspberry Pi communicates with the HiveMQ Cloud MQTT broker.

Sensor data is published by the Raspberry Pi and consumed by the dashboard.

```text
Raspberry Pi
     │
     │ MQTT Publish
     ▼
 HiveMQ Cloud
     │
     │ MQTT Subscribe
     ▼
React Dashboard
```

The MQTT credentials are configured through environment variables and should not be committed to the repository.

## Live Camera

The camera system uses WebRTC to provide a low-latency live video stream.

The Raspberry Pi runs the WebRTC signaling server locally. Cloudflare Quick Tunnel exposes the signaling endpoint to the internet.

```text
Raspberry Pi Camera
        │
        ▼
    Picamera2
        │
        ▼
      WebRTC
        │
        ▼
Cloudflare Tunnel
        │
        ▼
 React Dashboard
```

## Environment Variables

The frontend uses Vite environment variables.

Example:

```env
VITE_MQTT_HOST=your-hivemq-host
VITE_MQTT_PORT=8884
VITE_MQTT_USERNAME=your-username
VITE_MQTT_PASSWORD=your-password
VITE_CAMERA_URL=https://your-tunnel.trycloudflare.com
```

> Never commit the real `.env` file or MQTT credentials to GitHub.

The `.env` file is excluded through `.gitignore`.

## Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```text
.env
```

Add the required environment variables and start the development server:

```bash
npm run dev
```

## Raspberry Pi Setup

Create and activate a Python virtual environment:

```bash
python3 -m venv venv

source venv/bin/activate
```

Install the required Python packages.

The Raspberry Pi application can then be started with:

```bash
python main.py
```

The camera server can be started with:

```bash
python camera.py
```

## Automatic Startup

The Raspberry Pi services are configured to start automatically when the device boots.

The system uses `systemd` services for:

* IoT sensor and MQTT application
* WebRTC camera server
* Cloudflare Quick Tunnel

This allows the Raspberry Pi to operate as a standalone IoT device without requiring manual terminal commands after every reboot.

## Deployment

The frontend can be deployed using Vercel.

The Raspberry Pi remains responsible for:

* Sensor acquisition
* MQTT communication
* Camera streaming

HiveMQ Cloud is used as the MQTT broker, while Cloudflare Tunnel provides remote access to the camera signaling server.

## Security Notes

This project is intended primarily as an IoT development and demonstration project.

For production deployment, additional security measures should be considered, including:

* Secure MQTT credentials
* Backend-based MQTT authentication
* Access control
* Authentication for the dashboard
* HTTPS/WSS configuration
* A named Cloudflare Tunnel instead of a Quick Tunnel
* TURN server configuration for reliable WebRTC connectivity across restrictive networks

## Purpose

The goal of Pi5HomeIoT is to demonstrate the integration of embedded systems, IoT communication, real-time web technologies, and remote monitoring in a practical home monitoring platform.

---

## Author

**Kaan Ege**

Built with Raspberry Pi 5, Python, React, TypeScript, MQTT, WebRTC, and modern web technologies.
