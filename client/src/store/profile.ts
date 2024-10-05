import { UserDTO } from "@starter/dtos/dist/user.js";

export interface ProfileState {
    user: UserDTO|null;
}

export function createProfileState(): ProfileState {
    return {
        user: null,
    };
}
