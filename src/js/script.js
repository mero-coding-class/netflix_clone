// carousel

function scrollCarousel(id, direction) {
    const carousel = document.getElementById(id);
    const scrollAmount = carousel.clientWidth / 2; // Scroll half the visible width
    carousel.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}