import type { AccountPermissions } from "./AccountPermissions";

export interface Account {
    username: string,
    email: string,
    password: string,
    permissions: AccountPermissions
}