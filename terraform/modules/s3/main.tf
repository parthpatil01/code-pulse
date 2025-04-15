
resource "aws_s3_bucket" "code_storage" {
  bucket = var.s3_bucket_name
}

resource "aws_s3_bucket_ownership_controls" "code_storage" {
  bucket = aws_s3_bucket.code_storage.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "code_storage" {
  bucket = aws_s3_bucket.code_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudwatch_metric_alarm" "s3_errors" {
  alarm_name          = "s3-${aws_s3_bucket.code_storage.bucket}-errors-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5xxErrors"
  namespace          = "AWS/S3"
  period             = 300  # 5 minutes
  statistic          = "Sum"
  threshold          = 0    # Alert on any errors
  alarm_description  = "Alerts when S3 returns 5xx errors"

  dimensions = {
    BucketName = aws_s3_bucket.code_storage.bucket
  }
}