/** Liveness check for the Docker healthcheck; does not call the API. */
export function GET() {
  return Response.json({ status: 'ok' });
}
