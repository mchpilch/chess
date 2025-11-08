import { Listener } from "./listener";

export class Signal<T = void> { // default type void

    private listeners: Listener<T>[] = [];

    add(listener: Listener<T>) {
        this.listeners.push(listener);
    }

    remove(listener: Listener<T>) {
        this.listeners = this.listeners.filter(l => l !== listener);  // keep all listeners except the one being removed
    }

    fire(payload: T) {
        // Iterate over a copy of the array in case listeners remove themselves
        for (const listener of [...this.listeners]) {
            if (listener.invoke(payload) && listener.once) {
                this.remove(listener);
            }
        }
    }
}
