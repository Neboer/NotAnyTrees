import minecraft_data from "minecraft-data"
import config from "../config"

export const mcdata = minecraft_data("1.18.1")
export const blocks = {
    log: mcdata.blocksByName[config.tree_type + "_log"],
    leave: mcdata.blocksByName[config.tree_type + "_leaves"],
    grass_dirt: [mcdata.blocksByName["dirt"], mcdata.blocksByName["grass_block"], mcdata.blocksByName["coarse_dirt"]],

}
export const names = {
    grass_dirt: ["dirt", "grass_block", "coarse_dirt"],
    sapling: config.tree_type + "_sapling",
    log: config.tree_type + "_log",
    leaves: config.tree_type + "_leaves"
}
