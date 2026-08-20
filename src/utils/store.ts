
/**
 * Get the extending store from the context.
 * @param ctx The context containing the extensions.
 * @returns The extending store casted to the specified types.
 */
export function getExtendingStore<Sta, Sto>(ctx: { extensions: Record<string, Sta & Sto> }) {
    return ctx.extensions.extending as Sta & Sto
}