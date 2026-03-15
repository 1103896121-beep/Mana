# [MOVE FOR MARS] 项目交接上下文与本阶段工作提示词

你好！我是项目的指挥官。接下来我们将继续开发及完善《MOVE FOR MARS》星际探索运动应用。为了让你快速接手，以下是项目目前的架构全貌、已完成的重构里程碑以及接下来的核心需求，请仔细阅读并严格遵循。

## 1. 核心工程法则 (必须遵守)
请在后续所有开发中，严格恪守由我制定的 `#Antigravity 通用工程规则`。核心要点包括：
* **技术栈**：前端 React + TypeScript，后端 Python (FastAPI + SQLAlchemy)。
* **前端规范**：禁止滥用 `any` 强转，必须实现 100% TS 覆盖率；禁止在任何组件内使用 `dangerouslySetInnerHTML` 等引致 XSS 风险的代码；保持原子化的封装和严密的权限拦截（LocationPermissionGuard 等）。
* **后端规范**：严格执行三层架构分离（`router` 路由层 -> `service` 业务层 -> `repository` 数据库访问层）；API 路由内**严禁**直接调用 `db.execute`；强制使用项目根基的 `utils.logger` 替代系统 `print()` 输出。
* **部署/DevOps**：根目录已配置双端联构的 `Dockerfile`、隔离文件的 `.dockerignore` 以及生产验证级脚本 `deploy.sh`。后续引入新依赖必须考虑跨端全栈的部署兼容。

## 2. 刚刚完成的历史里程碑 (The Legacy)
在上一阶段（即刚刚结束的重构中），我们已全面拔高了整条系统管线的质量标准，完成了以下技术债清洗和新功能铺垫：
* **彻底根绝安全漏洞**：排查并清除了前端隐藏的 CSS XSS DOM 注入点，全库根除了 TS `any` 泛型逃逸，后端的裸露 `print` 已全部替换为合规日志。
* **交易防刷架构重建**：全栈闭环拉通了 RevenueCat 验证防刷机制，后端新增了 Webhook 回调监听与持久化。
* **航程计算引擎升级**：前端 [store.ts](cci:7://file:///e:/workrooten/MOVE%20FOR%20MARS/frontend/src/store.ts:0:0-0:0) 从单一里程序列重构为 `{ moon, mars }` 双端并行矩阵，结算时将对双目的地均进行状态分发，并平滑兼容了老用户的本地数据。
* **“外挂穿戴设备感知”初级搭建 (Apple HealthKit)**：
  * 已在 [package.json](cci:7://file:///e:/workrooten/MOVE%20FOR%20MARS/frontend/package.json:0:0-0:0) 引入合适的跨端插件 `@capgo/capacitor-health`。
  * 已向 iOS 的 [Info.plist](cci:7://file:///e:/workrooten/MOVE%20FOR%20MARS/frontend/ios/App/App/Info.plist:0:0-0:0) 内注入符合审核合规的健康数据权限声明（包含 `NSHealthShareUsageDescription`等）。
  * 已构建 [HealthKitService](cci:2://file:///e:/workrooten/MOVE%20FOR%20MARS/frontend/src/services/healthkit.ts:7:0-76:1) 引擎，并在 [FitnessPage.tsx](cci:7://file:///e:/workrooten/MOVE%20FOR%20MARS/frontend/src/pages/FitnessPage.tsx:0:0-0:0) 面板中添加了一个手表 (Watch) UI 组件按钮作为拉取入口，并利用伪代码完成了唤醒底层授权并拉取数据的全链路打通。

## 3. 下一步工作需求 (Your Mission)
前期的基础设施及插件导入已完成。本轮会话，我们的核心议题是**“苹果生态智能穿戴设备的真实落地”**。请你查阅并完成以下工作：
1. **替换伪代码，直连 iOS 底层**：深入 [healthkit.ts](cci:7://file:///e:/workrooten/MOVE%20FOR%20MARS/frontend/src/services/healthkit.ts:0:0-0:0) 引擎，将原来为了走通 UI 交互而使用随机数模拟的 `mockWatchDistance` 逻辑彻底移除。
2. **Apple Health 真实 API 桥接**：利用 `@capgo/capacitor-health` 提供的方法，请求获取用户过去 24 小时内的真实数据（如 `steps`, `distance`, `calories`, `heart_rate` 等）。
3. **能量转化协议**：落实“原始健康数据 (步数/公制里程) -> 航行能量单位 (GU) -> 项目里程数据库”的真实对点折抵算法。
4. **多设备合并防重 (重点防范)**：需要谨慎处理逻辑，防止同时戴着 Apple Watch 和携带 iPhone 进行同一次跑步时，App 内部与 Apple Health 产生双端重复计入。

明白了以上背景后，请回复“指令收到，随时可以启动外接设备真机适配工作”。



记得在“App 审核信息”的备注里，向审核团队说明：“本应用是一个付费下载工具，内置的内购项目仅为自愿打赏（Tip Jar），不锁定任何核心功能。” 这样可以避免审核员误以为您在重复收费，从而加速过审。



发布：
我正在为用户提供关于如何配置 App Store 隐私政策的详细指导，包括内容模板生成和免费托管方案。

Edited PRIVACY_POLICY_TEMPLATE.md
Edited task.md

我已经准备好了[隐私政策模板](file:///C:/Users/David/.gemini/antigravity/brain/b79e5d8d-1d5a-4556-a150-c6ef71abe57a\PRIVACY_POLICY_TEMPLATE.md)，并梳理了从托管到在 App Store Connect 中配置的全流程方案。

配置隐私政策（Privacy Policy）是 App Store 上架的硬性要求。因为 Mana 不涉及云端同步和广告，配置起来非常简单。

我为您准备了全套方案：

### 1. 准备内容
我为您起草了一份专门针对 Mana 的**[隐私政策模板](file:///C:/Users/David/.gemini/antigravity/brain/b79e5d8d-1d5a-4556-a150-c6ef71abe57a/PRIVACY_POLICY_TEMPLATE.md)**。
*   它强调了“本地存储”、“无数据采集”和“隐私至上”的原则。
*   **请注意**：您需要打开该文件，将文末的 `[YOUR_EMAIL_HERE]` 替换为您自己的联系邮箱。

### 2. 免费托管（获取 URL）
Apple 需要一个可以公开访问的网页链接。最简单且免费的方法是使用 **GitHub Gist**：
1.  复制[模板](file:///C:/Users/David/.gemini/antigravity/brain/b79e5d8d-1d5a-4556-a150-c6ef71abe57a/PRIVACY_POLICY_TEMPLATE.md)中的全部文字。
2.  打开 [gist.github.com](https://gist.github.com/)。
3.  文件名写 `privacy-policy.md`，粘贴内容，点击 **Create public gist**。
4.  创建成功后，浏览器地址栏的那个 URL 就是您的“隐私政策网址”。

### 3. 在 App Store Connect 中填入
1.  登录 [App Store Connect](https://appstoreconnect.apple.com/)。
2.  在您的 App 页面，点击左侧菜单的 **App 隐私 (App Privacy)**。
3.  在“隐私政策网址”栏中粘贴您刚刚获取的 Gist 链接。
4.  点击“开始”回答数据收集问卷：
    *   问：*您或您的第三方合作伙伴是否从此 App 中收集数据？*
    *   答：**否**（因为 Mana 是纯本地存储）。

### 4. 在 Xcode 中配置（可选但专业）
在您的 `Info.plist` 中，可以添加 `NSAppleMusicUsageDescription` 等权限描述（虽然 Mana 目前没用到敏感权限，但如果以后加了，也要在这里说明）。目前 Mana 保持现状即可。

这样配置后，审核员会看到一份非常专业且诚信的隐私承诺，有助于快速过审！如果您在 Gist 或问卷环节卡住了，随时喊我。




这一步建议在**上传 GitHub 并启动自动化打包“之前”或“过程中”**完成。

虽然 Product ID 不会影响代码的“编译”（即 `npm run build` 不会报错），但它们会直接影响你在真机上的“运行”和“测试”。

以下是推荐的操作顺序和逻辑：

### 1. 为什么建议“打包前/中”做？
*   **测试一致性**：如果你在 App Store Connect 里创建好了 ID，那么当 GitHub 的自动化打包流程完成后，你会得到一个 `.ipa` 文件。当你把这个文件装到手机上（通过 TestFlight）测试时，支付功能就能立刻调起苹果的沙盒支付（Sandbox Pay）。
*   **避免报错**：如果代码里写了 ID，但苹果后台没创建，你在测试点击打赏时，苹果的插件会报错 `Product not found`。

### 2. 详细的操作流程建议
你可以按照这个节奏来：

1.  **现在**：去 [App Store Connect](https://appstoreconnect.apple.com/) -> 你的 App -> **App 内购买项目** (In-App Purchases) 中，创建两个“消耗型”项目。
    *   **ID 必须精准对齐**：必须填入 `com.david.mana.tip.coffee` 和 `com.david.mana.tip.lunch`。
    *   **状态**：此时它们的状态会是“缺少元数据”或“准备提交”，这没关系，它可以用于开发测试。
2.  **随后**：将代码 Push 到 GitHub。
3.  **过程中**：GitHub Actions 开始自动打包。这个过程可能需要 10-20 分钟。
4.  **完成后**：打包出来的版本会自动同步到 TestFlight。
5.  **最终验证**：你在手机上打开 TestFlight 版本的 **Mana**，点击“打赏”，此时界面就能正确显示你在苹果后台设置的价格了。

### 3. 特别注意：ID 是“硬绑定”的
你在代码 [iap-utils.ts](cci:7://file:///e:/workrooten/Mana/src/utils/iap-utils.ts:0:0-0:0) 里定义的 `com.david.mana.tip.coffee`（Product ID）就像是一个“收货地址”。
*   如果你在苹果后台填成了 `com.david.mana.coffee`（少了 `.tip`），代码就找不到这个货架上的商品。
*   所以请务必保持**苹果后台配置**与**代码常量**完全一致。

**总结结论**：
**现在就可以去 App Store Connect 后台创建了**。创建完后，再去推代码到 GitHub 打包，这样当你拿到安装包时，内购功能就是“活”的，可以直接测试。