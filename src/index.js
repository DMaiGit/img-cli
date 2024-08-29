#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { Command } from 'commander';
import chalk from 'chalk';
import * as emoji from 'node-emoji';

const program = new Command();
program
  .name('mz-img-tools')
  .description(chalk.blue('一个CLI工具，用于处理图像文件，包括转换、压缩和重命名') + ` ${emoji.get('camera')}`)
  .argument('[directory]', chalk.green('图片文件夹路径，默认为当前目录'))
  .option('-o, --output <directory>', chalk.green('指定输出目录 (可选)'))
  .option('-w, --width <number>', chalk.green('目标宽度 (可选)'))
  .option('-h, --height <number>', chalk.green('目标高度 (可选)'))
  .option('-f, --format <string>', chalk.green('目标图片格式 (jpg, jpeg, png, webp, jp2, bmp, 可选)'))
  .option('-q, --quality <number>', chalk.green('压缩阈值 (0~1，默认为0.7)'))
  .action((directory, options) => {
    processImages(directory, options);
  })
  .version('1.0.0')
  .helpOption('-h, --help', chalk.yellow('查看帮助'))
  .on('--help', () => {
    console.log('\n' + chalk.yellow('使用示例:'));
    console.log(`  转换文件夹中的所有图片，设置宽高为800x600，并转换为JPEG格式:`);
    console.log(`    $ mz-img-tools /path/to/images -w 800 -h 600 -f jpeg -q 0.7 ${emoji.get('sparkles')}`);
    console.log(`  仅转换为WebP格式，保持原始尺寸:`);
    console.log(`    $ mz-img-tools /path/to/images -f webp -q 0.5 ${emoji.get('sparkles')}`);
    console.log(`  处理当前目录中的所有图片，使用默认设置:`);
    console.log(`    $ mz-img-tools ${emoji.get('sparkles')}`);
  });

program.parse(process.argv);

// 获取所有图片文件
async function getImages(dir) {
  const files = await fs.readdir(dir);
  const imageFiles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      const nestedImages = await getImages(filePath);
      imageFiles.push(...nestedImages);
    } else {
      // 跳过文件名中包含 "mini" 的文件
      if (/\.(jpg|jpeg|png|gif|webp|bmp|svg|tiff|jp2)$/i.test(file) && !file.includes('.mini')) {
        imageFiles.push(filePath);
      }
    }
  }

  return imageFiles;
}

// 删除目标格式中带有 .mini 的文件
async function deleteMiniFiles(outputDir, targetFormat) {
  if (outputDir) {
    const files = await fs.readdir(outputDir);
    for (const file of files) {
      if (file.includes('.mini') && file.endsWith(`.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`)) {
        const filePath = path.join(outputDir, file);
        await fs.remove(filePath);
        console.log(chalk.yellow(`已删除: ${file}`));
      }
    }
  }
}

// 处理图片
async function processImages(directory, options) {
  const imagesDir = directory || process.cwd();
  const imageFiles = await getImages(imagesDir);

  // 删除目标格式中带有 .mini 的文件
  await deleteMiniFiles(options.output || imagesDir, options.format);

  if (imageFiles.length === 0) {
    console.error(chalk.red('错误: 没有找到任何图片文件。'));
    process.exit(1);
  }

  let success = true; // 标志位，记录处理是否成功
  const qualityThreshold = options.quality ? Math.max(Math.min(parseFloat(options.quality), 1), 0) : 0.7;
  const quality = Math.round(qualityThreshold * 100); // 将0到1的阈值转换为0到100的质量值

  for (const filePath of imageFiles) {
    if (!success) { return; } // 如果有任何一个图片处理失败，则退出循环
    const originalImage = sharp(filePath);
    const metadata = await originalImage.metadata();
    const originalSize = (await fs.stat(filePath)).size;
    const originalFileName = path.basename(filePath);
    const width = options.width ? parseInt(options.width) : metadata.width;
    const height = options.height ? parseInt(options.height) : metadata.height;
    const targetFormat = options.format || metadata.format;

    try {
      // 先转换为无损格式
      const pngBuffer = await originalImage
        .resize(width, height, { fit: sharp.fit.inside })
        .toFormat('png', {
          compressionLevel: 0, // PNG无损压缩
        })
        .toBuffer();

      // WebP的质量参数传递
      const finalBuffer = await sharp(pngBuffer)
        .toFormat(targetFormat, { 
          // quality: targetFormat === 'jpeg' ? quality : (targetFormat === 'webp' ? qualityThreshold * 100 : undefined), // 对JPEG和WebP设置质量
          quality: quality, // 对JPEG和WebP设置质量
          lossless: qualityThreshold === 1 // 仅在质量为1时进行无损
        })
        .toBuffer();

      // 生成目标文件名，确保文件扩展名正确，并添加 "mini" 前缀
      const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat; // 确保jpeg格式的扩展名为jpg
      const outputFilePath = options.output ? 
        path.join(options.output, `${originalFileName.replace(path.extname(originalFileName), `.mini.${ext}`)}`) : 
        filePath.replace(path.extname(originalFileName), `.mini.${ext}`);

      await fs.promises.writeFile(outputFilePath, finalBuffer);

      const compressedSize = (await fs.stat(outputFilePath)).size;

      const newMetadata = await sharp(outputFilePath).metadata();
      console.log(chalk.green(`${originalFileName}, ${metadata.width}x${metadata.height}, ${(originalSize / 1024).toFixed(2)} KB -> ${path.basename(outputFilePath)}, ${newMetadata.width}x${newMetadata.height}, ${(compressedSize / 1024).toFixed(2)} KB`));
    } catch (error) {
      console.error(chalk.red(`处理文件时出错: ${error.message}`));
      success = false; // 如果发生错误，设置标志位为 false
    }
  }

  if (success) {
    console.log(chalk.blue('所有图片处理完成。'));
  }
}

// 主程序
(async () => {
  if (process.argv.length < 3) {
    program.outputHelp();
    process.exit(1);
  }
})();
