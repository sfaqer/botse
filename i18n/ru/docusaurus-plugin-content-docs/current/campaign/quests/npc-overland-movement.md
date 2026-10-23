---
id: npc-overland-movement
title: 'Передвижение НПС по атласу провинции'
hoverText: 'Жетон передвигается на указанное количество соседних клеток по кратчайшему доступному маршруту. Он использует всё передвижение, если не может достичь назначенной цели за меньшее количество шагов.'
---

Some [province](/docs/campaign/provinces/index) mechanics or [quests](/docs/campaign/quests/index) add NPC tokens to the overland map. NPC tokens are typically instructed to move in a specific direction or toward a specific feature on the map. When a token moves, it must move a number of adjacent hexes as specified along the shortest route available. It will use its full movement unless it is able to reach its instructed destination using less movement. If there are multiple possible routes, the party chooses which route that token will take.

- If there are no eligible routes for an NPC token to move when instructed, it does not move. If the token is instructed to move in a specific direction and there are no adjacent hexes in that direction (such as at the edge of the map), the token ends its current move.
- If the rule or quest that places an NPC token on the map does not specify a hex to place it in (or there are multiple possible hexes), the party chooses the hex.
