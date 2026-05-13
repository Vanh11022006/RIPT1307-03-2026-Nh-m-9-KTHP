const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace imports from local types or mocks to use 'import type' if it only imports types.
    // Since in our codebase, all imports from '../types/...' and './common.types' are type-only imports:
    content = content.replace(/import\s+{([^}]+)}\s+from\s+["'](.+?types.*?)["'];/g, 'import type { $1 } from "$2";');
    fs.writeFileSync(filePath, content);
  }
});
