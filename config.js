const form = document.getElementById("form");
const numberInput = document.getElementById("number");
const output = document.getElementById("output");

/**
 * Function to render AWS WAF Captcha
 */
async function showMyCaptcha() {
  return new Promise((resolve, reject) => {
    const container = document.querySelector("#my-captcha-container");

    AwsWafCaptcha.renderCaptcha(container, {
      apiKey: "...API key goes here...",
      onSuccess: (wafToken) => {
        console.log("Captcha solved successfully:", wafToken);
        resolve(wafToken); // Continue after Captcha is solved
      },
      onError: (error) => {
        console.error("Captcha error:", error);
        reject(error); // Handle Captcha errors
      },
    });
  });
}

/**
 * Main logic to handle form submission and API calls
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const N = parseInt(numberInput.value);

  // Validate the input number
  if (isNaN(N) || N < 1 || N > 1000) {
    alert("Please enter a valid number.");
    return;
  }

  // Hide the form and start the sequence
  form.style.display = "none";
  for (let i = 1; i <= N; i++) {
    const listItem = document.createElement("li");
    listItem.textContent = `${i}. Waiting...`;
    output.appendChild(listItem);

    try {
      const response = await fetch("https://api.prod.jcloudify.com/whoami");
      if (response.ok) {
        listItem.textContent = `${i}. Forbidden`;
      } else if (response.status === 429) {
        // Captcha detected
        alert("Captcha detected. Please resolve the captcha to continue.");
        await showMyCaptcha(); // Wait for Captcha to be solved
        i--; // Retry the same request after Captcha resolution
      } else {
        listItem.textContent = `${i}. Error`;
      }
    } catch (error) {
      listItem.textContent = `${i}. Network error`;
    }

    // Wait 1 second before the next request
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
});
