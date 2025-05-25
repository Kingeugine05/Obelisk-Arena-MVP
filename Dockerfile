FROM node:18

WORKDIR /app

# First copy only package files to leverage Docker cache
COPY package*.json ./
# Remove --production flag to include dev dependencies needed for build
RUN npm install

# Copy the rest of the application
COPY . .

# Set PUBLIC_URL properly (empty for relative paths)
ENV PUBLIC_URL=

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["node", "server.js"]