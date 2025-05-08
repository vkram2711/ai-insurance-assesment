import UploadForm from '@/components/forms/UploadForm'

export default function HomePage() {
  return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-4">PDF Upload and Parse</h1>
        <UploadForm />
      </main>
  )
}
