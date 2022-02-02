// 在执行此方法之前，机器人务必已经走到了目标树木的正下方。也就是说，目标树一定不是完整的，而是树干被砍去两块的不完整的树木
import {Bot} from "mineflayer";
import {Tree} from "../utils/tree";
import {Block} from "prismarine-block";
import config from "../config";
import {Vec3} from "vec3";

// 为了保证信
async function cut_down_a_tree(this: Bot, target_tree: Tree) {
    let blocks_to_cut: Block[] = [...target_tree.logs]
    for (let tree_log of target_tree.logs) {
        if (tree_log.position.x != target_tree.center_axis.x && tree_log.position.z != target_tree.center_axis.y) {
            // 如果当前树干不是中心轴树干，将下面的方块放入待砍伐列表。注意不要重复了
            for (let possible_beneath_y = tree_log.position.y - 1; possible_beneath_y > config.range.ground; possible_beneath_y--) {

                let exist_block_indicator = blocks_to_cut.find(current_block =>
                    current_block.position.equals(new Vec3(tree_log.position.x, possible_beneath_y, tree_log.position.z)))
            }
        }
    }
}
