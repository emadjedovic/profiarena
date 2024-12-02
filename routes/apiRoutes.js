const express = require('express');
const router = express.Router();
const { client } = require('../db/connect');

const {
  getApplicationStatusSQL
} = require("../db/queries/appQueries");
const {
  getJobPostingByIdSQL
} = require("../db/queries/jobPostingQueries");


router.get('/job/:id', async (req, res, next) => {
    try {
        
        const result = await client.query(
          getJobPostingByIdSQL, 
          [req.params.id]
        );
    
        
        const status = await client.query(
          getApplicationStatusSQL,
          [req.params.id, req.user.id] 
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
