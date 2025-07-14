const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/Leave');

router.get('/', (req, res) => {
  res.send('Leave route is working ');
});

router.post('/', async (req, res) => {
  try {
    console.log(' Received leave request:', req.body); 

    const leave = new LeaveRequest(req.body);
    const savedLeave = await leave.save();

    console.log(' Leave saved:', savedLeave);

    res.status(201).json(savedLeave);
  } catch (err) {
    console.error(' Error saving leave:', err);
    res.status(500).json({ message: 'Failed to submit leave request' });
  }
});


router.get('/student/:studentId', async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ studentId: req.params.studentId });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch student leaves' });
  }
});

router.get('/warden', async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().sort({ appliedOn: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leave requests for warden' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const updated = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update leave status' });
  }
});

module.exports = router;
