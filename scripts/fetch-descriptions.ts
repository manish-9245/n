import 'dotenv/config';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('Please add MONGODB_URI to .env.local');
const DB_NAME = process.env.MONGODB_DB || 'neetcode_tracker';
const API_BASE = 'https://alfa-leetcode-api.onrender.com';

// Delay between requests to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function formatProblemDescription(data: any): string {
    const { question } = data;

    let markdown = `# ${question.title}\n\n`;

    // Add difficulty and topics
    markdown += `**Difficulty:** ${question.difficulty}\n\n`;

    if (question.topicTags && question.topicTags.length > 0) {
        const topics = question.topicTags.map((tag: any) => tag.name).join(', ');
        markdown += `**Topics:** ${topics}\n\n`;
    }

    markdown += `---\n\n`;

    // Add problem description (HTML to markdown conversion)
    if (question.content) {
        // Simple HTML to markdown conversion
        let content = question.content
            .replace(/<p>/g, '\n')
            .replace(/<\/p>/g, '\n')
            .replace(/<strong>/g, '**')
            .replace(/<\/strong>/g, '**')
            .replace(/<em>/g, '*')
            .replace(/<\/em>/g, '*')
            .replace(/<code>/g, '`')
            .replace(/<\/code>/g, '`')
            .replace(/<pre>/g, '\n```\n')
            .replace(/<\/pre>/g, '\n```\n')
            .replace(/<ul>/g, '\n')
            .replace(/<\/ul>/g, '\n')
            .replace(/<li>/g, '- ')
            .replace(/<\/li>/g, '\n')
            .replace(/<ol>/g, '\n')
            .replace(/<\/ol>/g, '\n')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
            .replace(/\n\n\n+/g, '\n\n') // Remove excessive newlines
            .trim();

        markdown += content + '\n\n';
    }

    // Add examples
    if (question.exampleTestcases) {
        markdown += `## Examples\n\n`;
        const examples = question.exampleTestcases.split('\n');
        examples.forEach((example: string, index: number) => {
            if (example.trim()) {
                markdown += `### Example ${index + 1}:\n\`\`\`\n${example}\n\`\`\`\n\n`;
            }
        });
    }

    // Add constraints
    if (question.constraints) {
        markdown += `## Constraints\n\n`;
        let constraints = question.constraints
            .replace(/<li>/g, '- ')
            .replace(/<\/li>/g, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
        markdown += constraints + '\n\n';
    }

    // Add hints if available
    if (question.hints && question.hints.length > 0) {
        markdown += `## Hints\n\n`;
        question.hints.forEach((hint: string, index: number) => {
            markdown += `${index + 1}. ${hint}\n`;
        });
        markdown += '\n';
    }

    return markdown;
}

async function fetchProblemDescription(titleSlug: string): Promise<string | null> {
    let retries = 5;
    let backoff = 5000; // Start with 5s wait on 429

    for (let i = 0; i < retries; i++) {
        try {
            const url = `${API_BASE}/select?titleSlug=${titleSlug}`;
            console.log(`  Fetching: ${titleSlug} (Attempt ${i + 1}/${retries})...`);

            const response = await fetch(url);

            if (response.status === 429) {
                console.warn(`  ⚠️  Rate limit (429). Cooling down for ${backoff / 1000}s...`);
                await delay(backoff);
                backoff *= 1.5; // exponentially increase backoff
                continue;
            }

            if (!response.ok) {
                console.error(`  ❌ Failed to fetch ${titleSlug}: ${response.status}`);
                return null;
            }

            const data = await response.json();

            if (!data || !data.question) {
                console.error(`  ❌ No data for ${titleSlug}`);
                return null;
            }

            return formatProblemDescription(data);
        } catch (error) {
            console.error(`  ❌ Error fetching ${titleSlug}:`, error);
            // Don't retry on generic network errors unless we want to, but keep it simple for now
            return null;
        }
    }
    console.error(`  ❌ Failed to fetch ${titleSlug} after ${retries} attempts`);
    return null;
}

async function updateAllDescriptions() {
    console.log('🚀 Starting to fetch all problem descriptions from alfa-leetcode-api...\n');

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db(DB_NAME);

        // Get all problems
        const problems = await db.collection('problems')
            .find({})
            .sort({ order: 1 })
            .toArray();

        console.log(`📝 Found ${problems.length} problems to update\n`);

        let updated = 0;
        let failed = 0;

        for (let i = 0; i < problems.length; i++) {
            const problem = problems[i];
            console.log(`\n[${i + 1}/${problems.length}] Processing: ${problem.title}`);

            const description = await fetchProblemDescription(problem.problemId);

            if (description) {
                await db.collection('problems').updateOne(
                    { _id: problem._id },
                    {
                        $set: {
                            description,
                            updatedAt: new Date()
                        }
                    }
                );
                console.log(`  ✅ Updated successfully`);
                updated++;
            } else {
                console.log(`  ⏭️  Skipped (fetch failed)`);
                failed++;
            }

            // Rate limiting: wait 1 second between requests
            if (i < problems.length - 1) {
                console.log(`  ⏳ Waiting 3s before next request...`);
                await delay(3000);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Update Summary:');
        console.log(`   ✅ Successfully updated: ${updated}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📝 Total: ${problems.length}`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

// Run the script
updateAllDescriptions();
