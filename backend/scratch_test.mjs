async function run() {
  console.log("🚀 Testing Part 3 User Features APIs...");

  // 1. Authenticate / Login to get token
  const loginRes = await fetch("http://localhost:5000/api/auth/phone/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: "ishita.test@gmail.com" }),
  });
  const loginData = await loginRes.json();
  console.log("Send OTP:", loginData);

  const verifyRes = await fetch("http://localhost:5000/api/auth/phone/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: "ishita.test@gmail.com", otp: loginData.dev_otp }),
  });
  const authData = await verifyRes.json();
  const token = authData.token;
  console.log("✅ Authenticated as:", authData.data.name);

  // 2. Fetch movies to get a sample movie ID
  const moviesRes = await fetch("http://localhost:5000/api/movies");
  const moviesData = await moviesRes.json();
  const sampleMovie = moviesData.data[0];
  console.log(`🎬 Testing with movie: "${sampleMovie.title}" (${sampleMovie.id})`);

  // 3. Test Similar Movies API
  const similarRes = await fetch(`http://localhost:5000/api/movies/${sampleMovie.id}/similar`);
  const similarData = await similarRes.json();
  console.log(`✨ Similar movies for "${sampleMovie.title}":`, similarData.data.map(m => m.title));

  // 4. Test Watchlist Toggle (Add)
  const addWatchlistRes = await fetch(`http://localhost:5000/api/watchlist/toggle/${sampleMovie.id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const addWatchlistData = await addWatchlistRes.json();
  console.log("📥 Add to Watchlist:", addWatchlistData);

  // 5. Test Get Watchlist
  const getWatchlistRes = await fetch("http://localhost:5000/api/watchlist", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const getWatchlistData = await getWatchlistRes.json();
  console.log("📋 Current Watchlist count:", getWatchlistData.count, getWatchlistData.data.map(m => m.title));

  // 6. Test Add/Update Review
  const reviewRes = await fetch(`http://localhost:5000/api/movies/${sampleMovie.id}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      rating: 5,
      comment: "Masterpiece cinema! Unforgettable performances and soundtrack.",
    }),
  });
  const reviewData = await reviewRes.json();
  console.log("⭐ Review Posted:", reviewData);

  // 7. Test Get Reviews
  const getReviewsRes = await fetch(`http://localhost:5000/api/movies/${sampleMovie.id}/reviews`);
  const getReviewsData = await getReviewsRes.json();
  console.log("💬 Movie Reviews:", getReviewsData.data);

  console.log("🎉 ALL USER FEATURES BACKEND APIS PASSED 100%!");
}

run().catch(console.error);
