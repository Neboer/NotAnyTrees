import {Bot} from "mineflayer";
import {Vec3} from "vec3";

function jump_1_block(this: Bot) {
    this.clearControlStates()
    let ground_height = this.entity.position.y
    let foot_block = this.blockAt(new Vec3(
        Math.floor(this.entity.position.x),
        this.entity.position.y - 1,
        Math.floor(this.entity.position.z)
    ))
    const check_height_place_block = () => {
        if (this.entity.position.y - ground_height > 1) {
            // @ts-ignore
            this._genericPlace(foot_block, new Vec3(0, 1, 0), {forceLook: "ignore"})
            this.removeListener("move", check_height_place_block)
            // return this.placeBlock(foot_block, new Vec3(0, 1, 0))
        }
    }
    // await this.lookAt(foot_block.position, true)
    this.on("move", check_height_place_block)
    this.setControlState("jump", true)
    this.setControlState("jump", false)
}
