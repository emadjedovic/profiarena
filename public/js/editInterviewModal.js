document
  .getElementById("editInterviewForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    fetch(`/hr/interviews/${data.id}`, {
      method: "PUT", // Use PUT for updating
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((updatedInterview) => {
        // Update the event in FullCalendar
        const event = calendar.getEventById(updatedInterview.id);
        event.setProp(
          "title",
          `${updatedInterview.talent_first_name} ${updatedInterview.talent_last_name} - ${updatedInterview.status_desc}`
        );
        event.setStart(updatedInterview.proposed_time);
        event.setExtendedProp("status_id", updatedInterview.status_id);
        event.setExtendedProp("review", updatedInterview.review);

        // Close the modal
        $("#editInterviewModal").modal("hide");
      })
      .catch((error) => console.error("Error editing interview:", error));
  });

// Handle Delete Interview Button Click
document
  .getElementById("deleteInterviewBtn")
  .addEventListener("click", function () {
    const interviewId = document.getElementById("interview_id").value;

    if (confirm("Are you sure you want to delete this interview?")) {
      fetch(`/hr/interviews/${interviewId}`, {
        method: "DELETE", // Use DELETE for removing
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          if (response.ok) {
            // Remove the event from FullCalendar
            const event = calendar.getEventById(interviewId);
            if (event) {
              event.remove(); // Removes the event from the calendar
            }

            // Close the modal
            $("#editInterviewModal").modal("hide");

            alert("Interview deleted successfully");
          } else {
            alert("Failed to delete interview");
          }
        })
        .catch((error) => {
          console.error("Error deleting interview:", error);
          alert("Error deleting interview");
        });
    }
  });
