// 机器人四处移动需要的方法。
import {Bot} from "mineflayer"
import coordinate2d from "../utils/coordinate2d"
import {bind_interruption} from "../utils/interruption";

export function position_based_2d_movements(this: Bot, target: coordinate2d, distance) {

}

export async function time_based_2d_movements(this: Bot, target: coordinate2d, distance) {
    this.clearControlStates()
    let bot_to_target_distance = target.distantToVec3XZ(this.entity.position)
    if (bot_to_target_distance <= distance) return new Promise<void>(resolve => resolve())
    else {
        let {is_interrupted, cleanup} = bind_interruption(this)
        await this.lookAt(target.toVec3(this.entity.position.y + 1), false)
        this.setControlState('forward', true)
        return new Promise<void>((resolve, reject) => {
            const timeout_target = setTimeout(() => {
                this.clearControlStates()
                resolve()
                cleanup()// 只有在没有中断事件的时候才需要在正常退出机器人的时清理中断监听器。一旦发生中断，机器人会自动清理监听器。
                clearInterval(interruption_checker)
            }, (bot_to_target_distance - distance) * 250)

            const interruption_checker = setInterval(() => {
                if (is_interrupted()) {
                    this.clearControlStates()
                    reject("interrupted")
                    clearTimeout(timeout_target)
                }
            }, 100)
        })

    }
}
