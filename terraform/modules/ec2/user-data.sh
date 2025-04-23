#!/bin/bash

# 1. Create the environment file
cat > /etc/code-executor.conf << EOL
AWS_REGION='${aws_region}'
SQS_QUEUE_URL='${sqs_queue_url}'
S3_BUCKET_NAME='${s3_bucket_name}'
DB_HOST='${db_host}'
DB_USER='${db_user}'
DB_PASSWORD='${db_password}'
DB_NAME='${db_name}'
EOL

# 2. Set proper permissions (readable by ec2-user)
chmod 644 /etc/code-executor.conf
chown root:root /etc/code-executor.conf

# 3. Write application files
echo "${worker_js_content}" | base64 --decode > /home/ec2-user/worker.js
echo "${dockerfile_content}" | base64 --decode > /home/ec2-user/Dockerfile
echo "${setup_sh_content}" | base64 --decode > /home/ec2-user/setup.sh

# 4. Create systemd service (SIMPLIFIED)
cat > /etc/systemd/system/code-executor.service << EOL
[Unit]
Description=Code Executor Worker
After=network.target docker.service

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/code-executor
ExecStart=/usr/bin/node worker.js
Restart=on-failure
RestartSec=5s
EnvironmentFile=/etc/code-executor.conf

[Install]
WantedBy=multi-user.target
EOL

# 5. Make setup executable and run
chmod +x /home/ec2-user/setup.sh
sudo -u ec2-user /home/ec2-user/setup.sh