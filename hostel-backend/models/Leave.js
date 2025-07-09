const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: String,
  regNo: String,
  roomNo: String,
  leaveType: String,
  reason: String,
  startDate: Date,
  endDate: Date,
  parentContact: String,
  address: String,
  appliedOn: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
});

module.exports = mongoose.model('LeaveRequest', leaveSchema);
