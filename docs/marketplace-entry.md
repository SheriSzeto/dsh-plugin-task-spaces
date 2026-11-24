# 上架 awesome-dsh-plugin：一条可直接使用的 PR 文案

`awesome-dsh-plugin` 是 DSH 的社区插件目录，也是 `dsh-market` 插件市场的索引来源。仓库：<https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>。

**投稿方式：一个 PR 只加一个文件**，路径为 `data/plugins/SheriSzeto__dsh-plugin-task-spaces.yml`。两个 README 由 CI 从 `data/plugins/*.yml` 生成，**不要手工改 README**。

下面所有 `SheriSzeto` / `dsh-plugin-task-spaces` 都要换成你自己的 GitHub 账号和仓库名。仓库已初始化好（`git init`，见 `git log`），推上去之后就能按这份文案提交。

## 0. 先建仓库并推上去

在 GitHub 新建一个**空仓库**（不要勾选 README / .gitignore / license，否则首次 push 会被拒）：

<https://github.com/new?name=dsh-plugin-task-spaces>

然后（本仓库的 `origin` 已配置为 `git@github.com:SheriSzeto/dsh-plugin-task-spaces.git`，SSH key 也已验证可用）：

```bash
cd /Users/situxin/Documents/dsh
git push -u origin main --tags
```

推完去仓库页 → About 旁的齿轮 → **Topics** 加上 `dsh-plugin`。

## 1. 提交前必须满足的条件（CI 会逐条检查）

- [ ] 仓库已推到 GitHub，且**创建满 1 天**（CI 自动校验，刚建几分钟的仓库会被拒）
- [ ] 仓库带 `dsh-plugin` topic（GitHub 仓库页 → About 齿轮 → Topics）
- [ ] `package.json` 声明 `dsh.bundle`（本仓库已有，见 `package.json` → `dsh.bundle.patch`）
- [ ] 仓库里有真实可用的代码（本仓库有完整 UI 源码 + 构建产物）
- [ ] `dsh plugin add` 能装上（推荐先发 npm，或给 GitHub Release 附预构建 tarball，见下）
- [ ] 描述只陈述功能、不夸大、不带营销词
- [ ] 一个 PR 最多 3 条条目（本项只提交 1 条）

## 2. 新增的文件：`data/plugins/SheriSzeto__dsh-plugin-task-spaces.yml`

文件名由仓库路径决定：仓库是 `https://github.com/SheriSzeto/dsh-plugin-task-spaces` 时，
文件名是 `data/plugins/SheriSzeto__dsh-plugin-task-spaces.yml`。

内容已准备好：[`docs/awesome-dsh-plugin-entry.yml`](awesome-dsh-plugin-entry.yml)，可直接复制。

也可在 GitHub 网页上完成投稿：fork [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/fork) →
在 fork 里 **Add file → Create new file** → 文件名填 `data/plugins/SheriSzeto__dsh-plugin-task-spaces.yml`
→ 粘贴上面文件的内容 → Commit → 回到 fork 页面点 **Contribute → Open pull request**。

```yaml
url: https://github.com/SheriSzeto/dsh-plugin-task-spaces
name: SheriSzeto/dsh-plugin-task-spaces
category: ui
description:
  en: 'Task spaces for the DSH Web GUI: a five-step create-space wizard with preset workflows and per-space modules.'
  zh: 'DSH Web GUI 的任务空间：五步创建向导，支持预设工作流与按空间配置的功能模块。'
icon: https://raw.githubusercontent.com/SheriSzeto/dsh-plugin-task-spaces/main/assets/icon-180.png
```

**关于字段**

- `url` 必须与仓库地址完全一致，`name` 是列表里显示的链接文字，用 `owner/repo` 格式。
- `category: ui`：插件提供的是 Web GUI 里的侧边栏面板 + 创建向导界面；如维护者认为更贴切会自行调整，不会因此被打回。
- 英文描述里含 `: `（冒号加空格），**必须用单引号包起来**，否则 YAML 会把冒号当嵌套键解析失败。中文全角冒号没有这个问题，加引号也无妨。
- `icon` 可选，但本仓库已经生成了 180×180 的 `assets/icon-180.png`，用 GitHub raw 地址即可；要求是 GitHub 托管的位图，不能是 SVG 或第三方图床。
- 描述必须与实现一致：五步向导、预设工作流、按空间配置的功能模块都是真实存在的；没提"多人协作""服务端存储"等尚未实现的能力。

### npm 发布（推荐）

`dsh-plugin-task-spaces` 这个包名目前在 npm 上没有占用，可以直接发（需要先 `npm login`）：

```bash
npm login
npm run release
npm publish
```

### 如果走 GitHub Release 而不是 npm

`awesome-dsh-plugin` 推荐把插件发到 npm（预构建安装免 `allowBuilds` 授权）。不发 npm 也可以，在条目里加 `tarball:` 字段指向 GitHub Release 上的预构建 tgz：

```yaml
tarball: https://github.com/SheriSzeto/dsh-plugin-task-spaces/releases/latest/download/dsh-plugin-task-spaces.tgz
```

⚠️ 用 `latest/download/` 时**资产文件名里不要带版本号**（本项目的发布脚本产出的文件名是 `dsh-plugin-task-spaces-0.1.0.tgz`，带版本；要么改名为不带版本的 `dsh-plugin-task-spaces.tgz` 再上传，要么把 URL 钉到具体 tag）。

## 3. PR 标题

```text
Add dsh-plugin-task-spaces: task spaces for the DSH Web GUI
```

## 4. PR 正文（直接粘贴）

```markdown
Adds `dsh-plugin-task-spaces` to the **UI Enhancements** category.

It adds a "任务空间 / Task spaces" panel to the DSH Web GUI: a five-step
create-space wizard (work category → task types & feature modules →
name/identifier/icon → workflow preset or copy-from-existing-space →
access & confirmation), plus a spaces page with cards, filtering, duplicate
config, and delete confirmation.

- Bundle manifest: `dsh.bundle.patch` points at `cordis.patch.yml` (single `insert` row).
- Client half ships as `lib/client.js`; the node half is an empty `apply()`.
- Data is local-only: spaces are stored in the browser's `localStorage`, each user independent.
- Verified on DSH Desktop 2.0.10 / dsh 0.2.0-rc.2: installed from a packed tarball into a
  clean profile, created spaces end to end.
- Entry file: `data/plugins/SheriSzeto__dsh-plugin-task-spaces.yml` (this is the only file touched).

Checklist: repo is >1 day old, has the `dsh-plugin` topic, and declares `dsh.bundle`.
```

## 5. 提交前自检（在本仓库跑）

```bash
npm run verify     # 14 项检查：manifest、构建产物 id、patch、打包白名单
npm run release    # 重新 build + pack，确认 dist/ 里的 tarball
```

然后用一个**干净的 profile** 真装一遍（不要用你现在跑着的 profile）：

```bash
# 从本地 tarball
dsh plugin --profile scratch add ./dist/dsh-plugin-task-spaces-0.1.0.tgz
# 或从 GitHub 仓库
dsh plugin --profile scratch add github:SheriSzeto/dsh-plugin-task-spaces
```

启用组合包后刷新页面，确认侧边栏出现「任务空间」、向导能创建空间，再提交 PR。

## 6. 合并之后

- 两个 README 与网站会自动重建，不需要你做任何事。
- 收录后可把徽章加进 README 顶部：

  ```markdown
  [![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)
  ```

- 有拆包 / 改描述 / 更新版本时，只改自己那一个 `data/plugins/*.yml`，不要动生成的 README。
