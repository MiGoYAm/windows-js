import App from "@/components/App";

export default function Home() {
  return (
    <main className="h-screen max-w-screen overflow-clip">
      <App name="teset">
        <div className="size-64"></div>
      </App>
      <App name="Notepad">
        <textarea className="size-full resize-none outline-none border-0 font-mono"></textarea>
      </App>
    </main>
  );
}
