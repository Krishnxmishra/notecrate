# AI-Powered Research Workspace - Project Brief

## Product Overview
A web highlighter + workspace where saved material becomes the foundation for AI-powered analysis and document creation.

**Tagline:** Organize material. Get clarity.

---

## Core Components

### 1. Browser Extension
- Highlight text on any webpage
- Clip and save images
- Capture YouTube videos with timestamps
- Save web content with one click
- Color-coded highlighting (user customizable)

### 2. Web Application
- Organize saved material in folders and subfolders
- Each folder acts as a contained knowledge base
- AI Studio feature for synthesis and creation
- Clean, minimal interface
- Export capabilities (PDF, DOCX, Markdown, CSV)

---

## Key Features

### Organization
- Hierarchical folder structure (folders + subfolders)
- Each folder contains all saved highlights, clips, images, videos
- Search across all saved material
- Optional: Tags/labels for cross-folder connections

### AI Studio
**What it is:** A chat interface within any folder where AI has complete context of all material in that folder.

**Why chat works:**
- User knows exactly what they need from their material
- Context is specific to the folder's content
- Flexible: can ask for tables, summaries, comparisons, insights
- User directs the synthesis, not auto-generated reports
- Natural back-and-forth to refine outputs

**What it does:**
- User asks questions about their collected material
- AI analyzes and synthesizes based on folder contents
- User requests specific outputs:
  - "Create a comparison table of these three approaches"
  - "What are the common themes across these articles?"
  - "Make a timeline of events mentioned in my highlights"
  - "Draft a summary focusing on cost considerations"
- AI generates artifacts as requested
- User can refine and iterate through conversation

**Creates artifacts:**
- Reports and summaries
- Comparison tables
- Trend charts and graphs
- Concept maps
- Timelines
- Any structured document the user requests

**Export options:**
- PDF (professionally formatted)
- DOCX (Word document)
- Markdown
- CSV (for data/tables)
- Export individual artifacts created during the chat

---

## Design System

### Visual Identity
**Color Palette:**
- Primary: Black, white, grey
- App chrome uses monochrome palette
- User highlights: customizable colors (yellow, blue, pink, green, etc.)

**Typography:**
- Minimalist sans-serif font options: Inter, Söhne, or Roobert
- Clear hierarchy and readability
- Font choice should communicate "clarity and organization"

### UI Principles
- Generous whitespace
- Content-first approach (highlights and material are primary)
- Clear folder hierarchy (collapsible/expandable)
- No playful illustrations or gradients
- Minimal, functional interface that recedes
- Clean, professional aesthetic for serious thinking work

### AI Studio Interface
- Chat interface with clean message bubbles
- Generated artifacts appear inline (tables, charts render directly)
- Option to expand artifacts to full-screen view
- Export button on each artifact
- Sidebar shows folder contents for reference
- Clear visual separation between conversation and artifacts

---

## Feature Completeness
Must compete with established highlighters:

✅ Web text highlighting  
✅ Image capture and annotation  
✅ YouTube timestamp highlighting  
✅ PDF annotation support  
✅ Folder/subfolder organization  
✅ Search functionality  
✅ Tags or labels (optional)  
✅ Share/collaborate on folders (optional, for teams)  

---

## Key Differentiators

### vs. Traditional Highlighters (Readwise, Glasp, Hypothesis)
- **They:** Collection and review tools
- **Us:** Creation and synthesis tool through conversational AI
- **Unlock:** AI doesn't just summarize—you direct it to create exactly what you need from your material

### vs. Generic AI Chat Tools
- **They:** No context, you paste content manually
- **Us:** AI already knows your folder contents, you focus on what to create
- **Unlock:** Your collected material is the foundation, not an afterthought

---

## Use Cases

### Professional Use Cases
1. **Consultant/Analyst**
   - Folder per client or project
   - Chat: "Compare the three strategy frameworks I highlighted"
   - AI creates comparison table

2. **Product Manager**
   - Folder per feature/competitor
   - Chat: "What are the recurring pain points in these user interviews?"
   - AI synthesizes themes

3. **Investor**
   - Folder per sector
   - Chat: "Create a revenue growth chart from the data I clipped"
   - AI generates visualization

### Personal/Everyday Use Cases
4. **Planning a major purchase (house, car, renovation)**
   - Folder for collected research
   - Chat: "Show me pros and cons of each option I saved"
   - AI creates structured comparison

5. **Learning a new skill or hobby**
   - Folder for tutorials, tips, resources
   - Chat: "Based on all these tutorials, what should I learn first?"
   - AI suggests personalized sequence

6. **Planning a trip**
   - Folder for destinations, restaurants, activities
   - Chat: "Organize these into a 3-day itinerary"
   - AI creates day-by-day plan

7. **Health research (diet, fitness, medical conditions)**
   - Folder for articles and advice
   - Chat: "What's the consensus on intermittent fasting from what I've saved?"
   - AI summarizes with conflicting viewpoints noted

8. **Making a life decision (career change, moving cities)**
   - Folder for all considerations
   - Chat: "Help me see the trade-offs clearly"
   - AI creates decision framework

9. **Creative projects (writing, art, design)**
   - Folder for inspiration and references
   - Chat: "What patterns do you see in my inspiration?"
   - AI identifies themes and connections

10. **Parenting/education decisions**
    - Folder for school options, parenting approaches
    - Chat: "Compare these three schools based on what I've saved"
    - AI creates structured comparison

### Academic Use Cases
11. **Student writing thesis or essay**
    - Folder per chapter or topic
    - Chat: "What are the main arguments across these papers?"
    - AI synthesizes literature themes

12. **Researcher**
    - Folder per research question
    - Chat: "Find contradictions in these studies"
    - AI highlights disagreements

---

## Target Audience

**Primary:** Anyone who collects material online and wants to make sense of it

**Not just for:**
- ❌ Academics only
- ❌ Researchers only
- ❌ "Power users" only

**For anyone who:**
- ✅ Saves articles but never revisits them
- ✅ Has 100+ browser tabs open
- ✅ Screenshots things they want to remember
- ✅ Takes notes but struggles to connect them
- ✅ Researches decisions (big or small)
- ✅ Wants to understand, not just collect
- ✅ Needs to organize thoughts, not tasks

**Spectrum of users:**
- Casual: Planning a vacation, researching a purchase
- Regular: Learning new skills, organizing hobbies
- Professional: Work research, client projects
- Academic: Thesis writing, literature reviews

---

## Technical Considerations

### Chat Interface
- Clean, minimal message design
- Support for rich artifacts (tables, charts) inline
- Copy/export buttons on each artifact
- Conversation history within each folder
- Quick actions: "Summarize", "Compare", "Create timeline" as shortcuts

### Artifact Rendering
- Tables render cleanly with proper formatting
- Charts use quality libraries (Chart.js, D3, or Plotly)
- Images and clips can be referenced in chat
- Everything responsive and accessible

### Chart/Graph Generation
- Support common chart types: bar, line, pie, scatter, timeline
- Professional appearance by default
- Customizable through chat ("make the bars blue", "add a legend")

### Export Quality
- PDFs must be professionally formatted
- DOCX exports should maintain formatting, fonts, spacing
- Individual artifacts exportable
- Full conversation transcript exportable (optional)

---

## Scope Boundaries
**What this is NOT:**
- ❌ Task management tool
- ❌ Calendar or scheduling app
- ❌ Project management software
- ❌ Generic productivity tool
- ❌ Note-taking app (though it organizes saved material)

**Focus:**
- ✅ Material collection from the web
- ✅ Organization of thoughts and research
- ✅ Conversational synthesis with AI
- ✅ User-directed document creation
- ✅ Clarity through AI-assisted analysis

---

## User Flow Examples

### Example 1: Professional Use
1. User researches competitor products across 15 websites
2. Highlights key features and pricing on each site
3. Opens "AI Studio" in "Competitor Research" folder
4. User: "Create a feature comparison table"
5. AI generates table showing all competitors
6. User: "Add a pricing column"
7. AI updates table
8. User exports as PDF for team meeting

### Example 2: Personal Use
1. User planning kitchen renovation
2. Highlights inspiration images, cost estimates, contractor reviews
3. Collects 30+ pieces of content over 2 weeks
4. Opens "AI Studio" in "Kitchen Reno" folder
5. User: "What's the general budget range based on what I've saved?"
6. AI synthesizes: "Based on 12 cost estimates, range is $15k-$40k, average $25k..."
7. User: "Create a pros/cons list for marble vs quartz"
8. AI generates comparison
9. User exports as PDF to discuss with partner

### Example 3: Learning Use
1. User learning to play guitar
2. Saves YouTube tutorials, chord charts, practice tips
3. Collects material from various sources
4. Opens "AI Studio" in "Guitar Learning" folder
5. User: "What do these tutorials say I should start with?"
6. AI: "Most recommend learning basic chords first, specifically C, G, D, Em..."
7. User: "Make me a 30-day practice plan"
8. AI creates structured timeline
9. User exports as Markdown to track progress

---

## Why Chat > Auto-Reports

**Chat gives control:**
- User knows what they need
- Can ask follow-up questions
- Can refine outputs iteratively
- Can explore different angles

**Auto-reports fail because:**
- Generic summaries miss the point
- User didn't ask for them
- Can't anticipate user's specific needs
- Create noise instead of clarity

**The value is in the conversation:**
- "Show me X" → gets exactly X
- "Actually, focus on Y instead" → refined output
- "Now combine these two analyses" → synthesis
- User drives, AI executes

---

## MVP Feature Priority

### Phase 1 (Essential)
- Browser extension with basic highlighting
- Web app with folder organization
- AI Studio chat interface with basic synthesis
- Simple artifact generation (text summaries, basic tables)
- Export to PDF and Markdown
- Black/white/grey UI with clean typography

### Phase 2 (Enhanced)
- YouTube timestamp support
- Image capture and storage
- Chart/graph generation
- Export to DOCX and CSV
- Advanced search
- Conversation history in folders

### Phase 3 (Advanced)
- PDF annotation
- Collaboration/sharing
- Tags and cross-folder connections
- Advanced visualization options
- Mobile app consideration
- Multi-folder queries ("compare my research across these 3 folders")

---

## Success Metrics

### User Engagement
- Number of highlights saved per user
- Frequency of AI Studio usage
- Messages per Studio session (indicates depth of use)
- Number of artifacts created
- Number of exports
- Retention: weekly active users
- Diversity of folder topics (indicates broad use)

### Quality Indicators
- Time from collection to first Studio session
- Refinement rate (follow-up messages to improve artifacts)
- Export rate (% of Studio sessions that result in exports)
- Folder organization depth (indicates serious usage)
- User testimonials about "clarity gained"

---

## Competitive Positioning

**Positioning Statement:**
"For anyone who saves things online but struggles to make sense of them, [Product Name] gives you an AI assistant that already knows your research and creates exactly what you need from it—no copy-pasting required."

**Key Messages:**
- "Your research, your questions, instant answers."
- "Stop collecting. Start understanding."
- "AI that knows what you've saved."
- "From highlights to insights, through conversation."

**Tone:**
- Accessible, not academic
- Clear, not technical
- Empowering, not overwhelming
- Professional, not corporate
- Conversational, not robotic

---

## Open Questions

1. Pricing model? (Freemium, subscription, one-time?)
2. Storage limits per user?
3. Message limits in AI Studio (per month/folder)?
4. Collaboration features priority?
5. Mobile app or responsive web only?
6. Integration with note-taking apps (Notion, Obsidian)?
7. API access for power users?
8. Public folder sharing (like Pinterest boards)?
9. Conversation export/archive?

---

## Brand/Name Considerations

**Name should convey:**
- Clarity
- Organization
- Accessibility (not intimidating)
- Intelligence without complexity
- Conversation/interaction

**Avoid:**
- Academic jargon
- Productivity/task connotations
- "AI" in the name (it's implied)
- Cutesy names
- Overly technical terms

**Vibe:**
- Approachable but serious
- Simple but powerful
- Universal but not generic
- Conversational but focused

---

## Next Steps

1. Define technical stack (web app framework, extension framework)
2. Choose AI model/API (Claude, GPT-4, etc.)
3. Design core UI mockups (folder view, AI Studio chat interface)
4. Design artifact rendering system (tables, charts inline)
5. Build MVP browser extension
6. Develop web app with basic folder functionality
7. Implement AI Studio chat with context awareness
8. Build export functionality
9. Beta testing with diverse user types (not just professionals)
10. Gather use case stories from different user segments