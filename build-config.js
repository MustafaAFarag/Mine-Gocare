const fs = require("fs");
const path = require("path");

// Get current date in DD-MM-YY format
const getDateString = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

// Read angular.json
const angularJsonPath = path.join(__dirname, "angular.json");
const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, "utf8"));

// Update output paths with date
const dateString = getDateString();
angularJson.projects[
  "mine-gocare"
].architect.build.configurations.production.outputPath =
  `dist/mine-gocare-production-${dateString}`;
angularJson.projects[
  "mine-gocare"
].architect.build.configurations.development.outputPath =
  `dist/mine-gocare-development-${dateString}`;
angularJson.projects[
  "mine-gocare"
].architect.build.configurations.testing.outputPath =
  `dist/mine-gocare-testing-${dateString}`;

// Write back to angular.json
fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
