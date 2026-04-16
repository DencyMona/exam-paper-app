
// Run only after partials are injected
document.addEventListener("partialsLoaded", () => {
  const form = document.getElementById("adminForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          alert("Error: " + errorText);
          return;
        }

        const data = await response.json();
        alert(`Admin "${data.username}" added successfully!`);
        form.reset();
      } catch (err) {
        console.error(err);
        alert("Something went wrong!");
      }
    });
  }

  // --- admin count ---
  async function loadAdminCount() {
    try {
      const res = await fetch("/api/admin-count");
      const data = await res.json();
      const el = document.getElementById("adminCount");
      if (el) el.innerText = data.total;
    } catch (err) {
      console.error("Error fetching admin count:", err);
    }
  }

  loadAdminCount();
});


//admincount
   async function loadAdminCount() {
  try {
    const res = await fetch('/api/admin-count');
    const data = await res.json();
    document.getElementById('adminCount').innerText = data.total;
  } catch (err) {
    console.error('Error fetching admin count:', err);
  }
}
document.addEventListener("DOMContentLoaded", loadAdminCount);
 
