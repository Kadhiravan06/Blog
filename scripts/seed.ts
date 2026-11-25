import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.SEED_PASSWORD ?? "demo-password-123";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

const people = [
  {
    email: "ada@demo.blog",
    username: "ada_whitfield",
    displayName: "Ada Whitfield",
    role: "admin",
    bio: "Editor of The Margin. Writes about attention, reading, and the tools that get out of the way.",
  },
  {
    email: "marcus@demo.blog",
    username: "marcus_lin",
    displayName: "Marcus Lin",
    role: "user",
    bio: "Software person. Interested in small systems, long walks, and the occasional typeface.",
  },
  {
    email: "june@demo.blog",
    username: "june_park",
    displayName: "June Park",
    role: "user",
    bio: "Designer turned writer. Collects notebooks and opinions about them.",
  },
] as const;

type Person = (typeof people)[number];
type Seeded = Person & { id: string };

const posts: Array<{
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  author: Person["username"];
  daysAgo: number;
  cover: string;
  content: string;
}> = [
  {
    slug: "keeping-a-reading-log",
    title: "Keeping a reading log changed how I read",
    excerpt:
      "Not for the count, and not for the streak. For the sentence I would otherwise have forgotten by Friday.",
    tags: ["reading", "habits"],
    author: "ada_whitfield",
    daysAgo: 2,
    cover: "reading-log.webp",
    content: `For years I kept a reading log the way people keep a gym membership: optimistically, and mostly in theory. Then, two winters ago, I started writing down a single sentence after each sitting. Not a summary. Not a rating. One sentence about what I noticed.

The effect was immediate and slightly embarrassing. I had been reading more than I could remember, which is another way of saying I had been reading less than I thought.

## The sentence is the unit

A sentence is small enough that you will actually write it, and specific enough that it forces you to pay attention. "Good" is not a sentence. "The scene where the mother refuses to translate for her daughter is doing something I have not seen before" is a sentence. It commits you to a reading.

Six months in, the log had become more useful than my notes app, my highlights, and the shelf of books I had been meaning to reread. It was a record of my attention rather than a record of my consumption.

## What I stopped doing

I stopped rating books out of five. A rating is a verdict, and verdicts close conversations. I stopped writing summaries of plots I would remember anyway. And I stopped trying to read every book in the same way: some books want a pencil, some want a train window, some want to be abandoned at page forty without guilt.

> A reading log is not proof of reading. It is a place to put the reading that would otherwise leak out of you.

The log now lives in a plain text file, one line per sitting, dated. It is not beautiful. It is the only habit I have kept for two years without a system, an app, or a streak, which I take as evidence that it is sized correctly.

If you try it, start with one sentence. That is the whole method. The rest is just reading.`,
  },
  {
    slug: "small-systems-long-lives",
    title: "Small systems, long lives",
    excerpt:
      "The software I still use after a decade is not the software that impressed me most. It is the software that stayed small.",
    tags: ["software", "craft"],
    author: "marcus_lin",
    daysAgo: 5,
    cover: "small-systems.webp",
    content: `Every few years I go through the tools I actually use and try to notice which ones have survived. The pattern is not what I expect. The survivors are rarely the most capable. They are the ones whose surface area stopped growing.

A small system is not a primitive system. It is a system whose author resisted the temptation to make every user's problem the system's problem.

## The cost of another switch

Every setting is a question the software asks you at the worst possible time. Every plugin is a second maintainer who has never met you. Every integration is a promise that two teams will keep moving in the same direction.

This is not an argument against features. It is an argument for a shape: a sharp core, a clear boundary, and an honest no.

## What long life looks like

The tools that last tend to share three properties:

1. **A file format you can read without the tool.** Plain text, SQLite, a folder of images. If the tool disappears, you keep your work.
2. **A single obvious way to do the common thing.** Not five, not zero.
3. **An author who says no in public.** Roadmaps that only grow are a form of debt.

I have a note-taking setup that has survived four laptops and two operating systems because it is a directory of Markdown files. I have a task manager I abandoned twice because it kept asking me to configure it.

The lesson is not "use boring software." Boring is a side effect. The lesson is that longevity is a design constraint, and most of us do not treat it as one.`,
  },
  {
    slug: "notebook-problem",
    title: "The notebook problem",
    excerpt:
      "Buying the right notebook is a way of postponing the first page. I have solved this problem by making it worse.",
    tags: ["design", "notebooks"],
    author: "june_park",
    daysAgo: 9,
    cover: "notebooks.webp",
    content: `There is a particular kind of person who owns eleven notebooks and has filled three. I am that person. The eleventh is always the one that will fix it: the right paper weight, the right ruling, the right size for a coat pocket that does not exist.

The notebook problem is not a stationery problem. It is the problem of the first page.

## The tyranny of the nice object

A nice notebook asks you to deserve it. The first mark is a commitment; the first mistake is permanent. So the notebook stays closed, and the cheap one gets used, and the nice one gets moved from desk to shelf to a box.

The fix, for me, was to stop buying notebooks that asked for anything. A cheap gridded pad, a pen I do not care about, and a rule: the first page is for the date and a single sentence. That is all. The notebook earns its keep by being used badly.

## What the notebook is for

Not storage. Storage is a file. The notebook is for thinking at the speed of the hand, which is slower than the keyboard and therefore better at catching the half-formed thing.

I keep two now. One is a log: dates, decisions, things to look up. One is a scratchpad for diagrams that make sense only to me. Neither is beautiful. Both are full.

The eleventh notebook is still on the shelf. I am not going to pretend I have solved that. But it is empty for a different reason now: I have somewhere else to write.`,
  },
  {
    slug: "what-a-comment-section-is-for",
    title: "What a comment section is for",
    excerpt:
      "A comment is not a review. It is a note left for the next reader, and that changes what we should build.",
    tags: ["writing", "community"],
    author: "ada_whitfield",
    daysAgo: 14,
    cover: "comments.webp",
    content: `Most comment sections are built as a verdict machine: agree, disagree, score, rank. The form invites a reaction, and the reaction invites a performance. It is no wonder they turn into weather.

A better model is older than the web: the margin. A note in the margin is addressed to the next reader, not to the author. It says "look at this," or "this is wrong," or "I needed this today." It is allowed to be partial.

## Design for the margin

If a comment is a note to the next reader, then a few things follow:

- **The post is the context.** Comments should sit beside the text, not in a separate arena.
- **Identity matters, but lightly.** A name and a history are enough. A scoreboard is not.
- **Deletion is a moderation tool, not a punishment.** Post authors and admins need it. Everyone else needs to know it exists.
- **Rate limits are hospitality.** Slow the room down enough that people read before they type.

None of this requires a new platform. It requires deciding what the space is for before wiring the form.

## The smallest version

A flat list, oldest first, under the piece. A signed-in reader, a text box, a delete link for the people responsible for the space. That is enough to learn whether anyone wants to talk. Most of the time, the answer is a small number of good notes, which is exactly what a margin is.`,
  },
  {
    slug: "attention-is-a-place",
    title: "Attention is a place",
    excerpt:
      "We talk about focus as a resource to spend. It is more useful to think of it as a room you keep arranging.",
    tags: ["attention", "essays"],
    author: "marcus_lin",
    daysAgo: 20,
    cover: "attention.webp",
    content: `The metaphor we use for attention is almost always economic: budget it, spend it, waste it, protect it. The metaphor is not wrong, but it is thin. It makes attention sound like a quantity, when most of my experience of it is spatial.

I do not lose focus in the abstract. I lose it in a particular chair, with a particular tab open, at a particular hour. Change the room and the work changes. This is not mysticism; it is just the ordinary fact that context is doing more of the work than willpower.

## Furnishing the room

If attention is a place, then the useful question is not "how do I focus?" but "what is in the room?" The phone on the desk is in the room. The unfinished email is in the room. So is the lamp, the window, and the person who might knock.

Some of this we can arrange. Some of it we can only notice. The noticing is the beginning of a practice: not a discipline of the will, but a habit of editing the room.

## The cost of a shared room

A shared room is harder. An open office, a group chat, a comment section: all of these are places where attention is partly other people's to spend. The design question is whether the room makes it easy to be kind and slow, or easy to be fast and careless.

I do not have a system for this. I have a preference: fewer rooms, entered on purpose, with the door closed. It is not a productivity method. It is a way of knowing where I am.`,
  },
  {
    slug: "the-first-ten-posts",
    title: "The first ten posts",
    excerpt:
      "Every blog is bad for ten posts. The trick is to publish them anyway, and to make the tenth one honest.",
    tags: ["writing", "blogging"],
    author: "june_park",
    daysAgo: 28,
    cover: "first-posts.webp",
    content: `A blog is a weird artifact: a public notebook with a front door. The first ten posts are the hardest because they are written before the blog knows what it is.

There is a temptation to wait. To write a manifesto, pick a niche, design a masthead, and only then begin. This is a way of making the first ten posts into a launch, which is a way of never publishing them.

## Publish the tenth post first

The useful exercise is to imagine the tenth post and work backwards. What would you have needed to write in posts one through nine to get there? Usually: one post that is just a link and a sentence, one that is an argument you are not sure about, one that is personal enough to be uncomfortable, and several that are practice.

The tenth post is not better because it is tenth. It is better because by then you have stopped performing and started writing.

## A small contract

I have a contract with this blog: one post a month, no schedule beyond that, and no post that exists only to fill a slot. It is a low bar and I miss it regularly. The bar is the point. A blog you can keep is worth more than a blog you can admire.

The first ten posts are already written somewhere in your notes. The work is choosing to publish them badly, in order, and then continuing.`,
  },
];

const comments: Record<string, Array<{ author: Person["username"]; body: string; daysAgo: number }>> = {
  "keeping-a-reading-log": [
    { author: "june_park", body: "The one-sentence rule is the first reading habit that has ever stuck for me. I write mine on the back cover now.", daysAgo: 1 },
    { author: "marcus_lin", body: "\"A record of my attention rather than a record of my consumption\" — that is going straight into my notes. Thank you.", daysAgo: 1 },
    { author: "ada_whitfield", body: "The back cover is a great place for it. I keep meaning to try a single index card per book.", daysAgo: 0 },
  ],
  "small-systems-long-lives": [
    { author: "june_park", body: "The file-format point is underrated. I lost a year of notes to a tool that stopped syncing, and now I am religious about Markdown.", daysAgo: 3 },
    { author: "ada_whitfield", body: "Curious where you land on plugins after this. A sharp core plus plugins seems like the compromise, but the boundary gets fuzzy.", daysAgo: 2 },
    { author: "marcus_lin", body: "Fuzzy is the right word. My current rule is: a plugin can add a view, but it cannot own the data.", daysAgo: 2 },
  ],
  "notebook-problem": [
    { author: "ada_whitfield", body: "The nice notebook asking you to deserve it is exactly right. I have a shelf of unopened ones judging me.", daysAgo: 7 },
    { author: "marcus_lin", body: "Cheap gridded pad supremacy. The only notebook I finish is the one I am not afraid to ruin.", daysAgo: 6 },
  ],
  "what-a-comment-section-is-for": [
    { author: "marcus_lin", body: "The margin model is good. It also explains why the best comments I read are short and slightly unfinished.", daysAgo: 12 },
    { author: "june_park", body: "\"Deletion is a moderation tool, not a punishment\" — I wish more products wrote this down.", daysAgo: 11 },
  ],
  "attention-is-a-place": [
    { author: "june_park", body: "The room metaphor is doing a lot of work here. I notice it most when I move a chair and suddenly the afternoon is usable again.", daysAgo: 18 },
    { author: "ada_whitfield", body: "Fewer rooms, entered on purpose. That is going on a sticky note.", daysAgo: 17 },
  ],
  "the-first-ten-posts": [
    { author: "ada_whitfield", body: "This is the post I needed at the start of this blog. Publishing badly, in order, is the whole job.", daysAgo: 25 },
  ],
};

async function ensureUser(person: Person): Promise<Seeded> {
  const { data, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const existing = data.users.find((u) => u.email === person.email);
  if (existing) return { ...person, id: existing.id };

  const { data: created, error: createError } = await db.auth.admin.createUser({
    email: person.email,
    password,
    email_confirm: true,
    user_metadata: { display_name: person.displayName },
  });
  if (createError || !created.user) throw createError ?? new Error("createUser returned no user");
  return { ...person, id: created.user.id };
}

async function main() {
  const seeded: Seeded[] = [];
  for (const person of people) {
    const user = await ensureUser(person);
    const { error } = await db
      .from("profiles")
      .update({ username: person.username, display_name: person.displayName, role: person.role, bio: person.bio })
      .eq("id", user.id);
    if (error) throw error;
    seeded.push(user);
    console.log(`user ${person.username} ready`);
  }

  const byUsername = new Map(seeded.map((p) => [p.username, p]));
  const coversDir = path.join(process.cwd(), "assets", "seed");
  let coverFiles: string[] = [];
  try {
    coverFiles = await readdir(coversDir);
  } catch {
    console.warn("assets/seed missing — seeding posts without covers");
  }

  for (const post of posts) {
    const author = byUsername.get(post.author);
    if (!author) throw new Error(`missing author ${post.author}`);

    let coverUrl: string | null = null;
    if (coverFiles.includes(post.cover)) {
      const bytes = await readFile(path.join(coversDir, post.cover));
      const key = `seed/${post.slug}.webp`;
      const { error } = await db.storage.from("covers").upload(key, bytes, { contentType: "image/webp", upsert: true });
      if (error) throw error;
      coverUrl = db.storage.from("covers").getPublicUrl(key).data.publicUrl;
    }

    const publishedAt = new Date(Date.now() - post.daysAgo * 86_400_000).toISOString();
    const { data: existing } = await db.from("posts").select("id").eq("slug", post.slug).maybeSingle();
    if (existing) {
      console.log(`post ${post.slug} exists`);
      continue;
    }

    const { data: created, error } = await db
      .from("posts")
      .insert({
        author_id: author.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content_md: post.content,
        cover_url: coverUrl,
        tags: post.tags,
        status: "published",
        published_at: publishedAt,
      })
      .select("id")
      .single();
    if (error) throw error;

    for (const comment of comments[post.slug] ?? []) {
      const commenter = byUsername.get(comment.author);
      if (!commenter) continue;
      const { error: commentError } = await db.from("comments").insert({
        post_id: created.id,
        author_id: commenter.id,
        body: comment.body,
        created_at: new Date(Date.now() - comment.daysAgo * 86_400_000).toISOString(),
      });
      if (commentError) throw commentError;
    }
    console.log(`post ${post.slug} seeded`);
  }

  console.log("Seed complete. Admin login:", people[0].email);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
