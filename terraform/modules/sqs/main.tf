resource "aws_sqs_queue" "code_execution_queue" {
  name                      = "code-execution-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
}

resource "aws_cloudwatch_metric_alarm" "sqs_stale_messages" {
  alarm_name          = "sqs-${aws_sqs_queue.code_execution_queue.name}-stale"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "AgeOfOldestMessage"
  namespace          = "AWS/SQS"
  period             = 60  # 1 minute
  statistic          = "Maximum"
  threshold          = 300  # 5 minutes (in seconds)
  alarm_description  = "Alerts when messages sit in queue >5 minutes"

  dimensions = {
    QueueName = aws_sqs_queue.code_execution_queue.name
  }
}