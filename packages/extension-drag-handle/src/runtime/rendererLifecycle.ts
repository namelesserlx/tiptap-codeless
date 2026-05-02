export interface RendererWithProps<TProps> {
    updateProps: (props: TProps) => void;
    destroy: () => void;
}

export interface RendererLifecycle<TProps> {
    scheduleMount: () => void;
    updateProps: (props: TProps) => void;
    destroy: () => void;
}

export function createRendererLifecycle<TProps>(
    createRenderer: () => RendererWithProps<TProps>,
    delay = 0
): RendererLifecycle<TProps> {
    let renderer: RendererWithProps<TProps> | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    return {
        scheduleMount() {
            if (timerId) {
                clearTimeout(timerId);
            }

            timerId = setTimeout(() => {
                timerId = null;

                if (renderer) {
                    renderer.destroy();
                }

                renderer = createRenderer();
            }, delay);
        },
        updateProps(props) {
            renderer?.updateProps(props);
        },
        destroy() {
            if (timerId) {
                clearTimeout(timerId);
                timerId = null;
            }

            if (renderer) {
                renderer.destroy();
                renderer = null;
            }
        },
    };
}
