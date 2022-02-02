import {createBot} from "mineflayer"
import {time_based_2d_movements} from "../actions/movement";
import {Vec3} from "vec3";
import coordinate2d from "../utils/coordinate2d";
import sleep from "../utils/sleep";

// const bot = createBot({
//     username: "Pecorine",
//     host: "krusl.neboer.site",
//     port: 4555,
//     version: "1.18.1"
// })

const bot = createBot({
    username: "Pecorine",
    host: "127.0.0.1",
    port: 52636,
    version: "1.18.1"
})
const bot_time_based_2d_movements = time_based_2d_movements.bind(bot)

function sleep_forever() {
    return new Promise<void>((resolve, reject) => {
        let s = 1
    })
}

bot.on("login", () => {
    // console.log(bot.physics.sprintSpeed, bot.physics.maxGroundSpeed, bot.physics.terminalVelocity)
    bot.on("chat", async (sender, message) => {
        // @ts-ignore
        if (message == "tell") bot.chat(`${bot.entity.position.x} ${bot.entity.position.y} ${bot.entity.position.z}`)
        if (message.startsWith("go")) {
            const parameters = message.split(" ")
            await bot_time_based_2d_movements(new coordinate2d(Number(parameters[1]), Number(parameters[3])), 0)
            bot.chat("arrive")
        }
        if (message == "jump") {
            let ground_height = bot.entity.position.y
            let count = 0
            const check_height = () => {
                count++
                if (count > 3 && bot.entity.position.y == ground_height) {
                    bot.removeListener("move", check_height)
                    console.log("jump over")
                } else {
                    console.log(bot.entity.position.y)
                }
            }
            bot.on("move", check_height)
            bot.setControlState("jump", true)
            bot.setControlState("jump", false)
        }
        if (message == "up") {
            bot.clearControlStates()
            let ground_height = bot.entity.position.y
            let foot_block = bot.blockAt(new Vec3(
                Math.floor(bot.entity.position.x),
                bot.entity.position.y - 1,
                Math.floor(bot.entity.position.z)
            ))
            const check_height_place_block = () => {
                if (bot.entity.position.y - ground_height > 1) {
                    console.log("place!")
                    // @ts-ignore
                    bot._genericPlace(foot_block, new Vec3(0, 1, 0), {forceLook: "ignore"})
                    bot.removeListener("move", check_height_place_block)
                    // return bot.placeBlock(foot_block, new Vec3(0, 1, 0))
                }
            }
            // await bot.lookAt(foot_block.position, true)
            bot.on("move", check_height_place_block)
            bot.setControlState("jump", true)
            bot.setControlState("jump", false)
        }
        if (message.startsWith("speed")) {
            bot.physics.jumpSpeed = Number(message.slice(6))
        }
        if (message.startsWith("put")) {
            const parameters = message.split(" ")
            let another_block = bot.blockAt(new Vec3(
                Number(parameters[1]),
                Number(parameters[2]),
                Number(parameters[3])
            ))
            console.log(another_block)
            // @ts-ignore
            await bot._genericPlace(another_block, new Vec3(0, 1, 0), {forceLook: "ignore"})
            // bot._genericPlace(another_block, new Vec3(0, 1, 0), {forceLook: "ignore"})
        }
        if (message.startsWith("turn")) {
            if (message == "turn") {
                bot.chat(`${bot.entity.yaw} ${bot.entity.pitch}`)
            } else {
                const parameters = message.split(" ")
                if (parameters.length == 3) {
                    await bot.look(Number(parameters[1]), Number(parameters[2]))
                } else {
                    await bot.lookAt(new Vec3(Number(parameters[1]), Number(parameters[2]), Number(parameters[3])))
                }
                bot.chat("look complete")
            }
        }
        if (message == "start put") {
            let ground_height = bot.entity.position.y
            let foot_block = bot.blockAt(new Vec3(
                Math.floor(bot.entity.position.x),
                bot.entity.position.y - 1,
                Math.floor(bot.entity.position.z)
            ))
            let cached_blocks = bot.findBlocks({
                matching: current_block => {
                    return (current_block.name == "dirt" || current_block.name == "grass_block") && !!current_block.position && current_block.position.y == -61
                }, count: 400, useExtraInfo: true
            })
            console.log(cached_blocks)
            for (let single_block of cached_blocks) {
                // @ts-ignore
                let man_block = bot.blockAt(single_block)
                man_block.position = man_block.position.offset(0,1,0)
                try {
                    await bot.placeBlock(man_block, new Vec3(0, 1, 0))
                } catch (e) {

                }

                console.log(single_block)
                await sleep(100)
            }
        }
    })
})

//
// bot.on("login", () => {
//     setTimeout(async () => {
//         const player = Object.values(bot.entities).find(v => v.type == "player")
//         console.log(player.yaw + " " + player.pitch)
//         let ground_height = bot.entity.position.y
//         const foot_block = bot.blockAt(bot.entity.position.offset(0, -1, 0))
//         // await bot.lookAt(bot.entity.position.offset(0, -1, 0))
//         await bot.look(-3.14, -1.5707963267948966)
//         console.log(foot_block.position)
//         let blocking = false
//         console.log(`${bot.entity.yaw} ${bot.entity.pitch}`)
//         const check_height_place_block = async () => {
//             console.log(`${bot.entity.yaw} ${bot.entity.pitch}`)
//             if (bot.entity.position.y - ground_height > 1 && !blocking) {
//                 blocking = true
//                 console.log("place!")
//                 bot.removeListener("move", check_height_place_block)
//                 try {
//                     // foot_block.position = foot_block.position.offset(0,1,0)
//                     await bot.placeBlock(foot_block, new Vec3(0, 1, 0))
//                 } catch (e) {
//                     console.log("error")
//                     console.log(bot.entity.position.y)
//                 }
//                 bot.setControlState("jump", false)
//             }
//         }
//         await bot.lookAt(bot.entity.position.offset(0, -1, 0), true)
//         bot.on("move", check_height_place_block)
//         bot.setControlState("jump", true)
//     }, 5000)
// })
