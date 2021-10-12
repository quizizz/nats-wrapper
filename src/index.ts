import { EventEmitter } from 'events';
import { connect, createInbox, DebugEvents, Events, JSONCodec, NatsConnection, PublishOptions, Subscription } from 'nats';

interface NATSConfig {
	servers?: string | string[];
	timeout?: number;
	pingInterval?: number;
	maxPingOut?: number;
	reconnect?: boolean;
	maxReconnectAttempts?: number;
	noRandomize?: false;
}

interface SubMapping {
	[key: number]: Subscription
}

const jc = JSONCodec();

class NATS {
	name: string;
	emitter: EventEmitter;
	config: NATSConfig;
	client: NatsConnection;
	subscriptions: SubMapping;

	/**
	 * Constructor for the NATS wrapper
	 * @param {string} name unique name to this service
	 * @param {EventEmitter} emitter emitter for the service
	 * @param {Object} config (optional) configuration object of service
	 */
	constructor(name: string, emitter: EventEmitter, config?: NATSConfig) {
		this.name = name;
		this.emitter = emitter;
		this.config = Object.assign({}, config);
		this.client = null;
		this.subscriptions = {};
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
		// NATS documentation is outdated and doesn't recognize the method 'on()'

		// @ts-ignore
		this.client.on('connect', (nc) => {
			this.success('client connected');
		});

		// @ts-ignore
		this.client.on(Events.Disconnect, (url) => {
			this.error(new Error('client disconnected'), url);
		});

		// @ts-ignore
		this.client.on(DebugEvents.Reconnecting, (url) => {
			this.log('client reconnecting', url);
		});

		// @ts-ignore
		this.client.on(Events.Reconnect, (nc, url) => {
			this.success('client reconnected', url);
		});

		// @ts-ignore
		this.client.on('serversChanged', (ce) => {
			this.log('servers changed', {
				added: ce.added,
				removed: ce.removed,
			});
		});

		// @ts-ignore
		this.client.on(Events.Error, (err) => {
			this.error(err, 'client got an out of band error');
		});
	}

	/**
	 * Connects to the NATS server
	 * @returns {Promise<Object>} instance of the connection
	 */
	init(): Promise<Object> {
		if (this.client) {
			return Promise.resolve(this);
		}
		this.log('Connecting to', this.config.servers || 'localhost');
		connect(this.config)
			.then((connection: NatsConnection) => {
				this.client = connection;
				this._registerConnEvents();
				return this;
			})
			.catch((reason: any) => {
				this.error(new Error('Failed to connect to the NATS server'), reason);
				return this;
			});
	}

	/**
	 * Publish data to a subject
	 * @param {string} subject subject/topic to publish data to
	 * @param {Object} data data to be published
	 */
	publish(subject: string, data: Object): void {
		this.client.publish(subject, jc.encode(data));
	}

	/**
	 * Subscribe to a subject
	 * @param {string} subject subject/topic to subscribe from
	 * @callback callback calls this fn with the decoded data 
	 */
	subscribe(subject: string, callback: (data: Object) => void) {
		const sub = this.client.subscribe(subject);
		this.subscriptions[sub.getID()] = sub;
		(async () => {
			for await (const m of sub) {
				callback(jc.decode(m.data));
			}
		})();
	}
}

export default NATS;
