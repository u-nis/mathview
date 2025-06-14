import MathEditor from '../components/MathEditor'

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header at top */}
      <div className="p-8 pb-4">
        <h1 className="text-3xl text-center text-black" style={{ fontFamily: "SF Pro Text" }}>
          Math Editor
        </h1>
      </div>
      
      {/* Centered MathEditor with space above and below */}
      <div className="flex-1 flex items-center justify-center">
        <MathEditor />
      </div>
    </main>
  )
}
