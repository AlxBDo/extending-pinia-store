# Extending Pinia Stores (pinia-plugin extension)

Plugin that extends Pinia stores (built on top of `pinia-plugin-subscription`) to allow composing and reusing store logic between related stores.

## Key ideas:
- Extend a "child" store with state, getters and actions from one or more "parent" stores.
- Support both Options API and Setup API style stores created with `defineAStore` (from `pinia-plugin-subscription`).
- Configure which parent actions are merged, how properties/actions are renamed, and add pre/post action flows.

## Features
- Compose parent stores into a child store via `parentsStores` (uses `ParentStore` helper).
- Extend or chain actions from parent stores into the child (`actionsToExtends`).
- Rename actions and properties using `actionsToRename` / `propertiesToRename`.
- Works with `pinia-plugin-subscription` and its `defineAStore` helper.

## Installation

This project is built to be used together with `pinia` and `pinia-plugin-subscription`.


```bash
npm install extending-pinia-store
# or
yarn add extending-pinia-store
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
- The core logic is in `src/core/StoreExtension.ts` which duplicates state, computed properties and actions from parent stores into the child store, and wires action flows.
- Parent stores are described with the helper `ParentStore` (see `src/plugins/parentStore.ts`) which builds parent store IDs dynamically using the child's id.
- Extended stores are registered in a registry (`src/plugins/stores.ts`) so other parts of the app can retrieve them with `getStore`.

### Store options (API)

The plugin uses an extended store options shape defined in `src/types/store.ts`. Important fields:

- `actionFlows?: Record<string, { before?: Function|string; after?: Function|string }>` — run logic before/after specific actions.
- `actionsToExtends?: string[]` — list of parent actions that should be extended/merged into the child.
- `actionsToRename?: Record<string, string>` — rename parent actions when adding them to the child.
- `parentsStores?: ParentStoreInterface[]` — array of `ParentStore` instances describing parent stores to include.
- `propertiesToRename?: Record<string, string>` — rename parent state properties when adding them to the child.

### Examples

#### Option API example (from `src/stores/experiments/optionApi.ts`)

```ts
import ParentStore from "../../plugins/parentStore"
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
    parentsStores: [ new ParentStore('optionApi', useItemStore) ]
  }
)
```

The parent store (`useItemStore`) state and selected actions will be made available on the `useOptionApiStore` instance according to the configured options.

#### Setup API example (from `src/stores/experiments/user.ts`)

```ts
import ParentStore from "../../plugins/parentStore"
import { defineAStore } from "pinia-plugin-subscription"
import { getStore } from "../../plugins/stores"
import { ref, computed } from 'vue'

export const useUserStore = (id?: string) => defineAStore<UserStore, UserState>(
  id ?? 'user',
  () => {
    const lists = ref<List[]>()
    const password = ref<string>()

    const user = computed(() => ({
      ...(getStore<ContactStore, ContactState>(id ?? 'user')?.contact ?? {}),
      password: password.value
    }))

    function setData(data: UserState) {
      if (data.lists) { lists.value = data.lists }
      if (data.password) { password.value = data.password }
    }

    return { lists, password, setData, user }
  },
  {
    actionsToExtends: ['setData'],
    parentsStores: [ new ParentStore('userContact', useContactStore) ]
  }
)()
```

Notes:
- `actionsToExtends: ['setData']` tells the extension logic to merge or chain the `setData` action from parents into the child.
- `ParentStore('userContact', useContactStore)` will build an actual parent store id by concatenating `'userContact'` with the child id (so the child can extend a per-child parent).

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

### Accessing registered stores

This project registers extended stores in an internal registry. You can retrieve a registered store using `getStore` from `src/plugins/stores.ts`:

```ts
import { getStore } from '../plugins/stores'

const someStore = getStore<MyStore, MyState>('storeId')
```

### When to use this plugin

- When you need to share and compose state/action logic between related stores (for example, a main store and per-item child stores).
- When you want to chain or augment actions from parent stores without duplicating code.

## Contributing

Contributions, bug reports and improvements are welcome. Please open an issue or a PR with a clear description and reproduction steps.

## License

MIT — see repository for details.
