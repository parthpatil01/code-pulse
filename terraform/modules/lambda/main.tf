resource "aws_lambda_function" "lambda_status" {
  function_name    = "check-submission-status"
  role             = var.lambda_role_arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  filename         = "C:/Users/parth/Downloads/aws-code-editor/backend/check-status/function-status.zip"
  source_code_hash = filebase64sha256("C:/Users/parth/Downloads/aws-code-editor/backend/check-status/function-status.zip")
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      DB_HOST        = var.db_host
      DB_NAME        = var.db_name
      DB_USER        = var.db_username
      DB_PASSWORD    = var.db_password
      S3_BUCKET_NAME = var.s3_bucket_name
    }
  }
}


resource "aws_lambda_function" "lambda_submit" {
  function_name    = "submit-code"
  role             = var.lambda_role_arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  filename         = "C:/Users/parth/Downloads/aws-code-editor/backend/submit-code/function-submit.zip"
  source_code_hash = filebase64sha256("C:/Users/parth/Downloads/aws-code-editor/backend/submit-code/function-submit.zip")
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      DB_HOST        = var.db_host
      DB_NAME        = var.db_name
      DB_USER        = var.db_username
      DB_PASSWORD    = var.db_password
      S3_BUCKET_NAME = var.s3_bucket_name
      SQS_QUEUE_URL  = var.sqs_queue_url
    }
  }
}
