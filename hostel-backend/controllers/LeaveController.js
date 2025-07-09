// LeaveController.js
const LeaveRequest = require('../models/LeaveRequest');

// Get all leave requests (for warden)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().sort({ appliedOn: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leave requests' });
  }
};
