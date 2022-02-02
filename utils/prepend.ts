export function prepend(value: any, array: any[]): any[] {
    let newArray = array.slice();
    newArray.unshift(value);
    return newArray;
}
