@AGENTS.md

## Khusus Claude Code

- Skill proyek ada di `.claude/skills/` (salinan dari `.agents/skills/`, sumber yang sama dibaca Antigravity/OpenCode).
  Edit skill hanya di `.agents/skills/` lalu `npm run skills:sync`; `npm run skills:check` harus lolos sebelum commit.
- Pengaturan pribadi (`.claude/settings.local.json`) tidak di-commit.
