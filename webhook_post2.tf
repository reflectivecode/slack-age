resource "aws_api_gateway_resource" "webhook2" {
  rest_api_id = "${aws_api_gateway_rest_api.api.id}"
  parent_id = "${aws_api_gateway_rest_api.api.root_resource_id}"
  path_part = "webhook2"
}


module "webhook_post2" {
  source          = "./modules/api_method"
  name            = "${var.project_name}WebhookPost2"
  region          = "${var.region}"
  directory       = "webhook_post2"
  filename        = "build/webhook_post2.zip"
  runtime         = "nodejs4.3"
  handler         = "index.handler"
  timeout         = "3"
  http_method     = "POST"
  authorization   = "NONE"
  rest_api_id     = "${aws_api_gateway_rest_api.api.id}"
  resource_id     = "${aws_api_gateway_resource.webhook2.id}"
  resource_path   = "${aws_api_gateway_resource.webhook2.path}"
  has_role_policy = "0"
  role_policy     = ""
  variables = {
    APP_SLACK_TOKEN      = "3lKQu0uj69DduGKbBozznK53"
    APP_IMGFLIP_TEMPLATE = "86050822"
    APP_IMGFLIP_USER     = "${var.imgflip_user}"
    APP_IMGFLIP_PASS     = "${var.imgflip_pass}"
  }
}
