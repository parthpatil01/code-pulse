# Get all instances in the ASG
data "aws_instances" "asg_instances" {
  filter {
    name   = "tag:aws:autoscaling:groupName"
    values = [aws_autoscaling_group.code_executor_asg.name]
  }
}

# Output all public IPs of instances in the ASG
output "ec2_instance_public_ips" {
  description = "Public IPs of all EC2 instances in the Auto Scaling Group"
  value       = data.aws_instances.asg_instances.public_ips
}

# (Optional) Output the first instance's IP (unstable if scaling)
output "first_instance_public_ip" {
  description = "Public IP of the first instance in the ASG (may change due to scaling)"
  value       = length(data.aws_instances.asg_instances.public_ips) > 0 ? data.aws_instances.asg_instances.public_ips[0] : null
}