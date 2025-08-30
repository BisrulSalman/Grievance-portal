document.addEventListener("DOMContentLoaded", () => {
  console.log("🔄 Admin login script loaded");
  
  const form = document.getElementById("adminLoginForm");
  console.log("📋 Form element found:", !!form);

  // Show/hide password
  const togglePassword = document.getElementById("togglePassword");
  if (togglePassword) {
    togglePassword.addEventListener("change", function () {
      const passwordInput = document.getElementById("adminPassword");
      if (passwordInput) {
        passwordInput.type = this.checked ? "text" : "password";
      }
    });
  }

  if (form) {
    form.addEventListener("submit", async function (e) {
      console.log("🚀 Form submit event triggered");
      e.preventDefault();
      console.log("✅ Default form submission prevented");

      const usernameElement = document.getElementById("adminUsername");
      const passwordElement = document.getElementById("adminPassword");
      
      console.log("📝 Username element found:", !!usernameElement);
      console.log("📝 Password element found:", !!passwordElement);
      
      if (!usernameElement || !passwordElement) {
        alert("Form elements not found!");
        return;
      }

      const username = usernameElement.value.trim();
      const password = passwordElement.value;
      
      console.log("📊 Username:", username);
      console.log("📊 Password length:", password.length);

      if (!username || !password) {
        alert("Please fill in both username and password");
        return;
      }

      try {
        console.log("🌐 Making fetch request to admin/check");
        const response = await fetch("http://localhost:5000/admin/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include", // IMPORTANT: needed for session cookies
          body: JSON.stringify({ username, password })
        });

        console.log("📡 Response status:", response.status);
        const result = await response.json();
        console.log("📨 Admin login response:", result);

        if (response.status === 200) {
          alert("Admin login successful!");
          window.location.href = "http://localhost:5000/pages/admin-dashboard.html"; // Redirect to dashboard
        } else {
          alert(result.message || "Login failed");
        }
      } catch (error) {
        console.error("❌ Login error:", error);
        alert("An error occurred during login: " + error.message);
      }
    });
  } else {
    console.error("❌ Admin login form not found!");
  }
});
