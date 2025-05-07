// src/utils/EventBus.js
export default class EventBus {
    constructor() {
        this.listeners = {};
    }

    // Подписаться на событие
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    // Отписаться от события
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    // Вызвать событие
    emit(event, payload) {
        const handlers = this.listeners[event];
        if (!handlers) return;
        for (const cb of handlers) {
            try {
                cb(payload);
            } catch (e) {
                console.error(`Error in handler for ${event}:`, e);
            }
        }
    }
}