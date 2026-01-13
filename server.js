const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, "visitors.json");

function readCount() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const json = JSON.parse(raw);
    return Number(json.count || 0);
  } catch {
    return 0;
  }
}

function writeCount(count) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ count }, null, 2));
}

app.use(express.static(__dirname));

app.get("/api/visitor", (req, res) => {
  let count = readCount();
  count += 1;
  writeCount(count);
  res.json({ count });
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
