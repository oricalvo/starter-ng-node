export function parseInteger(str: string): number {
    const num = +str;
    if (isNaN(num)) {
        throw new Error("Failed to convert string " + str + " to number");
    }

    const whole = Math.floor(num);
    if (whole != num) {
        throw new Error("Unexpected integer string " + str);
    }

    return whole;
}

export function parseEnum<T, K extends keyof T>(enumType: T, str: string): T[K] {
    const val = (<any>enumType)[str];
    if (val === undefined) {
        throw new Error("Invalid enum string " + str);
    }

    return val;
}

export function tryParseEnum<T>(enumType: object, str: string): T | null {
    const val = (<any>enumType)[str];
    if (val === undefined) {
        return null;
    }

    return val;
}

export function reduceWhitespaces(str: string): string {
    if (!str) {
        return str;
    }

    str = str.replace(/\s+/g, " ").trim();
    return str;
}

export function escapeRegExp(str: string) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

export function replaceAll(str: string, find: string, replace: string): string {
    return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}

export function endsWithNewLine(str: string): boolean {
    const last = str.charCodeAt(str.length - 1);
    if (last == 10) {
        return true;
    }

    return false;
}

export function addStringToCommaSeparatedString(commaSeperatedString: string, item: string) {
    const items: Array<string> = commaSeperatedString ? commaSeperatedString.split(",") : [];
    items.push(item);
    return items.join(",");
}

export function getHashCode(str: string): number {
    if (!str.length) {
        return 0;
    }

    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
}

export function trimSlashSuffix(str: string) {
    if (str.endsWith("/")) {
        return str.slice(0, -1);
    }

    return str;
}

//
//  Example usage
//  const mac = "00:1A:2B:3C:4D:5E";
//  const pattern = "00:1x:2B:xx:4D:xx";
//
//  console.log(matchMacAddress(mac, pattern)); // Output: true
//
export function matchMacAddress(macAddress: string, pattern: string): boolean {
    // Helper function to split a MAC address or pattern into its components
    function splitIntoParts(address: string) {
        return address.split('');
    }

    // Split MAC address and pattern into octets
    const macParts: string[] = splitIntoParts(macAddress);
    const patternParts: string[] = splitIntoParts(pattern);

    // Check if both addresses have the same number of parts
    if (macParts.length !== patternParts.length) {
        return false;
    }

    // Compare each part of the MAC address with the pattern
    for (let i: number = 0; i < macParts.length; i++) {
        const macPart: string = macParts[i];
        const patternPart: string = patternParts[i];

        // If the pattern part is a wildcard, it matches any value
        if (patternPart === 'x' || macPart === patternPart) {
            continue;
        } else {
            return false;
        }
    }

    return true;
}

export function anyToString(val: any): string {
    if (val === undefined || val === null || val === "") {
        return "";
    }

    const type = typeof val;
    if (type == "number" || type == "boolean") {
        return val.toString();
    }

    if (type == "string") {
        return val;
    }

    if (type == "object") {
        return "{}";
    }

    return "Unknown";
}
