"use client"

import Link from "next/link"
import { useActionState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { signUp } from "../actions"
import { ActionState } from "@/lib/auth/middleware"

export default function Signup() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const priceId = searchParams.get("priceId")
  const inviteId = searchParams.get("inviteId")
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signUp,
    { error: "" }
  )

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/">
            <Image
              src="/logo-produksi.png"
              alt="Logo"
              style={{ marginLeft: "-18px" }}
              width={200}
              height={40}
            />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" action={formAction}>
          <input type="hidden" name="redirect" value={redirect || ""} />
          <input type="hidden" name="priceId" value={priceId || ""} />
          <input type="hidden" name="inviteId" value={inviteId || ""} />

          <div>
            <Label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-700"
              required
            >
              Your Name
            </Label>
            <div className="mt-1">
              <Input
                id="name"
                name="name"
                type="text"
                required
                minLength={3}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Enter your Name"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
              required
            >
              Phone
            </Label>
            <div className="mt-1">
              <Input
                id="phone"
                name="phone"
                type="number"
                required
                minLength={6}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-700"
              required
            >
              Company / Business Name
            </Label>
            <div className="mt-1">
              <Input
                id="companyName"
                name="companyName"
                type="text"
                required
                minLength={3}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Business Name"
              />
            </div>
          </div>
          <div>
            <Label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-700"
            >
              Business industry
            </Label>
            <div className="mt-1">
              <Input
                id="companyCategory"
                name="companyCategory"
                type="text"
                minLength={3}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Transportation / Manufacture / FMCG / etc."
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
              required
            >
              Email
            </Label>
            <div className="mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                // defaultValue={state.email}
                required
                maxLength={50}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email (using for login)"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
              required
            >
              Password
            </Label>
            <div className="mt-1">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                // defaultValue={state.password}
                required
                minLength={8}
                maxLength={100}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {state?.error && (
            <div className="text-red-500 text-sm">{state.error}</div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-400 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Loading...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={`/sign-in${redirect ? `?redirect=${redirect}` : ""}${
                priceId ? `&priceId=${priceId}` : ""
              }`}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Sign in to existing account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
