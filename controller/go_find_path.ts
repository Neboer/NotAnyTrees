// 接近一棵树。
import {Block} from "prismarine-block";
import {blocks, names} from "../utils/data";
import {Bot} from "mineflayer";
import {Vec3} from "vec3";
import config from "../config";
import {astar_find_path, AstarPoint} from "../utils/astar";
import coordinate2d from "../utils/coordinate2d";
import {bind_interruption} from "../utils/interruption";
import {time_based_2d_movements} from "../actions/movement";
import {interruptable_dig} from "../actions/dig";

const obstacle_object_names = [names.leaves, names.log].concat(names.grass_dirt)

function block_name_check_obstacle(test_block: Block) {
    return obstacle_object_names.includes(test_block.name)
}

function get_weight_of_target(block: Block | null): number {
    if (block) {
        if (block.name === blocks.log.name) return 10; // 一块木头的权重是10
        else if (block.name === blocks.leave.name) return 4; // 一个树叶方块是4
        else if (block.name === "torch") return 1; // 火把的权重和空气一样。
        else if (names.grass_dirt.includes(block.name)) return 5;// 其实场地里不应该有草方块的。
        else if (block.name === names.sapling) return 1; // 树苗可以直接走过，因此不算作方块。
        else {
            // 工作区域里有其他方块，这本身就是不可以接受的。
            throw new Error("there are other blocks on the farm.")
        }
    } else {
        return 1; // 空气方块的权重是1
    }
}

export interface DigActionInstruction {
    type: "Dig"
    dig_target: Block
}

export interface WalkActionInstruction {
    type: "Walk"
    walk_target: coordinate2d
}

type ActionInstruction = DigActionInstruction | WalkActionInstruction

// 寻路的计算分为2个部分，第一算出所有需要走过的点，第二根据这些点，算出所有要做的行为。
// get all point
export function find_path_all_points(this: Bot, target: coordinate2d): AstarPoint[] {
    // map是二维平面，x = mcX; y = mcZ。所以map一共有y个一维数组作为元素，每个数组里又有x个数字元素。
    const x_length = config.range.x[1] - config.range.x[0] + 1
    const z_length = config.range.z[1] - config.range.z[0] + 1
    const bot_block_position = new coordinate2d(Math.floor(this.entity.position.x), Math.floor(this.entity.position.z))

    let map: number[][] = (new Array(z_length)).map(v => new Array(x_length))
    // 根据地形生成地图。
    for (let zi = config.range.z[0]; zi <= config.range.z[1]; zi++) {// i: y
        for (let xi = config.range.x[0]; xi <= config.range.x[1]; xi++) {// j: x
            // 搜索地面上1、2层的物体。
            let level_1_blocks: Block | null = this.blockAt(new Vec3(xi, config.range.ground + 1, zi))
            let level_2_blocks: Block | null = this.blockAt(new Vec3(xi, config.range.ground + 2, zi))
            // 两层的权重加起来，就是地图上这个方块的权重。
            // 这个方块的索引是map[z][x]
            map[zi][xi] = get_weight_of_target(level_1_blocks) + get_weight_of_target(level_2_blocks)
        }
    }
    //根据地图计算一个最短的路径。
    return astar_find_path(bot_block_position, target, map, false)
}

// find a path in a plain field. use A* algorithm
export function get_instructions_to_target(points_list: AstarPoint[], bot_block_position: coordinate2d): ActionInstruction[] {
    if (points_list.length == 0) throw new Error("cannot find points_list to target")
    else if (points_list.length == 1) {
        // 如果路线只有1格，则不需要做转弯检查
        let simple_result: ActionInstruction[] = []
        const current_level1_block = this.blockAt(points_list[0].position.toVec3(config.range.ground + 1))
        const current_level2_block = this.blockAt(points_list[0].position.toVec3(config.range.ground + 2))
        if (block_name_check_obstacle(current_level1_block)) simple_result.push({
            type: "Dig",
            dig_target: current_level1_block
        })
        if (block_name_check_obstacle(current_level2_block)) simple_result.push({
            type: "Dig",
            dig_target: current_level2_block
        })
        simple_result.push({walk_target: points_list[0].position, type: "Walk"})
        return simple_result
    } else {
        // 如果路线超过2格，就有可能发生转弯，我们需要关注这一点、
        let actions_list: ActionInstruction[] = []
        let obstacles_list: Block[] = []
        const check_in_obstacles_list = (test_block: Block): Boolean => {
            const find_result = obstacles_list.find(value => {
                return value.name == test_block.name && value.position.distanceTo(test_block.position) == 0
            })
            return !!find_result;
        }
        // 找到所有障碍物
        points_list.forEach(point => {
            const current_level1_block = this.blockAt(point.position.toVec3(config.range.ground + 1))
            const current_level2_block = this.blockAt(point.position.toVec3(config.range.ground + 2))
            if (block_name_check_obstacle(current_level1_block)) obstacles_list.push(current_level1_block)
            if (block_name_check_obstacle(current_level2_block)) obstacles_list.push(current_level2_block)
        })
        let last_position = bot_block_position
        for (let index = 0; index < points_list.length - 1; index++) {// 循环到倒数第2个元素。因为总是要走到最后一个位置。
            // 先判断是否要打障碍物，再判断是否要转弯。
            const current_level1_block = this.blockAt(points_list[index].position.toVec3(config.range.ground + 1))
            const current_level2_block = this.blockAt(points_list[index].position.toVec3(config.range.ground + 2))
            if (check_in_obstacles_list(current_level1_block) || check_in_obstacles_list(current_level2_block)) {// 如果遇到障碍就停下来
                if (last_position != bot_block_position) {
                    actions_list.push({type: "Walk", walk_target: last_position})
                }
                for (let obs_index = obstacles_list.length - 1; obs_index >= 0; obs_index--) {// 逆向循环，因为要在循环的时候删除元素。
                    if (this.canDigBlock(obstacles_list[obs_index])) {
                        actions_list.push({type: "Dig", dig_target: obstacles_list[obs_index]})
                        obstacles_list.splice(obs_index, 1) // 尽可能多的挖去障碍方块。
                    }
                }
            }
            // 挖去障碍后（或者没有遇到障碍），继续寻路。如果三点不共线，那么需要在当前点停下拐弯。
            if (!coordinate2d.simpleLinearCheck(last_position, points_list[index].position, points_list[index + 1].position)) {
                actions_list.push({type: "Walk", walk_target: points_list[index].position})
            }
            last_position = points_list[index].position
        }
        // 最后，需要把最后的点的位置添加进寻路指令中。
        const current_level1_block = this.blockAt(points_list[points_list.length - 1].position.toVec3(config.range.ground + 1))
        const current_level2_block = this.blockAt(points_list[points_list.length - 1].position.toVec3(config.range.ground + 2))
        if (check_in_obstacles_list(current_level1_block)) actions_list.push({
            type: "Dig",
            dig_target: current_level1_block
        })
        if (check_in_obstacles_list(current_level2_block)) actions_list.push({
            type: "Dig",
            dig_target: current_level2_block
        })
        actions_list.push({walk_target: points_list[points_list.length - 1].position, type: "Walk"})
        return actions_list
    }
}

export async function execute_instructions(this: Bot, instructions_list: ActionInstruction[]) {
    const {is_interrupted, cleanup} = bind_interruption(this)
    for (let current_instruction of instructions_list) {
        if (!is_interrupted()) {
            if (current_instruction.type == "Dig") {
                await interruptable_dig.call(this, current_instruction.dig_target)
            } else if (current_instruction.type == "Walk") {
                await time_based_2d_movements.call(this, current_instruction.walk_target, 0.1)
            }
        } else {
            break // 如果被打断了，那么在执行完当前操作之后直接退出吧
        }
    }
    cleanup()
}
