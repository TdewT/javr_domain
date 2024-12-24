export default function objOfArraysEmpty(obj) {
    for (let key in obj) {
        if (Array.isArray(obj[key]) && obj[key].length > 0) {
            return false;
        }
    }
    return true;
}