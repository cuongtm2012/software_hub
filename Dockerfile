FROM node:18-alpine

WORKDIR /app

# Copy package.json & package-lock.json to install dependencies
COPY package*.json ./

RUN npm install --production

# Copy all source code
COPY . .

# Build the frontend
RUN npm run build

# Set production environment
ENV NODE_ENV=production

# Expose port 5000
EXPOSE 5000

# Start the main application
CMD ["npm", "start"]