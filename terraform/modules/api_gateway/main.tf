resource "aws_api_gateway_rest_api" "code_editor_api" {
  name        = "code-editor-api"
  description = "API for code editor"
}

# Run Code Resource and Methods
resource "aws_api_gateway_resource" "run_code" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  parent_id   = aws_api_gateway_rest_api.code_editor_api.root_resource_id
  path_part   = "run"
}

resource "aws_api_gateway_method" "run_code_post" {
  rest_api_id   = aws_api_gateway_rest_api.code_editor_api.id
  resource_id   = aws_api_gateway_resource.run_code.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  resource_id = aws_api_gateway_resource.run_code.id
  http_method = aws_api_gateway_method.run_code_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_submit_invoke_arn
}

resource "aws_api_gateway_method_response" "run_code_post_200" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  resource_id = aws_api_gateway_resource.run_code.id
  http_method = aws_api_gateway_method.run_code_post.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  depends_on = [aws_api_gateway_method.run_code_post]
}

# Run Code OPTIONS method for CORS
resource "aws_api_gateway_method" "run_code_options" {
  rest_api_id   = aws_api_gateway_rest_api.code_editor_api.id
  resource_id   = aws_api_gateway_resource.run_code.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "run_code_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  resource_id = aws_api_gateway_resource.run_code.id
  http_method = aws_api_gateway_method.run_code_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "run_code_options_200" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  resource_id = aws_api_gateway_resource.run_code.id
  http_method = aws_api_gateway_method.run_code_options.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }

  depends_on = [aws_api_gateway_method.run_code_options]
}

resource "aws_api_gateway_integration_response" "run_code_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  resource_id = aws_api_gateway_resource.run_code.id
  http_method = aws_api_gateway_method.run_code_options.http_method
  status_code = aws_api_gateway_method_response.run_code_options_200.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [
    aws_api_gateway_method_response.run_code_options_200,
    aws_api_gateway_integration.run_code_options_integration
  ]
}

# Status Resource and Methods
resource "aws_api_gateway_resource" "status" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  parent_id   = aws_api_gateway_rest_api.code_editor_api.root_resource_id
  path_part   = "status"
}

resource "aws_api_gateway_resource" "submission_id" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  parent_id   = aws_api_gateway_resource.status.id
  path_part   = "{submissionId}"
}

resource "aws_api_gateway_method" "status_get" {
  rest_api_id   = aws_api_gateway_rest_api.code_editor_api.id
  resource_id   = aws_api_gateway_resource.submission_id.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "status_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  resource_id = aws_api_gateway_resource.submission_id.id
  http_method = aws_api_gateway_method.status_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_status_invoke_arn
}

resource "aws_api_gateway_method_response" "status_get_200" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  resource_id = aws_api_gateway_resource.submission_id.id
  http_method = aws_api_gateway_method.status_get.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  depends_on = [aws_api_gateway_method.status_get]
}

# Status OPTIONS method for CORS
resource "aws_api_gateway_method" "status_options" {
  rest_api_id   = aws_api_gateway_rest_api.code_editor_api.id
  resource_id   = aws_api_gateway_resource.submission_id.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "status_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  resource_id = aws_api_gateway_resource.submission_id.id
  http_method = aws_api_gateway_method.status_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "status_options_200" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  resource_id = aws_api_gateway_resource.submission_id.id
  http_method = aws_api_gateway_method.status_options.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }

  depends_on = [aws_api_gateway_method.status_options]
}

resource "aws_api_gateway_integration_response" "status_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  resource_id = aws_api_gateway_resource.submission_id.id
  http_method = aws_api_gateway_method.status_options.http_method
  status_code = aws_api_gateway_method_response.status_options_200.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [
    aws_api_gateway_method_response.status_options_200,
    aws_api_gateway_integration.status_options_integration
  ]
}

# Deployment
resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on = [
    aws_api_gateway_integration.lambda_integration,
    aws_api_gateway_integration.status_lambda_integration,
    aws_api_gateway_integration.run_code_options_integration,
    aws_api_gateway_integration.status_options_integration,
    aws_api_gateway_integration_response.run_code_options_integration_response,
    aws_api_gateway_integration_response.status_options_integration_response
  ]

  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  stage_name  = "prod"
}