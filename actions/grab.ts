import {Bot} from "mineflayer";
import {Item as ItemData} from "minecraft-data";
import {Item as RealItem} from "prismarine-item"

export async function grab(this: Bot, item_id: number): Promise<RealItem> {
    function same_item(real_item: RealItem) {
        return real_item.type === item_id
    }

    if (this.heldItem && same_item(this.heldItem)) return this.heldItem;
    else {
        // 36是第一个quickslot bar index
        let quick_bar_item_id = this.inventory.slots.slice(36, 45).findIndex(current_item => {
            return (current_item && same_item(current_item))
        })
        if (quick_bar_item_id > -1) {
            this.setQuickBarSlot(quick_bar_item_id)
            this.updateHeldItem()
            return this.inventory.slots[quick_bar_item_id + 36]
        } else {// 物品存在于inventory中。
            const find_item = this.inventory.slots.find((inventory_real_item: RealItem) => {
                return (inventory_real_item && same_item(inventory_real_item))
            })
            if (find_item) {
                await this.equip(find_item, "hand");
            } else {
                throw new Error("no such item")
            }
        }
    }
}
