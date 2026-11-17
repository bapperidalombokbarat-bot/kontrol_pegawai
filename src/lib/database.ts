import { tursoBackend, isTursoEnabled } from "./turso-backend";
import { localBackend } from "./local-backend";

export const db = isTursoEnabled ? tursoBackend : localBackend;
export { isTursoEnabled };
