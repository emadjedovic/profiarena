document.addEventListener("DOMContentLoaded", () => {
  const createJobBtn = document.getElementById("createJobBtn");
  const jobModal = document.getElementById("jobModal");
  const closeModalBtn = document.getElementById("closeModalBtn");

  
  createJobBtn.onclick = function () {
    jobModal.style.display = "block";
  };

  
  closeModalBtn.onclick = function () {
    jobModal.style.display = "none";
  };

  
  window.onclick = function (event) {
    if (event.target === jobModal) {
      jobModal.style.display = "none";
    }
  };
});

document.addEventListener("DOMContentLoaded", function () {
  
  const buttons = document.querySelectorAll('[data-bs-toggle="modal"]');

  
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const jobData = JSON.parse(button.getAttribute("data-job")); 

      
      const modal = document.getElementById("applyJobModal");

      
      document.getElementById("modalJobTitle").textContent = jobData.title;
      document.getElementById("modalJobId").value = jobData.id;
      document.getElementById("modalCompany").textContent = jobData.company;
      document.getElementById("modalCity").textContent = jobData.city;
      document.getElementById("modalDeadline").textContent = new Date(
        jobData.application_deadline
      ).toLocaleDateString();
      document.getElementById("modalDescription").textContent =
        jobData.description;

      
      document.getElementById("cvField").style.display = jobData.cv_field
        ? "block"
        : "none";
      document.getElementById("coverLetterField").style.display =
        jobData.cover_letter_field ? "block" : "none";
      document.getElementById("projectsField").style.display =
        jobData.projects_field ? "block" : "none";
      document.getElementById("certificatesField").style.display =
        jobData.certificates_field ? "block" : "none";

      
      const form = modal.querySelector("form");
      form.setAttribute("action", `/talent/jobs/${jobData.id}/apply`);

      form.reset();

      
      const cvInput = document.getElementById("cv");
      const coverLetterInput = document.getElementById("cover_letter");

      if (jobData.cv_field) {
        cvInput.setAttribute("required", "required");
      } else {
        cvInput.removeAttribute("required");
      }

      if (jobData.cover_letter_field) {
        coverLetterInput.setAttribute("required", "required");
      } else {
        coverLetterInput.removeAttribute("required");
      }
    });
  });
});


document.getElementById("statusFilter").addEventListener("change", function () {
  const selectedStatus = this.value;
  const rows = document.querySelectorAll(".application-row");

  rows.forEach((row) => {
    const rowStatus = row.dataset.status;

    
    if (selectedStatus === "all" || rowStatus === selectedStatus) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});
