FROM node:18

WORKDIR /app

# Install expo-cli globally
RUN npm install -g expo-cli eas-cli

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the default Expo port
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Start Expo development server
CMD ["npm", "start"]