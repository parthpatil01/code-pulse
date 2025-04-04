resource "aws_security_group" "frontend_sg" {
  name        = "frontend-sg"
  description = "Security group for frontend instance"

  # Allow HTTP and SSH
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "frontend" {
  ami           = var.ec2_ami
  instance_type = "t2.micro"
  key_name      = var.ec2_key_name
  subnet_id     = var.subnet_id

  vpc_security_group_ids = [aws_security_group.frontend_sg.id]

  user_data = base64encode(templatefile("${path.module}/user-data.sh", {
    docker_image    = "${var.docker_username}/${var.frontend_image}"
    api_gateway_url = var.api_gateway_url
  }))

  tags = {
    Name = "CodeEditorFrontend"
  }
}