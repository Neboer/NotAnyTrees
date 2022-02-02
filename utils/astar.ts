const {Graph, astar} = require("../utils/_astar")
import coordinate2d from "./coordinate2d";

export interface AstarPoint {
    position: coordinate2d;
    weight: number;
}

export function astar_find_path(start: coordinate2d, end: coordinate2d, graph: number[][], closest = true): AstarPoint[] {
    let inner_graph = new Graph(graph)
    let start_point = inner_graph.grid[start.y][start.x]
    let end_point = inner_graph.grid[end.y][end.x]
    return astar.search(inner_graph, start_point, end_point, {closest}).map(grid_node => {
        return {
            position: new coordinate2d(grid_node.x, grid_node.y),
            weight: grid_node.weight
        }
    })
}
