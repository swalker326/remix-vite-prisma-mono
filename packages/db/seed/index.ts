import { prisma } from "~/index";
import sampleWords from "./sampleWords";

async function seed() {
	console.time("🔑 Created permissions...");
	const entities = ["user", "sign", "video"];
	const actions = ["create", "read", "update", "delete"];
	const accesses = ["own", "any"] as const;
	for (const entity of entities) {
		for (const action of actions) {
			for (const access of accesses) {
				await prisma.permission.create({ data: { entity, action, access } });
			}
		}
	}
	console.timeEnd("🔑 Created permissions...");
	console.time("👑 Created roles...");
	await prisma.role.create({
		data: {
			name: "admin",
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: { access: "any" },
				}),
			},
		},
	});
	await prisma.role.create({
		data: {
			name: "user",
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: { access: "own" },
				}),
			},
		},
	});
	console.timeEnd("👑 Created roles...");
	// Create sample roles
	console.time("Adding sample words...");
	for (const {term, definition, example} of sampleWords) {
		await prisma.sign.create({
			data: {
				term: term,
				definition: definition,
				example: example,
			},
		});
	}
	console.timeEnd("Adding sample words...");
}

seed()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
