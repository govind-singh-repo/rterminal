import { useCallback, useEffect, useRef, useState } from "react";

export function useDebounceValue(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function useDebounceFunction<T extends (...args: any[]) => void>(fn: T, delay: number) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedFn = useCallback((...args: Parameters<T>) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            fn(...args);
        }, delay);
    }, [fn, delay]);

    return debouncedFn;
}