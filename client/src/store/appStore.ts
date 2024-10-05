import { createProfileState, ProfileState } from "./profile.js";
import { ActivityState, createActivityState } from "./activity.js";

export interface AppState {
    profile: ProfileState;
    activity: ActivityState;
}

export function createAppStore(): AppState {
    return {
        profile: createProfileState(),
        activity: createActivityState(),
    };
}
