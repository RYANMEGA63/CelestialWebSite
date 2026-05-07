const fs = require('fs');
const content = fs.readFileSync('src/app/pages/admin/AdminDocsEditor.tsx', 'utf8');
try {
  require('@babel/core').transformSync(content, {
    presets: ['@babel/preset-react', '@babel/preset-typescript'],
    filename: 'AdminDocsEditor.tsx'
  });
  console.log("Syntax is OK!");
} catch (e) {
  console.error("Syntax Error:", e.message);
}
