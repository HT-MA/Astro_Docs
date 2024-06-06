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
