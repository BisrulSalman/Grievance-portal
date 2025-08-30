const express = require("express");
const router = express.Router();
const Complaint = require("../models/complaint_model");
const { verifyUserSession, verifyAdminSession } = require("../middleware/sessionAuth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Submit a complaint
router.post("/submit", verifyUserSession, upload.array("evidence"), async (req, res) => {
  try {
    const user = req.session.user;

    const { title, description, priority, category } = req.body;
    
    console.log("📝 Complaint submission request:", { title, description, priority, category, filesCount: req.files.length });

    const evidence = req.files.map((file) => ({
      filename: file.filename,
      filetype: file.mimetype,
      url: `/uploads/${file.filename}`,
    }));

    const complaint = new Complaint({
      studentId: user.id,
      title,
      description,
      priority,
      category,
      evidence,
    });

    await complaint.save();
    res.status(201).json({ message: "Complaint submitted successfully!" });
  } catch (err) {
    console.error("Error submitting complaint:", err);
    res.status(500).json({ error: "Failed to submit complaint", details: err.message });
  }
});

// Get all complaints (admin view)
router.get("/admin/all", verifyAdminSession, async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("studentId", "fullName registrationNumber faculty").sort({ submittedAt: -1 });
    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaints", details: err.message });
  }
});

// Get specific complaint (admin view)
router.get("/admin/complaint/:id", verifyAdminSession, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("studentId", "fullName registrationNumber faculty");
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    res.status(200).json(complaint);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaint", details: err.message });
  }
});

// Update complaint (admin action)
router.put("/admin/update/:id", verifyAdminSession, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    
    if (!status || !adminResponse) {
      return res.status(400).json({ error: "Status and admin response are required" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        adminResponse,
        updatedAt: new Date()
      },
      { new: true }
    ).populate("studentId", "fullName registrationNumber faculty");

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.status(200).json({ 
      message: "Complaint updated successfully", 
      complaint 
    });
  } catch (err) {
    console.error("Error updating complaint:", err);
    res.status(500).json({ error: "Failed to update complaint", details: err.message });
  }
});

// Debug route for complaints
router.get("/debug-complaints", async (req, res) => {
  try {
    console.log("🔍 Debug complaints route hit");
    console.log("🔍 Session info:", {
      hasSession: !!req.session,
      hasUser: !!req.session.user,
      sessionId: req.sessionID,
      userId: req.session.user?.id
    });
    
    if (req.session.user) {
      const complaints = await Complaint.find({ studentId: req.session.user.id }).sort({ submittedAt: -1 });
      console.log(`📋 Found ${complaints.length} complaints for user: ${req.session.user.name}`);
      res.status(200).json({ 
        success: true,
        hasSession: true, 
        userId: req.session.user.id,
        complaints: complaints 
      });
    } else {
      res.status(200).json({ 
        success: false,
        hasSession: false, 
        message: "No user session found" 
      });
    }
  } catch (err) {
    console.error("❌ Error in debug complaints:", err);
    res.status(500).json({ error: "Error in debug route", details: err.message });
  }
});

// Get student complaints (student view)
router.get("/my-complaints", verifyUserSession, async (req, res) => {
  try {
    const user = req.session.user;

    const complaints = await Complaint.find({ studentId: user.id }).sort({ submittedAt: -1 });
    console.log(`📋 Fetched ${complaints.length} complaints for user: ${user.name}`);
    res.status(200).json(complaints);
  } catch (err) {
    console.error("Error fetching user complaints:", err);
    res.status(500).json({ error: "Failed to fetch user complaints", details: err.message });
  }
});

module.exports = router;
