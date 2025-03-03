import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';
import { hashPassword } from '@/lib/auth/session';

async function seed() {
  const emailAdmin = 'admin@test.com';
  const passwordAdmin = 'admin123';
  const emailMember = 'member@test.com';
  const passwordMember = 'member123';
  const passwordAdminHash = await hashPassword(passwordAdmin);
  const passwordmemberHash = await hashPassword(passwordMember);

  const insertedUsers = await db
    .insert(users)
    .values([
      {
        email: emailAdmin,
        passwordHash: passwordAdminHash,
        role: "admin",
      },
      {
        email: emailMember,
        passwordHash: passwordmemberHash,
        role: "member",
      },
    ])
    .returning({ id: users.id });

  const [userAdmin, userMember] = insertedUsers || [];

  console.log('Initial users created:', userAdmin?.id, userMember?.id);

  const [team] = await db
    .insert(teams)
    .values({
      name: 'Test Team',
    })
    .returning({ id: teams.id });

  if (!team) throw new Error("Team creation failed!");

  await db.insert(teamMembers).values([
    {
      teamId: team.id,
      userId: userAdmin?.id,
      role: 'admin',
    },
    {
      teamId: team.id,
      userId: userMember?.id,
      role: 'member',
    }
  ]);
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
