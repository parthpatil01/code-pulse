resource "aws_api_gateway_rest_api" "code_editor_api" {
  name        = "code-editor-api"
  description = "API for code editor"
}

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

resource "aws_api_gateway_method_response" "response_200" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  resource_id = aws_api_gateway_resource.run_code.id
  http_method = aws_api_gateway_method.run_code_post.http_method
  status_code = "200"
}

#status endpoint
resource "aws_api_gateway_resource" "status" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  parent_id   = aws_api_gateway_rest_api.code_editor_api.root_resource_id
  path_part   = "status"
}

# Submission ID resource (for status/{submissionId})
resource "aws_api_gateway_resource" "submission_id" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  parent_id   = aws_api_gateway_resource.status.id
  path_part   = "{submissionId}"
}

# GET method for status endpoint
resource "aws_api_gateway_method" "status_get" {
  rest_api_id   = aws_api_gateway_rest_api.code_editor_api.id
  resource_id   = aws_api_gateway_resource.submission_id.id
  http_method   = "GET"
  authorization = "NONE"
}

# API Gateway integration for status endpoint
resource "aws_api_gateway_integration" "status_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  resource_id = aws_api_gateway_resource.submission_id.id
  http_method = aws_api_gateway_method.status_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"

  uri = var.lambda_status_invoke_arn
}

# Method response for status endpoint
resource "aws_api_gateway_method_response" "status_response_200" {
  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  resource_id = aws_api_gateway_resource.submission_id.id
  http_method = aws_api_gateway_method.status_get.http_method
  status_code = "200"
}


resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on = [
    aws_api_gateway_integration.lambda_integration,
    aws_api_gateway_integration.status_lambda_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.code_editor_api.id
  stage_name  = "prod"
}




