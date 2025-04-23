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

resource "aws_lambda_function" "lambda_refactor" {
  function_name    = "refactor-code"
  role             = var.lambda_role_arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  filename         = "C:/Users/parth/Downloads/aws-code-editor/backend/Refactor/ragRefactorHandler.zip"
  source_code_hash = filebase64sha256("C:/Users/parth/Downloads/aws-code-editor/backend/Refactor/ragRefactorHandler.zip")
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      PINECONE_INDEX   = var.PINECONE_INDEX
      OPENAI_API_KEY   = var.OPENAI_API_KEY
      PINECONE_API_KEY = var.PINECONE_API_KEY
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "lambda_status_errors" {
  alarm_name          = "${aws_lambda_function.lambda_status.function_name}-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 60 # 1 minute
  statistic           = "Sum"
  threshold           = 0 # Alert on any error
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.lambda_status.function_name
  }

  alarm_description = "Triggers when status Lambda has execution errors"
}

resource "aws_cloudwatch_metric_alarm" "lambda_submit_errors" {
  alarm_name          = "${aws_lambda_function.lambda_submit.function_name}-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.lambda_submit.function_name
  }

  alarm_description = "Triggers when submit Lambda has execution errors"
}
