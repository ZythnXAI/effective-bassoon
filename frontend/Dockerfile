# Use official Node.js image
FROM node:20-slim

# Set environment variables
ENV NODE_ENV=production
ENV PATH="/app/node_modules/.bin:$PATH"

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
