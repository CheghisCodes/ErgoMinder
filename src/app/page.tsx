import AIPostureAnalysis from "@/components/AIPostureAnalysis";
import DeskStretches from "@/components/DeskStretches";
import Header from "@/components/Header";
import PostureTips from "@/components/PostureTips";
import ReminderManager from "@/components/ReminderManager";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
          <div className="lg:col-span-2 xl:col-span-3 space-y-8">
            <AIPostureAnalysis />
            <ReminderManager />
          </div>
          <div className="lg:col-span-1 xl:col-span-1 space-y-8">
            <DeskStretches />
            <PostureTips />
          </div>
        </div>
      </main>
    </div>
  );
}
