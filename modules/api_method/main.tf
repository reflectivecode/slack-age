data "aws_caller_identity" "current" { }

data "archive_file" "file" {
  type        = "zip"
  source_dir  = "${var.directory}"
  output_path = "${var.filename}"
}

resource "aws_iam_role" "role" {
  name = "${var.name}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_policy_attachment" "attachment" {
  name       = "AWSLambdaBasicExecutionRole"
  roles      = ["${aws_iam_role.role.id}"]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "policy" {
  count  = "${signum(var.has_role_policy)}"
  name   = "${var.name}Policy"
  role   = "${aws_iam_role.role.id}"
  policy = "${var.role_policy}"
}

resource "aws_lambda_function" "lambda" {
  filename         = "${data.archive_file.file.output_path}"
  source_code_hash = "${data.archive_file.file.output_sha}"
  function_name    = "${var.name}"
  role             = "${aws_iam_role.role.arn}"
  runtime          = "${var.runtime}"
  handler          = "${var.handler}"
  timeout          = "${var.timeout}"
  environment = {
    variables = "${var.variables}"
  }
}

resource "aws_lambda_permission" "permission" {
  function_name = "${aws_lambda_function.lambda.arn}"
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:${var.rest_api_id}/*/${aws_api_gateway_method.method.http_method}${var.resource_path}"
}

resource "aws_api_gateway_method" "method" {
  rest_api_id   = "${var.rest_api_id}"
  resource_id   = "${var.resource_id}"
  http_method   = "${var.http_method}"
  authorization = "${var.authorization}"
}

resource "aws_api_gateway_integration" "integration" {
  rest_api_id = "${var.rest_api_id}"
  resource_id = "${var.resource_id}"
  http_method = "${aws_api_gateway_method.method.http_method}"
  type        = "AWS"
  uri         = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.lambda.arn}/invocations"
  integration_http_method = "POST"
  request_templates = {
    "application/x-www-form-urlencoded" = "{ \"body\" : $input.json('$') }"
  }
}

resource "aws_api_gateway_model" "response_model" {
  rest_api_id  = "${var.rest_api_id}"
  name         = "${var.name}Response"
  content_type = "application/json"
  schema       = "${var.response_schema}"
}

resource "aws_api_gateway_method_response" "200" {
  rest_api_id = "${var.rest_api_id}"
  resource_id = "${var.resource_id}"
  http_method = "${aws_api_gateway_method.method.http_method}"
  status_code = "200"
  response_models = {
    "application/json" = "${aws_api_gateway_model.response_model.name}"
  }
}

resource "aws_api_gateway_integration_response" "generator_integration_response" {
  rest_api_id = "${var.rest_api_id}"
  resource_id = "${var.resource_id}"
  http_method = "${aws_api_gateway_method.method.http_method}"
  status_code = "${aws_api_gateway_method_response.200.status_code}"
  depends_on  = ["aws_api_gateway_integration.integration"]
}
