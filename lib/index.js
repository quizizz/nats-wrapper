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
     * @param {Object} config (optional) configuration object of service
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
     * @returns {Promise<Object>} instance of the connection
     */
    init() {
        if (this.client) {
            return Promise.resolve(this);
        }
        this.log('Connecting to', this.config.servers || 'localhost');
        (0, nats_1.connect)(this.config)
            .then((connection) => {
            this.client = connection;
            this._registerConnEvents();
            return this;
        })
            .catch((reason) => {
            this.error(new Error('Failed to connect to the NATS server'), reason);
            return this;
        });
    }
    /**
     * Publish data to a subject
     * @param {string} subject subject/topic to publish data to
     * @param {Object} data data to be published
     */
    publish(subject, data) {
        this.client.publish(subject, jc.encode(data));
    }
    /**
     * Subscribe to a subject
     * @param {string} subject subject/topic to subscribe from
     * @callback callback called with the data received
     * @returns {Subscription} subscription instance
     */
    subscribe(subject, callback) {
        return this.client.subscribe(subject, {
            callback: (err, msg) => {
                callback(err ? err.message : null, jc.decode(msg.data));
            }
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwrQkFBNkc7QUFZN0csTUFBTSxFQUFFLEdBQUcsSUFBQSxnQkFBUyxHQUFFLENBQUM7QUFFdkIsTUFBTSxJQUFJO0lBQ1QsSUFBSSxDQUFTO0lBQ2IsT0FBTyxDQUFlO0lBQ3RCLE1BQU0sQ0FBYTtJQUNuQixNQUFNLENBQWlCO0lBRXZCOzs7OztPQUtHO0lBQ0gsWUFBWSxJQUFZLEVBQUUsT0FBcUIsRUFBRSxNQUFtQjtRQUNuRSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsR0FBRyxDQUFDLE9BQWUsRUFBRSxJQUFVO1FBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUN4QixPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE9BQU8sQ0FBQyxPQUFlLEVBQUUsSUFBVTtRQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDNUIsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsR0FBVSxFQUFFLElBQVU7UUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzFCLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHO1NBQzdCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxtQkFBbUI7SUFDbkIsQ0FBQztJQUVEOzs7T0FHRztJQUNILElBQUk7UUFDSCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDaEIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksV0FBVyxDQUFDLENBQUM7UUFDOUQsSUFBQSxjQUFPLEVBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzthQUNsQixJQUFJLENBQUMsQ0FBQyxVQUEwQixFQUFFLEVBQUU7WUFDcEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7WUFDekIsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDM0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUM7YUFDRCxLQUFLLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRTtZQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdEUsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsT0FBTyxDQUFDLE9BQWUsRUFBRSxJQUFZO1FBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBUyxDQUFDLE9BQWUsRUFBRSxRQUFvRDtRQUM5RSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRTtZQUNyQyxRQUFRLEVBQUUsQ0FBQyxHQUFxQixFQUFFLEdBQVEsRUFBRSxFQUFFO2dCQUM3QyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtZQUN4RCxDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7T0FHRztJQUNILFdBQVcsQ0FBQyxHQUFpQjtRQUM1QixHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDbkIsQ0FBQztDQUNEO0FBRUQsa0JBQWUsSUFBSSxDQUFDIn0=