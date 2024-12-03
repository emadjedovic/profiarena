document
  .getElementById("addInterviewForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    fetch("/hr/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((newInterview) => {
        calendar.addEvent({
          id: newInterview.id,
          title: `${newInterview.talent_first_name} ${newInterview.talent_last_name} - ${newInterview.status_desc}`,
          start: new Date(newInterview.proposed_time).toISOString(),
          allDay: false,
        });
        $("#addInterviewModal").modal("hide");
      })
      .catch((error) => console.error("Error adding interview:", error));
  });
