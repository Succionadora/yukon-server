# Dockerfile

# Use the Node.js 18 Alpine base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install app dependencies (including devDependencies)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Copy config_example.json to config.json
RUN cp config/config_example.json config/config.json

# Build the app for production
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Expose the port your app runs on (adjust if different)
EXPOSE 8080

# Start the app
CMD [ "npm", "run", "start" ]
