output "api_gateway_url" {
  value = aws_api_gateway_deployment.api_deployment.invoke_url
}

output "execution_arn" {
  description = "The execution ARN of the API Gateway."
  value       = aws_api_gateway_rest_api.code_editor_api.execution_arn
}