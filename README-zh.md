# @maizi/img-cli

一个用于处理图像文件的CLI工具，包括转换、压缩和重命名。

### 安装

你可以使用 npx 直接执行这个 CLI 工具，而无需全局安装。

```bash
npx @maizi/img-cli
```

或者你可以全局安装它：

```bash
npm install -g @maizi/img-cli
```

### 使用

```bash
npx @maizi/img-cli [directory] [options]
```

### 选项

- `-o, --output <directory>`: 指定输出目录 (可选)
- `-w, --width <number>`: 目标宽度 (可选)
- `-h, --height <number>`: 目标高度 (可选)
- `-f, --format <string>`: 目标图片格式 (jpg, jpeg, png, webp, jp2, bmp, 可选)
- `-q, --quality <number>`: 压缩阈值 (0~1，默认为0.7)

### 示例

将目录中的所有图片转换为JPEG格式，宽度为800像素，高度为600像素：

```bash
npx @maizi/img-cli /path/to/images -w 800 -h 600 -f jpeg -q 0.7
```

将所有图片转换为WebP格式，保持原始尺寸：

```bash
npx @maizi/img-cli /path/to/images -f webp -q 0.5
```

处理当前目录中的所有图片，使用默认设置：

```bash
npx @maizi/img-cli
```

### 许可证

本项目采用 ISC 许可证。请参阅 [LICENSE](LICENSE) 文件以获取详细信息。