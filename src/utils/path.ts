/**
 * 路径解析函数 - 将相对路径转换为绝对路径
 * @param targetPath 目标路径（可能是相对路径）
 * @param currentPath 当前文件的完整路径
 * @returns 解析后的绝对路径
 */
export function resolvePath(targetPath: string, currentPath?: string): string {
  if (!currentPath) return targetPath

  // 如果已经是绝对路径，直接返回
  if (targetPath.startsWith('/') || targetPath.includes(':\\')) {
    return targetPath
  }

  // 检查 currentPath 是否为绝对路径
  const isCurrentPathAbsolute = currentPath.startsWith('/') || currentPath.includes(':\\')

  if (!isCurrentPathAbsolute) {
    // 如果当前路径不是绝对路径（比如只是文件名），无法进行相对路径解析
    // 在这种情况下，返回目标路径本身，让调用者处理
    console.warn('Cannot resolve relative path: currentPath is not absolute:', {
      currentPath,
      targetPath
    })
    return targetPath
  }

  // 获取当前文件的目录
  const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'))

  // 处理相对路径
  if (targetPath.startsWith('./')) {
    // 移除 ./ 前缀并拼接到当前目录
    const relativePath = targetPath.substring(2)
    return `${currentDir}/${relativePath}`
  } else if (targetPath.startsWith('../')) {
    // 处理 ../ 路径
    const parts = currentDir.split('/')
    let target = targetPath

    // 处理多级 ../
    while (target.startsWith('../')) {
      target = target.substring(3)
      if (parts.length > 0) {
        parts.pop()
      }
    }

    // 如果还有剩余路径，拼接到处理后的目录
    if (target) {
      return `${parts.join('/')}/${target}`
    } else {
      return parts.join('/')
    }
  } else {
    // 同目录文件
    return `${currentDir}/${targetPath}`
  }
}
