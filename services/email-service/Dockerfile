FROM node:18-alpine

WORKDIR /app

# Copy package.json & package-lock.json to install dependencies
COPY package*.json ./

RUN npm install --production

# Copy all source code
COPY . .

# Set production environment
ENV NODE_ENV=production

# Expose default port
EXPOSE 3001

# Start main app
CMD ["node", "src/app.js"]