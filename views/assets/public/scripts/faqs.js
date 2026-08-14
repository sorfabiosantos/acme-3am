console.log("oi..");

async function fetchFAQs() {
    const faqs = await fetch("http://localhost:8080/acme-3am/api/faqs/category/6");
    console.log(faqs);
    const faqData = await faqs.json();
    console.log(faqData.data);

    const listFaqs = document.querySelector("#list-faqs");
    faqData.data.forEach(faq => {
        const itemFaq = document.createElement("faq-item");
        itemFaq.innerHTML = `
        <dt>
            <button class="faq-question" aria-expanded="false">
             <span>${faq.question}</span>
             <i data-lucide="plus" class="w-5 h-5 faq-icon text-surface-gray" aria-hidden="true"></i>
            </button>
        </dt>
        <dd class="faq-answer">
            <p>${faq.answer}</p>
        </dd>
        `;
        console.log(faq);
        listFaqs.appendChild(itemFaq);
    });

}

//fetchFAQs();

