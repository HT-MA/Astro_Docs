---
title: github-action example
description: github-action example
---

以下是基于你的 `docker-image.yml` 文件的完整 GitHub Actions 工作流示例：

```yaml
name: Build and Push Docker Image

on:
  push:
    branches:
      - master  # 当推送到master分支时触发

jobs:
  build:
    runs-on: ubuntu-latest

    env:
      IMAGE_NAME: registry.cn-hangzhou.aliyuncs.com/mht1003/astro

    steps:
      # 检出代码库
      - name: Checkout repository
        uses: actions/checkout@v2

      # 登录到阿里云 ACR
      - name: Log in to Alibaba Cloud ACR
        run: docker login --username=langneng01 registry.cn-hangzhou.aliyuncs.com --password=${{ secrets.ACR_PASSWORD }}

      # 构建Docker镜像
      - name: Build Docker image
        run: docker build -t ${{ env.IMAGE_NAME }}:${{ github.run_number }} .

      # 推送Docker镜像到阿里云 ACR
      - name: Push Docker image
        run: docker push ${{ env.IMAGE_NAME }}:${{ github.run_number }}

      # 通过SSH连接到阿里云ECS并重启Docker容器
      - name: Restart Docker container on ECS
        uses: appleboy/ssh-action@v0.1.6
        with:
          host: ${{ secrets.IP }}
          username: root
          password: ${{ secrets.ECS_PASSWORD }}
          port: 22
          script: |
            docker pull ${{ env.IMAGE_NAME }}:${{ github.run_number }}
            docker stop astro && docker rm astro
            docker run -d --name astro -p 4321:4321 ${{ env.IMAGE_NAME }}:${{ github.run_number }}
```

### 解释

- **name**: 设置工作流名称为 "Build and Push Docker Image"。
- **on**: 指定触发工作流的条件，当推送到 `master` 分支时触发。
- **jobs**: 定义工作流任务。
  - **build**: 任务名称。
    - **runs-on**: 指定运行环境，这里使用 `ubuntu-latest`。
    - **env**: 设置环境变量 `IMAGE_NAME`，用于指定 Docker 镜像的名称。
    - **steps**: 定义任务的具体步骤。
      - **Checkout repository**: 使用 `actions/checkout@v2` 检出代码库。
      - **Log in to Alibaba Cloud ACR**: 使用 Docker 命令登录到阿里云容器镜像服务（ACR）。
      - **Build Docker image**: 构建 Docker 镜像，并使用 GitHub 的运行编号作为标签。
      - **Push Docker image**: 将 Docker 镜像推送到阿里云容器镜像服务（ACR）。
      - **Restart Docker container on ECS**: 使用 `appleboy/ssh-action@v0.1.6` 通过 SSH 连接到阿里云 ECS 实例，拉取新的 Docker 镜像并重启容器。

### 前置条件

1. 在 GitHub 仓库中设置 Secrets：`ACR_PASSWORD`、`IP` 和 `ECS_PASSWORD`，用于阿里云 ACR 登录和 ECS 连接。
2. 确保阿里云 ACR 和 ECS 实例已正确配置，并可以通过 SSH 访问。