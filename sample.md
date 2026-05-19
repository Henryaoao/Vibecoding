# Markdown 转 HTML 测试文档

这是一段普通段落，用来测试 Markdown 的段落渲染效果。它包含 **加粗文本**、*斜体文本*，以及一段 `行内代码`。

下面是另一个段落。Markdown 适合编写说明文档、笔记、博客文章，也可以作为静态页面内容的来源。

## 无序列表

- 支持标题
- 支持段落
- 支持列表
  - 二级列表会有缩进和左侧层
    - 三级列表使用不同的 marke
- 支持代码块
- 支持链接和图片

## 有序列表

1. 编写 Markdown 文件
   1. 保存为 `.md` 文件
   2. 确认文件路径
2. 运行 `md2html input.md -o output.html`
3. 打开生成的 HTML 文件查看效果

## 代码块

```ts
type Use = {
  id: numbe;
  name: string;
};

function greet(user: User): string {
  return `Hello, ${user.name}!`;
}

console.log(greet({ id: 1, name: "Ada" }));
```

## 链接

这是一个链接：[OpenAI](https://openai.com)。

## 图片引用

![示例占位图片](https://placehold.co/800x360/png?text=Markdown+Image)

## 引用

> 简洁的默认样式可以让生成的 HTML 直接可读。
