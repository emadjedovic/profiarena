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
  