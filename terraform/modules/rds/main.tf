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
  publicly_accessible  = false
}

