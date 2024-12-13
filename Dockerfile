FROM node:18

# Set environment to production
ENV NODE_ENV=production

# Create app directory
WORKDIR /Work/business-rate-scraper-module/

# Install app dependencies
COPY package*.json ./
RUN npm install --production
RUN npx -y playwright install --with-deps chromium

# Bundle app source
COPY . .

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "try { require('./tasksManager.js'); process.exit(0); } catch(e) { process.exit(1); }"

# Start the application with proper error handling
CMD ["node", "-e", "try { require('./tasksManager.js').main().catch(e => { console.error(e); process.exit(1); }); } catch(e) { console.error(e); process.exit(1); }"]