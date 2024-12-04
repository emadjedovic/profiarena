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
