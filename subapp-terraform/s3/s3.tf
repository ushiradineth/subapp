resource "aws_s3_bucket" "public_buckets" {
  count  = length(var.public_buckets)
  bucket = "${var.project}-${element(var.public_buckets, count.index)}"

  tags = {
    Name = "${var.project}-${element(var.public_buckets, count.index)}"
  }
}

resource "aws_s3_bucket_ownership_controls" "public_buckets" {
  count  = length(var.public_buckets)
  bucket = element(aws_s3_bucket.public_buckets.*.id, count.index)

  rule {
    object_ownership = "ObjectWriter"
  }
}

resource "aws_s3_bucket_public_access_block" "public_access_block" {
  count  = length(var.public_buckets)
  bucket = element(aws_s3_bucket.public_buckets.*.id, count.index)

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_cors_configuration" "public_buckets" {
  count = length(var.public_buckets)

  bucket = element(aws_s3_bucket.public_buckets.*.id, count.index)

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["HEAD", "GET", "PUT", "POST"]
    allowed_origins = var.fe_urls
    expose_headers  = []
  }
}

resource "aws_s3_bucket_policy" "public_bucket_policy" {
  count = length(var.public_buckets)

  bucket = element(aws_s3_bucket.public_buckets.*.id, count.index)
  policy = <<EOF
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicRead",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject",
                "s3:GetObjectVersion"
            ],
            "Resource": "arn:aws:s3:::${element(aws_s3_bucket.public_buckets.*.bucket, count.index)}/*"
        }
    ]
}
EOF
}
