const express = require('express');
const router = express.Router();
const { client } = require('../db/connect');  // Assuming you're using a client to query the database
const queries = require('../db/queries');

// Define the route to fetch job details by job ID
router.get('/job/:id', async (req, res, next) => {
    try {
        // Fix the query by choosing a valid alias (e.g., 'status_table')
        const result = await client.query(
          queries.getJobPostingByIdSQL, // Use double quotes for case-sensitive table name
          [req.params.id]
        );
    
        // Correct the alias for Application_Status and Application
        const status = await client.query(
          queries.getApplicationStatusSQL,
          [req.params.id, req.user.id] // Assuming you're filtering by job_posting_id in Application table
        );
    
        if (result.rows.length > 0) {
          res.json({
            job: result.rows[0],
            status: status.rows,
          });
        } else {
          res.status(404).json({ message: 'Job not found' });
        }
      } catch (error) {
        console.log(`Error fetching job (api): ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
      }
});

module.exports = router;
