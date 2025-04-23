output "lambda_status_function_name" {
  value = aws_lambda_function.lambda_status.function_name
}

output "lambda_status_invoke_arn" {
  value = aws_lambda_function.lambda_status.invoke_arn
}

output "lambda_submit_function_name" {
  value = aws_lambda_function.lambda_submit.function_name
}

output "lambda_submit_invoke_arn" {
  value = aws_lambda_function.lambda_submit.invoke_arn
}

output "lambda_refactor_function_name" {
  value = aws_lambda_function.lambda_refactor.function_name
}

output "lambda_refactor_invoke_arn" {
  value = aws_lambda_function.lambda_refactor.invoke_arn
  
}