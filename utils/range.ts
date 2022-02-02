import config from "../config"
import {Vec3} from "vec3";

export function check_in_xy_range(x: number, y: number) { // 2d range test
    return x >= config.range.x[0] && x <= config.range.x[1] &&
        y >= config.range.z[0] && y <= config.range.z[1]
}
