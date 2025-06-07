import { User } from "@/types/userType";

function compareUserData(a: any, b: any): boolean {
    if (b === null || a === null) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;
  
    return keysA.every(key => a[key] === b[key]);
  }
export { compareUserData };