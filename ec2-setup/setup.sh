#!/bin/bash
# ec2-setup/setup.sh

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install dependencies
sudo yum install -y git npm

# Create the code-executor directory
mkdir -p /home/ec2-user/code-executor

# Move the uploaded files to the code-executor directory
mv /home/ec2-user/worker.js /home/ec2-user/code-executor/worker.js
mv /home/ec2-user/Dockerfile /home/ec2-user/code-executor/Dockerfile

# Navigate to the code-executor directory
cd /home/ec2-user/code-executor

# Build the Docker image for code execution
sudo docker build -t code-executor-image .

# Install dependencies for the worker
npm init -y
npm install aws-sdk mysql2 uuid dotenv

# Create service file to run the worker
sudo bash -c 'cat > /etc/systemd/system/code-executor.service << EOL
[Unit]
Description=Code Executor Worker
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/code-executor
ExecStart=/usr/bin/node worker.js
Restart=always
Environment=AWS_REGION=us-east-1
Environment=SQS_QUEUE_URL=your-sqs-queue-url
Environment=S3_BUCKET_NAME=your-s3-bucket-name
Environment=DB_HOST=your-db-host
Environment=DB_USER=your-db-user
Environment=DB_PASSWORD=your-db-password
Environment=DB_NAME=your-db-name

[Install]
WantedBy=multi-user.target
EOL'

# Enable and start the service
sudo systemctl enable code-executor
sudo systemctl start code-executor

echo "Setup complete!"