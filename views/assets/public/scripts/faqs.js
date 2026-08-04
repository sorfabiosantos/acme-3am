async function fetchFAQs() {
    const response = await fetch("http://localhost:8080/acme-3am/api/faqs/category/6");
    const result = await response.json();
    console.log(result);
}

fetchFAQs();