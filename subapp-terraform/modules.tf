module "s3" {
  source = "./s3"

  project        = var.PROJECT
  fe_urls        = var.FE_URLS
  public_buckets = var.PUBLIC_BUCKETS
}
