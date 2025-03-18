document.addEventListener('DOMContentLoaded', function () {
    const toastElement = document.getElementById('feedback-toast');
    if (toastElement) {
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }

    // Get DOM elements
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('sidebarOverlay');
    const toggleBtn = document.getElementById('toggleSidebar');

    // Check if profilePic elements exist (for account.ejs)
    const profilePicPreview = document.getElementById('profilePicPreview');
    const profilePic = document.getElementById('profilePic');

    if (profilePicPreview && profilePic) {
        profilePicPreview.addEventListener('click', function () {
            profilePic.click();
        });

        profilePic.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    profilePicPreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Check screen size
    const isMobile = () => window.innerWidth <= 992;

    // Set initial state based on screen size
    const setInitialState = () => {
        if (isMobile()) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
        }
    };

    // Set initial state when page loads
    setInitialState();

    // Toggle sidebar function
    toggleBtn.addEventListener('click', function () {
        // Toggle button clicked

        if (isMobile()) {
            // Mobile behavior: Toggle mobile-active state
            sidebar.classList.toggle('mobile-active');
            overlay.classList.toggle('active');
        } else {
            // Desktop behavior: Toggle collapsed state
            const isCollapsed = sidebar.classList.contains('collapsed');
            console.log('is collapsed: ', isCollapsed);
            if (!isCollapsed) {
                // Sidebar is visible, so collapse it
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
            } else {
                // Sidebar is collapsed, so expand it
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('expanded');
            }
        }
    });

    // Close sidebar when clicking overlay (mobile only)
    if (overlay) {
        overlay.addEventListener('click', function () {
            sidebar.classList.remove('mobile-active');
            overlay.classList.remove('active');
        });
    }

    // Close sidebar when clicking links (mobile only)
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach((link) => {
        link.addEventListener('click', function () {
            if (isMobile()) {
                sidebar.classList.remove('mobile-active');
                overlay.classList.remove('active');
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', function () {
        setInitialState();
    });
});
