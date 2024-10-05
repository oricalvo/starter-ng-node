export interface ActivityState {
    running: number;
}

export function createActivityState(): ActivityState {
    return {
        running: 0,
    }
}
