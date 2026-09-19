/// <reference types="vite/client" />

declare const Netlify: {
  env: {
    get(key: string): string | undefined;
  };
};

declare module "@netlify/edge-functions" {
  export type Context = {
    rewrite: (path: string) => Response | Promise<Response>;
    next: () => Promise<Response>;
  };
  export type Config = {
    path?: string | string[];
    excludedPath?: string | string[];
    method?: string | string[];
  };
}
