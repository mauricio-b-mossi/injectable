# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json to the working directory
COPY package*.json ./

# Install app dependencies
# We use npm install --omit=dev safely since it's a prod-like environment
RUN npm install

# Bundle app source code into the container
COPY . .

# Expose port 3000 to the outside world
EXPOSE 3000

# Command to run the application
CMD [ "node", "server.js" ]
