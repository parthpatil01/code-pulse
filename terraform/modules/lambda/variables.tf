variable "db_host" {
  description = "RDS DB host"
  type        = string
}

variable "db_name" {
  description = "RDS DB name"
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

variable "lambda_role_arn" {
  description = "Lambda IAM role ARN"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "sqs_queue_url" {
  description = "SQS queue URL"
  type        = string
}