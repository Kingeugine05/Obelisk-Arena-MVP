FROM node:18

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy critical directories explicitly
COPY src/ ./src/
COPY public/ ./public/
COPY server.js ./

# Verify files are copied
RUN ls -la
RUN ls -la src/
RUN ls -la public/

# Set environment variables
ENV PUBLIC_URL=
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "server.js"]