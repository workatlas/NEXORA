
/* =====================================
   NEXORA — PWA CONTROLLER
   Install & Offline Registration v1.0
===================================== */

(() => {
  "use strict";

  // Connect the web app manifest.
  if (!document.querySelector('link[rel="manifest"]')) {
    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = new URL("./manifest.json", document.baseURI).href;
    document.head.appendChild(manifest);
  }

  // Set browser theme color.
  if (!document.querySelector('meta[name="theme-color"]')) {
    const theme = document.createElement("meta");
    theme.name = "theme-color";
    theme.content = "#070b16";
    document.head.appendChild(theme);
  }

  // Register the service worker.
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then((registration) => {
          console.log("NEXORA offline engine registered.", registration.scope);
        })
        .catch((error) => {
          console.error("NEXORA service worker registration failed:", error);
        });
    });
  }

  // Create the install button.
  const installButton = document.createElement("button");

  installButton.type = "button";
  installButton.textContent = "↓ Install NEXORA";
  installButton.setAttribute("aria-label", "Install NEXORA app");

  Object.assign(installButton.style, {
    position: "fixed",
    right: "22px",
    bottom: "22px",
    zIndex: "99999",
    display: "none",
    padding: "14px 20px",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "14px",
    background: "linear-gradient(110deg, #8265ff, #38c8ff)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 35px rgba(80,80,220,0.3)"
  });

  document.body.appendChild(installButton);

  let installPrompt = null;

  // Show the button when installation is available.
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.style.display = "block";
  });

  // Handle installation.
  installButton.addEventListener("click", async () => {
    if (!installPrompt) {
      alert(
        "To install NEXORA, open your browser menu and choose " +
        "'Install app' or 'Add to Home Screen'."
      );
      return;
    }

    installPrompt.prompt();

    const result = await installPrompt.userChoice;

    if (result.outcome === "accepted") {
      installButton.style.display = "none";
    }

    installPrompt = null;
  });

  // Hide the button after successful installation.
  window.addEventListener("appinstalled", () => {
    installButton.style.display = "none";
    console.log("NEXORA was successfully installed.");
  });
})();
