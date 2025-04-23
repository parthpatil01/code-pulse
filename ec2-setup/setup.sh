#!/bin/bash

# 1. Load variables 
echo "=== Loading variables ==="
set -a
source /etc/code-executor.conf
set +a
env | grep -E 'AWS|SQS|S3|DB_'

# 2. Install dependencies
sudo yum update -y
sudo yum install -y docker mariadb105 git npm
sudo systemctl start docker
sudo usermod -a -G docker ec2-user

# 3. Setup code directory
mkdir -p /home/ec2-user/code-executor
mv /home/ec2-user/worker.js /home/ec2-user/code-executor/
mv /home/ec2-user/Dockerfile /home/ec2-user/code-executor/

# 4. Build Docker image
cd /home/ec2-user/code-executor
sudo docker build -t code-executor-image .

# 5. Install Node dependencies
npm init -y
npm install aws-sdk mysql2 uuid dotenv

# 6. Database setup (with connection retries)
for i in {1..12}; do
  if mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME"; then
    echo "Database connection successful"
    break
  else
    echo "Attempt $i: Waiting for database... ($DB_HOST)"
    sleep 5
  fi
done

mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<EOL
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
EOL

# 7. Enable service
sudo systemctl daemon-reload
sudo systemctl enable code-executor
sudo systemctl start code-executor

echo "Setup complete! Verify with:"
echo "sudo systemctl status code-executor"
echo "sudo journalctl -u code-executor -f"