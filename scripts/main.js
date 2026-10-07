import { world, ItemStack } from "@minecraft/server";

const LOG_TYPES = new Set([
    "minecraft:oak_log",
    "minecraft:spruce_log",
    "minecraft:birch_log",
    "minecraft:jungle_log",
    "minecraft:acacia_log",
    "minecraft:dark_oak_log",
    "minecraft:mangrove_log",
    "minecraft:cherry_log",
    "minecraft:pale_oak_log"
]);

const MAX_LOGS = 256;

// Phase 1, #3/#4: 5-direction offsets (up + the 4 sideways directions).
// We deliberately EXCLUDE straight-down — we only want to discover logs that
// are above/beside the log the player broke, never below it (that's
// underground / unrelated structure territory).
const DIRECTIONS = [
    { x: 0, y: 1, z: 0 },  // up
    { x: 1, y: 0, z: 0 },  // east
    { x: -1, y: 0, z: 0 }, // west
    { x: 0, y: 0, z: 1 },  // south
    { x: 0, y: 0, z: -1 }  // north
];

world.afterEvents.playerBreakBlock.subscribe((event) => {
    const brokenPerm = event.brokenBlockPermutation;
    const targetTypeId = brokenPerm.type.id;

    // Only ever react to recognized log types.
    if (!LOG_TYPES.has(targetTypeId)) return;

    const player = event.player;
    const dimension = event.dimension;
    const startPos = event.block.location;

    // --- Phase 2, #7: bottom-log detection ---
    // Only fell the tree if there was nothing but air below the broken log.
    // If there's another log of the same type below, the player broke a
    // middle/upper log, so we do nothing further (normal drop already happened).
    const belowPos = { x: startPos.x, y: startPos.y - 1, z: startPos.z };
    const belowBlock = dimension.getBlock(belowPos);
    if (belowBlock && belowBlock.type.id === targetTypeId) {
        return; // not the bottom log — stop here
    }

    // --- Phase 5, #12: axe-only gating (Option B) ---
    // Anything else breaking the bottom log just behaves like normal Minecraft.
    const inventory = player.getComponent("minecraft:inventory");
    const container = inventory ? inventory.container : null;
    const heldItem = container ? container.getItem(player.selectedSlotIndex) : null;
    const heldTypeId = heldItem ? heldItem.typeId : "";

    if (!heldTypeId.endsWith("_axe")) {
        return;
    }

    // --- Phase 1, #1/#2/#5/#6: 5-direction BFS over same log type only ---
    const queue = [startPos];
    let head = 0; // Phase 11, #22: index-based queue instead of shift()
    const visited = new Set([`${startPos.x},${startPos.y},${startPos.z}`]);
    const treeLogs = [];
    let hitLimit = false;

    while (head < queue.length) {
        if (treeLogs.length >= MAX_LOGS) {
            hitLimit = true;
            break;
        }

        const current = queue[head++];

        for (const dir of DIRECTIONS) {
            const neighborPos = {
                x: current.x + dir.x,
                y: current.y + dir.y,
                z: current.z + dir.z
            };

            const key = `${neighborPos.x},${neighborPos.y},${neighborPos.z}`;
            if (visited.has(key)) continue;
            visited.add(key);

            const neighborBlock = dimension.getBlock(neighborPos);
            if (neighborBlock && neighborBlock.type.id === targetTypeId) {
                treeLogs.push(neighborPos);
                queue.push(neighborPos);
            }
        }
    }

    if (hitLimit) {
        console.warn(
            `[TreeFeller] Hit MAX_LOGS (${MAX_LOGS}) limit for ${targetTypeId} at ` +
            `${startPos.x},${startPos.y},${startPos.z} — stopping search early.`
        );
    }

    if (treeLogs.length === 0) return; // nothing extra to fell

    // --- Phase 3 + Phase 4, #8/#9/#10/#11 ---
    // For each discovered log: generate the drop FIRST (while the block still
    // exists, using the player's own command context so their tool/enchants
    // matter), THEN remove the block. Never the other way around.
    for (const pos of treeLogs) {
        const block = dimension.getBlock(pos);
        if (!block) continue;

        let dropped = false;

        try {
            const result = player.runCommand(
                `loot spawn ${pos.x} ${pos.y} ${pos.z} mine ${pos.x} ${pos.y} ${pos.z} mainhand`
            );
            dropped = result.successCount > 0;
        } catch {
            dropped = false;
        }

        if (!dropped) {
            // Fallback: guarantee the player still gets *something* even if
            // /loot mine failed for this block (e.g. no loot table match).
            dimension.spawnItem(new ItemStack(block.type.id, 1), {
                x: pos.x + 0.5,
                y: pos.y + 0.5,
                z: pos.z + 0.5
            });
        }

        block.setType("minecraft:air");
    }
});