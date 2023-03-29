// @ts-ignore
import Hyperswarm from "hyperswarm";
import RpcNetworkQueryFactory from "./query/index.js";
import b4a from "b4a";
import { createHash, maybeGetAsyncProperty } from "./util.js";

export default class RpcNetwork {
  private _relaysAvailablePromise?: Promise<void>;
  private _relaysAvailableResolve?: Function;
  constructor(swarm = new Hyperswarm()) {
    this._swarm = swarm;
    this.init();
  }

  private _methods: Map<string, Set<string>> = new Map<string, Set<string>>();

  get methods(): Map<string, Set<string>> {
    return this._methods;
  }

  private _factory = new RpcNetworkQueryFactory(this);

  get factory(): RpcNetworkQueryFactory {
    return this._factory;
  }

  private _swarm: typeof Hyperswarm;

  get swarm() {
    return this._swarm;
  }

  private _majorityThreshold = 0.75;

  get majorityThreshold(): number {
    return this._majorityThreshold;
  }

  set majorityThreshold(value: number) {
    this._majorityThreshold = value;
  }

  private _queryTimeout = 30;

  get queryTimeout(): number {
    return this._queryTimeout;
  }

  set queryTimeout(value: number) {
    this._queryTimeout = value;
  }

  private _relayTimeout = 2;

  get relayTimeout(): number {
    return this._relayTimeout;
  }

  set relayTimeout(value: number) {
    this._relayTimeout = value;
  }

  private _relays: Map<string, any> = new Map<string, string[]>();

  get relays(): Map<string, string[]> {
    return this._relays;
  }

  private _ready?: Promise<void>;

  get ready(): Promise<void> {
    if (!this._ready) {
      this._ready = maybeGetAsyncProperty(this._swarm.dht).then((dht: any) =>
        dht.ready()
      ) as Promise<void>;
    }

    return this._ready as Promise<void>;
  }

  get readyWithRelays(): Promise<void> {
    return this.ready.then(() => this._relaysAvailablePromise);
  }

  private _bypassCache: boolean = false;

  get bypassCache(): boolean {
    return this._bypassCache;
  }

  set bypassCache(value: boolean) {
    this._bypassCache = value;
  }

  public getAvailableRelay(module: string, method: string) {
    method = `${module}.${method}`;

    let relays = this._methods.get(method) ?? new Set();

    if (!relays.size) {
      throw Error("no available relay");
    }

    return this._relays.get(
      Array.from(relays)[Math.floor(Math.random() * relays.size)]
    );
  }

  public getRelay(pubkey: string) {
    if (this._relays.has(pubkey)) {
      return this._relays.get(pubkey);
    }

    return undefined;
  }

  private init() {
    this._swarm.join(createHash("lumeweb"));
    this.setupRelayPromise();

    this._swarm.on("connection", async (relay: any) => {
      const pubkey = b4a
        .from(await maybeGetAsyncProperty(relay.remotePublicKey))
        .toString("hex");
      relay.once("close", () => {
        this._methods.forEach((item) => {
          if (item.has(pubkey)) {
            item.delete(pubkey);
          }
        });
        this.relays.delete(pubkey);

        if (!this._relays.size) {
          this.setupRelayPromise();
        }
      });

      const query = this._factory.simple({
        relay,
        query: { module: "core", method: "get_methods", data: null },
      });
      const resp = await query.result;

      if (resp.error) {
        relay.end();
        return;
      }

      if (resp.data) {
        this._relays.set(pubkey, relay);

        (resp.data as string[]).forEach((item) => {
          const methods: Set<string> =
            this._methods.get(item) ?? new Set<string>();

          methods.add(pubkey);
          this._methods.set(item, methods);
        });
        this._relaysAvailableResolve?.();
      }
    });
  }

  private setupRelayPromise() {
    this._relaysAvailablePromise = new Promise<void>((resolve) => {
      this._relaysAvailableResolve = resolve;
    });
  }
}
