module "webhook_post" {
  source          = "./modules/api_method"
  name            = "${var.project_name}WebhookPost"
  region          = "${var.region}"
  directory       = "webhook_post"
  filename        = "build/webhook_post.zip"
  runtime         = "nodejs4.3"
  handler         = "index.handler"
  timeout         = "3"
  http_method     = "POST"
  authorization   = "NONE"
  rest_api_id     = "${aws_api_gateway_rest_api.api.id}"
  resource_id     = "${aws_api_gateway_resource.webhook.id}"
  resource_path   = "${aws_api_gateway_resource.webhook.path}"
  has_role_policy = "0"
  role_policy     = ""

  variables = {
    APP_SLACK_TOKEN      = "${var.slack_token}"
    APP_IMGFLIP_TEMPLATE = "${var.imgflip_template}"
    APP_IMGFLIP_USER     = "${var.imgflip_user}"
    APP_IMGFLIP_PASS     = "${var.imgflip_pass}"
  }
}
