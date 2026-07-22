// Kullanim: node scripts/hash-password.js "SifreN"
// Ciktiyi .env dosyandaki ADMIN_PASSWORD_HASH degerine yapistir.
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.error("Kullanim: node scripts/hash-password.js \"SifreN\"");
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log("\nADMIN_PASSWORD_HASH=" + hash + "\n");
});
