
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

