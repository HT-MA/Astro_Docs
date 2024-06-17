---
title: find 命令介绍
description: find 命令介绍
---
`find` 命令是一个功能强大的工具，用于在指定目录及其子目录中查找文件和目录。它支持丰富的搜索条件和操作，可以根据文件名、类型、大小、修改时间等进行查找。下面详细介绍 `find` 命令的各种用法和常见选项。

### 基本语法

```sh
find [path] [expression]
```

- `path`：指定查找的起始目录。如果省略，默认是当前目录（`.`）。
- `expression`：指定查找条件和操作。

### 常用选项和表达式

#### 1. 按名称查找

- **查找指定名称的文件或目录**
  ```sh
  find . -name "filename"
  ```

- **查找匹配模式的文件或目录（区分大小写）**
  ```sh
  find . -name "*.txt"
  ```

- **查找匹配模式的文件或目录（不区分大小写）**
  ```sh
  find . -iname "*.txt"
  ```

#### 2. 按类型查找

- **查找文件**
  ```sh
  find . -type f
  ```

- **查找目录**
  ```sh
  find . -type d
  ```

- **查找符号链接**
  ```sh
  find . -type l
  ```

#### 3. 按大小查找

- **查找大于指定大小的文件**
  ```sh
  find . -size +100M
  ```

- **查找小于指定大小的文件**
  ```sh
  find . -size -100M
  ```

- **查找正好指定大小的文件**
  ```sh
  find . -size 100M
  ```

#### 4. 按时间查找

- **查找最近24小时内修改过的文件**
  ```sh
  find . -mtime -1
  ```

- **查找24小时到48小时之间修改过的文件**
  ```sh
  find . -mtime 1
  ```

- **查找7天内访问过的文件**
  ```sh
  find . -atime -7
  ```

- **查找30分钟内修改过的文件**
  ```sh
  find . -mmin -30
  ```

#### 5. 按权限查找

- **查找具有特定权限的文件**
  ```sh
  find . -perm 644
  ```

- **查找具有特定权限的文件（精确匹配）**
  ```sh
  find . -perm -u=rwx,g=rx,o=r
  ```

#### 6. 按用户或组查找

- **查找属于特定用户的文件**
  ```sh
  find . -user username
  ```

- **查找属于特定组的文件**
  ```sh
  find . -group groupname
  ```

#### 7. 组合条件查找

- **查找特定用户且大于100MB的文件**
  ```sh
  find . -user username -and -size +100M
  ```

- **查找以`.log`结尾或大于50MB的文件**
  ```sh
  find . \( -name "*.log" -or -size +50M \)
  ```

#### 8. 执行操作

- **删除找到的文件**
  ```sh
  find . -name "*.tmp" -exec rm {} \;
  ```

- **移动找到的文件**
  ```sh
  find . -name "*.log" -exec mv {} /path/to/destination/ \;
  ```

- **打印文件详细信息**
  ```sh
  find . -type f -exec ls -l {} \;
  ```

#### 9. 优化查找

- **使用 `prune` 排除特定目录**
  ```sh
  find . -path "./exclude_dir" -prune -o -name "*.txt" -print
  ```

- **限制查找深度**
  ```sh
  find . -maxdepth 2 -name "*.txt"
  ```

- **按名称查找并限制查找深度**
  ```sh
  find . -mindepth 2 -maxdepth 5 -name "*.txt"
  ```

#### 10. 其他常用选项

- **查找空文件或空目录**
  ```sh
  find . -empty
  ```

- **按文件名查找（不包含路径）**
  ```sh
  find . -name "filename" -exec basename {} \;
  ```

### 实战示例

#### 查找最近修改过的文件并压缩

```sh
find . -mtime -1 -type f -print0 | xargs -0 tar -czvf modified_files.tar.gz
```

#### 查找并删除特定扩展名的文件

```sh
find . -name "*.bak" -type f -exec rm -f {} \;
```

#### 查找并改变文件权限

```sh
find . -type f -name "*.sh" -exec chmod +x {} \;
```

### 总结

`find` 命令提供了强大的功能来查找和管理文件系统中的文件和目录。通过灵活运用各种选项和表达式，可以高效地执行复杂的文件查找和操作任务。