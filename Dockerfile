FROM node:18

# Create app directory
WORKDIR /Work/business-rate-scraper-module/

# Install app dependencies
COPY package*.json ./
RUN npm install
RUN npx -y playwright install --with-deps

# Bundle app source
COPY . .

# Expose port if needed (adjust as necessary)
EXPOSE 8080

# Start the application
CMD ["node", "tasksManager.js"]