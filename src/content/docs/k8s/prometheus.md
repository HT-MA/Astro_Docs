---
title: Prometheus
description: 。。。
---
##  Install prometheus+grafana in k8s 1.22
### repo
repo: https://github.com/prometheus-operator/kube-prometheus/tree/main

----

### Download package release-0.10
https://github.com/prometheus-operator/kube-prometheus/tree/release-0.10

### Install 
```shell
# Create the namespace and CRDs, and then wait for them to be available before creating the remaining resources
kubectl apply --server-side -f manifests/setup
until kubectl get servicemonitors --all-namespaces ; do date; sleep 1; echo ""; done
kubectl apply -f manifests/
```

### View installation status
```shell
root@node1:/home/ubuntu/kube-prometheus-release-0.10# kubectl get pods -n monitoring
NAME                                   READY   STATUS    RESTARTS   AGE
alertmanager-main-0                    2/2     Running   0          2m30s
alertmanager-main-1                    2/2     Running   0          2m30s
alertmanager-main-2                    2/2     Running   0          2m30s
blackbox-exporter-6798fb5bb4-ql5bq     3/3     Running   0          3m28s
grafana-78d8cfccff-w8h7p               1/1     Running   0          3m28s
kube-state-metrics-5fcb7d6fcb-99nx9    3/3     Running   0          3m27s
node-exporter-2jqdw                    2/2     Running   0          3m27s
node-exporter-pqtkr                    2/2     Running   0          3m27s
node-exporter-wcgpx                    2/2     Running   0          3m27s
prometheus-adapter-676bc796d-lpmb8     1/1     Running   0          3m27s
prometheus-adapter-676bc796d-ql9vq     1/1     Running   0          3m27s
prometheus-k8s-0                       2/2     Running   0          2m29s
prometheus-k8s-1                       2/2     Running   0          2m29s
prometheus-operator-7ddc6877d5-ggg4r   2/2     Running   0          3m26s
root@node1:/home/ubuntu/kube-prometheus-release-0.10# kubectl get svc -n monitoring
NAME                    TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                      AGE
alertmanager-main       ClusterIP   10.233.19.228   <none>        9093/TCP,8080/TCP            3m40s
alertmanager-operated   ClusterIP   None            <none>        9093/TCP,9094/TCP,9094/UDP   2m41s
blackbox-exporter       ClusterIP   10.233.62.80    <none>        9115/TCP,19115/TCP           3m39s
grafana                 ClusterIP   10.233.49.197   <none>        3000/TCP                     3m39s
kube-state-metrics      ClusterIP   None            <none>        8443/TCP,9443/TCP            3m38s
node-exporter           ClusterIP   None            <none>        9100/TCP                     3m38s
prometheus-adapter      ClusterIP   10.233.39.102   <none>        443/TCP                      3m38s
prometheus-k8s          ClusterIP   10.233.40.170   <none>        9090/TCP,8080/TCP            3m38s
prometheus-operated     ClusterIP   None            <none>        9090/TCP                     2m40s
prometheus-operator     ClusterIP   None            <none>        8443/TCP                     3m38s
```
### Modifying the Port Type(type: NodePort)
```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/component: grafana
    app.kubernetes.io/name: grafana
    app.kubernetes.io/part-of: kube-prometheus
    app.kubernetes.io/version: 8.3.3
  name: grafana
  namespace: monitoring
spec:
  ports:
  - name: http
    port: 3000
    targetPort: http
  selector:
    app.kubernetes.io/component: grafana
    app.kubernetes.io/name: grafana
    app.kubernetes.io/part-of: kube-prometheus
  type: NodePort
```
```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/component: prometheus
    app.kubernetes.io/instance: k8s
    app.kubernetes.io/name: prometheus
    app.kubernetes.io/part-of: kube-prometheus
    app.kubernetes.io/version: 2.32.1
  name: prometheus-k8s
  namespace: monitoring
spec:
  ports:
  - name: web
    port: 9090
    targetPort: web
  - name: reloader-web
    port: 8080
    targetPort: reloader-web
  selector:
    app.kubernetes.io/component: prometheus
    app.kubernetes.io/instance: k8s
    app.kubernetes.io/name: prometheus
    app.kubernetes.io/part-of: kube-prometheus
  sessionAffinity: ClientIP
  type: NodePort
```
### View svc 
```yaml
root@node1:/home/ubuntu/kube-prometheus-release-0.10# kubectl get svc -n monitoring
NAME                    TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                         AGE
alertmanager-main       ClusterIP   10.233.19.228   <none>        9093/TCP,8080/TCP               40m
alertmanager-operated   ClusterIP   None            <none>        9093/TCP,9094/TCP,9094/UDP      39m
blackbox-exporter       ClusterIP   10.233.62.80    <none>        9115/TCP,19115/TCP              40m
grafana                 NodePort    10.233.49.197   <none>        3000:30610/TCP                  40m
kube-state-metrics      ClusterIP   None            <none>        8443/TCP,9443/TCP               40m
node-exporter           ClusterIP   None            <none>        9100/TCP                        40m
prometheus-adapter      ClusterIP   10.233.39.102   <none>        443/TCP                         40m
prometheus-k8s          NodePort    10.233.40.170   <none>        9090:30025/TCP,8080:31961/TCP   40m
prometheus-operated     ClusterIP   None            <none>        9090/TCP                        39m
prometheus-operator     ClusterIP   None            <none>        8443/TCP                        40m
root@node1:/home/ubuntu/kube-prometheus-release-0.10#

```
### Login prometheus and grafana

:::note
Starlight 是一个使用 [Astro](https://astro.build/) 构建的文档网站工具包。 你可以使用此命令开始：

```sh
npm create astro@latest -- --template starlight
```

:::

:::tip[ 这是一个 Tip ]
Astro 帮助你使用 [“群岛架构”](https://docs.astro.build/zh-cn/concepts/islands/) 构建更快的网站。
:::

:::caution
如果你不确定是否想要一个很棒的文档网站，请在使用 [Starlight](/zh-cn/) 之前三思。
:::

:::danger
借助有用的 Starlight 功能，你的用户可能会提高工作效率，并发现你的产品更易于使用。

- 清晰的导航
- 用户可配置的颜色主题
- [i18n 支持](/zh-cn/guides/i18n/)

:::

// 带有语法高亮的 JavaScript 代码。
var fun = function lang(l) {
  dateformat.i18n = require('./lang/' + l);
  return true;
};

```js
// 带有语法高亮的 JavaScript 代码。
var fun = function lang(l) {
  dateformat.i18n = require('./lang/' + l);
  return true;
};
```

  ```js "return true;" ins="插入" del="删除"
  function demo() {
    console.log('这是插入以及删除类型的标记');
    // 返回语句使用默认标记类型
    return true;
  }
  ```