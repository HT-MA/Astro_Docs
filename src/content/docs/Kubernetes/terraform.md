---
title: terraform 
description: ...
---

## Overview

## Install terraform
- centos
```shell
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo
sudo yum -y install terraform
```
- windows
```powershell
scoop install terraform
```
- ubuntu
```shell
sudo apt-get update && sudo apt-get install -y gnupg software-properties-common curl
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform
root@node1:/home/ubuntu# terraform version
Terraform v1.6.6
on linux_amd64
```
## Docker
- create linux-command
- create reference
```shell
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

# create Linux-command container
resource "docker_image" "linux_command" {
  name         = "wcjiang/linux-command"
  keep_locally = false
}

resource "docker_container" "linux_command_container" {
  image = docker_image.linux_command.image_id
  name  = "linux_command_container"

  ports {
    internal = 3000
    external = 9665
  }
}

# create Reference container
resource "docker_image" "reference" {
  name         = "wcjiang/reference"
  keep_locally = false
}

resource "docker_container" "reference_container" {
  image = docker_image.reference.image_id
  name  = "reference_container"

  ports {
    internal = 3000
    external = 9667
  }
}


```

## Helm
create keda chart
```
provider "kubernetes" {
  config_path = "~/.kube/config"  # 指定 kubeconfig 文件路径
}

resource "kubernetes_namespace" "keda" {
  metadata {
    name = "keda"
  }
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"  # 指定 kubeconfig 文件路径
  }
}

resource "helm_release" "keda" {
  name       = "keda"
  repository = "https://kedacore.github.io/charts"
  chart      = "keda"
  version    = "2.8.0"
  namespace  = "keda"
}
```

## Kind
The Kind provider is used to interact with Kubernetes IN Docker (***[kind]***) to provision local Kubernetes clusters.
https://registry.terraform.io/providers/tehcyx/kind/latest/docs

[kind]: https://registry.terraform.io/providers/tehcyx/kind/latest/docs

- build kind cluster
```hcl
terraform {
  required_providers {
    kind = {
      source = "tehcyx/kind"
      version = "0.4.0"
    }
  }
}

provider "kind" {
  # Configuration options
}


resource "kind_cluster" "default" {
    name           = "test-cluster"
    wait_for_ready = true

  kind_config {
      kind        = "Cluster"
      api_version = "kind.x-k8s.io/v1alpha4"

      node {
          role = "control-plane"

          kubeadm_config_patches = [
              "kind: InitConfiguration\nnodeRegistration:\n  kubeletExtraArgs:\n    node-labels: \"ingress-ready=true\"\n"
          ]

          extra_port_mappings {
              container_port = 80
              host_port      = 80
          }
          extra_port_mappings {
              container_port = 443
              host_port      = 443
          }
      }

      node {
          role = "worker"
      }
  }
}
```
- terraform plan
```shell
root@docker-test-1:/home/ubuntu/terraform/kind# terraform plan

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # kind_cluster.default will be created
  + resource "kind_cluster" "default" {
      + client_certificate     = (known after apply)
      + client_key             = (known after apply)
      + cluster_ca_certificate = (known after apply)
      + completed              = (known after apply)
      + endpoint               = (known after apply)
      + id                     = (known after apply)
      + kubeconfig             = (known after apply)
      + kubeconfig_path        = (known after apply)
      + name                   = "test-cluster"
      + node_image             = (known after apply)
      + wait_for_ready         = true

      + kind_config {
          + api_version = "kind.x-k8s.io/v1alpha4"
          + kind        = "Cluster"

          + node {
              + kubeadm_config_patches = [
                  + <<-EOT
                        kind: InitConfiguration
                        nodeRegistration:
                          kubeletExtraArgs:
                            node-labels: "ingress-ready=true"
                    EOT,
                ]
              + role                   = "control-plane"

              + extra_port_mappings {
                  + container_port = 80
                  + host_port      = 80
                }
              + extra_port_mappings {
                  + container_port = 443
                  + host_port      = 443
                }
            }
          + node {
              + role = "worker"
            }
        }
    }

Plan: 1 to add, 0 to change, 0 to destroy.

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

Note: You didn't use the -out option to save this plan, so Terraform can't guarantee to take exactly these actions if you run "terraform apply" now.

```
- terraform apply
```shell
root@docker-test-1:/home/ubuntu/terraform/kind# terraform apply -auto-approve

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # kind_cluster.default will be created
  + resource "kind_cluster" "default" {
      + client_certificate     = (known after apply)
      + client_key             = (known after apply)
      + cluster_ca_certificate = (known after apply)
      + completed              = (known after apply)
      + endpoint               = (known after apply)
      + id                     = (known after apply)
      + kubeconfig             = (known after apply)
      + kubeconfig_path        = (known after apply)
      + name                   = "test-cluster"
      + node_image             = (known after apply)
      + wait_for_ready         = true

      + kind_config {
          + api_version = "kind.x-k8s.io/v1alpha4"
          + kind        = "Cluster"

          + node {
              + kubeadm_config_patches = [
                  + <<-EOT
                        kind: InitConfiguration
                        nodeRegistration:
                          kubeletExtraArgs:
                            node-labels: "ingress-ready=true"
                    EOT,
                ]
              + role                   = "control-plane"

              + extra_port_mappings {
                  + container_port = 80
                  + host_port      = 80
                }
              + extra_port_mappings {
                  + container_port = 443
                  + host_port      = 443
                }
            }
          + node {
              + role = "worker"
            }
        }
    }

Plan: 1 to add, 0 to change, 0 to destroy.
kind_cluster.default: Creating...
kind_cluster.default: Still creating... [10s elapsed]
kind_cluster.default: Still creating... [20s elapsed]
kind_cluster.default: Still creating... [30s elapsed]
kind_cluster.default: Still creating... [40s elapsed]
kind_cluster.default: Still creating... [50s elapsed]
kind_cluster.default: Creation complete after 58s [id=test-cluster-]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```
- confirm
```shell
# view docker containers
root@docker-test-1:/home/ubuntu/terraform/kind# docker ps
CONTAINER ID   IMAGE                   COMMAND                  CREATED          STATUS                 PORTS                                                                                                                NAMES
e8bb939addc4   kindest/node:v1.29.2    "/usr/local/bin/entr…"   51 seconds ago   Up 48 seconds                                                                                                                               test-cluster-worker
98c78f99a9ea   kindest/node:v1.29.2    "/usr/local/bin/entr…"   51 seconds ago   Up 48 seconds          0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp, 127.0.0.1:34683->6443/tcp                                                  test-cluster-control-plane

# install kubectl and get nodes/pods 
root@docker-test-1:/home/ubuntu/terraform/kind# sudo curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   138  100   138    0     0    297      0 --:--:-- --:--:-- --:--:--   296
100 49.0M  100 49.0M    0     0  24.4M      0  0:00:02  0:00:02 --:--:-- 50.8M
root@docker-test-1:/home/ubuntu/terraform/kind# sudo chmod +x kubectl
root@docker-test-1:/home/ubuntu/terraform/kind# sudo mv kubectl /usr/local/bin/
root@docker-test-1:/home/ubuntu/terraform/kind# kubectl get nodes
NAME                         STATUS   ROLES           AGE     VERSION
test-cluster-control-plane   Ready    control-plane   6m56s   v1.29.2
test-cluster-worker          Ready    <none>          6m37s   v1.29.2
root@docker-test-1:/home/ubuntu/terraform/kind# kubectl get pods -A
NAMESPACE            NAME                                                 READY   STATUS    RESTARTS   AGE
kube-system          coredns-76f75df574-52rrh                             1/1     Running   0          6m49s
kube-system          coredns-76f75df574-nx4f2                             1/1     Running   0          6m49s
kube-system          etcd-test-cluster-control-plane                      1/1     Running   0          7m2s
kube-system          kindnet-6hqwm                                        1/1     Running   0          6m47s
kube-system          kindnet-zclww                                        1/1     Running   0          6m49s
kube-system          kube-apiserver-test-cluster-control-plane            1/1     Running   0          7m4s
kube-system          kube-controller-manager-test-cluster-control-plane   1/1     Running   0          7m2s
kube-system          kube-proxy-ffhqp                                     1/1     Running   0          6m47s
kube-system          kube-proxy-w55wh                                     1/1     Running   0          6m49s
kube-system          kube-scheduler-test-cluster-control-plane            1/1     Running   0          7m2s
local-path-storage   local-path-provisioner-7577fdbbfb-ppj2q              1/1     Running   0          6m49s

# verify kube config

root@docker-test-1:/home/ubuntu/terraform/kind# ls -l -a ~
total 88
drwx------ 11 root root  4096 May  9 08:32 .
drwxr-xr-x 20 root root  4096 May  5 09:05 ..
drwxr-xr-x  2 root root  4096 May  8 09:42 .aws
-rw-------  1 root root 12986 May  9 07:40 .bash_history
-rw-r--r--  1 root root  3106 Dec  5  2019 .bashrc
drwxr-xr-x  6 root root  4096 May  9 02:21 .cache
drwx------  3 root root  4096 May  8 09:48 .config
drwxr-xr-x  3 root root  4096 May  9 08:39 .kube
drwxr-xr-x  4 root root  4096 May  8 09:48 .npm
-rw-r--r--  1 root root   161 Dec  5  2019 .profile
drwx------  2 root root  4096 Apr 26 00:13 .ssh
drwxr-xr-x  2 root root  4096 May  8 08:37 .terraform.d
-rw-------  1 root root 13830 May  9 08:30 .viminfo
-rw-r--r--  1 root root   226 May  8 08:35 .wget-hsts
drwxr-xr-x 10 root root  4096 May  9 02:24 sample-serverless-image-resizer-s3-lambda
drwxr-xr-x  3 root root  4096 Apr 26 00:13 snap

```

## Alicloud
- create a ecs
```
provider "alicloud" {
  # Alicloud AK
  access_key = "access_key"
  secret_key = "secret_key"
}

resource "alicloud_vpc" "vpc" {
  vpc_name   = "tf_test_foo"
  cidr_block = "172.16.0.0/12"
}

resource "alicloud_vswitch" "vsw" {
  vpc_id     = alicloud_vpc.vpc.id
  cidr_block = "172.16.0.0/21"
  zone_id    = "cn-beijing-b"
}

resource "alicloud_security_group" "default" {
  name   = "default"
  vpc_id = alicloud_vpc.vpc.id
}

resource "alicloud_instance" "example" {
  # ECS instance
  image_id          = "centos_7_9_uefi_x64_20G_alibase_20230816.vhd"
  instance_type    = "ecs.n2.small"  
  availability_zone = "cn-beijing-b"
  security_groups   = alicloud_security_group.default.*.id
  
  internet_max_bandwidth_out  = 1
  host_name                   = "master"
  internet_charge_type        = "PayByTraffic"

  vswitch_id                 = alicloud_vswitch.vsw.id
  password = "xxxxx"  # password
  # init shell
  user_data = <<-EOF
              #!/bin/bash
              cd /root/
              wget https://github.com/easzlab/kubeasz/releases/download/3.5.0/ezdown
              chmod +x ./ezdown
              ./ezdown -D 
              ./ezdown -S 
              docker exec -it kubeasz ezctl start-aio > docker.log 
              source ~/.bashrc
              echo "install complete" > intsall_status.txt
              EOF
}

  
resource "alicloud_security_group_rule" "allow_all_tcp" {
  type              = "ingress"
  ip_protocol       = "tcp"
  nic_type          = "intranet"
  policy            = "accept"
  port_range        = "1/65535"
  priority          = 1
  security_group_id = alicloud_security_group.default.id
  cidr_ip           = "0.0.0.0/0"
}
  

output "instance_id" {
  value = alicloud_instance.example.id
}

output "instance_ip" {
  value = alicloud_instance.example.public_ip
}


```

