---
title: "使用CI/CD部署H5应用到天翼云"
excerpt: "本文将介绍如何配置持续集成与持续部署 (CI/CD) 流程，将H5应用自动化部署到天翼云存储或其他相关服务。"
coverImage: "/assets/blog/ci-cd/tianyiyun-cover.jpg" # 您可以替换为相关图片
date: "2024-05-23T10:00:00.000Z" # 请更新为实际发布日期
author:
  name: "吴张明" # 请替换为您的名字
  picture: "/assets/blog/authors/your-avatar.jpg" # 请替换为您的头像路径
ogImage:
  url: "/assets/blog/ci-cd/tianyiyun-og.jpg" # 您可以替换为相关图片
---

## 引言

随着前端应用的日益复杂，自动化构建和部署流程变得非常重要。持续集成 (CI) 和持续部署 (CD) 可以帮助开发团队更快速、更可靠地交付产品。本文将重点探讨如何为H5应用设置CI/CD流程，并将其部署到天翼云平台。

## 部署前的准备工作

在开始CI/CD部署流程之前，需要完成以下重要的准备工作，特别是当您计划将H5应用嵌入到小程序中时。需要注意的是，未经过备案的服务器IP地址会默认限制80、443和8080这三个常用端口的访问：

### 1. 域名备案

- 购买域名并完成实名认证
- 在天翼云平台进行ICP备案
- 等待备案审核通过（通常需要5-20个工作日）
- 将域名解析到天翼云服务器IP

### 2. SSL证书配置

- 申请SSL证书（推荐使用免费的Let's Encrypt或购买付费证书）
- 在天翼云平台上传SSL证书
- 配置Nginx的HTTPS设置：


## 什么是CI/CD？

- **持续集成 (Continuous Integration, CI)**：开发人员频繁地将其代码更改合并到中央代码仓库中，之后会自动执行构建和测试。
- **持续部署 (Continuous Deployment, CD)**：在代码通过所有测试阶段后，自动将更改部署到生产环境。

## 为什么选择天翼云？

天翼云提供了多种服务，如对象存储、云主机等，可以满足不同H5应用的部署需求。结合其稳定性与成本效益，是一个不错的选择。

## CI/CD流程设计

一个典型的H5应用CI/CD流程可能包含以下步骤：

1.  **代码提交**：开发者将代码推送到Git仓库（如GitHub, GitLab, Gitee等）。
2.  **触发CI服务器**：Git仓库的提交触发CI服务器（如Jenkins, GitLab CI, GitHub Actions等）执行任务。
3.  **构建应用**：
    *   拉取最新代码。
    *   安装依赖 (例如 `npm install` 或 `yarn install`)。
    *   执行代码检查和单元测试 (例如 ESLint, Jest)。
    *   构建生产版本的H5应用 (例如 `npm run build` 或 `yarn build`)。
4.  **部署到天翼云**：
    *   将构建产物（通常是 `dist` 或 `build` 文件夹下的静态文件）上传到天翼云对象存储。
    *   或者，如果使用云主机，则可能需要通过SSH或其他方式将文件同步到服务器，并配置Web服务器（如Nginx）。
    *   （可选）刷新CDN缓存。
5.  **通知**：部署完成后，通过邮件、Slack等方式通知相关人员。

## 具体实现步骤 (以GitHub Actions和天翼云对象存储为例)

### 1. 准备工作

*   在天翼云开通对象存储服务，并获取Access Key ID和Secret Access Key。
*   创建一个存储桶 (Bucket) 用于存放H5应用文件。
*   （如果通过SSH部署到云主机）准备好您的服务器IP地址 (`SERVER_HOST`)、登录用户名 (`SERVER_USERNAME`) 以及SSH私钥 (`SSH_PRIVATE_KEY`)。

### 2. 配置GitHub Secrets

在您的GitHub仓库中，进入 `Settings` -> `Secrets and variables` -> `Actions`，点击 `New repository secret` 添加以下Secrets。这些Secrets将用于在GitHub Actions的workflow中安全地访问您的服务器或云服务凭证。

*   **`TANYIYUN_ACCESS_KEY_ID`**: 您的天翼云Access Key ID (如果使用天翼云对象存储)。
*   **`TANYIYUN_SECRET_ACCESS_KEY`**: 您的天翼云Secret Access Key (如果使用天翼云对象存储)。
*   **`SERVER_HOST`**: (可选，如果通过SSH部署到云主机) 您的服务器IP地址或域名。
*   **`SERVER_USERNAME`**: (可选，如果通过SSH部署到云主机) 登录服务器的用户名。
*   **`SSH_PRIVATE_KEY`**: (可选，如果通过SSH部署到云主机) 用于SSH免密登录的私钥。

#### 如何获取和配置 `SSH_PRIVATE_KEY`：

1.  **生成SSH密钥对**：如果您还没有SSH密钥对，可以在您的本地机器上使用以下命令生成：
    ```bash
    ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
    ```
    这会在默认路径（通常是 `~/.ssh/`）生成两个文件：`id_rsa` (私钥) 和 `id_rsa.pub` (公钥)。在提示输入文件名和密码时，您可以直接按回车键使用默认设置（不设置密码的私钥更方便CI/CD，但请确保其安全）。

2.  **将公钥添加到服务器的 `authorized_keys` 文件中**：
    复制您本地 `~/.ssh/id_rsa.pub` 文件的内容。
    登录到您的目标服务器，然后将复制的公钥内容追加到 `~/.ssh/authorized_keys` 文件中。如果该文件或目录不存在，请创建它们。
    ```bash
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    echo "<粘贴id_rsa.pub文件内容在这里>" >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    ```
    确保设置正确的文件权限。

3.  **将私钥内容添加到GitHub Secrets**：
    复制您本地 `~/.ssh/id_rsa` 文件的**全部内容** (从 `-----BEGIN RSA PRIVATE KEY-----` 到 `-----END RSA PRIVATE KEY-----`)。
    在GitHub仓库的Secrets设置中，创建一个新的Secret，命名为 `SSH_PRIVATE_KEY` (或其他您在workflow中使用的名称)，并将复制的私钥内容粘贴到Value字段中。

**重要安全提示**：私钥是非常敏感的信息。确保不要将其直接硬编码到您的代码或workflow文件中。始终使用GitHub Secrets来存储这类凭证。

### 3. 编写GitHub Actions Workflow

在您的项目根目录下创建 `.github/workflows/deploy.yml` 文件，内容示例如下：

```yaml
name: Deploy H5 to Tianyi Cloud OSS or Server

on:
  push:
    branches:
      - main # 或者您的主分支

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18' # 根据您的项目需求选择Node版本

      - name: Install dependencies
        run: npm install # 或者 yarn install

      - name: Build project
        run: npm run build # 或者 yarn build

      - name: Deploy to Server via SSH
        if: ${{ secrets.SERVER_HOST != '' }} # 仅当SERVER_HOST被设置时执行
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: 22 # 默认SSH端口
          script: |
            cd /var/www/your-h5-app-directory # 替换为您的应用在服务器上的路径
            # rm -rf ./* # 可选：部署前清空旧文件
            # 将构建产物从GitHub Actions Runner复制到服务器
            # 注意：appleboy/ssh-action本身不直接支持文件同步，通常配合 scp 或 rsync
            # 或者在之前的步骤中使用 actions/upload-artifact 和 actions/download-artifact
            # 更简单的方式是直接在服务器上执行git pull，然后构建 (如果服务器有构建环境)
            echo "Placeholder for actual deployment commands like rsync or scp"
            # 例如使用rsync (需要在runner和服务器上都安装rsync):
            # rsync -avz --delete ./dist/ ${{ secrets.SERVER_USERNAME }}@${{ secrets.SERVER_HOST }}:/var/www/your-h5-app-directory/

      - name: Deploy to Tianyi Cloud OSS
        if: ${{ secrets.TANYIYUN_ACCESS_KEY_ID != '' }} # 仅当天翼云凭证被设置时执行
        # 这里需要使用天翼云提供的SDK或CLI工具，或者第三方封装的Action
        # 例如，您可以使用 aws-cli 配置天翼云OSS的兼容接口进行上传
        # 或者寻找是否有专门针对天翼云OSS的GitHub Action
        # 以下为伪代码，您需要替换为实际的部署命令
        run: |
          echo "Deploying to Tianyi Cloud OSS..."
          # aws s3 sync ./dist s3://your-tianyiyun-bucket-name --endpoint-url=YOUR_TANYIYUN_OSS_ENDPOINT --acl public-read
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.TANYIYUN_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.TANYIYUN_SECRET_ACCESS_KEY }}
          # 根据实际情况配置其他环境变量

      # （可选）刷新CDN等操作