"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    }
    /**
     * Connects to the NATS server
     * @returns {Promise<NATS>} instance of the wrapper
     */
    async init() {
        if (this.client) {
            return Promise.resolve(this);
        }
        this.log('Connecting to', this.config.servers || 'localhost');
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
exports.default = NATS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwrQkFBd0Y7QUFrQnhGLE1BQU0sRUFBRSxHQUFHLElBQUEsZ0JBQVMsR0FBVSxDQUFDO0FBRS9CLE1BQU0sSUFBSTtJQUNULElBQUksQ0FBUztJQUNiLE9BQU8sQ0FBZTtJQUN0QixNQUFNLENBQWE7SUFDbkIsTUFBTSxDQUFpQjtJQUV2Qjs7Ozs7T0FLRztJQUNILFlBQVksSUFBWSxFQUFFLE9BQXFCLEVBQUUsTUFBbUI7UUFDbkUsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUNwQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEdBQUcsQ0FBQyxPQUFlLEVBQUUsSUFBVTtRQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDeEIsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxPQUFPLENBQUMsT0FBZSxFQUFFLElBQVU7UUFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQzVCLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLEdBQVUsRUFBRSxJQUFVO1FBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUMxQixPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRztTQUM3QixDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsbUJBQW1CO0lBQ25CLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsSUFBSTtRQUNULElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNoQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDN0I7UUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxXQUFXLENBQUMsQ0FBQztRQUM5RCxJQUFJO1lBQ0gsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7WUFDekIsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7U0FDM0I7UUFBQyxPQUFPLE1BQU0sRUFBRTtZQUNoQixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDO1lBQzFELE1BQU0sS0FBSyxDQUFDO1NBQ1o7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBOEQ7UUFDN0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxTQUFTLENBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBMEk7UUFDL0ssTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDWCxJQUFJLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxHQUFHLEVBQUU7Z0JBQzFCLFFBQVEsQ0FBQztvQkFDUixHQUFHO29CQUNILElBQUksRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQ3ZCLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSztpQkFDZCxDQUFDLENBQUM7YUFDSDtRQUNGLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDTCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFRDs7O09BR0c7SUFDSCxXQUFXLENBQUMsR0FBaUI7UUFDNUIsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ25CLENBQUM7Q0FDRDtBQUVELGtCQUFlLElBQUksQ0FBQyJ9