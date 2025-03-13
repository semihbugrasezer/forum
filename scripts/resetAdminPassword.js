const { createClient } = require("@supabase/supabase-js");
const readline = require("readline");
require("dotenv").config();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function resetAdminPassword() {
  try {
    console.log("Admin şifre sıfırlama işlemi başlatılıyor...");

    // Get email and new password from user
    const email = await question("Admin email adresini girin: ");
    const newPassword = await question("Yeni şifreyi girin: ");

    // Update user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      email,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    console.log("Admin şifresi başarıyla güncellendi!");
    process.exit(0);
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Start password reset
resetAdminPassword();
