import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('Please add MONGODB_URI to .env.local');
const DB_NAME = process.env.MONGODB_DB || 'neetcode_tracker';
const API_BASE = 'https://alfa-leetcode-api.onrender.com';

// Longer delay to avoid rate limiting
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

    // Add problem description
    if (question.content) {
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
            .replace(/<[^>]*>/g, '')
            .replace(/\n\n\n+/g, '\n\n')
            .trim();

        markdown += content + '\n\n';
    }

    if (question.exampleTestcases) {
        markdown += `## Examples\n\n`;
        const examples = question.exampleTestcases.split('\n');
        examples.forEach((example: string, index: number) => {
            if (example.trim()) {
                markdown += `### Example ${index + 1}:\n\`\`\`\n${example}\n\`\`\`\n\n`;
            }
        });
    }

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
    try {
        const url = `${API_BASE}/select?titleSlug=${titleSlug}`;
        const response = await fetch(url);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (!data || !data.question) {
            return null;
        }

        return formatProblemDescription(data);
    } catch (error) {
        return null;
    }
}

async function retryFailedDescriptions() {
    console.log('🔄 Retrying failed problem descriptions...\n');
    console.log('⏰ Using 3-second delay between requests to avoid rate limits\n');

    const client = new MongoClient(MONGODB_URI as string);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db(DB_NAME);

        // Get problems that still have template descriptions
        const problems = await db.collection('problems')
            .find({
                description: { $regex: /^\# .+\n\n\#\# Problem Statement\n\n\[Add problem description here\]/ }
            })
            .sort({ order: 1 })
            .toArray();

        console.log(`📝 Found ${problems.length} problems with placeholder descriptions\n`);

        if (problems.length === 0) {
            console.log('✨ All problems already have descriptions!');
            return;
        }

        let updated = 0;
        let failed = 0;

        for (let i = 0; i < problems.length; i++) {
            const problem = problems[i];
            console.log(`[${i + 1}/${problems.length}] ${problem.title}`);

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
                console.log(`  ✅ Updated`);
                updated++;
            } else {
                console.log(`  ❌ Failed`);
                failed++;
            }

            // Wait 3 seconds between requests
            if (i < problems.length - 1) {
                await delay(3000);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Retry Summary:');
        console.log(`   ✅ Updated: ${updated}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📝 Total attempted: ${problems.length}`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

retryFailedDescriptions();
