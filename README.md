# V-LAB — Virtual Physics Laboratory

V-LAB is an interactive virtual physics laboratory designed to help students understand fundamental physics concepts through visual and interactive simulations.

The project provides simple simulations where users can experiment with physical parameters and observe how they affect motion and other physical phenomena.

## Features

V-LAB currently includes the following simulations:

* **Ball Acceleration** — Explore how acceleration affects the motion of a ball.
* **Bouncing Ball** — Study the motion of a ball as it repeatedly bounces.
* **Ball Gravity** — Explore the effect of gravitational acceleration on a ball.
* **Projectile Motion** — Experiment with projectile motion and observe the resulting trajectory.
* **Inclined Plane** — Investigate the motion of an object on an inclined plane.

Each simulation provides interactive controls that allow users to change relevant physical parameters and observe the results.

## Tech Stack

* Next.js
* React
* JavaScript
* Tailwind CSS
* p5.js / interactive rendering
* Node.js

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed.

### Installation

Clone the repository and navigate into the project directory:

```bash
git clone 
cd VLAB
```

Install the dependencies:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open the application in your browser at:

```text
http://localhost:3000
```

### Lab with Friends (multiplayer rooms)

2–4 signed-in users can join the same simulation together in real time. Rooms
are held in memory by a standalone Socket.IO server; identity comes from the
same Firebase Authentication used for sign-in — the socket server verifies
each connection's Firebase ID token, it never trusts an ID sent by the client.

Configure the Firebase client variables used by the existing sign-in flow,
then provide a Firebase Admin service-account JSON value to the socket
process:

```text
FIREBASE_SERVICE_ACCOUNT_JSON={...}
APP_ORIGIN=http://localhost:3000
SOCKET_PORT=3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

Run the app and socket service in separate terminals:

```bash
npm run dev
npm run socket-server
```

Existing simulations remain the source of the simulation UI; the room feature
only adds an optional multiplayer sync layer (`spec.multiplayer: true`) on top
of them and does not duplicate them.

## Project Structure

```text
V-LAB/
├── app/                 # Main application and pages
├── content/             # Simulation/content data
├── public/              # Public assets
├── scripts/             # Project scripts
├── simulations/         # Physics simulations
├── images/              # Project assets
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

## Simulations

### Ball Acceleration

Demonstrates the relationship between acceleration and the resulting motion of a ball.

### Bouncing Ball

Simulates a bouncing ball and demonstrates how velocity and collisions affect its motion.

### Ball Gravity

Demonstrates the effect of gravitational acceleration on a moving ball.

### Projectile Motion

Allows users to explore projectile motion and observe the trajectory of an object launched with an initial velocity.

### Inclined Plane

Demonstrates the motion of an object along an inclined plane and how the angle of the plane affects acceleration.

## Purpose

V-LAB is developed as a college project to provide an accessible and interactive way to explore fundamental concepts in physics.

## License

This project is intended for educational use as part of a college project.
