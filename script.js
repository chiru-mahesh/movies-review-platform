const apiKey = "9dacaac2"; // <-- replace this with your OMDB key
let currentMovieId = null;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchBtn").addEventListener("click", searchMovie);
  document.getElementById("movieInput").addEventListener("keyup", (e) => { if (e.key === "Enter") searchMovie(); });
  document.getElementById("submitReview").addEventListener("click", addReview);
});

async function searchMovie() {
  const q = document.getElementById("movieInput").value.trim();
  if (!q) { alert("Please enter a movie name"); return; }

  try {
    const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(q)}&apikey=${apiKey}`);
    const data = await res.json();
    if (data.Response === "False") {
      showMessage("Movie not found. Try a different title.");
      return;
    }
    renderMovie(data);
  } catch (err) {
    console.error("Fetch error:", err);
    showMessage("Network error. Check console.");
  }
}

function renderMovie(data) {
  currentMovieId = data.imdbID;
  const poster = (data.Poster && data.Poster !== "N/A") ? data.Poster : "https://via.placeholder.com/150x225?text=No+Poster";
  const html = `
    <img src="${poster}" alt="Poster" onerror="this.src='https://via.placeholder.com/150x225?text=No+Poster'"/>
    <div class="info">
      <h2>${escapeHtml(data.Title)} (${escapeHtml(data.Year)})</h2>
      <p><strong>Genre:</strong> ${escapeHtml(data.Genre)}</p>
      <p>${escapeHtml(data.Plot)}</p>
      <p><strong>IMDB Rating:</strong> ${escapeHtml(data.imdbRating)}</p>
    </div>
  `;
  document.getElementById("movieDetails").innerHTML = html;
  document.getElementById("reviewsSection").style.display = "block";
  loadReviews();
}

function loadReviews() {
  if (!currentMovieId) return;
  const key = "reviews_" + currentMovieId;
  const reviews = JSON.parse(localStorage.getItem(key)) || [];
  const container = document.getElementById("reviewsList");
  if (reviews.length === 0) {
    container.innerHTML = "<p>No reviews yet. Be the first!</p>";
    return;
  }
  container.innerHTML = reviews.map(r => `
    <div class="review">
      <p><strong>Rating:</strong> ${r.rating}/5</p>
      <p>${escapeHtml(r.comment)}</p>
      <p class="meta">${new Date(r.time).toLocaleString()}</p>
    </div>
  `).join("");
}

function addReview() {
  if (!currentMovieId) { alert("Search a movie first"); return; }
  const rating = document.getElementById("rating").value;
  const comment = document.getElementById("comment").value.trim();
  if (!rating || !comment) { alert("Please provide rating and review"); return; }
  const key = "reviews_" + currentMovieId;
  const reviews = JSON.parse(localStorage.getItem(key)) || [];
  reviews.push({ rating: Number(rating), comment, time: Date.now() });
  localStorage.setItem(key, JSON.stringify(reviews));
  document.getElementById("rating").value = "";
  document.getElementById("comment").value = "";
  loadReviews();
}

function showMessage(msg) {
  document.getElementById("movieDetails").innerHTML = `<p>${escapeHtml(msg)}</p>`;
  document.getElementById("reviewsSection").style.display = "none";
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (s) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[s]));
}
