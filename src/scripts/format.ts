export const plainTextOnly = (markdown: string) => {
  return markdown
    .replace(/#+\s/g, '') // Remove headers
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
    .replace(/!\[([^\]]+)\]\([^\)]+\)/g, '') // Remove images
    .replace(/(\*|_){1,3}(.+?)\1{1,3}/g, '$2') // Remove bold/italic
    .replace(/`{1,3}(.+?)`{1,3}/g, '$1') // Remove code blocks
    .replace(/^\s*[-*+]\s/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s/gm, '') // Remove numbered list markers
    .trim();
};

export const formatSize = (size: number) => {
  if (size < 1024) {
    return `${size}B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)}KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)}MB`;
  } else {
    return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`;
  }
};
