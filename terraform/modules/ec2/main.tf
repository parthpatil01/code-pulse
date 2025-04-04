# 1. Security Group 
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

# 2. Launch Template
resource "aws_launch_template" "code_executor_lt" {
  name                   = "code-executor-launch-template"
  image_id               = var.ec2_ami
  instance_type          = "t2.micro"
  key_name               = var.ec2_key_name
  vpc_security_group_ids = [aws_security_group.code_executor_sg.id]

  iam_instance_profile {
    name = "LabInstanceProfile"
  }

  # User Data to replace provisioners
  user_data = base64encode(templatefile("${path.module}/user-data.sh", {
    worker_js_content  = base64encode(file("${path.module}/../../../ec2-setup/worker.js"))
    dockerfile_content = base64encode(file("${path.module}/../../../ec2-setup/Dockerfile"))
    setup_sh_content   = base64encode(file("${path.module}/../../../ec2-setup/setup.sh"))
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "CodeExecutor"
    }
  }
}

# 3. Auto Scaling Group
resource "aws_autoscaling_group" "code_executor_asg" {
  name = "code-executor-asg"
  # desired_capacity  = 0 # Default instances
  # min_size          = 0 # Minimum instances
  # max_size          = 0 # Maximum instances (adjust as needed)
  desired_capacity  = 1 # Default instances
  min_size          = 1 # Minimum instances
  max_size          = 3 # Maximum instances (adjust as needed)
  health_check_type = "EC2"

  vpc_zone_identifier = ["subnet-05729e2bd6158f00e", "subnet-080af0cc7d2307745"]
  launch_template {
    id      = aws_launch_template.code_executor_lt.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "CodeExecutor"
    propagate_at_launch = true
  }
}

# 4. Scaling Policy - Scale out when CPU > 70%
resource "aws_autoscaling_policy" "scale_out" {
  name                   = "scale-out-cpu"
  policy_type            = "TargetTrackingScaling"
  autoscaling_group_name = aws_autoscaling_group.code_executor_asg.name

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
