import { TranscriptUploader } from '@/components/upload/TranscriptUploader'
import { ProgressTracker } from '@/components/shared/ProgressTracker'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            ClearComms
          </h1>
          <p className="mt-2 text-neutral-500">
            Upload a meeting transcript. See exactly where your clarity broke — and how to fix it.
          </p>
        </div>

        <TranscriptUploader />
        <ProgressTracker />
      </div>
    </main>
  )
}
