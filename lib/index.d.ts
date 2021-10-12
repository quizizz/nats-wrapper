/// <reference types="node" />
import { EventEmitter } from 'events';
import { NatsConnection, PublishOptions, Subscription } from 'nats';
interface NATSConfig {
    servers?: string | string[];
    timeout?: number;
    pingInterval?: number;
    maxPingOut?: number;
    reconnect?: boolean;
    maxReconnectAttempts?: number;
    noRandomize?: false;
}
interface SubOptions {
    queue?: string;
    max?: number;
    timeout?: number;
}
export declare class NATS {
    name: string;
    emitter: EventEmitter;
    config: NATSConfig;
    client: NatsConnection;
    /**
     * Constructor for the NATS wrapper
     * @param {string} name unique name to this service
     * @param {EventEmitter} emitter emitter for the service
     * @param {object} config (optional) configuration object of service
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
     * @returns {Promise<NATS>} instance of the wrapper
     */
    init(): Promise<NATS>;
    /**
     * Publish data to a subject
     * @param {Object.<string, any>} obj
     * @param {string} obj.subject subject to publish to
     * @param {object} data payload
     * @param {PublishOptions} options include a `reply` subject if needed
     */
    publish({ subject, data, options }: {
        subject: string;
        data: object;
        options: PublishOptions;
    }): void;
    /**
     * Subscribe to a subject
     * @param {Object.<string, any>} obj
     * @param {string} obj.subject subject to publish to
     * @param {function} obj.callback callback to invoke
     * @param {SubOptions} obj.options subscription options
     * @returns {Subscription} the subscription instance
     */
    subscribe({ subject, callback, options }: {
        subject: string;
        callback: ({ sub, data, reply }: {
            sub: Subscription;
            data: object;
            reply: string;
        }) => void;
        options: SubOptions;
    }): Subscription;
    /**
     * Unsubscribe from a subject
     * @param {Subscription} sub subscription instance
     */
    unsubscribe(sub: Subscription): void;
}
export {};
