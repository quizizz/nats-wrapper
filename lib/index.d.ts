/// <reference types="node" />
import { EventEmitter } from 'events';
import { NatsConnection, Subscription } from 'nats';
interface NATSConfig {
    servers?: string | string[];
    timeout?: number;
    pingInterval?: number;
    maxPingOut?: number;
    reconnect?: boolean;
    maxReconnectAttempts?: number;
    noRandomize?: false;
}
declare class NATS {
    name: string;
    emitter: EventEmitter;
    config: NATSConfig;
    client: NatsConnection;
    /**
     * Constructor for the NATS wrapper
     * @param {string} name unique name to this service
     * @param {EventEmitter} emitter emitter for the service
     * @param {Object} config (optional) configuration object of service
     */
    constructor(name: string, emitter: EventEmitter, config?: NATSConfig);
    /**
     * Log a message with additional data
     * @param {string} message message to log
     * @param {any} data additional data
     */
    log(message: string, data?: any): void;
    /**
     * Log a success message with additional data
     * @param {string} message message to log
     * @param {any} data additional data
     */
    success(message: string, data?: any): void;
    /**
     * Log an error with additional data
     * @param {Error} err error to log
     * @param {any} data additional data
     */
    error(err: Error, data?: any): void;
    _registerConnEvents(): void;
    /**
     * Connects to the NATS server
     * @returns {Promise<Object>} instance of the connection
     */
    init(): Promise<Object>;
    /**
     * Publish data to a subject
     * @param {string} subject subject/topic to publish data to
     * @param {Object} data data to be published
     */
    publish(subject: string, data: Object): void;
    /**
     * Subscribe to a subject
     * @param {string} subject subject/topic to subscribe from
     * @callback callback called with the data received
     * @returns {Subscription} subscription instance
     */
    subscribe(subject: string, callback: (err: string | null, data: Object) => void): Subscription;
    /**
     * Unsubscribe from a subject
     * @param {Subscription} sub subscription instance
     */
    unsubscribe(sub: Subscription): void;
}
export default NATS;
