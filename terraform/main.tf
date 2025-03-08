provider "aws" {
  region = var.aws_region
}

module "rds" {
  source      = "./modules/rds"
  db_username = var.db_username
  db_password = var.db_password
  db_name     = var.db_name
}

module "s3" {
  source         = "./modules/s3"
  s3_bucket_name = var.s3_bucket_name
}

module "sqs" {
  source = "./modules/sqs"
}

module "ec2" {
  source       = "./modules/ec2"
  ec2_ami      = var.ec2_ami
  ec2_key_name = var.ec2_key_name
}

module "lambda" {
  source          = "./modules/lambda"
  db_host         = module.rds.db_host
  db_name         = var.db_name
  db_username     = var.db_username
  db_password     = var.db_password
  lambda_role_arn = var.lambda_role_arn
  s3_bucket_name  = var.s3_bucket_name
  sqs_queue_url   = module.sqs.sqs_queue_url
}


module "api_gateway" {
  source                      = "./modules/api_gateway"
  lambda_submit_invoke_arn    = module.lambda.lambda_submit_invoke_arn
  lambda_status_invoke_arn    = module.lambda.lambda_status_invoke_arn
}

# Allow API Gateway to invoke the "submit-code" Lambda function
resource "aws_lambda_permission" "api_gateway_submit" {
  statement_id  = "AllowExecutionFromAPIGatewaySubmit"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda.lambda_submit_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.api_gateway.execution_arn}/*/*/*"
}

# Allow API Gateway to invoke the "check-submission-status" Lambda function
resource "aws_lambda_permission" "api_gateway_status" {
  statement_id  = "AllowExecutionFromAPIGatewayStatus"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda.lambda_status_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.api_gateway.execution_arn}/*/*/*"
}