export default function sleep(miliseconds: number) {
    return new Promise<void>((onfullfilled) => {
        setTimeout(onfullfilled, miliseconds)
    });
}
