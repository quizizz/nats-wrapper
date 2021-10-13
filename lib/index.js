"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NATS = void 0;
const nats_1 = require("nats");
const jc = (0, nats_1.JSONCodec)();
class NATS {
    name;
    emitter;
    config;
    client;
    /**
     * Constructor for the NATS wrapper
     * @param {string} name unique name to this service
     * @param {EventEmitter} emitter emitter for the service
     * @param {object} config (optional) configuration object of service
     */
    constructor(name, emitter, config) {
        this.name = name;
        this.emitter = emitter;
        this.config = Object.assign({}, config);
        this.client = null;
    }
    /**
     * Log a message with additional data
     * @param {string} message message to log
     * @param {any} data additional data
     */
    log(message, data) {
        this.emitter.emit('log', {
            service: this.name, message, data,
        });
    }
    /**
     * Log a success message with additional data
     * @param {string} message message to log
     * @param {any} data additional data
     */
    success(message, data) {
        this.emitter.emit('success', {
            service: this.name, message, data,
        });
    }
    /**
     * Log an error with additional data
     * @param {Error} err error to log
     * @param {any} data additional data
     */
    error(err, data) {
        this.emitter.emit('error', {
            service: this.name, data, err,
        });
    }
    _registerConnEvents() {
        const statusIterable = this.client.status();
        (async () => {
            for await (const status of statusIterable) {
                const { type, data } = status;
                switch (type) {
                    case nats_1.Events.Disconnect:
                        this.error(new Error('client disconnected'), data);
                        break;
                    case nats_1.Events.Reconnect:
                        this.success('client reconnected', data);
                        break;
                    case nats_1.Events.Error:
                        this.error(new Error('client errored'), data);
                        break;
                    case nats_1.Events.Update:
                        this.log('config update', data);
                        break;
                    default:
                        this.log(type, data);
                        break;
                }
            }
        })();
    }
    /**
     * Gets the connection instance
     * @returns {NatsConnection} the connection instance
     */
    getConnection() {
        return this.client;
    }
    /**
     * Connects to the NATS server
     * @returns {Promise<NATS>} instance of the wrapper
     */
    async init() {
        if (this.client) {
            return Promise.resolve(this);
        }
        this.log('Connecting with following config', this.config);
        try {
            const connection = await (0, nats_1.connect)(this.config);
            this.client = connection;
            this._registerConnEvents();
        }
        catch (reason) {
            const error = new Error(reason);
            this.error(error, 'Failed to connect to the NATS server');
            throw error;
        }
        this.success('Connected with following config', this.config);
        return this;
    }
    /**
     * Publish data to a subject
     * @param {Object.<string, any>} obj
     * @param {string} obj.subject subject to publish to
     * @param {object} data payload
     * @param {PublishOptions} options include a `reply` subject if needed
     */
    publish({ subject, data, options }) {
        this.client.publish(subject, jc.encode(data), options);
    }
    /**
     * Subscribe to a subject
     * @param {Object.<string, any>} obj
     * @param {string} obj.subject subject to publish to
     * @param {function} obj.callback callback to invoke
     * @param {SubOptions} obj.options subscription options
     * @returns {Subscription} the subscription instance
     */
    subscribe({ subject, callback, options }) {
        const sub = this.client.subscribe(subject, options);
        (async () => {
            for await (const m of sub) {
                callback({
                    sub,
                    data: jc.decode(m.data),
                    reply: m.reply,
                });
            }
        })();
        return sub;
    }
    /**
     * Unsubscribe from a subject
     * @param {Subscription} sub subscription instance
     */
    unsubscribe(sub) {
        sub.unsubscribe();
    }
}
exports.NATS = NATS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsK0JBQWdHO0FBa0JoRyxNQUFNLEVBQUUsR0FBRyxJQUFBLGdCQUFTLEdBQVUsQ0FBQztBQUUvQixNQUFhLElBQUk7SUFDaEIsSUFBSSxDQUFTO0lBQ2IsT0FBTyxDQUFlO0lBQ3RCLE1BQU0sQ0FBYTtJQUNuQixNQUFNLENBQWlCO0lBRXZCOzs7OztPQUtHO0lBQ0gsWUFBWSxJQUFZLEVBQUUsT0FBcUIsRUFBRSxNQUFtQjtRQUNuRSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsR0FBRyxDQUFDLE9BQWUsRUFBRSxJQUFVO1FBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUN4QixPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE9BQU8sQ0FBQyxPQUFlLEVBQUUsSUFBVTtRQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDNUIsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsR0FBVSxFQUFFLElBQVU7UUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFF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