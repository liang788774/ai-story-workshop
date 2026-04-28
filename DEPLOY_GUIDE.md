# AI故事工坊 - Netlify部署指南

## 🚀 部署步骤

### 第1步：准备GitHub仓库

1. **创建GitHub账号**（如果没有）
   - 访问 [GitHub官网](https://github.com/)
   - 注册账号并登录

2. **创建新仓库**
   - 点击右上角的 `+` 图标
   - 选择 `New repository`
   - 仓库名称：`ai-story-workshop`
   - 描述：`AI故事工坊 - 零门槛文字探险创作与分享平台`
   - 选择 `Public`（公开仓库）
   - 勾选 `Add a README file`
   - 点击 `Create repository`

3. **上传项目文件**
   - 方法一：使用Git命令（推荐）
     ```bash
     # 在项目文件夹中执行
     git init
     git add .
     git commit -m "初始化项目"
     git remote add origin https://github.com/你的用户名/ai-story-workshop.git
     git push -u origin main
     ```
   
   - 方法二：直接上传文件
     - 在GitHub仓库页面点击 `Add file` → `Upload files`
     - 拖拽所有项目文件到浏览器中
     - 填写提交信息，点击 `Commit changes`

### 第2步：部署到Netlify

1. **注册Netlify账号**
   - 访问 [Netlify官网](https://www.netlify.com/)
   - 点击 `Sign up`
   - 可以使用GitHub账号直接登录

2. **创建新站点**
   - 登录后点击 `Add new site` → `Import an existing project`
   - 选择 `GitHub` 作为代码托管平台
   - 授权Netlify访问你的GitHub账号
   - 在仓库列表中找到并选择 `ai-story-workshop`

3. **配置部署设置**
   - **Build command**: 留空（不需要构建命令）
   - **Publish directory**: `./`（当前目录）
   - 点击 `Deploy site`

4. **等待部署完成**
   - Netlify会自动开始部署
   - 部署完成后会显示绿色的成功状态
   - 复制生成的网站地址（类似 `https://xxxxxx.netlify.app`）

### 第3步：配置API密钥

1. **设置环境变量**
   - 在Netlify项目页面点击 `Site settings`
   - 选择 `Environment variables`
   - 点击 `Add a variable`
   - **Key**: `API_KEY`
   - **Value**: 你的豆包API密钥
   - 点击 `Save`

2. **更新函数代码**
   - 编辑 `netlify/functions/ai.js` 文件
   - 将 `'Bearer 在这里填入你的API密钥'` 改为 `'Bearer ' + process.env.API_KEY`
   - 保存并提交更改到GitHub

3. **重新部署**
   - 在Netlify项目页面点击 `Deploys`
   - 点击 `Trigger deploy` → `Deploy site`
   - 等待重新部署完成

## ⚙️ 配置文件说明

### netlify.toml（可选，高级配置）

在项目根目录创建 `netlify.toml` 文件：

```toml
[build]
  publish = "."
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"
  external_node_modules = ["node-fetch"]
```

### 环境变量配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `API_KEY` | 豆包API密钥 | `sk-xxxxxxxxxxxxxxxxxxxx` |
| `NODE_VERSION` | Node.js版本 | `18` |

## 🐛 常见问题解决

### Q: 部署成功但AI功能不工作？
A: 检查以下几点：
1. API密钥是否正确设置
2. 环境变量是否生效（重新部署）
3. 查看Netlify Functions日志

### Q: 如何查看部署日志？
A: 在Netlify项目页面点击 `Deploys` → 选择最新部署 → 点击 `Logs`

### Q: 如何自定义域名？
A: 
1. 在Netlify项目页面点击 `Domain settings`
2. 点击 `Add custom domain`
3. 按照提示配置DNS设置

## 🔒 安全注意事项

1. **API密钥保护**
   - 永远不要在代码中硬编码API密钥
   - 使用环境变量存储敏感信息

2. **CORS配置**
   - Netlify Functions默认支持CORS
   - 如果遇到跨域问题，检查浏览器控制台错误信息

3. **请求限制**
   - 监控API使用情况，避免超出配额
   - 考虑添加请求限流机制

## 📊 监控与维护

1. **查看访问统计**
   - 在Netlify项目页面点击 `Analytics`
   - 可以查看访问量、用户分布等数据

2. **设置构建通知**
   - 在 `Build & deploy` → `Deploy notifications`
   - 配置邮件或Slack通知

3. **自动部署**
   - Netlify会在GitHub代码更新时自动重新部署
   - 确保每次更新都经过测试

---

**部署完成后，你的AI故事工坊就可以在全球范围内访问了！** 🎉