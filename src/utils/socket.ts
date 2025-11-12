import { Connection } from "../types/types.js";

const connection_store: Connection[] = [];

export function closeConnection(name: string): void {
  const conn = connection_store.find((conn) => conn.name === name);
  if (!conn) {
    console.warn(`Connection with name ${name} not found.`);
    return;
  }
  conn.close();
  conn.closed = true;
}
