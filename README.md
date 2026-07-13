<!--lint disable awesome-heading awesome-toc awesome-github double-link -->

<div align="center">
<h1>Awesome Plugin</h1>
<h3>社区的Delta Comic插件集散地。</h3>

<img alt="logo" src="./icon.png" width="120" height="120" />

</div>

## 如何添加你的插件

- 第一次使用请阅读[插件 Issue 控制使用指南](./docs/plugin-issue-control-guide.md)，无需编程基础。
- 使用[插件控制 Issue 模板](https://github.com/delta-comic/awesome-plugins/issues/new/choose)，在控制块中注册、更新或删除插件。
- 机器人会验证提交者权限；登记作者、目标 GitHub 仓库维护者或本注册表维护者才可修改已有记录。

## 市场索引

- 分页入口：[registry/index.json](./registry/index.json)
- 数据结构：[schemas](./schemas)
- Delta Comic AI 对接提示词：[docs/delta-comic-integration-prompt.md](./docs/delta-comic-integration-prompt.md)

<!-- Generated plugin catalog: do not edit below -->

### delta-comic-plugin-layout

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic-plugin-layout&user&theme=transparent)](https://github.com/delta-comic/delta-comic-plugin-layout)

**下载:**

```sh
ap:layout
```

<details>
<summary>Readme</summary>

# Delta Comic Plugin Layout - _希望的涟漪_

[![GitHub](https://img.shields.io/github/license/delta-comic/delta-comic-plugin-layout)](https://raw.githubusercontent.com/delta-comic/delta-comic-plugin-layout/main/LICENSE)

- [delta-comic](https://github.com/delta-comic/delta-comic)的插件

## 功能

- 提供一些标准布局/视图

## 如何使用

- 本插件不具有直接功能，应当作为开发依赖

## 源项目

### Delta Comic

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic&user&theme=transparent)](https://github.com/delta-comic/delta-comic)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=delta-comic/delta-comic-plugin-layout&type=Date&12345)](https://www.star-history.com/#delta-comic/delta-comic-plugin-layout&Date)

</details>

### jmcomic-sdk

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=jmcomic-sdk&user&theme=transparent)](https://github.com/delta-comic/jmcomic-sdk)

**下载:**

```sh
ap:jmcomic
```

<details>
<summary>Readme</summary>

# 禁漫天堂SDK

## 介绍

- 该项目共分为两个部分
  - 一为封装的禁漫天堂的移动端[接口](#sdk介绍)
  - 二为[**Delta Comic**](https://github.com/delta-comic/delta-comic)的禁漫天堂[插件](#插件介绍)

## SDK介绍

### 安装

```sh
pnpm add jmcomic-sdk
```

然后详见[ReadMe](/packages/sdk/README.md)

<!-- SDK begin -->

- sdk内置了解密与网络请求，账户管理
- 接口推断来自[禁漫天堂解包源码(Github)](https://github.com/wenxig/jmcomic-source-code)
- 该sdk封装了几乎所有的接口，如下
- [x] 鉴权
  - [x] 登录
  - [x] 注册
  - [x] 登出
  - [x] 忘记密码
- [x] 漫画
  - [x] 搜索漫画
  - [x] 获取详细信息
  - [x] 获取所有图片
  - [x] 点赞
  - [x] 收藏
  - [x] 获取评论
  - [x] 发送评论
  - [x] 回复评论
  - [x] -购买付费漫画-不会实现, ps: 因为api无视付费与否均可返回正确结果
- [x] 博客
  - [x] 搜索博客
  - [x] 获取博客详细信息
  - [x] 点赞
  - [x] 获取评论
  - [x] 发送评论
  - [x] 回复评论
- [x] 书库
  - [x] 搜索书库
  - [x] 获取作者详细信息
  - [x] 获取书库详细信息
  - [x] 获取书库的内容
- [x] 小说
  - [x] 搜索小说
  - [x] 获取推荐列表
  - [x] 获取详细信息
  - [x] 获取正文
  - [x] 点赞
  - [x] 小说收藏
  - [x] 获取小说收藏
  - [x] 发送评论
  - [x] 回复评论
  - [x] -小说收藏操作-不会实现
  - [x] -购买付费小说-不会实现
- [x] 推送
  - [x] 最新漫画获取
  - [x] 热门标签
  - [x] 随机推荐
  - [x] 每周推荐
  - [x] 首页分类
  - [x] 首页分析详细信息
- [x] 用户
  - [x] 签到
  - [x] 历史记录
  - [x] 获取信息
  - [x] 修改信息
  - [x] 勋章购买
  - [x] 勋章调整
  - [x] 称号搜索
  - [x] 称号调整
  - [x] -修改头像-无法实现
- [ ] 视频
- [ ] 通知
- [ ] 其他
  - [ ] 购买去广告
  - [ ] 游戏
  - [x] -Setting信息-不会实现, ps: 没什么有用东西

<!-- SDK end -->
<!-- Plugin begin -->

## 插件介绍

### Delta Comic Plugin Jmcomic - _<span style="font-weight: lighter;font-size:16px">何以哀怮</span>_

[![GitHub](https://img.shields.io/github/license/delta-comic/jmcomic-sdk)](https://raw.githubusercontent.com/delta-comic/jmcomic-sdk/main/LICENSE)
![Download](https://img.shields.io/github/downloads/delta-comic/jmcomic-sdk/total)

#### 功能

- 完全封装了SDK
- 提供有关 _Jmcomic **/** 禁漫天堂_ 的相关功能

#### 如何使用

- 将release的latest的js源码链接填入"添加插件"的地址栏

#### 源项目

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic&user&theme=transparent)](https://github.com/delta-comic/delta-comic)

<!-- Plugin end -->

## 星图

[![Star History Chart](https://api.star-history.com/svg?repos=delta-comic/jmcomic-sdk&type=Date)](https://www.star-history.com/#delta-comic/jmcomic-sdk&Date)

</details>

### delta-comic-plugin-bika

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic-plugin-bika&user&theme=transparent)](https://github.com/delta-comic/delta-comic-plugin-bika)

**下载:**

```sh
ap:bika
```

<details>
<summary>Readme</summary>

# Delta Comic Plugin Bika - _<span style="font-weight: lighter;font-size:16px">何以忘却</span>_

[![GitHub](https://img.shields.io/github/license/delta-comic/delta-comic-plugin-bika)](https://raw.githubusercontent.com/delta-comic/delta-comic-plugin-bika/main/LICENSE)
![Donwload](https://img.shields.io/github/downloads/delta-comic/delta-comic-plugin-bika/total)

- [delta-comic](https://github.com/delta-comic/delta-comic)的插件

## 功能

- 提供有关 _Pica Acg **/** Bika **/** 哔卡漫画_ 的相关功能

## 如何使用

- 将release的latest的js源码链接填入"添加插件"的地址栏

## 想要编写插件?

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=wenxig&repo=delta-comic-core&user&theme=transparent)](https://github.com/delta-comic/delta-comic-core)
 该包可为你提供许多基本的数据结构, 与便捷的`definePlugin`

## 源项目

### Delta Comic

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic&user&theme=transparent)](https://github.com/delta-comic/delta-comic)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=delta-comic/delta-comic-plugin-bika&type=Date)](https://www.star-history.com/#delta-comic/delta-comic-plugin-bika&Date)

</details>

### delta-comic-plugin-cosav

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic-plugin-cosav&user&theme=transparent)](https://github.com/delta-comic/delta-comic-plugin-cosav)

**下载:**

```sh
ap:cosav
```

<details>
<summary>Readme</summary>

# Delta Comic Plugin Cosav - _<span style="font-weight: lighter;font-size:16px">何以殁亡</span>_

[![GitHub](https://img.shields.io/github/license/delta-comic/delta-comic-plugin-cosav)](https://raw.githubusercontent.com/delta-comic/delta-comic-plugin-cosav/main/LICENSE)
![Download](https://img.shields.io/github/downloads/delta-comic/delta-comic-plugin-cosav/total)

- [delta-comic](https://github.com/delta-comic/delta-comic)的插件

## 功能

- 提供有关 _Cosav **/** cos天堂_ 的相关功能

## 如何使用

- 将release的latest的js源码链接填入"添加插件"的地址栏

## 想要编写插件?

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic-core&user&theme=transparent)](https://github.com/delta-comic/delta-comic-core)
 该包可为你提供许多基本的数据结构, 与便捷的`definePlugin`

## 源项目

### Delta Comic

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic&user&theme=transparent)](https://github.com/delta-comic/delta-comic)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=delta-comic/delta-comic-plugin-cosav&type=Date)](https://www.star-history.com/#delta-comic/delta-comic-plugin-cosav&Date)

</details>
