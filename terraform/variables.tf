variable "aws_region" {
  description = "AWS region"
  type        = string
}


variable "db_username" {
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

variable "lambda_role_arn" {
  description = "Lambda IAM role ARN"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}


variable "ec2_ami" {
  description = "AMI ID for the EC2 instance"
  type        = string
}

variable "ec2_key_name" {
  description = "Key pair name for the EC2 instance"
  type        = string
}


variable "PINECONE_INDEX" {
  description = "Pinecone index name"
  type        = string  
  
}

variable "OPENAI_API_KEY" {
  description = "OpenAI API key"
  type        = string    
  
}

variable "PINECONE_API_KEY" {
  description = "Pinecone API key"
  type        = string      
  
}