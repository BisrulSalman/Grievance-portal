document.getElementById("forgotPasswordForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent page reload

    const formData = {
        email: document.getElementById("email").value,
        username: document.getElementById("username").value,
        newPassword: document.getElementById("password").value,
        confirmPassword: document.getElementById("confirmPassword").value
    };

    if (formData.newPassword !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/reset/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (response.status === 200) {
            alert(result.message);
            window.location.href = "./login.html"; // Redirect to login page
        } else {
            alert("Password reset failed: " + result.message);
        }
    } catch (error) {
        alert("Error resetting password: " + error.message);
    }
});