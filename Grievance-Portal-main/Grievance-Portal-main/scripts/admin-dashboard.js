document.addEventListener("DOMContentLoaded", function () {
  // Fetch admin session info
  fetch("http://localhost:5000/admin/latest-session", {
    method: "GET",
    credentials: "include"
  })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        const admin = response.data;
        console.log("👤 Admin logged in as:", admin.name);
        
        // Update DOM elements with admin info
        const adminNameElement = document.getElementById("adminName");
        const adminEmailElement = document.getElementById("adminEmail");
        const adminPositionElement = document.getElementById("adminPosition");
        
        if (adminNameElement) adminNameElement.textContent = admin.name;
        if (adminEmailElement) adminEmailElement.textContent = admin.email;
        if (adminPositionElement) adminPositionElement.textContent = admin.position;
        
        loadComplaints();
      } else {
        alert("Session expired. Please login again.");
        window.location.href = "http://localhost:5000/pages/admin-login.html";
      }
    })
    .catch(error => {
      console.error("❌ Admin session fetch error:", error);
      alert("Session expired or not logged in.");
      window.location.href = "http://localhost:5000/pages/admin-login.html";
    });
});

// Load complaints function
async function loadComplaints() {
  const container = document.getElementById("complaintList");
  
  try {
    // Show loading
    if (container) {
      container.innerHTML = "<p>Loading complaints...</p>";
    }
    
    // Fetch all complaints for admin
    const response = await fetch("http://localhost:5000/send-complaint/admin/all", {
      method: "GET",
      credentials: "include"
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const complaints = await response.json();
    console.log("📋 Admin fetched complaints:", complaints);
    
    displayComplaints(complaints);
    
  } catch (error) {
    console.error("Error fetching complaints:", error);
    if (container) {
      container.innerHTML = `<p>Error loading complaints: ${error.message}</p>`;
    }
    
    // If unauthorized, redirect to admin login
    if (error.message.includes('401')) {
      alert("Admin session expired. Please login again.");
      window.location.href = "http://localhost:5000/pages/admin-login.html";
    }
  }
}

// Display complaints function
function displayComplaints(complaints) {

  let total = 0, pending = 0, inProgress = 0, resolved = 0;
  const container = document.getElementById("complaintList");
  
  if (!container) {
    console.error("Complaint list container not found");
    return;
  }
  
  // Clear container
  container.innerHTML = "";
  
  if (complaints.length === 0) {
    container.innerHTML = "<p>No complaints found.</p>";
    updateStatistics(0, 0, 0, 0);
    return;
  }
  
  complaints.forEach((comp, index) => {
    total++;
    if (comp.status === "Pending") pending++;
    else if (comp.status === "In Progress") inProgress++;
    else if (comp.status === "Resolved") resolved++;
    
    const submittedDate = new Date(comp.submittedAt).toLocaleDateString();
    const studentName = comp.studentId ? (comp.studentId.fullName || 'Unknown Student') : 'Unknown Student';
    
    const div = document.createElement("div");
    div.className = "complaint";
    div.innerHTML = `
      <h4>${comp.title}</h4>
      <span class="status ${comp.status.toLowerCase().replace(/ /g, '-')}">${comp.status}</span>
      <span class="priority ${comp.priority.toLowerCase()}">${comp.priority} Priority</span>
      <p><strong>Student:</strong> ${studentName}</p>
      <p><strong>Category:</strong> ${comp.category}</p>
      <p><strong>Submitted:</strong> ${submittedDate}</p>
      <p><strong>Description:</strong> ${comp.description.substring(0, 100)}${comp.description.length > 100 ? '...' : ''}</p>
      <p><strong>Admin Response:</strong> ${comp.adminResponse || 'No response yet.'}</p>
      <button class="btn-manage" onclick="redirectToManage('${comp._id}')">
        <span class="material-icons">visibility</span> Manage
      </button>
    `;
    container.appendChild(div);
  });

  updateStatistics(total, pending, inProgress, resolved);
}

// Update statistics function
function updateStatistics(total, pending, inProgress, resolved) {
  const totalEl = document.getElementById("totalCount");
  const pendingEl = document.getElementById("pendingCount");
  const inProgressEl = document.getElementById("inProgressCount");
  const resolvedEl = document.getElementById("resolvedCount");
  
  if (totalEl) totalEl.innerText = total;
  if (pendingEl) pendingEl.innerText = pending;
  if (inProgressEl) inProgressEl.innerText = inProgress;
  if (resolvedEl) resolvedEl.innerText = resolved;
}

// Redirect to manage complaint
function redirectToManage(complaintId) {
  localStorage.setItem("selectedComplaintId", complaintId);
  window.location.href = "admin-view-complaint.html";
}

// Add logout functionality to window for global access
window.logout = async function() {
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
};