# Yukon Server

Visit the Discord server for more support.

[![Yukon Discord members](https://badgen.net/discord/members/NtYtpzyxBu)](https://discord.gg/NtYtpzyxBu)

## Built With

* [Node.js](https://nodejs.org/en/)
* [Socket.IO](https://socket.io/)
* [Sequelize](https://sequelize.org/)

## Local Installation

These instructions will get you a copy of the project up and running on your local machine for development purposes.

### Prerequisites

* [A MySQL database](https://www.mysql.com/)
* [Node.js](https://nodejs.org/en/)
* [yukon](https://github.com/wizguin/yukon)

### Installation

1. **Clone this repository.**

   ```console
   git clone https://github.com/wizguin/yukon-server
   ```

2. **Install node dependencies.**

   ```console
   npm install
   ```

3. **Copy `config/config_example.json` to a new file called `config/config.json`.**

   ```console
   cp config/config_example.json config/config.json
   ```

4. **Set `"use_envs"` to `"false"` and replace placeholders with your actual configuration values.**

   Open `config/config.json` and make the following changes:

   - Set `"use_envs": "false"`.
   - Replace all placeholders like `${SECRET}` with your actual configuration values.

   Example:

   ```json
   {
     "use_envs": "false",
     "crypto": {
       "secret": "your-secret-key",
       "rounds": 10,
       "loginKeyExpiry": 300
     },
     "database": {
       "host": "localhost",
       "user": "your-database-user",
       "password": "your-database-password",
       "database": "yukon",
       "dialect": "mysql",
       "debug": false
     },
     // ... rest of the configuration
   }
   ```

   **Note:** Make sure to replace `"your-secret-key"`, `"your-database-user"`, and `"your-database-password"` with your actual values.

5. **Generate a new crypto secret.**

   If you prefer to generate a new secret:

   ```console
   npm run secret-gen
   ```

6. **Import `yukon.sql` into your MySQL database.**


### Usage

* **Running the dev server.**

  ```console
  npm run dev
  ```

* **Building the server for production.**

  ```console
  npm run build
  ```

* **Running the server in production mode.** This will start all worlds listed in `config.json`.

  ```console
  npm run start
  ```

* **Stopping production servers.**

  ```console
  npm run stop
  ```

* **Restarting production servers.**

  ```console
  npm run restart
  ```

* **Listing production servers.**

  ```console
  npm run list
  ```

* **Display live logs for production servers**

  ```console
  npm run logs
  ```

* **PM2 monitor for production servers.**

  ```console
  npm run monit
  ```

* **Generate a new crypto secret.**

  ```console
  npm run secret-gen
  ```

### Account Creation

In order to access with the first user, run this query on your database:

```sql
INSERT INTO `users` (
  `id`, `username`, `email`, `password`, `loginKey`, `rank`, `permaBan`, `joinTime`,
  `coins`, `head`, `face`, `neck`, `body`, `hand`, `feet`, `color`, `photo`, `flag`,
  `ninjaRank`, `ninjaProgress`
) VALUES (
  NULL,                    -- 'id' (NULL if auto-incremented)
  'your_username',         -- 'username'
  'email@example.com',     -- 'email'
  'password_hash',         -- 'password' (use a secure bcrypt hash)
  NULL,                    -- 'loginKey'
  1,                       -- 'rank' (1 for default)
  0,                       -- 'permaBan' (0 for default)
  CURRENT_TIMESTAMP,       -- 'joinTime'
  500,                     -- 'coins' (500 as default)
  0,                       -- 'head'
  0,                       -- 'face'
  0,                       -- 'neck'
  0,                       -- 'body'
  0,                       -- 'hand'
  0,                       -- 'feet'
  1,                       -- 'color'
  0,                       -- 'photo'
  0,                       -- 'flag'
  0,                       -- 'ninjaRank'
  0                        -- 'ninjaProgress'
);
```

**Note:** Ensure you replace `'your_username'`, `'email@example.com'`, and `'password_hash'` with your actual username, email, and a bcrypt hashed password. A tool such as [this](https://www.browserling.com/tools/bcrypt) can be used to generate a bcrypt hash.

Example bcrypt hash:

```console
$2a$10$nAxC5GXU0i/dacalTX.iZuRrtpmwmZ9ZzL.U3Zroh0jeSXiswFsne
```

## Production Usage

The following is required when running the project in production.

* **Build the project for production.**

  ```console
  npm run build
  ```

* **Configure HTTPS (mandatory).** Make sure your web server is also configured to use HTTPS.

  ```json
  "socketio": {
      "https": true,
      "ssl": {
          "cert": "/path/to/cert.crt",
          "ca": "/path/to/ca.ca-bundle",
          "key": "/path/to/key.key"
      }
  },
  ```

* **Set the CORS origin.** This will likely be your domain name, e.g., `"example.com"`.

  ```json
  "cors": {
      "origin": "example.com"
  },
  ```

* **Run the server in production mode.**

  ```console
  npm run start
  ```

## Running with Docker

To simplify deployment and ensure a consistent environment, the Yukon Server can be run using Docker. This setup uses Docker Compose to manage services, including a MySQL database and an optional phpMyAdmin service for database management.

### Prerequisites

Ensure Docker and Docker Compose are installed on your machine. You can download them from:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Steps

1. **Clone the Repository**

   ```console
   git clone https://github.com/wizguin/yukon-server
   cd yukon-server
   ```


2. **Build and Start Services with Docker Compose**

   Run the following command to build the Docker image and start all services defined in `compose.yml` (MySQL, Yukon Server, and phpMyAdmin). The application will use environment variables defined in `compose.yml`.

   ```console
   docker compose up -d --build
   ```

3. **Access the Application**

   - **Yukon Server**: The Yukon client will be accessible at `http://localhost:8080` and will forward requests to the Yukon server.
   - **phpMyAdmin**: Access phpMyAdmin (optional) at `http://localhost:8081`. Use the MySQL credentials defined in `compose.yml`.

4. **Stopping Services**

   To stop all services, run:

   ```console
   docker compose down
   ```

---

### Production Readiness with Docker

For full production readiness when running with Docker, ensure HTTPS is enabled and SSL certificates are configured correctly:

1. **Set HTTPS Environment Variables in `compose.yml`**

   Configure the following environment variables for the `server` service in `compose.yml` to enable HTTPS:

   ```yaml
   SOCKETIO_HTTPS: 'true'  # Enables HTTPS in the application
   CERTS_DIR: /certs       # Directory where SSL certificates are stored in the container
   SSL_CERT_PATH: /certs/cert.crt
   SSL_CA_PATH: /certs/ca.ca-bundle
   SSL_KEY_PATH: /certs/key.key
   ```

2. **Prepare SSL Certificate Files**

   Ensure the following files are available in a `certs` folder in your project root:

   - `certs/cert.crt` - SSL certificate file
   - `certs/ca.ca-bundle` - CA bundle file
   - `certs/key.key` - Private key file

   These files will be mounted to the `/certs` directory in the container. This setup is required for HTTPS configuration in production.

3. **Update the `compose.yml` Volume Mount**

   Ensure `compose.yml` includes a volume to mount the `certs` directory to the `/certs` path in the container:

   ```yaml
   volumes:
     - ./certs:/certs:ro  # Mounts the certs directory as read-only
   ```

4. **Run the Server in Production Mode**

   After setting up HTTPS and SSL certificates, you can run the server in production mode using Docker.


---

## Configuration Details

### Using Environment Variables

The application supports configuration via environment variables for flexibility, especially when running in Docker or other containerized environments.

- **Enable Environment Variables:**

  In `config/config.json`, is set by default:

  ```json
  "use_envs": "true",
  ```

- **Placeholders in `config.json`:**

  Use placeholders like `${ENV_VAR_NAME}` in your configuration. These will be replaced by the corresponding environment variables at runtime.

### Using Hardcoded Values (Without Environment Variables)

If you're running the application without Docker or prefer to use hardcoded configuration values:

- **Disable Environment Variables:**

  In `config/config.json`, set:

  ```json
  "use_envs": "false",
  ```

- **Replace Placeholders:**

  Replace all placeholders in `config.json` with your actual configuration values.

---

## Disclaimer

This project is a work in progress. Please report any issues you find [here](https://github.com/wizguin/yukon-server/issues).
