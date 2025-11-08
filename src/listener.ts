export class Listener<T = void> {
    constructor(
        public callback: (payload: T) => void,
        public active = true,       // enable/disable this listener
        public once = false         // should this listener auto-remove after first fire
    ) { }

    invoke(payload: T): boolean { // returns true if listener should be removed
        if (this.active === false) return false;
        this.callback(payload); // the function to call when the event fires
        return this.once; // true = should be removed
    }
}
