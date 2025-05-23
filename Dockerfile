FROM node:18

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

RUN ls -la /app
RUN ls -la /app/public

ENV PUBLIC_URL .
RUN npm run build

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["node", "server.js"]