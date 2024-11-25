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
    const buttons = document.querySelectorAll('[data-bs-toggle="modal"]');
  
    // Add click event listener to each button
    buttons.forEach(button => {
      button.addEventListener('click', function () {
        const jobData = JSON.parse(button.getAttribute('data-job')); // Get the full job object
  
        // Get the modal elements
        const modal = document.getElementById('applyJobModal');
        
        // Populate modal fields with job data
        document.getElementById('modalJobTitle').textContent = jobData.title;
        document.getElementById('modalJobId').value = jobData.id;
        document.getElementById('modalCompany').textContent = jobData.company;
        document.getElementById('modalCity').textContent = jobData.city;
        document.getElementById('modalDeadline').textContent = new Date(jobData.application_deadline).toLocaleDateString();
        document.getElementById('modalDescription').textContent = jobData.description;
  
        // Show/hide fields based on job requirements
        document.getElementById('cvField').style.display = jobData.cv_field ? 'block' : 'none';
        document.getElementById('coverLetterField').style.display = jobData.cover_letter_field ? 'block' : 'none';
        document.getElementById('projectsField').style.display = jobData.projects_field ? 'block' : 'none';
        document.getElementById('certificatesField').style.display = jobData.certificates_field ? 'block' : 'none';
  
        // Set the form's action dynamically
        const form = modal.querySelector('form');
        form.setAttribute('action', `/talent/jobs/${jobData.id}/apply`);
      });
    });
  });
  