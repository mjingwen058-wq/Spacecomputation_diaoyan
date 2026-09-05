# SCAA 招新问卷

一个像 MBTI 测试一样一题一题作答的招新问卷网站，配套后台数据看板。

- 前台：黑底 + 像素点纹理，延续公众号视觉；答完跳转到感谢页并生成一个专属像素小人
- 后台：`/admin`，密码登录，查看全部填写记录、统计图表、导出 CSV

技术栈：Next.js 14（App Router）+ TypeScript + Prisma + Postgres，可以直接部署到 Vercel。

> 说明：这份代码是在一个无法访问 npm 官方源的沙盒环境里手写完成的，我没能在这边跑 `npm install` / `npm run build` 做最终验证（连不上 registry.npmjs.org）。代码逻辑和语法我逐个文件仔细检查过一遍，但落地时建议你先在自己电脑上跑一次 `npm install && npm run build`，或者直接推到 Vercel 上让它构建——Vercel 的构建服务器没有这个网络限制，正常情况下应该能一次跑通；如果报错，把报错信息发我，我再改。

## 本地跑起来

```bash
npm install
cp .env.example .env   # 填入你的数据库连接串和后台密码
npx prisma db push     # 建表
npm run dev
```

打开 http://localhost:3000 是问卷，http://localhost:3000/admin 是后台。

## 部署到 Vercel

1. **准备一个 Postgres 数据库**（免费即可，三选一）：
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)（跟 Vercel 项目绑定最方便）
   - [Neon](https://neon.tech)
   - [Supabase](https://supabase.com)

   创建后拿到一个 `DATABASE_URL` 连接串。

2. **把这份代码推到 GitHub**（新建一个仓库，把这个文件夹的内容传上去）。

3. 去 [vercel.com](https://vercel.com) 用 GitHub 账号登录，New Project → 选中这个仓库 → Import。

4. 在部署前的 Environment Variables 里加两个变量：
   - `DATABASE_URL` = 第 1 步拿到的连接串
   - `ADMIN_PASSWORD` = 你给后台设的密码（自己定，不要用默认值）

5. 点 Deploy。Vercel 会自动 `npm install` 并执行 `prisma generate && next build`。

6. 第一次部署完成后，需要建表结构。本地执行一次（把 `DATABASE_URL` 换成生产库的）：
   ```bash
   DATABASE_URL="生产库连接串" npx prisma db push
   ```
   或者在 Vercel 项目的 Deployments 里用 "Run Command" 功能跑 `npx prisma db push`。

7. 部署成功后会拿到一个 `https://你的项目名.vercel.app` 的链接，问卷是根路径 `/`，后台是 `/admin`。

### 关于国内访问

Vercel 给的默认 `*.vercel.app` 域名，在国内的访问情况不算稳定，有时会慢或者连不上，这是 Vercel 平台本身在国内的网络状况决定的，不是这份代码能解决的问题。比较务实的做法是在 Vercel 项目里绑定一个你自己买的域名（域名注册商随意，绑定教程 Vercel 官方文档里有），自定义域名通常比默认的 `.vercel.app` 域名在国内的连通性更好一些，但也不能保证 100% 稳定——国内网络环境有一定不确定性，这点需要设置好预期。如果招新期间需要"绝对稳定"，可以考虑同时准备一个国内可访问的备用渠道（比如问卷同步导出一份发到 Notion 或者石墨文档）。

## 目录结构

```
app/
  page.tsx              问卷主流程（一题一题作答 + 感谢页）
  admin/page.tsx         后台看板
  api/submit/            提交问卷
  api/admin/             后台登录 / 拉取数据 / 导出 CSV
components/
  PixelAvatarCanvas.tsx  专属像素小人渲染
  PixelBackdrop.tsx      背景像素点纹理
lib/
  questions.ts           问卷题目内容（改题目改这里就行）
  pixelAvatar.ts          像素小人的生成规则（同一个 seed 永远长一样，方便后台回溯）
  auth.ts                后台登录用的简单签名 cookie
  db.ts                  Prisma 客户端
prisma/schema.prisma      数据表结构
```

## 改问卷题目

题目内容全部在 `lib/questions.ts` 里，改文字、加选项、调整必填/选填都在这一个文件里改，不用动页面逻辑。

## 关于"意向部门"这题（B1）

现在是一道排序点选题：按心仪程度依次点部门，点击顺序就是排序（① ② ③ ④），不用选满但至少选一个。原来"填写意愿顺序"的那道文本题已经去掉——排序信息直接从点选顺序里拿到，后台也能直接统计"哪个部门最抢手""大家的第一志愿都是什么"。

## 关于"选择校区"（新增）

年级之后新增了一题，选项为象山 / 良渚 / 南山 / 其他（其他可自由填写），后台数据看板和 CSV 导出都带这一列。

## 关于像素小人

改成了正方形 8×8、满版铺满整个画布的设计（不再有大片背景空着）。发型、发色、眼型（正常/大眼）、是否带头饰或腮红标记、上衣颜色、鞋子颜色都是独立随机的，组合数远超社团规模，基本不会撞款。

## 数据导出

后台页面右上角"导出 CSV"，点击直接下载全部记录（Excel / 表格软件都能直接打开）。
