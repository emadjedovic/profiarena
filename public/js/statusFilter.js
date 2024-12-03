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
  