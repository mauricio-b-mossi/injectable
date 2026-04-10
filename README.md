# SQLi Lab (Uninjectable)

An interactive, locally-hosted web application for practicing SQL Injection methodologies safely using `sqlmap` or manual techniques. 

The purpose of this project is to provide a side-by-side comparison of **vulnerable** endpoints and **hardened** endpoints. It allows security enthusiasts to see how a successful breach looks versus how a failed breach looks, all neatly packaged in a customized UI.

## Features
- **Vulnerable Endpoints**: Intentionally flawed API routes (`GET /api/vulnerable/products`, `POST /api/vulnerable/login`) built using insecure string concatenation. Excellent for error-based, union-based, and boolean-based `sqlmap` practice.
- **Secure Endpoints**: Hardened counterparts using Parameterized Queries.
- **Built-in Terminal Log**: A live console at the bottom of the UI that streams the exact backend SQL queries executed against the locally-hosted SQLite database, letting you visualize how the injection alters the query structure.

## Getting Started

### Using Docker (Recommended)

Building and running the application through Docker is the fastest way to get started. All necessary configurations (`Dockerfile`) are included.

1. Build the Docker image:
```bash
docker build -t uninjectable:latest .
```

2. Run the application (exposing the app on port 80):
```bash
docker run -d -p 80:3000 uninjectable
```

The app will be live at `http://localhost`.

### Manual Setup (Node.js)

1. Navigate to the project directory and install dependencies:
```bash
npm install
```

2. Start the server:
```bash
node server.js
```

The app will be live at `http://localhost:3000`.

## Practice with `sqlmap`

**1. Attack the Vulnerable Endpoint**  
Run this command to see a successful breach:
```bash
sqlmap -u "http://localhost:3000/api/vulnerable/products?search=a" --dbs --batch
```
*Observe how SQLMap quickly finds the vulnerability and dumps the databases.*

**2. Attack the Secure Endpoint**
Run this command to see a failed breach:
```bash
sqlmap -u "http://localhost:3000/api/secure/products?search=a" --dbs --batch
```
*Observe how the parameterized queries block the attack and `sqlmap` cannot inject the parameter.*

## Disclaimer
This project is for educational purposes only. Never attempt these techniques against systems where you do not have explicit authorization.
