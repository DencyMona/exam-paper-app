const academicTable = document.querySelector("#academicTable tbody");

// Load all academics
async function loadAcademics() {
  const res = await fetch("/api/academic");
  const academics = await res.json();

  academicTable.innerHTML = "";

  academics.forEach(ac => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${ac.academic_id}</td>
      <td><input type="text" value="${ac.academic_name}" class="form-control"></td>
      <td>
        <button class="btn btn-warning btn-sm edit-btn">Edit</button>
        <button class="btn btn-danger btn-sm delete-btn">Delete</button>
      </td>
    `;

    // Edit button 
    tr.querySelector(".edit-btn").addEventListener("click", async () => {
      const newName = tr.querySelector("input").value;
      await fetch(`/api/academic/${ac.academic_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academic_name: newName })
      });
      loadAcademics();
    });

    // Delete button
    tr.querySelector(".delete-btn").addEventListener("click", async () => {
      if (confirm("Are you sure to delete this academic?")) {
        await fetch(`/api/academic/${ac.academic_id}`, { method: "DELETE" });
        loadAcademics();
      }
    });

    academicTable.appendChild(tr);
  });
}

loadAcademics();
