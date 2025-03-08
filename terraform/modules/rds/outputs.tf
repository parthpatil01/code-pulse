
output "rds_db_arn" {
  value = aws_db_instance.submissions_db.arn
}

output "db_host" {
  value = aws_db_instance.submissions_db.address
}