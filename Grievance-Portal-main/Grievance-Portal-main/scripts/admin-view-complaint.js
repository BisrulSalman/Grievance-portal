let complaint = null;
const complaintId = localStorage.getItem("selectedComplaintId");

document.addEventListener("DOMContentLoaded", function() {
  if (complaintId) {
    loadComplaintDetails(complaintId);
  } else {
    alert("No complaint selected. Redirecting to dashboard.");
    window.location.href = "admin-dashboard.html";
  }
});

async function loadComplaintDetails(id) {
  try {
    // Fetch specific complaint details
    const response = await fetch(`http://localhost:5000/send-complaint/admin/complaint/${id}`, {
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch complaint: ${response.status}`);
    }

    complaint = await response.json();
    renderComplaintDetails();
    populateFormFields();
  } catch (error) {
    console.error("Error loading complaint:", error);
    alert("Error loading complaint details. Redirecting to dashboard.");
    window.location.href = "admin-dashboard.html";
  }
}

function renderComplaintDetails() {
  const container = document.getElementById("complaintDetails");
  if (!container || !complaint) return;

  const submittedDate = new Date(complaint.submittedAt).toLocaleDateString();
  const updatedDate = complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleDateString() : submittedDate;
  const studentName = complaint.studentId ? (complaint.studentId.fullName || 'Unknown Student') : 'Unknown Student';
  const evidenceHTML = complaint.evidence && complaint.evidence.length > 0 
    ? complaint.evidence.map(file => `
        <div class="evidence-file">
          <i class="material-icons">attach_file</i>
          <a href="http://localhost:5000${file.url}" target="_blank">${file.filename}</a>
        </div>
      `).join('')
    : '<div class="no-evidence">No evidence provided.</div>';

  container.innerHTML = `
    <h2>${complaint.title}</h2>
    <div class="badges">
      <span class="status ${complaint.status.toLowerCase().replace(/ /g, '-')}">${complaint.status}</span>
      <span class="priority ${complaint.priority.toLowerCase()}">${complaint.priority} Priority</span>
    </div>

    <div class="info-row">
      <div class="info-item"><strong>👤 Student:</strong> ${studentName}</div>
      <div class="info-item"><strong>📂 Category:</strong> ${complaint.category}</div>
      <div class="info-item"><strong>📅 Submitted:</strong> ${submittedDate}</div>
      <div class="info-item"><strong>🕓 Last Updated:</strong> ${updatedDate}</div>
    </div>

    <div class="section">
      <h4>Description</h4>
      <div class="description-box">${complaint.description || 'No description available.'}</div>
    </div>

    <div class="section">
      <h4>Supporting Evidence</h4>
      <div class="evidence-container">
        ${evidenceHTML}
      </div>
    </div>

    <div class="section">
      <h4>Current Admin Response</h4>
      <div class="response-box">${complaint.adminResponse || 'No response yet.'}</div>
    </div>
  `;
}

function populateFormFields() {
  const statusSelect = document.getElementById("status");
  const responseTextarea = document.getElementById("response");
  
  if (statusSelect && complaint) {
    statusSelect.value = complaint.status;
  }
  
  if (responseTextarea && complaint) {
    responseTextarea.value = complaint.adminResponse || "";
  }
}

async function updateComplaint() {
  const updatedStatus = document.getElementById("status").value;
  const updatedResponse = document.getElementById("response").value;

  if (!updatedStatus || !updatedResponse.trim()) {
    alert("Please fill in both status and response fields.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/send-complaint/admin/update/${complaint._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        status: updatedStatus,
        adminResponse: updatedResponse
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update complaint: ${response.status}`);
    }

    const result = await response.json();
    alert("Complaint updated successfully!");
    
    // Reload complaint details
    await loadComplaintDetails(complaint._id);
    
  } catch (error) {
    console.error("Error updating complaint:", error);
    alert("Failed to update complaint. Please try again.");
  }
}

// Add logout functionality
async function logout() {
  try {
    const response = await fetch("http://localhost:5000/admin/logout", {
      method: "POST",
      credentials: "include"
    });

    const result = await response.json();
    alert(result.message);
    window.location.href = "http://localhost:5000/pages/admin-login.html";
  } catch (error) {
    console.error("Admin logout failed:", error);
    alert("Logout failed. Please try again.");
  }
}
