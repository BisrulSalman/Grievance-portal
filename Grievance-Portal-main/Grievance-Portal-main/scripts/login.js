document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async function(event) {
            event.preventDefault(); // Prevent default form submission

            const formData = {
                username: document.getElementById("username").value,
                password: document.getElementById("password").value
            };

            try {
                const response = await fetch("http://localhost:5000/login/check", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                    credentials: "include" // Ensures session cookies are sent
                });

                const result = await response.json();
                console.log("Login response:", result);

                if (response.status === 200) {
                    alert(result.message);
                    
                    // Redirect based on user type - use same port as backend
                    const dashboardPath = result.isAdmin 
                        ? "http://localhost:5000/pages/admin-dashboard.html" 
                        : "http://localhost:5000/pages/student-dashboard.html"; 

                    window.location.href = dashboardPath;

                    console.log("Redirecting to:", window.location.origin + dashboardPath);
                } else {
                    alert("Login failed: " + result.message);
                }
            } catch (error) {
                alert("Error logging in: " + error.message);
            }
        });
    } else {
        console.error("Login form not found!");
    }
});