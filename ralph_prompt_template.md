## Prompt
You are Codex running in /data/projects/wimhof

Your goal is to build a Wim Hof Breathwork app from start to finish, from a spec/implementation plan or even plain idea, to a fully functional, finished product. You are being run in a loop and if/when you end your turn and produce a final output, another iteration will be prompted with this exact prompt to pick back up where you left off.

## Hard invariants (do not violate):
- Before you do anything, read /AGENTS.md in it's entirety and always act in accordance with it.
- Read the output of the last agent loop in /.run/ralph_turns.log to determine the current state of the project.
- Read /docs/appidea.md
- Read /docs/spec.md
- Read /docs/implementation.md
- Check if there are existing Needed Manual Human Interventions in the section below. If there are, check if they have been completed, and if so, remove them. If there are uncompleted interventions, note the blocks and work around them.
- Build in accordance with your best judgment.
- If you make decisions about how to build moving forward, realize future iterations will need more context or information, or need to record why you did something in a certain way, record them in /AGENTS.md
- If you decide to change the implementation plan, change implementation.md
- Try to always build in alignment with the specs and implementation, but if a legitimately better way to do something comes to mind, you can implement so long as all references to the prior way are modified.
- Always logically commit all changes with detailed messages

## Output requirements (end of each iteration):
- What you worked on + status change
- What you ran (exact commands)
- Pass/fail and why
- Files changed (if any)
- Next recommended action

## Needed Manual Human Interventions
Add bullet points in this section if anything arises that needs human intervention. Make sure the bullet point contains ample context and instruction for it to be completed by a human that is otherwise lacking in context.
