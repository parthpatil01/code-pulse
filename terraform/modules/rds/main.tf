resource "aws_db_instance" "submissions_db" {
  allocated_storage    = 20
  engine               = "mysql"
  engine_version       = "8.0"
  instance_class       = "db.t3.micro"
  identifier           = "submissions-db"
  username             = var.db_username
  password             = var.db_password
  db_name              = var.db_name
  parameter_group_name = "default.mysql8.0"
  skip_final_snapshot  = true
  publicly_accessible  = true
}

resource "aws_cloudwatch_metric_alarm" "rds_connections" {
  alarm_name          = "rds-${aws_db_instance.submissions_db.id}-high-connections"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "DatabaseConnections"
  namespace          = "AWS/RDS"
  period             = 60  
  statistic          = "Average"
  threshold          = 50  
  alarm_description  = "Triggers when connections exceed safe threshold"
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.submissions_db.id
  }
}