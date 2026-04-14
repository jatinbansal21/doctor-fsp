const Patient = require('../models/Patient');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/stats
exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPatients,
      newThisWeek,
      newThisMonth,
      genderStats,
      bloodGroupStats,
      admitTrend,
    ] = await Promise.all([
      Patient.countDocuments({ isDeleted: false }),
      Patient.countDocuments({ isDeleted: false, createdAt: { $gte: startOfWeek } }),
      Patient.countDocuments({ isDeleted: false, createdAt: { $gte: startOfMonth } }),
      Patient.aggregate([
        { $match: { isDeleted: false, gender: { $ne: null } } },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),
      Patient.aggregate([
        { $match: { isDeleted: false, bloodGroup: { $ne: null } } },
        { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      ]),
      // Last 7 days admit trend
      Patient.aggregate([
        {
          $match: {
            isDeleted: false,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        newThisWeek,
        newThisMonth,
        genderStats,
        bloodGroupStats,
        admitTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};
