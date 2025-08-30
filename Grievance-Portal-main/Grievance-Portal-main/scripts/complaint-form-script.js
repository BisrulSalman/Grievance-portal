document.addEventListener("DOMContentLoaded", () => {
  // Category from URL
  // Get category from URL and set it
const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get("category") || "General Complaints";
document.getElementById("categoryDisplay").textContent = `Category: ${formatCategoryName(category)}`;

// Format category name for display (optional prettifying)
function formatCategoryName(cat) {
  switch(cat) {
    case 'academic': return 'Academic Grievance';
    case 'technical': return 'Technical Issues';
    case 'disciplinary': return 'Disciplinary & Ragging Complaints';
    case 'hostel': return 'Hostel & Facility Issues';
    case 'financial': return 'Financial & Scholarship Concerns';
    case 'anonymous': return 'Anonymous Complaints';
    case 'general': return 'General Complaints';
    default: return cat;
  }
}



  // Live character count
  const description = document.getElementById("description");
  const charCount = document.getElementById("charCount");
  description.addEventListener("input", () => {
    charCount.textContent = description.value.length;
  });

  // Form Validation & Submission
  const form = document.getElementById("complaintForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const desc = description.value.trim();
    const priority = document.getElementById("priority").value;
    const files = document.getElementById("evidence").files;

    // Validation
    if (title.length < 5) {
      alert("❗ Complaint Title must be at least 5 characters.");
      return;
    }

    if (desc.length < 20) {
      alert("❗ Description must be at least 20 characters.");
      return;
    }

    // File validation (size/type)
    for (let file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`⚠️ ${file.name} exceeds 10MB limit.`);
        return;
      }
    }

    // Get category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category") || "general";

    // Prepare form data for submission
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", desc);
    formData.append("priority", priority);
    formData.append("category", formatCategoryName(category));
    
    // Append files
    for (let file of files) {
      formData.append("evidence", file);
    }

    try {
      // Show loading
      const submitBtn = document.querySelector(".submit-btn");
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Submitting...";
      submitBtn.disabled = true;

      // Submit to backend
      const response = await fetch("http://localhost:5000/send-complaint/submit", {
        method: "POST",
        body: formData,
        credentials: "include" // Include session cookies
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess();
        form.reset();
        charCount.textContent = "0";
        document.getElementById("fileList").innerHTML = "";
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          window.location.href = "http://localhost:5000/pages/student-dashboard.html";
        }, 3000);
      } else {
        alert("❌ Error submitting complaint: " + result.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("❌ Error submitting complaint. Please try again.");
    } finally {
      // Restore button
      const submitBtn = document.querySelector(".submit-btn");
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  function showSuccess() {
    const successBox = document.createElement("div");
    successBox.innerText = "🎉 Complaint Submitted Successfully! Redirecting to dashboard...";
    successBox.style.position = "fixed";
    successBox.style.top = "20px";
    successBox.style.left = "50%";
    successBox.style.transform = "translateX(-50%)";
    successBox.style.backgroundColor = "#10b981";
    successBox.style.color = "#fff";
    successBox.style.padding = "14px 28px";
    successBox.style.borderRadius = "8px";
    successBox.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
    successBox.style.zIndex = 9999;
    successBox.style.fontSize = "16px";
    document.body.appendChild(successBox);

    setTimeout(() => {
      successBox.style.transition = "opacity 1s ease-out";
      successBox.style.opacity = 0;
    }, 2500);

    setTimeout(() => {
      if (document.body.contains(successBox)) {
        document.body.removeChild(successBox);
      }
    }, 3500);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category") || "General Complaints";
  document.getElementById("categoryDisplay").textContent = `Category: ${formatCategoryName(category)}`;
});

document.getElementById("evidence").addEventListener("change", function () {
      const fileList = document.getElementById("fileList");
      fileList.innerHTML = ""; // Clear previous

      Array.from(this.files).forEach(file => {
        const li = document.createElement("li");
        li.textContent = file.name;
        li.style.fontSize = "14px";
        li.style.color = "#333";
        li.style.marginTop = "4px";
        fileList.appendChild(li);
      });
    });