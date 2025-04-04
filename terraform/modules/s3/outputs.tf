output "s3_bucket_arn" {
  value = aws_s3_bucket.code_storage.arn
}

output "s3_bucket_name" {
  value = aws_s3_bucket.code_storage.bucket
}