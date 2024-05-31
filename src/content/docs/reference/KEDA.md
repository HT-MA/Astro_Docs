---
title: KEDA
description: How to use KEDA in Kubernetes
---

## Install k8s
Install k8s with easzlab
This time, we use AllinOne method to install k8s.

The installation method is as follows
```link
https://github.com/easzlab/kubeasz/blob/master/docs/setup/quickStart.md
``` 
## Create StorageClass
Local Path Provisioner
https://github.com/rancher/local-path-provisioner
```shell
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.24/deploy/local-path-storage.yaml
```
```shell
[root@master ~]# kubectl get sc
NAME         PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
local-path   rancher.io/local-path   Delete          WaitForFirstConsumer   false                  4d23h
[root@master ~]#
```
## Install helm
```shell
wget https://get.helm.sh/helm-v3.13.1-linux-amd64.tar.gz
tar -zxf helm-v3.13.1-linux-amd64.tar.gz
mv linux-amd64 /usr/local/helm
cp /usr/local/helm/helm /usr/bin/
helm --help 

```

## Install KEDA

```shell
helm repo add kedacore https://kedacore.github.io/charts
helm repo update
helm install keda kedacore/keda --namespace keda --create-namespace
```
:   !!! tip

        国内无法下载所需要的images,可以使用魔法下载后传到自己的dokcer hub上， 部署时替换掉

KEDA is a [Kubernetes](https://kubernetes.io/)-based Event Driven Autoscaler. With KEDA, you can drive the scaling of any container in Kubernetes based on the number of events needing to be processed.
**KEDA** is a single-purpose and lightweight component that can be added into any Kubernetes cluster. KEDA works alongside standard Kubernetes components like the [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) and can extend functionality without overwriting or duplication. With KEDA you can explicitly map the apps you want to use event-driven scale, with other apps continuing to function. This makes KEDA a flexible and safe option to run alongside any number of any other Kubernetes applications or frameworks.

KEDA channel 
Slack https://kubernetes.slack.com/archives/CKZJ36A5D

KEDA https://keda.sh/

KEDA | Scalers https://keda.sh/docs/2.12/scalers/

GitHub - kedacore/keda: https://github.com/kedacore/keda/tree/main

KEDA helm chart https://github.com/kedacore/charts

```shell
[root@master ~]# helm repo add kedacore https://kedacore.github.io/charts
"kedacore" has been added to your repositories
[root@master ~]# helm repo update
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "kedacore" chart repository
Update Complete. ⎈Happy Helming!⎈
[root@master ~]# helm install keda kedacore/keda --namespace keda --create-namespace
NAME: keda
LAST DEPLOYED: Fri Oct 13 14:45:37 2023
NAMESPACE: keda
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
:::^.     .::::^:     :::::::::::::::    .:::::::::.                   .^.
7???~   .^7????~.     7??????????????.   :?????????77!^.              .7?7.
7???~  ^7???7~.       ~!!!!!!!!!!!!!!.   :????!!!!7????7~.           .7???7.
7???~^7????~.                            :????:    :~7???7.         :7?????7.
7???7????!.           ::::::::::::.      :????:      .7???!        :7??77???7.
7????????7:           7???????????~      :????:       :????:      :???7?5????7.
7????!~????^          !77777777777^      :????:       :????:     ^???7?#P7????7.
7???~  ^????~                            :????:      :7???!     ^???7J#@J7?????7.
7???~   :7???!.                          :????:   .:~7???!.    ~???7Y&@#7777????7.
7???~    .7???7:      !!!!!!!!!!!!!!!    :????7!!77????7^     ~??775@@@GJJYJ?????7.
7???~     .!????^     7?????????????7.   :?????????7!~:      !????G@@@@@@@@5??????7:
::::.       :::::     :::::::::::::::    .::::::::..        .::::JGGGB@@@&7:::::::::
                                                                      ?@@#~
                                                                      P@B^
                                                                    :&G:
                                                                    !5.
                                                                    .Kubernetes Event-driven Autoscaling (KEDA) - Application autoscaling made simple.

Get started by deploying Scaled Objects to your cluster:
    - Information about Scaled Objects : https://keda.sh/docs/latest/concepts/
    - Samples: https://github.com/kedacore/samples

Get information about the deployed ScaledObjects:
  kubectl get scaledobject [--namespace <namespace>]

Get details about a deployed ScaledObject:
  kubectl describe scaledobject <scaled-object-name> [--namespace <namespace>]

Get information about the deployed ScaledObjects:
  kubectl get triggerauthentication [--namespace <namespace>]

Get details about a deployed ScaledObject:
  kubectl describe triggerauthentication <trigger-authentication-name> [--namespace <namespace>]

Get an overview of the Horizontal Pod Autoscalers (HPA) that KEDA is using behind the scenes:
  kubectl get hpa [--all-namespaces] [--namespace <namespace>]

Learn more about KEDA:
- Documentation: https://keda.sh/
- Support: https://keda.sh/support/
- File an issue: https://github.com/kedacore/keda/issues/new/choose
[root@master ~]#
```

## Example for ScaledObject
### Create nginx deployment
```shell
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "0.02" # ??CPU???0.5?
            memory: "5Mi" # ???????256Mi
          requests:
            cpu: "0.01" # ??CPU???0.2?
            memory: "2Mi" # ???????128Mi

---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: NodePort
```
### Create ScaledObject
```shell
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: nginx-mem-scaler
spec:
  advanced:
    horizontalPodAutoscalerConfig:
      behavior:
        scaleDown:
          policies:
          - type: Pods
            value: 1
            periodSeconds: 10
          stabilizationWindowSeconds: 0
  scaleTargetRef:
    name: nginx-deployment
  triggers:
    - type: cron
      metadata:
        timezone: Asia/Shanghai
        start: 55 13 * * *       
        end: 20 14 * * *         
        desiredReplicas: "6"
    - type: cron
      metadata:
        timezone: Asia/Shanghai 
        start: 30 14 * * *       
        end: 45 14 * * *         
        desiredReplicas: "3"
    - type: cpu
      metadata:
      # Required
       type: Utilization # Allowed types are 'Utilization' or 'AverageValue'
       value: "10"
  minReplicaCount: 1  # ?????
  maxReplicaCount: 10  # ?????


```
### Create ScaledObject annotate

```shell
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: nginx-mem-scaler  # ScaledObject 的名称
spec:
  advanced:
    horizontalPodAutoscalerConfig:
      behavior:
        scaleDown:
          policies:
          - type: Pods
            value: 1
            periodSeconds: 10  # 每 10 秒删除一个 Pod
          stabilizationWindowSeconds: 0  # 稳定窗口为 0 秒，即立即删除多余的 Pod
  scaleTargetRef:
    name: nginx-deployment  # 目标 Deployment 的名称
  triggers:
    - type: cron
      metadata:
        timezone: Asia/Shanghai
        start: 55 13 * * *      # 每天 13:55 开始触发
        end: 20 14 * * *        # 每天 14:20 结束触发
        desiredReplicas: "6"    # 触发时期望的副本数
    - type: cron
      metadata:
        timezone: Asia/Shanghai
        start: 30 14 * * *      # 每天 14:30 开始触发
        end: 45 14 * * *        # 每天 14:45 结束触发
        desiredReplicas: "3"    # 触发时期望的副本数
    - type: cpu
      metadata:
        # Required
        type: Utilization     # 触发器类型，这里是 CPU 利用率
        value: "10"           # 触发的 CPU 利用率阈值
  minReplicaCount: 1          # 最小副本数
  maxReplicaCount: 10         # 最大副本数
```
### The first trigger
Expect 6 pods during the first cron trigger
```shell
[root@matser ~]# kubectl get so
NAME               SCALETARGETKIND      SCALETARGETNAME    MIN   MAX   TRIGGERS   AUTHENTICATION   READY   ACTIVE   FALLBACK   PAUSED    AGE
nginx-mem-scaler   apps/v1.Deployment   nginx-deployment   1     10    cron                        True    True     False      Unknown   156m

[root@matser ~]# kubectl get hpa
NAME                        REFERENCE                     TARGETS                               MINPODS   MAXPODS   REPLICAS   AGE
keda-hpa-nginx-mem-scaler   Deployment/nginx-deployment   1/1 (avg), 167m/1 (avg) + 1 more...   1         10        6          156m

[root@matser ~]# k top pods
NAME                                                            CPU(cores)   MEMORY(bytes)
alertmanager-my-release-kube-prometheus-alertmanager-0          1m           37Mi
my-release-kube-prometheus-blackbox-exporter-5fc67b68b4-6476q   1m           11Mi
my-release-kube-prometheus-operator-84d54d47d7-m9rlf            2m           37Mi
my-release-kube-state-metrics-6fd8b8866b-855kl                  1m           22Mi
my-release-node-exporter-q6rpr                                  1m           14Mi
nginx-deployment-765dffb586-cspzn                               3m           2Mi
nginx-deployment-765dffb586-k4grs                               3m           2Mi
nginx-deployment-765dffb586-m5k8m                               3m           2Mi
nginx-deployment-765dffb586-s8pgj                               3m           2Mi
nginx-deployment-765dffb586-srzmk                               3m           2Mi
nginx-deployment-765dffb586-v5s8t                               3m           6Mi
prometheus-my-release-kube-prometheus-prometheus-0              5m           209Mi
volume-test                                                     0m           2Mi
[root@matser ~]# k top pods

```

### Add cpu scaler to the first cron scaler

When creating a job request website, the CPU utilization increases and scaledobject is triggered.
```shell
apiVersion: batch/v1
kind: Job
metadata:
  name: trigger-job
  namespace: default
spec:
  template:
    spec:
      containers:
      - image: busybox
        name: test
        command: ["/bin/sh"]
        args: ["-c", "for i in $(seq 1 4000);do wget -q -O- 10.68.151.29;sleep 0.01;done"]
      restartPolicy: Never
  activeDeadlineSeconds: 400
  backoffLimit: 3

  #该作业配置的目标是创建一个运行指定命令的容器，该命令会循环执行 400 次请求，每次请求 10.68.151.29 网站，并在请求之间休眠 0.01 秒。作业将在 400 秒后终止，并且在容器失败时最多重试 3 次。
```

```shell
[root@matser ~]# kubectl get hpa
NAME                        REFERENCE                     TARGETS                                  MINPODS   MAXPODS   REPLICAS   AGE
keda-hpa-nginx-mem-scaler   Deployment/nginx-deployment   600m/1 (avg), 100m/1 (avg) + 1 more...   1         10        10         157m

```

```shell
[root@matser ~]# k get pods
NAME                                                            READY   STATUS      RESTARTS        AGE
alertmanager-my-release-kube-prometheus-alertmanager-0          2/2     Running     2 (3h12m ago)   5d23h
my-release-kube-prometheus-blackbox-exporter-5fc67b68b4-6476q   1/1     Running     1 (3h12m ago)   5d23h
my-release-kube-prometheus-operator-84d54d47d7-m9rlf            1/1     Running     1 (3h12m ago)   5d23h
my-release-kube-state-metrics-6fd8b8866b-855kl                  1/1     Running     1 (3h12m ago)   5d23h
my-release-node-exporter-q6rpr                                  1/1     Running     1 (3h12m ago)   5d23h
nginx-deployment-765dffb586-2hj6g                               1/1     Running     0               59s
nginx-deployment-765dffb586-cspzn                               1/1     Running     0               9m45s
nginx-deployment-765dffb586-f7d5j                               1/1     Running     0               59s
nginx-deployment-765dffb586-jzczb                               1/1     Running     0               59s
nginx-deployment-765dffb586-k4grs                               1/1     Running     0               10m
nginx-deployment-765dffb586-m5k8m                               1/1     Running     0               10m
nginx-deployment-765dffb586-p4fgw                               1/1     Running     0               59s
nginx-deployment-765dffb586-s8pgj                               1/1     Running     0               10m
nginx-deployment-765dffb586-srzmk                               1/1     Running     0               10m
nginx-deployment-765dffb586-v5s8t                               1/1     Running     1 (3h12m ago)   3d20h
prometheus-my-release-kube-prometheus-prometheus-0              2/2     Running     2 (3h12m ago)   5d23h
trigger-job-q7s6q                                               0/1     Completed   0               99s
volume-test                                                     1/1     Running     1 (3h12m ago)   6d2h
```

```shell
Conditions:
  Type            Status  Reason              Message
  ----            ------  ------              -------
  AbleToScale     True    ReadyForNewScale    recommended size matches current size
  ScalingActive   True    ValidMetricFound    the HPA was able to successfully calculate a replica count from external metric s0-cron-Asia-Shanghai-5513xxx-2014xxx(&LabelSelector{MatchLabels:map[string]string{scaledobject.keda.sh/name: nginx-mem-scaler,},MatchExpressions:[]LabelSelectorRequirement{},})
  ScalingLimited  False   DesiredWithinRange  the desired count is within the acceptable range
Events:
  Type    Reason             Age                  From                       Message
  ----    ------             ----                 ----                       -------
  Normal  SuccessfulRescale  47m                  horizontal-pod-autoscaler  New size: 2; reason: cpu resource utilization (percentage of request) above target
  Normal  SuccessfulRescale  40m                  horizontal-pod-autoscaler  New size: 5; reason: cpu resource utilization (percentage of request) above target
  Normal  SuccessfulRescale  40m                  horizontal-pod-autoscaler  New size: 8; reason: cpu resource utilization (percentage of request) above target
  Normal  SuccessfulRescale  39m                  horizontal-pod-autoscaler  New size: 6; reason: All metrics below target
  Normal  SuccessfulRescale  17m                  horizontal-pod-autoscaler  New size: 9; reason: All metrics below target
  Normal  SuccessfulRescale  16m                  horizontal-pod-autoscaler  New size: 8; reason: All metrics below target
  Normal  SuccessfulRescale  16m (x3 over 39m)    horizontal-pod-autoscaler  New size: 7; reason: All metrics below target
  Normal  SuccessfulRescale  16m (x14 over 38m)   horizontal-pod-autoscaler  (combined from similar events): New size: 6; reason: All metrics below target
  Normal  SuccessfulRescale  2m28s (x2 over 39m)  horizontal-pod-autoscaler  New size: 5; reason: All metrics below target
  Normal  SuccessfulRescale  2m13s (x3 over 39m)  horizontal-pod-autoscaler  New size: 4; reason: All metrics below target
  Normal  SuccessfulRescale  118s (x2 over 38m)   horizontal-pod-autoscaler  New size: 3; reason: All metrics below target
  Normal  SuccessfulRescale  102s                 horizontal-pod-autoscaler  New size: 2; reason: All metrics below target
  Normal  SuccessfulRescale  87s (x3 over 46m)    horizontal-pod-autoscaler  New size: 1; reason: All metrics below target

```

```shell
[root@matser ~]# kubectl get hpa
NAME                        REFERENCE                     TARGETS                               MINPODS   MAXPODS   REPLICAS   AGE
keda-hpa-nginx-mem-scaler   Deployment/nginx-deployment   1/1 (avg), 167m/1 (avg) + 1 more...   1         10        6          160m

```
### When not triggered

```shell
[root@matser ~]# kubectl get hpa
NAME                        REFERENCE                     TARGETS                                  MINPODS   MAXPODS   REPLICAS   AGE
keda-hpa-nginx-mem-scaler   Deployment/nginx-deployment   500m/1 (avg), 500m/1 (avg) + 1 more...   1         10        2          147m

```
### The second trigger

```shell
#The second trigger is executing.
[root@master ~]# kubectl get scaledobject
NAME               SCALETARGETKIND      SCALETARGETNAME    MIN   MAX   TRIGGERS   AUTHENTICATION   READY   ACTIVE   FALLBACK   PAUSED    AGE
nginx-mem-scaler   apps/v1.Deployment   nginx-deployment   1     10    cron                        True    True     False      Unknown   25h

#HPA status
[root@master ~]# kubectl get hpa
NAME                        REFERENCE                     TARGETS                   MINPODS   MAXPODS   REPLICAS   AGE
keda-hpa-nginx-mem-scaler   Deployment/nginx-[root@matser ~]# kubectl get pods
NAME                                                            READY   STATUS      RESTARTS        AGE
alertmanager-my-release-kube-prometheus-alertmanager-0          2/2     Running     2 (3h39m ago)   5d23h
my-release-kube-prometheus-blackbox-exporter-5fc67b68b4-6476q   1/1     Running     1 (3h39m ago)   5d23h
my-release-kube-prometheus-operator-84d54d47d7-m9rlf            1/1     Running     1 (3h39m ago)   5d23h
my-release-kube-state-metrics-6fd8b8866b-855kl                  1/1     Running     1 (3h39m ago)   5d23h
my-release-node-exporter-q6rpr                                  1/1     Running     1 (3h39m ago)   5d23h
nginx-deployment-765dffb586-5qn55                               1/1     Running     0               2m1s
nginx-deployment-765dffb586-ctm5j                               1/1     Running     0               2m1s
nginx-deployment-765dffb586-v5s8t                               1/1     Running     1 (3h39m ago)   3d21h
prometheus-my-release-kube-prometheus-prometheus-0              2/2     Running     2 (3h39m ago)   5d23h
trigger-job-q7s6q                                               0/1     Completed   0               28m
volume-test                                                     1/1     Running     1 (3h39m ago)   6d3h
[root@matser ~]# k get hpa
NAME                        REFERENCE                     TARGETS                               MINPODS   MAXPODS   REPLICAS   AGE
keda-hpa-nginx-mem-scaler   Deployment/nginx-deployment   334m/1 (avg), 1/1 (avg) + 1 more...   1         10        3          3h5m
[root@matser ~]# k get ScaledObject
NAME               SCALETARGETKIND      SCALETARGETNAME    MIN   MAX   TRIGGERS   AUTHENTICATION   READY   ACTIVE   FALLBACK   PAUSED    AGE
nginx-mem-scaler   apps/v1.Deployment   nginx-deployment   1     10    cron                        True    True     False      Unknown   3h5m
[root@matser ~]#


```


### 


