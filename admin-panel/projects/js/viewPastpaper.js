const pastpaperTableBody = document.querySelector("#pastpaperTable tbody");
const searchInput = document.getElementById("searchInput");

// Get subject_id from URL
const urlParams = new URLSearchParams(window.location.search);
const subjectId = urlParams.get("subject_id");

let pastpapers = []; 

// Fetch pastpapers
async function loadPastpapers() {
  try {
    let url = subjectId
      ? `/api/pastpaper/bySubject/${subjectId}`
      : `/api/pastpaper`; 

    const res = await fetch(url);
    pastpapers = await res.json();
    renderTable(pastpapers);
  } catch (err) {
    console.error("Error loading pastpapers:", err);
    pastpaperTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Failed to load pastpapers.</td></tr>`;
  }
}

// Render table rows
function renderTable(papers) {
  if (papers.length === 0) {
    pastpaperTableBody.innerHTML = `<tr><td colspan="5" class="text-center">No past papers found.</td></tr>`;
    return;
  }

  pastpaperTableBody.innerHTML = "";
  // inside renderTable when creating each row
papers.forEach((p, index) => {
  // Normalize to "uploads/pastpapers/xxx.pdf" (strip any leading directories before 'uploads')
  const webPath = p.file_path.replace(/.*uploads[\\/]/i, "uploads/").replace(/\\/g, "/");
  const fileName = p.file_path.split(/[/\\]/).pop();

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${index + 1}</td>
    <td>${p.subject_name}</td>
    <td>${p.exam_year}</td>
    <td><a href="/${webPath}" target="_blank">${fileName}</a></td>
    <td>
      <button class="btn btn-sm btn-danger" onclick="deletePastpaper(${p.pastpaper_id})">Delete</button>
    </td>
  `;
  pastpaperTableBody.appendChild(tr);
});

}

// Delete pastpaper
async function deletePastpaper(id) {
  if (!confirm("Are you sure you want to delete this pastpaper?")) return;

  try {
    const res = await fetch(`/api/pastpaper/${id}`, { method: "DELETE" });
    if (res.ok) {
      pastpapers = pastpapers.filter(p => p.pastpaper_id !== id); // remove from local array
      renderTable(pastpapers);
      alert("Pastpaper deleted successfully!");
    } else {
      alert("Failed to delete pastpaper.");
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("Error deleting pastpaper.");
  }
}

// Live search by subject name OR exam year
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = pastpapers.filter(p =>
    p.subject_name.toLowerCase().includes(query) ||
    p.exam_year.toString().includes(query)
  );
  renderTable(filtered);
});

// Initial load
document.addEventListener("DOMContentLoaded", loadPastpapers);
