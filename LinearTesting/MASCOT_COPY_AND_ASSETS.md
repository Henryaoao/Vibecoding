# Mascot Copy and Seed Assets

## Pilot Mascot Theme

Default mascot: **Mint Bean**

Concept:

- A tiny mint-colored team buddy that grows from small daily wins.
- Friendly and calm rather than competitive.
- Designed for employee engagement without public ranking or shame language.
- Works with attendance, daily update, training, and future team contribution tasks.

Voice:

- Warm
- Light
- Non-punitive
- Team-first
- No productivity pressure
- No leaderboard framing

Avoid:

- "Your team is behind"
- "Low performer"
- "Penalty"
- "Failure"
- "Rank"
- "Punishment"

## Mood Messages

Use these frontend-facing labels for pet mood:

| Mood | Display Copy | Usage |
| --- | --- | --- |
| `happy` | cozy | Default healthy state |
| `excited` | sparkly | After recent feed activity |
| `hungry` | ready for a snack | No recent feed after growth exists |
| `tired` | sleepy after a big team day | Many feed events in a short period |

## Level Copy

| Level | Name | Unlock Meaning |
| --- | --- | --- |
| 1 | Quiet Sprout | Default mascot and Mint Bean base look |
| 2 | Snack Scout | Sunny Cape skin |
| 3 | Team Buddy | Rocket Pack skin |
| 4 | Office Star | Star Crown skin |

Upgrade fallback copy:

```text
Mint Bean is growing with the team.
```

Upgrade activity copy pattern:

```text
{pet_name} reached level {level}: {level_name}
```

Notification copy:

```text
Team pet fed
{pet_name} enjoyed {feed_amount} feed and gained {growth_delta} energy.

New mascot level unlocked
{pet_name} reached level {level}. The team unlocked a new little milestone.
```

## Empty and Error States

Dashboard empty state:

```text
Invite Mint Bean in
Create the first shared mascot for this pilot team. It starts tiny, cheerful, and grows through daily wins without ranking anyone.
```

Dashboard error state:

```text
Mint Bean is taking a tiny break
Please try again after the API is available.
```

Skins empty state:

```text
Invite Mint Bean first
The skin center unlocks after the team mascot exists.
```

Admin reports should stay factual and aggregate-only. Avoid employee-level ranking copy.

## Seed Skin Placeholders

These assets are placeholders. They are referenced by `asset_path` and can be replaced by real SVG or PNG files later.

| ID | Name | Rarity | Asset Path | Unlock |
| --- | --- | --- | --- | --- |
| `default` | Mint Bean | common | `skins/mint-bean.svg` | Level 1 / 0 growth |
| `sunny-cape` | Sunny Cape | rare | `skins/sunny-cape.svg` | Level 2 / 100 growth |
| `rocket-pack` | Rocket Pack | epic | `skins/rocket-pack.svg` | Level 3 / 200 growth |
| `star-crown` | Star Crown | legendary | `skins/star-crown.svg` | Level 4 / 300 growth |

Asset direction:

- Keep shapes simple and readable at small mobile sizes.
- Use the existing mint, honey, and warm paper UI palette.
- Avoid aggressive gamification symbols.
- Keep all skins cute, workplace-safe, and team-neutral.

## Pilot Copy Checklist

Before launch:

1. Confirm dashboard empty state mentions Mint Bean.
2. Confirm skins page uses "look" or "skin" as a reward, not a ranking.
3. Confirm team contribution copy says there is no leaderboard.
4. Confirm error states are human-readable.
5. Confirm seeded skin names and descriptions appear in MySQL and memory defaults.
