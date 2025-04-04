#!/bin/bash
# ec2-setup/setup.sh

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker mariadb105
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

DB_HOST="submissions-db.c2fbuvcm5pfl.us-east-1.rds.amazonaws.com"
DB_USER="admin"
DB_PASSWORD="root1234"
DB_NAME="submissions"

# Create database tables (retry for 2 minutes until DB is available)
timeout 120 bash -c 'while ! mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME"; do sleep 2; done'

mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME <<EOL
CREATE TABLE IF NOT EXISTS submissions (
  id VARCHAR(36) PRIMARY KEY,
  language VARCHAR(20) NOT NULL,
  code_path VARCHAR(255) NOT NULL,
  output_path VARCHAR(255),
  status ENUM('pending', 'running', 'completed', 'error') NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE OR REPLACE VIEW recent_submissions AS
SELECT id, language, status, created_at, completed_at
FROM submissions
ORDER BY created_at DESC
LIMIT 100;
EOL

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
Environment=SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/494938070824/code-execution-queue
Environment=S3_BUCKET_NAME=code-editor-storage-789452154
Environment=DB_HOST=submissions-db.c2fbuvcm5pfl.us-east-1.rds.amazonaws.com
Environment=DB_USER=admin
Environment=DB_PASSWORD=root1234
Environment=DB_NAME=submissions

[Install]
WantedBy=multi-user.target
EOL'

# Enable and start the service
sudo systemctl enable code-executor
sudo systemctl start code-executor

echo "Setup complete!"