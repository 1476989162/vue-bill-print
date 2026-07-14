# 后续可选步骤

仓库地址：https://github.com/1476989162/vue-bill-print

骨架已推送到 GitHub。下面是可选后续：

## 本地演示

```powershell
cd G:\uniapp2024\vue-bill-print
pnpm install
pnpm dev
```

## （可选）发布到 npm

```powershell
pnpm build
npm login
npm publish --access public
```

## （可选）接到进销存项目

在 `lnbxSoftVue2026` 中：

```ts
import { printBill, PrintDesigner, configure } from 'vue-bill-print'

configure({
  store: {
    async load(formType) { /* 调 Print/LoadTemplate */ },
    async save(formType, templateJson) { /* 调 Print/SaveTemplate */ },
  },
})
```

需要的话把仓库地址发我，我可以继续帮你接回业务项目或加 CI。
