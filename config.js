const form = document.getElementById("form");
const numberInput = document.getElementById("number");
const output = document.getElementById("output");

/**
 * Fonction pour afficher le Captcha AWS WAF
 */
async function showMyCaptcha() {
  return new Promise((resolve, reject) => {
    const container = document.querySelector("#my-captcha-container");

    AwsWafCaptcha.renderCaptcha(container, {
      apiKey: "apiKey", // Remplacez par votre clé API
      onSuccess: (wafToken) => {
        console.log("Captcha résolu avec succès:", wafToken);
        resolve(wafToken); // Continue après que le Captcha soit résolu
      },
      onError: (error) => {
        console.error("Erreur Captcha:", error);
        reject(error); // Gérez les erreurs du Captcha
      },
    });
  });
}

window.AWS_WAF_KEY = "apiKey";

/**
 * Fonction principale pour gérer la soumission du formulaire et les appels API
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const N = parseInt(numberInput.value);

  // Validation de l'entrée
  if (isNaN(N) || N < 1 || N > 1000) {
    alert("Veuillez entrer un nombre valide.");
    return;
  }

  // Masquer le formulaire et commencer la séquence
  form.style.display = "none";
  for (let i = 1; i <= N; i++) {
    const listItem = document.createElement("li");
    listItem.textContent = `${i}. Forbidden`;
    output.appendChild(listItem);

    try {
      const response = await fetch("https://api.prod.jcloudify.com/whoami");

      if (response.status === 403) {
        listItem.textContent = `${i}. Forbidden`;
      } else if (response.status === 405) {
        // Captcha détecté
        alert("Captcha détecté. Veuillez résoudre le captcha pour continuer.");
        await showMyCaptcha(); // Attendre que le Captcha soit résolu
        i--; // Réessayer la même requête après la résolution du Captcha
      }else {
        listItem.textContent = `${i}. Error`;
      }
    } catch (error) {
      listItem.textContent = `${i}. Network error`;
    }

    // Attendre 1 seconde avant la prochaine requête
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
});

