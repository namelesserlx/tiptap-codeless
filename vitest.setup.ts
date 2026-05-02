import '@testing-library/jest-dom/vitest';

class ResizeObserverMock {
    observe() {}

    unobserve() {}

    disconnect() {}
}

if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
}

if (!globalThis.requestAnimationFrame) {
    globalThis.requestAnimationFrame = (callback: FrameRequestCallback) =>
        window.setTimeout(() => callback(performance.now()), 16);
}

if (!globalThis.cancelAnimationFrame) {
    globalThis.cancelAnimationFrame = (handle: number) => {
        window.clearTimeout(handle);
    };
}
