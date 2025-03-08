
resource "aws_instance" "code_executor" {
  ami                    = var.ec2_ami
  instance_type          = "t2.micro"
  key_name               = var.ec2_key_name
  vpc_security_group_ids = [aws_security_group.code_executor_sg.id]
  iam_instance_profile   = "LabInstanceProfile"


  provisioner "file" {
    source      = "${path.module}/../../../ec2-setup/worker.js"    # Path to your local worker.js file
    destination = "/home/ec2-user/worker.js"
  }

  provisioner "file" {
    source      = "${path.module}/../../../ec2-setup/Dockerfile"  # Path to your local Dockerfile
    destination = "/home/ec2-user/Dockerfile"
  }

  provisioner "file" {
    source      = "${path.module}/../../../ec2-setup/setup.sh"    # Path to your local setup.sh script
    destination = "/home/ec2-user/setup.sh"
  }
  
  provisioner "remote-exec" {
    inline = [
      "chmod +x /home/ec2-user/setup.sh",
      "/home/ec2-user/setup.sh"
    ]
  }
  connection {
    type        = "ssh"
    user        = "ec2-user"
    private_key = file("C:\\Users\\parth\\Downloads\\key-pair.pem")
    host        = self.public_ip
  }


  tags = {
    Name = "CodeExecutor"
  }
}

resource "aws_security_group" "code_executor_sg" {
  name        = "code-executor-sg"
  description = "Security group for code executor EC2 instance"

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

