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

`bun run build` reproducibly builds the pinned native Linux/v86 image, builds
the lab into `/lab/`, and then builds the guide. This keeps a clean production
checkout from silently shipping a SIM-only lab. The image step needs the normal
Buildroot host toolchain listed in `lab/appliances/v86/README.md`.

For a fast local packaging pass that reuses an already-built image—or
explicitly emits SIM-only status when no image exists—run
`bun run build:lab:existing` followed by `bun run build:guide`. The complete
release verification remains `bun run --cwd lab verify:full`.
