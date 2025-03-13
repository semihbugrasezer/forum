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

async function createAdminUser() {
  try {
    console.log("Admin kullanıcı oluşturma işlemi başlatılıyor...");

    // Get email and password from user
    const email = await question("Admin email adresini girin: ");
    const password = await question("Admin şifresini girin: ");

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) throw authError;

    // Create user profile in users table
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: authData.user.id,
        email,
        role: "admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (profileError) throw profileError;

    console.log("Admin kullanıcısı başarıyla oluşturuldu!");
    console.log("Email:", email);
    console.log("User ID:", authData.user.id);
    process.exit(0);
  } catch (error) {
    console.error("Admin oluşturma hatası:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Start admin creation
createAdminUser();
