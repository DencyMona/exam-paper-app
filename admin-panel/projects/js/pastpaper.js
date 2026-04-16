const pastPaperForm = document.getElementById("pastPaperForm");

const urlParams = new URLSearchParams(window.location.search);
const subjectId = urlParams.get("subject_id");

document.addEventListener("DOMContentLoaded", async () => {
  if (!subjectId) {
    document.getElementById("academicName").textContent = "N/A";
    document.getElementById("courseName").textContent = "N/A";
    document.getElementById("yearName").textContent = "N/A";
    return;
  }

  try {
    const res = await fetch(`/api/subject/${subjectId}`);
    const data = await res.json();

    if (res.ok) {
      document.getElementById("academicName").textContent = data.academic || "N/A";
      document.getElementById("courseName").textContent = data.course || "N/A";
      document.getElementById("yearName").textContent = data.year || "N/A";
    } else {
      document.getElementById("academicName").textContent = "Error";
      document.getElementById("courseName").textContent = "Error";
      document.getElementById("yearName").textContent = "Error";
    }
  } catch (err) {
    console.error("Error fetching subject info:", err);
    document.getElementById("academicName").textContent = "Error";
    document.getElementById("courseName").textContent = "Error";
    document.getElementById("yearName").textContent = "Error";
  }
});

pastPaperForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const examYear = document.getElementById("examYear").value;
  const paperFile = document.getElementById("paperFile").files[0];

  if (!subjectId) {
    alert("Subject ID not found in URL.");
    return;
  }

  if (!examYear || !paperFile) {
    alert("Please fill all fields and select a file.");
    return;
  }

  const formData = new FormData();
  formData.append("subject_id", subjectId);
  formData.append("exam_year", examYear);
  formData.append("file", paperFile);

  try {
    const response = await fetch("/api/pastpaper", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message || "Pastpaper added successfully!");
      pastPaperForm.reset();
    } else {
      alert(data.error || "Failed to add pastpaper.");
    }
  } catch (err) {
    console.error("Error uploading pastpaper:", err);
    alert("Upload failed. Check console for details.");
  }
});
