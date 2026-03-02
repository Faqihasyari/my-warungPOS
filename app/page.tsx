"use client"

import { signIn } from "next-auth/react"
import { useState, FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")

const router = useRouter()

async function handleLogin(e: FormEvent<HTMLFormElement>) {
  e.preventDefault()

  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  })

  if (!result?.ok) {
    alert("Login gagal")
    return
  }

  // ambil session setelah login
  const sessionRes = await fetch("/api/auth/session")
  const session = await sessionRes.json()

  if (session?.user?.role === "OWNER") {
    router.push("/dashboard")
  } else if (session?.user?.role === "CASHIER") {
    router.push("/pos")
  } else {
    router.push("/")
  }
}
  

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
   <Card className="w-full max-w-sm ">
      <CardHeader>
        <CardTitle>Masuk ke akun anda</CardTitle>
        <CardDescription>
            Masukkan email dan password untuk masuk ke akun anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan Email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2 mb-6">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" placeholder="Masukkan Password" type="password" required value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="w-full">
          Masuk ke akun
        </Button>
        </form>
      </CardContent>
    </Card>
    </div>
    
    
  )
}
