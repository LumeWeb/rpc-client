import { ERR_NO_RELAYS } from "./error.js";
import b4a from "b4a";
import { isPromise } from "./util.js";
import RPC from "@lumeweb/rpc";
import RpcNetwork from "./network.js";

let activeRelay: RPC | undefined;

export async function setupRelay(network: RpcNetwork) {
  const relays = network.relays;

  if (!activeRelay) {
    if (!relays.length) {
      throw new Error(ERR_NO_RELAYS);
    }

    let relay = relays[Math.floor(Math.random() * relays.length)];
    let socket = network.dht.connect(b4a.from(relay, "hex"));
    if (isPromise(socket)) {
      socket = await socket;
    }

    await socket.opened;

    activeRelay = new RPC(socket);
    socket.once("close", () => {
      activeRelay = undefined;
    });
  }
}

export function getActiveRelay(): RPC {
  return activeRelay as RPC;
}
