import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button, Input, Card } from '@/components/ui'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import toast from 'react-hot-toast'
import AuroraField from '@/components/layout/AuroraField'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (err) {
      toast.error(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  const google = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      navigate('/')
    } catch (err) {
      toast.error(err.message.replace('Firebase: ', ''))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AuroraField />
      <Card className="w-full max-w-sm relative z-[1]" glass={false}>
        <div className="flex flex-col items-center mb-6">
          <div className="h-11 w-11 rounded-2xl bg-primary-500 flex items-center justify-center text-white mb-3">
            <Sparkles size={20} />
          </div>
          <h1 className="font-display font-semibold text-xl">Welcome back</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark">Sign in to Meridian</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full justify-center" loading={loading}>Sign in</Button>
        </form>
        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-border-light dark:bg-border-dark" />
          <span className="text-xs text-muted-light dark:text-muted-dark">or</span>
          <div className="h-px flex-1 bg-border-light dark:bg-border-dark" />
        </div>
        <Button variant="secondary" className="w-full justify-center" onClick={google}>Continue with Google</Button>
        <p className="text-sm text-center mt-5 text-muted-light dark:text-muted-dark">
          No account? <Link to="/signup" className="text-primary-500 font-medium">Sign up</Link>
        </p>
      </Card>
    </div>
  )
}
