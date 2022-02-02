// 代表一棵树
import coordinate2d from "./coordinate2d";
import {Block} from "prismarine-block";
import {Bot} from "mineflayer";
import config from "../config";
import {Vec3} from "vec3";
import {names} from "./data";

// 树叶不算树的一部分。
export class Tree {
    center_axis: coordinate2d // 中心轴
    logs: Block[] // 所有木头
    is_sapling: Boolean // 是否为树苗
    is_complete: Boolean // 树干是否完整
    constructor(sapling: Boolean, center_axis: coordinate2d, logs: Block[] = []) {
        if (sapling) this.is_sapling = true
        this.center_axis = center_axis
        this.logs = logs
        this.is_complete = true
    }

    // 提供一个轴线xy坐标和一个范围，构建一棵树。
    public static build_from_axis(center_axis_xy: coordinate2d, bot: Bot, x_range: number[], z_range: number[]) {
        // 所有距离中心杆不远于6格的方块都可以算作一棵树
        let level = config.range.ground + 1;
        let current_level_block_count = 0;
        let tree_logs: Block[] = []
        do {
            for (let i = x_range[0]; i <= x_range[1]; i++) {
                for (let j = z_range[0]; j <= z_range[1]; j++) {
                    let current_block = bot.blockAt(new Vec3(i, level, j))
                    if (current_block && current_block.name == names.log && coordinate2d.from_Vec3XZ(current_block.position).distantTo(center_axis_xy) < 6.0) {
                        // 目标树干需要满足3个条件：非空气、为树干、且距离中心轴的距离不超过6格。
                        current_level_block_count++;
                        tree_logs.push(current_block)
                    }
                }
            }
        } while (current_level_block_count > 0)
        return new Tree(false, center_axis_xy, tree_logs)
    }
}
