output "ec2_public_ip" {
  value = aws_instance.code_executor.public_ip
}