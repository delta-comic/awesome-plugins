# 任务清单

你现在着手完成以下内容，不分先后。你自己决定工作顺序

此外，你可以**任意的**添加依赖和增删monorepo

适当的用git提交(不推送)保存分割工作进度

你可以切分子任务来更好的规划进度

该清单内容位于`项目根目录/TODOS.md`

## 清单

- [x] 彻底重构当前的控制系统
  - [x] 重构issue控制模版，使得用户可以通过markdown控制包注册行为
  - [x] 重构回答体系，使其更加明显(使用emoji)且附加日志(默认折叠)
  - [x] 优化鉴权逻辑，使得不要让任何人都可以随意修改注册
- [x] 对于同在github的插件
  - [x] 需要通过定时任务扫描发行版的最新版本，给出最新正式发行版文件中`manifest.json`文件的链接(如果存在)
  - [x] 需要通过定时任务扫描，选出最近提交的5个，在本仓库README展示，形如
    ```md
    ### ${仓库名称}

    [![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=${owner}&repo=${repo}&user&theme=transparent)](https://github.com/${owner}/${repo})

    **下载:**

    \`\`\`sh
      ${下载命令}
    \`\`\`

    <details>
      <summary>Readme</summary>

      ${它的readme内容}
    </details>

    ```
- [x] 规范化数据结构，编写json schema，使用类型检测库检查写入文件类型是否正确
- [x] 测试使用`bun test`

## 注意

项目的所有数据结构会提供给[另一应用](https://github.com/delta-comic/delta-comic)作插件市场的索引，你应当作诸如分页之类的逻辑

而且你需要在完成后生成提示词以供另一项目的ai对接数据结构
