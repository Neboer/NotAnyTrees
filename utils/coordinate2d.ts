import {Vec3} from "vec3";


export default class coordinate2d {
    x: number
    y: number

    public constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    static from_Vec3XZ(vector: Vec3): coordinate2d {
        return new coordinate2d(vector.x, vector.z)
    }

    public distantTo(target: coordinate2d) {
        const diffX = target.x - this.x
        const diffY = target.y - this.y
        return Math.sqrt(diffX * diffX + diffY * diffY)
    }

    public distantToVec3XZ(target: Vec3) {
        const diffX = target.x - this.x
        const diffY = target.z - this.y
        return Math.sqrt(diffX * diffX + diffY * diffY)
    }

    public toVec3(height: number) {
        return new Vec3(this.x, height, this.y)
    }

    public static linearCheck(target1: coordinate2d, target2: coordinate2d, target3: coordinate2d): Boolean {
        const area = target1.x * (target2.y - target3.y) +
            target2.x * (target3.y - target1.y) +
            target3.x * (target1.y - target2.y);
        return area == 0 // 如果面积为0，则三点共线
    }

    // 如果参与检测的方块相邻，用这个算法比较节省时间
    public static simpleLinearCheck(target1: coordinate2d, target2: coordinate2d, target3: coordinate2d): Boolean {
        return ((target3.x - target2.x) == (target2.x - target1.x)) && ((target3.y - target2.y) == (target2.y - target1.y))
    }
}
