# Graph Report - .  (2026-05-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 317 nodes · 387 edges · 53 communities (47 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dfd07f3e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 44 edges
2. `Button()` - 21 edges
3. `handleSave()` - 13 edges
4. `handleDelete()` - 13 edges
5. `DbUsersPage()` - 6 edges
6. `handleEdit()` - 5 edges
7. `resetForm()` - 5 edges
8. `useDbAuth()` - 5 edges
9. `sendWebhookNotification()` - 5 edges
10. `useFormField()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `handleSubmit()` --calls--> `sendWebhookNotification()`  [INFERRED]
  src/app/pages/Contact.tsx → src/lib/notifications.ts
- `handleSubmitOrder()` --calls--> `sendWebhookNotification()`  [INFERRED]
  src/app/components/OrderWizard.tsx → src/lib/notifications.ts
- `fetchOrders()` --calls--> `handleDelete()`  [EXTRACTED]
  src/app/pages/admin/AdminCommandes.tsx → src/app/pages/admin/AdminOffres.tsx
- `handleSave()` --calls--> `resetFaqForm()`  [EXTRACTED]
  src/app/pages/admin/AdminLegal.tsx → src/app/pages/admin/AdminOffres.tsx
- `useDbAuth()` --calls--> `DbUsersPage()`  [INFERRED]
  src/app/pages/db/DbContext.tsx → src/app/pages/db/DbUsersPage.tsx

## Communities (53 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (8): fetchOrders(), handleUpdateStatus(), Button(), calculateTotal(), handleSubmitOrder(), sendWebhookNotification(), fetchSettings(), handleSubmit()

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (18): fetchUpdates(), fetchEntries(), handleSave(), fetchFaqs(), fetchOffres(), fetchServices(), handleDelete(), handleDeleteFaq() (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (11): AdminLayout(), DbAuthProvider(), useDbAuth(), formatCountdown(), formatLastLogin(), DbUsersPage(), formatDate(), getInitials() (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (11): Input(), Separator(), SheetDescription(), SheetHeader(), SheetTitle(), SidebarMenuButton(), useSidebar(), Tooltip() (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (4): handleFileUpload(), setBlockType(), updateBlockConfig(), Skeleton()

### Community 5 - "Community 5"
Cohesion: 0.23
Nodes (8): fetchTeam(), handleDeleteMember(), handleDeleteMilestone(), handleSaveMember(), handleSaveMilestone(), resetMemberForm(), resetMilestoneForm(), fetchMilestones()

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (5): AdminDocs(), RootLayout(), trackPageVisit(), EyebrowLabel(), Home()

### Community 12 - "Community 12"
Cohesion: 0.43
Nodes (5): FormControl(), FormDescription(), FormMessage(), useFormField(), Label()

### Community 17 - "Community 17"
Cohesion: 0.53
Nodes (4): formatTime(), getAttempts(), getRemainingLockout(), handleLogin()

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (3): Carousel(), CarouselNext(), useCarousel()

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 6` to `Community 0`, `Community 3`, `Community 4`, `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 18`, `Community 19`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 30`, `Community 31`, `Community 33`, `Community 34`, `Community 35`, `Community 36`, `Community 37`, `Community 38`, `Community 39`?**
  _High betweenness centrality (0.598) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 0` to `Community 1`, `Community 4`, `Community 5`, `Community 7`, `Community 10`, `Community 17`?**
  _High betweenness centrality (0.438) - this node is a cross-community bridge._
- **Why does `handleKeyDown()` connect `Community 2` to `Community 3`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._