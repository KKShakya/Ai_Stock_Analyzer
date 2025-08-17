import fs from "fs";
import path from "path";

const base = "api-gateway";

const folders = [
  `${base}/src/routes`,
  `${base}/src/controllers`,
  `${base}/src/middlewares`,
  `${base}/src/utils`,
  `${base}/tests`,
  `${base}/config`,
];

const files = [
  `${base}/src/index.js`,
  `${base}/config/default.json`,
  `${base}/package.json`,
  `${base}/README.md`,
];

folders.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`✅ Created folder: ${dir}`);
});

files.forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "");
    console.log(`📄 Created file: ${file}`);
  }
});

console.log("🎉 API Gateway structure created successfully!");
