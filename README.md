This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Responsive viewport QA

Run the automated responsive layout checks with:

```powershell
npm.cmd run test:responsive
```

The suite uses CSS viewport ranges rather than device-specific rules: mobile
(320–430px), tablet (768–1024px), and desktop (1280–1920px). It checks the
homepage and shared navigation for horizontal overflow, CTA containment,
readable hero and AURA text lines, and the appropriate navigation mode. Chromium
also produces a small set of review screenshots in the ignored test output.

For local browser engines, install the Playwright browsers once:

```powershell
npx.cmd playwright install chromium firefox webkit
```

## Backup ke GitHub

Script `scripts/backup-to-github.ps1` memvalidasi repository, menjalankan lint,
typecheck, dan production build, memeriksa nama file sensitif, lalu meminta
konfirmasi sebelum membuat commit atau mengirim perubahan ke GitHub. Script ini
tidak pernah menggunakan force push dan tidak akan mengganti remote `origin`
yang sudah ada.

Jalankan perintah berikut dari PowerShell pada root proyek.

### Simulasi aman tanpa mengubah Git

```powershell
.\scripts\backup-to-github.ps1 -DryRun
```

### Backup pertama

Ganti `URL_REPOSITORY_GITHUB` dengan URL HTTPS atau SSH repository GitHub yang
kosong.

```powershell
.\scripts\backup-to-github.ps1 -RemoteUrl "URL_REPOSITORY_GITHUB" -CommitMessage "Initial portfolio website"
```

### Backup berikutnya

```powershell
.\scripts\backup-to-github.ps1 -CommitMessage "Update portfolio website"
```

Jika GitHub meminta autentikasi, selesaikan autentikasi melalui Git Credential
Manager atau SSH yang sudah dikonfigurasi, lalu jalankan kembali perintah
backup. Jangan menaruh token atau kredensial di dalam repository.
