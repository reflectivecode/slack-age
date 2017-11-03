variable "aws_profile" {
  type    = "string"
  default = "aws"
}

variable "project_name" {
  type    = "string"
  default = "SlackApp"
}

variable "region" {
  type    = "string"
  default = "us-east-1"
}

variable "slack_token" {
  type = "string"
}

variable "imgflip_template" {
  type    = "string"
  default = "58512784"
}

variable "imgflip_user" {
  type = "string"
}

variable "imgflip_pass" {
  type = "string"
}
