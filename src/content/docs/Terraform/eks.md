---
title: EKS
description: EKS
---
下面是一个简单的 Terraform 示例，用于创建一个 AWS EKS 集群，其中包括三个主节点（masters）和 20 个工作节点（nodes）：

```hcl
# 定义提供商（provider）和版本
provider "aws" {
  region = "us-west-2"  # 指定 AWS 区域
}

# 定义 EKS 集群
resource "aws_eks_cluster" "example_cluster" {
  name     = "example-cluster"  # 集群名称
  role_arn = aws_iam_role.example_role.arn  # IAM 角色的 ARN

  # 定义 VPC 配置
  vpc_config {
    subnet_ids = ["subnet-xxxxxxxx", "subnet-yyyyyyyy", "subnet-zzzzzzzz"]  # 替换为你的子网 ID
    security_group_ids = ["sg-xxxxxxxx"]  # 替换为你的安全组 ID
  }

  # 定义 Kubernetes 配置
  kubernetes_network_config {
    service_ipv4_cidr = "10.0.0.0/16"  # 替换为你的服务 IP 地址段
    pod_ipv4_cidr = "192.168.0.0/16"  # 替换为你的 Pod IP 地址段
    cluster_dns_ip = "10.0.0.10"  # 替换为你的 DNS 服务 IP
  }
}

# 定义 IAM 角色
resource "aws_iam_role" "example_role" {
  name = "example-role"  # 角色名称
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "eks.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

# 定义 IAM 角色策略
resource "aws_iam_policy_attachment" "example_policy_attachment" {
  name = "example-policy-attachment"  # 策略附加名称
  roles = [aws_iam_role.example_role.name]  # 角色名称
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"  # EKS 集群策略 ARN
}

# 定义 EKS 节点组
resource "aws_eks_node_group" "example_nodes" {
  cluster_name    = aws_eks_cluster.example_cluster.name  # 集群名称
  node_group_name = "example-nodes"  # 节点组名称
  node_role_arn   = aws_iam_role.example_role.arn  # 节点角色 ARN

  # 定义节点配置
  node_config {
    instance_type = "t2.medium"  # 实例类型
    ami_type = "AL2_x86_64"  # AMI 类型
    disk_size = 20  # 磁盘大小
    ssh_key_name = "example-key"  # SSH 密钥名称
  }

  scaling_config {
    desired_size = 20  # 期望节点数量
    min_size     = 20  # 最小节点数量
    max_size     = 20  # 最大节点数量
  }

  remote_access {
    ec2_ssh_key = "example-key"  # SSH 密钥名称
  }
}
```

在这个示例中，你需要做以下替换：

- `region`：AWS 区域。
- `subnet_ids`：子网 ID，至少需要提供三个子网，以便 EKS 在不同的可用区中部署主节点。
- `security_group_ids`：安全组 ID。
- `service_ipv4_cidr`、`pod_ipv4_cidr`、`cluster_dns_ip`：Kubernetes 网络配置信息。
- `instance_type`：工作节点实例类型。
- `ami_type`：工作节点使用的 AMI 类型。
- `disk_size`：工作节点磁盘大小。
- `ssh_key_name`、`ec2_ssh_key`：SSH 密钥名称。

此外，你还需要根据需要调整集群和节点组的配置，比如调整节点数量、实例类型等。这只是一个基本示例，你可以根据自己的需求和实际情况进行更复杂的配置。