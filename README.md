# Extending Pinia Stores (pinia-plugin extension)

Plugin that extends Pinia stores (built on top of `pinia-plugin-subscription`) to allow composing and reusing store logic between related stores.

## Key ideas:
- Extend a "child" store with state, getters and actions from one or more "parent" stores.
- Support both Options API and Setup API style stores created with `defineAStore` (from `pinia-plugin-subscription`).

## Features
- Compose parent stores into a child store via `parentsStores`.
- Extend or chain actions from parent stores into the child (`actionsToExtends`).
- Rename actions and properties using `actionsToRename` / `propertiesToRename`.
- Works with `pinia-plugin-subscription` and its `defineAStore` helper.

## Installation

This project is built to be used together with `pinia` and `pinia-plugin-subscription`.


```bash
npm install pinia-plugin-extending-store
# or
yarn add pinia-plugin-extending-store
```

## How to register the plugin

In `src/main.ts` (or your application entry):

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPlugin } from 'pinia-plugin-subscription'
import ExtendsPiniaStore from './plugins/ExtendsPiniaStore'

const app = createApp(App)
const pinia = createPinia()

pinia.use(createPlugin([ExtendsPiniaStore]))

app.use(pinia)
app.mount('#app')
```

## How it works (high level)
- The project provides `ExtendsPiniaStore` (a `PluginSubscriber`) which will be invoked by `pinia-plugin-subscription` when a store is created.
- The core logic is in `src/core/StoreExtension.ts` which duplicates state, computed properties and actions from parent stores into the child store.
- Parent stores are described by an object (`{ myStoreId: useMyStore, ... }`) or with the helper `createParentStore` which builds parent store IDs dynamically using the child's id.

### Store options (API)

The plugin uses an extended store options shape defined in `src/types/store.ts`.

#### Store-level options (`ExtendedStoreOptions`)
- `parentsStores: ParentStoreInterface[] | { [key: string]: store }` — array of `ParentStore` instances (use `createParentStore` helper function) or object where the name of each property defines the Store's ID, and their value is the Store's constructor function (`{ myStoreId: useMyStore, ... }`).
- `actionsToExtends?: string[]` — default list of parent actions that should be chained/merged into the child.
- `actionsToRename?: Record<string, string>` — *(Deprecated: use `ParentStoreOptions` instead)* rename parent actions when adding them to the child.
- `propertiesToRename?: Record<string, string>` — *(Deprecated: use `ParentStoreOptions` instead)* rename parent state properties when adding them to the child.

#### Per-parent options (`ParentStoreOptions`)
You can pass options directly to each parent store as a 3rd `createParentStore` function parameter:
`createParentStore(id, storeConstructor, parentStoreOptions)`:

- `actionsToRename?: Record<string, string>` — rename parent actions specifically for this parent store. Takes priority over store-level `actionsToRename`.
- `propertiesToRename?: Record<string, string>` — rename parent state properties specifically for this parent store. Takes priority over store-level `propertiesToRename`.
- `actionsToExtends?: string[]` — list of actions from this specific parent store to chain/merge with the child.

#### Action chaining behavior
When an action exists on both a parent and child store and is listed in `actionsToExtends` (either store-level or on `ParentStoreOptions`), the parent action runs first, then the child action runs right after — synchronously, without waiting for the parent action's result even if it returns a promise. The chained action does not return a value.

#### Conflict handling & diagnostics
If an action or state property from a parent store already exists on the child store and is not marked in `actionsToExtends` or renamed:
- The conflict is detected without overwriting the child store property.
- A descriptive error is logged in the console via `PluginConsole` explaining which property conflicted and recommending to use `actionsToRename`, `propertiesToRename`, or `actionsToExtends`.

### Examples

#### Option API example (from `src/stores/experiments/optionApi.ts`)

```ts
//import { createParentStore } from "pinia-plugin-extending-store"
import { defineAStore } from "pinia-plugin-subscription"
import { useItemStore, type IItemStore, type IItemStoreState } from "./item"

export interface OptionApiState extends IItemStoreState {
  test?: string
}

export interface OptionApiStore extends IItemStore {
  logTest: () => void
  setTest: (testData: OptionApiState) => void
}

export const useOptionApiStore = defineAStore<OptionApiStore, OptionApiState>(
  'optionApiStore',
  {
    state: () => ({ test: undefined }),
    actions: {
      setTest(testData: OptionApiState) {
        if (testData.test) { this.test = testData.test }
        this.setData && this.setData(testData)
      }
    }
  },
  {
    // parent store is created from `useItemStore` and prefixed with 'optionApi' + childId
    parentsStores: { optionApi: useItemStore } // or  [ createParentStore('optionApi', useItemStore) ]
  }
)
```

The parent store (`useItemStore`) state and selected actions will be made available on the `useOptionApiStore` instance according to the configured options.

#### Setup API example (from `src/stores/experiments/user.ts`)

```ts
import ParentStore from "../../plugins/parentStore"
import { defineAStoreCtx, getEnhancedStore } from "pinia-plugin-subscription"
import { ref, computed } from 'vue'

export const useUserStore = (id?: string) => defineAStoreCtx<UserStore, UserState>(
  id ?? 'user',
  (ctx) => {
    const lists = ref<List[]>()
    const password = ref<string>()

    const user = computed(() => ({
      ...(getEnhancedStore<ContactStore, ContactState>(ctx)?.contact ?? {}),
      password: password.value
    }))

    function setData(data: UserState) {
      if (data.lists) { lists.value = data.lists }
      if (data.password) { password.value = data.password }
    }

    return { lists, password, setData, user }
  },
  {
    parentsStores: [ createParentStore('userContact', useContactStore, { actionsToExtends: ['setData'] }) ]
  }
)()
```

Notes:
- `ParentStore('userContact', useContactStore, { actionsToExtends: ['setData'] })` will build an actual parent store id by concatenating `'userContact'` with the child id (so the child can extend a per-child parent).
- `actionsToExtends: ['setData']` tells the extension logic to merge or chain the `setData` action from parents into the child.

#### Multiple parent stores example (composing multiple stores without collisions)

```ts
import createParentStore from 'pinia-plugin-extending-store'
import { defineAStore, useCollectionStore } from 'pinia-plugin-extending-store'

export const useListsStore = (id?: string) => defineAStore(
  id ?? 'lists',
  () => ({}),
  {
    parentsStores: [
      createParentStore(
        (id ?? 'lists') + 'listsCollection',
        useCollectionStore,
        {
          actionsToRename: { addItem: 'addList', getItems: 'getLists', setItems: 'setLists' },
          propertiesToRename: { items: 'lists' }
        }
      ),
      createParentStore(
        (id ?? 'lists') + 'UserCollection',
        useCollectionStore,
        {
          actionsToRename: { addItem: 'addUser', getItems: 'getUsers', setItems: 'setUsers' },
          propertiesToRename: { items: 'users' }
        }
      )
    ]
  }
)()
```

### Using a store in a Vue component

In a `script setup` component:

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/experiments/user'

const userStore = useUserStore('user123')

// call a merged action
userStore.setData({ firstname: 'Alex', lastname: 'B.' })

// read a composed computed
console.log(userStore.user)
</script>
```

### When to use this plugin

- When you need to share and compose state/action logic between related stores (for example, a main store and per-item child stores).
- When you want to chain or augment actions from parent stores without duplicating code.

## Contributing

Contributions, bug reports and improvements are welcome. Please open an issue or a PR with a clear description and reproduction steps.

## License

MIT — see repository for details.
