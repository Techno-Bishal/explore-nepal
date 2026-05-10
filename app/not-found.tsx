import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mountain, Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Mountain className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-7xl font-bold font-display text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Trail Not Found</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            The path you&apos;re looking for seems to have disappeared into the Himalayan mist. Let&apos;s get you back on track.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/destinations">
              <Search className="h-4 w-4" />
              Explore Destinations
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
