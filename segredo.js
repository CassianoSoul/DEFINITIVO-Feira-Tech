document.addEventListener('DOMContentLoaded', () => {

    const cards = document.querySelectorAll('.category-card');

    cards.forEach(card => {
        const images = JSON.parse(card.dataset.images || '[]');
        const slideshowEl = card.querySelector('.slideshow-preview');

        if (!images.length || !slideshowEl) return;

        // Inclui a primeira imagem (que é a capa) no slideshow também
        const imgEls = images.map((src, i) => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = '';
            slideshowEl.appendChild(img);
            return img;
        });

        let currentIdx = 0;
        let intervalId = null;

        function showSlide(idx) {
            imgEls.forEach(img => img.classList.remove('active'));
            imgEls[idx].classList.add('active');
        }

        function showNext() {
            currentIdx = (currentIdx + 1) % imgEls.length;
            showSlide(currentIdx);
        }

        card.addEventListener('mouseenter', () => {
            // Começa pela primeira imagem (a mesma da capa)
            currentIdx = 0;
            showSlide(0);

            // Troca a cada 600ms
            intervalId = setInterval(showNext, 600);
        });

        card.addEventListener('mouseleave', () => {
            clearInterval(intervalId);
            intervalId = null;
            imgEls.forEach(img => img.classList.remove('active'));
        });
    });

});
