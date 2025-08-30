document.addEventListener("DOMContentLoaded", function () {
  // Fetch session info and complaint statistics
  loadDashboardData();
});

async function loadDashboardData() {
  try {
    console.log("🔄 Starting dashboard data load...");
    console.log("🍪 Current cookies:", document.cookie);
    console.log("🌐 Current location:", window.location.href);
    
    // Try the debug session endpoint first to check session status
    const debugResponse = await fetch("http://localhost:5000/login/debug-session", {
      method: "GET",
      credentials: "include",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log("🔍 Debug response status:", debugResponse.status);
    console.log("🔍 Debug response headers:", Object.fromEntries(debugResponse.headers.entries()));
    
    if (!debugResponse.ok) {
      console.error("❌ Debug session request failed:", debugResponse.status, debugResponse.statusText);
      throw new Error(`Debug session failed: ${debugResponse.status}`);
    }
    
    const debugData = await debugResponse.json();
    console.log("🔍 Debug session data:", debugData);
    
    if (!debugData.hasUser) {
      console.error("❌ No user session found");
      alert("Please log in to access the dashboard.");
      window.location.href = "http://localhost:5000/pages/login.html";
      return;
    }
    
    // If debug shows user exists, try the main session endpoint
    const sessionResponse = await fetch("http://localhost:5000/login/latest-session", {
      method: "GET",
      credentials: "include"
    });
    
    if (!sessionResponse.ok) {
      console.error("❌ Session endpoint failed:", sessionResponse.status);
      // Try using debug data as fallback
      if (debugData.user) {
        console.log("🔄 Using debug session data as fallback");
        updateUserInfo(debugData.user);
        return;
      } else {
        throw new Error('Session check failed');
      }
    }
    
    const sessionData = await sessionResponse.json();
    console.log("✅ Session data received:", sessionData);
    
    if (sessionData.success && sessionData.data) {
      const user = sessionData.data;
      console.log("👤 Logged in as:", user.name);
      updateUserInfo(user);
      await loadComplaintStatistics();
    } else {
      console.error("❌ Session data invalid:", sessionData);
      alert(sessionData.message || "Session expired");
      window.location.href = "http://localhost:5000/pages/login.html";
    }
  } catch (error) {
    console.error("❌ Dashboard data fetch error:", error);
    alert("Session expired or not logged in.");
    window.location.href = "http://localhost:5500/pages/login.html";
  }
}

function updateUserInfo(user) {
  // Update DOM elements
  const nameElement = document.getElementById("name");
  const usernameElement = document.getElementById("username");
  const facultyElement = document.getElementById("faculty");
  
  if (nameElement) nameElement.textContent = user.name;
  if (usernameElement) usernameElement.textContent = user.regno;
  if (facultyElement) facultyElement.textContent = user.faculty;
}

async function loadComplaintStatistics() {
  try {
    console.log("📊 Loading complaint statistics...");
    
    const complaintsResponse = await fetch("http://localhost:5000/send-complaint/my-complaints", {
      method: "GET",
      credentials: "include"
    });
    
    if (!complaintsResponse.ok) {
      console.error("❌ Failed to fetch complaints:", complaintsResponse.status);
      return;
    }
    
    const complaints = await complaintsResponse.json();
    console.log("📋 User complaints:", complaints);
    
    // Calculate statistics
    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(c => c.status === 'pending' || c.status === 'Pending').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved' || c.status === 'Resolved').length;
    const inProgressComplaints = complaints.filter(c => c.status === 'in-progress' || c.status === 'In Progress').length;
    
    // Update dashboard statistics
    const totalElement = document.querySelector('.stat-card:nth-child(1) .stat-number');
    const pendingElement = document.querySelector('.stat-card:nth-child(2) .stat-number');
    const resolvedElement = document.querySelector('.stat-card:nth-child(3) .stat-number');
    const inProgressElement = document.querySelector('.stat-card:nth-child(4) .stat-number');
    
    if (totalElement) totalElement.textContent = totalComplaints.toString().padStart(2, '0');
    if (pendingElement) pendingElement.textContent = pendingComplaints.toString().padStart(2, '0');
    if (resolvedElement) resolvedElement.textContent = resolvedComplaints.toString().padStart(2, '0');
    if (inProgressElement) inProgressElement.textContent = inProgressComplaints.toString().padStart(2, '0');
    
    console.log("✅ Statistics updated:", {
      total: totalComplaints,
      pending: pendingComplaints,
      resolved: resolvedComplaints,
      inProgress: inProgressComplaints
    });
    
  } catch (error) {
    console.error("❌ Error loading complaint statistics:", error);
  }
}


// Logout button handler
document.addEventListener("DOMContentLoaded", function() {
  const logoutButton = document.getElementById("logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", async function () {
      try {
        const response = await fetch("http://localhost:5000/login/logout", {
          method: "POST",
          credentials: "include"
        });

        const result = await response.json();
        alert(result.message);
        window.location.href = "http://localhost:5000/pages/login.html";
      } catch (error) {
        console.error("Logout failed:", error);
      }
    });
  }
});