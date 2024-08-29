# mz-img-cli

A CLI tool for processing images, including conversion, compression, and renaming.

### Install

You can use npx to execute this CLI tool directly without installing it globally.

```bash
npx mz-img-cli
```

Or you can install it globally:

```bash
npm install -g mz-img-cli
```

### Usage

```bash
npx mz-img-cli [directory] [options]
```

### Options

- `-o, --output <directory>`: Specify output directory (optional)
- `-w, --width <number>`: Target width (optional)
- `-h, --height <number>`: Target height (optional)
- `-f, --format <string>`: Target image format (jpg, jpeg, png, webp, jp2, bmp, optional)
- `-q, --quality <number>`: Compression threshold (0~1, default 0.7)

### Examples

Convert all images in a directory to JPEG format with a width of 800 pixels and a height of 600 pixels:

```bash
npx mz-img-cli /path/to/images -w 800 -h 600 -f jpeg -q 0.7
```

Convert all images to WebP format while maintaining original dimensions:

```bash
npx mz-img-cli /path/to/images -f webp -q 0.5
```

Process all images in the current directory with default settings:

```bash
npx mz-img-cli
```

### License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

---