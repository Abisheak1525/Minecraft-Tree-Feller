
```markdown
# 🌳 Tree Feller

A lightweight Minecraft Bedrock behavior pack that automatically chops down connected tree logs when the player breaks the **bottom log with an axe**.

Instead of manually breaking every log in a tree, simply use an axe to break the bottom log and Tree Feller will automatically detect and remove the connected logs above it.

---

## ✨ Features

- 🪓 **Axe-only activation**
- 🌲 Supports multiple Minecraft tree types
- 🔗 Automatically detects connected logs
- 🚫 Does not activate when breaking a middle or upper log
- ⬆️ Searches upward and horizontally for connected logs
- 🎒 Attempts to preserve normal Minecraft loot drops
- 🛡️ Includes a maximum log limit for safety
- ⚡ Uses a Breadth-First Search (BFS) algorithm
- 📦 Works as a Minecraft Bedrock Behavior Pack
- 🔧 Simple project structure
- 💻 Written entirely in JavaScript using the Minecraft Script API

---

# 🌲 Supported Trees

Tree Feller currently supports the following log types:

| Tree | Log |
|---|---|
| 🌳 Oak | `minecraft:oak_log` |
| 🌲 Spruce | `minecraft:spruce_log` |
| 🌳 Birch | `minecraft:birch_log` |
| 🌴 Jungle | `minecraft:jungle_log` |
| 🌳 Acacia | `minecraft:acacia_log` |
| 🌳 Dark Oak | `minecraft:dark_oak_log` |
| 🌴 Mangrove | `minecraft:mangrove_log` |
| 🌸 Cherry | `minecraft:cherry_log` |
| 🌳 Pale Oak | `minecraft:pale_oak_log` |

---

# 🎮 How To Use

## 1. Install the Behavior Pack

Download or clone this repository.

Place the `TreeFeller` folder inside your Minecraft Bedrock development behavior packs directory.

The final structure should look like this:

```text
com.mojang/
└── development_behavior_packs/
    └── TreeFeller/
        ├── manifest.json
        └── scripts/
            └── main.js
```

---

# 2. Enable the Behavior Pack

Launch **Minecraft Bedrock Edition**.

Create a new world or edit an existing world.

Navigate to:

```text
World Settings
    ↓
Behavior Packs
    ↓
My Packs
    ↓
The Tree Feller
```

Activate the pack.

Once activated, enter the world.

---

# 3. Start Chopping

Equip an axe and break the **bottom log of a tree**.

Tree Feller will automatically find the connected logs and remove them.

For example:

```text
          🌿 🌿 🌿
        🌿  🪵  🌿
            🪵
            🪵
            🪵
            🪵  ← Break this log
           ███
```

After breaking the bottom log:

```text
          🌿 🌿 🌿
        🌿  🪵  🌿
            🪵
            🪵
            🪵
            
```

The connected logs are automatically removed and their drops are generated.

---

# 🪓 Axe Requirement

Tree Feller only activates when the player is holding an axe.

Supported Minecraft axes include:

- Wooden Axe
- Stone Axe
- Iron Axe
- Golden Axe
- Diamond Axe
- Netherite Axe

If the player breaks the bottom log while holding something other than an axe, the block behaves normally.

For example:

```text
Player holding axe
        ↓
Break bottom log
        ↓
Tree Feller activates
        ↓
Connected logs are removed
```

But:

```text
Player holding hand / pickaxe / shovel
        ↓
Break bottom log
        ↓
Tree Feller does nothing
        ↓
Normal Minecraft behavior
```

---

# 📍 Bottom Log Detection

Tree Feller is intentionally designed to activate only when the player breaks the **bottom log** of a tree.

The script checks the block directly underneath the broken log.

If another log of the same type exists underneath it, the script assumes that the player is breaking a middle or upper section of the tree.

In that situation, Tree Feller does nothing.

For example:

```text
        🪵
        🪵
        🪵  ← Player breaks this
        🪵
        🪵
```

Because another same-type log exists below the broken block, Tree Feller will not activate.

This prevents accidentally chopping down an entire tree when the player only wants to remove one section.

---

# 🔍 How Tree Detection Works

Tree Feller uses a **Breadth-First Search (BFS)** algorithm to locate connected logs.

After the player breaks the bottom log, the script searches neighboring blocks.

It searches in five directions:

```text
             UP
              ↑
              │
              🪵
        WEST ← ┼ → EAST
              │
              ↓
             SOUTH
```

The actual directions are:

```text
Up
East
West
South
North
```

The script intentionally **does not search downward**.

This is done to prevent the algorithm from accidentally discovering underground logs or unrelated structures beneath the tree.

---

# 🔗 Connected Logs

Only logs connected through the search directions are considered part of the tree.

For example:

```text
        🪵
        🪵
    🪵  🪵  🪵
        🪵
```

The connected logs can be detected.

However, completely disconnected logs will not be included.

---

# 🌲 Same Log Type

Tree Feller only detects logs matching the type of the original block that the player broke.

For example, if the player breaks:

```text
minecraft:oak_log
```

Tree Feller searches for other:

```text
minecraft:oak_log
```

It will not treat other log types as part of the same tree.

For example:

```text
Oak Log
Oak Log
Spruce Log
Oak Log
```

The spruce log will not be included in the oak tree search.

---

# 🛡️ Maximum Log Limit

Tree Feller includes a safety limit:

```javascript
const MAX_LOGS = 256;
```

This means a maximum of **256 connected logs** can be processed during a single tree-felling operation.

The limit exists to prevent extremely large structures from causing excessive processing.

If the script reaches the limit, it stops searching and writes a warning to the scripting console.

---

# 🎒 Item Drops

Tree Feller attempts to preserve the normal Minecraft loot behavior.

For every discovered log, the script first attempts to generate the block's normal loot before removing the block.

It uses the Minecraft `/loot` command with the player's main-hand context.

This allows normal tool-related behavior and enchantments to be considered where supported.

If the loot command fails, Tree Feller has a fallback system.

The fallback creates an item matching the original block type.

This prevents discovered logs from simply disappearing without producing anything.

---

# ⚡ How The Algorithm Works

The main tree detection system uses **Breadth-First Search (BFS)**.

The process is:

```text
Player breaks a block
        │
        ▼
Is it a supported log?
        │
       NO ──────────► Do nothing
        │
       YES
        │
        ▼
Is there a same-type log below it?
        │
       YES ──────────► Do nothing
        │
       NO
        │
        ▼
Is the player holding an axe?
        │
       NO ──────────► Do nothing
        │
       YES
        │
        ▼
Start BFS
        │
        ▼
Search connected logs
        │
        ▼
Maximum 256 logs
        │
        ▼
Generate loot
        │
        ▼
Remove discovered logs
        │
        ▼
Done
```

---

# 🧠 Why BFS?

BFS is useful for this because the tree is essentially treated as a group of connected blocks.

The algorithm starts at the broken log and explores nearby logs.

When another matching log is discovered, it is added to the queue.

The process continues until there are no more connected logs to investigate.

A `Set` is also used to keep track of already-visited positions so the same block is not processed repeatedly.

---

# 📁 Project Structure

The project is intentionally kept simple.

```text
TreeFeller/
│
├── README.md
│
├── manifest.json
│
└── scripts/
    └── main.js
```

### `README.md`

Documentation for the project.

### `manifest.json`

Defines the Minecraft Behavior Pack and its modules.

It contains:

- Pack name
- Description
- UUIDs
- Version
- Minimum Minecraft version
- JavaScript script configuration
- `@minecraft/server` dependency

### `scripts/main.js`

Contains the complete Tree Feller implementation.

The script handles:

- Tree detection
- Log type detection
- Bottom-log detection
- Axe detection
- BFS traversal
- Visited-block tracking
- Log limits
- Loot generation
- Fallback item drops
- Block removal

---

# ⚙️ Requirements

This project requires:

- **Minecraft Bedrock Edition**
- Minecraft **1.21.130 or later**
- `@minecraft/server` **2.4.0**
- Behavior Packs enabled

The current `manifest.json` specifies:

```json
"min_engine_version": [1, 21, 130]
```

and:

```json
{
    "module_name": "@minecraft/server",
    "version": "2.4.0"
}
```

---

# 🧪 Example

Suppose you find this tree:

```text
          🌿 🌿
        🌿 🪵 🌿
           🪵
           🪵
           🪵
           🪵
          ███
```

You equip an axe and break the bottom log:

```text
           🪵
           🪵
           🪵
           🪵  ← Break
          ███
```

Tree Feller:

1. Detects that the block is a supported log.
2. Checks that there isn't another same-type log below it.
3. Checks that the player is holding an axe.
4. Starts the BFS search.
5. Finds the connected logs.
6. Generates loot for the discovered logs.
7. Removes the discovered logs.

The result is:

```text
        🌿 🌿
      🌿     🌿


        ███
```

---

# ⚠️ Current Limitations

## 1. Same Log Type Only

Different log types are not considered part of the same tree.

```text
Oak
Oak
Spruce  ← Not included
Oak
```

---

## 2. Maximum 256 Logs

The script will process a maximum of 256 discovered logs during one operation.

```javascript
const MAX_LOGS = 256;
```

---

## 3. No Downward Search

The algorithm intentionally does not search downward.

This is a design choice intended to prevent underground or unrelated structures from being detected.

---

## 4. Bottom Log Required

Tree Feller is designed to activate only when the bottom log is broken.

Breaking a middle or upper log will behave normally.

---

## 5. Behavior Pack Only

Tree Feller is a **Behavior Pack**.

It does not require a Resource Pack because it does not add or modify textures, models, sounds, or other visual assets.

---

# 🔧 Customization

The project can be modified to support additional log types.

The supported logs are defined in:

```text
scripts/main.js
```

Inside:

```javascript
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
```

To add another compatible log block, add its Minecraft block ID to this set.

---

# 🔄 Changing the Maximum Tree Size

The maximum number of logs can be changed by modifying:

```javascript
const MAX_LOGS = 256;
```

For example:

```javascript
const MAX_LOGS = 512;
```

would allow up to 512 logs to be processed.

Be careful when increasing this value because very large searches may require more processing.

---

# 🐛 Troubleshooting

## Tree Feller does nothing

Check the following:

### Is the Behavior Pack enabled?

Go to:

```text
World Settings
→ Behavior Packs
→ Active
```

Make sure **The Tree Feller** is active.

### Are you holding an axe?

Tree Feller only activates when an axe is in the selected hotbar slot.

### Are you breaking the bottom log?

Try breaking the lowest log directly above the ground.

### Is the log supported?

Make sure the block is one of the supported log types.

---

# 📝 Technical Information

### Minecraft Script API

The project uses:

```javascript
import { world, ItemStack } from "@minecraft/server";
```

The main event listener is:

```javascript
world.afterEvents.playerBreakBlock.subscribe(...)
```

This allows the script to respond when a player breaks a block.

---

# 📜 License

This project is provided for personal, educational, and Minecraft development purposes.

You are free to:

- Use the project
- Modify the project
- Experiment with the code
- Use it in your own Minecraft worlds
- Create your own versions

If you redistribute a modified version, giving credit to the original project is appreciated.

---

# 👤 Author

Created as a Minecraft Bedrock scripting project.

**Tree Feller** 🌳🪓

---

## ⭐ Support

If you find the project useful, consider giving the repository a ⭐ on GitHub.

Happy chopping! 🌲🪓
```

Save that as:

```text
TreeFeller/README.md
```

So your GitHub repository becomes:

```text
TreeFeller
│
├── README.md
├── manifest.json
└── scripts
    └── main.js
```