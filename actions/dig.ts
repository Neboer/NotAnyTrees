// 可被打断的挖掘操作
import {Bot} from "mineflayer";
import {Block} from "prismarine-block";
import {bind_interruption} from "../utils/interruption";

export function interruptable_dig(this: Bot, target_block: Block) {
    const {is_interrupted, cleanup} = bind_interruption(this)
    return new Promise<void>((resolve, rejected) => {
        this.dig(target_block).then(() => {
            if (!is_interrupted()) { // 如果没有打断，那么就执行“成功”。否则说明被打断，不需要执行了。
                resolve()
                clearInterval(interrupt_checker)
                cleanup()
            }
        })
        const interrupt_checker = setInterval(() => {
            if (is_interrupted()) {
                this.stopDigging()
                rejected("interrupted")
            }
        }, 100)
    })
}
