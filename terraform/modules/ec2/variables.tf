variable "ec2_ami" {
  description = "AMI ID for the EC2 instance"
  type        = string
}

variable "ec2_key_name" {
  description = "Key pair name for the EC2 instance"
  type        = string
}

variable "db_host" {
  description = "Database host URL"
  type        = string
}

variable "db_user" {
  description = "Database username"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "s3_bucket_name" {
  description = "S3 bucket name for code storage"
  type        = string
}

variable "sqs_queue_url" {
  description = "SQS queue URL for code execution messages"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}