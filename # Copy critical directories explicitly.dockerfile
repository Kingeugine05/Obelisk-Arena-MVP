# Copy critical directories explicitly
COPY public ./public
COPY src ./src
COPY package*.json ./
COPY server.js ./
# Copy any other necessary files