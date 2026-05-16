import Header from "./components/header" // Adjust path if needed
import { WordForm } from "./components/word-form"

export default function AddWordsPage() {
  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <WordForm />
      </div>
    </>
  )
}