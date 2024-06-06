# Use the official Node.js image as the base image
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip

# Copy the Python requirements file and install dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
