# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory
WORKDIR /usr/src/app

# Install Python, pip, and tesseract-ocr
RUN apt-get update && apt-get install -y python3 python3-pip tesseract-ocr

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the Python requirements file and install dependencies with --break-system-packages flag
COPY requirements.txt ./
RUN pip3 install --break-system-packages -r requirements.txt

# Bundle app source
COPY . .

# Set the Tesseract-OCR path
ENV TESSERACT_PATH=/usr/bin/tesseract

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["node", "server.js"]
