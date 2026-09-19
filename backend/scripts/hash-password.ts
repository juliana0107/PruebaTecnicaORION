import bcrypt from 'bcryptjs';

async function main() {
  const password = process.argv[2] || 'orion2026';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

main();