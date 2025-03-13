const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function updateUserTimestamps() {
  try {
    console.log("Kullanıcı zaman damgaları güncelleniyor...");

    // Get all users
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("*");

    if (fetchError) throw fetchError;

    let updatedCount = 0;

    // Update timestamps for users missing createdAt
    for (const user of users) {
      if (!user.created_at) {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) throw updateError;
        updatedCount++;
      }
    }

    console.log(`${updatedCount} kullanıcının zaman damgası güncellendi.`);
    process.exit(0);
  } catch (error) {
    console.error("Zaman damgaları güncellenirken hata:", error);
    process.exit(1);
  }
}

// Start timestamp update
updateUserTimestamps();
