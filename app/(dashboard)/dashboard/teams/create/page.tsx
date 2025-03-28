import { CreateTeamForm } from "../components/create-team-form"

export default async function NewTeamPage() {
  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-8">Create a New Team</h1>
      <CreateTeamForm />
    </div>
  )
}
