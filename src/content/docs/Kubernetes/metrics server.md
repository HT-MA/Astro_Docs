---
title: metrics-server
description: metrics-server
---
## repo
>https://github.com/kubernetes-sigs/metrics-server

## Install
```shell
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/high-availability-1.21+.yaml
```
## view pods
```shell
root@node1:/home/ubuntu/my_yaml# kubectl get pods -n kube-system
NAME                                          READY   STATUS    RESTARTS       AGE
calico-kube-controllers-684bcfdc59-7g2zt      1/1     Running   1 (4d1h ago)   4d1h
calico-node-97c6h                             1/1     Running   0              4d1h
calico-node-dtd4w                             1/1     Running   0              4d1h
calico-node-tp82t                             1/1     Running   0              4d1h
coredns-8474476ff8-24xl4                      1/1     Running   0              4d1h
coredns-8474476ff8-z7fqk                      1/1     Running   0              4d1h
dns-autoscaler-5c7584d597-9hzwl               1/1     Running   0              4d1h
haproxy-node3                                 1/1     Running   0              4d1h
kube-apiserver-node1                          1/1     Running   0              4d1h
kube-apiserver-node2                          1/1     Running   0              4d1h
kube-controller-manager-node1                 1/1     Running   1              4d1h
kube-controller-manager-node2                 1/1     Running   1              4d1h
kube-proxy-25kkh                              1/1     Running   0              4d1h
kube-proxy-4t5wl                              1/1     Running   0              4d1h
kube-proxy-vrxp9                              1/1     Running   0              4d1h
kube-scheduler-node1                          1/1     Running   1              4d1h
kube-scheduler-node2                          1/1     Running   1              4d1h
kubernetes-dashboard-548847967d-stxkf         1/1     Running   0              4d1h
kubernetes-metrics-scraper-6d49f96c97-tvl8h   1/1     Running   0              4d1h
metrics-server-76d9d456c9-pk4vs               0/1     Running   0              25m
metrics-server-76d9d456c9-z98gx               0/1     Running   0              25m
nodelocaldns-jlrdr                            1/1     Running   0              4d1h
nodelocaldns-nb547                            1/1     Running   0              4d1h
nodelocaldns-q2stc                            1/1     Running   0              4d1h
```
## view issue
```shell
E1225 08:49:35.584114       1 scraper.go:140] "Failed to scrape node" err="Get \"https://10.224.122.16:10250/metrics/resource\": x509: cannot validate certificate for 10.224.122.16 because it doesn't contain any IP SANs" node="node3"
I1225 08:49:39.089416       1 server.go:187] "Failed probe" probe="metric-storage-ready" err="no metrics to serve"
I1225 08:49:49.091320       1 server.go:187] "Failed probe" probe="metric-storage-ready" err="no metrics to serve"
E1225 08:49:50.565497       1 scraper.go:140] "Failed to scrape node" err="Get \"https://10.224.122.26:10250/metrics/resource\": x509: cannot validate certificate for 10.224.122.26 because it doesn't contain any IP SANs" node="node2"
E1225 08:49:50.566420       1 scraper.go:140] "Failed to scrape node" err="Get \"https://10.224.122.16:10250/metrics/resource\": x509: cannot validate certificate for 10.224.122.16 because it doesn't contain any IP SANs" node="node3"
E1225 08:49:50.567421       1 scraper.go:140] "Failed to scrape node" err="Get \"https://10.224.122.36:10250/metrics/resource\": x509: cannot validate certificate for 10.224.122.36 because it doesn't contain any IP SANs" node="node1"
I1225 08:49:59.091596       1 server.go:187] "Failed probe" probe="metric-storage-ready" err="no metrics to serve"
```
### Add args 
```yaml
- --kubelet-insecure-tls
```
```yaml
containers:
      - args:
        - --cert-dir=/tmp
        - --secure-port=4443
        - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
        - --kubelet-use-node-status-port
        - --metric-resolution=15s
        - --kubelet-insecure-tls
```
## view pods again
```shell
metrics-server-b89f645c8-8vzbw                1/1     Running   0              5m17s
metrics-server-b89f645c8-mxc6b                1/1     Running   0              5m17s

```
```shell
root@node1:/home/ubuntu/my_yaml# kubectl top nodes
NAME    CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
node1   262m         6%     3141Mi          20%
node2   240m         6%     3172Mi          20%
node3   233m         5%     2833Mi          18%
root@node1:/home/ubuntu/my_yaml#

```