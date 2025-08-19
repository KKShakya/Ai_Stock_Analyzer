import fs from "fs";
import path from "path";

const base = "services/user-service";

const folders = [
  `${base}/src/routes`,
  `${base}/src/controllers`,
  `${base}/src/middlewares`,
  `${base}/src/utils`,
  `${base}/src/models`,
];

const files = [
  `${base}/src/index.ts`,
  `${base}/src/routes/user.ts`,
  `${base}/src/routes/auth.ts`,
  `${base}/src/middlewares/auth.ts`,
  `${base}/src/middlewares/passport.ts`,
  `${base}/src/models/User.ts`,
  `${base}/src/utils/jwt.ts`,
  `${base}/package.json`,
  `${base}/README.md`,
  `${base}/.env.example`,
  `${base}/.env`,
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
