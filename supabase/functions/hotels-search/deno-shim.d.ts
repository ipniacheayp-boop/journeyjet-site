/**
 * Satisfies the workspace TypeScript server for Supabase Edge Functions (Deno runtime).
 * The JSR import may not resolve in VS Code/Cursor, which causes "Cannot find name 'Deno'".
 * Runtime ignores this file; Deno provides the real globals on deploy.
 */
export {};

declare global {
  // eslint-disable-next-line no-var
  var Deno: {
    env: {
      get(key: string): string | undefined;
    };
    serve(handler: (request: Request) => Response | Promise<Response>): void;
  };
}
