function search() {
    // Get the search input value
    let input = document.getElementById('search').value.toLowerCase();
    let items = document.getElementsByClassName('faq-item');
    let noResults = document.getElementById('noresults');
    let found = false;

    // Loop through all FAQ items
    for (let i = 0; i < items.length; i++) {
        let button = items[i].querySelector('.accordion-button');
        let text = button.textContent || button.innerText;
        let body = items[i].querySelector('.accordion-body');
        let bodyText = body.textContent || body.innerText;

        // Check if the search input matches the question or answer
        if (text.toLowerCase().indexOf(input) > -1 || bodyText.toLowerCase().indexOf(input) > -1) {
            items[i].style.display = '';
            found = true;

            // If the item matches and is not already open, open it
            if (input.length > 2 && button.classList.contains('collapsed')) {
                button.click();
            }
        } else {
            items[i].style.display = 'none';
        }
    }

    // Display a message if no results are found
    if (!found && input.length > 0) {
        noResults.innerHTML = `<div class="alert alert-info">No results found for "${input}". Please try a different search term.</div>`;
    } else {
        noResults.innerHTML = '';
    }
}

function filterCategory(category) {
    // Update active button
    let buttons = document.querySelectorAll('.faq-categories .btn');
    buttons.forEach((button) => {
        button.classList.remove('active');
        if (
            button.textContent.trim().toLowerCase().includes(category) ||
            (category === 'all' && button.textContent.trim().toLowerCase().includes('all'))
        ) {
            button.classList.add('active');
        }
    });

    // Filter items
    let items = document.getElementsByClassName('faq-item');
    for (let i = 0; i < items.length; i++) {
        if (category === 'all' || items[i].getAttribute('data-category') === category) {
            items[i].style.display = '';
        } else {
            items[i].style.display = 'none';
        }
    }
}
