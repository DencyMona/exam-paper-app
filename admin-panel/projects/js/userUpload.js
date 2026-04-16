const BASE_URL = "http://192.168.18.47:3000";
const API_URL = `${BASE_URL}/api/papers`;

const tableBody = document.getElementById("papersTableBody");

// Load papers into table
async function loadPapers() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Failed to fetch papers: ${res.status}`);
    
    const papers = await res.json();
    console.log("Papers API Response:", papers);

    tableBody.innerHTML = "";

    if (papers.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="10" class="text-center">No papers found</td></tr>`;
      return;
    }

    papers.forEach((paper, index) => {
      const academicName = paper.academic_name || paper.academic_id;
      const courseName   = paper.course_name   || paper.course_id;
      const yearName     = paper.year_name     || paper.year_id;
      const subjectName  = paper.subject_name  || paper.subject_id;

      const examYear   = paper.exam_year || paper.examYear || "-";
      const uploadedAt = paper.uploaded_at || paper.uploadedAt || "-";
      const filePath   = paper.file_path || paper.filePath;
      const approved   = paper.approved || paper.status || 0; 

      const viewLink = filePath
        ? `<a href="${BASE_URL}/${filePath}" target="_blank" class="btn btn-sm btn-success">View</a>`
        : `<span class="text-muted">No file</span>`;

      const approveBtn = approved
        ? `<button class="btn btn-success btn-sm" disabled>Approved</button>`
        : `<button class="btn btn-warning btn-sm" onclick="approvePaper(${paper.paper_id || paper.id})">Approve</button>`;

      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${academicName}</td>
          <td>${courseName}</td>
          <td>${yearName}</td>
          <td>${subjectName}</td>
          <td>${examYear}</td>
          <td>${viewLink}</td>
          <td>${uploadedAt !== "-" ? new Date(uploadedAt).toLocaleString() : "-"}</td>
          <td>
            ${approveBtn}
            <button class="btn btn-danger btn-sm" onclick="deletePaper(${paper.paper_id || paper.id})">Remove</button>
          </td>
        </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });

  } catch (err) {
    console.error("❌ Error loading papers:", err);
    tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">Failed to load papers</td></tr>`;
  }
}

// Approve Paper
async function approvePaper(id) {
  if (!confirm("Approve this paper?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ Paper approved successfully!");
      loadPapers(); 
    } else {
      alert("❌ Failed to approve paper: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Error approving paper:", err);
    alert("⚠️ Error approving paper.");
  }
}

// Remove Paper
async function deletePaper(id) {
  if (!confirm("Are you sure you want to delete this paper?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (data.success) {
      alert("✅ Paper deleted successfully!");
      loadPapers();
    } else {
      alert("❌ Failed to delete paper: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Error deleting paper:", err);
    alert("⚠️ Error deleting paper.");
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", loadPapers);
