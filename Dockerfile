FROM node:18

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files (this will include src/, public/, etc.)
COPY . .

# Set environment variables
ENV PUBLIC_URL=
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Expose port - this is just documentation, Railway will still use PORT env var
EXPOSE 4000

# Start the application
CMD ["node", "server.js"]