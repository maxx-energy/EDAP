document.addEventListener('DOMContentLoaded', function () {
    // Initialize Bootstrap carousel
    const carousel = document.getElementById('heroCarousel');
    if (carousel) {
        const bsCarousel = new bootstrap.Carousel(carousel, {
            interval: 6000,
        });
    }

    // Animate stats numbers
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach((stat) => {
        const target = parseInt(stat.getAttribute('data-count'));

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateValue(stat, 0, target, 2000);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        observer.observe(stat);
    });

    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.textContent = Math.floor(start + progress * (end - start));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Testimonial carousel
    const testimonials = document.querySelectorAll('.testimonial-item');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    let currentIndex = 0;
    let testimonialInterval;

    function showTestimonial(index) {
        testimonials.forEach((item) => {
            item.classList.remove('active');
        });
        testimonials[index].classList.add('active');
    }

    function startTestimonialInterval() {
        clearInterval(testimonialInterval);
        testimonialInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(currentIndex);
        }, 5000);
    }

    if (prevBtn && nextBtn && testimonials.length > 0) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
            showTestimonial(currentIndex);
            startTestimonialInterval();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(currentIndex);
            startTestimonialInterval();
        });

        // Start auto rotation
        startTestimonialInterval();

        // Pause rotation on hover
        const testimonialCarousel = document.querySelector('.testimonial-carousel');
        if (testimonialCarousel) {
            testimonialCarousel.addEventListener('mouseenter', () => {
                clearInterval(testimonialInterval);
            });

            testimonialCarousel.addEventListener('mouseleave', () => {
                startTestimonialInterval();
            });
        }
    }

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth',
                });
            }
        });
    });
});


