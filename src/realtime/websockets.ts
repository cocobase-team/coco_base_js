import { BASEURL } from "../utils/utils.js";

type Listener = (data: any) => void;

class ReconnectingWebSocket {
	private url: string;
	private authData: any;
	private ws: WebSocket | null = null;
	private reconnectDelay = 1000;
	private maxReconnectDelay = 30000;
	private pingInterval?: number;

	constructor(url: string, authData: any) {
		this.url = url;
		this.authData = authData;
	}

	connect() {
		this.ws = new WebSocket(this.url);

		this.ws.onopen = () => {
			this.reconnectDelay = 1000;
			this.ws?.send(JSON.stringify(this.authData));

			// start ping/pong
			this.pingInterval = window.setInterval(() => {
				if (this.ws && this.ws.readyState === WebSocket.OPEN) {
					this.ws.send(JSON.stringify({ type: "ping" }));
				}
			}, 30000);
		};

		this.ws.onclose = () => {
			if (this.pingInterval) clearInterval(this.pingInterval);
			setTimeout(() => {
				this.reconnectDelay = Math.min(
					this.reconnectDelay * 2,
					this.maxReconnectDelay
				);
				this.connect();
			}, this.reconnectDelay);
		};
	}

	send(msg: any) {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(msg));
		}
	}

	close() {
		if (this.ws) this.ws.close();
		if (this.pingInterval) clearInterval(this.pingInterval);
	}

	onMessage(cb: (ev: MessageEvent) => void) {
		if (!this.ws) return;
		this.ws.onmessage = cb;
	}
}

export class CollectionWatcher {
	private url: string;
	private apiKey: string;
	private filters: Record<string, any> | undefined;
	private reconnecting?: ReconnectingWebSocket;
	private listeners: Record<string, Listener[]> = {};

	constructor(collectionName: string, apiKey: string, filters?: Record<string, any>) {
		this.url = `${BASEURL.replace(/^http/, 'ws')}/realtime/collections/${collectionName}`;
		this.apiKey = apiKey;
		this.filters = filters;
	}

	connect() {
		this.reconnecting = new ReconnectingWebSocket(this.url, { api_key: this.apiKey, filters: this.filters });
		this.reconnecting.connect();
		this.reconnecting.onMessage((ev) => {
			const data = JSON.parse(ev.data);
			const eventType = data.event;
			(this.listeners[eventType] || []).forEach((cb) => cb(data));
		});
	}

	on(event: string, cb: Listener) {
		if (!this.listeners[event]) this.listeners[event] = [];
		this.listeners[event].push(cb);
	}

	disconnect() {
		this.reconnecting?.close();
	}
}

export class ProjectBroadcast {
	private url = `${BASEURL.replace(/^http/, 'ws')}/realtime/broadcast`;
	private apiKey: string;
	private userId?: string;
	private userName?: string;
	private reconnecting?: ReconnectingWebSocket;
	private listeners: Listener[] = [];

	constructor(apiKey: string, userId?: string, userName?: string) {
		this.apiKey = apiKey;
		this.userId = userId;
		this.userName = userName;
	}

	connect() {
		this.reconnecting = new ReconnectingWebSocket(this.url, { api_key: this.apiKey, user_id: this.userId, user_name: this.userName });
		this.reconnecting.connect();
		this.reconnecting.onMessage((ev) => {
			const data = JSON.parse(ev.data);
			if (data.type === 'message') {
				this.listeners.forEach(cb => cb(data));
			}
		});
	}

	send(data: any) {
		this.reconnecting?.send({ type: 'message', data });
	}

	onMessage(cb: Listener) {
		this.listeners.push(cb);
	}

	disconnect() {
		this.reconnecting?.close();
	}
}

export class RoomChat {
	private url: string;
	private apiKey: string;
	private userId?: string;
	private userName?: string;
	private reconnecting?: ReconnectingWebSocket;
	private listeners: Record<string, Listener[]> = {};

	constructor(roomId: string, apiKey: string, userId?: string, userName?: string) {
		this.url = `${BASEURL.replace(/^http/, 'ws')}/realtime/rooms/${roomId}`;
		this.apiKey = apiKey;
		this.userId = userId;
		this.userName = userName;
	}

	create(roomTitle?: string) {
		this._connect('create', roomTitle);
	}

	join() {
		this._connect('join');
	}

	private _connect(action: 'create' | 'join', roomTitle?: string) {
		this.reconnecting = new ReconnectingWebSocket(this.url, { api_key: this.apiKey, user_id: this.userId, user_name: this.userName, action, room_title: roomTitle });
		this.reconnecting.connect();
		this.reconnecting.onMessage((ev) => {
			const data = JSON.parse(ev.data);
			const eventType = data.event || data.type;
			(this.listeners[eventType] || []).forEach(cb => cb(data));
		});
	}

	sendMessage(content: any) {
		this.reconnecting?.send({ type: 'message', content });
	}

	on(event: string, cb: Listener) {
		if (!this.listeners[event]) this.listeners[event] = [];
		this.listeners[event].push(cb);
	}

	leave() {
		this.reconnecting?.close();
	}
}

export async function listRooms(apiKey: string) {
	const res = await fetch(`${BASEURL}/realtime/rooms`, {
		headers: { 'X-API-Key': apiKey }
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Failed to list rooms: ${text}`);
	}
	return res.json();
}

