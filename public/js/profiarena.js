document.addEventListener('DOMContentLoaded', () => {
    const createJobBtn = document.getElementById("createJobBtn");
    const jobModal = document.getElementById("jobModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
  
    // Open modal when button is clicked
    createJobBtn.onclick = function() {
      jobModal.style.display = "block";
    };
  
    // Close modal when "Close" button is clicked
    closeModalBtn.onclick = function() {
      jobModal.style.display = "none";
    };
  
    // Close modal if user clicks outside of the modal
    window.onclick = function(event) {
      if (event.target === jobModal) {
        jobModal.style.display = "none";
      }
    };
  });

  document.addEventListener('DOMContentLoaded', function () {
    // Get all buttons that open the modal
    var buttons = document.querySelectorAll('[data-bs-toggle="modal"]');
    
    buttons.forEach(function(button) {
      button.addEventListener('click', function(event) {
        // Get the job ID from the button's data attribute
        var jobId = button.getAttribute('data-job-id');
        
        // Get the modal and the form inside it
        var modal = document.getElementById('applyJobModal');
        var form = modal.querySelector('form');
    
        // Set the form action dynamically
        form.setAttribute('action', '/talent/jobs/' + jobId + '/apply');
        
        // Set the hidden job ID input value
        var jobPostingIdInput = modal.querySelector('#jobPostingId');
        jobPostingIdInput.value = jobId;
  
        // Fetch the job details from the new API route
        fetch(`/api/job/${jobId}`)
          .then(response => response.json())
          .then(data => {
            if (data.job) {
              var job = data.job;  // Job details
              var status = data.status;  // Application status details
  
              // Populate the modal with job data
              var cvField = modal.querySelector('#cv');
              var coverLetterField = modal.querySelector('#cover_letter');
              var projectsField = modal.querySelector('#projects');
              var certificatesField = modal.querySelector('#certificates');
  
              if (job.cv_field) {
                cvField.required = true; // Set CV field as required if cv_field is true
              }
              if (job.cover_letter_field) {
                coverLetterField.required = true; // Set Cover Letter field as required
              }
              if (job.projects_field) {
                projectsField.style.display = 'block'; // Show project field if needed
              }
              if (job.certificates_field) {
                certificatesField.multiple = true; // Allow multiple certificates if required
              }
  
              // Additional logic for populating status, etc.
            }
          })
          .catch(error => {
            console.error('Error fetching job details:', error);
          });
      });
    });
  });
  