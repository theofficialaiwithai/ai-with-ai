export const LEVEL_LESSONS: Record<number, string[]> = {
  0: [
    "Most people treat Claude Code like a smarter chat window. You type something in, it answers, you copy what you need and move on. That's not wrong — it gets things done — but it's also leaving most of the real leverage untouched.",
    "The shift happens the moment you run your first prompt inside an actual project. Not a sandbox demo, not a tutorial exercise — your real files, your real codebase, your real problem. Claude isn't answering a question about your work; it's doing the work. That's a fundamentally different relationship with a tool.",
    "Once you've seen it happen even once — a feature sketched, a bug fixed, a component scaffolded — you can't un-see what's possible. You start measuring tasks differently: not 'how do I do this?' but 'should I even be the one doing this at all?'",
  ],
  1: [
    "A CLAUDE.md file is where you stop paying the setup cost every single session. Without one, you're re-explaining your stack, your conventions, and your preferences from scratch each time. CLAUDE.md amortizes that cost: you pay it once, and every future session inherits the context.",
    "/compact and /cost look like minor conveniences. They're actually something more important: they're how you learn that context is a resource to be managed, not an infinite given. Running out of context mid-task is the agentic equivalent of running out of stack space in a deep recursion — the failure is subtle and the consequences compound.",
    "These two habits together — persistent project context and cost awareness — are what separate occasional users from people who build real things with Claude Code every day. They're small, but they're load-bearing.",
  ],
  2: [
    "Claude Code without external data can only work with what you hand it in the prompt. That's useful but it's a ceiling. MCP servers remove the ceiling: Claude can now reach into Slack threads, query a live database, pull documents from Drive, or check Notion — in the middle of a task, without you copy-pasting anything.",
    "The result isn't just faster context-gathering (though that's real). It's a whole category of tasks becoming possible that simply weren't before. Summarizing everything decided about a feature across two weeks of Slack isn't something you can do with a static prompt. It requires the data to be live. With MCP, that becomes a routine task instead of an hour of manual work.",
    "Most people are surprised by how much the tool changes once external data is connected. Less switching between tabs, less 'let me paste this in,' less explaining what a document says that Claude could just read. The surface area of automatable work expands significantly.",
  ],
  3: [
    "The first time you solve a problem well with Claude Code, you built something. The second time you have to solve the same problem, you're doing repeat work. Custom skills are how you prevent that.",
    "A skill packages the context, the instructions, and the pattern for a particular job into a single command. You stop writing the same preamble every session. More importantly, you stop losing the nuance — the edge cases, the constraints, the specific approach that took you three iterations to land on — every time you start fresh.",
    "Skills also externalize your process. Once something is a /command rather than a mental model sitting in your head, other people can use it the same way you do without needing you to walk them through it. That's the beginning of leverage: your best workflows becoming reusable assets instead of perishable knowledge.",
  ],
  4: [
    "There's a common pattern early on: each Claude Code session is better than the last, but none of them carry forward the gains you made. You refine an approach, it works beautifully, the session ends, and next time you're explaining the same constraints from scratch.",
    "Memory files break that cycle. A persistent context file — patterns Claude should follow, examples of decisions you've made, known edge cases, architectural choices — is a growing asset. It compounds. The more you add to it, the less time Claude spends reconstructing context and the more time it spends doing actual work.",
    "Context engineering is the discipline of intentionally shaping what Claude knows going into every session. It's not about giving more information — it's about giving the right information, structured so it's immediately useful rather than something Claude has to process and derive conclusions from. The difference between a well-maintained context file and a raw dump of notes is significant.",
  ],
  5: [
    "A single skill solves a single problem. A multi-phase skill solves a class of problems. The difference sounds small but it's architectural: you've built a workflow, not just a tool.",
    "Multi-phase means the output of one step becomes the input of the next — research, then analyze, then draft, then review, each stage using the previous stage's work as grounding. Subagents let you decompose a task so parallel workstreams can run simultaneously, each specialist focusing on one part of the problem without needing the full context of everything else.",
    "The shift in thinking that happens at this level is from 'what's the best single prompt?' to 'what are the natural phases of this work, and what's the right handoff between them?' Once you've seen a chained system run from input to final output without you touching it in between, you start seeing that structure in every complex task you do.",
  ],
  6: [
    "Headless mode is where Claude Code stops being a tool you interact with and starts being a component in a system. You're no longer inside the session — you're calling it from a script, treating it like any other executable, piping structured data in and out.",
    "This unlocks a different tier of automation: things that need to run on a schedule, in response to an event, or as one step in a larger pipeline. The Claude Code session isn't a workspace you open and close; it's a function with inputs and outputs. JSON in, JSON out, composable with everything else.",
    "Most automation before this level requires your active involvement to start. Headless mode removes that requirement. Claude Code becomes part of your infrastructure in the same way a database or an API is — something that runs in response to conditions, not something you have to remember to open.",
  ],
  7: [
    "Most automation tools operate on data: files, APIs, structured records. Browser control lets Claude Code operate on the web as it actually appears — rendered, visual, interactive. That's a significantly larger surface area.",
    "Screenshots give Claude grounding that text alone can't provide. It can see what a page actually looks like — what's present, where things are, what state an interface is in. Tasks that would require fragile XPath selectors or brittle DOM traversal become 'describe what you see and act on it.' That's a much more robust foundation.",
    "The applications that open up — testing UI flows, scraping content from pages that render dynamically, generating screenshots for documentation, monitoring dashboards for changes — are the kinds of tasks that used to require dedicated testing infrastructure or constant manual attention. At this level, they become something you can delegate.",
  ],
  8: [
    "Sequential execution is the default. One task, then the next, then the next. It's predictable and often the right approach. But it leaves time on the table when parts of a problem can be worked in parallel.",
    "Running multiple Claude Code sessions simultaneously on related workstreams cuts elapsed time. More importantly, an orchestrator-specialist pattern creates a natural division of concerns: the orchestrator handles planning and coordination while specialists execute without needing to hold the full complexity of the problem in context.",
    "This is where the systems you build start operating differently — not just faster, but better, because the right agent is doing the right job. The orchestrator doesn't need to understand every implementation detail. The specialists don't need to understand the overall strategy. Each can focus on what it does well, and the system as a whole is more capable than any individual session could be.",
  ],
  9: [
    "The sessions you start manually are bounded by your working hours. A scheduled agent isn't. That's the core change at this level: your system's reach extends into time you're not working.",
    "Cron jobs and background agents — monitors that report, processors that batch, builders that run overnight — change what 'done' means for a piece of automation. Not 'done until I need to run it again' but 'done, running, requiring no further attention.' Claude Code becomes infrastructure: something that operates, not just something you operate.",
    "The critical discipline here is the kill switch. A background agent that runs indefinitely without a safety mechanism is a liability, not an asset. The ones that work long-term are designed from the start with an approval gate, a cost limit, or a circuit breaker. The question to ask before deploying anything unattended isn't 'will this work?' — it's 'what happens when something unexpected occurs, and do I have a way to stop it?'",
  ],
  10: [
    "Most tools are static. You build them once; they do what they do. An agent that builds agents breaks that constraint: the system itself generates new capabilities, adapts to new requirements, extends its own reach.",
    "This is genuinely rare. It requires not just using Claude Code well, but understanding it well enough to describe the components of a capable system — the memory files, the skill structure, the failure modes, the feedback loops — in a way that Claude can reproduce from that description. You're not prompting Claude to build a feature; you're prompting Claude to understand how to build a category of thing.",
    "The autonomous loop is the natural endpoint of everything below it. Each level was about removing one more dependency on your direct involvement: first on manual prompts, then on manual context, then on manual invocation, then on manual scheduling. At Level 10, the system closes its own loops, extends its own capabilities, and the question shifts from 'how do I get Claude to do this?' to 'what should the system be doing on its own, and what are the bounds within which I trust it to do that?'",
  ],
}
