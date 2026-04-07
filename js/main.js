const themeToggleButtons = document.querySelectorAll("[data-theme-toggle]");
const languageToggleButtons = document.querySelectorAll("[data-lang-toggle]");
const THEME_KEY = "joana-theme";
const LANG_KEY = "joana-lang";
const DEFAULT_LANG = "pt";

const i18nNodes = document.querySelectorAll("[data-i18n]");
const i18nHtmlNodes = document.querySelectorAll("[data-i18n-html]");

let dictionaries = { pt: {}, en: {} };
let currentLang = DEFAULT_LANG;

function setTheme(theme) {
	document.body.classList.toggle("theme-dark", theme === "dark");
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
setTheme(currentTheme);

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

function updateLangButtonLabel(lang) {
	languageToggleButtons.forEach((button) => {
		const ptClass = lang === "pt" ? "lang-option is-active" : "lang-option";
		const enClass = lang === "en" ? "lang-option is-active" : "lang-option";
		button.innerHTML = `<span class="${ptClass}">PT</span><span class="lang-sep" aria-hidden="true">&bull;</span><span class="${enClass}">EN</span>`;
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
	}
}

languageToggleButtons.forEach((button) => {
	button.addEventListener("click", () => {
		currentLang = currentLang === "pt" ? "en" : "pt";
		applyTranslations(currentLang);
		localStorage.setItem(LANG_KEY, currentLang);
	});
});

loadDictionaries();
updateLangButtonLabel(currentLang);
