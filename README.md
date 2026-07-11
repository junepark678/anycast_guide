# anycast.guide

anycast.guide is an in-progress, open-source documentation site about building and operating DIY anycast infrastructure (BGP, routing daemons, provider setup, health checks, and troubleshooting).

- Website: https://anycast.guide
- GitHub repo: https://github.com/junepark678/anycast_guide
- Contribute/edit pages: `src/content/docs/` (MDX)
- Report issues: https://github.com/junepark678/anycast_guide/issues

## Interactive lab

The browser-native emulator lives in the `lab/` Git submodule:
https://github.com/junepark678/anycast_lab

Clone recursively and run the guide and lab independently during development:

```sh
git clone --recurse-submodules https://github.com/junepark678/anycast_guide.git
bun install
bun run dev
bun run dev:lab
```

`bun run build` builds the lab UI into `/lab/` and then builds the guide. It
does not compile Linux: production points at a separately published native
release channel by setting `ANYCAST_LAB_NATIVE_STATUS_URL` to its HTTPS status
document. Without that variable, the build succeeds with NATIVE VM explicitly
unavailable; cached local images are never copied into the hosted site build.

Native images are built, tested, and published by the lab's long-running
GitHub Actions workflow. Maintainers can reproduce that release path locally
with `bun run build:lab:from-source`; it requires the normal Buildroot host
toolchain listed in `lab/appliances/v86/README.md`. The complete release
verification remains `bun run --cwd lab verify:full`.
