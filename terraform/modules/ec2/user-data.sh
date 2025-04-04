#!/bin/bash

# Encode files as base64 before writing
echo "${worker_js_content}" | base64 --decode > /home/ec2-user/worker.js
echo "${dockerfile_content}" | base64 --decode > /home/ec2-user/Dockerfile
echo "${setup_sh_content}" | base64 --decode > /home/ec2-user/setup.sh

# Set permissions and run setup
chmod +x /home/ec2-user/setup.sh
/home/ec2-user/setup.sh