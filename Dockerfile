# --- STAGE 1: Build Stage (Builder) ---
# Use a specific Node version to build the React application
FROM node:20-slim as builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies needed for build)
# Using legacy-peer-deps might still be necessary for some React dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the frontend code
COPY . .

# Run the build command (Vite/React default for production)
# This creates the optimized static files in the 'dist' folder.
RUN npm run build


# --- STAGE 2: Production Stage (Serving) ---
# Use a lightweight web server (Nginx is common, but we'll use a simpler Node approach 
# or Python's Nginx-equivalent for simplicity if performance isn't critical. 
# Using Alpine Node is usually simplest for minimal dependencies.)

FROM node:20-slim

# The VITE_ variables are baked into the static assets during the BUILD stage, 
# so we only need to expose the port the final application will be served on.
ENV PORT=3000
ENV NODE_ENV=production

# Set the working directory to serve the static files
WORKDIR /usr/share/nginx/html

# Copy the built assets from the builder stage
# Assuming your 'npm run build' outputs to the 'dist' folder (Vite default)
COPY --from=builder /app/dist /usr/share/nginx/html

# If you prefer to serve with a tiny Node server (for flexibility):
# If using Express to serve the static content, you need index.js here, but
# using a simple Node base and the built assets is generally sufficient.

# Expose the port (3000)
EXPOSE 3000

# The simplest way to deploy a static React app on Render/Railway is to use 
# a custom Nginx-like static file server. Since that's complicated to setup 
# without Docker Compose, we will use a simple HTTP server package if needed,
# but often the PaaS platform handles this if you point it at the folder.

# If the host requires a CMD, we install a simple static server (serve)
RUN npm install -g serve
CMD ["serve", "-s", ".", "-l", "3000"]
