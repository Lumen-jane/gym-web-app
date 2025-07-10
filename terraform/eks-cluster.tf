module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "20.37.1"

  cluster_name    = var.cluster_name
  cluster_version = "1.31"
  subnet_ids      = module.vpc.private_subnets
  vpc_id          = module.vpc.vpc_id

  tags = {
    cluster = "pre-production"
  }

  enable_cluster_creator_admin_permissions = true


  cluster_security_group_id = module.eks_security_group.security_group_id

  eks_managed_node_groups = {
    default = {
      desired_capacity = 2
      max_capacity     = 3
      min_capacity     = 1

      instance_types = [var.node_instance_type]
    }
  }
}

