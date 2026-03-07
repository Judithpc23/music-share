"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getCurrentSession,
  loadAuthCatalogs,
  registerWithEmailPassword,
  signInWithEmailPassword,
} from "@/mvc/controllers/auth-controller"
import type { ProfilePrivacity } from "@/mvc/models/types"

type GenreOption = { id: string; name: string }
type SongOption = { id: string; title: string }

type RegisterStep = "step-1" | "step-2" | "step-3" | "step-4"

const stepOrder: RegisterStep[] = ["step-1", "step-2", "step-3", "step-4"]

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [registerStep, setRegisterStep] = useState<RegisterStep>("step-1")
  const [maxUnlockedStepIndex, setMaxUnlockedStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [infoMessage, setInfoMessage] = useState("")
  const [genres, setGenres] = useState<GenreOption[]>([])
  const [songs, setSongs] = useState<SongOption[]>([])

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [registerHandle, setRegisterHandle] = useState("@")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerFirstName, setRegisterFirstName] = useState("")
  const [registerLastName, setRegisterLastName] = useState("")
  const [registerPrivacity, setRegisterPrivacity] = useState<ProfilePrivacity>("public")
  const [registerBio, setRegisterBio] = useState("")
  const [registerMood, setRegisterMood] = useState("")
  const [registerImg, setRegisterImg] = useState("")
  const [registerFavoriteGenres, setRegisterFavoriteGenres] = useState<string[]>([])
  const [registerFavSong, setRegisterFavSong] = useState("")

  const passwordError =
    registerPassword.length > 0 && registerPassword.length < 8
      ? "Password must be at least 8 characters."
      : ""

  const isStepOneValid = useMemo(() => {
    const normalizedHandle = registerHandle.trim()
    return Boolean(
      registerFirstName.trim() &&
        registerLastName.trim() &&
        normalizedHandle.startsWith("@") &&
        normalizedHandle.length > 1 &&
        registerEmail.trim() &&
        registerPassword.length >= 8
    )
  }, [registerFirstName, registerLastName, registerHandle, registerEmail, registerPassword])

  const canMoveNextFromStep = (step: RegisterStep) => {
    if (step === "step-1") return isStepOneValid
    if (step === "step-2") return true
    if (step === "step-3") return registerFavoriteGenres.length > 0
    return false
  }

  useEffect(() => {
    const bootstrap = async () => {
      const { data: sessionData } = await getCurrentSession()
      if (sessionData.session) {
        router.replace("/")
        return
      }

      const { data, error } = await loadAuthCatalogs()
      if (error) {
        console.error("[auth] failed to load auth catalogs", error)
      } else {
        setGenres(data.genres as GenreOption[])
        setSongs(data.songs as SongOption[])
      }
    }

    void bootstrap()
  }, [router])

  const goNextStep = () => {
    if (!canMoveNextFromStep(registerStep)) return
    const currentIndex = stepOrder.indexOf(registerStep)
    if (currentIndex >= stepOrder.length - 1) return
    const nextIndex = currentIndex + 1
    setMaxUnlockedStepIndex((prev) => (nextIndex > prev ? nextIndex : prev))
    setRegisterStep(stepOrder[nextIndex])
  }

  const goPreviousStep = () => {
    const currentIndex = stepOrder.indexOf(registerStep)
    if (currentIndex <= 0) return
    setRegisterStep(stepOrder[currentIndex - 1])
  }

  const toggleGenre = (genreId: string) => {
    setRegisterFavoriteGenres((prev) =>
      prev.includes(genreId) ? prev.filter((value) => value !== genreId) : [...prev, genreId]
    )
  }

  const handleLogin = async () => {
    setErrorMessage("")
    setInfoMessage("")
    setIsSubmitting(true)

    const { error } = await signInWithEmailPassword(loginEmail, loginPassword)

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    router.replace("/")
  }

  const handleRegister = async () => {
    if (!isStepOneValid) {
      setErrorMessage("Please complete step 1 correctly before creating the account.")
      return
    }

    setErrorMessage("")
    setInfoMessage("")
    setIsSubmitting(true)

    const normalizedHandle = registerHandle.trim().startsWith("@")
      ? registerHandle.trim()
      : `@${registerHandle.trim()}`

    const registration = await registerWithEmailPassword({
      email: registerEmail,
      password: registerPassword,
      username: normalizedHandle,
      firstName: registerFirstName,
      lastName: registerLastName,
      bio: registerBio,
      privacity: registerPrivacity,
      mood: registerMood,
      img: registerImg || undefined,
      favoriteGenres: registerFavoriteGenres,
      favoriteSong: registerFavSong || undefined,
    })

    if (registration.error) {
      setIsSubmitting(false)
      setErrorMessage(registration.error)
      return
    }

    setIsSubmitting(false)
    setMaxUnlockedStepIndex(3)
    setRegisterStep("step-4")
    setInfoMessage(
      registration.requiresEmailVerification
        ? "Account created. Go to your email and verify your account to start."
        : "Account created. You can sign in now."
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Music className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">SoundShare</span>
          </div>
          <CardTitle>{mode === "login" ? "Sign in" : "Create account"}</CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Access with email and password."
              : "Complete the 4 registration tabs."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          {infoMessage ? <p className="text-sm text-primary">{infoMessage}</p> : null}

          {mode === "login" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="you@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="********"
                />
              </div>
              <Button className="w-full" onClick={handleLogin} disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </>
          ) : (
            <>
              <Tabs
                value={registerStep}
                onValueChange={(value) => {
                  const nextIndex = stepOrder.indexOf(value as RegisterStep)
                  if (nextIndex <= maxUnlockedStepIndex) {
                    setRegisterStep(value as RegisterStep)
                  }
                }}
              >
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="step-1">Step 1</TabsTrigger>
                  <TabsTrigger value="step-2" disabled={maxUnlockedStepIndex < 1}>Step 2</TabsTrigger>
                  <TabsTrigger value="step-3" disabled={maxUnlockedStepIndex < 2}>Step 3</TabsTrigger>
                  <TabsTrigger value="step-4" disabled={maxUnlockedStepIndex < 3}>Step 4</TabsTrigger>
                </TabsList>
              </Tabs>

              {registerStep === "step-1" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="register-first-name">Name</Label>
                      <Input
                        id="register-first-name"
                        value={registerFirstName}
                        onChange={(event) => setRegisterFirstName(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-last-name">Last Name</Label>
                      <Input
                        id="register-last-name"
                        value={registerLastName}
                        onChange={(event) => setRegisterLastName(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-handle">ID (must start with @)</Label>
                    <Input
                      id="register-handle"
                      value={registerHandle}
                      onChange={(event) => {
                        const value = event.target.value
                        setRegisterHandle(value.startsWith("@") ? value : `@${value.replace(/^@+/, "")}`)
                      }}
                      placeholder="@username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerEmail}
                      onChange={(event) => setRegisterEmail(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(event) => setRegisterPassword(event.target.value)}
                    />
                    {passwordError ? (
                      <p className="text-xs text-destructive">{passwordError}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {registerStep === "step-2" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-bio">Bio (optional)</Label>
                    <Textarea
                      id="register-bio"
                      value={registerBio}
                      onChange={(event) => setRegisterBio(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Profile privacity</Label>
                    <Select
                      value={registerPrivacity}
                      onValueChange={(value) => setRegisterPrivacity(value as ProfilePrivacity)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">public</SelectItem>
                        <SelectItem value="private">private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-mood">Mood</Label>
                    <Input
                      id="register-mood"
                      value={registerMood}
                      onChange={(event) => setRegisterMood(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-img">Image URL (optional)</Label>
                    <Input
                      id="register-img"
                      value={registerImg}
                      onChange={(event) => setRegisterImg(event.target.value)}
                    />
                  </div>
                </div>
              ) : null}

              {registerStep === "step-3" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select one or more favorite genres</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-md border p-3 max-h-48 overflow-auto">
                      {genres.map((genre) => (
                        <label key={genre.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={registerFavoriteGenres.includes(genre.id)}
                            onCheckedChange={() => toggleGenre(genre.id)}
                          />
                          <span>{genre.name}</span>
                        </label>
                      ))}
                    </div>
                    {registerFavoriteGenres.length === 0 ? (
                      <p className="text-xs text-destructive">
                        Select at least one genre to continue.
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Favorite song (optional)</Label>
                    <Select
                      value={registerFavSong || "__none"}
                      onValueChange={(value) => setRegisterFavSong(value === "__none" ? "" : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select song" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">None</SelectItem>
                        {songs.map((song) => (
                          <SelectItem key={song.id} value={song.id}>
                            {song.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}

              {registerStep === "step-4" ? (
                <div className="rounded-md border p-4 space-y-3">
                  <p className="text-sm">
                    If everything is correct, go to your email and verify your account.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    After verification, return here and sign in.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setMode("login")
                      setErrorMessage("")
                    }}
                  >
                    Go to sign in
                  </Button>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goPreviousStep}
                  disabled={registerStep === "step-1" || isSubmitting}
                >
                  Back
                </Button>

                {registerStep !== "step-4" ? (
                  <Button
                    type="button"
                    onClick={registerStep === "step-3" ? handleRegister : goNextStep}
                    disabled={isSubmitting || !canMoveNextFromStep(registerStep)}
                  >
                    {registerStep === "step-3"
                      ? isSubmitting
                        ? "Creating..."
                        : "Create account"
                      : "Next"}
                  </Button>
                ) : (
                  <Button type="button" onClick={() => setRegisterStep("step-1")}>
                    Start again
                  </Button>
                )}
              </div>
            </>
          )}

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setErrorMessage("")
              setInfoMessage("")
              setMode((prev) => {
                const nextMode = prev === "login" ? "register" : "login"
                if (nextMode === "register") {
                  setRegisterStep("step-1")
                  setMaxUnlockedStepIndex(0)
                }
                return nextMode
              })
            }}
          >
            {mode === "login" ? "No account? Register" : "Already have an account? Sign in"}
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
