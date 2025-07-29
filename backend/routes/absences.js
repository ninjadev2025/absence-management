const express = require('express');
const Absence = require('../models/Absence');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all absences (Manager and Admin)
router.get('/', auth, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { date, group, status } = req.query;
    let filter = {};

    if (date) filter.date = new Date(date);
    if (group) filter.group = group;
    if (status) filter.status = status;

    const absences = await Absence.find(filter)
      .populate('reportedBy', 'username')
      .sort({ date: -1 });
    
    res.json(absences);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get absences by reporter (Daily Reporter - own group only)
router.get('/my-reports', auth, authorize(['daily_reporter']), async (req, res) => {
  try {
    const absences = await Absence.find({ 
      reportedBy: req.user._id 
    }).sort({ date: -1 });
    
    res.json(absences);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create absence report (Daily Reporter only)
router.post('/', auth, authorize(['daily_reporter']), async (req, res) => {
  try {
    const { employeeName, employeeId, date, status, reason } = req.body;

    // Check if report already exists for this employee on this date
    const existingReport = await Absence.findOne({
      employeeId,
      date: new Date(date)
    });

    if (existingReport) {
      return res.status(400).json({ 
        message: 'Absence report already exists for this employee on this date' 
      });
    }

    const absence = new Absence({
      employeeName,
      employeeId,
      group: req.user.group,
      date: new Date(date),
      status,
      reason,
      reportedBy: req.user._id
    });

    await absence.save();
    await absence.populate('reportedBy', 'username');

    res.status(201).json(absence);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update absence report (Daily Reporter - own reports only, Admin - all)
router.put('/:id', auth, async (req, res) => {
  try {
    const { employeeName, employeeId, date, status, reason } = req.body;
    
    let filter = { _id: req.params.id };
    
    // Daily reporters can only update their own reports
    if (req.user.role === 'daily_reporter') {
      filter.reportedBy = req.user._id;
    } else if (!['admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const absence = await Absence.findOneAndUpdate(
      filter,
      { employeeName, employeeId, date: new Date(date), status, reason },
      { new: true }
    ).populate('reportedBy', 'username');

    if (!absence) {
      return res.status(404).json({ message: 'Absence report not found' });
    }

    res.json(absence);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete absence report (Admin only)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const absence = await Absence.findByIdAndDelete(req.params.id);
    
    if (!absence) {
      return res.status(404).json({ message: 'Absence report not found' });
    }

    res.json({ message: 'Absence report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get absence statistics (Manager and Admin)
router.get('/stats', auth, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { startDate, endDate, group } = req.query;
    
    let matchFilter = {};
    if (startDate && endDate) {
      matchFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (group) matchFilter.group = group;

    const stats = await Absence.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalReports = await Absence.countDocuments(matchFilter);
    
    res.json({
      totalReports,
      statusBreakdown: stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;