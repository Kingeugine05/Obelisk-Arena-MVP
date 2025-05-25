FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with verbose output
RUN npm install --verbose

# Copy source code
COPY . .

# List contents to verify files are copied
RUN ls -la
RUN ls -la src/
RUN ls -la public/

# Set environment variables
ENV NODE_ENV=production
ENV PUBLIC_URL=

# Build with verbose output
RUN npm run build --verbose

# Expose port
EXPOSE 4000

# Start command
CMD ["node", "server.js"]