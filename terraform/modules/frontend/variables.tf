variable "ec2_ami" {
  description = "AMI ID for the EC2 instance"
  type        = string
}

variable "ec2_key_name" {
  description = "Key pair name for the EC2 instance"
  type        = string
}

variable "subnet_id" {
  description = "Public subnet ID for the frontend"
  type        = string
}

variable "docker_username" {
  description = "Docker Hub username"
  type        = string
}

variable "frontend_image" {
  description = "Docker image name (without username)"
  type        = string
}

variable "api_gateway_url" {
  description = "Backend API Gateway URL"
  type        = string
}