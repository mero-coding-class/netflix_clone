const apiKey = '7d1ff077849be7d1695061a5bfcf9b97';
const carouselContainer = document.getElementById('trending-carousel');

const drawer = document.getElementById('movieDrawer');
const overlay = document.getElementById('drawerOverlay');
const closeDrawerBtn = document.getElementById('closeDrawer');

const drawerPoster = document.getElementById('drawerPoster');
const drawerMedia = document.getElementById('drawerMedia');
const drawerTitle = document.getElementById('drawerTitle');
const drawerOverview = document.getElementById('drawerOverview');
const recommendationsContainer = document.getElementById('recommendations');

async function fetchTrendingMovies() {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`);
    const data = await response.json();
    const movies = data.results.slice(0, 7);

    carouselContainer.innerHTML = '';

    movies.forEach(movie => {
      const posterPath = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://placehold.co/180x250?text=No+Image';

      const card = document.createElement('div');
      card.className = 'poster-card flex-shrink-0 cursor-pointer';
      card.innerHTML = `
        <img src="${posterPath}" alt="${movie.title}" class="rounded-md shadow-md w-40 h-60 object-cover">
      `;
      card.addEventListener('click', () => openDrawer(movie.id));
      carouselContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    carouselContainer.innerHTML = '<p class="text-red-400">Failed to load movies. Try again later.</p>';
  }
}

async function openDrawer(movieId) {
  overlay.classList.remove('hidden');
  drawer.classList.remove('translate-y-full');

  // Fetch movie details
  try {
    const [detailsRes, videosRes, recRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`),
      fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=en-US`),
      fetch(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${apiKey}&language=en-US&page=1`)
    ]);

    const details = await detailsRes.json();
    const videos = await videosRes.json();
    const recommendations = await recRes.json();

    // Fill title and overview
    drawerTitle.textContent = details.title;
    drawerOverview.textContent = details.overview || 'No description available.';

    // Show trailer or poster
    const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    if (trailer) {
      drawerMedia.innerHTML = `
        <iframe
          class="w-full h-full"
          src="https://www.youtube.com/embed/${trailer.key}"
          frameborder="0"
          allowfullscreen
        ></iframe>
      `;
    } else {
      const posterPath = details.backdrop_path
        ? `https://image.tmdb.org/t/p/w780${details.backdrop_path}`
        : (details.poster_path
            ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
            : 'https://placehold.co/800x450?text=No+Image');

      drawerMedia.innerHTML = `
        <img src="${posterPath}" alt="${details.title}" class="object-cover w-full h-full">
      `;
    }

    // Fill recommendations
    recommendationsContainer.innerHTML = '';
    if (recommendations.results.length) {
      recommendations.results.slice(0, 10).forEach(rec => {
        const recPoster = rec.poster_path
          ? `https://image.tmdb.org/t/p/w300${rec.poster_path}`
          : 'https://placehold.co/180x250?text=No+Image';

        const recCard = document.createElement('div');
        recCard.className = 'flex-shrink-0 w-40 cursor-pointer';
        recCard.innerHTML = `
          <img src="${recPoster}" alt="${rec.title}" class="rounded-md shadow-md object-cover w-full h-60">
          <p class="mt-2 text-sm text-gray-300">${rec.title}</p>
        `;
        recCard.addEventListener('click', () => openDrawer(rec.id));
        recommendationsContainer.appendChild(recCard);
      });
    } else {
      recommendationsContainer.innerHTML = '<p class="text-gray-400">No recommendations available.</p>';
    }

  } catch (error) {
    console.error('Error fetching movie details:', error);
  }
}

function closeDrawer() {
  overlay.classList.add('hidden');
  drawer.classList.add('translate-y-full');
  // Reset media to avoid iframe playing in background
  drawerMedia.innerHTML = `
    <img id="drawerPoster" src="" alt="Poster" class="object-cover w-full h-full">
  `;
}

document.addEventListener('DOMContentLoaded', fetchTrendingMovies);
closeDrawerBtn.addEventListener('click', closeDrawer);
overlay.addEventListener('click', closeDrawer);