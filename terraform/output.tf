output "cluster_name" {
    description = "EKS cluster name"
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
    description = "EKS cluster endpoint"
  value = module.eks.cluster_endpoint
}


output "vpc_id" {
    description = "VPC ID where the EKS cluster is deployed."
  value = module.vpc.vpc_id
}
output "cluster_security_group_id" {
  description = "Security group ids attached to the cluster control plane."
  value       = module.eks.cluster_security_group_id
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}

output "oidc_provider_arn" {
  value = module.eks.oidc_provider_arn
}

