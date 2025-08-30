let allComplaints = [];
let filteredComplaints = [];

document.addEventListener("DOMContentLoaded", async function() {
  console.log("🚀 Student View Complaints page loaded");
  
  // Add a small delay to ensure DOM is fully rendered
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Debug: log all elements with IDs
  const allElements = document.querySelectorAll('[id]');
  console.log("🔍 All elements with IDs:", Array.from(allElements).map(el => el.id));
  
  // Check if required elements exist
  const requiredElements = ['complaintsList', 'statusFilter', 'searchInput'];
  const missingElements = requiredElements.filter(id => {
    const element = document.getElementById(id);
    console.log(`🔍 Checking element '${id}':`, element);
    return !element;
  });
  
  if (missingElements.length > 0) {
    console.error("❌ Missing required elements:", missingElements);
    console.log("⚠️ Continuing despite missing elements...");
    
    // Show a user-friendly message in the complaintsList if it exists
    const container = document.getElementById("complaintsList");
    if (container) {
      container.innerHTML = `
        <div class="error">
          <h3>⚠️ Page Loading Issue</h3>
          <p>Some page elements are not loading correctly.</p>
          <p>Missing elements: ${missingElements.join(', ')}</p>
          <p>Please refresh the page or contact support if this continues.</p>
          <button onclick="location.reload()" style="padding: 10px 20px; margin: 10px; background: #6c63ff; color: white; border: none; border-radius: 5px; cursor: pointer;">Refresh Page</button>
        </div>
      `;
    }
  }
  
  // First check if user has a session
  try {
    const sessionCheck = await fetch("http://localhost:5000/login/debug-session", {
      method: "GET",
      credentials: "include"
    });
    
    if (sessionCheck.ok) {
      const sessionData = await sessionCheck.json();
      console.log("🔍 Session check result:", sessionData);
      
      if (!sessionData.hasUser) {
        console.log("❌ No user session found");
        const container = document.getElementById("complaintsList");
        if (container) {
          container.innerHTML = `
            <div class="error" style="text-align: center; padding: 40px;">
              🔐 <strong>Please Login First</strong><br><br>
              You need to login to view your complaints<br><br>
              <a href="http://localhost:5000/pages/login.html" class="btn-primary" style="background: linear-gradient(45deg, #6c63ff, #5a54e1); color: white; padding: 12px 24px; border: none; border-radius: 10px; font-weight: 600; text-decoration: none; display: inline-block;">Go to Login</a>
            </div>
          `;
        }
        // Continue to show the page structure for debugging
        console.log("⚠️ Continuing to show page structure for debugging...");
      }
    }
    
    await loadComplaints();
  } catch (error) {
    console.error("❌ Error in DOMContentLoaded:", error);
    const container = document.getElementById("complaintsList");
    if (container) {
      container.innerHTML = `<div class="error">⚠️ Error initializing page: ${error.message}</div>`;
    }
  }
});

// Load complaints from backend
async function loadComplaints() {
  const container = document.getElementById("complaintsList");
  console.log("📋 Loading complaints for student...");
  
  if (!container) {
    console.error("❌ complaintsList container not found!");
    return;
  }
  
  try {
    // Show loading
    container.innerHTML = '<div class="loading">📋 Loading your complaints...</div>';
    console.log("🔄 Fetching from: http://localhost:5000/send-complaint/my-complaints");
    
    // Fetch complaints from backend
    const response = await fetch("http://localhost:5000/send-complaint/my-complaints", {
      method: "GET",
      credentials: "include"
    });
    
    console.log("📡 Response status:", response.status);
    console.log("📡 Response headers:", Object.fromEntries(response.headers));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log("✅ Received complaints data:", responseData);
    
    allComplaints = responseData;
    filteredComplaints = [...allComplaints];
    
    console.log("📊 Total complaints:", allComplaints.length);
    
    displayComplaints();
    updateStatistics();
    setupEventListeners(); // Only setup event listeners after successful loading
    
  } catch (error) {
    console.error("❌ Error fetching complaints:", error);
    container.innerHTML = `<div class="error">⚠️ Error loading complaints: ${error.message}<br><small>Check browser console for details</small></div>`;
    
    // If unauthorized, provide login prompt
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log("🔄 User needs to login to view complaints");
      container.innerHTML = `
        <div class="error" style="text-align: center; padding: 40px;">
          🔐 <strong>Login Required</strong><br><br>
          You need to login to view your complaints<br><br>
          <a href="http://localhost:5000/pages/login.html" class="btn-primary" style="background: linear-gradient(45deg, #6c63ff, #5a54e1); color: white; padding: 12px 24px; border: none; border-radius: 10px; font-weight: 600; text-decoration: none; display: inline-block;">Login Now</a>
        </div>
      `;
      
      // Auto-redirect after 5 seconds
      setTimeout(() => {
        window.location.href = "http://localhost:5000/pages/login.html";
      }, 5000);
    }
  }
}

// Display complaints
function displayComplaints() {
  const container = document.getElementById("complaintsList");
  console.log("🎨 Displaying complaints. Count:", filteredComplaints.length);
  
  if (!container) {
    console.error("❌ complaintsList container not found in displayComplaints!");
    return;
  }
  
  if (filteredComplaints.length === 0) {
    console.log("📝 No complaints to display");
    container.innerHTML = `
      <div class="empty-state">
        <h3>📝 No complaints found</h3>
        <p>You haven't submitted any complaints yet or none match your current filter.</p>
        <a href="complaint-category.html" class="btn-primary">Submit New Complaint</a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = "";
  
  filteredComplaints.forEach((complaint) => {
    const div = document.createElement("div");
    div.className = "complaint-card";
    
    const submittedDate = new Date(complaint.submittedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Truncate description for card view
    const shortDescription = complaint.description.length > 150 
      ? complaint.description.substring(0, 150) + '...' 
      : complaint.description;
    
    div.innerHTML = `
      <div class="complaint-header">
        <h3 class="complaint-title">${complaint.title}</h3>
        <div class="badges">
          <span class="status ${complaint.status.toLowerCase().replace(/ /g, '-')}">${complaint.status}</span>
          <span class="priority ${complaint.priority.toLowerCase()}">${complaint.priority}</span>
        </div>
      </div>
      
      <p class="complaint-description">${shortDescription}</p>
      
      <div class="complaint-meta">
        <div class="info-line">
          <strong>📂 Category:</strong> ${complaint.category}
        </div>
        <div class="info-line">
          <strong>📅 Submitted:</strong> ${submittedDate}
        </div>
        <div class="info-line">
          <strong>🔄 Status:</strong> ${complaint.status}
        </div>
        <div class="info-line">
          <strong>⚡ Priority:</strong> ${complaint.priority}
        </div>
      </div>
      
      ${complaint.evidence && complaint.evidence.length > 0 ? `
        <div class="evidence-section">
          <div class="evidence-title">📎 Evidence Files (${complaint.evidence.length})</div>
          <div class="evidence-files">
            ${complaint.evidence.map(file => `
              <span class="evidence-file" onclick="downloadFile('${file.url}', '${file.filename}')">
                ${file.filename}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="response-box">
        <strong>💬 Admin Response:</strong>
        <span class="${complaint.adminResponse ? '' : 'no-response'}">
          ${complaint.adminResponse || 'Awaiting response from admin team...'}
        </span>
      </div>
      
      <div class="complaint-actions">
        <button class="btn-view" onclick="viewDetails('${complaint._id}')">
          <span class="material-icons">visibility</span>
          View Details
        </button>
      </div>
    `;
    
    container.appendChild(div);
  });
}

// Update statistics
function updateStatistics() {
  const total = allComplaints.length;
  const pending = allComplaints.filter(c => c.status === 'Pending').length;
  const inProgress = allComplaints.filter(c => c.status === 'In Progress').length;
  const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
  
  const totalEl = document.getElementById('totalComplaints');
  const pendingEl = document.getElementById('pendingComplaints');
  const inProgressEl = document.getElementById('inProgressComplaints');
  const resolvedEl = document.getElementById('resolvedComplaints');
  
  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (inProgressEl) inProgressEl.textContent = inProgress;
  if (resolvedEl) resolvedEl.textContent = resolved;
}

// Setup event listeners
function setupEventListeners() {
  // Status filter
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', applyFilters);
  } else {
    console.error('❌ statusFilter element not found');
  }
  
  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  } else {
    console.error('❌ searchInput element not found');
  }
}

// Apply filters
function applyFilters() {
  const statusFilterElement = document.getElementById('statusFilter');
  const searchInputElement = document.getElementById('searchInput');
  
  if (!statusFilterElement || !searchInputElement) {
    console.error('❌ Filter elements not found');
    return;
  }
  
  const statusFilter = statusFilterElement.value;
  const searchTerm = searchInputElement.value.toLowerCase();
  
  filteredComplaints = allComplaints.filter(complaint => {
    // Status filter
    const statusMatch = statusFilter === 'all' || complaint.status === statusFilter;
    
    // Search filter
    const searchMatch = searchTerm === '' || 
      complaint.title.toLowerCase().includes(searchTerm) ||
      complaint.description.toLowerCase().includes(searchTerm) ||
      complaint.category.toLowerCase().includes(searchTerm);
    
    return statusMatch && searchMatch;
  });
  
  displayComplaints();
}

// View detailed complaint
function viewDetails(complaintId) {
  // Store complaint ID and redirect to detailed view
  localStorage.setItem("selectedComplaintId", complaintId);
  window.location.href = "view-complaint-student.html";
}

// Download evidence file
function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = `http://localhost:5000${url}`;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}