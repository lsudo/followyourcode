(function () {
    // The visitor's choice ("granted" or "denied"). Google Analytics runs only when it is "granted".
    const CONSENT_COOKIE = "cookie_consent";
    const CONSENT_DAYS = 180;

    function showCookiePopup(popup) {
        popup.style.display = "block";
    }

    function hideCookiePopup(popup) {
        popup.style.display = "none";
    }

    function createCookie(name, value, days) {
        let cookie = name + "=" + value + "; max-age=" + days * 24 * 60 * 60 + "; path=/; SameSite=Lax";
        if (window.location.protocol === "https:") cookie += "; Secure";
        document.cookie = cookie;
    }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function loadGoogleAnalytics(id) {
        window["ga-disable-" + id] = false;
        if (window.gtag) return;

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
            window.dataLayer.push(arguments);
        };
        window.gtag("js", new Date());
        window.gtag("config", id);

        const script = document.createElement("script");
        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
        document.head.appendChild(script);
    }

    // Withdrawn consent: stop GA on the current page and remove its cookies (set on the parent domain).
    function disableGoogleAnalytics(id) {
        window["ga-disable-" + id] = true;

        const parts = window.location.hostname.split(".");
        const domains = [""];
        for (let i = 0; i < parts.length - 1; i++) {
            domains.push("; domain=." + parts.slice(i).join("."));
        }
        document.cookie.split(";").forEach(function (c) {
            const name = c.split("=")[0].trim();
            if (name === "_ga" || name.indexOf("_ga_") === 0) {
                domains.forEach(function (domain) {
                    document.cookie = name + "=; max-age=0; path=/" + domain;
                });
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        const cookiesPopup = document.querySelector("#cookiespopup");
        if (!cookiesPopup) return;
        const gaID = cookiesPopup.dataset.gaId;

        function saveChoice(consent) {
            createCookie(CONSENT_COOKIE, consent, CONSENT_DAYS);
            hideCookiePopup(cookiesPopup);
            if (!gaID) return;
            if (consent === "granted") {
                loadGoogleAnalytics(gaID);
            } else {
                disableGoogleAnalytics(gaID);
            }
        }

        document.querySelector("#cookies-ok").addEventListener("click", function () {
            saveChoice("granted");
        });
        document.querySelector("#cookies-reject").addEventListener("click", function () {
            saveChoice("denied");
        });

        // "Ustawienia cookies" link in the footer reopens the popup.
        document.querySelectorAll('a[href="#cookies"]').forEach(function (link) {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                showCookiePopup(cookiesPopup);
            });
        });

        const consent = readCookie(CONSENT_COOKIE);
        if (!gaID) return;
        if (consent === "granted") {
            loadGoogleAnalytics(gaID);
        } else if (consent === null) {
            showCookiePopup(cookiesPopup);
        }
    });
})();
