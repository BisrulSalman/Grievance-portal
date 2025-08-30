document.getElementById("logout").addEventListener("click", async function() {
    try {
        const response = await fetch("http://localhost:5000/login/logout", {
            method: "POST",
            credentials: "include"
        });

        const result = await response.json();
        alert(result.message);
        window.location.href = "http://localhost:5000/pages/login.html"; // Redirect after logout
    } catch (error) {
        console.error("Logout failed:", error);
    }
});