/* Native, offline liquid-metal material. One shared WebGL context, no dependencies. */
(function () {
    "use strict";
    if (window.AstroLiquidMetal) { window.AstroLiquidMetal.refresh(); return; }

    const SELECTOR = "button[data-liquid-metal], a[data-liquid-metal]";
    const records = new Map();
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColorsQuery = window.matchMedia("(forced-colors: active)");
    const subscriptions = [];
    const rippleTimers = new Map();
    const source = document.createElement("canvas");
    source.width = 640;
    source.height = 112;
    let renderer = null;
    let attempted = false;
    let contextLost = false;
    let destroyed = false;
    let frameId = 0;
    let refreshId = 0;
    let lastFrameAt = 0;
    let materialTime = 0;
    let boostUntil = 0;
    let frameCount = 0;
    let lastError = "";

    // Original GLSL: warped reflection bands and narrow specular highlights.
    const vertexSource = `
        attribute vec2 a_position;
        varying vec2 v_uv;
        void main() {
            v_uv = a_position * 0.5 + 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }`;
    const fragmentSource = `
        precision mediump float;
        varying vec2 v_uv;
        uniform float u_time;
        uniform float u_energy;
        void main() {
            vec2 p = vec2(v_uv.x * 5.7, v_uv.y * 1.6);
            float t = u_time;
            vec2 w = p + vec2(
                sin(p.y * 4.1 + t * 0.38) * 0.28,
                cos(p.x * 1.8 - t * 0.31) * 0.31
            );
            float flow = w.x * 2.9 + w.y * 4.8
                + sin(w.y * 4.0 + t * 0.28) * 1.5
                + cos(w.x * 1.7 - t * 0.43) * 0.8;
            float reflection = 0.5 + 0.5 * sin(flow + t * 0.46);
            float silver = smoothstep(0.12, 0.84, reflection);
            float edge = pow(0.5 + 0.5 * sin(flow * 1.03 + 0.65), 13.0);
            float blue = 0.5 + 0.5 * sin(flow - 0.5 + sin(w.x + t * 0.17));
            vec3 color = mix(vec3(0.035, 0.085, 0.15), vec3(0.77, 0.87, 0.96), silver);
            color = mix(color, vec3(0.20, 0.68, 0.94), smoothstep(0.70, 0.98, blue) * 0.48);
            color += vec3(0.54, 0.70, 0.82) * edge * (0.74 + u_energy * 0.12);
            color *= 0.84 + 0.16 * cos((v_uv.y - 0.5) * 2.0);
            gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
        }`;

    function listen(target, type, listener, options) {
        target.addEventListener(type, listener, options);
        subscriptions.push(() => target.removeEventListener(type, listener, options));
    }

    function motionAllowed() {
        return !destroyed && !document.hidden && !motionQuery.matches && !forcedColorsQuery.matches &&
            !document.documentElement.classList.contains("companion-motion-paused");
    }

    function disabled(element) {
        return element.disabled || element.getAttribute("aria-disabled") === "true";
    }

    function visible(record) {
        if (!record.element.isConnected || !record.intersecting || disabled(record.element)) return false;
        const rect = record.element.getBoundingClientRect();
        if (!rect.width || !rect.height || rect.bottom <= 0 || rect.right <= 0 || rect.top >= innerHeight || rect.left >= innerWidth) return false;
        return record.element.getClientRects().length > 0 && getComputedStyle(record.element).visibility !== "hidden";
    }

    function activeRecords() {
        return [...records.values()].filter(record => record.context && visible(record));
    }

    function clearRipples() {
        rippleTimers.forEach((timer, ripple) => { clearTimeout(timer); ripple.remove(); });
        rippleTimers.clear();
    }

    function stop() {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
        lastFrameAt = 0;
    }

    function shader(gl, type, text) {
        const compiled = gl.createShader(type);
        gl.shaderSource(compiled, text);
        gl.compileShader(compiled);
        if (!gl.getShaderParameter(compiled, gl.COMPILE_STATUS)) {
            const message = gl.getShaderInfoLog(compiled) || "Material shader unavailable";
            gl.deleteShader(compiled);
            throw new Error(message);
        }
        return compiled;
    }

    function initializeRenderer() {
        if (renderer) return renderer;
        if (attempted || contextLost || destroyed) return null;
        attempted = true;
        let gl;
        let vertex;
        let fragment;
        let program;
        try {
            gl = source.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: "low-power" });
            if (!gl) { lastError = "WebGL unavailable; static metal is active"; return null; }
            vertex = shader(gl, gl.VERTEX_SHADER, vertexSource);
            fragment = shader(gl, gl.FRAGMENT_SHADER, fragmentSource);
            program = gl.createProgram();
            gl.attachShader(program, vertex);
            gl.attachShader(program, fragment);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Material program unavailable");
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
            gl.useProgram(program);
            const position = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(position);
            gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
            gl.viewport(0, 0, source.width, source.height);
            gl.disable(gl.DEPTH_TEST);
            renderer = { gl, program, buffer, time: gl.getUniformLocation(program, "u_time"), energy: gl.getUniformLocation(program, "u_energy") };
            lastError = "";
        } catch (error) {
            if (gl && program) gl.deleteProgram(program);
            lastError = String(error.message || error);
        } finally {
            if (gl && vertex) gl.deleteShader(vertex);
            if (gl && fragment) gl.deleteShader(fragment);
        }
        return renderer;
    }

    function resize(record) {
        const rect = record.element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const scale = Math.min(window.devicePixelRatio || 1, 1.5);
        const width = Math.max(1, Math.round(Math.min(rect.width, 1024) * scale));
        const height = Math.max(1, Math.round(Math.min(rect.height, 160) * scale));
        if (record.canvas.width !== width) record.canvas.width = width;
        if (record.canvas.height !== height) record.canvas.height = height;
    }

    function draw(now, targets) {
        const current = initializeRenderer();
        if (!current) return false;
        const { gl } = current;
        const hovered = targets.some(record => record.hovered || record.focused);
        const energy = now < boostUntil ? 2.4 : hovered ? 1 : 0.42;
        materialTime += lastFrameAt ? Math.min((now - lastFrameAt) / 1000, 0.08) * energy : 0;
        lastFrameAt = now;
        gl.useProgram(current.program);
        gl.uniform1f(current.time, materialTime);
        gl.uniform1f(current.energy, energy);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        // Copy immediately in this frame; the WebGL buffer need not be retained.
        targets.forEach(record => {
            resize(record);
            record.context.clearRect(0, 0, record.canvas.width, record.canvas.height);
            record.context.drawImage(source, 0, 0, record.canvas.width, record.canvas.height);
            if (!record.rendered) {
                record.element.classList.add("liquid-metal-rendered");
                record.rendered = true;
            }
        });
        frameCount += 1;
        return true;
    }

    function frame(now) {
        frameId = 0;
        if (!motionAllowed() || contextLost) { stop(); return; }
        const targets = activeRecords();
        if (!targets.length) { stop(); return; }
        // 24 fps is enough for a small polished rim and avoids display-rate GPU work.
        if (!lastFrameAt || now - lastFrameAt >= 1000 / 24) {
            if (!draw(now, targets)) { stop(); return; }
        }
        frameId = requestAnimationFrame(frame);
    }

    function sync() {
        if (!motionAllowed() || contextLost || !activeRecords().length) {
            stop();
            if (!motionAllowed()) clearRipples();
            return;
        }
        if (!frameId && (!attempted || renderer)) frameId = requestAnimationFrame(frame);
    }

    function ripple(record, event) {
        if (disabled(record.element) || !motionAllowed()) return;
        const rect = record.element.getBoundingClientRect();
        const keyboardClick = event.detail === 0;
        const x = keyboardClick ? rect.width / 2 : Math.max(0, Math.min(rect.width, event.clientX - rect.left));
        const y = keyboardClick ? rect.height / 2 : Math.max(0, Math.min(rect.height, event.clientY - rect.top));
        const decoration = document.createElement("span");
        decoration.className = "liquid-metal-ripple";
        decoration.setAttribute("aria-hidden", "true");
        decoration.setAttribute("data-liquid-metal-layer", "");
        decoration.style.left = x + "px";
        decoration.style.top = y + "px";
        const diameter = Math.max(rect.width, rect.height) * 2;
        decoration.style.width = diameter + "px";
        decoration.style.height = diameter + "px";
        const existing = record.element.querySelectorAll(".liquid-metal-ripple");
        if (existing.length >= 3) {
            clearTimeout(rippleTimers.get(existing[0]));
            rippleTimers.delete(existing[0]);
            existing[0].remove();
        }
        record.element.appendChild(decoration);
        rippleTimers.set(decoration, setTimeout(() => { decoration.remove(); rippleTimers.delete(decoration); }, 650));
        boostUntil = performance.now() + 320;
        sync();
    }

    const intersectionObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const record = records.get(entry.target);
            if (record) record.intersecting = entry.isIntersecting;
        });
        sync();
    }) : null;
    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(entries => {
        entries.forEach(entry => { const record = records.get(entry.target); if (record) resize(record); });
        sync();
    }) : null;

    function enhance(element) {
        if (records.has(element)) return;
        const label = document.createElement("span");
        label.className = "liquid-metal-label";
        while (element.firstChild) label.appendChild(element.firstChild);
        const canvas = document.createElement("canvas");
        canvas.className = "liquid-metal-canvas";
        canvas.width = 1;
        canvas.height = 1;
        canvas.setAttribute("aria-hidden", "true");
        canvas.setAttribute("data-liquid-metal-layer", "");
        element.append(canvas, label);
        element.classList.add("liquid-metal-button");
        const record = { element, canvas, label, context: canvas.getContext("2d", { alpha: false }), hovered: false, focused: false, rendered: false, intersecting: !intersectionObserver, cleanups: [] };
        records.set(element, record);
        function on(type, handler) {
            element.addEventListener(type, handler);
            record.cleanups.push(() => element.removeEventListener(type, handler));
        }
        on("pointerenter", () => { record.hovered = true; sync(); });
        on("pointerleave", () => { record.hovered = false; });
        on("focus", () => { record.focused = true; sync(); });
        on("blur", () => { record.focused = false; });
        on("click", event => ripple(record, event));
        intersectionObserver?.observe(element);
        resizeObserver?.observe(element);
        resize(record);
    }

    function remove(record) {
        intersectionObserver?.unobserve(record.element);
        resizeObserver?.unobserve(record.element);
        record.cleanups.forEach(cleanup => cleanup());
        record.canvas.remove();
        record.element.querySelectorAll(".liquid-metal-ripple").forEach(decoration => {
            clearTimeout(rippleTimers.get(decoration));
            rippleTimers.delete(decoration);
            decoration.remove();
        });
        while (record.label.firstChild) record.label.before(record.label.firstChild);
        record.label.remove();
        record.element.classList.remove("liquid-metal-button", "liquid-metal-rendered");
        records.delete(record.element);
    }

    function refresh() {
        if (destroyed) return;
        document.querySelectorAll(SELECTOR).forEach(enhance);
        [...records.values()].forEach(record => {
            if (!record.element.isConnected || !record.element.matches(SELECTOR)) remove(record);
            else resize(record);
        });
        sync();
    }

    function queueRefresh() {
        if (destroyed || refreshId || document.hidden) return;
        refreshId = requestAnimationFrame(() => { refreshId = 0; refresh(); });
    }

    const mutationObserver = new MutationObserver(queueRefresh);
    mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "open", "data-liquid-metal", "disabled", "aria-disabled"] });
    const preferenceObserver = new MutationObserver(sync);
    preferenceObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    listen(source, "webglcontextlost", event => {
        event.preventDefault();
        contextLost = true;
        renderer = null;
        lastError = "WebGL context lost; static metal is active";
        records.forEach(record => {
            record.element.classList.remove("liquid-metal-rendered");
            record.rendered = false;
        });
        stop();
    });
    listen(source, "webglcontextrestored", () => { contextLost = false; attempted = false; sync(); });
    listen(document, "visibilitychange", () => {
        if (document.hidden) {
            stop(); clearRipples();
            if (refreshId) cancelAnimationFrame(refreshId);
            refreshId = 0;
        } else refresh();
    });
    listen(motionQuery, "change", sync);
    listen(forcedColorsQuery, "change", sync);
    listen(window, "resize", queueRefresh, { passive: true });
    listen(window, "scroll", sync, { passive: true });
    listen(window, "astroguardian:page-changed", queueRefresh);
    listen(window, "pagehide", () => { stop(); clearRipples(); });
    listen(window, "pageshow", refresh);

    function destroy() {
        if (destroyed) return;
        destroyed = true;
        stop(); clearRipples();
        if (refreshId) cancelAnimationFrame(refreshId);
        refreshId = 0;
        mutationObserver.disconnect();
        preferenceObserver.disconnect();
        intersectionObserver?.disconnect();
        resizeObserver?.disconnect();
        subscriptions.forEach(cleanup => cleanup());
        [...records.values()].forEach(remove);
        if (renderer) {
            const { gl, program, buffer } = renderer;
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
            gl.getExtension("WEBGL_lose_context")?.loseContext();
        }
        renderer = null;
        if (window.AstroLiquidMetal === api) delete window.AstroLiquidMetal;
    }

    const api = {
        refresh,
        destroy,
        diagnostics: () => ({ buttons: records.size, visible: activeRecords().length, webglContexts: renderer ? 1 : 0, running: !!frameId, frames: frameCount, reducedMotion: motionQuery.matches, forcedColors: forcedColorsQuery.matches, paused: document.documentElement.classList.contains("companion-motion-paused"), contextLost, fallback: !renderer, lastError, destroyed })
    };
    window.AstroLiquidMetal = api;
    refresh();
})();
