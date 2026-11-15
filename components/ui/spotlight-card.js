/* Native adaptation of the supplied spotlight-card reference. */
(() => {
    "use strict";

    window.AstroSpotlight?.destroy?.();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    let activeCard = null;
    let lastPointer = null;
    let pendingFrame = 0;
    let destroyed = false;

    function canTrack() {
        return !destroyed && !document.hidden && !reducedMotion.matches && !forcedColors.matches &&
            !document.documentElement.classList.contains("companion-motion-paused");
    }

    function clearCard() {
        if (!activeCard) return;
        activeCard.removeAttribute("data-spotlight-active");
        activeCard.style.removeProperty("--spotlight-x");
        activeCard.style.removeProperty("--spotlight-y");
        activeCard = null;
    }

    function clearPointer() {
        if (pendingFrame) window.cancelAnimationFrame(pendingFrame);
        pendingFrame = 0;
        lastPointer = null;
        clearCard();
    }

    function paintSpotlight() {
        pendingFrame = 0;
        if (!canTrack() || !lastPointer) {
            clearPointer();
            return;
        }

        // Hit-test and measure at paint time: a nested scroll or layout change
        // can move a different card beneath a pointer that has stayed still.
        const hit = document.elementFromPoint(lastPointer.x, lastPointer.y);
        const card = hit?.closest?.("[data-spotlight]");
        if (!card || !card.isConnected) {
            clearCard();
            return;
        }

        const rect = card.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0 ||
            lastPointer.x < rect.left || lastPointer.x > rect.right ||
            lastPointer.y < rect.top || lastPointer.y > rect.bottom) {
            clearCard();
            return;
        }

        if (activeCard !== card) {
            clearCard();
            activeCard = card;
            card.setAttribute("data-spotlight-active", "");
        }

        const x = Math.min(rect.width, Math.max(0, lastPointer.x - rect.left));
        const y = Math.min(rect.height, Math.max(0, lastPointer.y - rect.top));
        card.style.setProperty("--spotlight-x", x.toFixed(2) + "px");
        card.style.setProperty("--spotlight-y", y.toFixed(2) + "px");
    }

    function requestPaint() {
        if (!canTrack() || !lastPointer || pendingFrame) return;
        pendingFrame = window.requestAnimationFrame(paintSpotlight);
    }

    function onPointerMove(event) {
        if (event.isPrimary === false) return;
        if (event.pointerType === "touch") {
            clearPointer();
            return;
        }
        if (!canTrack()) return;
        lastPointer = { x: event.clientX, y: event.clientY };
        if (!event.target?.closest?.("[data-spotlight]")) {
            if (pendingFrame) window.cancelAnimationFrame(pendingFrame);
            pendingFrame = 0;
            clearCard();
            return;
        }
        requestPaint();
    }

    function onVisibilityChange() {
        if (document.hidden) clearPointer();
    }

    // One delegated pointer tracker; decorative layers never intercept events.
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", clearPointer, { passive: true });
    document.addEventListener("pointercancel", clearPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("scroll", requestPaint, { capture: true, passive: true });
    window.addEventListener("resize", requestPaint, { passive: true });
    window.addEventListener("blur", clearPointer);
    window.addEventListener("astroguardian:page-changed", clearPointer);
    reducedMotion.addEventListener("change", clearPointer);
    forcedColors.addEventListener("change", clearPointer);

    const motionObserver = new MutationObserver(() => {
        if (document.documentElement.classList.contains("companion-motion-paused")) clearPointer();
    });
    motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const api = {
        refresh() {
            if (destroyed) return;
            clearCard();
            requestPaint();
        },
        destroy() {
            if (destroyed) return;
            destroyed = true;
            clearPointer();
            document.removeEventListener("pointermove", onPointerMove);
            document.documentElement.removeEventListener("pointerleave", clearPointer);
            document.removeEventListener("pointercancel", clearPointer);
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("scroll", requestPaint, true);
            window.removeEventListener("resize", requestPaint);
            window.removeEventListener("blur", clearPointer);
            window.removeEventListener("astroguardian:page-changed", clearPointer);
            reducedMotion.removeEventListener("change", clearPointer);
            forcedColors.removeEventListener("change", clearPointer);
            motionObserver.disconnect();
            if (window.AstroSpotlight === api) delete window.AstroSpotlight;
        }
    };

    window.AstroSpotlight = api;
})();
