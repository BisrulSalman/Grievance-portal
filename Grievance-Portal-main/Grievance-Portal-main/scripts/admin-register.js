// document.getElementById("adminRegisterForm").addEventListener("submit", async function(event) {
//     event.preventDefault(); // Prevent page reload

//     // ✅ Get form values
//     const fullname = document.getElementById("fullname").value;
//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;
//     const position = document.getElementById("position").value;
//     const phonenumber = document.getElementById("phonenumber").value;
//     const faculty = document.getElementById("faculty").value;
//     const department = document.getElementById("department").value;

//     // ✅ Send data to backend
//     try {
//         const response = await fetch("http://localhost:5000/admin/data", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ fullname, email, password, position, phonenumber, faculty, department })
//         });

//         const result = await response.json();
//         console.log("Response from backend:", result);

//         if (response.ok) {
//             alert(result.message); // Show success message
//             window.location.href = "login.html"; // Redirect to login page
//         } else {
//             alert(result.message || "Registration failed.");
//         }
//     } catch (error) {
//         console.error("Error during admin registration:", error);
//         alert("An error occurred while registering.");
//     }
// });