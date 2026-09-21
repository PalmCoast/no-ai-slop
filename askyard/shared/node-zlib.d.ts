declare module "node:zlib" {
  export function deflateSync(data: Uint8Array): Uint8Array;
}
