function autoplayCarousel() {
  const carouselEl = document.getElementById("carousel");
  const slideContainerEl = carouselEl.querySelector("#slide-container");
  const slideEl = carouselEl.querySelector(".slide");
  
  // Obtenemos el ancho de la slide más el gap
  const slideWidth = slideEl.offsetWidth + 20; // 20px es el gap entre slides
  
  // Add click handlers
  document
    .querySelector("#back-button")
    .addEventListener("click", () => {
      clearInterval(autoplay);
      navigate("backward");
    });
  document
    .querySelector("#forward-button")
    .addEventListener("click", () => {
      clearInterval(autoplay);
      navigate("forward");
    });
    
  document.querySelectorAll(".slide-indicator").forEach((dot, index) => {
    dot.addEventListener("click", () => {
      clearInterval(autoplay);
      navigate(index);
    });
    dot.addEventListener("mouseenter", () => clearInterval(autoplay));
  });
  
  // Add keyboard handlers
  document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft") {
      clearInterval(autoplay);
      navigate("backward");
    } else if (e.code === "ArrowRight") {
      clearInterval(autoplay);
      navigate("forward");
    }
  });
  
  // Add resize handler
  window.addEventListener("resize", () => {
    // Reajustar el ancho de slide cuando cambia el tamaño de pantalla
    const currentSlideEl = carouselEl.querySelector(".slide");
    const gap = 20;
    const newSlideWidth = currentSlideEl.offsetWidth + gap;
    
    // Ajustar la posición del carrusel al redimensionar
    const currentIndex = getCurrentSlideIndex();
    slideContainerEl.scrollLeft = currentIndex * newSlideWidth;
  });
  
  // Autoplay - más lento para dar tiempo a ver cada slide
  const autoplay = setInterval(() => navigate("forward"), 5000);
  
  // Detener autoplay al interactuar con el carrusel
  slideContainerEl.addEventListener("mouseenter", () => clearInterval(autoplay));
  
  // Obtener el índice actual del slide
  const getCurrentSlideIndex = () => {
    const slides = document.querySelectorAll(".slide");
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const rect = slide.getBoundingClientRect();
      const containerRect = slideContainerEl.getBoundingClientRect();
      
      // Si el centro del slide está visible en el contenedor
      if (
        rect.left <= containerRect.right - rect.width / 2 &&
        rect.right >= containerRect.left + rect.width / 2
      ) {
        return parseInt(slide.dataset.slideindex);
      }
    }
    return 0;
  };
  
  // Slide transition
  const getNewScrollPosition = (arg) => {
    const gap = 20; // 20px es el gap entre slides
    const currentSlideEl = carouselEl.querySelector(".slide");
    const currentSlideWidth = currentSlideEl.offsetWidth + gap;
    const maxScrollLeft = slideContainerEl.scrollWidth - slideContainerEl.clientWidth;
    
    // Para dispositivos móviles, mostramos un slide a la vez
    const isMobile = window.innerWidth <= 768;
    const scrollUnit = isMobile ? currentSlideEl.offsetWidth + gap : currentSlideWidth;
    
    if (arg === "forward") {
      const x = slideContainerEl.scrollLeft + scrollUnit;
      return x <= maxScrollLeft ? x : 0;
    } else if (arg === "backward") {
      const x = slideContainerEl.scrollLeft - scrollUnit;
      return x >= 0 ? x : maxScrollLeft;
    } else if (typeof arg === "number") {
      // Para índices específicos (usado por los indicadores)
      const x = arg * scrollUnit;
      return Math.min(x, maxScrollLeft);
    }
  };
  
  const navigate = (arg) => {
    slideContainerEl.scrollLeft = getNewScrollPosition(arg);
    updateIndicators();
  };
  
  // Actualizar los indicadores basados en el slide visible
  const updateIndicators = () => {
    const currentIndex = getCurrentSlideIndex();
    const indicators = carouselEl.querySelectorAll(".slide-indicator");
    
    // Remover clase activa de todos los indicadores
    indicators.forEach(indicator => indicator.classList.remove("active"));
    
    // Añadir clase activa al indicador correspondiente
    if (indicators[currentIndex]) {
      indicators[currentIndex].classList.add("active");
    }
  };
  
  // Observador de intersección para actualizar indicadores automáticamente
  const slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const slideIndex = entry.target.dataset.slideindex;
          const activeIndicator = carouselEl.querySelector(".slide-indicator.active");
          
          if (activeIndicator) {
            activeIndicator.classList.remove("active");
          }
          
          const indicators = carouselEl.querySelectorAll(".slide-indicator");
          if (indicators[slideIndex]) {
            indicators[slideIndex].classList.add("active");
          }
        }
      });
    },
    { root: slideContainerEl, threshold: 0.6 } // Aumentar threshold para mejor detección
  );
  
  document.querySelectorAll(".slide").forEach((slide) => {
    slideObserver.observe(slide);
  });
  
  // Inicializar la posición del carrusel y los indicadores
  updateIndicators();
}

// Iniciar el carrusel cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function() {
  autoplayCarousel();
});