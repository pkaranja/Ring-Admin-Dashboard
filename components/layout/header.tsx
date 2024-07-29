import ThemeToggle from "@/components/layout/ThemeToggle/theme-toggle";
import { cn } from "@/lib/utils";
import  MobileSidebar  from "./mobile-sidebar";
import { UserNav } from "./user-nav";
import { BranchNav } from "./branch-nav";
import Logo from "./logo";
import CurrencyConverter from "@/components/layout/currency-converter";

export default function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur z-20">
      <nav className="h-14 flex items-center justify-between px-4">
        <div className="hidden lg:block">
          <div className="relative w-full max-w-[80px]">
            <Logo/>
          </div>
        </div>
        <div className={cn("block lg:!hidden")}>
          <MobileSidebar/>
        </div>
        <div className="flex items-center gap-2">
          {/*<CurrencyConverter/>*/}
        </div>
        <div className="flex items-center gap-2">
          <BranchNav/>
          <UserNav/>
          <ThemeToggle/>
        </div>
      </nav>
    </div>
);
}
