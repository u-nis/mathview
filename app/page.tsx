import MathEditor from '../components/MathEditor'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-white ">
      <h1 className="text-3xl text-center mb-8 text-black" style={{ fontFamily: "Chicago" }}>
        Math Editor
      </h1>
      <MathEditor />
    </main>
  )
}
