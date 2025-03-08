# Use a smaller base image (Alpine Linux)
FROM alpine:3.14

# Install necessary tools and languages
RUN apk add --no-cache \
    nodejs \
    npm \
    python3 \
    openjdk11 \
    && npm install -g aws-sdk mysql2 uuid

# Create a non-root user to run the code
RUN adduser -D codeuser
USER codeuser

# Set working directory
WORKDIR /code

# Default command - will be overridden during runtime
CMD ["echo", "Code execution container ready"]