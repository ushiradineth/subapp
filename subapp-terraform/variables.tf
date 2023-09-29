variable "PROJECT" {
  type = string
}

variable "REGION" {
  type    = string
  default = "ap-southeast-1"
}

variable "AWS_ACCESS_KEY_ID" {
  type      = string
  sensitive = true
}

variable "AWS_SECRET_ACCESS_KEY" {
  type      = string
  sensitive = true
}

variable "FE_URLS" {
  type = list(string)
}

variable "PUBLIC_BUCKETS" {
  type = list(string)
}
