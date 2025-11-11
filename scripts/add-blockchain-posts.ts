import "dotenv/config";
import { db, pool } from "@/src/db/client";
import { categories, authors, postGroups, posts, tags, postGroupTags } from "@/src/db/schema";
import { eq } from "drizzle-orm";

const loremTitles = [
  "Understanding Blockchain Consensus Mechanisms",
  "Smart Contract Security Best Practices",
  "The Future of Decentralized Finance",
  "Web3 Development Getting Started Guide",
  "NFT Market Trends and Analysis",
  "Layer 2 Scaling Solutions Explained",
  "Cryptocurrency Wallet Security Tips",
  "Blockchain Interoperability Challenges",
  "Tokenomics and Economic Models",
  "Decentralized Autonomous Organizations",
  "Zero-Knowledge Proofs in Practice",
  "Cross-Chain Bridge Technologies",
  "Ethereum Virtual Machine Deep Dive",
  "Blockchain Gaming Revolution",
  "Privacy Coins and Anonymous Transactions"
];

const loremDescriptions = [
  "Explore the different consensus mechanisms used in blockchain networks and their trade-offs.",
  "Learn essential security practices for developing and auditing smart contracts.",
  "Discover the latest trends and innovations shaping the decentralized finance ecosystem.",
  "A comprehensive guide to start your journey in Web3 development.",
  "Analyze current trends in the NFT marketplace and future predictions.",
  "Understand how Layer 2 solutions improve blockchain scalability and performance.",
  "Essential tips to keep your cryptocurrency wallets secure from attacks.",
  "Examining the challenges and solutions for blockchain interoperability.",
  "Deep dive into token economics and sustainable economic models.",
  "How DAOs are transforming organizational governance and decision-making.",
  "Understanding zero-knowledge proofs and their applications in blockchain.",
  "Exploring the technology behind cross-chain bridges and their security.",
  "A technical exploration of the Ethereum Virtual Machine architecture.",
  "How blockchain technology is revolutionizing the gaming industry.",
  "An overview of privacy-focused cryptocurrencies and their mechanisms."
];

const loremBodies = [
  `# Understanding Blockchain Consensus Mechanisms

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

## Proof of Work

Nullam id dolor id nibh ultricies vehicula ut id elit. Cras mattis consectetur purus sit amet fermentum. Donec ullamcorper nulla non metus auctor fringilla.

## Proof of Stake

Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vestibulum id ligula porta felis euismod semper.

## Conclusion

Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.`,

  `# Smart Contract Security Best Practices

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.

## Common Vulnerabilities

Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec sed odio dui. Etiam porta sem malesuada magna mollis euismod.

## Security Audits

Nullam quis risus eget urna mollis ornare vel eu leo. Maecenas faucibus mollis interdum. Sed posuere consectetur est at lobortis.

## Testing Strategies

Cras justo odio, dapibus ac facilisis in, egestas eget quam. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh.`,

  `# The Future of Decentralized Finance

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id elit non mi porta gravida at eget metus.

## DeFi Protocols

Vestibulum id ligula porta felis euismod semper. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.

## Yield Farming

Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.

## Future Trends

Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Cum sociis natoque penatibus et magnis dis parturient montes.`,

  `# Web3 Development Getting Started Guide

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula ut id elit.

## Tools and Frameworks

Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.

## Smart Contract Development

Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vestibulum id ligula porta felis euismod semper.

## Deployment Strategies

Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.`,

  `# NFT Market Trends and Analysis

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.

## Market Overview

Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec sed odio dui.

## Use Cases

Nullam quis risus eget urna mollis ornare vel eu leo. Maecenas faucibus mollis interdum.

## Future Predictions

Cras justo odio, dapibus ac facilisis in, egestas eget quam. Fusce dapibus, tellus ac cursus commodo.`,

  `# Layer 2 Scaling Solutions Explained

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id elit non mi porta gravida at eget metus.

## Rollups Technology

Vestibulum id ligula porta felis euismod semper. Morbi leo risus, porta ac consectetur ac.

## State Channels

Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue.

## Performance Benefits

Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.`,

  `# Cryptocurrency Wallet Security Tips

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula.

## Types of Wallets

Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.

## Best Practices

Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vestibulum id ligula porta.

## Recovery Procedures

Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.`,

  `# Blockchain Interoperability Challenges

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus.

## Technical Challenges

Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.

## Bridge Protocols

Nullam quis risus eget urna mollis ornare vel eu leo. Maecenas faucibus mollis interdum.

## Future Solutions

Cras justo odio, dapibus ac facilisis in, egestas eget quam. Fusce dapibus, tellus ac cursus.`,

  `# Tokenomics and Economic Models

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id elit non mi porta gravida.

## Supply Mechanisms

Vestibulum id ligula porta felis euismod semper. Morbi leo risus, porta ac consectetur ac.

## Value Accrual

Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus.

## Sustainability

Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.`,

  `# Decentralized Autonomous Organizations

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies.

## Governance Models

Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed.

## Voting Mechanisms

Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vestibulum id ligula.

## Real-World Examples

Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio.`,

  `# Zero-Knowledge Proofs in Practice

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.

## ZK-SNARKs

Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.

## ZK-STARKs

Nullam quis risus eget urna mollis ornare vel eu leo. Maecenas faucibus mollis.

## Applications

Cras justo odio, dapibus ac facilisis in, egestas eget quam. Fusce dapibus.`,

  `# Cross-Chain Bridge Technologies

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id elit non mi porta.

## Bridge Architecture

Vestibulum id ligula porta felis euismod semper. Morbi leo risus, porta ac.

## Security Considerations

Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis.

## Popular Bridges

Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis.`,

  `# Ethereum Virtual Machine Deep Dive

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh.

## EVM Architecture

Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla.

## Gas Optimization

Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vestibulum.

## Advanced Concepts

Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia.`,

  `# Blockchain Gaming Revolution

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat.

## Play-to-Earn Models

Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus.

## In-Game Assets

Nullam quis risus eget urna mollis ornare vel eu leo. Maecenas faucibus.

## Future of Gaming

Cras justo odio, dapibus ac facilisis in, egestas eget quam. Fusce.`,

  `# Privacy Coins and Anonymous Transactions

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id elit.

## Privacy Technologies

Vestibulum id ligula porta felis euismod semper. Morbi leo risus.

## Regulatory Landscape

Praesent commodo cursus magna, vel scelerisque nisl consectetur et.

## Use Cases

Aenean eu leo quam. Pellentesque ornare sem lacinia quam.`
];

async function main() {
  // Get blockchain-web3 category
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, "blockchain-web3"))
    .limit(1);

  if (!category) {
    console.error("Category 'blockchain-web3' not found. Please create it first.");
    process.exit(1);
  }

  // Get or create an author
  const [author] = await db
    .select({ id: authors.id })
    .from(authors)
    .where(eq(authors.slug, "staff"))
    .limit(1);

  if (!author) {
    console.error("Author 'staff' not found. Please run seed first.");
    process.exit(1);
  }

  // Get or create tags
  const tagSlugs = ["blockchain", "web3", "cryptocurrency", "defi", "nft"];
  const tagIds: number[] = [];

  for (const slug of tagSlugs) {
    const [existing] = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (existing) {
      tagIds.push(existing.id);
    } else {
      const [newTag] = await db
        .insert(tags)
        .values({ slug, name: slug.toUpperCase() })
        .returning({ id: tags.id });
      tagIds.push(newTag.id);
    }
  }

  console.log(`Creating 15 posts in blockchain-web3 category...`);

  for (let i = 0; i < 15; i++) {
    const slug = `blockchain-post-${i + 1}-${Date.now()}`;
    
    // Create post group
    const [group] = await db
      .insert(postGroups)
      .values({
        slug,
        categoryId: category.id,
        authorId: author.id,
        coverUrl: `/blog/posts/blockchain-${i + 1}.jpg`,
      })
      .returning({ id: postGroups.id });

    // Add random tags (2-3 tags per post)
    const numTags = Math.floor(Math.random() * 2) + 2;
    const selectedTags = tagIds.sort(() => 0.5 - Math.random()).slice(0, numTags);
    
    for (const tagId of selectedTags) {
      await db
        .insert(postGroupTags)
        .values({ groupId: group.id, tagId })
        .onConflictDoNothing();
    }

    const readMinutes = Math.floor(Math.random() * 10) + 5; // 5-15 minutes
    const daysAgo = Math.floor(Math.random() * 60); // Random date within last 60 days
    const publishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Create posts in both locales
    await db.insert(posts).values([
      {
        groupId: group.id,
        locale: "en",
        title: loremTitles[i],
        description: loremDescriptions[i],
        bodyMd: loremBodies[i],
        readMinutes,
        draft: false,
        publishedAt,
      },
      {
        groupId: group.id,
        locale: "es",
        title: `${loremTitles[i]} (ES)`,
        description: `${loremDescriptions[i]} (Versión en español)`,
        bodyMd: loremBodies[i].replace(/Lorem ipsum/g, "Lorem ipsum (ES)"),
        readMinutes,
        draft: false,
        publishedAt,
      },
    ]);

    console.log(`✓ Created post ${i + 1}/15: ${loremTitles[i]}`);
  }

  console.log("\n✅ Successfully created 15 posts in blockchain-web3 category!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
