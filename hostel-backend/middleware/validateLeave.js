const validateLeaveRequest = (req, res, next) => {
  const { studentId, leaveType, reason, startDate, endDate, parentContact, address } = req.body;

  if (!studentId || !leaveType || !reason || !startDate || !endDate || !parentContact || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({ message: 'End date must be after start date' });
  }

  if (!/^[\d\s+-]{10,15}$/.test(parentContact)) {
    return res.status(400).json({ message: 'Invalid contact number format' });
  }

  next();
};

module.exports = validateLeaveRequest;