async function loadCounts() {
  try {
    const res = await fetch("/api/counts");
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const data = await res.json();
    console.log("Counts response:", data);

    // update 
    const ids = {
      admins: "adminCount",
      academics: "academicCount",
      courses: "courseCount",
      subjects: "subjectCount",
      pastpapers: "pastpaperCount"
    };

    Object.entries(ids).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = data[key] ?? 0;
      else console.warn(`Element with id "${id}" not found`);
    });
  } catch (err) {
    console.error("Error loading counts:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadCounts);
