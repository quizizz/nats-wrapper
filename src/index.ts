import { EventEmitter } from 'events';
import { connect, Events, JSONCodec, NatsConnection, PublishOptions, Subscription } from 'nats';

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

const jc = JSONCodec<object>();

export class NATS {
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
	constructor(name: string, emitter: EventEmitter, config?: NATSConfig) {
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
	log(message: string, data?: any): void {
		this.emitter.emit('log', {
			service: this.name, message, data,
		});
	}

	/**
	 * Log a success message with additional data
	 * @param {string} message message to log
	 * @param {any} data additional data
	 */
	success(message: string, data?: any): void {
		this.emitter.emit('success', {
			service: this.name, message, data,
		});
	}

	/**
	 * Log an error with additional data
	 * @param {Error} err error to log
	 * @param {any} data additional data
	 */
	error(err: Error, data?: any): void {
		this.emitter.emit('error', {
			service: this.name, data, err,
		});
	}

	_registerConnEvents(): void {
		const statusIterable = this.client.status();
		(async () => {
			for await (const status of statusIterable) {
				const { type, data } = status;
				switch (type) {
					case Events.Disconnect:
						this.error(new Error('client disconnected'), data);
						break;
					case Events.Reconnect:
						this.success('client reconnected', data);
						break;
					case Events.Error:
						this.error(new Error('client errored'), data);
						break;
					case Events.Update:
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
	getConnection(): NatsConnection {
		return this.client;
	}

	/**
	 * Connects to the NATS server
	 * @returns {Promise<NATS>} instance of the wrapper
	 */
	async init(): Promise<NATS> {
		if (this.client) {
			return Promise.resolve(this);
		}
		this.log('Connecting with following config', this.config);
		try {
			const connection = await connect(this.config);
			this.client = connection;
			this._registerConnEvents();
		} catch (reason) {
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
	publish({ subject, data, options }: { subject: string, data: object, options: PublishOptions }): void {
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
	subscribe({ subject, callback, options }: { subject: string, callback: ({ sub, data, reply }: { sub: Subscription, data: object, reply: string }) => void, options: SubOptions }): Subscription {
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
	unsubscribe(sub: Subscription): void {
		sub.unsubscribe();
	}
}
