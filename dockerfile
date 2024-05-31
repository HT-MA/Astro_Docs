# 使用Node.js 18.17.1官方镜像作为基础镜像
FROM node:18.17.1

# 创建应用目录
WORKDIR /app

# 复制当前目录下的所有内容到/app目录
COPY . /app

# 安装项目依赖
RUN npm install

# 暴露应用运行的端口（根据你的应用需要修改端口号，例如这里假设应用在3000端口运行）
EXPOSE 3000

# 切换到/app目录
WORKDIR /app

# 执行npm run dev命令
CMD ["npm", "run", "dev"]
