FROM node:18

WORKDIR /app

# First copy only package files to leverage Docker cache
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application
COPY . .

# Create public directory if it doesn't exist
RUN mkdir -p public

ENV PUBLIC_URL .
RUN npm run build

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["node", "server.js"]