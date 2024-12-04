const { client } = require("../db/connect");

exports.getDashboardData = async (req, res) => {
    const stats = {};
  
    try {
      // Fetch stats
      const totalApplicationsResult = await client.query(`SELECT COUNT(*) AS total FROM "Application"`);
      stats.totalApplications = totalApplicationsResult.rows[0].total || 0;
  
      const avgScoreResult = await client.query(`SELECT AVG(total_score) AS avg_score FROM "Application_Score"`);
      stats.avgCandidateScore = avgScoreResult.rows[0].avg_score || 0;
  
      const avgSelectionTimeResult = await client.query(`
        SELECT AVG(EXTRACT(EPOCH FROM (selected_at - submitted_at)) / 3600) AS avg_time
        FROM "Application"
        WHERE selected_at IS NOT NULL;
      `);
  
      stats.avgSelectionTime = isNaN(stats.avgSelectionTime) ? null : Number(stats.avgSelectionTime);
      res.render('hr/dashboard', { stats, currentPath: req.originalUrl });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.render('hr/dashboard', { stats: { totalApplications: 0, avgCandidateScore: 0, avgSelectionTime: 0 }, currentPath: req.originalUrl });
    }
  };
  
