# Use an official Node.js runtime as a parent image
FROM node:17-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies


# Copy the rest of your NestJS application code to the container
COPY . .

# Expose the port your NestJS application listens on
EXPOSE 3000

# Define the command to start your NestJS application
CMD ["npm", "start"]