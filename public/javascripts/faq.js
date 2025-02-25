
function search() {
    const searchIn = document.getElementById("search").value.toLowerCase();
    const faqs = document.querySelectorAll(".accordion-item");
    
    faqs.forEach(faq => {
        const q = faq.querySelector(".accordion-button");
        const a = faq.querySelector(".accordion-body");


    if (q && a) {
        const question = q.textContent.toLowerCase();
        const answer = a.textContent.toLowerCase();
        
        if (question.includes(searchIn) || answer.includes(searchIn)) {
            faq.style.display = "block";
            noResults=false;
        } else {
            faq.style.display = "none";
            noResults=true;
        }
    }
});
    const noResultsMsg = document.getElementById("noResultsMsg");
if (noResults) {
    if (!noResultsMsg) {
        const msg = document.createElement("x");
        msg.id = "noResultsMsg";
        msg.style.color = "gray";
        msg.textContent = "No results found.";
        noresults.appendChild(msg);
    }
} else {
    if (noResultsMsg) {
        noResultsMsg.remove();
        }
}
}

