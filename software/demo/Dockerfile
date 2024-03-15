# Use an official Node.js runtime as a base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the JavaScript files to the container
COPY *.js ./

# Copy the environment file to the container
COPY .env ./

# Define the command to run npm scripts concurrently using npm-run-all
# CMD ["npx", "npm-run-all", "--parallel", "mqtt-pub", "mqtt-sub", "kafka-sub"]
CMD ["npx", "npm-run-all", "--parallel", "mqtt-sub", "kafka-sub"]



# MongoDB service
FROM mongo:latest
# Optionally, you can set the working directory and copy any MongoDB configuration files if needed
# WORKDIR /etc/mongo
# COPY mongod.conf ./

# Expose MongoDB default port
EXPOSE 27017

# Run MongoDB on container startup
CMD ["mongod", "--bind_ip_all", "--port", "27017", "--storageEngine", "wiredTiger"]