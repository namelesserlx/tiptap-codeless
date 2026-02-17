export async function readImageSize(
    url: string
): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

export async function readVideoSize(
    url: string
): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        const cleanup = () => {
            video.removeAttribute('src');
            video.load();
        };
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            const width = video.videoWidth;
            const height = video.videoHeight;
            cleanup();
            resolve(width && height ? { width, height } : null);
        };
        video.onerror = () => {
            cleanup();
            resolve(null);
        };
        video.src = url;
    });
}
