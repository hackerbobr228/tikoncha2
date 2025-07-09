
    function switchTheme() {
      const current = document.body.getAttribute("data-theme");
      document.body.setAttribute("data-theme", current === "dark" ? "light" : "dark");
    }

    function switchLang() {
      const uz = document.getElementById("privacy-uz");
      const ru = document.getElementById("privacy-ru");
      const isUzbekVisible = uz.style.display !== "none";
      uz.style.display = isUzbekVisible ? "none" : "block";
      ru.style.display = isUzbekVisible ? "block" : "none";
    }
