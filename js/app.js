"use strict";

const Reader = {

    book: null,
    chapters: [],
    currentIndex: 0,
    currentChapter: null,

    fontSize: Number(localStorage.getItem("reader-font-size") || 18),

    theme: localStorage.getItem("reader-theme") || "light",

    init() {

        this.cache();

        this.bind();

        this.applyTheme();

        this.applyFont();

        this.loadBook();

    },

    cache() {

        this.bookTitle = document.getElementById("bookTitle");

        this.chapterNumber = document.getElementById("chapterNumber");

        this.chapterTitle = document.getElementById("chapterTitle");

        this.chapterContent = document.getElementById("chapterContent");

        this.progress = document.getElementById("readingProgress");

        this.prev = document.getElementById("prevChapter");

        this.next = document.getElementById("nextChapter");

        this.toc = document.getElementById("tocList");

        this.reader = document.getElementById("reader");

        this.themeButton = document.getElementById("themeToggle");

        this.themeSwitch = document.getElementById("themeSwitch");

        this.fontIncrease = document.getElementById("fontIncrease");

        this.fontDecrease = document.getElementById("fontDecrease");

        this.fontLabel = document.getElementById("fontSizeLabel");

        this.tocButton = document.getElementById("tocButton");

        this.settingsButton = document.getElementById("settingsButton");

        this.tocDrawer = document.getElementById("tocDrawer");

        this.settingsDrawer = document.getElementById("settingsDrawer");

        this.overlay = document.getElementById("overlay");

        this.closeToc = document.getElementById("closeToc");

        this.closeSettings = document.getElementById("closeSettings");

    },

    bind() {

        this.prev.addEventListener("click", () => this.previous());

        this.next.addEventListener("click", () => this.nextChapter());

        this.themeButton.addEventListener("click", () => this.toggleTheme());

        this.themeSwitch.addEventListener("click", () => this.toggleTheme());

        this.fontIncrease.addEventListener("click", () => this.changeFont(1));

        this.fontDecrease.addEventListener("click", () => this.changeFont(-1));

    },
      async loadBook() {

        try {

            const response = await fetch("data/book.json");

            this.book = await response.json();

            this.chapters = this.book.chapters || [];

            this.bookTitle.textContent = this.book.title || "Book";

            this.buildTOC();

            const saved = localStorage.getItem("reader-current");

            const start = this.chapters.findIndex(c => c.id === saved);

            this.currentIndex = start >= 0 ? start : 0;

            this.loadChapter(this.currentIndex);

        }

        catch (e) {

            console.error(e);

            this.chapterTitle.textContent = "Unable to load book";

            this.chapterContent.innerHTML =
                "<p>book.json could not be loaded.</p>";

        }

    },

    async loadChapter(index) {

        if (index < 0 || index >= this.chapters.length) return;

        this.currentIndex = index;

        const chapter = this.chapters[index];

        localStorage.setItem("reader-current", chapter.id);

        try {

            const response = await fetch(`data/${chapter.slug}.json`);

            this.currentChapter = await response.json();

            this.renderChapter();

            this.updateNavigation();

            this.updateProgress();

        }

        catch (e) {

            console.error(e);

            this.chapterTitle.textContent = "Unable to load chapter";

            this.chapterContent.innerHTML =
                "<p>This chapter could not be loaded.</p>";

        }

    },
      renderChapter() {

        this.chapterNumber.textContent =
            "Chapter " + (this.currentIndex + 1);

        this.chapterTitle.textContent =
            this.currentChapter.title || "";

        this.chapterContent.innerHTML = "";

        (this.currentChapter.sections || []).forEach(section => {

            if (section.heading) {

                const h2 = document.createElement("h2");

                h2.textContent = section.heading;

                this.chapterContent.appendChild(h2);

            }

            (section.content || []).forEach(text => {

                const p = document.createElement("p");

                p.textContent = text;

                this.chapterContent.appendChild(p);

            });

        });

        this.reader.scrollTop = 0;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    },

    buildTOC() {

        this.toc.innerHTML = "";

        this.chapters.forEach((chapter, index) => {

            const button = document.createElement("button");

            button.className = "toc-item";

            button.textContent =
                (index + 1) + ". " + chapter.title;

            button.addEventListener("click", () => {

                this.closeDrawers();

                this.loadChapter(index);

            });

            this.toc.appendChild(button);

        });

    },
      previous() {

        if (this.currentIndex > 0) {

            this.loadChapter(this.currentIndex - 1);

        }

    },

    nextChapter() {

        if (this.currentIndex < this.chapters.length - 1) {

            this.loadChapter(this.currentIndex + 1);

        }

    },

    updateNavigation() {

        this.prev.disabled = this.currentIndex === 0;

        this.next.disabled =
            this.currentIndex === this.chapters.length - 1;

    },

    updateProgress() {

        if (!this.chapters.length) return;

        const percent =
            ((this.currentIndex + 1) / this.chapters.length) * 100;

        this.progress.style.width = percent + "%";

    },

    changeFont(step) {

        this.fontSize = Math.max(14, Math.min(28, this.fontSize + step));

        localStorage.setItem("reader-font-size", this.fontSize);

        this.applyFont();

    },

    applyFont() {

        this.chapterContent.style.fontSize = this.fontSize + "px";

        if (this.fontLabel) {

            this.fontLabel.textContent = this.fontSize + " px";

        }

    },
    toggleTheme() {

        this.theme =
            this.theme === "light" ? "dark" : "light";

        localStorage.setItem("reader-theme", this.theme);

        this.applyTheme();

    },

    applyTheme() {

        document.documentElement.setAttribute(
            "data-theme",
            this.theme
        );

    },

    closeDrawers() {

        this.tocDrawer.classList.remove("open");

        this.settingsDrawer.classList.remove("open");

        this.overlay.classList.add("hidden");

    }

};

document.addEventListener("DOMContentLoaded", () => {

    Reader.init();

    document
        .getElementById("tocButton")
        .addEventListener("click", () => {

            Reader.tocDrawer.classList.add("open");

            Reader.overlay.classList.remove("hidden");

        });

    document
        .getElementById("settingsButton")
        .addEventListener("click", () => {

            Reader.settingsDrawer.classList.add("open");

            Reader.overlay.classList.remove("hidden");

        });

    document
        .getElementById("closeToc")
        .addEventListener("click", () => Reader.closeDrawers());

    document
        .getElementById("closeSettings")
        .addEventListener("click", () => Reader.closeDrawers());

    Reader.overlay.addEventListener("click", () => Reader.closeDrawers());

});
