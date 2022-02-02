// interrupt the current process
import {Bot} from "mineflayer";

export function bind_interruption(bot_instance: Bot): { is_interrupted: () => boolean, cleanup: () => void } {
    const interrupt_storage = [false]
    let control_object = {
        is_interrupted: () => interrupt_storage[0],
        cleanup: () => {}
    }
    // @ts-ignore
    const listener = bot_instance.once("interrupt", () => {
        interrupt_storage[0] = true
    })
    control_object.cleanup = () => {
        if (!interrupt_storage[0]) { // 如果已经清理过了，就不必再清理了
            // @ts-ignore
            bot_instance.removeListener("interrupt", listener)
        }

    }
    return control_object
}
