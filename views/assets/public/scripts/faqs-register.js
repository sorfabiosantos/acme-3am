console.log("oi");

const faqsRegisterForm = document.querySelector("#faqs-register-form");

faqsRegisterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE3ODU4NTYxMDMsImp0aSI6ImZTdUErQnRneE1sdXNocGNtTWh1NFE9PSIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9hY21lLTNhbSIsIm5iZiI6MTc4NTg1NjEwMywiZXhwIjoxNzg1ODYxNTAzLCJkYXRhIjp7ImlkIjo4LCJuYW1lIjoiQWRtaW4gLSAwMSIsImVtYWlsIjoiYWRtaW5fMDFAZ21haWwuY29tIn19.e44jNT9NzIuAnsMOj0Pw5tK6xAl31TOajnBfnRRKmNlNdXj-lrADo30tCtwaAhZVD-Gy2L2xOykc73IqJ5aKnA");
    const response = await fetch("http://localhost:8080/acme-3am/api/faqs", {
        method: "POST",
        headers: myHeaders,
        body: new FormData(faqsRegisterForm)
    });
    const data = await response.json();
    console.log(data);
});