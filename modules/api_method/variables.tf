variable "name" {
  type = "string"
}

variable "region" {
  type = "string"
}

variable "directory" {
  type = "string"
}

variable "filename" {
  type = "string"
}

variable "runtime" {
  type = "string"
  default = "nodejs4.3"
}

variable "handler" {
  type = "string"
  default = "index.handler"
}

variable "timeout" {
  type = "string"
  default = "3"
}

variable "http_method" {
  type = "string"
}

variable "authorization" {
  type = "string"
}

variable "rest_api_id" {
  type = "string"
}

variable "resource_id" {
  type = "string"
}

variable "resource_path" {
  type = "string"
}

variable "response_schema" {
  type = "string"
  default = "{ \"type\": \"object\" }"
}

variable "has_role_policy" {
  type    = "string"
  default = "0"
}

variable "role_policy" {
  type    = "string"
  default = ""
}

variable "variables" {
  type    = "map"
  default = {
    dummy = true
  }
}
