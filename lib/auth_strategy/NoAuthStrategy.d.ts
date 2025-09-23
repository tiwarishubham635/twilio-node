import AuthStrategy from "./AuthStrategy";
export default class NoAuthStrategy extends AuthStrategy {
    constructor();
    getAuthString(): Promise<string>;
    requiresAuthentication(): boolean;
}
//# sourceMappingURL=NoAuthStrategy.d.ts.map