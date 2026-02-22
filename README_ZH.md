# <img src="docs/logo.png" width="48" height="48" align="center" /> macbase

**别再拖延你的 OTB 对局分析。为您打造最美观、原生且高效的 Mac 国际象棋工作室。**

[English](README.md) • **简体中文**

Macbase 提供了一个专注、世界级的界面，专门用于分析那些您一直在推迟的线下比赛对局。我们将“记录的对局”转化为“习得的教训”，助您在下一次实战中变得更强。

[**下载 macbase Pro**](https://joe-ging.github.io/macbase-app/zh/) • [**GitHub 点亮 Star**](https://github.com/joe-ging/macbase)

---

### 🚨 **关键：克隆源码 vs. 下载应用**
**本仓库仅包含社区核心版 (Community Core)。**

克隆此仓库可以让您查看架构并为基础引擎做贡献。但是，若要获得**完整的专业体验**——包括 AI 教练 "Neural Link"、自动 TWIC 同步以及专业战术洞察——您**必须**通过官方网站下载 DMG 安装包。

👉 [**在此下载完整 Pro 体验版**](https://joe-ging.github.io/macbase-app/zh/)

---

### 📊 **社区热度**
在静默预览发布后的前 **8 小时**内：
- 📈 **300+ 总计克隆 (Total Clones)**
- 👤 **141 位独立开发者/棋手** 通过终端克隆了此项目。

Mac 原生国际象棋软件的需求是真实存在的。**如果您觉得本项目有帮助，请点亮 ⭐ Star。** 这将帮助我们打破“新项目”的信任壁垒，并为 AI 教练功能的更新注入动力！

---

## 🌟 支持本项目 (致谢名单)
我们想回馈早期社区的支持！

**激励措施：** 凡是在**发布首周**内点亮 Star 的用户，您的 GitHub ID 将被加入到我们下一个 v0.2.0 版本的**“早期支持者致谢墙”**中。

---

### 🚀 **里程碑：15 个 STAR 开启“神经网络连接 (Neural Link)”**
一旦本项目达到 **15 个 Star**，我们将开始把基于 **Claude 驱动的 AI 教练** 直接集成到 Macbase 生态系统中。

**愿景：**
想象一下，当您在 Lichess.org 结束一局超快棋后，我们的 Neural Link 引擎会立即生成核心改进建议和战术盲点提醒，并直接推送到您的 **macbase 桌面端** 以及您的 **WhatsApp/微信/Telegram**。

不再需要繁琐的手动分析，不再有拖延。只有全自动化的水平提升。

[**⭐ 立即点亮 Star 推进开发路线图**](https://github.com/joe-ging/macbase)

---

## 🌎 开源核心模式
Macbase 采用 **Open Core** 模式。我们相信专业的工具应该拥有透明的技术基础。
- **社区核心 (本仓库):** 基础国际象棋引擎、数据库架构以及原生 macOS 桌面框架。
- **Pro 专业版:** 包含 AI 教练、云端同步开局库以及专业对局洞察等高级功能。

---

## 🖼️ 功能展示 (完整之旅)

### 1. 统一指挥中心 (Dashboard)
紧随棋坛动态。一键从 [TWIC](https://theweekinchess.com) 导入最新的全球大师赛对局，实时监控您的数据库增长。
<p align="center">
  <img src="docs/screenshots/dashboard1.png" width="400" />
  <img src="docs/screenshots/dashboard2.png" width="400" />
</p>

### 2. 深度分析与战术标注
原生集成 Multi-PV Stockfish 16.1。绘制战术箭头、高亮关键格子，并以专业的清晰度标注对局。无网页延迟，无浏览器限制。
<p align="center">
  <img src="docs/screenshots/analysis1.png" width="266" />
  <img src="docs/screenshots/analysis2.png" width="266" />
  <img src="docs/screenshots/analysis3.png" width="266" />
</p>

### 3. 大师级数据情报库 (Database)
闪电般搜索数百万局棋。支持按 ECO 开局代码、棋手、等级分或年份进行高精过滤。
<p align="center">
  <img src="docs/screenshots/database1.png" width="266" />
  <img src="docs/screenshots/database2.png" width="266" />
  <img src="docs/screenshots/database3.png" width="266" />
</p>

### 4. 专业洞察与盲点检测 (Pro)
精准定位您的技术短板。通过 AI 分析您的 PGN，找出反复出现的战术主题和开局误区。
<p align="center">
  <img src="docs/screenshots/insight1.png" width="400" />
  <img src="docs/screenshots/insight2.png" width="400" />
</p>

### 5. 开局库构建与记忆闪卡 (Pro)
构建您的先手和后手开局库，并利用内置的**间隔重复 (Spaced-repetition)** 记忆闪卡系统进行每日强化训练。
<p align="center">
  <img src="docs/screenshots/repertoire1.png" width="400" />
  <img src="docs/screenshots/repertoire2.png" width="400" />
</p>

---

## 🚀 安装指南 (如何获取应用)

由于目前处于限额公测阶段（**前 100 名用户免费**），我们通过官方商店进行分发，以确保您能获得完整的 Pro Beta 功能。

### **1. 下载与移动**
1. **访问** [官方商店](https://joe-ging.github.io/macbase-app/zh/)。
2. **填写邮箱** 以获取您的专属下载链接。
3. **下载** `macbase.dmg`。
4. **将** `macbase` 应用移动到您的 **应用程序 (Applications)** 文件夹中。

### **2. 绕过 macOS Gatekeeper 安全策略 (关键步骤)**
由于 macbase 是一个独立的独立开发者项目且目前尚未签名，macOS 可能会将其标记为“已阻止”或“恶意软件”。请使用以下两种方法之一进行解决：

#### **方法 A：快捷方式 (推荐，适用于 90% 的情况)**
- 在应用程序文件夹中，**右键点击 (或 Control-点击)** `macbase` 图标，然后选择 **“打开”**。
- 这会触发一个包含 **“打开”** 按钮的对话框（普通的双击操作不会显示此按钮）。

#### **方法 B：系统设置 (若方法 A 无效)**
1. 双击应用。当出现“已阻止”警告时，点击 **“好”**。
2. **立即**打开 **系统设置 ➡️ 隐私与安全性**（该按钮仅在报错后的 5 分钟内可见）。
3. 向下滚动到 **“安全性”** 栏目，寻找 **“仍要打开”** 按钮。
4. 根据提示输入您的 Mac 开机密码。

#### **方法 C：针对 macOS 15 Sequoia 的终极方案 (若上述均无效)**
如果系统设置中没有出现按钮，请打开 **终端 (Terminal)** 并粘贴执行以下命令：
```bash
xattr -cr /Applications/macbase.app
```
执行后即可直接正常启动。图标显示异常（占位符）通常在首次成功运行后会自动恢复。

---

## 🛠️ 开发环境配置

如果您想为社区核心版做贡献或从源码构建：

### 前置条件
- Python 3.12+
- Node.js 20+
- [Stockfish](https://stockfishchess.org/download/)

### 构建步骤
1. **克隆与配置:**
   ```bash
   git clone https://github.com/joe-ging/macbase.git
   cd macbase
   ./toggle_pro.py core
   ```
2. **后端:** 安装 `backend/requirements.txt` 中的依赖并运行 `main.py`。
3. **前端:** 在 `frontend` 目录下运行 `npm install` 和 `npm run dev`。

---

## 🚩 反馈与 Bug 报告
发现问题了？请使用我们的公测反馈表单：
👉 [**报告问题 / 提出建议**](https://tally.so/r/jayppa)

---

## 🙏 鸣谢
- **对局数据:** [The Week in Chess (TWIC)](https://theweekinchess.com/)
- **引擎:** [Stockfish Chess](https://stockfishchess.org/)
- **技术栈:** FastAPI, React, SQLite.

## 📄 开源协议
MIT © [joe-ging](https://github.com/joe-ging)
