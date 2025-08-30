document.addEventListener("DOMContentLoaded", function() {
    const showPasswordCheckbox = document.getElementById("showPassword");
    const passwordField = document.getElementById("password");

    if (showPasswordCheckbox) {
        showPasswordCheckbox.addEventListener("change", function() {
            console.log("Checkbox changed:", this.checked); // Debugging log
            
            if (passwordField) {
                passwordField.type = this.checked ? "text" : "password";
            }
        });
    } else {
        console.error("Show Password checkbox not found!");
    }
});