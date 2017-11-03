resource "aws_api_gateway_rest_api" "api" {
  name        = "${var.project_name}"
  description = "API for incoming Slack webhooks"
}

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = "${aws_api_gateway_rest_api.api.id}"
  stage_name  = "test"
}
