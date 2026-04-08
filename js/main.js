const themeToggleButtons = document.querySelectorAll("[data-theme-toggle]");
const languageToggleButtons = document.querySelectorAll("[data-lang-toggle]");
const THEME_KEY = "joana-theme";
const LANG_KEY = "joana-lang";
const DEFAULT_LANG = "pt";

const i18nNodes = document.querySelectorAll("[data-i18n]");
const i18nHtmlNodes = document.querySelectorAll("[data-i18n-html]");
const cvDownloadLinks = document.querySelectorAll("[data-cv-download]");

let dictionaries = { pt: {}, en: {} };
let currentLang = DEFAULT_LANG;

function setTheme(theme, animate = true) {
	if (!animate) {
		document.documentElement.classList.add("theme-no-transition");
	}

	document.documentElement.classList.toggle("theme-dark", theme === "dark");
	document.body.classList.toggle("theme-dark", theme === "dark");

	if (!animate) {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				document.documentElement.classList.remove("theme-no-transition");
			});
		});
	}
}

function getInitialTheme() {
	const savedTheme = localStorage.getItem(THEME_KEY);
	if (savedTheme === "light" || savedTheme === "dark") {
		return savedTheme;
	}

	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	return prefersDark ? "dark" : "light";
}

let currentTheme = getInitialTheme();
setTheme(currentTheme, false);
document.body.classList.add("theme-animated");

themeToggleButtons.forEach((button) => {
	button.addEventListener("click", () => {
		currentTheme = currentTheme === "dark" ? "light" : "dark";
		setTheme(currentTheme);
		localStorage.setItem(THEME_KEY, currentTheme);
	});
});

function getDataPath(fileName) {
	const isNestedPage = window.location.pathname.includes("/pages/");
	return `${isNestedPage ? ".." : "."}/data/${fileName}`;
}

function getAssetPath(filePath) {
	const isNestedPage = window.location.pathname.includes("/pages/");
	return `${isNestedPage ? ".." : "."}/assets/${filePath}`;
}

function updateLangButtonLabel(lang) {
	languageToggleButtons.forEach((button) => {
		const ptClass = lang === "pt" ? "lang-option is-active" : "lang-option";
		const enClass = lang === "en" ? "lang-option is-active" : "lang-option";
		button.innerHTML = `<span class="${ptClass}">PT</span><span class="lang-sep" aria-hidden="true">&bull;</span><span class="${enClass}">EN</span>`;
	});
}

function updateCvDownloadLink(lang) {
	const fileName = lang === "en" ? "JoanaPintoEN.pdf" : "JoanaPintoPT.pdf";
	const filePath = getAssetPath(`cv/${fileName}`);

	cvDownloadLinks.forEach((link) => {
		link.href = filePath;
		link.setAttribute("download", fileName);
	});
}

function applyTranslations(lang) {
	const dictionary = dictionaries[lang] || {};

	i18nNodes.forEach((node) => {
		const key = node.dataset.i18n;
		if (key && dictionary[key]) {
			node.textContent = dictionary[key];
		}
	});

	i18nHtmlNodes.forEach((node) => {
		const key = node.dataset.i18nHtml;
		if (key && dictionary[key]) {
			node.innerHTML = dictionary[key];
		}
	});

	document.documentElement.lang = lang;
	updateLangButtonLabel(lang);
	updateCvDownloadLink(lang);
}

async function loadDictionaries() {
	try {
		const [ptRes, enRes] = await Promise.all([
			fetch(getDataPath("pt.json")),
			fetch(getDataPath("eng.json")),
		]);

		if (!ptRes.ok || !enRes.ok) {
			return;
		}

		dictionaries.pt = await ptRes.json();
		dictionaries.en = await enRes.json();

		const storedLang = localStorage.getItem(LANG_KEY);
		currentLang = storedLang === "en" ? "en" : DEFAULT_LANG;
		applyTranslations(currentLang);
	} catch {
		updateLangButtonLabel(currentLang);
		updateCvDownloadLink(currentLang);
	}
}

languageToggleButtons.forEach((button) => {
	button.addEventListener("click", () => {
		currentLang = currentLang === "pt" ? "en" : "pt";
		applyTranslations(currentLang);
		localStorage.setItem(LANG_KEY, currentLang);
	});
});

function initLightbox() {
	const galleryImages = Array.from(document.querySelectorAll("[data-gallery-image]"));
	if (!galleryImages.length) {
		return;
	}

	const overlay = document.createElement("div");
	overlay.className = "lightbox";
	overlay.setAttribute("aria-hidden", "true");
	overlay.innerHTML = `
		<button class="lightbox-control prev" type="button" aria-label="Previous image">&#8592;</button>
		<img class="lightbox-image" alt="">
		<button class="lightbox-control next" type="button" aria-label="Next image">&#8594;</button>
		<button class="lightbox-control close" type="button" aria-label="Close">&times;</button>
	`;
	document.body.appendChild(overlay);

	const lightboxImage = overlay.querySelector(".lightbox-image");
	const prevButton = overlay.querySelector(".lightbox-control.prev");
	const nextButton = overlay.querySelector(".lightbox-control.next");
	const closeButton = overlay.querySelector(".lightbox-control.close");

	let activeIndex = 0;

	function showImage(index) {
		const normalizedIndex = (index + galleryImages.length) % galleryImages.length;
		activeIndex = normalizedIndex;
		const sourceImage = galleryImages[activeIndex];
		lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
		lightboxImage.alt = sourceImage.alt || "";
	}

	function openLightbox(index) {
		showImage(index);
		overlay.classList.add("is-open");
		overlay.setAttribute("aria-hidden", "false");
		document.body.style.overflow = "hidden";
	}

	function closeLightbox() {
		overlay.classList.remove("is-open");
		overlay.setAttribute("aria-hidden", "true");
		document.body.style.overflow = "";
	}

	galleryImages.forEach((image, index) => {
		image.addEventListener("click", () => {
			openLightbox(index);
		});
	});

	prevButton.addEventListener("click", () => {
		showImage(activeIndex - 1);
	});

	nextButton.addEventListener("click", () => {
		showImage(activeIndex + 1);
	});

	closeButton.addEventListener("click", closeLightbox);

	overlay.addEventListener("click", (event) => {
		if (event.target === overlay) {
			closeLightbox();
		}
	});

	document.addEventListener("keydown", (event) => {
		if (!overlay.classList.contains("is-open")) {
			return;
		}

		if (event.key === "Escape") {
			closeLightbox();
			return;
		}

		if (event.key === "ArrowLeft") {
			showImage(activeIndex - 1);
			return;
		}

		if (event.key === "ArrowRight") {
			showImage(activeIndex + 1);
		}
	});
}

loadDictionaries();
updateLangButtonLabel(currentLang);
updateCvDownloadLink(currentLang);
initLightbox();
